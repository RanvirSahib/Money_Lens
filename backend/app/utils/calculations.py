"""
MoneyLens Financial Calculations Module.
Pure, deterministic mathematical functions for all financial operations.

Key Principles:
1. Pure functions without side effects.
2. Explicit mathematical formulas documented with financial theory.
3. No non-deterministic or LLM-generated math.
4. Robust edge-case handling (0% interest, 0 income, 0 savings, goals already achieved, negative cash flow).
"""

from typing import Dict, List, Any, Optional
import math


def calculate_monthly_surplus(
    monthly_income: float,
    monthly_expenses: float,
    existing_emi: float = 0.0
) -> float:
    """
    Calculate the net monthly disposable surplus.

    Formula:
        Monthly Surplus = Monthly Income - (Monthly Expenses + Existing EMI)

    Args:
        monthly_income: Total monthly inflow from all sources.
        monthly_expenses: Total living and discretionary expenses per month.
        existing_emi: Ongoing monthly debt/loan obligations.

    Returns:
        float: Net monthly surplus (can be negative if in deficit).
    """
    return round(monthly_income - (monthly_expenses + existing_emi), 2)


def calculate_savings_rate(
    monthly_income: float,
    monthly_surplus: float
) -> float:
    """
    Calculate savings rate percentage.

    Formula:
        Savings Rate (%) = (Monthly Surplus / Monthly Income) * 100

    Args:
        monthly_income: Total monthly income.
        monthly_surplus: Net monthly surplus.

    Returns:
        float: Percentage of income saved (0.0 if income <= 0 or surplus <= 0).
    """
    if monthly_income <= 0 or monthly_surplus <= 0:
        return 0.0
    return round((monthly_surplus / monthly_income) * 100, 2)


def calculate_emi(
    principal: float,
    annual_interest_rate_pct: float,
    tenure_months: int
) -> Dict[str, Any]:
    """
    Calculate Equated Monthly Installment (EMI) using the standard reducing-balance loan formula.

    Financial Theory & Formula:
        For reducing balance loan:
        EMI = P * r * (1 + r)^n / ((1 + r)^n - 1)

        where:
        - P = Principal loan amount
        - r = Monthly interest rate = (Annual Interest Rate % / 12) / 100
        - n = Loan tenure in months

        Special Cases:
        - When principal <= 0 or tenure <= 0: returns all zeros.
        - When interest rate is 0%, EMI is simply P / n (Zero-cost financing).

    Args:
        principal: Total loan principal amount.
        annual_interest_rate_pct: Annual interest rate in percent (e.g. 10.5 for 10.5%).
        tenure_months: Total loan repayment duration in months.

    Returns:
        dict: {
            "loan_amount": float,
            "monthly_emi": float,
            "total_repayment": float,
            "total_interest": float,
            "interest_to_principal_ratio": float
        }
    """
    if principal <= 0 or tenure_months <= 0:
        return {
            "loan_amount": 0.0,
            "monthly_emi": 0.0,
            "total_repayment": 0.0,
            "total_interest": 0.0,
            "interest_to_principal_ratio": 0.0
        }

    # Case: 0% Interest (Zero-cost EMI)
    if annual_interest_rate_pct <= 0:
        monthly_emi = principal / tenure_months
        total_repayment = principal
        total_interest = 0.0
    else:
        # Monthly interest rate as a decimal fraction
        r = (annual_interest_rate_pct / 12.0) / 100.0
        n = tenure_months
        
        # Standard Reducing-Balance EMI Formula
        compounded_factor = math.pow(1 + r, n)
        monthly_emi = principal * r * (compounded_factor / (compounded_factor - 1))
        
        total_repayment = monthly_emi * n
        total_interest = total_repayment - principal

    monthly_emi_rounded = round(monthly_emi, 2)
    total_repayment_rounded = round(total_repayment, 2)
    total_interest_rounded = round(total_interest, 2)
    ratio = round((total_interest_rounded / principal) * 100, 2) if principal > 0 else 0.0

    return {
        "loan_amount": round(principal, 2),
        "monthly_emi": monthly_emi_rounded,
        "total_repayment": total_repayment_rounded,
        "total_interest": total_interest_rounded,
        "interest_to_principal_ratio": ratio
    }


