"""
Pydantic Schemas for Financial Radar.
Deterministic rule-based anomaly, risk, and cash flow alert detection.
"""

from typing import List, Dict, Any, Optional
from datetime import date
from enum import Enum
from pydantic import BaseModel, Field
from app.schemas.common import SeverityLevel, HealthStatus


class AlertCategory(str, Enum):
    RECURRING_EXPENSE = "recurring_expense"
    HIGH_EXPENSE_ANOMALY = "high_expense_anomaly"
    LOW_BALANCE_RISK = "low_balance_risk"
    CASH_FLOW_SHORTAGE = "cash_flow_shortage"
    DEBT_BURDEN_RISK = "debt_burden_risk"


class RadarAlert(BaseModel):
    id: str = Field(..., examples=["alert_rec_01"])
    category: AlertCategory
    severity: SeverityLevel
    title: str = Field(..., examples=["Upcoming Recurring Commitments"])
    message: str = Field(..., examples=["Monthly recurring commitments amount to ₹25,000 (31.2% of income)."])
    metric_value: float
    threshold_value: float
    trigger_rule: str
    impact: str


class RadarProfileRequest(BaseModel):
    monthly_income: Optional[float] = Field(default=None, ge=0, examples=[80000.0])
    monthly_expenses: Optional[float] = Field(default=None, ge=0, examples=[45000.0])
    current_savings: Optional[float] = Field(default=None, ge=0, examples=[200000.0])
    existing_emi: Optional[float] = Field(default=None, ge=0, examples=[5000.0])
    context_note: Optional[str] = Field(
        default=None,
        max_length=300,
        examples=["Reviewing financial risk signals after a high monthly expense."],
        description="Optional brief context note passed to the AI insight service"
    )


class FinancialRadarResponse(BaseModel):
    overall_health: HealthStatus
    health_score: int = Field(..., ge=0, le=100, examples=[78], description="Deterministic 0-100 financial health index")
    total_alerts: int
    alerts: List[RadarAlert]
    metrics_summary: Dict[str, Any]
    radar_rules_evaluated: int
    assumptions: List[str]


class FinancialRadarAnalysisResponse(BaseModel):
    calculation: FinancialRadarResponse
    ai_insight: Dict[str, Any]

