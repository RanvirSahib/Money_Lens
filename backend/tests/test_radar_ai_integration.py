"""
Tests for Backend -> AI Radar Analysis Integration.

Verifies:
1. Exact radar alert mapping (category, severity, title, message, metric_value, threshold_value, impact)
2. trigger_rule is strictly excluded from AI request payload
3. metrics_summary -> financial_position mapping only maps available fields and does NOT invent existing_emi
4. AI payload parses and validates against AI service's AnalyzeRequest schema
5. AIInsightService.analyze_radar executes calculation, formats payload, and handles AI service response
6. HTTP POST /api/v1/radar/analyze (with include_ai=True) and POST /api/v1/radar/analyze/insights return AI insights
7. AI service unavailable / error handling (503 / 502)
8. Existing deterministic radar endpoints and calculations remain 100% unchanged
"""

import sys
from pathlib import Path
from unittest.mock import patch
import pytest
from fastapi.testclient import TestClient

from app.main import app
from app.schemas.radar import (
    RadarAlert,
    AlertCategory,
    RadarProfileRequest,
    FinancialRadarResponse
)
from app.schemas.common import SeverityLevel, HealthStatus
from app.services.radar_service import radar_service
from app.services.ai_insight_service import (
    adapt_radar_alert_to_ai,
    adapt_radar_metrics_to_financial_position,
    build_radar_analysis_request,
    ai_insight_service,
    AIInsightService,
    AIInsightServiceError,
)

client = TestClient(app)


def test_radar_alert_mapping_and_trigger_rule_exclusion():
    """Verify radar alert fields are faithfully mapped and trigger_rule is strictly excluded."""
    raw_alert = RadarAlert(
        id="radar_cashflow_critical",
        category=AlertCategory.CASH_FLOW_SHORTAGE,
        severity=SeverityLevel.CRITICAL,
        title="Negative Monthly Cash Flow Deficit",
        message="Monthly outflows exceed income by ₹5,000.00 per month.",
        metric_value=-5000.0,
        threshold_value=0.0,
        trigger_rule="Monthly Surplus < ₹0",
        impact="Depleting accumulated savings every month."
    )

    adapted = adapt_radar_alert_to_ai(raw_alert)

    # 1. Exact fields present
    assert adapted["id"] == "radar_cashflow_critical"
    assert adapted["category"] == "cash_flow_shortage"
    assert adapted["severity"] == "critical"
    assert adapted["title"] == "Negative Monthly Cash Flow Deficit"
    assert adapted["message"] == "Monthly outflows exceed income by ₹5,000.00 per month."
    assert adapted["metric_value"] == -5000.0
    assert adapted["threshold_value"] == 0.0
    assert adapted["impact"] == "Depleting accumulated savings every month."

    # 2. trigger_rule is strictly excluded
    assert "trigger_rule" not in adapted


def test_metrics_summary_to_financial_position_no_invented_emi():
    """Verify metrics_summary maps to financial_position without inventing existing_emi."""
    metrics_summary = {
        "monthly_income": 80000.0,
        "monthly_expenses": 45000.0,
        "monthly_surplus": 35000.0,
        "savings_rate_pct": 43.75,
        "current_savings": 200000.0,
        "emergency_fund_months": 4.44,
        "debt_to_income_pct": 0.0,
        "recurring_expense_ratio_pct": 25.0
    }

    pos = adapt_radar_metrics_to_financial_position(metrics_summary)

    assert pos["monthly_income"] == 80000.0
    assert pos["monthly_expenses"] == 45000.0
    assert pos["monthly_surplus"] == 35000.0
    assert pos["savings_rate_pct"] == 43.75
    assert pos["current_savings"] == 200000.0
    assert pos["emergency_fund_months"] == 4.44

    # existing_emi was not in metrics_summary and must NOT be invented
    assert "existing_emi" not in pos or pos.get("existing_emi") is None


def test_build_radar_analysis_request_structure():
    """Verify build_radar_analysis_request constructs proper AnalyzeRequest dictionary."""
    req = RadarProfileRequest(
        monthly_income=90000.0,
        monthly_expenses=50000.0,
        current_savings=150000.0,
        existing_emi=10000.0,
        context_note="Checking risk signals before job change."
    )
    radar_res = radar_service.evaluate_radar(profile=req)

    payload = build_radar_analysis_request(
        radar_result=radar_res,
        context_note=req.context_note
    )

    assert payload["analysis_type"] == "radar_analysis"
    assert payload["context_note"] == "Checking risk signals before job change."
    assert "radar_analysis" in payload
    
    radar_input = payload["radar_analysis"]
    assert "financial_position" in radar_input
    assert "radar_alerts" in radar_input
    assert len(radar_input["radar_alerts"]) > 0

    # Ensure no trigger_rule in any alert
    for alert in radar_input["radar_alerts"]:
        assert "trigger_rule" not in alert


