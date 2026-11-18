"""DataSense AI - Pivot Table Router.

Provides endpoints for custom multi-dimensional cross-tabulations, aggregations,
filtering, and pre-configured domain pivot templates.
"""

from __future__ import annotations

import logging
import os
from typing import Any, Dict, List, Optional
from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel, Field
from routers.upload import get_dataset_path
from services import data_processor, pivot_service

logger = logging.getLogger("datasense.pivot_router")

router = APIRouter()


class PivotGenerateRequest(BaseModel):
    dataset_id: str = Field(..., description="Unique UUID identifier of dataset to pivot")
    rows: List[str] = Field(default_factory=list, description="Row grouping dimensions")
    columns: List[str] = Field(default_factory=list, description="Column header dimensions")
    values: List[str] = Field(default_factory=list, description="Value metrics to aggregate")
    aggfunc: str = Field(default="sum", description="Aggregation operation ('sum', 'mean', 'count', 'min', 'max', 'median')")
    filters: Dict[str, List[Any]] = Field(default_factory=dict, description="Filter criteria {column_name: [accepted_values]}")


class ApplyPivotTemplateRequest(BaseModel):
    dataset_id: str = Field(..., description="Unique UUID identifier of dataset to apply template against")


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


@router.post("/pivot/generate")
async def generate_pivot_table(payload: PivotGenerateRequest):
    """Generate dynamic multi-dimensional cross-tabulation table with grand totals."""
    df = _resolve_and_load(payload.dataset_id)
    try:
        result = pivot_service.generate_pivot(
            df=df,
            rows=payload.rows,
            columns=payload.columns,
            values=payload.values,
            aggfunc=payload.aggfunc,
            filters=payload.filters,
        )
        return {
            "dataset_id": payload.dataset_id,
            **result,
        }
    except Exception as exc:
        logger.error("Error generating pivot table: %s", exc, exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error compiling pivot table: {str(exc)}",
        )


@router.get("/pivot/templates")
async def get_pivot_templates():
    """Retrieve pre-configured pivot table templates for business analysis."""
    try:
        templates = pivot_service.list_pivot_templates()
        return {"templates": templates}
    except Exception as exc:
        logger.error("Error fetching pivot templates: %s", exc)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch templates: {str(exc)}",
        )


@router.post("/pivot/template/{template_name}")
async def apply_pivot_template(template_name: str, payload: ApplyPivotTemplateRequest):
    """Apply pre-configured domain pivot layout to the specified dataset."""
    df = _resolve_and_load(payload.dataset_id)
    try:
        result = pivot_service.get_template_pivot(template_name=template_name, df=df)
        return {
            "dataset_id": payload.dataset_id,
            "template_name": template_name,
            **result,
        }
    except Exception as exc:
        logger.error("Error applying pivot template '%s': %s", template_name, exc, exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error applying template '{template_name}': {str(exc)}",
        )
