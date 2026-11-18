"""DataSense AI - Data Processor Service.

Provides complete dataset parsing, statistical analysis, data quality scoring,
anomaly detection, correlation matrix computation, Recharts visualization configs,
and time-series/linear regression forecasting.
"""

from __future__ import annotations

import os
from typing import Any, Dict, List, Optional, Tuple
import numpy as np
import pandas as pd
from sklearn.linear_model import LinearRegression


def _sanitize_val(val: Any) -> Any:
    """Convert numpy/pandas types and NaN/Inf to standard JSON-serializable types."""
    if val is None:
        return None
    if isinstance(val, (np.integer, int)):
        return int(val)
    if isinstance(val, (np.floating, float)):
        if np.isnan(val) or np.isinf(val):
            return None
        return round(float(val), 4)
    if isinstance(val, (np.bool_, bool)):
        return bool(val)
    if isinstance(val, (pd.Timestamp, np.datetime64)):
        return str(val)
    return str(val)


def load_dataset(file_path: str) -> pd.DataFrame:
    """Load CSV, Excel, or JSON dataset from file path with automatic encoding fallback.

    Args:
        file_path: Absolute or relative path to the dataset file.

    Returns:
        pd.DataFrame: Cleaned and loaded DataFrame.

    Raises:
        FileNotFoundError: If file path does not exist.
        ValueError: If file format is unsupported or file is empty/unparseable.
    """
    if not os.path.exists(file_path):
        raise FileNotFoundError(f"Dataset file not found at: {file_path}")

    ext = os.path.splitext(file_path)[1].lower()

    df: Optional[pd.DataFrame] = None

    if ext == ".csv":
        encodings = ["utf-8", "utf-8-sig", "latin1", "cp1252", "iso-8859-1"]
        for enc in encodings:
            try:
                df = pd.read_csv(file_path, encoding=enc)
                break
            except (UnicodeDecodeError, pd.errors.ParserError):
                continue
        if df is None:
            # Fallback with python engine separator detection
            df = pd.read_csv(file_path, sep=None, engine="python", encoding="latin1")

    elif ext in [".xlsx", ".xls"]:
        df = pd.read_excel(file_path)

    elif ext == ".json":
        try:
            df = pd.read_json(file_path)
        except ValueError:
            # Try lines=True for JSON Lines format
            df = pd.read_json(file_path, lines=True)

    else:
        raise ValueError(f"Unsupported file format: {ext}. Supported formats: .csv, .xlsx, .xls, .json")

    if df is None or df.empty:
        raise ValueError("Dataset is empty or could not be parsed.")

    # Clean DataFrame:
    # 1. Clean column names (strip whitespace and stringify)
    df.columns = [str(c).strip() for c in df.columns]

    # 2. Replace infinite values with NaN
    df.replace([np.inf, -np.inf], np.nan, inplace=True)

    return df


def get_basic_stats(df: pd.DataFrame) -> dict:
    """Extract high-level metadata, dimensions, missing value ratios, and duplicate stats.

    Args:
        df: Input DataFrame.

    Returns:
        dict: Basic statistics dictionary.
    """
    num_rows = int(len(df))
    num_cols = int(len(df.columns))
    total_cells = num_rows * num_cols

    numeric_cols = df.select_dtypes(include=[np.number]).columns.tolist()
    categorical_cols = df.select_dtypes(exclude=[np.number]).columns.tolist()

    missing_count = int(df.isna().sum().sum())
    missing_percent = round((missing_count / total_cells * 100), 2) if total_cells > 0 else 0.0

    duplicate_rows = int(df.duplicated().sum())
    duplicate_percent = round((duplicate_rows / num_rows * 100), 2) if num_rows > 0 else 0.0

    # Human-readable memory usage
    mem_bytes = int(df.memory_usage(deep=True).sum())
    if mem_bytes < 1024 * 1024:
        memory_str = f"{mem_bytes / 1024:.2f} KB"
    else:
        memory_str = f"{mem_bytes / (1024 * 1024):.2f} MB"

    missing_by_col = {str(col): int(df[col].isna().sum()) for col in df.columns}
    column_types = {str(col): str(dtype) for col, dtype in df.dtypes.items()}

    return {
        "num_rows": num_rows,
        "num_cols": num_cols,
        "num_numeric_cols": len(numeric_cols),
        "num_categorical_cols": len(categorical_cols),
        "numeric_columns": numeric_cols,
        "categorical_columns": categorical_cols,
        "missing_values": {
            "count": missing_count,
            "percent": missing_percent,
            "by_column": missing_by_col,
        },
        "duplicate_rows": duplicate_rows,
        "duplicate_percent": duplicate_percent,
        "memory_usage": memory_str,
        "memory_bytes": mem_bytes,
        "column_types": column_types,
    }


