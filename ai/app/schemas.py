"""
MoneyLens AI Service — Pydantic Schemas.

Each of the five MoneyLens AI modes has its own strongly-typed input model so
the financial-engine output is always passed in a well-structured form.
The single POST /analyze endpoint discriminates on `analysis_type`.

Design principles
-----------------
- The AI receives ONLY data already computed by the financial engine.
- No mode allows arbitrary free-text that could lead the model to invent numbers.
- `context_note` is the only free-text field and is capped at 300 chars.
- All financial sub-models are kept Optional so callers supply only what the
  engine has produced; the AI will note anything genuinely absent.
"""

from __future__ import annotations

from enum import Enum
from typing import Any, Dict, List, Optional
from pydantic import BaseModel, Field


# ---------------------------------------------------------------------------
# Analysis-type discriminator
# ---------------------------------------------------------------------------

class AnalysisType(str, Enum):
    """The five MoneyLens AI modes."""
    TIME_MACHINE       = "time_machine"
    GOAL_ANALYSIS      = "goal_analysis"
    REVERSE_ANALYSIS   = "reverse_analysis"
    EXPERIMENT_ANALYSIS = "experiment_analysis"
    RADAR_ANALYSIS     = "radar_analysis"


# ---------------------------------------------------------------------------
# Shared sub-models (mirror MoneyLens financial-engine output shapes)
# ---------------------------------------------------------------------------

class FinancialPosition(BaseModel):
    """Snapshot of the user's current financial position."""

    monthly_income: Optional[float] = Field(
        default=None, examples=[80000.0], description="Gross monthly income in INR"
    )
    monthly_expenses: Optional[float] = Field(
        default=None, examples=[45000.0], description="Regular monthly living expenses in INR"
    )
    existing_emi: Optional[float] = Field(
        default=None, examples=[5000.0], description="Ongoing monthly EMI / loan commitments"
    )
    monthly_surplus: Optional[float] = Field(
        default=None, examples=[30000.0], description="Net monthly surplus (income − expenses − EMI)"
    )
    savings_rate_pct: Optional[float] = Field(
        default=None, examples=[37.5], description="Savings rate as a percentage of income"
    )
    current_savings: Optional[float] = Field(
        default=None, examples=[200000.0], description="Current liquid savings / corpus"
    )
    emergency_fund_months: Optional[float] = Field(
        default=None, examples=[4.4],
        description="How many months of expenses the current savings covers"
    )
    projected_balance_3_months: Optional[float] = Field(default=None, examples=[290000.0])
    projected_balance_6_months: Optional[float] = Field(default=None, examples=[380000.0])
    projected_balance_12_months: Optional[float] = Field(default=None, examples=[560000.0])


class SimulationResult(BaseModel):
    """Output from any MoneyLens simulation engine (purchase, EMI, savings)."""

    scenario: Optional[str] = Field(
        default=None, examples=["emi_financed_purchase"],
        description="Scenario label returned by the simulation engine"
    )
    data: Dict[str, Any] = Field(
        default_factory=dict,
        description="Full simulation result payload as returned by the financial engine"
    )


class FinancialGoal(BaseModel):
    """A tracked financial goal and its current engine-computed status."""

    title: Optional[str] = Field(default=None, examples=["Emergency Fund"])
    target_amount: Optional[float] = Field(default=None, examples=[500000.0])
    current_savings_allocated: Optional[float] = Field(default=None, examples=[50000.0])
    target_months: Optional[int] = Field(default=None, examples=[12])
    required_monthly_saving: Optional[float] = Field(default=None, examples=[25000.0])
    monthly_gap_or_shortfall: Optional[float] = Field(default=None, examples=[-5000.0])
    is_reachable: Optional[bool] = Field(default=None)
    projected_completion_months: Optional[int] = Field(default=None, examples=[14])
    status: Optional[str] = Field(
        default=None, examples=["on_track", "at_risk", "behind"]
    )
    status_description: Optional[str] = Field(default=None)


