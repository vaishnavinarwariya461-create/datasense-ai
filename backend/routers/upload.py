"""DataSense AI - File Upload and Dataset Management Router.

Handles file validation, multipart uploads, dataset storage, metadata indexing,
and dataset lifecycle management.
"""

from __future__ import annotations

from datetime import datetime
import json
import logging
import os
from typing import Any, Dict, List, Optional
import uuid
import aiofiles
from fastapi import APIRouter, File, HTTPException, UploadFile, status
from pydantic import BaseModel
from services.data_processor import load_dataset

logger = logging.getLogger("datasense.upload")

router = APIRouter()

# Base directories
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
UPLOADS_DIR = os.path.join(BASE_DIR, "uploads")
MAX_FILE_SIZE_MB = int(os.getenv("MAX_FILE_SIZE_MB", "50"))
ALLOWED_EXTENSIONS = {".csv", ".xlsx", ".xls", ".json"}


class DatasetInfoResponse(BaseModel):
    dataset_id: str
    filename: str
    original_name: str
    num_rows: int
    num_cols: int
    columns: List[str]
    file_type: str
    file_size_bytes: int
    uploaded_at: str


class DeleteResponse(BaseModel):
    success: bool
    message: str
    dataset_id: str


def get_dataset_path(dataset_id: str) -> Optional[str]:
    """Find the full file path for a dataset by its UUID."""
    if not os.path.exists(UPLOADS_DIR):
        return None
    for fname in os.listdir(UPLOADS_DIR):
        if fname.startswith(f"{dataset_id}.") and not fname.endswith("_meta.json"):
            return os.path.join(UPLOADS_DIR, fname)
    return None


def get_meta_path(dataset_id: str) -> str:
    """Get metadata JSON path for a dataset UUID."""
    return os.path.join(UPLOADS_DIR, f"{dataset_id}_meta.json")


@router.post("/upload", response_model=DatasetInfoResponse, status_code=status.HTTP_201_CREATED)
async def upload_dataset(file: UploadFile = File(...)):
    """Upload and parse a new dataset (CSV, Excel, JSON).

    Validates file extension, size limit, loads with pandas to guarantee integrity,
    and stores dataset metadata.
    """
    if not file.filename:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No filename provided in upload payload.",
        )

    ext = os.path.splitext(file.filename)[1].lower()
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Unsupported file extension '{ext}'. Supported formats: {', '.join(ALLOWED_EXTENSIONS)}",
        )

    os.makedirs(UPLOADS_DIR, exist_ok=True)
    dataset_id = str(uuid.uuid4())
    saved_filename = f"{dataset_id}{ext}"
    dest_path = os.path.join(UPLOADS_DIR, saved_filename)

    # Read content and enforce size limit
    max_bytes = MAX_FILE_SIZE_MB * 1024 * 1024
    total_size = 0

    try:
        async with aiofiles.open(dest_path, "wb") as out_file:
            while chunk := await file.read(1024 * 1024):  # 1MB chunk
                total_size += len(chunk)
                if total_size > max_bytes:
                    await out_file.close()
                    if os.path.exists(dest_path):
                        os.remove(dest_path)
                    raise HTTPException(
                        status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
                        detail=f"File exceeds maximum allowed size of {MAX_FILE_SIZE_MB} MB.",
                    )
                await out_file.write(chunk)
    except HTTPException:
        raise
    except Exception as exc:
        if os.path.exists(dest_path):
            os.remove(dest_path)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to write uploaded file to disk: {str(exc)}",
        )

    # Validate dataset parseability with Pandas
    try:
        df = load_dataset(dest_path)
    except Exception as exc:
        if os.path.exists(dest_path):
            os.remove(dest_path)
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=f"Failed to parse file into a valid dataset: {str(exc)}",
        )

    num_rows = int(len(df))
    num_cols = int(len(df.columns))
    columns = [str(col) for col in df.columns]
    now_str = datetime.utcnow().isoformat() + "Z"

    meta_data = {
        "dataset_id": dataset_id,
        "filename": saved_filename,
        "original_name": file.filename,
        "num_rows": num_rows,
        "num_cols": num_cols,
        "columns": columns,
        "file_type": ext.lstrip("."),
        "file_size_bytes": total_size,
        "uploaded_at": now_str,
    }

    try:
        async with aiofiles.open(get_meta_path(dataset_id), "w", encoding="utf-8") as meta_file:
            await meta_file.write(json.dumps(meta_data, indent=2))
    except Exception as exc:
        logger.warning("Could not persist dataset metadata: %s", exc)

    return DatasetInfoResponse(**meta_data)


@router.get("/datasets", response_model=List[DatasetInfoResponse])
async def list_datasets():
    """Retrieve metadata for all stored datasets."""
    if not os.path.exists(UPLOADS_DIR):
        return []

    datasets = []
    meta_files = [f for f in os.listdir(UPLOADS_DIR) if f.endswith("_meta.json")]

    for mfile in meta_files:
        path = os.path.join(UPLOADS_DIR, mfile)
        try:
            async with aiofiles.open(path, "r", encoding="utf-8") as f:
                content = await f.read()
                data = json.loads(content)
                # Verify underlying data file still exists
                data_file = get_dataset_path(data["dataset_id"])
                if data_file and os.path.exists(data_file):
                    datasets.append(DatasetInfoResponse(**data))
        except Exception as exc:
            logger.warning("Error reading dataset metadata %s: %s", mfile, exc)

    # Sort descending by upload timestamp
    datasets.sort(key=lambda d: d.uploaded_at, reverse=True)
    return datasets


@router.delete("/datasets/{dataset_id}", response_model=DeleteResponse)
async def delete_dataset(dataset_id: str):
    """Permanently delete a dataset and its corresponding metadata file."""
    data_path = get_dataset_path(dataset_id)
    meta_path = get_meta_path(dataset_id)

    if not data_path or not os.path.exists(data_path):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Dataset with ID '{dataset_id}' not found.",
        )

    try:
        if os.path.exists(data_path):
            os.remove(data_path)
        if os.path.exists(meta_path):
            os.remove(meta_path)
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error deleting dataset files: {str(exc)}",
        )

    return DeleteResponse(
        success=True,
        message=f"Dataset '{dataset_id}' has been permanently deleted.",
        dataset_id=dataset_id,
    )