def get_column_stats(df: pd.DataFrame) -> list:
    """Calculate comprehensive summary statistics for each column in the DataFrame.

    Args:
        df: Input DataFrame.

    Returns:
        list of column statistics dictionaries.
    """
    stats_list = []
    num_rows = len(df)

    for col in df.columns:
        series = df[col]
        null_count = int(series.isna().sum())
        null_percent = round((null_count / num_rows * 100), 2) if num_rows > 0 else 0.0
        unique_count = int(series.nunique(dropna=True))
        is_numeric = pd.api.types.is_numeric_dtype(series)

        col_stat: Dict[str, Any] = {
            "name": str(col),
            "dtype": str(series.dtype),
            "null_count": null_count,
            "null_percent": null_percent,
            "unique_count": unique_count,
            "is_numeric": bool(is_numeric),
        }

        if is_numeric:
            clean_s = series.dropna()
            if len(clean_s) > 0:
                q25 = float(clean_s.quantile(0.25))
                q75 = float(clean_s.quantile(0.75))
                skew = float(clean_s.skew()) if len(clean_s) > 2 else 0.0

                col_stat.update(
                    {
                        "mean": round(float(clean_s.mean()), 4),
                        "median": round(float(clean_s.median()), 4),
                        "std": round(float(clean_s.std()), 4) if len(clean_s) > 1 else 0.0,
                        "min": round(float(clean_s.min()), 4),
                        "max": round(float(clean_s.max()), 4),
                        "q25": round(q25, 4),
                        "q75": round(q75, 4),
                        "skewness": round(skew, 4) if not np.isnan(skew) else 0.0,
                    }
                )
            else:
                col_stat.update(
                    {
                        "mean": None,
                        "median": None,
                        "std": None,
                        "min": None,
                        "max": None,
                        "q25": None,
                        "q75": None,
                        "skewness": None,
                    }
                )
        else:
            # Top 5 categorical values with counts
            top_counts = series.value_counts(dropna=True).head(5)
            top_values = [
                {"value": str(k), "count": int(v)} for k, v in top_counts.items()
            ]
            col_stat["top_values"] = top_values

        stats_list.append(col_stat)

    return stats_list


