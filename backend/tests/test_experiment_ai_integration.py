"""
Tests for Backend -> AI Experiment Analysis Integration.

Verifies:
1. comparison_matrix passes directly into AI request without unwanted transformation (zero-adapter)
2. Translated payload validates against AI service's AnalyzeRequest schema
3. AIInsightService executes multi-scenario calculation, prepares payload, and handles AI service responses
4. HTTP /api/v1/experiments/compare/analyze endpoint works correctly
5. Error and unavailability handling matches standard 502/503 HTTP responses
6. Existing experiment calculation math and logic remain 100% untouched
"""

import sys
from pathlib import Path
from unittest.mock import patch
import pytest
from fastapi.testclient import TestClient

from app.main import app
from app.schemas.experiments import (
    ExperimentCompareRequest,
    ScenarioInput,
    ScenarioType,
)
from app.services.experiment_service import experiment_service
from app.services.ai_insight_service import (
    build_experiment_analysis_request,
    ai_insight_service,
    AIInsightService,
    AIInsightServiceError,
)

client = TestClient(app)


def _sample_experiment_request() -> ExperimentCompareRequest:
    return ExperimentCompareRequest(
        monthly_income=80000.0,
        monthly_expenses=45000.0,
        current_savings=200000.0,
        existing_emi=0.0,
        target_goal_amount=500000.0,
        target_goal_months=12,
        scenarios=[
            ScenarioInput(
                scenario_id="scenario_status_quo",
                scenario_name="No Purchase (Status Quo)",
                scenario_type=ScenarioType.NO_PURCHASE
            ),
            ScenarioInput(
                scenario_id="scenario_cash",
                scenario_name="Lump Sum Cash Purchase",
                scenario_type=ScenarioType.CASH_PURCHASE,
                purchase_amount=70000.0
            ),
            ScenarioInput(
                scenario_id="scenario_emi",
                scenario_name="EMI Financed Purchase",
                scenario_type=ScenarioType.EMI_PURCHASE,
                purchase_amount=70000.0,
                down_payment=10000.0,
                annual_interest_rate_pct=14.0,
                tenure_months=12
            )
        ],
        context_note="Evaluating laptop purchase strategies."
    )


def test_comparison_matrix_passed_directly_zero_adapter():
    """Verify comparison_matrix is passed directly without unwanted transformations."""
    req = _sample_experiment_request()
    calc_response = experiment_service.compare_scenarios(req)

    # Directly build AI request from calculation output
    ai_payload = build_experiment_analysis_request(
        experiment_result=calc_response,
        financial_position={
            "monthly_income": req.monthly_income,
            "monthly_expenses": req.monthly_expenses,
            "current_savings": req.current_savings,
            "monthly_surplus": req.monthly_income - req.monthly_expenses - req.existing_emi
        },
        context_note="Evaluating laptop purchase strategies."
    )

    assert ai_payload["analysis_type"] == "experiment_analysis"
    assert ai_payload["context_note"] == "Evaluating laptop purchase strategies."
    assert "experiment_analysis" in ai_payload
    
    scenarios = ai_payload["experiment_analysis"]["scenarios"]
    assert len(scenarios) == 3
    
    # Check that comparison_matrix records passed directly
    for i, orig_metric in enumerate(calc_response.comparison_matrix):
        scenario_data = scenarios[i]
        assert scenario_data["scenario_id"] == orig_metric.scenario_id
        assert scenario_data["scenario_name"] == orig_metric.scenario_name
        assert scenario_data["scenario_type"] == (orig_metric.scenario_type.value if hasattr(orig_metric.scenario_type, "value") else str(orig_metric.scenario_type))
        assert scenario_data["monthly_surplus"] == orig_metric.monthly_surplus
        assert scenario_data["projected_savings_12_months"] == orig_metric.projected_savings_12_months
        assert scenario_data["projected_savings_24_months"] == orig_metric.projected_savings_24_months
        assert scenario_data["emergency_fund_coverage_months"] == orig_metric.emergency_fund_coverage_months
        assert scenario_data["goal_reachable_in_target_timeline"] == orig_metric.goal_reachable_in_target_timeline
        assert scenario_data["total_interest_or_cost_paid"] == orig_metric.total_interest_or_cost_paid
        assert scenario_data["risk_level"] == orig_metric.risk_level
        assert scenario_data["trade_off_summary"] == orig_metric.trade_off_summary


def test_experiment_payload_validates_against_ai_schema():
    """Verify that the generated dictionary validates against the AI service Pydantic schema."""
    ai_root = Path(__file__).resolve().parent.parent.parent / "ai"
    if str(ai_root) not in sys.path:
        sys.path.insert(0, str(ai_root))

    import importlib.util
    schema_path = ai_root / "app" / "schemas.py"
    spec = importlib.util.spec_from_file_location("ai_schemas", str(schema_path))
    ai_schemas = importlib.util.module_from_spec(spec)
    sys.modules["ai_schemas"] = ai_schemas
    spec.loader.exec_module(ai_schemas)

    AnalyzeRequest = ai_schemas.AnalyzeRequest
    AnalysisType = ai_schemas.AnalysisType
    AnalyzeRequest.model_rebuild()

    req = _sample_experiment_request()
    calc = experiment_service.compare_scenarios(req)
    payload = build_experiment_analysis_request(
        experiment_result=calc,
        financial_position={
            "monthly_income": req.monthly_income,
            "monthly_expenses": req.monthly_expenses,
            "current_savings": req.current_savings,
            "monthly_surplus": req.monthly_income - req.monthly_expenses - req.existing_emi
        },
        context_note=req.context_note
    )

    parsed_ai_request = AnalyzeRequest(**payload)
    assert parsed_ai_request.analysis_type == AnalysisType.EXPERIMENT_ANALYSIS
    assert parsed_ai_request.experiment_analysis is not None
    assert len(parsed_ai_request.experiment_analysis.scenarios) == 3
    assert parsed_ai_request.experiment_analysis.scenarios[0].scenario_id == "scenario_status_quo"


