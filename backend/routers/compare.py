"""DataSense AI - Dataset Comparison Router.

Provides automated comparative analysis between two datasets: dimensional delta audits,
schema overlaps, distribution shifts on shared features, visual benchmarking,
and Gemini-powered executive quality determination.
"""

from __future__ import annotations

import json
import logging
import os
from typing import Any, Dict, List, Optional
import numpy as np
import pandas as pd
from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel, Field
from routers.upload import get_dataset_path, get_meta_path
from services import ai_service, data_processor

logger = logging.getLogger("datasense.compare_router")

router = APIRouter()


class CompareRequest(BaseModel):
    dataset_id_a: str = Field(..., description="UUID identifier of dataset A")
    dataset_id_b: str = Field(..., description="UUID identifier of dataset B")
    language: Optional[str] = Field(default="en", description="Output language: 'en' or 'hi'/'hinglish'")


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


def _get_dataset_name(dataset_id: str) -> str:
    """Retrieve user-friendly original name for dataset from metadata if present."""
    meta_path = get_meta_path(dataset_id)
    if os.path.exists(meta_path):
        try:
            with open(meta_path, "r", encoding="utf-8") as f:
                meta = json.load(f)
                return meta.get("original_name", dataset_id[:8])
        except Exception:
            pass
    return f"Dataset-{dataset_id[:8]}"