def project_savings_trajectory(
    current_savings: float,
    monthly_income: float,
    monthly_expenses: float,
    existing_emi: float = 0.0,
    monthly_growth_rate_pct: float = 0.0,
    annual_return_pct: Optional[float] = None,
    duration_months: int = 12
) -> Dict[str, Any]:
    """
    Project month-by-month future savings balance considering monthly surplus and investment return.

    Financial Formula:
        For each month t in 1..duration_months:
        Growth Return = max(0, Previous Balance) * Monthly Growth Rate
        End Balance = Previous Balance + Growth Return + Monthly Surplus

        If annual_return_pct is provided, monthly_growth_rate = (1 + annual_return)^(1/12) - 1

    Args:
        current_savings: Starting balance / liquidity.
        monthly_income: Inflow per month.
        monthly_expenses: Outflow per month.
        existing_emi: Monthly EMI commitments.
        monthly_growth_rate_pct: Optional direct monthly growth percentage.
        annual_return_pct: Optional expected annual return rate in % (e.g. 7.0 for 7%).
        duration_months: Total projection horizon in months (minimum 1).

    Returns:
        dict: Contains trajectory array and key milestone balances (3, 6, 12, 24, etc.).
    """
    if duration_months <= 0:
        duration_months = 1

    monthly_surplus = calculate_monthly_surplus(monthly_income, monthly_expenses, existing_emi)
    
    # Calculate monthly compounding rate
    if annual_return_pct is not None and annual_return_pct > 0:
        # Effective monthly rate from annual rate: (1 + r_annual)^(1/12) - 1
        monthly_r = math.pow(1 + (annual_return_pct / 100.0), 1 / 12.0) - 1
    elif monthly_growth_rate_pct > 0:
        monthly_r = monthly_growth_rate_pct / 100.0
    else:
        monthly_r = 0.0

    trajectory: List[Dict[str, Any]] = []
    running_balance = float(current_savings)
    total_contributions = 0.0
    total_interest_earned = 0.0

    milestones: Dict[str, float] = {}

    for month in range(1, duration_months + 1):
        interest_this_month = running_balance * monthly_r if running_balance > 0 else 0.0
        running_balance += interest_this_month + monthly_surplus
        
        total_contributions += monthly_surplus
        total_interest_earned += interest_this_month
        
        trajectory.append({
            "month": month,
            "starting_balance": round(running_balance - interest_this_month - monthly_surplus, 2),
            "monthly_surplus": round(monthly_surplus, 2),
            "interest_earned": round(interest_this_month, 2),
            "closing_balance": round(running_balance, 2)
        })

        if month in [3, 6, 12, 24, 36, 60] or month == duration_months:
            milestones[f"{month}_months"] = round(running_balance, 2)

    return {
        "starting_savings": round(current_savings, 2),
        "monthly_surplus": round(monthly_surplus, 2),
        "duration_months": duration_months,
        "final_projected_savings": round(running_balance, 2),
        "total_net_contributions": round(total_contributions, 2),
        "total_interest_earned": round(total_interest_earned, 2),
        "milestones": milestones,
        "monthly_trajectory": trajectory
    }


def calculate_purchase_impact(
    current_savings: float,
    monthly_income: float,
    monthly_expenses: float,
    purchase_amount: float,
    existing_emi: float = 0.0,
    duration_months: int = 12
) -> Dict[str, Any]:
    """
    Calculate the financial impact of an upfront cash purchase vs status quo.

    Simulates:
    1. Baseline trajectory (No purchase).
    2. Purchase trajectory (Immediate deduction from current savings).
    3. Net difference across time horizons (3, 6, 12 months).

    Args:
        current_savings: Current liquid savings.
        monthly_income: Monthly income.
        monthly_expenses: Monthly living expenses.
        purchase_amount: One-time upfront cost.
        existing_emi: Existing EMI payments.
        duration_months: Projection horizon (default 12 months).

    Returns:
        dict: Side-by-side metrics and cash flow effects.
    """
    if duration_months <= 0:
        duration_months = 12

    monthly_surplus = calculate_monthly_surplus(monthly_income, monthly_expenses, existing_emi)
    post_purchase_savings = current_savings - purchase_amount

    # Baseline projection (No purchase)
    baseline_proj = project_savings_trajectory(
        current_savings=current_savings,
        monthly_income=monthly_income,
        monthly_expenses=monthly_expenses,
        existing_emi=existing_emi,
        duration_months=duration_months
    )

    # Post-purchase projection
    purchase_proj = project_savings_trajectory(
        current_savings=post_purchase_savings,
        monthly_income=monthly_income,
        monthly_expenses=monthly_expenses,
        existing_emi=existing_emi,
        duration_months=duration_months
    )

    # Time to recover the purchase amount solely from monthly surplus
    months_to_recover = math.ceil(purchase_amount / monthly_surplus) if (monthly_surplus > 0 and purchase_amount > 0) else (0 if purchase_amount == 0 else None)

    # Calculate emergency fund runway in months after purchase
    if monthly_expenses > 0:
        emergency_months_after_purchase = round(max(0.0, post_purchase_savings) / monthly_expenses, 1)
    else:
        emergency_months_after_purchase = 999.0 if post_purchase_savings > 0 else 0.0

    return {
        "purchase_amount": round(purchase_amount, 2),
        "initial_savings": round(current_savings, 2),
        "post_purchase_savings": round(post_purchase_savings, 2),
        "monthly_surplus": round(monthly_surplus, 2),
        "months_to_recover_cost": months_to_recover,
        "emergency_fund_runway_months": emergency_months_after_purchase,
        "is_savings_depleted": post_purchase_savings < 0,
        "baseline_milestones": baseline_proj["milestones"],
        "post_purchase_milestones": purchase_proj["milestones"],
        "monthly_trajectory": purchase_proj["monthly_trajectory"],
        "assumptions": [
            f"Monthly income remains stable at ₹{monthly_income:,.2f}",
            f"Monthly expenses remain constant at ₹{monthly_expenses:,.2f}",
            f"Purchase of ₹{purchase_amount:,.2f} is fully paid upfront from current savings",
            "No inflation or investment returns factored unless explicitly specified"
        ]
    }


