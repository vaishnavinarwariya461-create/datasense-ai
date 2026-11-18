"""Integration and Unit Test Suite for Advanced Backend Features in DataSense AI.

Tests:
1. cleaner_service (scan_issues, fix_all, fix_missing, fix_duplicates, fix_whitespace, fix_types)
2. pivot_service (generate_pivot, get_template_pivot, list_pivot_templates)
3. template_service (all 16 templates data generation and metadata)
4. ai_service (Hinglish support, compare_datasets, analyze_whatif, suggest_chart_insights)
5. FastAPI endpoints via TestClient for cleaner, pivot, templates, compare, whatif routers
"""

import sys
import os
import asyncio
import pandas as pd
import numpy as np

# Ensure backend root is on PYTHONPATH
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
if BASE_DIR not in sys.path:
    sys.path.insert(0, BASE_DIR)

from services import cleaner_service, pivot_service, template_service, ai_service
from main import app
from fastapi.testclient import TestClient

client = TestClient(app)


def test_cleaner_service():
    print("--- Testing cleaner_service ---")
    raw_data = {
        "Name": [" Alice ", "Bob", "Charlie  ", "Alice ", "Eve"],
        "Age": [25, 30, np.nan, 25, 150],  # NaN and Outlier (150)
        "Salary": ["$50,000", "$60,000", "$75,000", "$50,000", "$90,000"],  # Numeric as string
        "JoinDate": ["2022-01-01", "2021-06-15", "2020-09-10", "2022-01-01", "2023-03-20"],
    }
    df = pd.DataFrame(raw_data)
    # Add an exact duplicate row
    df = pd.concat([df, df.iloc[[0]]], ignore_index=True)

    issues = cleaner_service.scan_issues(df)
    assert issues["total_issues"] > 0, "Should detect issues"
    assert issues["missing_values"]["count"] == 1, "Should detect 1 missing value"
    assert issues["duplicates"]["count"] >= 1, "Should detect duplicate row"
    assert issues["whitespace"]["count"] >= 1, "Should detect whitespace issues"
    assert issues["type_issues"]["count"] >= 1, "Should detect type issues in Salary"
    assert issues["quality_score_before"] <= 100, "Quality score should be <= 100"
    print(f"Scan passed! Total issues: {issues['total_issues']}, Score Before: {issues['quality_score_before']}")

    clean_df, report = cleaner_service.fix_all(df, {
        "fix_missing": True,
        "missing_strategy": "mean",
        "fix_duplicates": True,
        "fix_whitespace": True,
        "fix_types": True,
    })

    assert len(report["steps"]) == 4, "Should have 4 cleaning steps"
    assert clean_df.isna().sum().sum() == 0, "No missing values after fix"
    assert clean_df.duplicated().sum() == 0, "No duplicates after fix"
    print("Fix all passed! Steps executed:", [s["step"] for s in report["steps"]])


def test_pivot_service():
    print("\n--- Testing pivot_service ---")
    df = pd.DataFrame({
        "Region": ["North", "North", "South", "South", "East"],
        "Category": ["Electronics", "Clothing", "Electronics", "Clothing", "Electronics"],
        "Revenue": [100.0, 50.0, 200.0, 80.0, 150.0],
    })

    pivot = pivot_service.generate_pivot(
        df=df,
        rows=["Region"],
        columns=["Category"],
        values=["Revenue"],
        aggfunc="sum",
    )
    assert "headers" in pivot and "rows" in pivot and "totals" in pivot
    assert len(pivot["rows"]) >= 3, "Rows should contain regions"
    assert pivot["grand_total"] == 580.0, f"Grand total should be 580.0, got {pivot['grand_total']}"
    print(f"generate_pivot passed! Grand total: {pivot['grand_total']}, Headers: {pivot['headers']}")

    # Test template pivots
    for t_name in ["sales_by_region", "revenue_by_category", "hr_headcount", "loan_by_status"]:
        tpl_pivot = pivot_service.get_template_pivot(t_name, df)
        assert "rows" in tpl_pivot and "headers" in tpl_pivot
    print("Template pivots passed!")


def test_template_service():
    print("\n--- Testing template_service ---")
    templates = template_service.get_template_info()
    assert len(templates) == 16, f"Expected 16 templates, got {len(templates)}"

    for t in templates:
        t_id = t["id"]
        df = template_service.generate_template_data(t_id, rows=50)
        assert len(df) == 50, f"Template {t_id} should have 50 rows, got {len(df)}"
        # Verify specified columns exist
        expected_cols = t["columns"]
        for c in expected_cols:
            assert c in df.columns, f"Column {c} missing in template {t_id}"
    print("All 16 templates generated and verified successfully!")


async def test_ai_service():
    print("\n--- Testing ai_service ---")
    # 1. Compare datasets
    d1 = {"num_rows": 500, "num_cols": 8, "missing_values": {"percent": 2.0}, "duplicate_rows": 0}
    d2 = {"num_rows": 450, "num_cols": 8, "missing_values": {"percent": 8.0}, "duplicate_rows": 5}
    comp_en = await ai_service.compare_datasets(d1, d2, "Sales_2023", "Sales_2024", language="en")
    assert "quality_winner" in comp_en and len(comp_en["key_differences"]) > 0
    assert "Sales_2023" in comp_en["quality_winner"]

    comp_hi = await ai_service.compare_datasets(d1, d2, "Sales_2023", "Sales_2024", language="hi")
    assert "Sales_2023" in comp_hi["quality_winner"]
    print("compare_datasets (EN & Hinglish) passed!")

    # 2. Analyze What-if
    whatif_res = await ai_service.analyze_whatif(
        original_stats={"Revenue": {"mean": 1000.0, "sum": 50000.0}},
        modified_stats={"Revenue": {"mean": 1200.0, "sum": 60000.0}},
        changes={"Revenue": 1.2},
        language="hi"
    )
    assert len(whatif_res) > 30
    print("analyze_whatif passed!")

    # 3. Suggest Chart Insights
    chart_insight = await ai_service.suggest_chart_insights(
        chart_type="Bar",
        chart_data=[{"Region": "North", "Revenue": 5000}, {"Region": "South", "Revenue": 12000}],
        x_col="Region",
        y_col="Revenue",
        language="hi"
    )
    assert len(chart_insight) > 10
    print("suggest_chart_insights passed!")

    # 4. Chat with data (Hinglish detection)
    chat_resp = await ai_service.chat_with_data(
        message="is dataset me kitne column hain batao",
        df_context="Dataset has 500 rows and 8 columns.",
        history=[],
        language="hi"
    )
    assert len(chat_resp) > 10
    print("chat_with_data Hinglish passed!")