def calculate_datasense_score(df: pd.DataFrame) -> dict:
    """Compute overall DataSense Quality Score (0-100) and component dimensions.

    Dimensions:
    - Completeness: 100 - missing cell percentage
    - Uniqueness: 100 - duplicate row percentage
    - Consistency: Absence of extreme outlier skew and clean numerical distributions
    - Validity: Columns with valid non-null distributions and non-constant variance

    Returns:
        dict: {overall, completeness, uniqueness, consistency, validity, grade, rating}
    """
    num_rows = len(df)
    num_cols = len(df.columns)
    total_cells = num_rows * num_cols

    if total_cells == 0:
        return {
            "overall": 0.0,
            "completeness": 0.0,
            "uniqueness": 0.0,
            "consistency": 0.0,
            "validity": 0.0,
            "grade": "F",
            "rating": "Poor",
        }

    # 1. Completeness (35%)
    missing_cells = df.isna().sum().sum()
    completeness = max(0.0, min(100.0, 100.0 - (missing_cells / total_cells * 100)))

    # 2. Uniqueness (25%)
    duplicate_rows = df.duplicated().sum()
    uniqueness = max(0.0, min(100.0, 100.0 - (duplicate_rows / num_rows * 100))) if num_rows > 0 else 100.0

    # 3. Consistency (20%)
    numeric_cols = df.select_dtypes(include=[np.number]).columns
    if len(numeric_cols) > 0:
        outlier_ratios = []
        for col in numeric_cols:
            s = df[col].dropna()
            if len(s) >= 4:
                q1, q3 = s.quantile(0.25), s.quantile(0.75)
                iqr = q3 - q1
                if iqr > 0:
                    outliers = s[(s < q1 - 1.5 * iqr) | (s > q3 + 1.5 * iqr)]
                    outlier_ratios.append(len(outliers) / len(s))
                else:
                    outlier_ratios.append(0.0)
            else:
                outlier_ratios.append(0.0)
        avg_outlier_rate = float(np.mean(outlier_ratios)) if outlier_ratios else 0.0
        # Penalize up to 40 points for extreme anomaly prevalence
        consistency = max(50.0, min(100.0, 100.0 - (avg_outlier_rate * 200)))
    else:
        consistency = 90.0

    # 4. Validity (20%)
    # Ratio of columns that are non-constant and have <90% nulls
    valid_cols = 0
    for col in df.columns:
        s = df[col]
        null_pct = s.isna().mean()
        nunique = s.nunique(dropna=True)
        if null_pct < 0.90 and nunique > 1:
            valid_cols += 1
        elif num_rows == 1 and nunique == 1:
            valid_cols += 1
    validity = max(0.0, min(100.0, (valid_cols / num_cols) * 100))

    # Overall weighted average
    overall = (completeness * 0.35) + (uniqueness * 0.25) + (consistency * 0.20) + (validity * 0.20)
    overall = round(max(0.0, min(100.0, overall)), 1)
    completeness = round(completeness, 1)
    uniqueness = round(uniqueness, 1)
    consistency = round(consistency, 1)
    validity = round(validity, 1)

    if overall >= 90:
        grade = "A"
        rating = "Excellent"
    elif overall >= 80:
        grade = "B"
        rating = "Good"
    elif overall >= 65:
        grade = "C"
        rating = "Fair"
    elif overall >= 50:
        grade = "D"
        rating = "Needs Attention"
    else:
        grade = "F"
        rating = "Poor"

    return {
        "overall": overall,
        "completeness": completeness,
        "uniqueness": uniqueness,
        "consistency": consistency,
        "validity": validity,
        "grade": grade,
        "rating": rating,
    }


def detect_anomalies(df: pd.DataFrame) -> list:
    """Identify numeric outliers using the Interquartile Range (IQR) method.

    Args:
        df: Input DataFrame.

    Returns:
        list of anomaly reports per numeric column.
    """
    anomalies = []
    numeric_cols = df.select_dtypes(include=[np.number]).columns

    for col in numeric_cols:
        s = df[col].dropna()
        if len(s) < 4:
            continue

        q1 = float(s.quantile(0.25))
        q3 = float(s.quantile(0.75))
        iqr = q3 - q1

        if iqr == 0:
            continue

        lower_bound = q1 - 1.5 * iqr
        upper_bound = q3 + 1.5 * iqr

        outliers = s[(s < lower_bound) | (s > upper_bound)]
        outlier_count = int(len(outliers))

        if outlier_count > 0:
            outlier_percent = round((outlier_count / len(s)) * 100, 2)
            # Pick up to 5 representative outlier values
            examples = [_sanitize_val(v) for v in outliers.head(5).tolist()]
            anomalies.append(
                {
                    "column": str(col),
                    "outlier_count": outlier_count,
                    "outlier_percent": outlier_percent,
                    "lower_bound": round(lower_bound, 4),
                    "upper_bound": round(upper_bound, 4),
                    "examples": examples,
                }
            )

    return sorted(anomalies, key=lambda x: x["outlier_percent"], reverse=True)


