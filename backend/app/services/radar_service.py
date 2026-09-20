"""
Financial Radar Service.
Deterministic rule-based anomaly detection, liquidity warnings, and health assessment.
"""

from typing import List, Dict, Any, Optional
from app.core.config import settings
from app.services.transaction_service import transaction_repository
from app.repositories.postgres_profile_repo import PostgresProfileRepository
from app.schemas.common import SeverityLevel, HealthStatus
from app.schemas.radar import (
    RadarAlert,
    AlertCategory,
    RadarProfileRequest,
    FinancialRadarResponse
)
from app.utils.calculations import calculate_monthly_surplus, calculate_savings_rate


class RadarService:
    """Rule-based Financial Radar detection engine."""

    @staticmethod
    def evaluate_radar(
        profile: Optional[RadarProfileRequest] = None,
        user_id: Optional[str] = None
    ) -> FinancialRadarResponse:
        # Retrieve transactions from repository
        summary = transaction_repository.get_summary()
        all_txns = transaction_repository.get_all()

        # Try to load user's real financial profile if not explicitly overridden by profile request
        active_loans = 0.0
        monthly_investments = 0.0
        subscriptions_cost = 0.0

        if profile is None and user_id:
            try:
                profile_repo = PostgresProfileRepository()
                user_prof = profile_repo.get_profile(user_id)
                if user_prof and (user_prof.monthly_income > 0 or getattr(user_prof, 'total_monthly_expenses', 0) > 0 or user_prof.current_savings > 0):
                    monthly_income = float(user_prof.monthly_income or 0.0)
                    monthly_expenses = float(getattr(user_prof, 'total_monthly_expenses', 0) or (user_prof.essential_expenses + user_prof.discretionary_expenses + user_prof.active_emis + user_prof.other_recurring_expenses))
                    existing_emi = float(user_prof.active_emis or 0.0)
                    current_savings = float(user_prof.current_savings or 0.0)
                    active_loans = float(user_prof.active_loans or 0.0)
                    monthly_investments = float(user_prof.monthly_investments or 0.0)
                    subscriptions_cost = float(user_prof.other_recurring_expenses or 0.0)
                else:
                    monthly_income = summary.monthly_estimated_income if summary.monthly_estimated_income > 0 else 80000.0
                    monthly_expenses = summary.monthly_estimated_expenses if summary.monthly_estimated_expenses > 0 else 45000.0
                    existing_emi = 0.0
                    current_savings = 200000.0
            except Exception:
                monthly_income = summary.monthly_estimated_income if summary.monthly_estimated_income > 0 else 80000.0
                monthly_expenses = summary.monthly_estimated_expenses if summary.monthly_estimated_expenses > 0 else 45000.0
                existing_emi = 0.0
                current_savings = 200000.0
        else:
            monthly_income = (profile.monthly_income if profile and profile.monthly_income is not None 
                              else (summary.monthly_estimated_income if summary.monthly_estimated_income > 0 else 80000.0))
            monthly_expenses = (profile.monthly_expenses if profile and profile.monthly_expenses is not None 
                                else (summary.monthly_estimated_expenses if summary.monthly_estimated_expenses > 0 else 45000.0))
            existing_emi = (profile.existing_emi if profile and profile.existing_emi is not None else 0.0)
            current_savings = (profile.current_savings if profile and profile.current_savings is not None else 200000.0)

        if profile is not None:
            monthly_surplus = calculate_monthly_surplus(monthly_income, monthly_expenses, existing_emi)
        elif user_id:
            monthly_surplus = monthly_income - (monthly_expenses + monthly_investments)
        else:
            monthly_surplus = calculate_monthly_surplus(monthly_income, monthly_expenses, existing_emi)

        savings_rate = calculate_savings_rate(monthly_income, monthly_surplus)
        
        if monthly_expenses > 0:
            emergency_months = round(current_savings / monthly_expenses, 2)
        else:
            emergency_months = 999.0 if current_savings > 0 else 0.0

        if monthly_income > 0:
            debt_to_income_pct = round((existing_emi / monthly_income * 100), 2)
        else:
            debt_to_income_pct = 100.0 if existing_emi > 0 else 0.0

        alerts: List[RadarAlert] = []
        rules_evaluated = 0
        health_penalties = 0

        # Rule 1: Cash Flow & Surplus Intelligence
        rules_evaluated += 1
        if monthly_surplus < 0:
            health_penalties += 40
            alerts.append(RadarAlert(
                id="radar_cashflow_critical",
                category=AlertCategory.CASH_FLOW_SHORTAGE,
                severity=SeverityLevel.CRITICAL,
                title="Negative Monthly Cash Flow Deficit",
                message=f"Monthly outflows exceed income by ₹{abs(monthly_surplus):,.2f} per month.",
                metric_value=monthly_surplus,
                threshold_value=0.0,
                trigger_rule="Monthly Surplus < ₹0",
                impact="Depleting accumulated savings every month; risk of overdraft or debt accumulation.",
                evidence=f"Monthly Income: ₹{monthly_income:,.0f} vs Total Commitments: ₹{monthly_expenses + monthly_investments:,.0f}",
                implication="Spending more than you make drains liquid savings and leads to debt reliance.",
                possible_action="Audit non-essential expenses and pause discretionary outflows to restore positive cash flow.",
                action_link="/spending"
            ))
        elif monthly_income > 0 and monthly_surplus < (monthly_income * 0.10):
            health_penalties += 20
            alerts.append(RadarAlert(
                id="radar_cashflow_tight",
                category=AlertCategory.CASH_FLOW_SHORTAGE,
                severity=SeverityLevel.WARNING,
                title="Tight Cash Flow Cushion",
                message=f"Monthly surplus of ₹{monthly_surplus:,.2f} is under 10% of income ({savings_rate:.1f}%).",
                metric_value=savings_rate,
                threshold_value=10.0,
                trigger_rule="Savings Rate < 10%",
                impact="Limited buffer against minor unexpected monthly expenses.",
                evidence=f"Monthly Surplus: ₹{monthly_surplus:,.0f} ({savings_rate:.1f}% of income)",
                implication="A narrow surplus leaves little room for unexpected monthly price changes or minor emergencies.",
                possible_action="Identify minor spending adjustments to widen your monthly cash cushion above 15%.",
                action_link="/spending"
            ))
        elif monthly_income > 0 and monthly_surplus >= (monthly_income * 0.20):
            alerts.append(RadarAlert(
                id="radar_cashflow_healthy",
                category=AlertCategory.SAVINGS_SURPLUS,
                severity=SeverityLevel.INFO,
                title=f"High Monthly Cash Surplus (₹{monthly_surplus:,.0f}/mo)",
                message=f"Your uncommitted monthly surplus is ₹{monthly_surplus:,.0f}, representing {savings_rate:.1f}% of income.",
                metric_value=monthly_surplus,
                threshold_value=monthly_income * 0.20,
                trigger_rule="Monthly Surplus >= 20% of Income",
                impact=f"Enables rapid liquid reserve funding and aggressive goal progress.",
                evidence=f"Monthly Income: ₹{monthly_income:,.0f} | Outflows & SIPs: ₹{monthly_expenses + monthly_investments:,.0f} | Net Surplus: ₹{monthly_surplus:,.0f}/mo",
                implication="Strong surplus generation provides the financial fuel to reach major goals and build robust security buffers.",
                possible_action="Channel surplus to secure your emergency buffer first, then accelerate wealth investments.",
                action_link="/accounts"
            ))

        # Rule 2: Emergency Fund / Low Balance Runway Check
        rules_evaluated += 1
        if emergency_months < settings.CRITICAL_EMERGENCY_FUND_MONTHS:
            health_penalties += 35
            alerts.append(RadarAlert(
                id="radar_emergency_critical",
                category=AlertCategory.LOW_BALANCE_RISK,
                severity=SeverityLevel.CRITICAL,
                title=f"Critical Emergency Runway Shortage ({emergency_months:.1f} Months)",
                message=f"Liquid savings of ₹{current_savings:,.2f} cover only {emergency_months:.1f} months (~{int(emergency_months * 30)} days) of expenses.",
                metric_value=emergency_months,
                threshold_value=float(settings.CRITICAL_EMERGENCY_FUND_MONTHS),
                trigger_rule=f"Emergency Runway < {settings.CRITICAL_EMERGENCY_FUND_MONTHS} month",
                impact="High vulnerability to sudden income disruption or medical emergency.",
                evidence=f"Liquid Savings: ₹{current_savings:,.0f} | Monthly Expenses: ₹{monthly_expenses:,.0f} | Recommended 3-Month Target: ₹{round(monthly_expenses * 3, 0):,.0f}",
                implication="Any sudden unexpected expense, medical bill, or income gap could quickly exhaust available cash.",
                possible_action=f"Deploy ₹{round(max(0, monthly_expenses * 3 - current_savings), 0):,.0f} from monthly surplus to reach a full 3-month safety buffer.",
                action_link="/accounts"
            ))
        elif emergency_months < settings.DEFAULT_EMERGENCY_FUND_MONTHS:
            health_penalties += 15
            alerts.append(RadarAlert(
                id="radar_emergency_warning",
                category=AlertCategory.LOW_BALANCE_RISK,
                severity=SeverityLevel.WARNING,
                title=f"Sub-Optimal Emergency Cushion ({emergency_months:.1f} Months)",
                message=f"Current savings provide {emergency_months:.1f} months of runway (recommended: 3+ months).",
                metric_value=emergency_months,
                threshold_value=float(settings.DEFAULT_EMERGENCY_FUND_MONTHS),
                trigger_rule=f"Emergency Runway < {settings.DEFAULT_EMERGENCY_FUND_MONTHS} months",
                impact=f"Recommend building liquid buffer up to at least ₹{round(monthly_expenses * 3, 2):,.2f}.",
                evidence=f"Liquid Savings: ₹{current_savings:,.0f} | 3-Month Target: ₹{round(monthly_expenses * 3, 0):,.0f} | Safety Gap: ₹{round(max(0, monthly_expenses * 3 - current_savings), 0):,.0f}",
                implication="Moderate protection against short disruptions, but vulnerable to extended income gaps.",
                possible_action="Top up liquid savings gradually until achieving a 3-month buffer.",
                action_link="/accounts"
            ))
        else:
            alerts.append(RadarAlert(
                id="radar_emergency_healthy",
                category=AlertCategory.LOW_BALANCE_RISK,
                severity=SeverityLevel.INFO,
                title=f"Robust Emergency Runway ({emergency_months:.1f} Months)",
                message=f"Liquid savings of ₹{current_savings:,.0f} comfortably protect against unforeseen emergencies.",
                metric_value=emergency_months,
                threshold_value=float(settings.DEFAULT_EMERGENCY_FUND_MONTHS),
                trigger_rule="Emergency Runway >= 3.0 months",
                impact="Excellent financial safety buffer and resilience.",
                evidence=f"Liquid Savings: ₹{current_savings:,.0f} covers {emergency_months:.1f} months of living expenses.",
                implication="Your emergency buffer protects long-term investments from forced liquidation during emergencies.",
                possible_action="Keep reserve intact in high-liquidity instruments.",
                action_link="/accounts"
            ))

        # Rule 3: Debt Burden / DTI Check
        rules_evaluated += 1
        if debt_to_income_pct > settings.HIGH_DEBT_TO_INCOME_PCT:
            health_penalties += 25
            alerts.append(RadarAlert(
                id="radar_debt_high",
                category=AlertCategory.DEBT_BURDEN_RISK,
                severity=SeverityLevel.WARNING,
                title=f"High Debt-to-Income (DTI) Ratio ({debt_to_income_pct:.1f}%)",
                message=f"Existing EMI obligations consume {debt_to_income_pct:.1f}% of monthly income.",
                metric_value=debt_to_income_pct,
                threshold_value=settings.HIGH_DEBT_TO_INCOME_PCT,
                trigger_rule=f"Total EMI > {settings.HIGH_DEBT_TO_INCOME_PCT}% of Income",
                impact="Constrains financial flexibility and increases default vulnerability.",
                evidence=f"Monthly EMI: ₹{existing_emi:,.0f}/mo | Monthly Income: ₹{monthly_income:,.0f}",
                implication="High debt servicing limits savings capacity and makes loan eligibility tighter.",
                possible_action="Evaluate loan prepayment in Time Machine to accelerate debt-free timeline.",
                action_link="/simulations"
            ))
        elif debt_to_income_pct > 0:
            alerts.append(RadarAlert(
                id="radar_debt_healthy",
                category=AlertCategory.DEBT_BURDEN_RISK,
                severity=SeverityLevel.INFO,
                title=f"Manageable Debt Leverage ({debt_to_income_pct:.1f}% DTI)",
                message=f"Active EMIs of ₹{existing_emi:,.0f}/month consume only {debt_to_income_pct:.1f}% of monthly income.",
                metric_value=debt_to_income_pct,
                threshold_value=settings.HIGH_DEBT_TO_INCOME_PCT,
                trigger_rule=f"Total EMI <= {settings.HIGH_DEBT_TO_INCOME_PCT}% of Income",
                impact="Safe debt leverage well within prudent borrowing thresholds.",
                evidence=f"Monthly EMI: ₹{existing_emi:,.0f}/mo | Total Loan Principal: ₹{active_loans:,.0f} | Monthly Income: ₹{monthly_income:,.0f}",
                implication="Your debt is easily supported by your income, keeping credit health strong.",
                possible_action="Consider principal prepayments if you wish to reduce total lifetime interest.",
                action_link="/simulations"
            ))

        # Rule 4: Investment & Wealth Building Discipline
        if monthly_investments > 0:
            rules_evaluated += 1
            sip_pct = round((monthly_investments / monthly_income * 100), 1) if monthly_income > 0 else 0.0
            alerts.append(RadarAlert(
                id="radar_investment_sip",
                category=AlertCategory.WEALTH_ACCELERATION,
                severity=SeverityLevel.INFO,
                title=f"Active SIP Wealth Discipline (₹{monthly_investments:,.0f}/mo)",
                message=f"You are systematically investing ₹{monthly_investments:,.0f} every month ({sip_pct}% of income).",
                metric_value=monthly_investments,
                threshold_value=0.0,
                trigger_rule="Active SIP Investments > ₹0",
                impact="Builds compounding long-term wealth that outpaces inflation.",
                evidence=f"Monthly SIP: ₹{monthly_investments:,.0f} | Annual Deployed Capital: ₹{monthly_investments * 12:,.0f}/year",
                implication="Regular monthly investing harnesses compounding returns to achieve future milestones.",
                possible_action="Simulate stepped-up SIP contributions in Time Machine to project 5-year wealth acceleration.",
                action_link="/simulations"
            ))

        # Rule 5: Upcoming Recurring Commitments Check
        rules_evaluated += 1
        recurring_exp = subscriptions_cost if subscriptions_cost > 0 else summary.recurring_summary.total_recurring_expenses
        recurring_ratio_pct = round((recurring_exp / monthly_income * 100), 2) if monthly_income > 0 else (100.0 if recurring_exp > 0 else 0.0)
        if recurring_ratio_pct > 50.0:
            health_penalties += 15
            alerts.append(RadarAlert(
                id="radar_recurring_high",
                category=AlertCategory.RECURRING_EXPENSE,
                severity=SeverityLevel.WARNING,
                title="High Fixed Recurring Obligations",
                message=f"Fixed recurring expenses total ₹{recurring_exp:,.2f} ({recurring_ratio_pct:.1f}% of income).",
                metric_value=recurring_ratio_pct,
                threshold_value=50.0,
                trigger_rule="Recurring Fixed Expenses > 50% of Income",
                impact="Leaves less than half of monthly income for variable expenses and investments.",
                evidence=f"Recurring Commitments: ₹{recurring_exp:,.0f}/mo ({recurring_ratio_pct:.1f}% of income)",
                implication="High fixed obligations increase vulnerability during income disruptions.",
                possible_action="Review and prune unessential recurring commitments.",
                action_link="/accounts"
            ))
        elif recurring_exp > 0:
            alerts.append(RadarAlert(
                id="radar_recurring_info",
                category=AlertCategory.RECURRING_EXPENSE,
                severity=SeverityLevel.INFO,
                title=f"Tracked Recurring Subscriptions (₹{recurring_exp:,.0f}/mo)",
                message=f"Recurring subscriptions total ₹{recurring_exp:,.0f}/month ({recurring_ratio_pct:.1f}% of income).",
                metric_value=recurring_exp,
                threshold_value=monthly_income * 0.5 if monthly_income > 0 else 0.0,
                trigger_rule="Fixed commitments within healthy range (<= 50%)",
                impact="Low fixed overhead maintains cashflow agility.",
                evidence=f"Monthly Subscriptions: ₹{recurring_exp:,.0f}/mo | Annualized Cost: ₹{recurring_exp * 12:,.0f}",
                implication="Controlled recurring overhead ensures majority of income remains uncommitted.",
                possible_action="Review active subscriptions in Accounts to ensure all services are actively utilized.",
                action_link="/accounts"
            ))

        # Rule 6: Unusually High Expense Anomaly Detection
        rules_evaluated += 1
        if monthly_income > 0:
            high_threshold = monthly_income * settings.HIGH_EXPENSE_INCOME_RATIO
            for txn in all_txns:
                if txn.type.value == "expense" and txn.amount > high_threshold:
                    pct_share = round((txn.amount / monthly_income) * 100, 1)
                    alerts.append(RadarAlert(
                        id=f"radar_spike_{txn.id}",
                        category=AlertCategory.HIGH_EXPENSE_ANOMALY,
                        severity=SeverityLevel.WARNING,
                        title=f"Unusually High Expense: {txn.title}",
                        message=f"Expense of ₹{txn.amount:,.2f} in '{txn.category}' exceeds 35% of monthly income.",
                        metric_value=txn.amount,
                        threshold_value=round(high_threshold, 2),
                        trigger_rule="Single expense > 35% of Monthly Income",
                        impact=f"Single-handedly accounts for {pct_share}% of monthly income.",
                        evidence=f"Transaction Amount: ₹{txn.amount:,.0f} ({pct_share}% of income) in {txn.category}",
                        implication="Large irregular expenses can disrupt monthly budgeting if not planned ahead.",
                        possible_action="Plan large one-off expenses with dedicated sinking funds.",
                        action_link="/spending"
                    ))

        # Deterministic 0-100 Health Score
        health_score = max(5, min(100, 100 - health_penalties))
        
        if health_score >= 80:
            overall_health = HealthStatus.EXCELLENT
        elif health_score >= 60:
            overall_health = HealthStatus.HEALTHY
        elif health_score >= 40:
            overall_health = HealthStatus.VULNERABLE
        else:
            overall_health = HealthStatus.AT_RISK

        return FinancialRadarResponse(
            overall_health=overall_health,
            health_score=health_score,
            total_alerts=len(alerts),
            alerts=alerts,
            metrics_summary={
                "monthly_income": round(monthly_income, 2),
                "monthly_expenses": round(monthly_expenses, 2),
                "monthly_surplus": round(monthly_surplus, 2),
                "savings_rate_pct": savings_rate,
                "current_savings": round(current_savings, 2),
                "emergency_fund_months": emergency_months,
                "debt_to_income_pct": debt_to_income_pct,
                "recurring_expense_ratio_pct": recurring_ratio_pct,
                "monthly_investments": round(monthly_investments, 2),
                "active_loans": round(active_loans, 2),
            },
            radar_rules_evaluated=rules_evaluated,
            assumptions=[
                "Rule checks evaluated on current cash flow and historical transaction thresholds",
                "Emergency fund baseline targeted at 3.0 months of living expenses",
                "High expense anomaly threshold calibrated to 35.0% of monthly income"
            ]
        )


radar_service = RadarService()

