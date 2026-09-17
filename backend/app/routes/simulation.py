"""
Simulation API Routes.
Provides endpoints for position, purchase, EMI, and future savings simulations.
"""

from fastapi import APIRouter, status
from app.schemas.simulation import (
    FinancialPositionRequest,
    FinancialPositionResponse,
    PurchaseSimulationRequest,
    PurchaseSimulationResponse,
    EMISimulationRequest,
    EMISimulationResponse,
    SavingsProjectionRequest,
    SavingsProjectionResponse,
)
from app.services.simulation_service import simulation_service

router = APIRouter(prefix="/simulate", tags=["Simulation Engine"])


@router.post(
    "/position",
    response_model=FinancialPositionResponse,
    status_code=status.HTTP_200_OK,
    summary="Evaluate current financial position"
)
def get_current_position(payload: FinancialPositionRequest):
    """
    Calculate baseline financial metrics:
    - Monthly Surplus = Income - (Expenses + Existing EMI)
    - Savings Rate (%)
    - Emergency Fund coverage (in months)
    - Projected balances at 3, 6, and 12 months
    """
    return simulation_service.get_financial_position(payload)


@router.post(
    "/purchase",
    response_model=PurchaseSimulationResponse,
    status_code=status.HTTP_200_OK,
    summary="Simulate an upfront cash purchase"
)
def simulate_purchase(payload: PurchaseSimulationRequest):
    """
    Simulate the effect of a one-time cash purchase:
    - Immediate impact on liquid savings
    - Post-purchase emergency runway
    - Months required to recover the cost from monthly surplus
    - Side-by-side projected savings (with vs without purchase) over 3, 6, and 12 months
    """
    return simulation_service.simulate_purchase(payload)


@router.post(
    "/emi",
    response_model=EMISimulationResponse,
    status_code=status.HTTP_200_OK,
    summary="Simulate an EMI financed purchase"
)
def simulate_emi(payload: EMISimulationRequest):
    """
    Simulate an installment / loan financed purchase using the standard reducing-balance formula:
    - Down payment & Loan principal
    - Monthly EMI calculation
    - Total repayment and total interest cost
    - Constrained monthly surplus during loan tenure vs post-tenure recovery
    - Projected savings over 3, 6, and 12 months
    """
    return simulation_service.simulate_emi(payload)


@router.post(
    "/savings",
    response_model=SavingsProjectionResponse,
    status_code=status.HTTP_200_OK,
    summary="Project future compounding savings trajectory"
)
def simulate_savings(payload: SavingsProjectionRequest):
    """
    Project future savings trajectory month-by-month:
    - Compounding interest / investment growth
    - Monthly contributions
    - Milestones at 3, 6, 12, 24, 36, 60 months
    """
    return simulation_service.project_savings(payload)
