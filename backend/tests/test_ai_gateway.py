"""
Tests for AI Gateway Service and Routes in MoneyLens Backend.
"""

import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.schemas.ai import AnalysisType

client = TestClient(app)


def test_ai_insights_time_machine_fallback():
    payload = {
        "analysis_type": "time_machine",
        "financial_position": {
            "monthly_income": 60000.0,
            "monthly_expenses": 35000.0,
            "existing_emi": 5000.0,
            "monthly_surplus": 20000.0,
            "savings_rate_pct": 33.3,
            "current_savings": 150000.0,
            "emergency_fund_months": 4.2
        },
        "simulation_result": {
            "scenario": "upfront_cash_purchase",
            "data": {
                "purchase_amount": 75000.0,
                "post_purchase_savings": 75000.0
            }
        }
    }
    
    response = client.post("/api/v1/ai/insights", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["analysis_type"] == "time_machine"
    assert "headline" in data
    assert len(data["observations"]) > 0
    assert len(data["evidence"]) > 0
    assert len(data["trade_offs"]) > 0


def test_ai_insights_goal_analysis_fallback():
    payload = {
        "analysis_type": "goal_analysis",
        "goal": {
            "title": "Emergency Fund",
            "target_amount": 200000.0,
            "required_monthly_saving": 15000.0,
            "is_reachable": True
        }
    }
    
    response = client.post("/api/v1/ai/insights", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["analysis_type"] == "goal_analysis"
    assert "Goal Velocity" in data["headline"]


def test_ai_insights_radar_analysis_fallback():
    payload = {
        "analysis_type": "radar_analysis",
        "radar": {
            "cash_flow_health": "stable",
            "runway_months": 3.5,
            "recurring_expense_ratio_pct": 25.0
        }
    }
    
    response = client.post("/api/v1/ai/insights", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["analysis_type"] == "radar_analysis"
    assert "Cash Flow Surveillance" in data["headline"]
