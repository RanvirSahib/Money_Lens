"""
Experiment Lab API Routes.
Provides endpoints for side-by-side multi-scenario financial comparisons.
"""

from fastapi import APIRouter, status, HTTPException
from app.schemas.experiments import (
    ExperimentCompareRequest,
    ExperimentCompareResponse,
    ExperimentCompareAnalysisResponse,
)
from app.services.experiment_service import experiment_service
from app.services.ai_insight_service import ai_insight_service, AIInsightServiceError

router = APIRouter(prefix="/experiments", tags=["Experiment Lab"])


@router.post(
    "/compare",
    response_model=ExperimentCompareResponse,
    status_code=status.HTTP_200_OK,
    summary="Compare multiple financial scenarios side-by-side"
)
def compare_financial_scenarios(payload: ExperimentCompareRequest):
    """
    Compare multiple financial decisions simultaneously (e.g. No Purchase vs Lump-sum Cash vs EMI vs Custom).
    
    Returns structured comparison matrix:
    - Monthly disposable surplus under each path
    - Immediate remaining liquidity
    - Projected savings at 3, 6, 12, and 24 months
    - Emergency fund coverage months
    - Goal completion impact
    - Total interest / cost paid
    - Objective risk rating & trade-off summary
    """
    return experiment_service.compare_scenarios(payload)


@router.post(
    "/compare/analyze",
    response_model=ExperimentCompareAnalysisResponse,
    status_code=status.HTTP_200_OK,
    summary="Compare multiple financial scenarios side-by-side with AI insight interpretation"
)
def compare_and_analyze_financial_scenarios(payload: ExperimentCompareRequest):
    """
    Executes multi-scenario experiment calculation via the deterministic engine,
    dispatches comparison matrix directly to the independent AI service,
    and returns both the deterministic calculations and structured AI insights.
    """
    try:
        return ai_insight_service.analyze_experiment_comparison(
            req=payload,
            context_note=payload.context_note
        )
    except AIInsightServiceError as exc:
        raise HTTPException(
            status_code=exc.status_code,
            detail=exc.message
        )
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"An unexpected error occurred during experiment AI analysis: {str(exc)}"
        )



