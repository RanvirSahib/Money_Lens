"""
Experiment Lab API Routes.
Provides endpoints for side-by-side multi-scenario financial comparisons.
"""

from fastapi import APIRouter, status
from app.schemas.experiments import (
    ExperimentCompareRequest,
    ExperimentCompareResponse
)
from app.services.experiment_service import experiment_service

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
