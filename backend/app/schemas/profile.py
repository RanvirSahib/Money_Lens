"""
Financial Profile Schemas for MoneyLens.
Provides Pydantic models for user financial profile management, breakdown calculations, and discrepancy detection.
"""

from datetime import datetime, date
from typing import Optional, List, Dict, Any, Union
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
    created_at: Optional[Union[str, datetime]] = None
    updated_at: Optional[Union[str, datetime]] = None


class DiscrepancyComparison(BaseModel):
    metric: str
    profile_value: float
    statement_value: float
    variance: float
    variance_pct: float
    note: str
    recommendation: str


class UserEMIBase(BaseModel):
    name: str = Field(..., min_length=1, description="Loan or EMI description, e.g. HDFC Home Loan")
    category: str = Field(default="Personal Loan", description="Category of loan, e.g. Home Loan, Auto Loan, Personal Loan, Education Loan, Gadget EMI, Credit Card EMI")
    principal_amount: float = Field(..., ge=0, description="Outstanding principal or total loan amount in INR")
    interest_rate_pct: float = Field(..., ge=0, description="Annual interest rate percentage p.a. (e.g. 8.5)")
    tenure_months: int = Field(default=12, ge=1, description="Total tenure in months")
    remaining_months: Optional[int] = Field(default=None, ge=1, description="Remaining months to pay")
    monthly_emi: Optional[float] = Field(default=None, ge=0, description="Monthly EMI in INR (calculated deterministically if not provided)")
    start_date: Optional[Union[str, date]] = Field(default=None, description="Start date of loan in YYYY-MM-DD")


class UserEMICreate(UserEMIBase):
    pass


class UserEMIUpdate(BaseModel):
    name: Optional[str] = None
    category: Optional[str] = None
    principal_amount: Optional[float] = Field(None, ge=0)
    interest_rate_pct: Optional[float] = Field(None, ge=0)
    tenure_months: Optional[int] = Field(None, ge=1)
    remaining_months: Optional[int] = Field(None, ge=1)
    monthly_emi: Optional[float] = Field(None, ge=0)
    start_date: Optional[Union[str, date]] = None


class UserEMIResponse(UserEMIBase):
    id: str
    user_id: str
    monthly_emi: float
    remaining_months: int
    total_interest_payable: float
    created_at: Optional[Union[str, datetime]] = None
    updated_at: Optional[Union[str, datetime]] = None


class UserSubscriptionBase(BaseModel):
    name: str = Field(..., min_length=1, description="Subscription name, e.g. Netflix, Amazon Prime")
    category: str = Field(default="Streaming", description="Category: Streaming, Tech & Cloud, Fitness & Wellness, Utilities, Insurance, Other")
    billing_frequency: str = Field(default="monthly", description="Billing cycle: monthly, yearly, quarterly")
    amount: float = Field(..., ge=0, description="Amount billed per cycle in INR")
    renewal_date: Optional[Union[str, date]] = Field(default=None, description="Next billing / renewal date in YYYY-MM-DD")
    status: str = Field(default="active", description="Subscription status: active, paused, cancelled")
    auto_renew: bool = Field(default=True, description="Whether subscription is set to auto-renew")


class UserSubscriptionCreate(UserSubscriptionBase):
    pass


class UserSubscriptionUpdate(BaseModel):
    name: Optional[str] = None
    category: Optional[str] = None
    billing_frequency: Optional[str] = None
    amount: Optional[float] = Field(None, ge=0)
    renewal_date: Optional[Union[str, date]] = None
    status: Optional[str] = None
    auto_renew: Optional[bool] = None


class UserSubscriptionResponse(UserSubscriptionBase):
    id: str
    user_id: str
    monthly_equivalent: float
    annual_cost: float
    created_at: Optional[Union[str, datetime]] = None
    updated_at: Optional[Union[str, datetime]] = None


class UserInvestmentBase(BaseModel):
    name: str = Field(..., min_length=1, description="Investment / SIP name, e.g. Nifty 50 Index Fund, PPF")
    category: str = Field(default="Mutual Fund SIP", description="Category: Mutual Fund SIP, Direct Stocks / Smallcase, PPF / EPF / VPF, NPS / Retirement, Fixed / Recurring Deposit, Gold / Commodities, Other SIP")
    asset_class: str = Field(default="Equity", description="Asset class: Equity, Debt / Fixed Income, Hybrid / Balanced, Commodities / Gold, Retirement / Pension")
    monthly_amount: float = Field(..., ge=0, description="Monthly SIP or investment contribution amount in INR")
    expected_return_pct: float = Field(default=12.0, ge=0, description="Expected annual return percentage (% p.a.)")
    sip_date: Optional[int] = Field(default=None, ge=1, le=31, description="Day of month for SIP deduction (1-31)")
    status: str = Field(default="active", description="Investment status: active, paused, completed")


class UserInvestmentCreate(UserInvestmentBase):
    pass


class UserInvestmentUpdate(BaseModel):
    name: Optional[str] = None
    category: Optional[str] = None
    asset_class: Optional[str] = None
    monthly_amount: Optional[float] = Field(None, ge=0)
    expected_return_pct: Optional[float] = Field(None, ge=0)
    sip_date: Optional[int] = Field(None, ge=1, le=31)
    status: Optional[str] = None


class UserInvestmentResponse(UserInvestmentBase):
    id: str
    user_id: str
    annual_contribution: float
    created_at: Optional[Union[str, datetime]] = None
    updated_at: Optional[Union[str, datetime]] = None
