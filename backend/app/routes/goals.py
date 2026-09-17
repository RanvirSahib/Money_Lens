"""
Goals API Routes.
Provides endpoints for goal feasibility calculation and reverse engineering.
"""

from typing import List
from fastapi import APIRouter, status, HTTPException
from app.schemas.goals import (
    GoalCalculationRequest,
    GoalCalculationResponse,
    ReverseGoalRequest,
    ReverseGoalResponse,
    GoalCreateRequest,
    GoalResponse
)
from app.services.goal_service import goal_service

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


@router.delete(
    "/saved/{goal_id}",
    status_code=status.HTTP_200_OK,
    summary="Delete a saved goal"
)
def delete_saved_goal(goal_id: str):
    success = goal_service.repository.delete(goal_id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Goal with ID '{goal_id}' not found."
        )
    return {"success": True, "message": f"Goal {goal_id} deleted."}
