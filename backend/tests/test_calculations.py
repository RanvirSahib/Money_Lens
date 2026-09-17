"""
Unit Tests for Pure Financial Mathematical Calculations.
Tests formulas & edge cases:
1. Surplus and Savings Rate (normal, zero income, zero expenses, negative surplus)
2. Standard reducing-balance EMI (normal, zero interest, zero principal, zero tenure)
3. Compounding savings trajectory (linear, compounding, zero contributions, zero savings)
4. Purchase impact on liquidity & recovery runway (normal, zero purchase, negative savings)
5. Forward goal feasibility & gap analysis (reachable, stretch, unreachable, already achieved)
6. Reverse goal calculations & trade-off levers (normal, zero target, zero surplus)
"""

import pytest
import math
from app.utils.calculations import (
    calculate_monthly_surplus,
    calculate_savings_rate,
    calculate_emi,
    project_savings_trajectory,
    calculate_purchase_impact,
    calculate_goal_feasibility,
    calculate_reverse_goal,
)


def test_monthly_surplus_and_savings_rate_normal():
    # Income = 80000, Expenses = 45000, EMI = 5000 -> Surplus = 30000, Savings Rate = 37.5%
    surplus = calculate_monthly_surplus(80000.0, 45000.0, 5000.0)
    assert surplus == 30000.0
    
    rate = calculate_savings_rate(80000.0, surplus)
    assert rate == 37.5


def test_monthly_surplus_edge_cases():
    # Negative surplus (Deficit cash flow)
    assert calculate_monthly_surplus(50000.0, 60000.0, 5000.0) == -15000.0
    # Zero income
    assert calculate_monthly_surplus(0.0, 20000.0) == -20000.0
    # Zero expenses
    assert calculate_monthly_surplus(50000.0, 0.0) == 50000.0
    # Zero everything
    assert calculate_monthly_surplus(0.0, 0.0, 0.0) == 0.0


def test_savings_rate_edge_cases():
    # Zero income -> 0.0%
    assert calculate_savings_rate(0.0, 1000.0) == 0.0
    # Negative surplus -> 0.0%
    assert calculate_savings_rate(80000.0, -10000.0) == 0.0
    # 100% savings rate (zero expenses)
    assert calculate_savings_rate(80000.0, 80000.0) == 100.0


def test_calculate_emi_zero_interest():
    # 0% interest loan of 60,000 for 12 months -> 5,000/month
    emi_res = calculate_emi(principal=60000.0, annual_interest_rate_pct=0.0, tenure_months=12)
    assert emi_res["monthly_emi"] == 5000.0
    assert emi_res["total_repayment"] == 60000.0
    assert emi_res["total_interest"] == 0.0
    assert emi_res["interest_to_principal_ratio"] == 0.0


def test_calculate_emi_reducing_balance_precision():
    # Principal = 60,000, Annual Rate = 12%, Tenure = 12 months
    # Monthly rate r = 12 / 12 / 100 = 0.01 (1% per month)
    # EMI = 60000 * 0.01 * (1.01)^12 / ((1.01)^12 - 1) ≈ 5330.93
    emi_res = calculate_emi(principal=60000.0, annual_interest_rate_pct=12.0, tenure_months=12)
    assert math.isclose(emi_res["monthly_emi"], 5330.93, rel_tol=1e-3)
    assert math.isclose(emi_res["total_repayment"], 5330.93 * 12, rel_tol=1e-3)
    assert emi_res["total_interest"] > 0
    assert math.isclose(emi_res["total_interest"], (5330.93 * 12) - 60000.0, rel_tol=1e-2)


def test_calculate_emi_edge_cases():
    # Zero principal
    assert calculate_emi(0.0, 10.0, 12)["monthly_emi"] == 0.0
    # Negative principal
    assert calculate_emi(-1000.0, 10.0, 12)["monthly_emi"] == 0.0
    # Zero tenure
    assert calculate_emi(50000.0, 10.0, 0)["monthly_emi"] == 0.0
    # Very large amounts (e.g. 10 Crore home loan)
    large_emi = calculate_emi(100000000.0, 8.5, 240)
    assert large_emi["monthly_emi"] > 0
    assert large_emi["total_repayment"] > 100000000.0


def test_project_savings_trajectory_linear_and_compounding():
    # Linear projection
    proj = project_savings_trajectory(
        current_savings=200000.0,
        monthly_income=80000.0,
        monthly_expenses=45000.0,
        existing_emi=0.0,
        duration_months=12
    )
    assert proj["monthly_surplus"] == 35000.0
    assert proj["milestones"]["3_months"] == 305000.0
    assert proj["milestones"]["6_months"] == 410000.0
    assert proj["milestones"]["12_months"] == 620000.0
    assert proj["final_projected_savings"] == 620000.0

    # Compounding projection (12% annual return)
    comp_proj = project_savings_trajectory(
        current_savings=100000.0,
        monthly_income=50000.0,
        monthly_expenses=30000.0,
        annual_return_pct=12.0,
        duration_months=12
    )
    assert comp_proj["total_interest_earned"] > 0
    assert comp_proj["final_projected_savings"] > 340000.0


