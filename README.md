# DataSense AI 🧠📊

> **The Next-Generation AI Data Analyst Platform**  
> Turn raw datasets into executive narratives, statistical insights, interactive forecasts, and publication-ready PDF intelligence dossiers in seconds.

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.115.0-009688.svg?logo=fastapi)](https://fastapi.tiangolo.com)
[![Python](https://img.shields.io/badge/Python-3.10%2B-blue.svg?logo=python)](https://python.org)
[![Google Gemini](https://img.shields.io/badge/Gemini%20AI-1.5%20Flash-orange.svg?logo=google)](https://ai.google.dev/)

---

## 📖 Overview

**DataSense AI** is an end-to-end intelligent data analysis platform engineered for data teams, business analysts, and executives. Powered by **FastAPI**, **Pandas**, **Scikit-learn**, and **Google Gemini AI**, DataSense AI automates exploratory data analysis (EDA), computes multi-dimensional quality scores, flags statistical anomalies, simulates what-if scenarios, and generates C-suite PDF dossiers with embedded visualizations.

---

## ✨ Key Features

- **⚡ Multi-Format Ingestion**: Upload and parse CSV, Excel (`.xlsx`, `.xls`), and JSON datasets with automatic character encoding detection (`utf-8`, `latin-1`, `cp1252`).
- **🛡️ DataSense Quality Score (0–100)**: Evaluates dataset health across 4 dimensions:
  - *Completeness* (null ratio impact)
  - *Uniqueness* (duplicate row deduction)
  - *Consistency* (IQR variance & outlier stability)
  - *Validity* (type integrity & non-constant distributions)
- **🔍 Automated Anomaly Detection**: Interquartile Range (IQR) outlier detection pinpointing abnormal data points with upper/lower thresholds and concrete examples.
- **🤖 Google Gemini AI Integration (`gemini-1.5-flash`)**:
  - *5 Strategic Insights*: Categorized into `warning`, `info`, and `success`.
  - *Executive Narratives*: 2–3 paragraph business summary written like a Senior BI Director.
  - *Conversational Data Q&A*: Multi-turn natural language chat over dataset context.
  - *Smart Column Detection*: Semantic categorization (e.g., Currency, DateTime, Geographic, Identifiers).
- **📈 Interactive Recharts Configurations**: Auto-generated configs for distributions, line trajectories, scatter plots, and category breakdowns.
- **🔮 Predictive Regression Forecasting**: Ordinary Least Squares (OLS) trend projection with 95% confidence intervals (`confidence_upper`, `confidence_lower`).
- **🎯 What-If Scenario Simulator**: Scale any quantitative metric (e.g., +20% revenue) and immediately observe recomputed charts, means, and quality metrics.
- **📄 Publication-Ready PDF Dossiers**: Full-fidelity reports compiled via ReportLab with embedded high-res Matplotlib charts, scorecard badges, and statistical appendices.

---

## 🛠️ Tech Stack

### Backend
- **Framework**: [FastAPI](https://fastapi.tiangolo.com/) (Async, Pydantic v2 validation)
- **Server**: [Uvicorn](https://www.uvicorn.org/) (High-performance ASGI server)
- **Data Engineering**: [Pandas](https://pandas.pydata.org/), [NumPy](https://numpy.org/)
- **Machine Learning**: [Scikit-learn](https://scikit-learn.org/), [SciPy](https://scipy.org/)
- **Generative AI**: [Google Generative AI](https://ai.google.dev/) (`gemini-1.5-flash`)
- **Visuals & Reporting**: [ReportLab](https://www.reportlab.com/), [Matplotlib](https://matplotlib.org/), [Seaborn](https://seaborn.pydata.org/)
- **Asynchronous I/O**: [aiofiles](https://github.com/Tinche/aiofiles)

### Frontend (Recommended)
- **Framework**: [React](https://react.dev/) / [Next.js](https://nextjs.org/) with TypeScript
- **Charts**: [Recharts](https://recharts.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) + Lucide Icons

---

## 📋 Prerequisites

- **Python**: Version 3.10, 3.11, or 3.12 installed
- **Node.js**: (For frontend) Version 18+ and `npm` or `pnpm`
- **Google Gemini API Key**: Free tier available from [Google AI Studio](https://aistudio.google.com/)

---

## 🚀 Setup Instructions

### 1. Backend Setup

```bash
# Navigate to the backend directory
cd backend

# Create a virtual environment
python -m venv venv

# Activate virtual environment
# Windows (PowerShell):
.\venv\Scripts\Activate.ps1
# macOS / Linux:
# source venv/bin/activate

# Install required packages
pip install -r requirements.txt

# Configure environment variables
cp .env.example .env
```

Edit your `.env` file with your credentials:
```env
GEMINI_API_KEY=your_actual_gemini_api_key_here
MAX_FILE_SIZE_MB=50
ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000
```

Start the FastAPI application:
```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

Access the interactive API documentation:
- Swagger UI: [http://localhost:8000/docs](http://localhost:8000/docs)
- ReDoc: [http://localhost:8000/redoc](http://localhost:8000/redoc)
- Health Check: [http://localhost:8000/api/health](http://localhost:8000/api/health)

---

### 2. Frontend Setup (Client Application)

```bash
# Navigate to your frontend project (e.g., Vite React app)
cd frontend

# Install dependencies
npm install

# Configure API endpoint in .env.local
echo "VITE_API_BASE_URL=http://localhost:8000/api" > .env.local

# Run the development server
npm run dev
```

Visit [http://localhost:5173](http://localhost:5173) in your browser.

---

## 🔑 How to Get a Google Gemini API Key

1. Go to [Google AI Studio](https://aistudio.google.com/).
2. Sign in with your Google account.
3. Click on **Get API key** in the left navigation sidebar.
4. Click **Create API key in new project** (or select an existing project).
5. Copy your API key and paste it into `backend/.env` under `GEMINI_API_KEY`:
   ```env
   GEMINI_API_KEY=AIzaSy...
   ```
> **Note**: Even without an API key, DataSense AI operates in intelligent heuristic fallback mode so you can test all core features, statistics, charts, and PDF generation immediately!

---

## ⚙️ Environment Variables

| Variable | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `GEMINI_API_KEY` | `string` | `""` | Google Gemini AI API Key for generative insights & chat |
| `MAX_FILE_SIZE_MB` | `integer` | `50` | Maximum uploaded dataset file size in megabytes |
| `ALLOWED_ORIGINS` | `string` | `http://localhost:5173,http://localhost:3000` | Comma-separated list of permitted CORS frontend origins |

---

## 📡 API Reference Overview

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/health` | Service health status and storage readiness |
| `POST` | `/api/upload` | Upload CSV, Excel, or JSON dataset (`multipart/form-data`) |
| `GET` | `/api/datasets` | List all uploaded datasets and summary metadata |
| `DELETE` | `/api/datasets/{dataset_id}` | Delete a dataset and its metadata |
| `GET` | `/api/analysis/{dataset_id}` | Comprehensive analysis: stats, score, anomalies, correlations, charts, AI insights & narrative |
| `GET` | `/api/analysis/{dataset_id}/stats` | Quick basic stats, column stats, and DataSense score (fast, non-AI) |
| `GET` | `/api/analysis/{dataset_id}/charts` | Smart Recharts visualization configurations |
| `GET` | `/api/analysis/{dataset_id}/forecast?target_col=X` | OLS linear regression forecast with 95% confidence intervals |
| `POST` | `/api/analysis/{dataset_id}/whatif` | Simulate multiplier on a metric and view updated charts |
| `POST` | `/api/chat` | Conversational Q&A about dataset with Google Gemini |
| `POST` | `/api/analyze/smart-detect` | Semantic column type and description detection |
| `POST` | `/api/reports/generate` | Generate publication-ready PDF dossier with ReportLab |
| `GET` | `/api/reports/{report_id}/download` | Stream and download generated PDF report |
| `GET` | `/api/reports` | List all generated PDF reports |

---

## 💡 Usage Guide

### 1. Uploading a Dataset
```bash
curl -X POST "http://localhost:8000/api/upload" \
  -H "accept: application/json" \
  -H "Content-Type: multipart/form-data" \
  -F "file=@sales_data.csv"
```
*Returns `dataset_id` (UUID) to use in subsequent requests.*

### 2. Requesting Full Intelligence Analysis
```bash
curl -X GET "http://localhost:8000/api/analysis/{dataset_id}"
```

### 3. Forecasting a Target Metric
```bash
curl -X GET "http://localhost:8000/api/analysis/{dataset_id}/forecast?target_col=revenue&periods=12"
```

### 4. Simulating a What-If Scenario
```bash
curl -X POST "http://localhost:8000/api/analysis/{dataset_id}/whatif" \
  -H "Content-Type: application/json" \
  -d '{"column": "revenue", "multiplier": 1.15}'
```

### 5. Generating and Downloading a PDF Report
```bash
curl -X POST "http://localhost:8000/api/reports/generate" \
  -H "Content-Type: application/json" \
  -d '{"dataset_id": "{dataset_id}", "report_type": "executive", "include_charts": true}'
```

---

## 🖼️ Screenshots

### Executive Dashboard
```
+---------------------------------------------------------------------------------------+
|  🧠 DataSense AI   [ Upload Dataset ]   Active: sales_q4.csv (14,200 rows)            |
+---------------------------------------------------------------------------------------+
|  DataSense Score: 92/100 (Grade A - Excellent) | Completeness: 99.1% | Unique: 100%   |
+---------------------------------------------------------------------------------------+
|  AI Insights:                                                                         |
|  • [SUCCESS] Zero duplicate records found in customer transaction cohort.              |
|  • [INFO]    Strong positive correlation between Unit Price and Margin (r = 0.84).    |
|  • [WARNING] 14 outlier transactions detected in 'Discount' column via IQR audit.    |
+---------------------------------------------------------------------------------------+
|  [ Distribution Charts ]     [ Trend Forecasts ]     [ What-If Simulation Sandbox ]   |
+---------------------------------------------------------------------------------------+
```

*(Place UI screenshots in `docs/screenshots/` and link them here)*

---

## 📄 License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.
