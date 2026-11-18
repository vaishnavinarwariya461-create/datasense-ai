"""DataSense AI - What-If Scenario Modeling Router.

Provides multi-variable sensitivity modeling, numeric recalculation, before/after
impact summaries, visual variance charts, and Gemini-powered feasibility analysis.
"""

from __future__ import annotations

import logging
import os
from typing import Any, Dict, List, Optional
import numpy as np
import pandas as pd
from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel, Field
from routers.upload import get_dataset_path
from services import ai_service, data_processor

logger = logging.getLogger("datasense.whatif_router")

router = APIRouter()


class Scenario(BaseModel):
    column: str = Field(..., description="Numeric column to scale")
    multiplier: float = Field(..., description="Scaling multiplier (e.g. 1.20 for +20%, 0.85 for -15%)")


class SimulateRequest(BaseModel):
    dataset_id: str = Field(..., description="UUID identifier of dataset to simulate")
    scenarios: List[Scenario] = Field(..., min_length=1, description="List of parameter adjustment scenarios")


class AIAnalysisRequest(BaseModel):
    dataset_id: str = Field(..., description="UUID identifier of dataset")
    original_stats: Dict[str, Any] = Field(..., description="Baseline numeric metrics")
    modified_stats: Dict[str, Any] = Field(..., description="Simulated numeric metrics")
    changes: Dict[str, Any] = Field(..., description="Applied column multipliers")
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


def _compute_numeric_stats(df: pd.DataFrame) -> Dict[str, Dict[str, float]]:
    """Compute comprehensive statistical metrics for all numeric columns."""
    stats = {}
    num_cols = df.select_dtypes(include=[np.number]).columns
    for col in num_cols:
        s = df[col].dropna()
        if len(s) == 0:
            continue
        stats[str(col)] = {
            "mean": round(float(s.mean()), 2),
            "sum": round(float(s.sum()), 2),
            "median": round(float(s.median()), 2),
            "min": round(float(s.min()), 2),
            "max": round(float(s.max()), 2),
            "std": round(float(s.std()), 2) if len(s) > 1 else 0.0,
        }
    return stats


@router.post("/whatif/simulate")
async def simulate_whatif_scenario(payload: SimulateRequest):
    """Execute multi-variable sensitivity simulation and recalculate aggregate indicators."""
    df = _resolve_and_load(payload.dataset_id)

    # Validate all requested columns
    for sc in payload.scenarios:
        if sc.column not in df.columns:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Column '{sc.column}' does not exist in dataset.",
            )
        if not pd.api.types.is_numeric_dtype(df[sc.column]):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Column '{sc.column}' is not numeric and cannot be scaled.",
            )

    original_stats = _compute_numeric_stats(df)

    # Apply scaling on simulation dataframe
    sim_df = df.copy()
    changes_dict = {}
    for sc in payload.scenarios:
        sim_df[sc.column] = sim_df[sc.column] * sc.multiplier
        changes_dict[sc.column] = sc.multiplier

    modified_stats = _compute_numeric_stats(sim_df)

    # Compute impact summary per adjusted column
    impact_summary = []
    comparison_bars = []

    for sc in payload.scenarios:
        col = sc.column
        orig = original_stats.get(col, {})
        mod = modified_stats.get(col, {})

        orig_mean = orig.get("mean", 0.0)
        mod_mean = mod.get("mean", 0.0)
        orig_sum = orig.get("sum", 0.0)
        mod_sum = mod.get("sum", 0.0)

        pct_change = round((sc.multiplier - 1.0) * 100, 2)

        impact_summary.append({
            "column": col,
            "multiplier": sc.multiplier,
            "percent_change": pct_change,
            "original_mean": orig_mean,
            "modified_mean": mod_mean,
            "mean_delta": round(mod_mean - orig_mean, 2),
            "original_sum": orig_sum,
            "modified_sum": mod_sum,
            "sum_delta": round(mod_sum - orig_sum, 2),
        })

        comparison_bars.append({
            "metric": col,
            "Baseline_Mean": orig_mean,
            "Simulated_Mean": mod_mean,
            "Baseline_Total": orig_sum,
            "Simulated_Total": mod_sum,
            "percent_shift": pct_change,
        })

    # Generate Recharts visualization configs on simulated data
    try:
        charts_list = data_processor.generate_chart_configs(sim_df)
    except Exception as exc:
        logger.warning("Could not generate updated chart configs: %s", exc)
        charts_list = []

    return {
        "dataset_id": payload.dataset_id,
        "original_stats": original_stats,
        "modified_stats": modified_stats,
        "impact_summary": impact_summary,
        "charts": {
            "comparison_bars": comparison_bars,
            "recharts_configs": charts_list[:4],
        },
    }


@router.post("/whatif/ai-analysis")
async def whatif_ai_analysis(payload: AIAnalysisRequest):
    """Evaluate feasibility, realism, and executive recommendations for simulated scenario."""
    # Realism heuristics
    multipliers = []
    for k, v in payload.changes.items():
        if isinstance(v, (int, float)):
            multipliers.append(float(v))

    is_realistic = True
    confidence = "High"

    if multipliers:
        max_mult = max(multipliers)
        min_mult = min(multipliers)

        if max_mult > 3.0 or min_mult < 0.2:
            is_realistic = False
            confidence = "Low"
        elif max_mult > 1.8 or min_mult < 0.5:
            is_realistic = True
            confidence = "Medium"
        else:
            is_realistic = True
            confidence = "High"

    analysis_text = await ai_service.analyze_whatif(
        original_stats=payload.original_stats,
        modified_stats=payload.modified_stats,
        changes=payload.changes,
        language=payload.language or "en",
    )

    # Extract concise 1-sentence recommendation summary
    lines = [l.strip() for l in analysis_text.split("\n") if l.strip()]
    recommendation_summary = (
        lines[-1] if lines else "Align resource allocations before operationalizing simulated targets."
    )

    return {
        "analysis": analysis_text,
        "is_realistic": is_realistic,
        "confidence": confidence,
        "recommendation": recommendation_summary,
    }
