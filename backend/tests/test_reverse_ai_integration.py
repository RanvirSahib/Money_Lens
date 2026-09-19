"""
Tests for Backend -> AI Reverse Analysis Integration.

Verifies:
1. Adapter accurately converts ReverseGoalResponse to AI AnalyzeRequest (reverse_analysis)
2. Translated payload validates against AI service's AnalyzeRequest schema
3. AIInsightService executes calculation, adapts payload, and handles AI service responses
4. HTTP /api/v1/goals/reverse/analyze endpoint works correctly
5. Deterministic financial calculations remain 100% intact and untouched
"""

import pytest
from unittest.mock import patch, MagicMock
from fastapi.testclient import TestClient
import httpx

from app.main import app
from app.schemas.goals import ReverseGoalRequest, ReverseGoalResponse
from app.services.goal_service import goal_service
from app.services.ai_insight_service import (
    adapt_reverse_goal_to_ai_input,
    build_reverse_analysis_request,
    ai_insight_service,
    AIInsightService,
    AIInsightServiceError,
)

client = TestClient(app)


def test_reverse_goal_adapter_translation():
    """Verify that backend ReverseGoalResponse maps faithfully to the AI input schema."""
    req = ReverseGoalRequest(
        target_amount=500000.0,
        target_months=12,
        current_monthly_income=80000.0,
        current_monthly_expenses=45000.0,
        existing_emi=5000.0,
        expected_annual_return_pct=0.0
    )
    calc_response = goal_service.calculate_reverse_goal_engine(req)

    # 1. Test adapt_reverse_goal_to_ai_input
    position_data = {
        "monthly_income": 80000.0,
        "monthly_expenses": 45000.0,
        "existing_emi": 5000.0,
        "monthly_surplus": 30000.0
    }
    adapted = adapt_reverse_goal_to_ai_input(calc_response, financial_position=position_data)
    
    assert "reverse_goal" in adapted
    assert adapted["financial_position"] == position_data
    
    rg = adapted["reverse_goal"]
    assert rg["target_amount"] == 500000.0
    assert rg["target_months"] == 12
    assert rg["required_monthly_saving"] == calc_response.required_monthly_saving
    assert rg["current_monthly_surplus"] == calc_response.current_monthly_surplus
    assert rg["additional_monthly_needed"] == calc_response.additional_monthly_needed
    assert rg["is_currently_sufficient"] == calc_response.is_currently_sufficient
    # Critical field rename check: alternative_timeline_at_current_surplus_months -> alternative_timeline_months
    assert rg["alternative_timeline_months"] == calc_response.alternative_timeline_at_current_surplus_months
    assert rg["actionable_levers"] == calc_response.actionable_levers

    # 2. Test build_reverse_analysis_request
    full_request = build_reverse_analysis_request(
        reverse_goal=calc_response,
        financial_position=position_data,
        context_note="Testing emergency savings"
    )
    assert full_request["analysis_type"] == "reverse_analysis"
    assert full_request["context_note"] == "Testing emergency savings"
    assert "reverse_analysis" in full_request
    assert full_request["reverse_analysis"]["reverse_goal"]["target_amount"] == 500000.0


def test_adapted_payload_validates_against_ai_schema():
    """Verify that the generated dictionary validates against the AI service Pydantic schema."""
    import sys
    from pathlib import Path
    ai_root = Path(__file__).resolve().parent.parent.parent / "ai"
    if str(ai_root) not in sys.path:
        sys.path.insert(0, str(ai_root))

    # In ai/, schemas is in app.schemas
    import importlib.util
    schema_path = ai_root / "app" / "schemas.py"
    spec = importlib.util.spec_from_file_location("ai_schemas", str(schema_path))
    ai_schemas = importlib.util.module_from_spec(spec)
    sys.modules["ai_schemas"] = ai_schemas
    spec.loader.exec_module(ai_schemas)

    AnalyzeRequest = ai_schemas.AnalyzeRequest
    AnalysisType = ai_schemas.AnalysisType
    AnalyzeRequest.model_rebuild()

    req = ReverseGoalRequest(
        target_amount=300000.0,
        target_months=6,
        current_monthly_income=90000.0,
        current_monthly_expenses=50000.0,
        existing_emi=0.0
    )
    calc = goal_service.calculate_reverse_goal_engine(req)
    payload = build_reverse_analysis_request(
        reverse_goal=calc,
        financial_position={"monthly_income": 90000.0, "monthly_surplus": 40000.0},
        context_note="Quick sprint to save 3L"
    )

    # Validate against AI service AnalyzeRequest
    parsed_ai_request = AnalyzeRequest(**payload)
    assert parsed_ai_request.analysis_type == AnalysisType.REVERSE_ANALYSIS
    assert parsed_ai_request.reverse_analysis is not None
    assert parsed_ai_request.reverse_analysis.reverse_goal.target_amount == 300000.0
    assert parsed_ai_request.reverse_analysis.reverse_goal.target_months == 6


