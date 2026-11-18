"""DataSense AI - Dataset Templates Router.

Provides endpoints for exploring domain-specific dataset templates, streaming
realistic synthetic CSV downloads, and instantiating template datasets for immediate profiling.
"""

from __future__ import annotations

from datetime import datetime
import io
import json
import logging
import os
from typing import Any, Dict, List, Optional
import uuid
import aiofiles
from fastapi import APIRouter, HTTPException, Query, status
from fastapi.responses import StreamingResponse
from pydantic import BaseModel, Field
from routers.upload import UPLOADS_DIR, get_meta_path
from services import template_service

logger = logging.getLogger("datasense.templates_router")

router = APIRouter()


class LoadTemplateRequest(BaseModel):
    rows: int = Field(default=500, ge=10, le=5000, description="Number of sample rows to generate")


@router.get("/templates")
async def list_templates():
    """Retrieve full catalog of pre-built domain dataset templates with metadata."""
    try:
        templates = template_service.get_template_info()
        return {"templates": templates, "total_templates": len(templates)}
    except Exception as exc:
        logger.error("Failed to list dataset templates: %s", exc)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error listing templates: {str(exc)}",
        )


@router.get("/templates/{template_name}")
async def get_template_details(template_name: str):
    """Retrieve comprehensive metadata, schema, and sample observations for a template."""
    t_key = str(template_name).lower().strip()
    if t_key not in template_service.TEMPLATES:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Template '{template_name}' not found. Available templates: {list(template_service.TEMPLATES.keys())}",
        )

    info = template_service.TEMPLATES[t_key]
    # Generate 5 sample rows for preview
    df_sample = template_service.generate_template_data(t_key, rows=5)
    records = df_sample.to_dict(orient="records")

    return {
        "template": info,
        "sample_rows": records,
        "schema": {str(col): str(dtype) for col, dtype in df_sample.dtypes.items()},
    }


@router.get("/templates/{template_name}/download")
async def download_template_csv(
    template_name: str,
    rows: int = Query(default=500, ge=10, le=5000, description="Number of rows to generate"),
):
    """Generate realistic CSV dataset for template and stream directly as file download."""
    t_key = str(template_name).lower().strip()
    if t_key not in template_service.TEMPLATES:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Template '{template_name}' not found.",
        )

    try:
        df = template_service.generate_template_data(t_key, rows=rows)
        csv_buffer = io.StringIO()
        df.to_csv(csv_buffer, index=False)
        csv_bytes = csv_buffer.getvalue().encode("utf-8")

        return StreamingResponse(
            io.BytesIO(csv_bytes),
            media_type="text/csv",
            headers={
                "Content-Disposition": f'attachment; filename="{t_key}_template.csv"',
                "Content-Length": str(len(csv_bytes)),
            },
        )
    except Exception as exc:
        logger.error("Error streaming template CSV download: %s", exc, exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to generate template CSV: {str(exc)}",
        )


@router.post("/templates/{template_name}/load", status_code=status.HTTP_201_CREATED)
async def load_template_dataset(
    template_name: str,
    payload: Optional[LoadTemplateRequest] = None,
):
    """Generate template dataset, persist into uploads storage, and return active dataset ID."""
    t_key = str(template_name).lower().strip()
    if t_key not in template_service.TEMPLATES:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Template '{template_name}' not found.",
        )

    row_count = payload.rows if payload else 500
    try:
        df = template_service.generate_template_data(t_key, rows=row_count)
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to synthesize template data: {str(exc)}",
        )

    dataset_id = str(uuid.uuid4())
    saved_filename = f"{dataset_id}.csv"
    dest_path = os.path.join(UPLOADS_DIR, saved_filename)
    os.makedirs(UPLOADS_DIR, exist_ok=True)

    try:
        df.to_csv(dest_path, index=False)
        file_size = os.path.getsize(dest_path)
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to save template dataset to storage: {str(exc)}",
        )

    meta_data = {
        "dataset_id": dataset_id,
        "filename": saved_filename,
        "original_name": f"{t_key}_template.csv",
        "num_rows": int(len(df)),
        "num_cols": int(len(df.columns)),
        "columns": [str(c) for c in df.columns],
        "file_type": "csv",
        "file_size_bytes": file_size,
        "uploaded_at": datetime.utcnow().isoformat() + "Z",
    }

    try:
        async with aiofiles.open(get_meta_path(dataset_id), "w", encoding="utf-8") as meta_file:
            await meta_file.write(json.dumps(meta_data, indent=2))
    except Exception as exc:
        logger.warning("Could not persist template metadata: %s", exc)

    return {
        **meta_data,
        "message": f"Template '{template_name}' successfully instantiated with {len(df)} rows.",
    }