@router.post("/compare")
async def compare_datasets_endpoint(payload: CompareRequest):
    """Run comprehensive comparative evaluation between two uploaded datasets."""
    if payload.dataset_id_a == payload.dataset_id_b:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot compare a dataset with itself. Please select two distinct datasets.",
        )

    df_a = _resolve_and_load(payload.dataset_id_a)
    df_b = _resolve_and_load(payload.dataset_id_b)

    name_a = _get_dataset_name(payload.dataset_id_a)
    name_b = _get_dataset_name(payload.dataset_id_b)

    stats_a = data_processor.get_basic_stats(df_a)
    stats_b = data_processor.get_basic_stats(df_b)

    # 1. Overview Table
    overview_table = [
        {
            "metric": "Total Records (Rows)",
            "dataset_a": stats_a.get("num_rows", 0),
            "dataset_b": stats_b.get("num_rows", 0),
            "difference": stats_a.get("num_rows", 0) - stats_b.get("num_rows", 0),
        },
        {
            "metric": "Total Features (Columns)",
            "dataset_a": stats_a.get("num_cols", 0),
            "dataset_b": stats_b.get("num_cols", 0),
            "difference": stats_a.get("num_cols", 0) - stats_b.get("num_cols", 0),
        },
        {
            "metric": "Numeric Columns",
            "dataset_a": stats_a.get("num_numeric_cols", 0),
            "dataset_b": stats_b.get("num_numeric_cols", 0),
            "difference": stats_a.get("num_numeric_cols", 0) - stats_b.get("num_numeric_cols", 0),
        },
        {
            "metric": "Categorical Columns",
            "dataset_a": stats_a.get("num_categorical_cols", 0),
            "dataset_b": stats_b.get("num_categorical_cols", 0),
            "difference": stats_a.get("num_categorical_cols", 0) - stats_b.get("num_categorical_cols", 0),
        },
        {
            "metric": "Missing Data (%)",
            "dataset_a": stats_a.get("missing_values", {}).get("percent", 0.0),
            "dataset_b": stats_b.get("missing_values", {}).get("percent", 0.0),
            "difference": round(
                stats_a.get("missing_values", {}).get("percent", 0.0)
                - stats_b.get("missing_values", {}).get("percent", 0.0),
                2,
            ),
        },
        {
            "metric": "Duplicate Rows",
            "dataset_a": stats_a.get("duplicate_rows", 0),
            "dataset_b": stats_b.get("duplicate_rows", 0),
            "difference": stats_a.get("duplicate_rows", 0) - stats_b.get("duplicate_rows", 0),
        },
        {
            "metric": "Memory Footprint",
            "dataset_a": stats_a.get("memory_usage", "N/A"),
            "dataset_b": stats_b.get("memory_usage", "N/A"),
            "difference": "N/A",
        },
    ]

    # 2. Schema Overlap
    cols_a = set(df_a.columns)
    cols_b = set(df_b.columns)
    shared_cols = sorted(list(cols_a.intersection(cols_b)))
    only_a = sorted(list(cols_a - cols_b))
    only_b = sorted(list(cols_b - cols_a))

    # 3. Column-by-Column Comparisons for Shared Features
    column_comparisons = []
    for col in shared_cols:
        s_a = df_a[col].dropna()
        s_b = df_b[col].dropna()

        is_num_a = pd.api.types.is_numeric_dtype(df_a[col])
        is_num_b = pd.api.types.is_numeric_dtype(df_b[col])

        comp_entry: Dict[str, Any] = {
            "column": col,
            "type_a": str(df_a[col].dtype),
            "type_b": str(df_b[col].dtype),
            "nulls_a": int(df_a[col].isna().sum()),
            "nulls_b": int(df_b[col].isna().sum()),
            "unique_a": int(df_a[col].nunique()),
            "unique_b": int(df_b[col].nunique()),
            "is_numeric": bool(is_num_a and is_num_b),
        }

        if is_num_a and is_num_b and len(s_a) > 0 and len(s_b) > 0:
            mean_a = round(float(s_a.mean()), 2)
            mean_b = round(float(s_b.mean()), 2)
            comp_entry["mean_a"] = mean_a
            comp_entry["mean_b"] = mean_b
            comp_entry["mean_delta"] = round(mean_a - mean_b, 2)
            comp_entry["min_a"] = round(float(s_a.min()), 2)
            comp_entry["min_b"] = round(float(s_b.min()), 2)
            comp_entry["max_a"] = round(float(s_a.max()), 2)
            comp_entry["max_b"] = round(float(s_b.max()), 2)
            comp_entry["std_a"] = round(float(s_a.std()), 2) if len(s_a) > 1 else 0.0
            comp_entry["std_b"] = round(float(s_b.std()), 2) if len(s_b) > 1 else 0.0

        column_comparisons.append(comp_entry)

    # 4. Chart Visualization Data
    chart_data = {
        "dimensions": [
            {"dimension": "Rows", name_a: stats_a.get("num_rows", 0), name_b: stats_b.get("num_rows", 0)},
            {"dimension": "Columns", name_a: stats_a.get("num_cols", 0), name_b: stats_b.get("num_cols", 0)},
            {
                "dimension": "Completeness %",
                name_a: round(100.0 - stats_a.get("missing_values", {}).get("percent", 0.0), 1),
                name_b: round(100.0 - stats_b.get("missing_values", {}).get("percent", 0.0), 1),
            },
        ],
        "numeric_metrics_comparison": [],
    }

    # Add shared numeric metrics to chart
    numeric_shared = [c for c in column_comparisons if c.get("is_numeric")]
    for num_c in numeric_shared[:5]:
        chart_data["numeric_metrics_comparison"].append({
            "metric": num_c["column"],
            f"{name_a}_mean": num_c.get("mean_a", 0.0),
            f"{name_b}_mean": num_c.get("mean_b", 0.0),
        })

    # 5. AI Comparison Analysis
    ai_result = await ai_service.compare_datasets(
        df1_summary=stats_a,
        df2_summary=stats_b,
        df1_name=name_a,
        df2_name=name_b,
        language=payload.language or "en",
    )

    return {
        "dataset_a": {"id": payload.dataset_id_a, "name": name_a},
        "dataset_b": {"id": payload.dataset_id_b, "name": name_b},
        "overview_table": overview_table,
        "shared_columns": shared_cols,
        "only_in_a": only_a,
        "only_in_b": only_b,
        "column_comparisons": column_comparisons,
        "ai_summary": ai_result.get("ai_summary", ""),
        "winner": ai_result.get("quality_winner", name_a),
        "key_differences": ai_result.get("key_differences", []),
        "recommendations": ai_result.get("recommendations", []),
        "chart_data": chart_data,
    }
