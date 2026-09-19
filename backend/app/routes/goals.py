"""
Goals API Routes.
Provides endpoints for goal feasibility calculation and reverse engineering.
"""

from typing import List, Optional
from fastapi import APIRouter, status, HTTPException, Body
from app.schemas.goals import (
    GoalCalculationRequest,
    GoalCalculationResponse,
    GoalAnalysisResponse,
    SavedGoalAnalysisRequest,
    SavedGoalAnalysisResponse,
    ReverseGoalRequest,
    ReverseGoalResponse,
    ReverseGoalAnalysisResponse,
    GoalCreateRequest,
    GoalResponse
)
from app.services.goal_service import goal_service
from app.services.ai_insight_service import ai_insight_service, AIInsightServiceError

router = APIRouter(prefix="/goals", tags=["Goal Engine"])


@router.post(
    "",
    response_model=GoalCalculationResponse,
    status_code=status.HTTP_200_OK,
    summary="Calculate financial goal feasibility"
)
def calculate_goal_feasibility_endpoint(payload: GoalCalculationRequest):
    """
    Calculate whether a financial target is reachable:
    - Remaining amount needed
    - Required monthly saving rate
    - Comparison with current disposable surplus
    - Feasibility status ('reachable', 'stretch_goal', 'unreachable_without_adjustment')
    - Estimated completion months at current pace
    """
    return goal_service.calculate_forward_goal(payload)


@router.post(
    "/analyze",
    response_model=GoalAnalysisResponse,
    status_code=status.HTTP_200_OK,
    summary="Calculate financial goal feasibility with AI insight interpretation"
)
def calculate_and_analyze_goal_endpoint(payload: GoalCalculationRequest):
    """
    Calculates goal feasibility via the deterministic engine, resolves title,
    dispatches payload to the independent AI service, and returns structured insights.
    """
    try:
        return ai_insight_service.analyze_goal(
            req=payload,
            title=payload.title,
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
            detail=f"An unexpected error occurred during goal AI analysis: {str(exc)}"
        )



@router.post(
    "/reverse",
    response_model=ReverseGoalResponse,
    status_code=status.HTTP_200_OK,
    summary="Reverse goal engineering ('I want ₹X in N months')"
)
def calculate_reverse_goal_endpoint(payload: ReverseGoalRequest):
    """
    Reverse goal calculation:
    Given a target amount and timeframe:
    - Calculates exact required monthly saving
    - Computes additional monthly amount needed vs current surplus
    - Proposes actionable trade-off levers (expense reduction %, income boost %, timeline adjustment)
    """
    return goal_service.calculate_reverse_goal_engine(payload)


@router.post(
    "/reverse/analyze",
    response_model=ReverseGoalAnalysisResponse,
    status_code=status.HTTP_200_OK,
    summary="Reverse goal engineering with AI insight interpretation"
)
def calculate_and_analyze_reverse_goal_endpoint(payload: ReverseGoalRequest):
    """
    Computes reverse goal feasibility via the deterministic engine,
    formats and dispatches the payload to the independent AI service,
    and returns both the deterministic calculations and AI insights.
    """
    try:
        return ai_insight_service.analyze_reverse_goal(
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
            detail=f"An unexpected error occurred during reverse goal AI analysis: {str(exc)}"
        )



@router.get(
    "/saved",
    response_model=List[GoalResponse],
    summary="List all saved user financial goals"
)
def list_saved_goals():
    """List tracked user goals stored in repository."""
    return goal_service.repository.get_all()


@router.post(
    "/save",
    response_model=GoalResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Save a financial goal"
)
def save_goal(payload: GoalCreateRequest):
    """Save a new goal for ongoing tracking."""
    return goal_service.repository.create(payload)


@router.post(
    "/saved/{goal_id}/analyze",
    response_model=SavedGoalAnalysisResponse,
    status_code=status.HTTP_200_OK,
    summary="Evaluate a saved goal with deterministic calculation and AI insight"
)
def evaluate_saved_goal_endpoint(
    goal_id: str,
    payload: Optional[SavedGoalAnalysisRequest] = Body(default=None)
):
    """
    Evaluates an existing saved goal from the repository:
    - Resolves the goal record (title, target amount, current savings, target months)
    - Performs deterministic forward goal calculation
    - Maps the resolved goal into the AI goal_analysis payload
    - Returns saved goal details, calculation output, and structured AI insights
    """
    req_data = payload or SavedGoalAnalysisRequest()
    try:
        return ai_insight_service.analyze_saved_goal(
            goal_id=goal_id,
            monthly_income=req_data.monthly_income,
            monthly_expenses=req_data.monthly_expenses,
            existing_emi=req_data.existing_emi,
            expected_annual_return_pct=req_data.expected_annual_return_pct,
            context_note=req_data.context_note
        )
    except AIInsightServiceError as exc:
        raise HTTPException(
            status_code=exc.status_code,
            detail=exc.message
        )
    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"An unexpected error occurred during saved goal AI evaluation: {str(exc)}"
        )


@router.delete(
    "/saved/{goal_id}",
    status_code=status.HTTP_200_OK,
    summary="Delete a saved goal"
)
def delete_saved_goal(goal_id: str):
    success = goal_service.repository.delete(goal_id)
    return {
        "success": True, 
        "message": f"Goal {goal_id} deleted successfully." if success else f"Goal {goal_id} was already removed.",
        "deleted": success
    }
