"""
MoneyLens AI Service — FastAPI Application Entry Point.

Runs as an independent service on port 8001 (configurable via env vars).
Does NOT connect to the MoneyLens financial-engine backend or RDS.

Endpoints
---------
GET  /health    — Liveness / readiness check.
POST /analyze   — Accept structured financial-engine output and return AI insights.
            Supports five MoneyLens AI modes via the `analysis_type` field:
            time_machine | goal_analysis | reverse_analysis |
            experiment_analysis | radar_analysis
"""

import logging
import os

from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware

# Load .env before importing any module that reads env vars
load_dotenv()

from app.schemas import AnalyzeRequest, AnalyzeResponse, HealthResponse  # noqa: E402
from app.services.groq_service import GroqService, GroqServiceError  # noqa: E402

# ---------------------------------------------------------------------------
# Logging
# ---------------------------------------------------------------------------
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s | %(levelname)-8s | %(name)s | %(message)s",
)
logger = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# Service metadata
# ---------------------------------------------------------------------------
_SERVICE_NAME = "MoneyLens AI Insight Service"
_VERSION = "1.0.0"
_GROQ_MODEL = os.getenv("GROQ_MODEL", "openai/gpt-oss-120b")

# ---------------------------------------------------------------------------
# FastAPI application
# ---------------------------------------------------------------------------
app = FastAPI(
    title=_SERVICE_NAME,
    version=_VERSION,
    description="""
# MoneyLens AI Insight Service 🧠

**Specialised Groq-powered financial intelligence layer for MoneyLens.**

This service accepts structured output from the MoneyLens deterministic financial engine
and returns human-readable observations, evidence, implications, and possible actions.

> ⚠️ This service does NOT perform financial calculations and does NOT have access
> to any database or bank account data. All analysis is based solely on the
> structured data supplied in each request.

### The Five MoneyLens AI Modes (`analysis_type`)
| Mode | Purpose |
|---|---|
| `time_machine` | Explain the financial consequences of a simulated decision |
| `goal_analysis` | Explain goal progress, timeline, and gap |
| `reverse_analysis` | Explain what needs to change to reach a target |
| `experiment_analysis` | Compare multiple engine-computed scenarios |
| `radar_analysis` | Explain financial risk alerts from the radar engine |

### Endpoints
* **GET /health** — Liveness check
* **POST /analyze** — Submit financial-engine output for AI analysis

*Disclaimer: MoneyLens AI provides illustrative insights for educational purposes
only. Nothing here constitutes financial, investment, legal, or tax advice.*
    """,
    docs_url="/docs",
    redoc_url="/redoc",
)

# CORS — allow the MoneyLens frontend and the financial engine to call this service
_CORS_ORIGINS = [
    "http://localhost:3000",
    "http://localhost:5173",
    "http://localhost:8000",  # MoneyLens backend
    "http://localhost:8001",
    "http://127.0.0.1:3000",
    "http://127.0.0.1:5173",
    "http://127.0.0.1:8000",
    "http://127.0.0.1:8001",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=_CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------------------------------------------------------------------------
# Groq service instance
# ---------------------------------------------------------------------------
# GroqService reads GROQ_API_KEY / GROQ_MODEL from env at first use.
_groq_service = GroqService()


# ---------------------------------------------------------------------------
# Routes
# ---------------------------------------------------------------------------

@app.get(
    "/health",
    response_model=HealthResponse,
    tags=["System"],
    summary="Service health check",
)
def health_check() -> HealthResponse:
    """
    Returns the operational status of the AI insight service.

    Does NOT verify that the Groq API key is valid — it only confirms the
    service process is running and correctly configured.
    """
    return HealthResponse(
        status="healthy",
        service=_SERVICE_NAME,
        version=_VERSION,
        provider="groq",
        model=_GROQ_MODEL,
    )


@app.post(
    "/analyze",
    response_model=AnalyzeResponse,
    status_code=status.HTTP_200_OK,
    tags=["AI Insights"],
    summary="Analyze structured MoneyLens financial-engine output",
)
def analyze_financial_data(payload: AnalyzeRequest) -> AnalyzeResponse:
    """
    Accepts structured MoneyLens financial-engine output and returns AI-generated
    observations, evidence, implications, risks, and possible actions.

    ### Required field
    `analysis_type` — selects the MoneyLens AI mode:
    * `time_machine` — explain consequences of a simulated decision
    * `goal_analysis` — explain goal progress, timeline, and gap
    * `reverse_analysis` — explain what needs to change to reach a target
    * `experiment_analysis` — compare multiple engine-computed scenarios
    * `radar_analysis` — explain financial risk alerts from the radar engine

    ### What this endpoint does NOT do
    * Does not perform financial calculations.
    * Does not invent or modify numbers.
    * Does not access any database or bank account data.
    """
    try:
        return _groq_service.analyze(payload)
    except GroqServiceError as exc:
        logger.error("GroqServiceError during /analyze: %s", exc.message)
        raise HTTPException(status_code=exc.status_code, detail=exc.message)
    except Exception as exc:
        logger.exception("Unexpected error during /analyze")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"An unexpected error occurred: {str(exc)}",
        )


# ---------------------------------------------------------------------------
# Dev entrypoint
# ---------------------------------------------------------------------------
if __name__ == "__main__":
    import uvicorn

    host = os.getenv("AI_SERVICE_HOST", "0.0.0.0")
    port = int(os.getenv("AI_SERVICE_PORT", "8001"))
    uvicorn.run("app.main:app", host=host, port=port, reload=True)
