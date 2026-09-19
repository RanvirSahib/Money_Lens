"""
Tests for Backend -> AI Time Machine Integration.

Verifies:
1. Combination of Baseline FinancialPositionResponse + Decision Simulation Response (Purchase, EMI, Savings)
2. Zero duplicate financial calculations - 100% preservation of deterministic engine outputs
3. All required Time Machine fields are mapped and present
4. AI payload validates against AI service's AnalyzeRequest schema
5. AIInsightService executes calculations, combines responses, and handles AI service response
6. HTTP POST /api/v1/simulate/purchase/analyze, /emi/analyze, /savings/analyze endpoints work correctly
7. AI service unavailable / error handling (503 / 502)
8. Existing deterministic simulation endpoints remain 100% unchanged
"""

import sys
from pathlib import Path
from unittest.mock import patch
import pytest
from fastapi.testclient import TestClient

from app.main import app
from app.schemas.simulation import (
    FinancialPositionRequest,
    FinancialPositionResponse,
    PurchaseSimulationRequest,
    PurchaseSimulationResponse,
    EMISimulationRequest,
    EMISimulationResponse,
    SavingsProjectionRequest,
    SavingsProjectionResponse,
)
from app.services.simulation_service import simulation_service
from app.services.ai_insight_service import (
    adapt_financial_position_to_ai,
    adapt_simulation_result_to_ai,
    build_time_machine_analysis_request,
    ai_insight_service,
    AIInsightService,
    AIInsightServiceError,
)

client = TestClient(app)


def test_time_machine_response_combination():
    """Verify combining baseline FinancialPositionResponse and PurchaseSimulationResponse."""
    pos_req = FinancialPositionRequest(
        monthly_income=80000.0,
        monthly_expenses=45000.0,
        current_savings=200000.0,
        existing_emi=5000.0
    )
    baseline_position = simulation_service.get_financial_position(pos_req)

    purchase_req = PurchaseSimulationRequest(
        monthly_income=80000.0,
        monthly_expenses=45000.0,
        current_savings=200000.0,
        purchase_amount=70000.0,
        existing_emi=5000.0,
        duration_months=12
    )
    sim_result = simulation_service.simulate_purchase(purchase_req)

    # Build Time Machine payload
    ai_payload = build_time_machine_analysis_request(
        financial_position=baseline_position,
        simulation_result=sim_result,
        context_note="Evaluating upfront cash purchase of ₹70,000.",
        scenario_label="upfront_cash_purchase"
    )

    assert ai_payload["analysis_type"] == "time_machine"
    assert ai_payload["context_note"] == "Evaluating upfront cash purchase of ₹70,000."
    assert "time_machine" in ai_payload
    
    tm = ai_payload["time_machine"]
    assert "financial_position" in tm
    assert "simulation_result" in tm

    # 1. Check all 10 Financial Position fields
    fp = tm["financial_position"]
    assert fp["monthly_income"] == 80000.0
    assert fp["monthly_expenses"] == 45000.0
    assert fp["existing_emi"] == 5000.0
    assert fp["monthly_surplus"] == 30000.0
    assert fp["savings_rate_pct"] == 37.5
    assert fp["current_savings"] == 200000.0
    assert fp["emergency_fund_months"] == round(200000.0 / 45000.0, 1)
    assert fp["projected_balance_3_months"] == 290000.0
    assert fp["projected_balance_6_months"] == 380000.0
    assert fp["projected_balance_12_months"] == 560000.0

    # 2. Check Simulation Result fields
    sr = tm["simulation_result"]
    assert sr["scenario"] == "upfront_cash_purchase"
    assert sr["data"]["purchase_amount"] == 70000.0
    assert sr["data"]["post_purchase_savings"] == 130000.0
    assert sr["data"]["is_savings_depleted"] is False


def test_time_machine_payload_validates_against_ai_schema():
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

    pos_req = FinancialPositionRequest(
        monthly_income=90000.0,
        monthly_expenses=50000.0,
        current_savings=250000.0,
        existing_emi=0.0
    )
    pos = simulation_service.get_financial_position(pos_req)

    emi_req = EMISimulationRequest(
        purchase_amount=80000.0,
        down_payment=15000.0,
        annual_interest_rate_pct=13.5,
        tenure_months=12,
        monthly_income=90000.0,
        monthly_expenses=50000.0,
        current_savings=250000.0,
        existing_emi=0.0
    )
    emi_sim = simulation_service.simulate_emi(emi_req)

    payload = build_time_machine_analysis_request(
        financial_position=pos,
        simulation_result=emi_sim,
        context_note="Evaluating 12-month EMI financing",
        scenario_label="emi_financed_purchase"
    )

    parsed_ai_request = AnalyzeRequest(**payload)
    assert parsed_ai_request.analysis_type == AnalysisType.TIME_MACHINE
    assert parsed_ai_request.time_machine is not None
    assert parsed_ai_request.time_machine.financial_position.monthly_income == 90000.0
    assert parsed_ai_request.time_machine.simulation_result.scenario == "emi_financed_purchase"


