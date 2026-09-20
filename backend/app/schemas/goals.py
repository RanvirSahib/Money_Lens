"""
Pydantic Schemas for Financial Goals.
Supports forward goal tracking and reverse goal engineering.
"""

from typing import Optional, List, Dict, Any
from datetime import date
from pydantic import BaseModel, Field


class GoalBase(BaseModel):
    title: str = Field(..., examples=["Emergency Fund"], min_length=1)
    target_amount: float = Field(..., gt=0, examples=[500000.0])
    current_savings_allocated: float = Field(default=0.0, ge=0, examples=[50000.0])
    target_months: Optional[int] = Field(default=12, gt=0, examples=[12])
    target_date: Optional[date] = Field(default=None, examples=["2027-09-01"])
    category: Optional[str] = Field(default="Savings", examples=["Vehicle / Emergency / Travel"])
    priority: Optional[str] = Field(default="medium", examples=["high"])
    user_id: Optional[str] = Field(default="usr_demo_01", examples=["usr_demo_01"])


class GoalCreateRequest(GoalBase):
    pass


class GoalResponse(GoalBase):
    id: str = Field(..., examples=["goal_01j7abcde1234567"])

    model_config = {"from_attributes": True}


class GoalCalculationRequest(BaseModel):
    target_amount: float = Field(..., gt=0, examples=[500000.0])
    current_savings_allocated: float = Field(default=0.0, ge=0, examples=[50000.0])
    target_months: Optional[int] = Field(default=12, gt=0, examples=[12])
    target_date: Optional[date] = Field(default=None, examples=["2027-09-01"])
    monthly_income: float = Field(..., ge=0, examples=[80000.0])
    monthly_expenses: float = Field(..., ge=0, examples=[45000.0])
    existing_emi: float = Field(default=0.0, ge=0, examples=[0.0])
    expected_annual_return_pct: float = Field(default=0.0, ge=0, le=100, examples=[7.0])
    title: Optional[str] = Field(default=None, examples=["Emergency Fund Corpus"], description="Goal title for AI insight context")
    context_note: Optional[str] = Field(
        default=None,
        max_length=300,
        examples=["Planning for an emergency cushion."],
        description="Optional brief context note passed to the AI insight service"
    )


class GoalCalculationResponse(BaseModel):
    target_amount: float
    current_savings_allocated: float
    remaining_amount: float
    target_months: int
    current_monthly_surplus: float
    required_monthly_saving: float
    monthly_gap_or_shortfall: float
    monthly_excess_buffer: float
    is_reachable: bool
    projected_completion_months_at_current_rate: Optional[int]
    status: str
    status_description: str
    assumptions: List[str]


class GoalAnalysisResponse(BaseModel):
    calculation: GoalCalculationResponse
    ai_insight: Dict[str, Any]


class SavedGoalAnalysisRequest(BaseModel):
    monthly_income: Optional[float] = Field(default=80000.0, ge=0, examples=[80000.0])
    monthly_expenses: Optional[float] = Field(default=45000.0, ge=0, examples=[45000.0])
    existing_emi: Optional[float] = Field(default=0.0, ge=0, examples=[0.0])
    expected_annual_return_pct: Optional[float] = Field(default=0.0, ge=0, le=100, examples=[0.0])
    context_note: Optional[str] = Field(
        default=None,
        max_length=300,
        examples=["Reviewing this saved goal."],
        description="Optional brief context note passed to the AI insight service"
    )


class SavedGoalAnalysisResponse(BaseModel):
    goal: GoalResponse
    calculation: GoalCalculationResponse
    ai_insight: Dict[str, Any]


class ReverseGoalRequest(BaseModel):
    target_amount: float = Field(..., gt=0, examples=[500000.0], description="Corpus you wish to accumulate")
    target_months: int = Field(..., gt=0, le=360, examples=[12], description="Timeframe in months")
    current_savings_allocated: Optional[float] = Field(default=0.0, ge=0, examples=[50000.0], description="Already saved capital")
    current_monthly_income: Optional[float] = Field(default=None, ge=0, examples=[80000.0])
    current_monthly_expenses: Optional[float] = Field(default=None, ge=0, examples=[45000.0])
    existing_emi: Optional[float] = Field(default=0.0, ge=0, examples=[0.0])
    current_monthly_surplus: Optional[float] = Field(default=None, ge=0, examples=[35000.0])
    expected_annual_return_pct: float = Field(default=0.0, ge=0, le=100, examples=[0.0])
    title: Optional[str] = Field(default=None, examples=["Emergency Fund"])
    context_note: Optional[str] = Field(
        default=None,
        max_length=300,
        examples=["Planning for an emergency cushion before shifting careers."],
        description="Optional brief context note passed to the AI insight service"
    )


class ReverseGoalResponse(BaseModel):
    target_amount: float
    current_savings_allocated: float = 0.0
    remaining_target_amount: float = 0.0
    target_months: int
    required_monthly_saving: float
    current_monthly_surplus: float
    additional_monthly_needed: float
    is_currently_sufficient: bool
    is_feasible: Optional[bool] = None
    alternative_timeline_at_current_surplus_months: Optional[int] = None
    alternative_months_at_current_surplus: Optional[int] = None
    actionable_levers: Dict[str, Any]
    assumptions: List[str]


class ReverseGoalAnalysisResponse(BaseModel):
    calculation: ReverseGoalResponse
    ai_insight: Dict[str, Any]


