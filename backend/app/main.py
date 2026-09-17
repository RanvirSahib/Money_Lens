"""
MoneyLens - AI-Powered Financial Future Simulator Backend.
Main FastAPI Application Entry Point.
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.routes.transactions import router as transactions_router
from app.routes.simulation import router as simulation_router
from app.routes.goals import router as goals_router
from app.routes.experiments import router as experiments_router
from app.routes.radar import router as radar_router

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="""
# MoneyLens Backend Engine 🚀
**AI-Powered Financial Future Simulator**

Provides deterministic financial calculations, forward & reverse simulation engines,
experiment comparison lab, rule-based financial radar, and structured data interfaces for downstream AI services.

### Canonical Public API: `/api/v1/...`
* **Transactions**: `/api/v1/transactions`, `/api/v1/transactions/summary`, `/api/v1/transactions/{txn_id}`
* **Simulations**: `/api/v1/simulate/position`, `/api/v1/simulate/purchase`, `/api/v1/simulate/emi`, `/api/v1/simulate/savings`
* **Goals**: `/api/v1/goals`, `/api/v1/goals/reverse`, `/api/v1/goals/saved`, `/api/v1/goals/save`, `/api/v1/goals/saved/{goal_id}`
* **Experiment Lab**: `/api/v1/experiments/compare`
* **Financial Radar**: `/api/v1/radar`, `/api/v1/radar/analyze`

---
*Disclaimer: MoneyLens is an educational financial simulation tool. It provides deterministic projections, trade-offs, and scenario analyses without making prescriptive financial advice.*
    """,
    docs_url="/docs",
    redoc_url="/redoc",
)

# CORS Configuration for local frontend development and production
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register Canonical /api/v1 Feature Routers
app.include_router(transactions_router, prefix=settings.API_PREFIX)
app.include_router(simulation_router, prefix=settings.API_PREFIX)
app.include_router(goals_router, prefix=settings.API_PREFIX)
app.include_router(experiments_router, prefix=settings.API_PREFIX)
app.include_router(radar_router, prefix=settings.API_PREFIX)


@app.get("/health", tags=["System Health"], summary="Service Health Check")
def health_check():
    """Returns backend service operational status and version."""
    return {
        "status": "healthy",
        "service": "MoneyLens Financial Engine",
        "version": settings.VERSION,
        "engine": "deterministic-v1",
        "ai_integration_status": "ready"
    }


@app.get("/", tags=["System Health"], summary="Root Index")
def root_index():
    """Root metadata and canonical API index."""
    return {
        "message": "Welcome to MoneyLens Financial Future Simulator API",
        "documentation": "/docs",
        "health_check": "/health",
        "version": settings.VERSION,
        "canonical_api_prefix": settings.API_PREFIX,
        "available_endpoints": [
            f"{settings.API_PREFIX}/transactions",
            f"{settings.API_PREFIX}/transactions/summary",
            f"{settings.API_PREFIX}/transactions/{{txn_id}}",
            f"{settings.API_PREFIX}/simulate/position",
            f"{settings.API_PREFIX}/simulate/purchase",
            f"{settings.API_PREFIX}/simulate/emi",
            f"{settings.API_PREFIX}/simulate/savings",
            f"{settings.API_PREFIX}/goals",
            f"{settings.API_PREFIX}/goals/reverse",
            f"{settings.API_PREFIX}/goals/saved",
            f"{settings.API_PREFIX}/goals/save",
            f"{settings.API_PREFIX}/goals/saved/{{goal_id}}",
            f"{settings.API_PREFIX}/experiments/compare",
            f"{settings.API_PREFIX}/radar",
            f"{settings.API_PREFIX}/radar/analyze"
        ]
    }
