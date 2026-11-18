"""DataSense AI - Data Cleaning Router.

Provides endpoints for auditing dataset hygiene, executing automated cleaning passes,
saving remediated datasets, and previewing row-level issue highlights.
"""

from __future__ import annotations

from datetime import datetime
import json
import logging
import os
from typing import Any, Dict, List, Optional
import uuid
import aiofiles
from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel, Field
from routers.upload import UPLOADS_DIR, get_dataset_path, get_meta_path
from services import cleaner_service, data_processor

logger = logging.getLogger("datasense.cleaner_router")

router = APIRouter()


class ScanRequest(BaseModel):
    dataset_id: str = Field(..., description="Unique UUID identifier of the dataset")


class FixOptions(BaseModel):
    fix_missing: bool = Field(default=True, description="Impute or drop missing data")
    missing_strategy: str = Field(default="mean", description="Imputation strategy: 'mean', 'median', 'mode', 'drop_rows', 'forward_fill'")
    fix_duplicates: bool = Field(default=True, description="Remove identical duplicate records")
    fix_whitespace: bool = Field(default=True, description="Trim leading/trailing whitespace")
    fix_types: bool = Field(default=True, description="Standardize numeric strings and date formats")


class FixRequest(BaseModel):
    dataset_id: str = Field(..., description="Unique UUID identifier of dataset to remediate")
    options: Optional[FixOptions] = Field(default_factory=FixOptions)


class FixResponse(BaseModel):
    new_dataset_id: str
    cleaning_report: Dict[str, Any]
    quality_score_before: int
    quality_score_after: int
    download_url: str
    filename: str
    original_name: str


def _resolve_and_load(dataset_id: str):
    """Load DataFrame from dataset ID or raise structured HTTPException."""
    path = get_dataset_path(dataset_id)
    if not path or not os.path.exists(path):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Dataset with ID '{dataset_id}' not found.",
        )
    try:
        return data_processor.load_dataset(path)
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=f"Failed to load dataset: {str(exc)}",
        )


@router.post("/clean/scan")
async def scan_dataset_issues(payload: ScanRequest):
    """Scan dataset for all data quality issues, returning diagnostic issue metrics."""
    df = _resolve_and_load(payload.dataset_id)
    try:
        issues = cleaner_service.scan_issues(df)
        return {
            "dataset_id": payload.dataset_id,
            "total_issues": issues.get("total_issues", 0),
            "quality_score_before": issues.get("quality_score_before", 100),
            "quality_score_after_estimate": issues.get("quality_score_after_estimate", 100),
            "issues": issues,
        }
    except Exception as exc:
        logger.error("Data quality scanning failed: %s", exc, exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error analyzing dataset quality: {str(exc)}",
        )


@router.post("/clean/fix", response_model=FixResponse)
async def fix_dataset_issues(payload: FixRequest):
    """Apply data remediation passes and save the cleaned dataset as an independent resource."""
    df = _resolve_and_load(payload.dataset_id)

    # Initial scan before remediation
    scan_before = cleaner_service.scan_issues(df)
    score_before = scan_before.get("quality_score_before", 80)

    # Apply remediation
    options_dict = payload.options.model_dump() if payload.options else {}
    try:
        clean_df, report = cleaner_service.fix_all(df, options_dict)
    except Exception as exc:
        logger.error("Cleaning execution failed: %s", exc, exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error executing data remediation: {str(exc)}",
        )

    # Post-remediation quality scan
    scan_after = cleaner_service.scan_issues(clean_df)
    score_after = scan_after.get("quality_score_before", 100)

    # Retrieve original metadata if available
    orig_name = "dataset"
    meta_path = get_meta_path(payload.dataset_id)
    if os.path.exists(meta_path):
        try:
            with open(meta_path, "r", encoding="utf-8") as f:
                orig_meta = json.load(f)
                orig_name = orig_meta.get("original_name", "dataset")
        except Exception:
            pass

    clean_name = f"cleaned_{orig_name}" if not orig_name.startswith("cleaned_") else orig_name
    new_dataset_id = str(uuid.uuid4())
    saved_filename = f"{new_dataset_id}.csv"
    dest_path = os.path.join(UPLOADS_DIR, saved_filename)

    # Persist cleaned CSV
    try:
        clean_df.to_csv(dest_path, index=False)
        file_size = os.path.getsize(dest_path)
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to persist cleaned dataset: {str(exc)}",
        )

    # Persist metadata JSON
    meta_data = {
        "dataset_id": new_dataset_id,
        "filename": saved_filename,
        "original_name": clean_name,
        "num_rows": int(len(clean_df)),
        "num_cols": int(len(clean_df.columns)),
        "columns": [str(c) for c in clean_df.columns],
        "file_type": "csv",
        "file_size_bytes": file_size,
        "uploaded_at": datetime.utcnow().isoformat() + "Z",
    }
    try:
        async with aiofiles.open(get_meta_path(new_dataset_id), "w", encoding="utf-8") as meta_file:
            await meta_file.write(json.dumps(meta_data, indent=2))
    except Exception as exc:
        logger.warning("Could not persist cleaned dataset metadata: %s", exc)

    return FixResponse(
        new_dataset_id=new_dataset_id,
        cleaning_report=report,
        quality_score_before=score_before,
        quality_score_after=score_after,
        download_url=f"/uploads/{saved_filename}",
        filename=saved_filename,
        original_name=clean_name,
    )


@router.get("/clean/{dataset_id}/preview")
async def preview_cleaning_issues(dataset_id: str):
    """Retrieve top 20 rows of dataset with cell-level coordinate highlights for issues."""
    df = _resolve_and_load(dataset_id)
    preview_slice = df.head(20).copy()

    # Identify highlights in preview slice
    missing_cells = []
    whitespace_cells = []

    for r_idx, (_, row) in enumerate(preview_slice.iterrows()):
        for col in df.columns:
            val = row[col]
            if val is None or (isinstance(val, float) and (pd.isna(val) or val != val)):
                missing_cells.append({"row": r_idx, "column": str(col)})
            elif isinstance(val, str) and (val != val.strip() or "  " in val):
                whitespace_cells.append({"row": r_idx, "column": str(col)})

    dup_slice_indices = [
        int(i) for i, is_dup in enumerate(preview_slice.duplicated().tolist()) if is_dup
    ]

    # Convert preview records to JSON-friendly primitives
    records = []
    for _, row in preview_slice.iterrows():
        row_dict = {}
        for col in df.columns:
            row_dict[str(col)] = data_processor._sanitize_val(row[col])
        records.append(row_dict)

    return {
        "dataset_id": dataset_id,
        "total_rows": int(len(df)),
        "preview_count": len(records),
        "columns": [str(c) for c in df.columns],
        "rows": records,
        "highlight_issues": {
            "missing_cells": missing_cells,
            "duplicate_rows": dup_slice_indices,
            "whitespace_cells": whitespace_cells,
        },
    }