def calculate_goal_feasibility(
    target_amount: float,
    current_savings_allocated: float,
    target_months: int,
    monthly_income: float,
    monthly_expenses: float,
    existing_emi: float = 0.0,
    expected_annual_return_pct: float = 0.0
) -> Dict[str, Any]:
    """
    Calculate forward feasibility for a specific financial goal.

    Financial Logic:
        Remaining Target = max(0, Target Amount - Current Savings Allocated)
        Required Monthly Saving = Remaining Target / Target Months (ignoring interest)
        OR with monthly compounding: Required PMT = Remaining * r / ((1 + r)^n - 1)

    Args:
        target_amount: The target corpus needed.
        current_savings_allocated: Amount from existing savings set aside for this goal.
        target_months: Timeline in months to achieve the goal.
        monthly_income: Current monthly income.
        monthly_expenses: Current monthly expenses.
        existing_emi: Existing EMI payments.
        expected_annual_return_pct: Expected investment return rate (e.g. 8.0 for 8% p.a.).

    Returns:
        dict: Feasibility analysis, required savings, gap, and projected completion.
    """
    remaining_amount = max(0.0, target_amount - current_savings_allocated)
    monthly_surplus = calculate_monthly_surplus(monthly_income, monthly_expenses, existing_emi)

    if target_months <= 0:
        target_months = 1

    # Case: Goal already achieved
    if remaining_amount == 0.0:
        return {
            "target_amount": round(target_amount, 2),
            "current_savings_allocated": round(current_savings_allocated, 2),
            "remaining_amount": 0.0,
            "target_months": target_months,
            "current_monthly_surplus": round(monthly_surplus, 2),
            "required_monthly_saving": 0.0,
            "monthly_gap_or_shortfall": 0.0,
            "monthly_excess_buffer": max(0.0, monthly_surplus),
            "is_reachable": True,
            "projected_completion_months_at_current_rate": 0,
            "status": "already_achieved",
            "status_description": "Goal target has already been achieved with existing allocated savings!",
            "assumptions": [
                f"Target corpus is ₹{target_amount:,.2f}",
                f"Currently allocated savings of ₹{current_savings_allocated:,.2f} fully covers or exceeds target",
                f"Monthly disposable surplus remains ₹{monthly_surplus:,.2f}"
            ]
        }

    # Calculation with / without compounding
    if expected_annual_return_pct > 0:
        r = math.pow(1 + (expected_annual_return_pct / 100.0), 1 / 12.0) - 1
        compounded_growth_of_initial = current_savings_allocated * math.pow(1 + r, target_months)
        corpus_needed_from_sip = max(0.0, target_amount - compounded_growth_of_initial)
        
        if r > 0 and corpus_needed_from_sip > 0:
            # Sinking fund formula: PMT = FV * r / ((1 + r)^n - 1)
            required_monthly_saving = corpus_needed_from_sip * r / (math.pow(1 + r, target_months) - 1)
        else:
            required_monthly_saving = corpus_needed_from_sip / target_months
    else:
        required_monthly_saving = remaining_amount / target_months

    required_monthly_saving = round(required_monthly_saving, 2)
    monthly_gap = round(required_monthly_saving - monthly_surplus, 2)
    
    # Is the goal reachable with current surplus?
    is_reachable = monthly_surplus >= required_monthly_saving

    # How many months would it take at current surplus pace?
    if monthly_surplus > 0:
        projected_completion_months = math.ceil(remaining_amount / monthly_surplus)
    else:
        projected_completion_months = None

    # Status classification
    if is_reachable:
        status = "reachable"
        status_description = "Goal is fully reachable within the desired timeframe at your current savings rate."
    elif monthly_surplus > 0 and monthly_surplus >= (required_monthly_saving * 0.7):
        status = "stretch_goal"
        status_description = "Goal is nearly reachable with modest expense reduction or slight timeline extension."
    else:
        status = "unreachable_without_adjustment"
        status_description = "Goal requires significant adjustments in savings, income, or target timeline."

    return {
        "target_amount": round(target_amount, 2),
        "current_savings_allocated": round(current_savings_allocated, 2),
        "remaining_amount": round(remaining_amount, 2),
        "target_months": target_months,
        "current_monthly_surplus": round(monthly_surplus, 2),
        "required_monthly_saving": required_monthly_saving,
        "monthly_gap_or_shortfall": monthly_gap if monthly_gap > 0 else 0.0,
        "monthly_excess_buffer": abs(monthly_gap) if monthly_gap < 0 else 0.0,
        "is_reachable": is_reachable,
        "projected_completion_months_at_current_rate": projected_completion_months,
        "status": status,
        "status_description": status_description,
        "assumptions": [
            f"Monthly income remains stable at ₹{monthly_income:,.2f}",
            f"Monthly living expenses remain stable at ₹{monthly_expenses:,.2f}",
            f"Expected annual investment return is {expected_annual_return_pct:.1f}%",
            f"Target corpus is ₹{target_amount:,.2f} in {target_months} months"
        ]
    }


