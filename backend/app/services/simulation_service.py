"""
Simulation Service.
Orchestrates financial position, upfront purchase simulation, EMI simulation,
and future compounding savings projections.
"""

from typing import Dict, Any, List
from app.utils.calculations import (
    calculate_monthly_surplus,
    calculate_savings_rate,
    calculate_emi,
    project_savings_trajectory,
    calculate_purchase_impact
)
from app.schemas.simulation import (
    FinancialPositionRequest,
    FinancialPositionResponse,
    PurchaseSimulationRequest,
    PurchaseSimulationResponse,
    EMISimulationRequest,
    EMISimulationResponse,
    SavingsProjectionRequest,
    SavingsProjectionResponse,
    TrajectoryPoint
)


class SimulationService:
    """
    Business logic for financial simulations.
    All outputs are structured JSON ready for UI display or downstream AI consumption.
    """

    @staticmethod
    def get_financial_position(req: FinancialPositionRequest) -> FinancialPositionResponse:
        surplus = calculate_monthly_surplus(req.monthly_income, req.monthly_expenses, req.existing_emi)
        savings_rate = calculate_savings_rate(req.monthly_income, surplus)
        
        # 3, 6, 12 months baseline projection
        proj = project_savings_trajectory(
            current_savings=req.current_savings,
            monthly_income=req.monthly_income,
            monthly_expenses=req.monthly_expenses,
            existing_emi=req.existing_emi,
            duration_months=12
        )
        
        emergency_fund_months = round(
            req.current_savings / req.monthly_expenses, 1
        ) if req.monthly_expenses > 0 else 999.0

        return FinancialPositionResponse(
            monthly_income=round(req.monthly_income, 2),
            monthly_expenses=round(req.monthly_expenses, 2),
            existing_emi=round(req.existing_emi, 2),
            monthly_surplus=surplus,
            savings_rate_pct=savings_rate,
            current_savings=round(req.current_savings, 2),
            emergency_fund_months=emergency_fund_months,
            projected_balance_3_months=proj["milestones"].get("3_months", req.current_savings + 3 * surplus),
            projected_balance_6_months=proj["milestones"].get("6_months", req.current_savings + 6 * surplus),
            projected_balance_12_months=proj["milestones"].get("12_months", req.current_savings + 12 * surplus),
            assumptions=[
                f"Income remains fixed at ₹{req.monthly_income:,.2f}/month",
                f"Expenses remain fixed at ₹{req.monthly_expenses:,.2f}/month",
                f"Ongoing EMI liability of ₹{req.existing_emi:,.2f}/month",
                "Linear cash flow accumulation with zero interest return unless specified in projections"
            ]
        )

    @staticmethod
    def simulate_purchase(req: PurchaseSimulationRequest) -> PurchaseSimulationResponse:
        impact = calculate_purchase_impact(
            current_savings=req.current_savings,
            monthly_income=req.monthly_income,
            monthly_expenses=req.monthly_expenses,
            purchase_amount=req.purchase_amount,
            existing_emi=req.existing_emi,
            duration_months=req.duration_months
        )

        trajectory_points = [
            TrajectoryPoint(**p) for p in impact["monthly_trajectory"]
        ]

        return PurchaseSimulationResponse(
            scenario="upfront_cash_purchase",
            purchase_amount=impact["purchase_amount"],
            initial_savings=impact["initial_savings"],
            post_purchase_savings=impact["post_purchase_savings"],
            monthly_surplus=impact["monthly_surplus"],
            months_to_recover_cost=impact["months_to_recover_cost"],
            emergency_fund_runway_months=impact["emergency_fund_runway_months"],
            is_savings_depleted=impact["is_savings_depleted"],
            baseline_projected_savings=impact["baseline_milestones"],
            post_purchase_projected_savings=impact["post_purchase_milestones"],
            monthly_trajectory=trajectory_points,
            assumptions=impact["assumptions"]
        )

    @staticmethod
    def simulate_emi(req: EMISimulationRequest) -> EMISimulationResponse:
        # Net loan to be borrowed
        loan_amount = max(0.0, req.purchase_amount - req.down_payment)
        
        # Calculate standard reducing balance EMI
        emi_calc = calculate_emi(
            principal=loan_amount,
            annual_interest_rate_pct=req.annual_interest_rate_pct,
            tenure_months=req.tenure_months
        )
        monthly_emi = emi_calc["monthly_emi"]
        
        # Immediate post-downpayment savings
        savings_at_purchase = req.current_savings - req.down_payment

        # Monthly surplus during the EMI tenure (includes existing + new EMI)
        total_emi_during_tenure = req.existing_emi + monthly_emi
        surplus_during_tenure = calculate_monthly_surplus(
            req.monthly_income, req.monthly_expenses, total_emi_during_tenure
        )

        # Monthly surplus after EMI is fully repaid
        surplus_after_tenure = calculate_monthly_surplus(
            req.monthly_income, req.monthly_expenses, req.existing_emi
        )

        # Build 12-month projection under EMI financing
        emi_trajectory: List[Dict[str, Any]] = []
        running_savings = savings_at_purchase
        milestones: Dict[str, float] = {}

        for m in range(1, 13):
            # Check if this month is within tenure
            active_surplus = surplus_during_tenure if m <= req.tenure_months else surplus_after_tenure
            running_savings += active_surplus
            if m in [3, 6, 12]:
                milestones[f"{m}_months"] = round(running_savings, 2)

        # Debt-to-Income (DTI) ratio check
        dti_pct = round((total_emi_during_tenure / req.monthly_income * 100), 2) if req.monthly_income > 0 else 0.0

        impact_analysis = {
            "monthly_emi_burden_pct_of_income": round((monthly_emi / req.monthly_income * 100), 2) if req.monthly_income > 0 else 0.0,
            "total_debt_to_income_pct": dti_pct,
            "interest_premium_over_cash_purchase": emi_calc["total_interest"],
            "cash_buffer_retained_vs_upfront_cash": round(req.purchase_amount - req.down_payment, 2)
        }

        return EMISimulationResponse(
            scenario="emi_financed_purchase",
            purchase_amount=round(req.purchase_amount, 2),
            down_payment=round(req.down_payment, 2),
            loan_amount=round(loan_amount, 2),
            annual_interest_rate_pct=round(req.annual_interest_rate_pct, 2),
            tenure_months=req.tenure_months,
            monthly_emi=monthly_emi,
            total_repayment=emi_calc["total_repayment"],
            total_interest=emi_calc["total_interest"],
            interest_to_principal_ratio_pct=emi_calc["interest_to_principal_ratio"],
            new_monthly_surplus_during_tenure=surplus_during_tenure,
            monthly_surplus_after_tenure=surplus_after_tenure,
            savings_at_purchase=round(savings_at_purchase, 2),
            projected_savings=milestones,
            impact_analysis=impact_analysis,
            assumptions=[
                f"Down payment of ₹{req.down_payment:,.2f} deducted immediately from savings",
                f"Loan principal ₹{loan_amount:,.2f} financed at {req.annual_interest_rate_pct:.2f}% p.a. for {req.tenure_months} months",
                f"Monthly EMI of ₹{monthly_emi:,.2f} deducted during the {req.tenure_months}-month tenure",
                f"Surplus resets back to ₹{surplus_after_tenure:,.2f}/month after month {req.tenure_months}"
            ]
        )

    @staticmethod
    def project_savings(req: SavingsProjectionRequest) -> SavingsProjectionResponse:
        proj = project_savings_trajectory(
            current_savings=req.current_savings,
            monthly_income=req.monthly_income,
            monthly_expenses=req.monthly_expenses,
            existing_emi=req.existing_emi,
            monthly_growth_rate_pct=req.monthly_growth_rate_pct,
            annual_return_pct=req.annual_return_pct,
            duration_months=req.duration_months
        )

        trajectory_points = [
            TrajectoryPoint(**p) for p in proj["monthly_trajectory"]
        ]

        assumptions = [
            f"Monthly income constant at ₹{req.monthly_income:,.2f}",
            f"Monthly living expenses constant at ₹{req.monthly_expenses:,.2f}",
            f"Existing monthly EMI constant at ₹{req.existing_emi:,.2f}"
        ]
        if req.annual_return_pct and req.annual_return_pct > 0:
            assumptions.append(f"Compounding return on accumulated corpus at {req.annual_return_pct:.2f}% per annum")

        return SavingsProjectionResponse(
            starting_savings=proj["starting_savings"],
            monthly_surplus=proj["monthly_surplus"],
            duration_months=proj["duration_months"],
            final_projected_savings=proj["final_projected_savings"],
            total_net_contributions=proj["total_net_contributions"],
            total_interest_earned=proj["total_interest_earned"],
            milestones=proj["milestones"],
            monthly_trajectory=trajectory_points,
            assumptions=assumptions
        )


simulation_service = SimulationService()
