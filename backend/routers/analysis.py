"""DataSense AI - Analysis Router.

Provides endpoints for deep dataset analysis, statistical summaries,
automated Recharts visualizations, regression forecasting, and interactive
what-if scenario modeling.
"""

from __future__ import annotations

import logging
from typing import Any, Dict, List, Optional
from fastapi import APIRouter, HTTPException, Query, status
from pydantic import BaseModel, Field
from routers.upload import get_dataset_path
from services import ai_service, data_processor

logger = logging.getLogger("datasense.analysis")

router = APIRouter()


class WhatIfRequest(BaseModel):
    column: str = Field(..., description="Numeric column to manipulate")
    multiplier: float = Field(..., description="Scaling factor (e.g. 1.2 for +20%, 0.8 for -20%)")


class WhatIfResponse(BaseModel):
    dataset_id: str
    column: str
    multiplier: float
    original_mean: float
    new_mean: float
    original_sum: float
    new_sum: float
    charts: List[Dict[str, Any]]
    basic_stats: Dict[str, Any]
    datasense_score: Dict[str, Any]


def _resolve_and_load(dataset_id: str):
    """Load DataFrame from dataset ID or raise 404."""
    path = get_dataset_path(dataset_id)
    if not path:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Dataset with ID '{dataset_id}' not found.",
        )
    try:
        return data_processor.load_dataset(path)
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=f"Failed to read dataset: {str(exc)}",
        )


@router.get("/analysis/{dataset_id}")
async def get_full_analysis(
    dataset_id: str,
    language: str = Query("en", description="Language for insights and narrative: 'en' or 'hi'/'hinglish'"),
):
    """Run comprehensive automated analysis on a dataset.

    Computes basic metadata, per-column statistics, DataSense quality score,
    IQR anomalies, correlation matrix, chart configs, AI insights, and executive narrative.
    """
    df = _resolve_and_load(dataset_id)

    basic_stats = data_processor.get_basic_stats(df)
    column_stats = data_processor.get_column_stats(df)
    datasense_score = data_processor.calculate_datasense_score(df)
    anomalies = data_processor.detect_anomalies(df)
    correlation_matrix = data_processor.get_correlation_matrix(df)
    charts = data_processor.generate_chart_configs(df)

    # Gemini AI integrations with language support
    insights = await ai_service.generate_insights(basic_stats, column_stats, language=language)
    narrative = await ai_service.generate_narrative(basic_stats, insights, language=language)

    return {
        "dataset_id": dataset_id,
        "basic_stats": basic_stats,
        "column_stats": column_stats,
        "datasense_score": datasense_score,
        "anomalies": anomalies,
        "correlation_matrix": correlation_matrix,
        "charts": charts,
        "insights": insights,
        "narrative": narrative,
    }


@router.get("/analysis/{dataset_id}/stats")
async def get_stats_only(dataset_id: str):
    """Retrieve quick statistics, column metrics, and quality score without AI latency."""
    df = _resolve_and_load(dataset_id)

    basic_stats = data_processor.get_basic_stats(df)
    column_stats = data_processor.get_column_stats(df)
    datasense_score = data_processor.calculate_datasense_score(df)

    return {
        "dataset_id": dataset_id,
        "basic_stats": basic_stats,
        "column_stats": column_stats,
        "datasense_score": datasense_score,
    }


@router.get("/analysis/{dataset_id}/charts")
async def get_charts_only(dataset_id: str):
    """Generate and return smart Recharts configuration objects for dataset."""
    df = _resolve_and_load(dataset_id)
    charts = data_processor.generate_chart_configs(df)
    return {
        "dataset_id": dataset_id,
        "charts": charts,
    }


@router.get("/analysis/{dataset_id}/forecast")
async def get_forecast(
    dataset_id: str,
    target_col: str = Query(..., description="Name of the numeric column to forecast"),
    periods: int = Query(10, ge=1, le=50, description="Future periods to predict"),
):
    """Calculate predictive linear regression trajectory with confidence intervals."""
    df = _resolve_and_load(dataset_id)
    try:
        forecast_result = data_processor.prepare_forecast(
            df=df, target_col=target_col, forecast_periods=periods
        )
        return {
            "dataset_id": dataset_id,
            **forecast_result,
        }
    except ValueError as ve:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(ve))
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Forecast calculation failed: {str(exc)}",
        )


@router.post("/analysis/{dataset_id}/whatif", response_model=WhatIfResponse)
@router.post("/analysis/{dataset_id}/whatsif", response_model=WhatIfResponse, include_in_schema=False)
async def run_what_if_scenario(dataset_id: str, payload: WhatIfRequest):
    """Simulate a what-if scenario by applying a multiplier to a specific numeric column.

    Recalculates charts, statistics, and quality score under the simulated conditions.
    """
    df = _resolve_and_load(dataset_id)

    col = payload.column
    if col not in df.columns:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Column '{col}' does not exist in dataset.",
        )

    try:
        # Check if numeric
        orig_series = df[col].dropna()
        orig_mean = round(float(orig_series.mean()), 4) if len(orig_series) > 0 else 0.0
        orig_sum = round(float(orig_series.sum()), 4) if len(orig_series) > 0 else 0.0

        # Apply simulation multiplier on a copy
        sim_df = df.copy()
        sim_df[col] = sim_df[col] * payload.multiplier

        new_series = sim_df[col].dropna()
        new_mean = round(float(new_series.mean()), 4) if len(new_series) > 0 else 0.0
        new_sum = round(float(new_series.sum()), 4) if len(new_series) > 0 else 0.0

        charts = data_processor.generate_chart_configs(sim_df)
        basic_stats = data_processor.get_basic_stats(sim_df)
        score = data_processor.calculate_datasense_score(sim_df)

        return WhatIfResponse(
            dataset_id=dataset_id,
            column=col,
            multiplier=payload.multiplier,
            original_mean=orig_mean,
            new_mean=new_mean,
            original_sum=orig_sum,
            new_sum=new_sum,
            charts=charts,
            basic_stats=basic_stats,
            datasense_score=score,
        )
    except TypeError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Column '{col}' cannot be scaled because it is not numeric.",
        )
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Simulation error: {str(exc)}",
        )
