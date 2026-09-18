"""
Pydantic Schemas for AI Interpretation Layer (Amazon Bedrock).
Defines request and structured response models for natural language financial queries.
"""

from typing import Optional
from pydantic import BaseModel, Field


class AIAnalyzeRequest(BaseModel):
    """Natural language financial request sent by the user."""
    message: str = Field(
        ...,
        min_length=1,
        examples=["Can I buy a ₹70,000 phone next month?"],
        description="User's natural language financial inquiry or hypothetical decision"
    )


class AIAnalyzeResponse(BaseModel):
    """Structured intent representation extracted by the AI interpretation layer."""
    intent: str = Field(
        ...,
        examples=["purchase_simulation"],
        description="Primary financial intent (e.g. purchase_simulation, emi_simulation, savings_projection, goal_tracking, expense_analysis, general_query)"
    )
    item: Optional[str] = Field(
        default=None,
        examples=["phone"],
        description="Identified item, asset, or subject of the query"
    )
    amount: Optional[float] = Field(
        default=None,
        examples=[70000.0],
        description="Target amount or price identified in the query"
    )
    time_period: Optional[str] = Field(
        default=None,
        examples=["next_month"],
        description="Temporal reference or timeframe mentioned"
    )
    payment_method: Optional[str] = Field(
        default=None,
        examples=["emi", "cash", "credit_card"],
        description="Payment mode or funding method if specified"
    )
    goal: Optional[str] = Field(
        default=None,
        examples=["emergency_fund", "house_downpayment"],
        description="Financial goal referenced in the inquiry"
    )


# ---------------------------------------------------------------------------
# Schemas for Groq-powered MoneyLens AI microservice (:8001) Integration
# ---------------------------------------------------------------------------

from enum import Enum
from typing import Any, Dict, List


class AnalysisType(str, Enum):
    """The five MoneyLens AI modes."""
    TIME_MACHINE = "time_machine"
    GOAL_ANALYSIS = "goal_analysis"
    REVERSE_ANALYSIS = "reverse_analysis"
    EXPERIMENT_ANALYSIS = "experiment_analysis"
    RADAR_ANALYSIS = "radar_analysis"


class FinancialPositionInput(BaseModel):
    monthly_income: Optional[float] = None
    monthly_expenses: Optional[float] = None
    existing_emi: Optional[float] = None
    monthly_surplus: Optional[float] = None
    savings_rate_pct: Optional[float] = None
    current_savings: Optional[float] = None
    emergency_fund_months: Optional[float] = None
    projected_balance_3_months: Optional[float] = None
    projected_balance_6_months: Optional[float] = None
    projected_balance_12_months: Optional[float] = None


class SimulationResultInput(BaseModel):
    scenario: Optional[str] = None
    data: Dict[str, Any] = Field(default_factory=dict)


class FinancialGoalInput(BaseModel):
    title: Optional[str] = None
    target_amount: Optional[float] = None
    current_savings_allocated: Optional[float] = None
    target_months: Optional[int] = None
    required_monthly_saving: Optional[float] = None
    monthly_gap_or_shortfall: Optional[float] = None
    is_reachable: Optional[bool] = None
    projected_completion_months: Optional[int] = None
    status: Optional[str] = None
    status_description: Optional[str] = None


class ReversePlanInput(BaseModel):
    goal_title: Optional[str] = None
    target_amount: Optional[float] = None
    deadline_months: Optional[int] = None
    required_monthly_saving: Optional[float] = None
    current_monthly_surplus: Optional[float] = None
    monthly_shortfall: Optional[float] = None
    is_feasible_without_changes: Optional[bool] = None
    suggested_expense_cuts: List[Dict[str, Any]] = Field(default_factory=list)
    suggested_timeline_extension_months: Optional[int] = None
    recommendations: List[str] = Field(default_factory=list)


class ExperimentDataInput(BaseModel):
    scenario_a_name: Optional[str] = None
    scenario_b_name: Optional[str] = None
    comparison_summary: Dict[str, Any] = Field(default_factory=dict)
    insights: List[str] = Field(default_factory=list)


class RadarDataInput(BaseModel):
    cash_flow_health: Optional[str] = None
    runway_months: Optional[float] = None
    recurring_expense_ratio_pct: Optional[float] = None
    high_risk_alerts: List[Dict[str, Any]] = Field(default_factory=list)
    upcoming_expenses_30d: List[Dict[str, Any]] = Field(default_factory=list)


class AIInsightRequest(BaseModel):
    """Payload forwarded to MoneyLens AI microservice."""
    analysis_type: AnalysisType
    financial_position: Optional[FinancialPositionInput] = None
    simulation_result: Optional[SimulationResultInput] = None
    goal: Optional[FinancialGoalInput] = None
    reverse_plan: Optional[ReversePlanInput] = None
    experiment: Optional[ExperimentDataInput] = None
    radar: Optional[RadarDataInput] = None
    context_note: Optional[str] = Field(default=None, max_length=300)


class AIInsightResponse(BaseModel):
    """Structured insights returned by MoneyLens AI layer."""
    analysis_type: AnalysisType
    headline: str
    observations: List[str] = Field(default_factory=list)
    evidence: List[str] = Field(default_factory=list)
    implications: List[str] = Field(default_factory=list)
    trade_offs: List[str] = Field(default_factory=list)
    what_to_watch: List[str] = Field(default_factory=list)
    possible_actions: List[str] = Field(default_factory=list)
    confidence_score: float = 0.90