def test_ai_insight_service_analyze_reverse_goal_mocked():
    """Test AIInsightService with mocked HTTP post."""
    mock_ai_response = {
        "analysis_type": "reverse_analysis",
        "summary": "To accumulate ₹5,00,000 in 12 months, you need ₹41,666.67/month.",
        "observations": ["Target amount is ₹5,00,000 over 12 months."],
        "evidence": ["Current surplus is ₹35,000, leaving a ₹6,666.67 monthly shortfall."],
        "implications": ["Without adjustments, you will reach your goal in ~15 months."],
        "risks": ["Shortfall requires expense discipline or timeline extension."],
        "possible_actions": ["Reduce discretionary spending by ₹6,667/month."]
    }

    req = ReverseGoalRequest(
        target_amount=500000.0,
        target_months=12,
        current_monthly_income=80000.0,
        current_monthly_expenses=45000.0,
        existing_emi=0.0
    )

    with patch.object(ai_insight_service, "send_analyze_request", return_value=mock_ai_response) as mock_send:
        result = ai_insight_service.analyze_reverse_goal(req, context_note="Vacation planning")
        
        mock_send.assert_called_once()
        call_payload = mock_send.call_args[0][0]
        assert call_payload["analysis_type"] == "reverse_analysis"
        assert call_payload["context_note"] == "Vacation planning"
        assert call_payload["reverse_analysis"]["reverse_goal"]["target_amount"] == 500000.0
        
        assert "calculation" in result
        assert "ai_insight" in result
        assert result["calculation"]["target_amount"] == 500000.0
        assert result["ai_insight"]["summary"] == mock_ai_response["summary"]


def test_ai_insight_service_error_handling():
    """Test AIInsightService error handling on connection failure or bad status."""
    service = AIInsightService(base_url="http://127.0.0.1:9999", timeout=1.0)
    
    with pytest.raises(AIInsightServiceError) as exc_info:
        service.send_analyze_request({"analysis_type": "reverse_analysis"})
    
    assert exc_info.value.status_code == 503
    assert "Failed to connect to AI service" in exc_info.value.message


def test_reverse_goal_analyze_endpoint():
    """Test POST /api/v1/goals/reverse/analyze route."""
    mock_ai_response = {
        "analysis_type": "reverse_analysis",
        "summary": "Target goal is reachable with modest budget reallocations.",
        "observations": ["Target amount ₹2,00,000 in 6 months."],
        "evidence": ["Current surplus ₹30,000 vs required ₹33,333.33."],
        "implications": ["A ₹3,333.33 monthly adjustment achieves the goal on time."],
        "risks": [],
        "possible_actions": ["Cut discretionary expenses by ₹3,334/month."]
    }

    payload = {
        "target_amount": 200000.0,
        "target_months": 6,
        "current_monthly_income": 70000.0,
        "current_monthly_expenses": 40000.0,
        "existing_emi": 0.0,
        "expected_annual_return_pct": 0.0,
        "context_note": "Buying professional camera equipment"
    }

    with patch.object(ai_insight_service, "send_analyze_request", return_value=mock_ai_response):
        response = client.post("/api/v1/goals/reverse/analyze", json=payload)
        assert response.status_code == 200
        data = response.json()
        assert "calculation" in data
        assert "ai_insight" in data
        assert data["calculation"]["target_amount"] == 200000.0
        assert data["calculation"]["target_months"] == 6
        assert data["ai_insight"]["analysis_type"] == "reverse_analysis"
        assert len(data["ai_insight"]["possible_actions"]) > 0


def test_deterministic_reverse_goal_engine_unchanged():
    """Ensure baseline deterministic calculation remains 100% exact."""
    req = ReverseGoalRequest(
        target_amount=600000.0,
        target_months=12,
        current_monthly_income=100000.0,
        current_monthly_expenses=60000.0,
        existing_emi=10000.0,
        expected_annual_return_pct=0.0
    )
    result = goal_service.calculate_reverse_goal_engine(req)
    
    assert result.target_amount == 600000.0
    assert result.target_months == 12
    assert result.current_monthly_surplus == 30000.0  # 100k - 60k - 10k
    assert result.required_monthly_saving == 50000.0  # 600k / 12
    assert result.additional_monthly_needed == 20000.0 # 50k - 30k
    assert result.is_currently_sufficient is False
    assert result.alternative_timeline_at_current_surplus_months == 20  # 600k / 30k
