"""DataSense AI - Core FastAPI Application Server.

Production-grade asynchronous backend providing automated data profiling,
Gemini-powered natural language insights, predictive regression forecasting,
what-if scenario modeling, and dynamic PDF intelligence reporting.
"""

from __future__ import annotations

from contextlib import asynccontextmanager
from datetime import datetime
import logging
import os
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException, Request, status
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles

# Load environment configuration
load_dotenv()

from routers import (
    ai_chat,
    analysis,
    cleaner,
    compare,
    pivot,
    reports,
    templates,
    upload,
    whatif,
)

# Setup application logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s - %(message)s",
)
logger = logging.getLogger("datasense.main")

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
UPLOADS_DIR = os.path.join(BASE_DIR, "uploads")
REPORTS_DIR = os.path.join(BASE_DIR, "reports")


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Lifespan event handler ensuring storage directories exist upon startup."""
    os.makedirs(UPLOADS_DIR, exist_ok=True)
    os.makedirs(REPORTS_DIR, exist_ok=True)
    logger.info("DataSense AI backend initialized. Storage directories ready.")
    yield
    logger.info("DataSense AI backend shutting down.")


# Initialize FastAPI app
app = FastAPI(
    title="DataSense AI API",
    description="Intelligent AI-powered data analyst platform engine.",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan,
)

# Configure CORS Middleware
allowed_origins_env = os.getenv(
    "ALLOWED_ORIGINS",
    "http://localhost:5173,http://localhost:3000,http://127.0.0.1:5173,http://127.0.0.1:3000",
)
origins = [origin.strip() for origin in allowed_origins_env.split(",") if origin.strip()]
if "*" in origins:
    allow_origins = ["*"]
else:
    allow_origins = origins

app.add_middleware(
    CORSMiddleware,
    allow_origins=allow_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Exception Handlers
@app.exception_handler(HTTPException)
async def http_exception_handler(request: Request, exc: HTTPException):
    """Structured handler for standard HTTP exceptions."""
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "error": True,
            "status_code": exc.status_code,
            "detail": exc.detail,
            "path": request.url.path,
        },
    )


@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    """Structured handler for Pydantic input validation failures."""
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={
            "error": True,
            "status_code": status.HTTP_422_UNPROCESSABLE_ENTITY,
            "detail": exc.errors(),
            "path": request.url.path,
        },
    )


@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    """Catch-all unhandled exception handler to prevent leakages."""
    logger.error("Unhandled exception at %s: %s", request.url.path, exc, exc_info=True)
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "error": True,
            "status_code": status.HTTP_500_INTERNAL_SERVER_ERROR,
            "detail": "An internal server error occurred. Please contact system administrator.",
            "path": request.url.path,
        },
    )


# Health check endpoint
@app.get("/api/health", tags=["Health"])
async def health_check():
    """Verify system health, uptime timestamp, and storage connectivity."""
    gemini_key = os.getenv("GEMINI_API_KEY", "").strip()
    ai_status = "configured" if (gemini_key and gemini_key != "your_gemini_api_key_here") else "fallback_mode"

    return {
        "status": "healthy",
        "service": "DataSense AI Backend",
        "version": "1.0.0",
        "timestamp": datetime.utcnow().isoformat() + "Z",
        "ai_engine": ai_status,
        "directories": {
            "uploads": os.path.exists(UPLOADS_DIR),
            "reports": os.path.exists(REPORTS_DIR),
        },
    }


# Include Routers with /api prefix
app.include_router(upload.router, prefix="/api", tags=["Datasets & Uploads"])
app.include_router(analysis.router, prefix="/api", tags=["Analysis & Forecasts"])
app.include_router(ai_chat.router, prefix="/api", tags=["AI Reasoning & Chat"])
app.include_router(reports.router, prefix="/api", tags=["PDF Reports"])
app.include_router(cleaner.router, prefix="/api", tags=["Data Cleaner"])
app.include_router(pivot.router, prefix="/api", tags=["Pivot Tables"])
app.include_router(templates.router, prefix="/api", tags=["Dataset Templates"])
app.include_router(compare.router, prefix="/api", tags=["Dataset Comparison"])
app.include_router(whatif.router, prefix="/api", tags=["What-If Scenarios"])

# Mount static file endpoints for direct asset inspection if needed
os.makedirs(UPLOADS_DIR, exist_ok=True)
os.makedirs(REPORTS_DIR, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=UPLOADS_DIR), name="uploads")
app.mount("/reports", StaticFiles(directory=REPORTS_DIR), name="reports")

if __name__ == "__main__":
    import uvicorn

    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
