"""
Experiment Service.
Evaluates and compares multiple parallel financial scenarios side-by-side.
Provides objective metrics, risk ratings, and trade-off summaries without prescriptive advice.
"""

import math
from typing import List, Dict, Any
from app.utils.calculations import (
    calculate_monthly_surplus,
    calculate_emi,
    project_savings_trajectory
)
from app.schemas.experiments import (
    ExperimentCompareRequest,
    ExperimentCompareResponse,
    ScenarioInput,
    ScenarioType,
    ScenarioMetricResult
)


class ExperimentService:
    """Experiment Lab comparison engine."""

    @staticmethod
    def compare_scenarios(req: ExperimentCompareRequest) -> ExperimentCompareResponse:
        results: List[ScenarioMetricResult] = []
        
        base_income = req.monthly_income
        base_expenses = req.monthly_expenses
        base_savings = req.current_savings
        base_emi = req.existing_emi
        target_goal = req.target_goal_amount or 500000.0
        target_months = req.target_goal_months or 12

        for sc in req.scenarios:
            # Determine scenario adjustments
            adjusted_expenses = base_expenses + (sc.expense_adjustment or 0.0)
            
            if sc.scenario_type == ScenarioType.NO_PURCHASE:
                monthly_surplus = calculate_monthly_surplus(base_income, adjusted_expenses, base_emi)
                immediate_savings = base_savings
                total_extra_cost = 0.0
                
                proj = project_savings_trajectory(
                    current_savings=immediate_savings,
                    monthly_income=base_income,
                    monthly_expenses=adjusted_expenses,
                    existing_emi=base_emi,
                    duration_months=24
                )
                
                # Goal feasibility check
                savings_at_goal_target = proj["monthly_trajectory"][min(len(proj["monthly_trajectory"]) - 1, target_months - 1)]["closing_balance"]
                goal_reachable = savings_at_goal_target >= target_goal
                goal_completion_months = math.ceil(target_goal / monthly_surplus) if monthly_surplus > 0 else None
                
                risk = "Low" if (immediate_savings / adjusted_expenses) >= 3 else "Moderate"
                trade_off = "Maximizes liquidity preservation and goal progress; foregoes purchase."

            elif sc.scenario_type == ScenarioType.CASH_PURCHASE:
                purchase_amt = sc.purchase_amount or 0.0
                immediate_savings = base_savings - purchase_amt
                monthly_surplus = calculate_monthly_surplus(base_income, adjusted_expenses, base_emi)
                total_extra_cost = purchase_amt

                proj = project_savings_trajectory(
                    current_savings=immediate_savings,
                    monthly_income=base_income,
                    monthly_expenses=adjusted_expenses,
                    existing_emi=base_emi,
                    duration_months=24
                )

                savings_at_goal_target = proj["monthly_trajectory"][min(len(proj["monthly_trajectory"]) - 1, target_months - 1)]["closing_balance"]
                goal_reachable = savings_at_goal_target >= target_goal
                remaining_for_goal = max(0.0, target_goal - max(0.0, immediate_savings))
                goal_completion_months = math.ceil(remaining_for_goal / monthly_surplus) if monthly_surplus > 0 else None

                emergency_months = immediate_savings / adjusted_expenses if adjusted_expenses > 0 else 0.0
                if immediate_savings < 0:
                    risk = "Critical (Negative Savings)"
                elif emergency_months < 1.0:
                    risk = "High (Emergency Runway < 1 month)"
                elif emergency_months < 3.0:
                    risk = "Moderate (Emergency Runway < 3 months)"
                else:
                    risk = "Low"

                trade_off = f"0% interest cost, but drains ₹{purchase_amt:,.2f} immediate liquidity and delays goal."

            elif sc.scenario_type == ScenarioType.EMI_PURCHASE:
                purchase_amt = sc.purchase_amount or 0.0
                down_payment = sc.down_payment or 0.0
                interest_rate = sc.annual_interest_rate_pct if sc.annual_interest_rate_pct is not None else 12.0
                tenure = sc.tenure_months or 12

                loan_amount = max(0.0, purchase_amt - down_payment)
                emi_res = calculate_emi(loan_amount, interest_rate, tenure)
                monthly_emi = emi_res["monthly_emi"]
                total_extra_cost = down_payment + emi_res["total_repayment"]

                immediate_savings = base_savings - down_payment
                
                # Active monthly surplus during tenure
                monthly_surplus_during_tenure = calculate_monthly_surplus(
                    base_income, adjusted_expenses, base_emi + monthly_emi
                )
                
                # Month-by-month projection accounting for EMI end date
                running_savings = immediate_savings
                milestones: Dict[str, float] = {}
                trajectory: List[Dict[str, Any]] = []

                for m in range(1, 25):
                    active_surplus = monthly_surplus_during_tenure if m <= tenure else calculate_monthly_surplus(base_income, adjusted_expenses, base_emi)
                    running_savings += active_surplus
                    trajectory.append({"month": m, "closing_balance": round(running_savings, 2)})
                    if m in [3, 6, 12, 24]:
                        milestones[f"{m}_months"] = round(running_savings, 2)

                savings_at_goal_target = trajectory[min(len(trajectory) - 1, target_months - 1)]["closing_balance"]
                goal_reachable = savings_at_goal_target >= target_goal
                goal_completion_months = None
                for pt in trajectory:
                    if pt["closing_balance"] >= target_goal:
                        goal_completion_months = pt["month"]
                        break

                monthly_surplus = monthly_surplus_during_tenure

                # Risk check based on DTI and remaining surplus
                dti = (base_emi + monthly_emi) / base_income if base_income > 0 else 1.0
                if monthly_surplus < 0:
                    risk = "Critical (Deficit Cash Flow)"
                elif dti > 0.40:
                    risk = "High (DTI > 40%)"
                else:
                    risk = "Moderate"

                trade_off = f"Preserves ₹{loan_amount:,.2f} liquidity upfront; incurs ₹{emi_res['total_interest']:,.2f} interest and tightens cash flow for {tenure} months."

                results.append(ScenarioMetricResult(
                    scenario_id=sc.scenario_id,
                    scenario_name=sc.scenario_name,
                    scenario_type=sc.scenario_type,
                    monthly_surplus=round(monthly_surplus, 2),
                    immediate_savings_after_action=round(immediate_savings, 2),
                    projected_savings_3_months=milestones.get("3_months", 0.0),
                    projected_savings_6_months=milestones.get("6_months", 0.0),
                    projected_savings_12_months=milestones.get("12_months", 0.0),
                    projected_savings_24_months=milestones.get("24_months", 0.0),
                    emergency_fund_coverage_months=round(immediate_savings / adjusted_expenses, 1) if adjusted_expenses > 0 else 0.0,
                    goal_completion_months=goal_completion_months,
                    goal_reachable_in_target_timeline=goal_reachable,
                    total_interest_or_cost_paid=round(emi_res["total_interest"], 2),
                    risk_level=risk,
                    trade_off_summary=trade_off
                ))
                continue

            else:  # CUSTOM
                monthly_surplus = calculate_monthly_surplus(base_income, adjusted_expenses, base_emi)
                immediate_savings = base_savings
                proj = project_savings_trajectory(
                    current_savings=immediate_savings,
                    monthly_income=base_income,
                    monthly_expenses=adjusted_expenses,
                    existing_emi=base_emi,
                    duration_months=24
                )
                savings_at_goal_target = proj["monthly_trajectory"][min(len(proj["monthly_trajectory"]) - 1, target_months - 1)]["closing_balance"]
                goal_reachable = savings_at_goal_target >= target_goal
                goal_completion_months = math.ceil(target_goal / monthly_surplus) if monthly_surplus > 0 else None
                risk = "Low"
                trade_off = "Custom scenario parameters."

            # Append result for non-EMI branches
            results.append(ScenarioMetricResult(
                scenario_id=sc.scenario_id,
                scenario_name=sc.scenario_name,
                scenario_type=sc.scenario_type,
                monthly_surplus=round(monthly_surplus, 2),
                immediate_savings_after_action=round(immediate_savings, 2),
                projected_savings_3_months=proj["milestones"].get("3_months", 0.0),
                projected_savings_6_months=proj["milestones"].get("6_months", 0.0),
                projected_savings_12_months=proj["milestones"].get("12_months", 0.0),
                projected_savings_24_months=proj["milestones"].get("24_months", 0.0),
                emergency_fund_coverage_months=round(immediate_savings / adjusted_expenses, 1) if adjusted_expenses > 0 else 0.0,
                goal_completion_months=goal_completion_months,
                goal_reachable_in_target_timeline=goal_reachable,
                total_interest_or_cost_paid=round(total_extra_cost, 2),
                risk_level=risk,
                trade_off_summary=trade_off
            ))

        # Insights generated purely deterministically
        insights = [
            f"Evaluated {len(results)} scenarios against baseline monthly income ₹{base_income:,.2f} and savings ₹{base_savings:,.2f}",
            f"Target goal of ₹{target_goal:,.2f} in {target_months} months analyzed for all paths",
            "Comparative balance and liquidity runways generated across 3, 6, 12, and 24 months"
        ]

        return ExperimentCompareResponse(
            base_profile={
                "monthly_income": base_income,
                "monthly_expenses": base_expenses,
                "current_savings": base_savings,
                "existing_emi": base_emi,
                "target_goal_amount": target_goal,
                "target_goal_months": target_months
            },
            comparison_matrix=results,
            summary_insights=insights,
            assumptions=[
                "Income and expense streams remain constant over the 24-month projection window",
                "EMI interest calculated via standard reducing-balance amortization",
                "No penalty fees, prepayments, or tax deductions are factored"
            ]
        )


experiment_service = ExperimentService()
