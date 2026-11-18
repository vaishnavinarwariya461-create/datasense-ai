"""
DataSense AI — Data Cleaning Service
Scans and fixes common data quality issues.
"""
import pandas as pd
import numpy as np
from typing import Optional


# ─── Issue Detection ────────────────────────────────────────────────────────

def detect_missing(df: pd.DataFrame) -> dict:
    total = df.isnull().sum().sum()
    col_details = []
    for col in df.columns:
        n = int(df[col].isnull().sum())
        if n > 0:
            col_details.append({"column": col, "count": n, "pct": round(n / len(df) * 100, 1)})
    return {"count": int(total), "columns": col_details, "label": "Missing Values"}


def detect_duplicates(df: pd.DataFrame) -> dict:
    count = int(df.duplicated().sum())
    return {"count": count, "label": "Duplicate Rows"}


def detect_type_issues(df: pd.DataFrame) -> dict:
    issues = []
    for col in df.select_dtypes(include="object").columns:
        sample = df[col].dropna().head(100)
        numeric_count = pd.to_numeric(sample, errors="coerce").notna().sum()
        if numeric_count > len(sample) * 0.7 and numeric_count < len(sample):
            issues.append({"column": col, "detected_type": "numeric", "current_type": "string"})
    return {"count": len(issues), "columns": issues, "label": "Data Type Issues"}


def detect_outlier_cells(df: pd.DataFrame) -> dict:
    outlier_cols = []
    total = 0
    for col in df.select_dtypes(include=[np.number]).columns:
        Q1 = df[col].quantile(0.25)
        Q3 = df[col].quantile(0.75)
        IQR = Q3 - Q1
        lower = Q1 - 3 * IQR
        upper = Q3 + 3 * IQR
        mask = (df[col] < lower) | (df[col] > upper)
        n = int(mask.sum())
        if n > 0:
            total += n
            outlier_cols.append({"column": col, "count": n, "lower": round(float(lower), 2), "upper": round(float(upper), 2)})
    return {"count": total, "columns": outlier_cols, "label": "Outliers (3×IQR)"}


def detect_whitespace(df: pd.DataFrame) -> dict:
    total = 0
    for col in df.select_dtypes(include="object").columns:
        mask = df[col].dropna().str.match(r"^\s+|\s+$")
        total += int(mask.sum())
    return {"count": total, "label": "Whitespace Issues"}


def detect_date_issues(df: pd.DataFrame) -> dict:
    count = 0
    cols = []
    for col in df.select_dtypes(include="object").columns:
        sample = df[col].dropna().head(50)
        parsed = pd.to_datetime(sample, errors="coerce", infer_datetime_format=True)
        if parsed.notna().sum() > len(sample) * 0.5:
            n = int(parsed.isna().sum())
            if n > 0:
                count += n
                cols.append({"column": col, "unparseable": n})
    return {"count": count, "columns": cols, "label": "Date Format Issues"}


def scan_issues(df: pd.DataFrame) -> dict:
    """Scan dataframe for all data quality issues."""
    issues = {
        "missing_values": detect_missing(df),
        "duplicates": detect_duplicates(df),
        "type_issues": detect_type_issues(df),
        "outliers": detect_outlier_cells(df),
        "whitespace": detect_whitespace(df),
        "date_issues": detect_date_issues(df),
    }
    total = sum(v.get("count", 0) for v in issues.values())
    total_cells = df.shape[0] * df.shape[1]
    score_before = max(0, round(100 - (total / max(total_cells, 1)) * 200, 1))
    score_after = min(100, round(score_before + total * 0.4, 1))
    issues["total_issues"] = total
    issues["quality_score_before"] = score_before
    issues["quality_score_after_estimate"] = score_after
    return issues


# ─── Fix Functions ───────────────────────────────────────────────────────────

def fix_missing(df: pd.DataFrame, strategy: str = "mean") -> tuple:
    count = 0
    for col in df.columns:
        n_null = df[col].isnull().sum()
        if n_null == 0:
            continue
        if strategy == "mean" and pd.api.types.is_numeric_dtype(df[col]):
            df[col] = df[col].fillna(df[col].mean())
        elif strategy == "median" and pd.api.types.is_numeric_dtype(df[col]):
            df[col] = df[col].fillna(df[col].median())
        elif strategy == "mode":
            mode = df[col].mode()
            if len(mode) > 0:
                df[col] = df[col].fillna(mode[0])
        elif strategy == "drop":
            df = df.dropna(subset=[col])
        else:
            # Default: numeric → mean, categorical → mode
            if pd.api.types.is_numeric_dtype(df[col]):
                df[col] = df[col].fillna(df[col].mean())
            else:
                mode = df[col].mode()
                if len(mode) > 0:
                    df[col] = df[col].fillna(mode[0])
        count += int(n_null)
    return df, {"action": f"Filled missing values ({strategy})", "cells_modified": count}


def fix_duplicates(df: pd.DataFrame) -> tuple:
    before = len(df)
    df = df.drop_duplicates()
    removed = before - len(df)
    return df, {"action": "Removed duplicate rows", "rows_removed": removed}


def fix_whitespace(df: pd.DataFrame) -> tuple:
    count = 0
    for col in df.select_dtypes(include="object").columns:
        before = df[col].copy()
        df[col] = df[col].str.strip()
        count += int((before != df[col]).sum())
    return df, {"action": "Trimmed whitespace", "cells_modified": count}


def fix_types(df: pd.DataFrame) -> tuple:
    converted = 0
    for col in df.select_dtypes(include="object").columns:
        converted_col = pd.to_numeric(df[col], errors="coerce")
        if converted_col.notna().sum() > len(df) * 0.8:
            df[col] = converted_col
            converted += 1
    return df, {"action": "Converted string columns to numeric", "columns_converted": converted}


def fix_outliers(df: pd.DataFrame, method: str = "cap") -> tuple:
    count = 0
    for col in df.select_dtypes(include=[np.number]).columns:
        Q1, Q3 = df[col].quantile(0.25), df[col].quantile(0.75)
        IQR = Q3 - Q1
        lower, upper = Q1 - 3 * IQR, Q3 + 3 * IQR
        mask = (df[col] < lower) | (df[col] > upper)
        n = int(mask.sum())
        if n > 0 and method == "cap":
            df[col] = df[col].clip(lower=lower, upper=upper)
            count += n
        elif n > 0 and method == "remove":
            df = df[~mask]
            count += n
    return df, {"action": f"Fixed outliers ({method})", "cells_modified": count}


def fix_all(df: pd.DataFrame, options: dict) -> tuple:
    """Apply all selected fixes. Returns (cleaned_df, report)."""
    report = {"steps": [], "cells_modified": 0, "rows_removed": 0}

    if options.get("fix_missing", True):
        df, step = fix_missing(df, options.get("missing_strategy", "auto"))
        report["steps"].append(step)
        report["cells_modified"] += step.get("cells_modified", 0)

    if options.get("fix_duplicates", True):
        df, step = fix_duplicates(df)
        report["steps"].append(step)
        report["rows_removed"] += step.get("rows_removed", 0)

    if options.get("fix_whitespace", True):
        df, step = fix_whitespace(df)
        report["steps"].append(step)
        report["cells_modified"] += step.get("cells_modified", 0)

    if options.get("fix_types", True):
        df, step = fix_types(df)
        report["steps"].append(step)

    if options.get("fix_outliers", False):
        df, step = fix_outliers(df, options.get("outlier_method", "cap"))
        report["steps"].append(step)
        report["cells_modified"] += step.get("cells_modified", 0)

    return df, report
