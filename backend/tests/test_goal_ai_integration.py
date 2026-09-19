"""
Tests for Backend -> AI Goal Analysis Integration.

Verifies:
1. Goal title resolution from request title or repository record
2. Zero duplicate financial calculations - 100% preservation of deterministic engine outputs
3. All required Goal Analysis fields are mapped and present
4. AI payload validates against AI service's AnalyzeRequest schema
5. AIInsightService executes calculations, resolves titles, and handles AI service response
6. HTTP POST /api/v1/goals/analyze and POST /api/v1/goals/saved/{goal_id}/analyze endpoints work correctly
7. AI service unavailable / error handling (503 / 502)
8. Existing deterministic goal endpoints remain 100% unchanged
"""

import sys
from pathlib import Path
from unittest.mock import patch
import pytest
from fastapi.testclient import TestClient

from app.main import app
from app.schemas.goals import (
    GoalCalculationRequest,
    GoalCalculationResponse,
    GoalCreateRequest,
    GoalResponse,
    SavedGoalAnalysisRequest,
)
from app.services.goal_service import goal_service
from app.services.ai_insight_service import (
    adapt_goal_calculation_to_ai,
    build_goal_analysis_request,
    ai_insight_service,
    AIInsightService,
    AIInsightServiceError,
)

client = TestClient(app)


def test_goal_calculation_adapter_with_title():
    """Verify adapt_goal_calculation_to_ai properly maps fields and attaches resolved title."""
    req = GoalCalculationRequest(
        target_amount=600000.0,
        current_savings_allocated=100000.0,
        target_months=24,
        monthly_income=100000.0,
        monthly_expenses=60000.0,
        existing_emi=0.0,
        expected_annual_return_pct=0.0,
        title="Down Payment for Flat"
    )
    calc_res = goal_service.calculate_forward_goal(req)

    # Adapt to AI format
    adapted = adapt_goal_calculation_to_ai(calc_res, title=req.title)

    assert adapted["title"] == "Down Payment for Flat"
    assert adapted["target_amount"] == 600000.0
    assert adapted["current_savings_allocated"] == 100000.0
    assert adapted["target_months"] == 24
    assert adapted["required_monthly_saving"] == 20833.33
    assert adapted["is_reachable"] is True
    assert adapted["projected_completion_months"] == 13  # (600k - 100k) / 40k = 12.5 -> 13
    assert adapted["status"] == "reachable"


def test_goal_analysis_payload_structure_and_ai_schema_validation():
    """Verify build_goal_analysis_request constructs a valid AnalyzeRequest for goal_analysis."""
    req = GoalCalculationRequest(
        target_amount=300000.0,
        current_savings_allocated=50000.0,
        target_months=10,
        monthly_income=70000.0,
        monthly_expenses=45000.0,
        existing_emi=5000.0,
        expected_annual_return_pct=0.0,
        title="Emergency Corpus",
        context_note="Building emergency fund before career change."
    )
    calc_res = goal_service.calculate_forward_goal(req)
    adapted_goal = adapt_goal_calculation_to_ai(calc_res, title=req.title)

    financial_pos = {
        "monthly_income": 70000.0,
        "monthly_expenses": 45000.0,
        "existing_emi": 5000.0,
        "monthly_surplus": 20000.0,
    }

    ai_payload = build_goal_analysis_request(
        goals=[adapted_goal],
        financial_position=financial_pos,
        context_note=req.context_note
    )

    assert ai_payload["analysis_type"] == "goal_analysis"
    assert ai_payload["context_note"] == "Building emergency fund before career change."
    assert "goal_analysis" in ai_payload
    
    ga = ai_payload["goal_analysis"]
    assert "goals" in ga
    assert len(ga["goals"]) == 1
    assert ga["goals"][0]["title"] == "Emergency Corpus"
    assert ga["goals"][0]["target_amount"] == 300000.0
    assert ga["financial_position"]["monthly_surplus"] == 20000.0

    # Cross-validate against independent AI service schema
    ai_root = Path(__file__).resolve().parent.parent.parent / "ai"
    import importlib.util
    schema_path = ai_root / "app" / "schemas.py"
    spec = importlib.util.spec_from_file_location("ai_schemas_goal", str(schema_path))
    ai_schemas = importlib.util.module_from_spec(spec)
    sys.modules["ai_schemas_goal"] = ai_schemas
    spec.loader.exec_module(ai_schemas)

    AIAnalyzeRequest = ai_schemas.AnalyzeRequest
    AIAnalyzeRequest.model_rebuild()

    validated_model = AIAnalyzeRequest.model_validate(ai_payload)
    assert validated_model.analysis_type == "goal_analysis"
    assert validated_model.goal_analysis is not None
    assert len(validated_model.goal_analysis.goals) == 1
    assert validated_model.goal_analysis.goals[0].title == "Emergency Corpus"