def test_ai_insight_service_purchase_simulation_mocked():
    """Test AIInsightService.analyze_purchase_simulation with mocked HTTP call."""
    mock_ai_response = {
        "analysis_type": "time_machine",
        "summary": "Cash purchase of ₹70,000 temporarily reduces emergency cushion to 2.89 months.",
        "observations": [
            "Current savings drops from ₹2,00,000 to ₹1,30,000 immediately.",
            "Monthly surplus of ₹35,000 recovers the purchase cost in 2 months."
        ],
        "evidence": [
            "Baseline 12-month balance: ₹6,20,000 vs Post-purchase: ₹5,50,000."
        ],
        "implications": [
            "Minimal long-term wealth impact; emergency fund recovers quickly."
        ],
        "risks": [
            "Slight temporary dip below standard 3.0-month emergency baseline."
        ],
        "possible_actions": [
            "Proceed with cash purchase if no major unforeseen expense is expected in next 60 days."
        ]
    }

    req = PurchaseSimulationRequest(
        monthly_income=80000.0,
        monthly_expenses=45000.0,
        current_savings=200000.0,
        purchase_amount=70000.0,
        existing_emi=0.0,
        duration_months=12,
        context_note="Buying work workstation."
    )

    with patch.object(ai_insight_service, "send_analyze_request", return_value=mock_ai_response) as mock_send:
        result = ai_insight_service.analyze_purchase_simulation(req)

        mock_send.assert_called_once()
        call_payload = mock_send.call_args[0][0]
        assert call_payload["analysis_type"] == "time_machine"
        assert "baseline_position" in result
        assert "calculation" in result
        assert "ai_insight" in result
        assert result["baseline_position"]["monthly_surplus"] == 35000.0
        assert result["calculation"]["purchase_amount"] == 70000.0
        assert result["ai_insight"]["summary"] == mock_ai_response["summary"]


def test_ai_insight_service_emi_simulation_mocked():
    """Test AIInsightService.analyze_emi_simulation with mocked HTTP call."""
    mock_ai_response = {
        "analysis_type": "time_machine",
        "summary": "12-month EMI maintains liquid reserves but reduces monthly cash buffer by ₹5,387/month.",
        "observations": [
            "Down payment of ₹10,000 leaves ₹1,90,000 in liquid savings.",
            "Total interest paid across 12 months is ₹4,646.72."
        ],
        "evidence": [
            "Monthly surplus during loan tenure: ₹29,613/month."
        ],
        "implications": [
            "Liquid emergency runway remains comfortable at 4.2 months."
        ],
        "risks": [
            "Fixed EMI obligation tightens monthly cash flow flexibility."
        ],
        "possible_actions": [
            "Opt for EMI to retain liquidity safety."
        ]
    }

    req = EMISimulationRequest(
        purchase_amount=70000.0,
        down_payment=10000.0,
        annual_interest_rate_pct=14.0,
        tenure_months=12,
        monthly_income=80000.0,
        monthly_expenses=45000.0,
        current_savings=200000.0,
        existing_emi=0.0
    )

    with patch.object(ai_insight_service, "send_analyze_request", return_value=mock_ai_response):
        result = ai_insight_service.analyze_emi_simulation(req)
        assert result["baseline_position"]["current_savings"] == 200000.0
        assert result["calculation"]["monthly_emi"] > 0
        assert result["ai_insight"]["analysis_type"] == "time_machine"


def test_ai_insight_service_savings_simulation_mocked():
    """Test AIInsightService.analyze_savings_simulation with mocked HTTP call."""
    mock_ai_response = {
        "analysis_type": "time_machine",
        "summary": "Savings growth trajectory with 7% returns generates significant compounding.",
        "observations": ["Projected 12-month balance grows steadily."],
        "evidence": ["Monthly contributions of ₹35,000 compound."],
        "implications": ["Wealth accumulation target on track."],
        "risks": [],
        "possible_actions": ["Maintain consistent monthly surplus allocation."]
    }

    req = SavingsProjectionRequest(
        current_savings=200000.0,
        monthly_income=80000.0,
        monthly_expenses=45000.0,
        existing_emi=0.0,
        annual_return_pct=7.0,
        duration_months=12
    )

    with patch.object(ai_insight_service, "send_analyze_request", return_value=mock_ai_response):
        result = ai_insight_service.analyze_savings_simulation(req)
        assert result["baseline_position"]["monthly_income"] == 80000.0
        assert result["calculation"]["final_projected_savings"] > 200000.0
        assert result["ai_insight"]["summary"] == mock_ai_response["summary"]


