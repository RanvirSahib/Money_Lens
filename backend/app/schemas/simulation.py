"""
Pydantic Schemas for Financial Simulation Engine.
Contains models for Financial Position, Purchase Simulation, EMI Simulation, and Savings Projections.
"""

from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field


# ------------------ Financial Position ------------------
class FinancialPositionRequest(BaseModel):
    monthly_income: float = Field(..., ge=0, examples=[80000.0], description="Gross monthly income")
    monthly_expenses: float = Field(..., ge=0, examples=[45000.0], description="Regular monthly living expenses")
    current_savings: float = Field(..., ge=0, examples=[200000.0], description="Current liquid bank savings / corpus")
    existing_emi: float = Field(default=0.0, ge=0, examples=[5000.0], description="Ongoing monthly loan/EMI commitments")


class FinancialPositionResponse(BaseModel):
    monthly_income: float
    monthly_expenses: float
    existing_emi: float
    monthly_surplus: float
    savings_rate_pct: float
    current_savings: float
    emergency_fund_months: float
    projected_balance_3_months: float
    projected_balance_6_months: float
    projected_balance_12_months: float
    assumptions: List[str]


# ------------------ Purchase Simulation ------------------
class PurchaseSimulationRequest(BaseModel):
    monthly_income: float = Field(..., ge=0, examples=[80000.0])
    monthly_expenses: float = Field(..., ge=0, examples=[45000.0])
    current_savings: float = Field(..., ge=0, examples=[200000.0])
    purchase_amount: float = Field(..., gt=0, examples=[70000.0], description="Upfront cost of the desired purchase")
    existing_emi: float = Field(default=0.0, ge=0, examples=[0.0])
    duration_months: int = Field(default=12, ge=3, le=60, examples=[12])


class TrajectoryPoint(BaseModel):
    month: int
    starting_balance: float
    monthly_surplus: float
    interest_earned: float
    closing_balance: float


class PurchaseSimulationResponse(BaseModel):
    scenario: str = "upfront_cash_purchase"
    purchase_amount: float
    initial_savings: float
    post_purchase_savings: float
    monthly_surplus: float
    months_to_recover_cost: Optional[int]
    emergency_fund_runway_months: float
    is_savings_depleted: bool
    baseline_projected_savings: Dict[str, float] = Field(
        ...,
        examples=[{"3_months": 305000.0, "6_months": 410000.0, "12_months": 620000.0}]
    )
    post_purchase_projected_savings: Dict[str, float] = Field(
        ...,
        examples=[{"3_months": 235000.0, "6_months": 340000.0, "12_months": 550000.0}]
    )
    monthly_trajectory: List[TrajectoryPoint]
    assumptions: List[str]


# ------------------ EMI Simulation ------------------
class EMISimulationRequest(BaseModel):
    purchase_amount: float = Field(..., gt=0, examples=[70000.0], description="Total price of item")
    down_payment: float = Field(default=0.0, ge=0, examples=[10000.0], description="Upfront down payment paid from savings")
    annual_interest_rate_pct: float = Field(..., ge=0, le=100, examples=[12.0], description="Annual loan interest rate %")
    tenure_months: int = Field(..., gt=0, le=360, examples=[12], description="Loan duration in months")
    monthly_income: float = Field(..., ge=0, examples=[80000.0])
    monthly_expenses: float = Field(..., ge=0, examples=[45000.0])
    current_savings: float = Field(..., ge=0, examples=[200000.0])
    existing_emi: float = Field(default=0.0, ge=0, examples=[0.0])


class EMISimulationResponse(BaseModel):
    scenario: str = "emi_financed_purchase"
    purchase_amount: float
    down_payment: float
    loan_amount: float
    annual_interest_rate_pct: float
    tenure_months: int
    monthly_emi: float
    total_repayment: float
    total_interest: float
    interest_to_principal_ratio_pct: float
    new_monthly_surplus_during_tenure: float
    monthly_surplus_after_tenure: float
    savings_at_purchase: float
    projected_savings: Dict[str, float] = Field(
        ...,
        examples=[{"3_months": 273000.0, "6_months": 357000.0, "12_months": 524000.0}]
    )
    impact_analysis: Dict[str, Any]
    assumptions: List[str]


# ------------------ Savings Projection ------------------
class SavingsProjectionRequest(BaseModel):
    current_savings: float = Field(..., ge=0, examples=[200000.0])
    monthly_income: float = Field(..., ge=0, examples=[80000.0])
    monthly_expenses: float = Field(..., ge=0, examples=[45000.0])
    existing_emi: float = Field(default=0.0, ge=0, examples=[0.0])
    monthly_growth_rate_pct: float = Field(default=0.0, ge=0, examples=[0.0])
    annual_return_pct: Optional[float] = Field(default=7.0, ge=0, le=100, examples=[7.0], description="Expected annual investment return %")
    duration_months: int = Field(default=12, ge=1, le=120, examples=[12])


class SavingsProjectionResponse(BaseModel):
    starting_savings: float
    monthly_surplus: float
    duration_months: int
    final_projected_savings: float
    total_net_contributions: float
    total_interest_earned: float
    milestones: Dict[str, float]
    monthly_trajectory: List[TrajectoryPoint]
    assumptions: List[str]