def get_correlation_matrix(df: pd.DataFrame) -> dict:
    """Compute Pearson correlation matrix and top correlated feature pairs.

    Args:
        df: Input DataFrame.

    Returns:
        dict: {columns: [...], matrix: [[...]], pairs: [{col1, col2, correlation}]}
    """
    numeric_df = df.select_dtypes(include=[np.number])
    numeric_cols = numeric_df.columns.tolist()

    if len(numeric_cols) < 2:
        return {"columns": numeric_cols, "matrix": [], "pairs": []}

    # Limit to top 15 numeric columns with highest variance to prevent massive matrix
    if len(numeric_cols) > 15:
        variances = numeric_df.var()
        top_cols = variances.nlargest(15).index.tolist()
        numeric_df = numeric_df[top_cols]
        numeric_cols = top_cols

    corr = numeric_df.corr().fillna(0)
    matrix = [[round(float(val), 3) for val in row] for row in corr.values]

    pairs = []
    for i in range(len(numeric_cols)):
        for j in range(i + 1, len(numeric_cols)):
            c1, c2 = numeric_cols[i], numeric_cols[j]
            val = float(corr.iloc[i, j])
            if not np.isnan(val):
                pairs.append(
                    {
                        "col1": str(c1),
                        "col2": str(c2),
                        "correlation": round(val, 3),
                        "strength": "strong" if abs(val) >= 0.7 else ("moderate" if abs(val) >= 0.4 else "weak"),
                        "direction": "positive" if val > 0 else "negative",
                    }
                )

    pairs.sort(key=lambda p: abs(p["correlation"]), reverse=True)

    return {
        "columns": [str(c) for c in numeric_cols],
        "matrix": matrix,
        "pairs": pairs,
    }


def _detect_date_column(df: pd.DataFrame) -> Optional[str]:
    """Find a candidate datetime or timestamp column."""
    # Check explicitly recognized names first
    for col in df.columns:
        col_lower = str(col).lower()
        if any(term in col_lower for term in ["date", "timestamp", "time", "year", "month", "day", "created_at"]):
            # Test if parseable
            try:
                pd.to_datetime(df[col].dropna().head(10))
                return col
            except Exception:
                pass

    # Check dtypes
    for col in df.columns:
        if pd.api.types.is_datetime64_any_dtype(df[col]):
            return col

    return None


