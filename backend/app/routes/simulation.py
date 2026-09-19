from fastapi import APIRouter, status, HTTPException
from app.schemas.simulation import (
    FinancialPositionRequest,
    FinancialPositionResponse,
    PurchaseSimulationRequest,
    PurchaseSimulationResponse,
    PurchaseSimulationAnalysisResponse,
    EMISimulationRequest,
    EMISimulationResponse,
    EMISimulationAnalysisResponse,
    SavingsProjectionRequest,
    SavingsProjectionResponse,
    SavingsSimulationAnalysisResponse,
)
from app.services.simulation_service import simulation_service
from app.services.ai_insight_service import ai_insight_service, AIInsightServiceError

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
    "/purchase/analyze",
    response_model=PurchaseSimulationAnalysisResponse,
    status_code=status.HTTP_200_OK,
    summary="Simulate an upfront cash purchase with AI Time Machine insight"
)
def simulate_and_analyze_purchase(payload: PurchaseSimulationRequest):
    """
    Simulate cash purchase impact and generate AI Time Machine explanation.
    Combines baseline position + purchase simulation output into AI time_machine analysis.
    """
    try:
        return ai_insight_service.analyze_purchase_simulation(
            req=payload,
            context_note=payload.context_note
        )
    except AIInsightServiceError as exc:
        raise HTTPException(status_code=exc.status_code, detail=exc.message)
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"An unexpected error occurred during purchase AI analysis: {str(exc)}"
        )


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
    "/emi/analyze",
    response_model=EMISimulationAnalysisResponse,
    status_code=status.HTTP_200_OK,
    summary="Simulate an EMI financed purchase with AI Time Machine insight"
)
def simulate_and_analyze_emi(payload: EMISimulationRequest):
    """
    Simulate EMI loan impact and generate AI Time Machine explanation.
    Combines baseline position + EMI simulation output into AI time_machine analysis.
    """
    try:
        return ai_insight_service.analyze_emi_simulation(
            req=payload,
            context_note=payload.context_note
        )
    except AIInsightServiceError as exc:
        raise HTTPException(status_code=exc.status_code, detail=exc.message)
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"An unexpected error occurred during EMI AI analysis: {str(exc)}"
        )


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


@router.post(
    "/savings/analyze",
    response_model=SavingsSimulationAnalysisResponse,
    status_code=status.HTTP_200_OK,
    summary="Project future compounding savings trajectory with AI Time Machine insight"
)
def simulate_and_analyze_savings(payload: SavingsProjectionRequest):
    """
    Project savings trajectory and generate AI Time Machine explanation.
    Combines baseline position + savings projection output into AI time_machine analysis.
    """
    try:
        return ai_insight_service.analyze_savings_simulation(
            req=payload,
            context_note=payload.context_note
        )
    except AIInsightServiceError as exc:
        raise HTTPException(status_code=exc.status_code, detail=exc.message)
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"An unexpected error occurred during savings AI analysis: {str(exc)}"
        )