class RadarAlert(BaseModel):
    """A single financial radar alert produced by the rule-based engine."""

    id: Optional[str] = Field(default=None, examples=["alert_debt_01"])
    category: Optional[str] = Field(default=None, examples=["debt_burden_risk"])
    severity: Optional[str] = Field(default=None, examples=["high", "medium", "low"])
    title: Optional[str] = Field(default=None, examples=["High Debt-to-Income Ratio"])
    message: Optional[str] = Field(default=None)
    metric_value: Optional[float] = Field(default=None)
    threshold_value: Optional[float] = Field(default=None)
    impact: Optional[str] = Field(default=None)


class ScenarioComparison(BaseModel):
    """One scenario in an experiment-lab comparison (engine-computed metrics)."""

    scenario_id: str = Field(..., examples=["scenario_a"])
    scenario_name: str = Field(..., examples=["No Purchase (Status Quo)"])
    scenario_type: Optional[str] = Field(default=None, examples=["no_purchase"])
    monthly_surplus: Optional[float] = Field(default=None)
    projected_savings_12_months: Optional[float] = Field(default=None)
    projected_savings_24_months: Optional[float] = Field(default=None)
    emergency_fund_coverage_months: Optional[float] = Field(default=None)
    goal_reachable_in_target_timeline: Optional[bool] = Field(default=None)
    total_interest_or_cost_paid: Optional[float] = Field(default=None)
    risk_level: Optional[str] = Field(default=None, examples=["low", "medium", "high"])
    trade_off_summary: Optional[str] = Field(default=None)


class ReverseGoalData(BaseModel):
    """Output from the MoneyLens Reverse Goal engine."""

    target_amount: Optional[float] = Field(default=None, examples=[500000.0])
    target_months: Optional[int] = Field(default=None, examples=[12])
    required_monthly_saving: Optional[float] = Field(default=None, examples=[35000.0])
    current_monthly_surplus: Optional[float] = Field(default=None, examples=[28000.0])
    additional_monthly_needed: Optional[float] = Field(default=None, examples=[7000.0])
    is_currently_sufficient: Optional[bool] = Field(default=None)
    alternative_timeline_months: Optional[int] = Field(
        default=None, examples=[16],
        description="Months to reach target at the current surplus rate"
    )
    actionable_levers: Dict[str, Any] = Field(
        default_factory=dict,
        description="Engine-computed levers (e.g. required expense reduction, income increase)"
    )


# ---------------------------------------------------------------------------
# Per-mode typed input models
# ---------------------------------------------------------------------------

class TimeMachineInput(BaseModel):
    """
    Input for time_machine mode.
    Explains the financial consequences of a simulated decision.
    """
    financial_position: Optional[FinancialPosition] = Field(
        default=None,
        description="Baseline financial snapshot before the simulated action"
    )
    simulation_result: Optional[SimulationResult] = Field(
        default=None,
        description="Engine output for the simulated decision (purchase / EMI / savings)"
    )
    goals: Optional[List[FinancialGoal]] = Field(
        default=None,
        description="Goals affected by the simulated decision"
    )
    radar_alerts: Optional[List[RadarAlert]] = Field(
        default=None,
        description="Any risk alerts flagged by the radar engine after the simulation"
    )


class GoalAnalysisInput(BaseModel):
    """
    Input for goal_analysis mode.
    Explains progress, timeline, and gap for one or more financial goals.
    """
    financial_position: Optional[FinancialPosition] = Field(
        default=None,
        description="Current financial position — provides context for goal feasibility"
    )
    goals: List[FinancialGoal] = Field(
        ..., min_length=1,
        description="One or more goals with engine-computed tracking data"
    )


class ReverseAnalysisInput(BaseModel):
    """
    Input for reverse_analysis mode.
    Explains what needs to change for the user to reach a desired financial target.
    """
    financial_position: Optional[FinancialPosition] = Field(
        default=None,
        description="Current financial snapshot for context"
    )
    reverse_goal: ReverseGoalData = Field(
        ...,
        description="Engine output from the reverse-goal calculation"
    )


class ExperimentAnalysisInput(BaseModel):
    """
    Input for experiment_analysis mode.
    Explains differences between multiple engine-computed scenarios.
    """
    financial_position: Optional[FinancialPosition] = Field(
        default=None,
        description="Base financial profile used across all scenarios"
    )
    scenarios: List[ScenarioComparison] = Field(
        ..., min_length=2,
        description="At least two engine-computed scenario results to compare"
    )
    goals: Optional[List[FinancialGoal]] = Field(
        default=None,
        description="Goals whose reachability changes across scenarios"
    )