def test_project_savings_trajectory_edge_cases():
    # Zero savings and zero income
    zero_proj = project_savings_trajectory(
        current_savings=0.0,
        monthly_income=0.0,
        monthly_expenses=0.0,
        duration_months=6
    )
    assert zero_proj["final_projected_savings"] == 0.0
    assert zero_proj["monthly_surplus"] == 0.0

    # Negative cash flow (depleting balance)
    depleting_proj = project_savings_trajectory(
        current_savings=100000.0,
        monthly_income=20000.0,
        monthly_expenses=40000.0,
        duration_months=3
    )
    assert depleting_proj["monthly_surplus"] == -20000.0
    assert depleting_proj["final_projected_savings"] == 40000.0

    # Invalid duration (<= 0)
    invalid_dur_proj = project_savings_trajectory(
        current_savings=50000.0,
        monthly_income=30000.0,
        monthly_expenses=20000.0,
        duration_months=-5
    )
    assert invalid_dur_proj["duration_months"] == 1


def test_purchase_simulation():
    impact = calculate_purchase_impact(
        current_savings=200000.0,
        monthly_income=80000.0,
        monthly_expenses=45000.0,
        purchase_amount=70000.0
    )
    assert impact["post_purchase_savings"] == 130000.0
    assert impact["months_to_recover_cost"] == 2
    assert impact["emergency_fund_runway_months"] == 2.9
    assert impact["is_savings_depleted"] is False
    assert impact["post_purchase_milestones"]["3_months"] == 235000.0
    assert impact["post_purchase_milestones"]["6_months"] == 340000.0
    assert impact["post_purchase_milestones"]["12_months"] == 550000.0


def test_purchase_simulation_edge_cases():
    # Purchase exceeds savings (savings depleted)
    depleted = calculate_purchase_impact(
        current_savings=50000.0,
        monthly_income=80000.0,
        monthly_expenses=45000.0,
        purchase_amount=70000.0
    )
    assert depleted["post_purchase_savings"] == -20000.0
    assert depleted["is_savings_depleted"] is True
    assert depleted["emergency_fund_runway_months"] == 0.0

    # Zero purchase amount
    zero_purchase = calculate_purchase_impact(
        current_savings=100000.0,
        monthly_income=50000.0,
        monthly_expenses=30000.0,
        purchase_amount=0.0
    )
    assert zero_purchase["post_purchase_savings"] == 100000.0
    assert zero_purchase["months_to_recover_cost"] == 0


def test_goal_feasibility_reachable():
    goal = calculate_goal_feasibility(
        target_amount=500000.0,
        current_savings_allocated=140000.0,
        target_months=12,
        monthly_income=80000.0,
        monthly_expenses=45000.0
    )
    assert goal["remaining_amount"] == 360000.0
    assert goal["required_monthly_saving"] == 30000.0
    assert goal["is_reachable"] is True
    assert goal["status"] == "reachable"
    assert goal["monthly_excess_buffer"] == 5000.0


def test_goal_feasibility_already_achieved():
    # Current allocated savings >= target amount
    achieved = calculate_goal_feasibility(
        target_amount=300000.0,
        current_savings_allocated=350000.0,
        target_months=12,
        monthly_income=80000.0,
        monthly_expenses=45000.0
    )
    assert achieved["remaining_amount"] == 0.0
    assert achieved["required_monthly_saving"] == 0.0
    assert achieved["is_reachable"] is True
    assert achieved["status"] == "already_achieved"
    assert achieved["projected_completion_months_at_current_rate"] == 0


def test_goal_feasibility_unreachable():
    goal = calculate_goal_feasibility(
        target_amount=500000.0,
        current_savings_allocated=0.0,
        target_months=10,
        monthly_income=80000.0,
        monthly_expenses=45000.0
    )
    assert goal["required_monthly_saving"] == 50000.0
    assert goal["is_reachable"] is False
    assert goal["monthly_gap_or_shortfall"] == 15000.0
    assert goal["projected_completion_months_at_current_rate"] == 15


def test_reverse_goal_calculation_normal_and_edge_cases():
    # "I want ₹5,00,000 in 12 months" -> Required = 41666.67
    rev = calculate_reverse_goal(
        target_amount=500000.0,
        target_months=12,
        current_monthly_surplus=35000.0
    )
    assert rev["levers"]["required_monthly_saving"] == 41666.67
    assert rev["levers"]["additional_monthly_needed"] == 6666.67
    assert rev["levers"]["is_currently_sufficient"] is False
    assert rev["levers"]["alternative_timeline_at_current_surplus_months"] == 15

    # Zero target amount
    zero_rev = calculate_reverse_goal(0.0, 12, 35000.0)
    assert zero_rev["levers"]["required_monthly_saving"] == 0.0
    assert zero_rev["levers"]["is_currently_sufficient"] is True

    # Zero / negative surplus
    zero_surplus_rev = calculate_reverse_goal(120000.0, 12, 0.0)
    assert zero_surplus_rev["levers"]["required_monthly_saving"] == 10000.0
    assert zero_surplus_rev["levers"]["additional_monthly_needed"] == 10000.0
    assert zero_surplus_rev["levers"]["alternative_timeline_at_current_surplus_months"] is None
