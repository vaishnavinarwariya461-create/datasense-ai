"""DataSense AI - PDF Report Generation and Download Router.

Renders publication-ready PDF intelligence dossiers with ReportLab,
incorporating Matplotlib data visualizations, DataSense Score telemetry,
executive narratives, and statistical appendix tables.
"""

from __future__ import annotations

from datetime import datetime
import json
import logging
import os
from typing import Any, Dict, List, Optional
import uuid
import aiofiles
from fastapi import APIRouter, HTTPException, Query, status
from fastapi.responses import FileResponse
import matplotlib
matplotlib.use("Agg")  # Non-interactive headless backend
import matplotlib.pyplot as plt
import numpy as np
import pandas as pd
from pydantic import BaseModel, Field
from reportlab.lib import colors
from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.platypus import (
    HRFlowable,
    Image,
    KeepTogether,
    PageBreak,
    Paragraph,
    SimpleDocTemplate,
    Spacer,
    Table,
    TableStyle,
)
from routers.upload import get_dataset_path
from services import ai_service, data_processor

logger = logging.getLogger("datasense.reports")

router = APIRouter()

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
REPORTS_DIR = os.path.join(BASE_DIR, "reports")


class ReportGenerateRequest(BaseModel):
    dataset_id: str = Field(..., description="UUID of dataset to generate report for")
    report_type: str = Field(
        default="executive",
        description="Type of report: 'executive', 'technical', or 'story'",
    )
    include_charts: bool = Field(
        default=True,
        description="Whether to render and embed matplotlib visualizations in PDF",
    )


class ReportItemResponse(BaseModel):
    report_id: str
    dataset_id: str
    report_type: str
    filename: str
    download_url: str
    created_at: str
    file_size_bytes: int


def _generate_report_charts(df: pd.DataFrame, report_id: str) -> List[str]:
    """Render analytical charts with Matplotlib and save PNGs for PDF insertion."""
    image_paths = []
    numeric_cols = df.select_dtypes(include=[np.number]).columns.tolist()
    categorical_cols = df.select_dtypes(exclude=[np.number]).columns.tolist()

    plt.style.use("seaborn-v0_8-whitegrid" if "seaborn-v0_8-whitegrid" in plt.style.available else "default")

    # Chart 1: Numeric Feature Distribution Histogram
    if numeric_cols:
        col = numeric_cols[0]
        s = df[col].dropna()
        if len(s) > 2:
            fig, ax = plt.subplots(figsize=(6.5, 3.2), dpi=200)
            ax.hist(s, bins=15, color="#3B82F6", edgecolor="#1D4ED8", alpha=0.85)
            ax.set_title(f"Distribution Profile: {col}", fontsize=11, fontweight="bold", pad=8)
            ax.set_xlabel(col, fontsize=9)
            ax.set_ylabel("Frequency", fontsize=9)
            ax.grid(True, linestyle="--", alpha=0.5)
            plt.tight_layout()
            chart_path = os.path.join(REPORTS_DIR, f"{report_id}_chart1.png")
            fig.savefig(chart_path, format="png")
            plt.close(fig)
            image_paths.append(chart_path)

    # Chart 2: Categorical Frequency Bar Chart
    if categorical_cols:
        cat_col = categorical_cols[0]
        val_counts = df[cat_col].value_counts().head(6)
        if len(val_counts) > 1:
            fig, ax = plt.subplots(figsize=(6.5, 3.2), dpi=200)
            colors_list = ["#6366F1", "#3B82F6", "#06B6D4", "#10B981", "#F59E0B", "#EC4899"]
            ax.barh(
                [str(idx)[:20] for idx in val_counts.index[::-1]],
                val_counts.values[::-1],
                color=colors_list[: len(val_counts)],
                alpha=0.9,
            )
            ax.set_title(f"Category Breakdown: {cat_col}", fontsize=11, fontweight="bold", pad=8)
            ax.set_xlabel("Count", fontsize=9)
            ax.grid(True, linestyle="--", alpha=0.5)
            plt.tight_layout()
            chart_path = os.path.join(REPORTS_DIR, f"{report_id}_chart2.png")
            fig.savefig(chart_path, format="png")
            plt.close(fig)
            image_paths.append(chart_path)

    # Chart 3: Correlation Heatmap or Scatter Plot
    if len(numeric_cols) >= 2:
        c1, c2 = numeric_cols[0], numeric_cols[1]
        pair_df = df[[c1, c2]].dropna()
        if len(pair_df) > 3:
            fig, ax = plt.subplots(figsize=(6.5, 3.2), dpi=200)
            ax.scatter(pair_df[c1], pair_df[c2], color="#0EA5E9", alpha=0.6, edgecolors="none")
            ax.set_title(f"Cross-Metric Correlation: {c2} vs {c1}", fontsize=11, fontweight="bold", pad=8)
            ax.set_xlabel(c1, fontsize=9)
            ax.set_ylabel(c2, fontsize=9)
            ax.grid(True, linestyle="--", alpha=0.5)
            plt.tight_layout()
            chart_path = os.path.join(REPORTS_DIR, f"{report_id}_chart3.png")
            fig.savefig(chart_path, format="png")
            plt.close(fig)
            image_paths.append(chart_path)

    return image_paths