def test_radar_payload_validates_against_ai_schema():
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

    req = RadarProfileRequest(
        monthly_income=75000.0,
        monthly_expenses=40000.0,
        current_savings=120000.0
    )
    radar_res = radar_service.evaluate_radar(profile=req)
    payload = build_radar_analysis_request(
        radar_result=radar_res,
        context_note="Quarterly financial health assessment"
    )

    parsed_ai_request = AnalyzeRequest(**payload)
    assert parsed_ai_request.analysis_type == AnalysisType.RADAR_ANALYSIS
    assert parsed_ai_request.radar_analysis is not None
    assert len(parsed_ai_request.radar_analysis.radar_alerts) > 0


def test_ai_insight_service_analyze_radar_mocked():
    """Test AIInsightService.analyze_radar with mocked HTTP client."""
    mock_ai_response = {
        "analysis_type": "radar_analysis",
        "summary": "Financial Radar indicates healthy cash flow with minor liquidity buffer attention needed.",
        "observations": [
            "Current savings covers 3.0 months of living expenses.",
            "Monthly surplus stands at ₹35,000 (43.8% savings rate)."
        ],
        "evidence": [
            "Income: ₹80,000, Expenses: ₹45,000, Net Surplus: ₹35,000."
        ],
        "implications": [
            "Baseline is solid but an extra month of emergency runway would improve resilience."
        ],
        "risks": [
            "Emergency fund is at standard baseline without excess cushion."
        ],
        "possible_actions": [
            "Channel next 2 months of surplus into liquid emergency reserve."
        ]
    }

    req = RadarProfileRequest(
        monthly_income=80000.0,
        monthly_expenses=45000.0,
        current_savings=135000.0,
        context_note="Evaluating baseline stability"
    )

    with patch.object(ai_insight_service, "send_analyze_request", return_value=mock_ai_response) as mock_send:
        result = ai_insight_service.analyze_radar(profile=req)

        mock_send.assert_called_once()
        call_payload = mock_send.call_args[0][0]
        assert call_payload["analysis_type"] == "radar_analysis"
        assert "calculation" in result
        assert "ai_insight" in result
        assert result["ai_insight"]["summary"] == mock_ai_response["summary"]


def test_radar_analyze_endpoints_behavior():
    """Test both deterministic and AI-enabled radar endpoints."""
    # 1. Standard POST /api/v1/radar/analyze (deterministic backward compatibility)
    payload = {
        "monthly_income": 90000.0,
        "monthly_expenses": 30000.0,
        "current_savings": 300000.0,
        "existing_emi": 0.0
    }
    resp = client.post("/api/v1/radar/analyze", json=payload)
    assert resp.status_code == 200
    data = resp.json()
    assert "health_score" in data
    assert "alerts" in data
    assert "metrics_summary" in data

    # 2. POST /api/v1/radar/analyze?include_ai=true (AI-enabled)
    mock_ai_response = {
        "analysis_type": "radar_analysis",
        "summary": "Excellent financial health score of 85+.",
        "observations": ["Low expense ratio."],
        "evidence": ["Surplus is ₹60,000."],
        "implications": ["Rapid wealth accumulation."],
        "risks": [],
        "possible_actions": ["Invest surplus in diversified instruments."]
    }
    with patch.object(ai_insight_service, "send_analyze_request", return_value=mock_ai_response):
        ai_resp = client.post("/api/v1/radar/analyze?include_ai=true", json=payload)
        assert ai_resp.status_code == 200
        ai_data = ai_resp.json()
        assert "calculation" in ai_data
        assert "ai_insight" in ai_data
        assert ai_data["ai_insight"]["analysis_type"] == "radar_analysis"

    # 3. Dedicated POST /api/v1/radar/analyze/insights
    with patch.object(ai_insight_service, "send_analyze_request", return_value=mock_ai_response):
        insights_resp = client.post("/api/v1/radar/analyze/insights", json=payload)
        assert insights_resp.status_code == 200
        insights_data = insights_resp.json()
        assert "calculation" in insights_data
        assert "ai_insight" in insights_data


def test_radar_ai_service_error_handling():
    """Test error handling when AI service is unavailable."""
    payload = {
        "monthly_income": 80000.0,
        "monthly_expenses": 45000.0,
        "current_savings": 200000.0
    }

    with patch.object(ai_insight_service, "send_analyze_request", side_effect=AIInsightServiceError("AI Service Unreachable", status_code=503)):
        resp = client.post("/api/v1/radar/analyze/insights", json=payload)
        assert resp.status_code == 503
        assert "AI Service Unreachable" in resp.json()["detail"]


def test_deterministic_radar_calculation_unchanged():
    """Verify deterministic radar calculations remain 100% exact and untouched."""
    req = RadarProfileRequest(
        monthly_income=100000.0,
        monthly_expenses=50000.0,
        current_savings=300000.0,
        existing_emi=10000.0
    )
    result = radar_service.evaluate_radar(profile=req)

    assert result.health_score > 0
    assert result.metrics_summary["monthly_income"] == 100000.0
    assert result.metrics_summary["monthly_expenses"] == 50000.0
    assert result.metrics_summary["monthly_surplus"] == 40000.0  # 100k - 50k - 10k
    assert result.metrics_summary["savings_rate_pct"] == 40.0
    assert result.metrics_summary["current_savings"] == 300000.0
    assert result.metrics_summary["emergency_fund_months"] == 6.0  # 300k / 50k
    assert result.metrics_summary["debt_to_income_pct"] == 10.0   # 10k / 100k