def test_api_endpoints():
    print("\n--- Testing FastAPI Endpoints ---")
    # 1. Templates catalog
    res = client.get("/api/templates")
    assert res.status_code == 200, res.text
    data = res.json()
    assert len(data["templates"]) == 16

    # 2. Template details
    res = client.get("/api/templates/sales_dashboard")
    assert res.status_code == 200

    # 3. Template download
    res = client.get("/api/templates/sales_dashboard/download?rows=25")
    assert res.status_code == 200
    assert "attachment;" in res.headers.get("content-disposition", "")
    assert len(res.content) > 100

    # 4. Template load (creates dataset in storage)
    res = client.post("/api/templates/sales_dashboard/load", json={"rows": 100})
    assert res.status_code == 201, res.text
    ds_data = res.json()
    dataset_id_1 = ds_data["dataset_id"]
    print("Loaded template dataset 1:", dataset_id_1)

    # Load a second dataset for comparison
    res = client.post("/api/templates/ecommerce_store/load", json={"rows": 100})
    assert res.status_code == 201
    dataset_id_2 = res.json()["dataset_id"]
    print("Loaded template dataset 2:", dataset_id_2)

    # 5. Clean Scan
    res = client.post("/api/clean/scan", json={"dataset_id": dataset_id_1})
    assert res.status_code == 200, res.text
    scan_json = res.json()
    assert "quality_score_before" in scan_json
    print("Clean scan endpoint passed!")

    # 6. Clean Preview
    res = client.get(f"/api/clean/{dataset_id_1}/preview")
    assert res.status_code == 200, res.text
    prev_json = res.json()
    assert len(prev_json["rows"]) > 0
    print("Clean preview endpoint passed!")

    # 7. Clean Fix
    res = client.post("/api/clean/fix", json={
        "dataset_id": dataset_id_1,
        "options": {
            "fix_missing": True,
            "missing_strategy": "mean",
            "fix_duplicates": True,
            "fix_whitespace": True,
            "fix_types": True,
        }
    })
    assert res.status_code == 200, res.text
    fix_json = res.json()
    assert "new_dataset_id" in fix_json
    cleaned_id = fix_json["new_dataset_id"]
    print("Clean fix endpoint passed! New cleaned dataset ID:", cleaned_id)

    # 8. Pivot Generate
    res = client.post("/api/pivot/generate", json={
        "dataset_id": dataset_id_1,
        "rows": ["Region"],
        "columns": ["Category"],
        "values": ["Revenue"],
        "aggfunc": "sum",
    })
    assert res.status_code == 200, res.text
    p_json = res.json()
    assert "grand_total" in p_json
    print("Pivot generate endpoint passed! Grand total:", p_json["grand_total"])

    # 9. Pivot Templates
    res = client.get("/api/pivot/templates")
    assert res.status_code == 200
    assert len(res.json()["templates"]) >= 4

    # 10. Pivot Template Apply
    res = client.post("/api/pivot/template/sales_by_region", json={"dataset_id": dataset_id_1})
    assert res.status_code == 200, res.text
    print("Pivot template application passed!")

    # 11. Compare Datasets
    res = client.post("/api/compare", json={
        "dataset_id_a": dataset_id_1,
        "dataset_id_b": dataset_id_2,
        "language": "hi",
    })
    assert res.status_code == 200, res.text
    comp_json = res.json()
    assert "overview_table" in comp_json
    assert "winner" in comp_json
    print("Compare endpoint passed! Winner:", comp_json["winner"])

    # 12. What-If Simulate
    res = client.post("/api/whatif/simulate", json={
        "dataset_id": dataset_id_1,
        "scenarios": [
            {"column": "Revenue", "multiplier": 1.25},
            {"column": "Units_Sold", "multiplier": 1.10},
        ],
    })
    assert res.status_code == 200, res.text
    whatif_sim = res.json()
    assert len(whatif_sim["impact_summary"]) == 2
    print("What-If simulate endpoint passed!")

    # 13. What-If AI Analysis
    res = client.post("/api/whatif/ai-analysis", json={
        "dataset_id": dataset_id_1,
        "original_stats": whatif_sim["original_stats"],
        "modified_stats": whatif_sim["modified_stats"],
        "changes": {"Revenue": 1.25, "Units_Sold": 1.10},
        "language": "hi",
    })
    assert res.status_code == 200, res.text
    whatif_ai = res.json()
    assert "analysis" in whatif_ai and "recommendation" in whatif_ai
    print("What-If AI analysis endpoint passed!")


def main():
    test_cleaner_service()
    test_pivot_service()
    test_template_service()
    asyncio.run(test_ai_service())
    test_api_endpoints()
    print("\n==========================================")
    print("ALL TESTS PASSED SUCCESSFULLY! 100% HEALTHY")
    print("==========================================")


if __name__ == "__main__":
    main()