def test_ai_insight_service_analyze_goal_success():
    """Verify AIInsightService.analyze_goal executes deterministic calculation and calls AI service."""
    req = GoalCalculationRequest(
        target_amount=500000.0,
        current_savings_allocated=50000.0,
        target_months=12,
        monthly_income=80000.0,
        monthly_expenses=45000.0,
        existing_emi=0.0,
        expected_annual_return_pct=0.0,
        title="Wedding Savings"
    )

    mock_ai_response = {
        "executive_summary": "Your wedding savings goal of ₹5,00,000 is reachable within 12 months.",
        "feasibility_verdict": "FEASIBLE",
        "actionable_recommendations": ["Automate monthly transfers of ₹37,500."],
        "key_risks": ["Unexpected spikes in monthly living expenses."],
        "trade_offs": ["Reduced discretionary spending by ₹10,000/mo."]
    }

    with patch.object(AIInsightService, "send_analyze_request", return_value=mock_ai_response) as mock_send:
        result = ai_insight_service.analyze_goal(req=req, title=req.title)

        assert mock_send.called
        call_args = mock_send.call_args[0][0]
        assert call_args["analysis_type"] == "goal_analysis"
        assert call_args["goal_analysis"]["goals"][0]["title"] == "Wedding Savings"
        assert call_args["goal_analysis"]["goals"][0]["target_amount"] == 500000.0

        # Deterministic calculation verification
        calc = result["calculation"]
        assert calc["target_amount"] == 500000.0
        assert calc["current_savings_allocated"] == 50000.0
        assert calc["remaining_amount"] == 450000.0
        assert calc["required_monthly_saving"] == 37500.0
        assert calc["current_monthly_surplus"] == 35000.0
        assert calc["monthly_gap_or_shortfall"] == 2500.0
        assert calc["status"] == "stretch_goal"

        # AI insight response
        assert result["ai_insight"] == mock_ai_response


def test_ai_insight_service_analyze_saved_goal_title_resolution():
    """Verify analyze_saved_goal resolves stored goal title from repository without duplication."""
    # 1. Create a saved goal in the repository
    created_goal = goal_service.repository.create(GoalCreateRequest(
        title="Child Higher Education Fund",
        target_amount=1200000.0,
        current_savings_allocated=200000.0,
        target_months=36,
        category="Education",
        priority="high"
    ))
    goal_id = created_goal.id

    mock_ai_response = {
        "executive_summary": "The Child Higher Education Fund requires ₹27,778/month.",
        "feasibility_verdict": "FEASIBLE",
        "actionable_recommendations": ["Maintain aggressive savings allocation."],
        "key_risks": ["Inflation in educational costs."],
        "trade_offs": []
    }

    with patch.object(AIInsightService, "send_analyze_request", return_value=mock_ai_response) as mock_send:
        result = ai_insight_service.analyze_saved_goal(
            goal_id=goal_id,
            monthly_income=100000.0,
            monthly_expenses=50000.0,
            context_note="Reviewing 3-year education horizon."
        )

        assert mock_send.called
        call_args = mock_send.call_args[0][0]
        assert call_args["analysis_type"] == "goal_analysis"
        assert call_args["goal_analysis"]["goals"][0]["title"] == "Child Higher Education Fund"
        assert call_args["goal_analysis"]["goals"][0]["target_amount"] == 1200000.0
        assert call_args["context_note"] == "Reviewing 3-year education horizon."

        # Verification of goal record, calculation, and AI insights
        assert result["goal"]["id"] == goal_id
        assert result["goal"]["title"] == "Child Higher Education Fund"
        assert result["calculation"]["target_amount"] == 1200000.0
        assert result["calculation"]["required_monthly_saving"] == 27777.78
        assert result["ai_insight"] == mock_ai_response

    # Clean up repository
    goal_service.repository.delete(goal_id)


def test_api_goal_analyze_endpoint_success():
    """Verify POST /api/v1/goals/analyze returns deterministic calculation + AI insights."""
    payload = {
        "target_amount": 500000.0,
        "current_savings_allocated": 50000.0,
        "target_months": 12,
        "monthly_income": 80000.0,
        "monthly_expenses": 45000.0,
        "existing_emi": 0.0,
        "expected_annual_return_pct": 0.0,
        "title": "House Renovation",
        "context_note": "Targeting completion by year-end."
    }

    mock_ai_response = {
        "executive_summary": "House Renovation goal requires ₹37,500/month, slightly exceeding ₹35,000 surplus.",
        "feasibility_verdict": "NEAR_FEASIBLE",
        "actionable_recommendations": ["Trim expenses by ₹2,500/month."],
        "key_risks": ["Unexpected material cost inflation."],
        "trade_offs": ["Defer other non-essential purchases."]
    }

    with patch.object(AIInsightService, "send_analyze_request", return_value=mock_ai_response):
        response = client.post("/api/v1/goals/analyze", json=payload)

    assert response.status_code == 200
    data = response.json()
    assert "calculation" in data
    assert "ai_insight" in data
    assert data["calculation"]["target_amount"] == 500000.0
    assert data["calculation"]["required_monthly_saving"] == 37500.0
    assert data["calculation"]["monthly_gap_or_shortfall"] == 2500.0
    assert data["ai_insight"]["feasibility_verdict"] == "NEAR_FEASIBLE"