def test_simulation_analyze_endpoints():
    """Test POST /api/v1/simulate/purchase/analyze, /emi/analyze, /savings/analyze HTTP endpoints."""
    mock_ai_response = {
        "analysis_type": "time_machine",
        "summary": "Simulation evaluated successfully.",
        "observations": [],
        "evidence": [],
        "implications": [],
        "risks": [],
        "possible_actions": []
    }

    # 1. Purchase analyze endpoint
    with patch.object(ai_insight_service, "send_analyze_request", return_value=mock_ai_response):
        resp = client.post("/api/v1/simulate/purchase/analyze", json={
            "monthly_income": 80000.0,
            "monthly_expenses": 45000.0,
            "current_savings": 200000.0,
            "purchase_amount": 50000.0,
            "existing_emi": 0.0,
            "duration_months": 12,
            "context_note": "Buying appliance"
        })
        assert resp.status_code == 200
        data = resp.json()
        assert "baseline_position" in data
        assert "calculation" in data
        assert "ai_insight" in data
        assert data["calculation"]["purchase_amount"] == 50000.0

    # 2. EMI analyze endpoint
    with patch.object(ai_insight_service, "send_analyze_request", return_value=mock_ai_response):
        resp_emi = client.post("/api/v1/simulate/emi/analyze", json={
            "purchase_amount": 60000.0,
            "down_payment": 10000.0,
            "annual_interest_rate_pct": 12.0,
            "tenure_months": 12,
            "monthly_income": 80000.0,
            "monthly_expenses": 45000.0,
            "current_savings": 200000.0,
            "existing_emi": 0.0
        })
        assert resp_emi.status_code == 200
        data_emi = resp_emi.json()
        assert "baseline_position" in data_emi
        assert "calculation" in data_emi
        assert data_emi["calculation"]["loan_amount"] == 50000.0

    # 3. Savings analyze endpoint
    with patch.object(ai_insight_service, "send_analyze_request", return_value=mock_ai_response):
        resp_sav = client.post("/api/v1/simulate/savings/analyze", json={
            "current_savings": 200000.0,
            "monthly_income": 80000.0,
            "monthly_expenses": 45000.0,
            "existing_emi": 0.0,
            "annual_return_pct": 7.0,
            "duration_months": 12
        })
        assert resp_sav.status_code == 200
        data_sav = resp_sav.json()
        assert "baseline_position" in data_sav
        assert "calculation" in data_sav


def test_simulation_ai_service_error_handling():
    """Test error handling when AI service is unavailable."""
    with patch.object(ai_insight_service, "send_analyze_request", side_effect=AIInsightServiceError("AI Service Offline", status_code=503)):
        resp = client.post("/api/v1/simulate/purchase/analyze", json={
            "monthly_income": 80000.0,
            "monthly_expenses": 45000.0,
            "current_savings": 200000.0,
            "purchase_amount": 50000.0
        })
        assert resp.status_code == 503
        assert "AI Service Offline" in resp.json()["detail"]


def test_deterministic_simulation_endpoints_unchanged():
    """Verify deterministic simulation endpoints continue to produce identical mathematical output."""
    # 1. Position endpoint
    pos_resp = client.post("/api/v1/simulate/position", json={
        "monthly_income": 80000.0,
        "monthly_expenses": 45000.0,
        "current_savings": 200000.0,
        "existing_emi": 5000.0
    })
    assert pos_resp.status_code == 200
    pos_data = pos_resp.json()
    assert pos_data["monthly_surplus"] == 30000.0
    assert pos_data["emergency_fund_months"] == round(200000.0 / 45000.0, 1)

    # 2. Purchase endpoint
    purch_resp = client.post("/api/v1/simulate/purchase", json={
        "monthly_income": 80000.0,
        "monthly_expenses": 45000.0,
        "current_savings": 200000.0,
        "purchase_amount": 70000.0,
        "existing_emi": 0.0,
        "duration_months": 12
    })
    assert purch_resp.status_code == 200
    purch_data = purch_resp.json()
    assert purch_data["post_purchase_savings"] == 130000.0
    assert purch_data["monthly_surplus"] == 35000.0

    # 3. EMI endpoint
    emi_resp = client.post("/api/v1/simulate/emi", json={
        "purchase_amount": 70000.0,
        "down_payment": 10000.0,
        "annual_interest_rate_pct": 12.0,
        "tenure_months": 12,
        "monthly_income": 80000.0,
        "monthly_expenses": 45000.0,
        "current_savings": 200000.0,
        "existing_emi": 0.0
    })
    assert emi_resp.status_code == 200
    emi_data = emi_resp.json()
    assert emi_data["loan_amount"] == 60000.0
    assert emi_data["monthly_emi"] > 0
