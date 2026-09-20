"""
Financial Profile Schemas for MoneyLens.
Provides Pydantic models for user financial profile management, breakdown calculations, and discrepancy detection.
"""

from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field


class FinancialProfileBase(BaseModel):
    name: str = Field(default="User", description="User's display name")
    monthly_income: float = Field(default=0.0, ge=0, description="Gross monthly income in INR")
    essential_expenses: float = Field(default=0.0, ge=0, description="Essential monthly expenses (housing, utilities, groceries, healthcare)")
    discretionary_expenses: float = Field(default=0.0, ge=0, description="Discretionary expenses (dining, entertainment, shopping)")
    current_savings: float = Field(default=0.0, ge=0, description="Total current liquid savings and emergency funds")
    monthly_investments: float = Field(default=0.0, ge=0, description="Monthly SIPs, mutual funds, PF, equities")
    active_emis: float = Field(default=0.0, ge=0, description="Total monthly EMI obligations")
    active_loans: float = Field(default=0.0, ge=0, description="Total outstanding loan principal balance")
    other_recurring_expenses: float = Field(default=0.0, ge=0, description="Insurance premiums, annual subscriptions amortized monthly, etc.")


class FinancialProfileCreate(FinancialProfileBase):
    pass


class FinancialProfileUpdate(BaseModel):
    name: Optional[str] = None
    monthly_income: Optional[float] = Field(None, ge=0)
    essential_expenses: Optional[float] = Field(None, ge=0)
    discretionary_expenses: Optional[float] = Field(None, ge=0)
    current_savings: Optional[float] = Field(None, ge=0)
    monthly_investments: Optional[float] = Field(None, ge=0)
    active_emis: Optional[float] = Field(None, ge=0)
    active_loans: Optional[float] = Field(None, ge=0)
    other_recurring_expenses: Optional[float] = Field(None, ge=0)


class FinancialProfileResponse(FinancialProfileBase):
    id: str
    user_id: str
    total_monthly_expenses: float
    monthly_surplus: float
    savings_rate_pct: float
    dti_ratio_pct: float
    emergency_fund_runway_months: float
    health_score: int
    created_at: Optional[str] = None
    updated_at: Optional[str] = None


class DiscrepancyComparison(BaseModel):
    metric: str
    profile_value: float
    statement_value: float
    variance: float
    variance_pct: float
    note: str
    recommendation: str