def generate_chart_configs(df: pd.DataFrame) -> list:
    """Intelligently generate up to 8 chart configurations formatted for Recharts.

    Includes:
    - Time-series Line Chart if date column exists
    - Categorical Bar & Pie Charts
    - Numeric Distribution Histograms
    - Correlation Scatter Plots
    - Categorical Aggregation Bar/Area Charts

    Returns:
        list of chart configuration dicts.
    """
    charts = []
    numeric_cols = df.select_dtypes(include=[np.number]).columns.tolist()
    categorical_cols = df.select_dtypes(exclude=[np.number]).columns.tolist()
    date_col = _detect_date_column(df)

    # 1. Time-series Line Chart (if date col exists and at least one numeric col)
    if date_col and len(numeric_cols) > 0:
        target_num = numeric_cols[0]
        try:
            temp_df = df[[date_col, target_num]].dropna().copy()
            temp_df["dt"] = pd.to_datetime(temp_df[date_col], errors="coerce")
            temp_df = temp_df.dropna(subset=["dt"]).sort_values("dt")
            if len(temp_df) > 30:
                # Sample or resample
                sample_step = max(1, len(temp_df) // 30)
                temp_df = temp_df.iloc[::sample_step]

            data = []
            for _, row in temp_df.iterrows():
                dt_str = str(row["dt"])[:10]
                data.append({"date": dt_str, target_num: _sanitize_val(row[target_num])})

            if data:
                charts.append(
                    {
                        "type": "line",
                        "title": f"{target_num} Trend over Time",
                        "description": f"Historical trajectory of {target_num} tracked against {date_col}.",
                        "x_col": "date",
                        "y_col": target_num,
                        "data": data,
                    }
                )
        except Exception:
            pass

    # 2. Categorical Distribution Charts (Pie or Bar)
    for cat_col in categorical_cols:
        if len(charts) >= 8:
            break
        if cat_col == date_col:
            continue
        nunique = df[cat_col].nunique(dropna=True)
        if 2 <= nunique <= 8:
            counts = df[cat_col].value_counts().head(8)
            chart_type = "pie" if nunique <= 5 else "bar"
            data = [{"name": str(k), "value": int(v)} for k, v in counts.items()]
            charts.append(
                {
                    "type": chart_type,
                    "title": f"Distribution of {cat_col}",
                    "description": f"Frequency breakdown across distinct categories of {cat_col}.",
                    "x_col": "name",
                    "y_col": "value",
                    "data": data,
                }
            )

    # 3. Numeric Distribution Histograms (Bar chart of bins)
    for num_col in numeric_cols:
        if len(charts) >= 8:
            break
        s = df[num_col].dropna()
        if len(s) < 5 or s.nunique() <= 1:
            continue

        counts, bin_edges = np.histogram(s, bins=min(10, max(5, s.nunique())))
        data = []
        for i in range(len(counts)):
            bin_label = f"{round(bin_edges[i], 1)}-{round(bin_edges[i+1], 1)}"
            data.append({"bin": bin_label, "count": int(counts[i])})

        charts.append(
            {
                "type": "bar",
                "title": f"{num_col} Value Distribution",
                "description": f"Histogram showing the frequency distribution of {num_col}.",
                "x_col": "bin",
                "y_col": "count",
                "data": data,
            }
        )

    # 4. Correlation Scatter Plot for two top correlated numeric features
    if len(numeric_cols) >= 2 and len(charts) < 8:
        corr_info = get_correlation_matrix(df)
        if corr_info["pairs"]:
            top_pair = corr_info["pairs"][0]
            col_x, col_y = top_pair["col1"], top_pair["col2"]
            pair_df = df[[col_x, col_y]].dropna()
            if len(pair_df) > 80:
                pair_df = pair_df.sample(n=80, random_state=42)
            data = [
                {"x": _sanitize_val(row[col_x]), "y": _sanitize_val(row[col_y])}
                for _, row in pair_df.iterrows()
            ]
            charts.append(
                {
                    "type": "scatter",
                    "title": f"{col_y} vs {col_x}",
                    "description": f"Scatter correlation analysis (r = {top_pair['correlation']}) between {col_x} and {col_y}.",
                    "x_col": col_x,
                    "y_col": col_y,
                    "data": data,
                }
            )

    # 5. Grouped Aggregation (Category vs Numeric Average)
    if len(categorical_cols) > 0 and len(numeric_cols) > 0 and len(charts) < 8:
        cat_candidate = None
        for c in categorical_cols:
            if 2 <= df[c].nunique(dropna=True) <= 10:
                cat_candidate = c
                break

        if cat_candidate:
            num_target = numeric_cols[0]
            grouped = (
                df.groupby(cat_candidate)[num_target]
                .mean()
                .dropna()
                .reset_index()
                .sort_values(by=num_target, ascending=False)
                .head(8)
            )
            data = [
                {"category": str(row[cat_candidate]), "average": round(float(row[num_target]), 2)}
                for _, row in grouped.iterrows()
            ]
            charts.append(
                {
                    "type": "area",
                    "title": f"Average {num_target} by {cat_candidate}",
                    "description": f"Mean {num_target} comparison segmented by {cat_candidate}.",
                    "x_col": "category",
                    "y_col": "average",
                    "data": data,
                }
            )

    return charts[:8]


def prepare_forecast(df: pd.DataFrame, target_col: str, forecast_periods: int = 10) -> dict:
    """Generate linear regression forecast with 95% confidence intervals for a numeric column.

    Args:
        df: Input DataFrame.
        target_col: Name of the numeric column to forecast.
        forecast_periods: Number of future time points to project.

    Returns:
        dict: {historical, forecast, confidence_upper, confidence_lower, r_squared, trend, slope}
    """
    if target_col not in df.columns:
        raise ValueError(f"Target column '{target_col}' not found in dataset.")

    series = df[target_col].dropna()
    if not pd.api.types.is_numeric_dtype(series):
        raise ValueError(f"Target column '{target_col}' must be numeric.")

    y_vals = series.values.astype(float)
    n = len(y_vals)
    if n < 3:
        raise ValueError(f"Insufficient numeric observations ({n}) to compute forecast.")

    # Downsample if too large for clean UI rendering
    if n > 100:
        step = max(1, n // 100)
        y_vals = y_vals[::step]
        n = len(y_vals)

    X = np.arange(n).reshape(-1, 1)
    model = LinearRegression()
    model.fit(X, y_vals)

    y_pred = model.predict(X)
    residuals = y_vals - y_pred
    dof = max(1, n - 2)
    s_err = float(np.sqrt(np.sum(residuals**2) / dof))

    # Variance of slope
    x_mean = float(np.mean(X))
    ss_x = float(np.sum((X - x_mean) ** 2))
    if ss_x == 0:
        ss_x = 1.0

    # R-squared calculation
    ss_tot = float(np.sum((y_vals - np.mean(y_vals)) ** 2))
    r_squared = float(1 - (np.sum(residuals**2) / ss_tot)) if ss_tot > 0 else 0.0
    r_squared = max(0.0, min(1.0, r_squared))

    slope = float(model.coef_[0])
    if slope > 0.05:
        trend = "increasing"
    elif slope < -0.05:
        trend = "decreasing"
    else:
        trend = "stable"

    # Historical series
    historical = []
    for i in range(n):
        historical.append(
            {
                "step": f"T{i + 1}",
                "actual": round(float(y_vals[i]), 2),
                "trend_fit": round(float(y_pred[i]), 2),
            }
        )

    # Future forecast
    future_X = np.arange(n, n + forecast_periods).reshape(-1, 1)
    future_pred = model.predict(future_X)

    forecast = []
    conf_upper = []
    conf_lower = []

    for idx, x_f in enumerate(future_X.flatten()):
        pred_val = float(future_pred[idx])
        # Prediction interval estimate (1.96 * s_err * sqrt(1 + 1/n + (x_f - x_mean)^2 / ss_x))
        margin = 1.96 * s_err * np.sqrt(1 + (1.0 / n) + ((x_f - x_mean) ** 2 / ss_x))
        upper = round(float(pred_val + margin), 2)
        lower = round(float(pred_val - margin), 2)
        pred_rounded = round(pred_val, 2)

        step_name = f"+{idx + 1}"
        forecast.append(
            {
                "step": step_name,
                "forecast": pred_rounded,
                "lower": lower,
                "upper": upper,
            }
        )
        conf_upper.append(upper)
        conf_lower.append(lower)

    return {
        "target_column": target_col,
        "historical": historical,
        "forecast": forecast,
        "confidence_upper": conf_upper,
        "confidence_lower": conf_lower,
        "r_squared": round(r_squared, 4),
        "trend": trend,
        "slope": round(slope, 4),
        "sample_size": n,
    }