def _build_pdf(
    pdf_path: str,
    dataset_id: str,
    report_type: str,
    basic_stats: dict,
    column_stats: list,
    score: dict,
    insights: list,
    narrative: str,
    chart_paths: list,
):
    """Compile the complete PDF document using ReportLab Platypus."""
    doc = SimpleDocTemplate(
        pdf_path,
        pagesize=letter,
        leftMargin=40,
        rightMargin=40,
        topMargin=40,
        bottomMargin=40,
    )

    styles = getSampleStyleSheet()

    # Custom styles
    primary_color = colors.HexColor("#0F172A")
    secondary_color = colors.HexColor("#2563EB")
    accent_color = colors.HexColor("#10B981")
    text_color = colors.HexColor("#334155")
    card_bg = colors.HexColor("#F8FAFC")

    title_style = ParagraphStyle(
        "CoverTitle",
        parent=styles["Heading1"],
        fontName="Helvetica-Bold",
        fontSize=24,
        leading=28,
        textColor=primary_color,
        alignment=0,
    )

    subtitle_style = ParagraphStyle(
        "CoverSubtitle",
        parent=styles["Normal"],
        fontName="Helvetica",
        fontSize=12,
        leading=16,
        textColor=secondary_color,
    )

    section_heading = ParagraphStyle(
        "SectionHeading",
        parent=styles["Heading2"],
        fontName="Helvetica-Bold",
        fontSize=14,
        leading=18,
        textColor=primary_color,
        spaceBefore=14,
        spaceAfter=6,
    )

    body_style = ParagraphStyle(
        "ReportBody",
        parent=styles["Normal"],
        fontName="Helvetica",
        fontSize=9.5,
        leading=14,
        textColor=text_color,
    )

    bold_body = ParagraphStyle(
        "BoldBody",
        parent=body_style,
        fontName="Helvetica-Bold",
    )

    story = []

    # 1. Header / Cover Banner
    story.append(Paragraph("DATASENSE AI", subtitle_style))
    story.append(Spacer(1, 4))
    story.append(
        Paragraph(
            f"Intelligent Dataset Audit & Analytics Dossier — {report_type.upper()}",
            title_style,
        )
    )
    story.append(Spacer(1, 6))

    now_readable = datetime.utcnow().strftime("%B %d, %Y - %H:%M UTC")
    meta_text = (
        f"<b>Dataset ID:</b> {dataset_id} &nbsp;|&nbsp; "
        f"<b>Generated:</b> {now_readable} &nbsp;|&nbsp; "
        f"<b>Engine:</b> DataSense AI Core + Google Gemini"
    )
    story.append(Paragraph(meta_text, body_style))
    story.append(Spacer(1, 10))
    story.append(HRFlowable(width="100%", thickness=1.5, color=secondary_color, spaceAfter=14))

    # 2. Executive Summary / Story Narrative
    story.append(Paragraph("Executive Narrative", section_heading))
    narrative_paras = narrative.split("\n\n")
    for np_text in narrative_paras:
        if np_text.strip():
            story.append(Paragraph(np_text.strip(), body_style))
            story.append(Spacer(1, 6))

    story.append(Spacer(1, 8))

    # 3. DataSense Score & Health Telemetry
    story.append(Paragraph("DataSense Quality Scorecard", section_heading))
    score_val = score.get("overall", 0.0)
    score_grade = score.get("grade", "N/A")
    score_rating = score.get("rating", "N/A")

    score_data = [
        [
            Paragraph("<b>Overall Score</b>", bold_body),
            Paragraph(f"<b>{score_val}/100</b> ({score_grade} - {score_rating})", bold_body),
            Paragraph("<b>Completeness</b>", bold_body),
            Paragraph(f"{score.get('completeness', 0)}%", body_style),
        ],
        [
            Paragraph("<b>Uniqueness</b>", bold_body),
            Paragraph(f"{score.get('uniqueness', 0)}%", body_style),
            Paragraph("<b>Consistency</b>", bold_body),
            Paragraph(f"{score.get('consistency', 0)}%", body_style),
        ],
        [
            Paragraph("<b>Validity</b>", bold_body),
            Paragraph(f"{score.get('validity', 0)}%", body_style),
            Paragraph("<b>Memory Footprint</b>", bold_body),
            Paragraph(f"{basic_stats.get('memory_usage', 'N/A')}", body_style),
        ],
    ]

    score_table = Table(score_data, colWidths=[120, 140, 120, 140])
    score_table.setStyle(
        TableStyle(
            [
                ("BACKGROUND", (0, 0), (-1, -1), card_bg),
                ("BOX", (0, 0), (-1, -1), 1, colors.HexColor("#CBD5E1")),
                ("INNERGRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#E2E8F0")),
                ("TOPPADDING", (0, 0), (-1, -1), 6),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
                ("LEFTPADDING", (0, 0), (-1, -1), 8),
                ("RIGHTPADDING", (0, 0), (-1, -1), 8),
            ]
        )
    )
    story.append(score_table)
    story.append(Spacer(1, 12))

    # 4. Key Metrics Table
    story.append(Paragraph("Dataset Dimension Metrics", section_heading))
    metrics_data = [
        [
            Paragraph("<b>Metric</b>", bold_body),
            Paragraph("<b>Value</b>", bold_body),
            Paragraph("<b>Metric</b>", bold_body),
            Paragraph("<b>Value</b>", bold_body),
        ],
        [
            Paragraph("Total Rows", body_style),
            Paragraph(f"{basic_stats.get('num_rows', 0):,}", body_style),
            Paragraph("Total Columns", body_style),
            Paragraph(f"{basic_stats.get('num_cols', 0)}", body_style),
        ],
        [
            Paragraph("Numeric Columns", body_style),
            Paragraph(f"{basic_stats.get('num_numeric_cols', 0)}", body_style),
            Paragraph("Categorical Columns", body_style),
            Paragraph(f"{basic_stats.get('num_categorical_cols', 0)}", body_style),
        ],
        [
            Paragraph("Missing Values", body_style),
            Paragraph(
                f"{basic_stats.get('missing_values', {}).get('count', 0):,} ({basic_stats.get('missing_values', {}).get('percent', 0)}%)",
                body_style,
            ),
            Paragraph("Duplicate Rows", body_style),
            Paragraph(
                f"{basic_stats.get('duplicate_rows', 0):,} ({basic_stats.get('duplicate_percent', 0)}%)",
                body_style,
            ),
        ],
    ]

    metrics_table = Table(metrics_data, colWidths=[130, 130, 130, 130])
    metrics_table.setStyle(
        TableStyle(
            [
                ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#1E293B")),
                ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
                ("BOX", (0, 0), (-1, -1), 1, colors.HexColor("#CBD5E1")),
                ("INNERGRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#E2E8F0")),
                ("TOPPADDING", (0, 0), (-1, -1), 5),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 5),
                ("LEFTPADDING", (0, 0), (-1, -1), 8),
            ]
        )
    )
    story.append(metrics_table)
    story.append(Spacer(1, 12))

    # 5. AI Insights Section
    story.append(Paragraph("AI-Generated Insights", section_heading))
    for idx, insight in enumerate(insights[:5], 1):
        itype = insight.get("type", "info").upper()
        badge_color = (
            "#DC2626" if itype == "WARNING" else ("#16A34A" if itype == "SUCCESS" else "#2563EB")
        )
        title_p = Paragraph(
            f"<font color='{badge_color}'><b>[{itype}]</b></font> <b>{insight.get('title', '')}</b>",
            bold_body,
        )
        desc_p = Paragraph(insight.get("description", ""), body_style)

        card = Table([[title_p], [desc_p]], colWidths=[520])
        card.setStyle(
            TableStyle(
                [
                    ("BACKGROUND", (0, 0), (-1, -1), card_bg),
                    ("BOX", (0, 0), (-1, -1), 1, colors.HexColor("#E2E8F0")),
                    ("TOPPADDING", (0, 0), (-1, -1), 4),
                    ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
                    ("LEFTPADDING", (0, 0), (-1, -1), 8),
                    ("RIGHTPADDING", (0, 0), (-1, -1), 8),
                ]
            )
        )
        story.append(card)
        story.append(Spacer(1, 4))

    # 6. Charts Section (if provided)
    if chart_paths:
        story.append(PageBreak())
        story.append(Paragraph("Visual Analytics Showcase", section_heading))
        story.append(
            Paragraph(
                "High-resolution exploratory data visualizations generated from feature distributions and correlation patterns.",
                body_style,
            )
        )
        story.append(Spacer(1, 8))

        for cpath in chart_paths:
            if os.path.exists(cpath):
                story.append(Image(cpath, width=500, height=230))
                story.append(Spacer(1, 10))

    # 7. Appendix: Full Column Stats Table
    story.append(PageBreak())
    story.append(Paragraph("Appendix: Comprehensive Column Statistics", section_heading))

    headers = [
        Paragraph("<b>Column Name</b>", bold_body),
        Paragraph("<b>Type</b>", bold_body),
        Paragraph("<b>Nulls (%)</b>", bold_body),
        Paragraph("<b>Unique</b>", bold_body),
        Paragraph("<b>Mean / Top Value</b>", bold_body),
    ]
    col_rows = [headers]

    for c in column_stats:
        c_name = str(c.get("name", ""))[:20]
        c_type = str(c.get("dtype", ""))[:10]
        null_str = f"{c.get('null_count', 0)} ({c.get('null_percent', 0)}%)"
        unique_str = str(c.get("unique_count", 0))

        if c.get("is_numeric") and c.get("mean") is not None:
            detail_str = f"Mean: {c.get('mean')} [Min:{c.get('min')}, Max:{c.get('max')}]"
        else:
            top_vals = c.get("top_values", [])
            if top_vals:
                detail_str = f"Top: {top_vals[0].get('value')} ({top_vals[0].get('count')})"
            else:
                detail_str = "N/A"

        col_rows.append(
            [
                Paragraph(c_name, body_style),
                Paragraph(c_type, body_style),
                Paragraph(null_str, body_style),
                Paragraph(unique_str, body_style),
                Paragraph(detail_str[:40], body_style),
            ]
        )

    appendix_table = Table(col_rows, colWidths=[110, 70, 90, 60, 190])
    appendix_table.setStyle(
        TableStyle(
            [
                ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#1E293B")),
                ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
                ("BOX", (0, 0), (-1, -1), 1, colors.HexColor("#CBD5E1")),
                ("INNERGRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#E2E8F0")),
                ("TOPPADDING", (0, 0), (-1, -1), 4),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
                ("LEFTPADDING", (0, 0), (-1, -1), 5),
            ]
        )
    )
    story.append(appendix_table)

    doc.build(story)