def test_api_saved_goal_analyze_endpoint_success():
    """Verify POST /api/v1/goals/saved/{goal_id}/analyze resolves title from stored goal."""
    created_goal = goal_service.repository.create(GoalCreateRequest(
        title="Europe Vacation 2027",
        target_amount=400000.0,
        current_savings_allocated=80000.0,
        target_months=16,
        category="Travel",
        priority="medium"
    ))
    goal_id = created_goal.id

    mock_ai_response = {
        "executive_summary": "Europe Vacation 2027 is achievable with ₹20,000/month savings.",
        "feasibility_verdict": "FEASIBLE",
        "actionable_recommendations": ["Lock in flight bookings 6 months early."],
        "key_risks": ["Currency exchange rate fluctuations."],
        "trade_offs": []
    }

    eval_payload = {
        "monthly_income": 90000.0,
        "monthly_expenses": 50000.0,
        "existing_emi": 0.0,
        "context_note": "Reviewing holiday plan."
    }

    with patch.object(AIInsightService, "send_analyze_request", return_value=mock_ai_response) as mock_send:
        response = client.post(f"/api/v1/goals/saved/{goal_id}/analyze", json=eval_payload)

    assert response.status_code == 200
    data = response.json()
    assert data["goal"]["id"] == goal_id
    assert data["goal"]["title"] == "Europe Vacation 2027"
    assert data["calculation"]["target_amount"] == 400000.0
    assert data["calculation"]["required_monthly_saving"] == 20000.0
    assert data["ai_insight"] == mock_ai_response

    # Clean up
    goal_service.repository.delete(goal_id)


def test_api_saved_goal_analyze_nonexistent_returns_404():
    """Verify POST /api/v1/goals/saved/{goal_id}/analyze returns 404 for invalid goal ID."""
    response = client.post("/api/v1/goals/saved/nonexistent_goal_9999/analyze", json={})
    assert response.status_code == 404
    assert "not found" in response.json()["detail"].lower()


def test_api_goal_analyze_ai_service_unavailable_returns_503():
    """Verify POST /api/v1/goals/analyze returns 503 when AI service cannot be reached."""
    payload = {
        "target_amount": 500000.0,
        "current_savings_allocated": 50000.0,
        "target_months": 12,
        "monthly_income": 80000.0,
        "monthly_expenses": 45000.0,
        "existing_emi": 0.0
    }

    with patch.object(AIInsightService, "send_analyze_request", side_effect=AIInsightServiceError("AI Service unavailable", status_code=503)):
        response = client.post("/api/v1/goals/analyze", json=payload)

    assert response.status_code == 503
    assert "AI Service unavailable" in response.json()["detail"]


def test_api_goal_analyze_ai_service_bad_response_returns_502():
    """Verify POST /api/v1/goals/analyze returns 502 when AI service returns an error."""
    payload = {
        "target_amount": 500000.0,
        "current_savings_allocated": 50000.0,
        "target_months": 12,
        "monthly_income": 80000.0,
        "monthly_expenses": 45000.0,
        "existing_emi": 0.0
    }

    with patch.object(AIInsightService, "send_analyze_request", side_effect=AIInsightServiceError("AI Service returned 500", status_code=502)):
        response = client.post("/api/v1/goals/analyze", json=payload)

    assert response.status_code == 502
    assert "AI Service returned 500" in response.json()["detail"]


def test_existing_goal_endpoints_remain_functional():
    """Verify original deterministic goal endpoints continue functioning identically."""
    # 1. Forward goal calculation endpoint
    fwd_res = client.post("/api/v1/goals", json={
        "target_amount": 500000.0,
        "current_savings_allocated": 50000.0,
        "target_months": 12,
        "monthly_income": 80000.0,
        "monthly_expenses": 45000.0,
        "existing_emi": 0.0
    })
    assert fwd_res.status_code == 200
    assert fwd_res.json()["required_monthly_saving"] == 37500.0
    assert "ai_insight" not in fwd_res.json()

    # 2. Reverse goal calculation endpoint
    rev_res = client.post("/api/v1/goals/reverse", json={
        "target_amount": 500000.0,
        "target_months": 12,
        "current_monthly_income": 80000.0,
        "current_monthly_expenses": 45000.0
    })
    assert rev_res.status_code == 200
    assert rev_res.json()["required_monthly_saving"] == 41666.67
    assert "ai_insight" not in rev_res.json()

    # 3. Saved goal CRUD endpoints
    save_res = client.post("/api/v1/goals/save", json={
        "title": "Car Downpayment",
        "target_amount": 200000.0,
        "current_savings_allocated": 20000.0,
        "target_months": 10
    })
    assert save_res.status_code == 201
    g_id = save_res.json()["id"]

    list_res = client.get("/api/v1/goals/saved")
    assert list_res.status_code == 200
    assert any(g["id"] == g_id for g in list_res.json())

    del_res = client.delete(f"/api/v1/goals/saved/{g_id}")
    assert del_res.status_code == 200
