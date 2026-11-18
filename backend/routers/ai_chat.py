"""DataSense AI - AI Chat and Smart Column Detection Router.

Facilitates conversational natural language Q&A over dataset contents using
Google Gemini AI and semantic column type auto-detection.
"""

from __future__ import annotations

from datetime import datetime
import json
import logging
from typing import Any, Dict, List, Optional
from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel, Field
from routers.upload import get_dataset_path
from services import ai_service, data_processor

logger = logging.getLogger("datasense.ai_chat")

router = APIRouter()


class ChatMessage(BaseModel):
    role: str = Field(..., description="Role: 'user' or 'model'")
    content: str = Field(..., description="Message text")


class ChatRequest(BaseModel):
    dataset_id: str = Field(..., description="ID of the uploaded dataset")
    message: str = Field(..., description="User query / question")
    history: List[ChatMessage] = Field(default_factory=list, description="Prior conversation messages")
    language: Optional[str] = Field(default="en", description="Output language: 'en' or 'hi'/'hinglish'")


class ChatResponse(BaseModel):
    response: str
    timestamp: str
    dataset_id: str


class SmartDetectRequest(BaseModel):
    dataset_id: str = Field(..., description="ID of the dataset to analyze")


class SmartDetectResponse(BaseModel):
    dataset_id: str
    columns: Dict[str, Dict[str, str]]


def _prepare_dataset_context(df) -> str:
    """Construct a rich, compact context string representing the dataset for LLM ingestion."""
    num_rows = len(df)
    num_cols = len(df.columns)

    col_details = []
    sample_rows = df.head(5).to_dict(orient="records")

    for col in df.columns:
        s = df[col]
        dtype = str(s.dtype)
        nulls = int(s.isna().sum())
        nunique = int(s.nunique(dropna=True))
        if pd_is_num := (s.dtype.kind in "biufc"):
            clean_s = s.dropna()
            mean_v = round(float(clean_s.mean()), 2) if len(clean_s) > 0 else "N/A"
            min_v = round(float(clean_s.min()), 2) if len(clean_s) > 0 else "N/A"
            max_v = round(float(clean_s.max()), 2) if len(clean_s) > 0 else "N/A"
            col_details.append(
                f"- {col} (numeric: {dtype}) | nulls: {nulls} | unique: {nunique} | min: {min_v}, max: {max_v}, mean: {mean_v}"
            )
        else:
            top_vals = [str(x) for x in s.dropna().unique()[:4]]
            col_details.append(
                f"- {col} (categorical/text: {dtype}) | nulls: {nulls} | unique: {nunique} | samples: {top_vals}"
            )

    context = (
        f"DATASET PROFILE:\n"
        f"Total Rows: {num_rows:,} | Total Columns: {num_cols}\n\n"
        f"FEATURE BREAKDOWN:\n" + "\n".join(col_details) + "\n\n"
        f"TOP 5 SAMPLE ROWS (JSON):\n" + json.dumps(sample_rows, default=str, indent=2)
    )
    return context


@router.post("/chat", response_model=ChatResponse)
async def chat_with_dataset(payload: ChatRequest):
    """Interact conversationally with the dataset through Gemini AI."""
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

    context = _prepare_dataset_context(df)
    history_dicts = [{"role": msg.role, "content": msg.content} for msg in payload.history]

    reply_text = await ai_service.chat_with_data(
        message=payload.message,
        df_context=context,
        history=history_dicts,
        language=payload.language or "en",
    )

    now_str = datetime.utcnow().isoformat() + "Z"

    return ChatResponse(
        response=reply_text,
        timestamp=now_str,
        dataset_id=payload.dataset_id,
    )


@router.post("/analyze/smart-detect", response_model=SmartDetectResponse)
@router.post("/chat/smart-detect", response_model=SmartDetectResponse, include_in_schema=False)
async def smart_detect_columns(payload: SmartDetectRequest):
    """Detect semantic column classifications and descriptions using AI reasoning."""
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

    column_names = [str(c) for c in df.columns]
    sample_values = {}
    for col in df.columns:
        samples = df[col].dropna().head(5).tolist()
        sample_values[str(col)] = [str(s) for s in samples]

    detected = await ai_service.smart_column_detector(
        column_names=column_names, sample_values=sample_values
    )

    return SmartDetectResponse(
        dataset_id=payload.dataset_id,
        columns=detected,
    )