@router.post("/reports/generate", response_model=ReportItemResponse)
async def generate_report(payload: ReportGenerateRequest):
    """Generate an automated PDF analytical report with ReportLab."""
    path = get_dataset_path(payload.dataset_id)
    if not path:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Dataset with ID '{payload.dataset_id}' not found.",
        )

    try:
        df = data_processor.load_dataset(path)
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=f"Unable to read dataset: {str(exc)}",
        )

    os.makedirs(REPORTS_DIR, exist_ok=True)
    report_id = str(uuid.uuid4())
    pdf_filename = f"{report_id}.pdf"
    pdf_path = os.path.join(REPORTS_DIR, pdf_filename)

    # Compute telemetry
    basic_stats = data_processor.get_basic_stats(df)
    column_stats = data_processor.get_column_stats(df)
    score = data_processor.calculate_datasense_score(df)
    insights = await ai_service.generate_insights(basic_stats, column_stats)
    narrative = await ai_service.generate_narrative(basic_stats, insights)

    # Generate charts if requested
    chart_paths = []
    if payload.include_charts:
        try:
            chart_paths = _generate_report_charts(df, report_id)
        except Exception as exc:
            logger.warning("Error generating chart PNGs: %s", exc)

    # Build the document
    try:
        _build_pdf(
            pdf_path=pdf_path,
            dataset_id=payload.dataset_id,
            report_type=payload.report_type,
            basic_stats=basic_stats,
            column_stats=column_stats,
            score=score,
            insights=insights,
            narrative=narrative,
            chart_paths=chart_paths,
        )
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to generate PDF document: {str(exc)}",
        )
    finally:
        # Clean up temporary chart images
        for cp in chart_paths:
            if os.path.exists(cp):
                try:
                    os.remove(cp)
                except Exception:
                    pass

    file_size = os.path.getsize(pdf_path) if os.path.exists(pdf_path) else 0
    now_str = datetime.utcnow().isoformat() + "Z"

    report_meta = {
        "report_id": report_id,
        "dataset_id": payload.dataset_id,
        "report_type": payload.report_type,
        "filename": pdf_filename,
        "download_url": f"/api/reports/{report_id}/download",
        "created_at": now_str,
        "file_size_bytes": file_size,
    }

    # Save meta json
    meta_path = os.path.join(REPORTS_DIR, f"{report_id}_meta.json")
    try:
        async with aiofiles.open(meta_path, "w", encoding="utf-8") as f:
            await f.write(json.dumps(report_meta, indent=2))
    except Exception as exc:
        logger.warning("Error saving report metadata: %s", exc)

    return ReportItemResponse(**report_meta)


