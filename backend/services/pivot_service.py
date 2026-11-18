"""
DataSense AI — Pivot Table Service
Generates pivot tables from pandas DataFrames.
"""
import pandas as pd
import numpy as np
from typing import Optional


PIVOT_TEMPLATES = {
    "sales_by_region": {
        "rows": ["Region"],
        "columns": ["Month"],
        "values": ["Revenue"],
        "aggfunc": "sum",
        "filters": {}
    },
    "revenue_by_category": {
        "rows": ["Category"],
        "columns": [],
        "values": ["Revenue", "Units_Sold"],
        "aggfunc": "sum",
        "filters": {}
    },
    "hr_headcount": {
        "rows": ["Department"],
        "columns": ["Gender"],
        "values": ["Employee_ID"],
        "aggfunc": "count",
        "filters": {}
    },
    "loan_by_status": {
        "rows": ["Status"],
        "columns": [],
        "values": ["Loan_Amount"],
        "aggfunc": "sum",
        "filters": {}
    },
}


def _safe_val(v):
    """Convert numpy types to Python native for JSON serialization."""
    if isinstance(v, (np.integer,)):
        return int(v)
    if isinstance(v, (np.floating,)):
        return None if np.isnan(v) else round(float(v), 2)
    if pd.isna(v):
        return None
    return v


def generate_pivot(
    df: pd.DataFrame,
    rows: list,
    columns: list,
    values: list,
    aggfunc: str = "sum",
    filters: dict = None,
) -> dict:
    """
    Generate a pivot table and return it as a JSON-serializable dict.
    Returns: {headers, rows, grand_total_row, grand_total_col}
    """
    if filters is None:
        filters = {}

    # Apply filters
    for col, vals in filters.items():
        if col in df.columns and vals:
            df = df[df[col].isin(vals)]

    # Validate columns exist
    rows = [r for r in rows if r in df.columns]
    columns = [c for c in columns if c in df.columns]
    values = [v for v in values if v in df.columns]

    if not rows or not values:
        return {"error": "Please select at least one row dimension and one value column."}

    agg_map = {
        "sum": np.sum, "mean": np.mean,
        "count": len, "min": np.min, "max": np.max,
    }
    agg_fn = agg_map.get(aggfunc, np.sum)

    try:
        pivot = pd.pivot_table(
            df,
            index=rows,
            columns=columns if columns else None,
            values=values,
            aggfunc=agg_fn,
            margins=True,
            margins_name="Grand Total",
            fill_value=0,
        )
    except Exception as e:
        return {"error": str(e)}

    # Flatten column multi-index
    if isinstance(pivot.columns, pd.MultiIndex):
        pivot.columns = [" — ".join(str(c) for c in col).strip() for col in pivot.columns]

    # Build response
    headers = [""] + list(pivot.columns.astype(str))
    result_rows = []
    for idx, row in pivot.iterrows():
        result_rows.append({
            "index": str(idx),
            "values": [_safe_val(v) for v in row.values],
        })

    return {
        "headers": headers,
        "rows": result_rows,
        "row_count": len(result_rows),
        "col_count": len(headers),
        "aggfunc": aggfunc,
    }


def get_template_pivot(template_name: str, df: pd.DataFrame) -> dict:
    """Apply a named template pivot config to the given dataframe."""
    cfg = PIVOT_TEMPLATES.get(template_name)
    if not cfg:
        return {"error": f"Template '{template_name}' not found."}
    return generate_pivot(
        df,
        rows=cfg["rows"],
        columns=cfg["columns"],
        values=cfg["values"],
        aggfunc=cfg["aggfunc"],
        filters=cfg["filters"],
    )


def list_templates() -> list:
    return [
        {"id": k, "label": k.replace("_", " ").title()}
        for k in PIVOT_TEMPLATES
    ]