def calculate_reverse_goal(
    target_amount: float,
    target_months: int,
    current_monthly_surplus: float,
    expected_annual_return_pct: float = 0.0,
    current_savings_allocated: float = 0.0
) -> Dict[str, Any]:
    """
    Reverse goal calculator.
    Answers: 'I want ₹X in N months. How much do I need to save, and what adjustments must I make?'

    Args:
        target_amount: Target monetary sum.
        target_months: Number of months.
        current_monthly_surplus: Current monthly savings capacity.
        expected_annual_return_pct: Investment return expectation.
        current_savings_allocated: Already accumulated savings allocated toward this goal.

    Returns:
        dict: Required monthly saving, additional amount required, and actionable trade-off levers.
    """
    if target_months <= 0:
        target_months = 1

    net_target_to_save = max(0.0, target_amount - current_savings_allocated)

    if net_target_to_save <= 0:
        return {
            "target_amount": round(target_amount, 2),
            "current_savings_allocated": round(current_savings_allocated, 2),
            "remaining_target_amount": 0.0,
            "target_months": target_months,
            "levers": {
                "required_monthly_saving": 0.0,
                "current_monthly_surplus": round(current_monthly_surplus, 2),
                "additional_monthly_needed": 0.0,
                "is_currently_sufficient": True,
                "alternative_timeline_at_current_surplus_months": 0
            },
            "assumptions": [
                f"Target corpus of ₹{target_amount:,.2f} is already achieved with ₹{current_savings_allocated:,.2f} allocated savings",
                "No additional savings required"
            ]
        }

    if expected_annual_return_pct > 0:
        r = math.pow(1 + (expected_annual_return_pct / 100.0), 1 / 12.0) - 1
        compounded_growth_of_initial = current_savings_allocated * math.pow(1 + r, target_months)
        corpus_needed_from_sip = max(0.0, target_amount - compounded_growth_of_initial)
        if r > 0 and corpus_needed_from_sip > 0:
            required_monthly_saving = corpus_needed_from_sip * r / (math.pow(1 + r, target_months) - 1)
        else:
            required_monthly_saving = corpus_needed_from_sip / target_months
    else:
        required_monthly_saving = net_target_to_save / target_months

    required_monthly_saving = round(required_monthly_saving, 2)
    additional_monthly_needed = round(max(0.0, required_monthly_saving - current_monthly_surplus), 2)
    
    # Alternative Levers / Adjustments (Trade-offs): months required at current surplus pace
    extended_months_needed = math.ceil(net_target_to_save / current_monthly_surplus) if current_monthly_surplus > 0 else None

    levers = {
        "required_monthly_saving": required_monthly_saving,
        "current_monthly_surplus": round(current_monthly_surplus, 2),
        "additional_monthly_needed": additional_monthly_needed,
        "is_currently_sufficient": current_monthly_surplus >= required_monthly_saving,
        "alternative_timeline_at_current_surplus_months": extended_months_needed
    }

    return {
        "target_amount": round(target_amount, 2),
        "current_savings_allocated": round(current_savings_allocated, 2),
        "remaining_target_amount": round(net_target_to_save, 2),
        "target_months": target_months,
        "levers": levers,
        "assumptions": [
            f"Target corpus of ₹{target_amount:,.2f} (Net ₹{net_target_to_save:,.2f} after ₹{current_savings_allocated:,.2f} allocated) in {target_months} months",
            f"Calculated with {expected_annual_return_pct:.1f}% expected annual growth rate"
        ]
    }