@router.get("/reports/{report_id}/download")
async def download_report(report_id: str):
    """Stream generated PDF report for direct client download."""
    pdf_path = os.path.join(REPORTS_DIR, f"{report_id}.pdf")
    if not os.path.exists(pdf_path):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Report with ID '{report_id}' not found.",
        )

    return FileResponse(
        path=pdf_path,
        media_type="application/pdf",
        filename=f"DataSense_Report_{report_id[:8]}.pdf",
    )


@router.get("/reports", response_model=List[ReportItemResponse])
async def list_reports():
    """Retrieve list of all generated PDF intelligence reports."""
    if not os.path.exists(REPORTS_DIR):
        return []

    reports = []
    meta_files = [f for f in os.listdir(REPORTS_DIR) if f.endswith("_meta.json")]

    for mfile in meta_files:
        path = os.path.join(REPORTS_DIR, mfile)
        try:
            async with aiofiles.open(path, "r", encoding="utf-8") as f:
                data = json.loads(await f.read())
                pdf_path = os.path.join(REPORTS_DIR, data.get("filename", ""))
                if os.path.exists(pdf_path):
                    reports.append(ReportItemResponse(**data))
        except Exception as exc:
            logger.warning("Error loading report metadata %s: %s", mfile, exc)

    reports.sort(key=lambda r: r.created_at, reverse=True)
    return reports