class RadarAnalysisInput(BaseModel):
    """
    Input for radar_analysis mode.
    Explains financial events or risks detected by the MoneyLens Financial Radar.
    """
    financial_position: Optional[FinancialPosition] = Field(
        default=None,
        description="Financial snapshot that produced the radar findings"
    )
    radar_alerts: List[RadarAlert] = Field(
        ..., min_length=1,
        description="Alerts generated by the rule-based radar engine"
    )
    goals: Optional[List[FinancialGoal]] = Field(
        default=None,
        description="Goals relevant to the radar findings"
    )


# ---------------------------------------------------------------------------
# Top-level request model
# ---------------------------------------------------------------------------

class AnalyzeRequest(BaseModel):
    """
    Single structured request to the MoneyLens AI insight layer.

    `analysis_type` is required and selects the MoneyLens experience mode.
    Exactly one of the five typed input fields should be populated to match
    the chosen analysis_type.

    A short optional `context_note` may carry a brief frontend hint
    (e.g. "User asked about buying a laptop"). It must not duplicate or
    contradict numbers already in the structured fields.
    """

    analysis_type: AnalysisType = Field(
        ...,
        description="Which MoneyLens AI mode to activate",
        examples=["time_machine"],
    )

    context_note: Optional[str] = Field(
        default=None,
        max_length=300,
        description=(
            "Optional short hint from the frontend. "
            "Must not contain raw financial numbers not already in the structured input."
        ),
        examples=["User is evaluating whether to buy a laptop on EMI."],
    )

    # Mode-specific typed inputs — populate only the one matching analysis_type
    time_machine: Optional[TimeMachineInput] = Field(
        default=None,
        description="Required when analysis_type == 'time_machine'"
    )
    goal_analysis: Optional[GoalAnalysisInput] = Field(
        default=None,
        description="Required when analysis_type == 'goal_analysis'"
    )
    reverse_analysis: Optional[ReverseAnalysisInput] = Field(
        default=None,
        description="Required when analysis_type == 'reverse_analysis'"
    )
    experiment_analysis: Optional[ExperimentAnalysisInput] = Field(
        default=None,
        description="Required when analysis_type == 'experiment_analysis'"
    )
    radar_analysis: Optional[RadarAnalysisInput] = Field(
        default=None,
        description="Required when analysis_type == 'radar_analysis'"
    )


# ---------------------------------------------------------------------------
# Response model
# ---------------------------------------------------------------------------

class AnalyzeResponse(BaseModel):
    """
    Structured MoneyLens AI insight output.

    Follows the Observation → Evidence → Implication → Possible Action
    reasoning structure defined in the MoneyLens AI design principles.

    All list fields may be empty if nothing noteworthy exists in that category.
    Extend by adding new optional fields — do not remove existing ones.
    """

    analysis_type: str = Field(
        ...,
        description="Echo of the requested analysis_type for traceability",
        examples=["time_machine"],
    )
    summary: str = Field(
        ...,
        description="One-paragraph plain-language summary of the financial picture",
    )
    observations: List[str] = Field(
        default_factory=list,
        description="Factual observations drawn directly from the supplied engine data",
    )
    evidence: List[str] = Field(
        default_factory=list,
        description="Specific numbers or facts from the engine output that support the observations",
    )
    implications: List[str] = Field(
        default_factory=list,
        description="What the observations mean for the user's financial trajectory",
    )
    risks: List[str] = Field(
        default_factory=list,
        description="Financial risks or warning signals identified from the supplied data",
    )
    possible_actions: List[str] = Field(
        default_factory=list,
        description="Concrete steps the user could consider, grounded in the supplied data",
    )


# ---------------------------------------------------------------------------
# Health-check response
# ---------------------------------------------------------------------------

class HealthResponse(BaseModel):
    """Response shape for GET /health."""

    status: str = Field(..., examples=["healthy"])
    service: str = Field(..., examples=["MoneyLens AI Insight Service"])
    version: str = Field(..., examples=["1.0.0"])
    provider: str = Field(..., examples=["groq"])
    model: str = Field(..., examples=["openai/gpt-oss-120b"])