def test_ai_insight_service_analyze_experiment_mocked():
    """Test AIInsightService.analyze_experiment_comparison with mocked AI response."""
    mock_ai_response = {
        "analysis_type": "experiment_analysis",
        "summary": "Comparing No Purchase, Lump Sum, and EMI strategies for ₹70,000 purchase.",
        "observations": [
            "Status quo preserves the maximum liquidity of ₹2,00,000.",
            "Lump sum immediately reduces emergency coverage to 2.89 months.",
            "EMI preserves cash buffer but incurs ₹4,650 in interest."
        ],
        "evidence": [
            "Lump sum savings at 12 months: ₹5,50,000 vs EMI: ₹5,45,350.",
            "Monthly surplus drops to ₹29,612.50 under EMI."
        ],
        "implications": [
            "All scenarios keep the 12-month goal reachable.",
            "EMI spreads the impact while retaining near-full liquidity."
        ],
        "risks": [
            "Lump sum incurs temporary liquidity dip below 3 months emergency buffer."
        ],
        "possible_actions": [
            "If liquidity safety is priority, select 12-month EMI.",
            "If zero interest cost is preferred, choose cash purchase."
        ]
    }

    req = _sample_experiment_request()

    with patch.object(ai_insight_service, "send_analyze_request", return_value=mock_ai_response) as mock_send:
        result = ai_insight_service.analyze_experiment_comparison(req)

        mock_send.assert_called_once()
        call_payload = mock_send.call_args[0][0]
        assert call_payload["analysis_type"] == "experiment_analysis"
        assert len(call_payload["experiment_analysis"]["scenarios"]) == 3
        assert "calculation" in result
        assert "ai_insight" in result
        assert len(result["calculation"]["comparison_matrix"]) == 3
        assert result["ai_insight"]["summary"] == mock_ai_response["summary"]


def test_experiment_analyze_endpoint():
    """Test POST /api/v1/experiments/compare/analyze endpoint."""
    mock_ai_response = {
        "analysis_type": "experiment_analysis",
        "summary": "Comparing multiple purchase decisions.",
        "observations": ["Status quo vs Lump sum vs EMI comparison."],
        "evidence": ["All options evaluated against base surplus ₹35,000."],
        "implications": ["Trade-offs clearly visible."],
        "risks": [],
        "possible_actions": ["Choose the scenario that matches your risk appetite."]
    }

    payload = _sample_experiment_request().model_dump()

    with patch.object(ai_insight_service, "send_analyze_request", return_value=mock_ai_response):
        response = client.post("/api/v1/experiments/compare/analyze", json=payload)
        assert response.status_code == 200
        data = response.json()
        assert "calculation" in data
        assert "ai_insight" in data
        assert len(data["calculation"]["comparison_matrix"]) == 3
        assert data["ai_insight"]["analysis_type"] == "experiment_analysis"


def test_experiment_ai_service_error_handling():
    """Test error handling when AI service is unavailable."""
    req = _sample_experiment_request()

    with patch.object(ai_insight_service, "send_analyze_request", side_effect=AIInsightServiceError("AI Service Offline", status_code=503)):
        response = client.post("/api/v1/experiments/compare/analyze", json=req.model_dump())
        assert response.status_code == 503
        assert "AI Service Offline" in response.json()["detail"]


def test_deterministic_experiment_calculation_unchanged():
    """Verify that existing deterministic experiment comparison engine remains 100% unchanged."""
    req = _sample_experiment_request()
    result = experiment_service.compare_scenarios(req)

    assert result.base_profile["monthly_income"] == 80000.0
    assert result.base_profile["monthly_expenses"] == 45000.0
    assert result.base_profile["current_savings"] == 200000.0
    assert result.base_profile["existing_emi"] == 0.0
    assert result.base_profile["target_goal_amount"] == 500000.0
    assert result.base_profile["target_goal_months"] == 12
    assert len(result.comparison_matrix) == 3

    # Status Quo checks
    sq = result.comparison_matrix[0]
    assert sq.scenario_id == "scenario_status_quo"
    assert sq.monthly_surplus == 35000.0
    assert sq.total_interest_or_cost_paid == 0.0
    assert sq.risk_level == "Low"

    # Cash purchase checks
    cash = result.comparison_matrix[1]
    assert cash.scenario_id == "scenario_cash"
    assert cash.immediate_savings_after_action == 130000.0  # 200k - 70k
    assert cash.total_interest_or_cost_paid == 70000.0
