"""
Pydantic Schemas for Experiment Lab.
Compares multiple financial scenarios side-by-side.
"""

from typing import List, Dict, Any, Optional
from enum import Enum
from pydantic import BaseModel, Field


class ScenarioType(str, Enum):
    NO_PURCHASE = "no_purchase"
    CASH_PURCHASE = "cash_purchase"
    EMI_PURCHASE = "emi_purchase"
    CUSTOM = "custom"


class ScenarioInput(BaseModel):
    scenario_id: str = Field(..., examples=["scenario_a"])
    scenario_name: str = Field(..., examples=["No Purchase (Status Quo)"])
    scenario_type: ScenarioType = Field(..., examples=[ScenarioType.NO_PURCHASE])
    
    # Financial profile overrides (if omitted, uses base profile)
    purchase_amount: Optional[float] = Field(default=0.0, ge=0, examples=[70000.0])
    down_payment: Optional[float] = Field(default=0.0, ge=0, examples=[10000.0])
    annual_interest_rate_pct: Optional[float] = Field(default=12.0, ge=0, examples=[12.0])
    tenure_months: Optional[int] = Field(default=12, ge=1, examples=[12])
    expense_adjustment: Optional[float] = Field(default=0.0, examples=[-5000.0], description="Monthly expense reduction/increase")


class ExperimentCompareRequest(BaseModel):
    monthly_income: float = Field(..., ge=0, examples=[80000.0])
    monthly_expenses: float = Field(..., ge=0, examples=[45000.0])
    current_savings: float = Field(..., ge=0, examples=[200000.0])
    existing_emi: float = Field(default=0.0, ge=0, examples=[0.0])
    target_goal_amount: Optional[float] = Field(default=500000.0, ge=0, examples=[500000.0])
    target_goal_months: Optional[int] = Field(default=12, ge=1, examples=[12])
    scenarios: List[ScenarioInput] = Field(..., min_length=2)
    context_note: Optional[str] = Field(
        default=None,
        max_length=300,
        examples=["Comparing cash vs EMI vs no purchase for laptop."],
        description="Optional brief context note passed to the AI insight service"
    )


class ScenarioMetricResult(BaseModel):
    scenario_id: str
    scenario_name: str
    scenario_type: ScenarioType
    monthly_surplus: float
    immediate_savings_after_action: float
    projected_savings_3_months: float
    projected_savings_6_months: float
    projected_savings_12_months: float
    projected_savings_24_months: float
    emergency_fund_coverage_months: float
    goal_completion_months: Optional[int]
    goal_reachable_in_target_timeline: bool
    total_interest_or_cost_paid: float
    risk_level: str
    trade_off_summary: str


class ExperimentCompareResponse(BaseModel):
    base_profile: Dict[str, float]
    comparison_matrix: List[ScenarioMetricResult]
    summary_insights: List[str]
    assumptions: List[str]


class ExperimentCompareAnalysisResponse(BaseModel):
    calculation: ExperimentCompareResponse
    ai_insight: Dict[str, Any]

