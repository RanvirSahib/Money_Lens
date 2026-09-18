"""
MoneyLens AI Service — Test Suite.

All tests mock the Groq client. No real API calls are made.

Test strategy
-------------
- Unit tests for GroqService internals (_extract_json, call_groq, analyze).
- Integration-style tests for FastAPI endpoints using TestClient.
- Mock injection via GroqService(client=<mock>) — the singleton is never used.
- All five MoneyLens AI modes are tested.
- Invalid analysis_type is rejected at the schema level (422).
- Prompt system is verified (system + user messages present, mode-specific text).
"""

from __future__ import annotations

import json
from types import SimpleNamespace
from unittest.mock import MagicMock, patch

import pytest
from fastapi.testclient import TestClient


# ---------------------------------------------------------------------------
# Shared helpers
# ---------------------------------------------------------------------------

def _make_mock_groq_client(raw_content: str) -> MagicMock:
    """Return a MagicMock Groq client that always returns `raw_content`."""
    mock_message    = SimpleNamespace(content=raw_content)
    mock_choice     = SimpleNamespace(message=mock_message)
    mock_completion = SimpleNamespace(choices=[mock_choice])
    mock_client     = MagicMock()
    mock_client.chat.completions.create.return_value = mock_completion
    return mock_client


def _make_valid_response(analysis_type: str = "time_machine") -> str:
    """Return a valid serialised AnalyzeResponse JSON for the given mode."""
    return json.dumps({
        "analysis_type": analysis_type,
        "summary": "This is a summary of the financial situation.",
        "observations": [
            "Monthly surplus is INR 30,000.",
            "Emergency fund covers 4.4 months of expenses.",
        ],
        "evidence": [
            "Supplied monthly_surplus: 30000.0",
            "Supplied emergency_fund_months: 4.4",
        ],
        "implications": [
            "The current surplus provides a reasonable buffer.",
        ],
        "risks": [
            "Emergency fund is below the recommended 6-month threshold.",
        ],
        "possible_actions": [
            "Allocate an extra INR 5,000 per month to the emergency fund.",
        ],
    })


# Reuse across many tests
_VALID_GROQ_JSON = _make_valid_response("time_machine")

# ---------------------------------------------------------------------------
# Canonical test payloads for each mode
# ---------------------------------------------------------------------------

_TIME_MACHINE_PAYLOAD = {
    "analysis_type": "time_machine",
    "context_note": "User is considering buying a laptop on EMI.",
    "time_machine": {
        "financial_position": {
            "monthly_income": 80000.0,
            "monthly_expenses": 45000.0,
            "existing_emi": 5000.0,
            "monthly_surplus": 30000.0,
            "savings_rate_pct": 37.5,
            "current_savings": 200000.0,
            "emergency_fund_months": 4.4,
        },
        "simulation_result": {
            "scenario": "emi_financed_purchase",
            "data": {
                "purchase_amount": 70000.0,
                "monthly_emi": 6000.0,
                "total_interest": 4200.0,
                "tenure_months": 12,
                "new_monthly_surplus_during_tenure": 24000.0,
            }
        },
        "radar_alerts": [
            {
                "id": "alert_emi_01",
                "category": "debt_burden_risk",
                "severity": "medium",
                "title": "Increased EMI Burden",
                "message": "Total EMI will rise to INR 11,000 after purchase.",
                "metric_value": 13.75,
                "threshold_value": 40.0,
                "impact": "Reduces monthly flexibility for 12 months.",
            }
        ],
    }
}

_GOAL_ANALYSIS_PAYLOAD = {
    "analysis_type": "goal_analysis",
    "goal_analysis": {
        "financial_position": {
            "monthly_income": 80000.0,
            "monthly_surplus": 30000.0,
            "current_savings": 200000.0,
        },
        "goals": [
            {
                "title": "Emergency Fund",
                "target_amount": 500000.0,
                "current_savings_allocated": 200000.0,
                "target_months": 12,
                "required_monthly_saving": 25000.0,
                "monthly_gap_or_shortfall": 5000.0,
                "is_reachable": True,
                "projected_completion_months": 12,
                "status": "on_track",
                "status_description": "On track to reach the goal within 12 months.",
            }
        ],
    }
}

_REVERSE_ANALYSIS_PAYLOAD = {
    "analysis_type": "reverse_analysis",
    "reverse_analysis": {
        "financial_position": {
            "monthly_income": 80000.0,
            "monthly_surplus": 28000.0,
            "current_savings": 150000.0,
        },
        "reverse_goal": {
            "target_amount": 500000.0,
            "target_months": 12,
            "required_monthly_saving": 35000.0,
            "current_monthly_surplus": 28000.0,
            "additional_monthly_needed": 7000.0,
            "is_currently_sufficient": False,
            "alternative_timeline_months": 16,
            "actionable_levers": {
                "required_expense_reduction": 7000.0,
                "required_income_increase": 7000.0,
            },
        },
    }
}

_EXPERIMENT_ANALYSIS_PAYLOAD = {
    "analysis_type": "experiment_analysis",
    "experiment_analysis": {
        "financial_position": {
            "monthly_income": 80000.0,
            "monthly_surplus": 30000.0,
            "current_savings": 200000.0,
        },
        "scenarios": [
            {
                "scenario_id": "a",
                "scenario_name": "No Purchase",
                "scenario_type": "no_purchase",
                "monthly_surplus": 30000.0,
                "projected_savings_12_months": 560000.0,
                "risk_level": "low",
                "trade_off_summary": "Maximum savings; no new asset.",
            },
            {
                "scenario_id": "b",
                "scenario_name": "Cash Purchase",
                "scenario_type": "cash_purchase",
                "monthly_surplus": 30000.0,
                "projected_savings_12_months": 490000.0,
                "risk_level": "medium",
                "trade_off_summary": "Asset acquired immediately; INR 70,000 from savings.",
            },
        ],
    }
}

_RADAR_ANALYSIS_PAYLOAD = {
    "analysis_type": "radar_analysis",
    "radar_analysis": {
        "financial_position": {
            "monthly_income": 80000.0,
            "monthly_expenses": 45000.0,
            "current_savings": 120000.0,
            "emergency_fund_months": 2.7,
        },
        "radar_alerts": [
            {
                "id": "alert_ef_01",
                "category": "low_balance_risk",
                "severity": "high",
                "title": "Emergency Fund Critically Low",
                "message": "Savings cover only 2.7 months; minimum is 3 months.",
                "metric_value": 2.7,
                "threshold_value": 3.0,
                "impact": "Any unexpected expense above INR 120,000 would deplete reserves.",
            }
        ],
    }
}

# Legacy payload kept for backward-compatibility tests that don't use analysis_type
_MINIMAL_POSITION_PAYLOAD = _TIME_MACHINE_PAYLOAD


# ---------------------------------------------------------------------------
# GroqService unit tests — JSON extraction
# ---------------------------------------------------------------------------

class TestGroqServiceJsonExtraction:
    """Tests for the _extract_json static helper."""

    def test_plain_json_passthrough(self):
        from app.services.groq_service import GroqService
        raw = '{"analysis_type":"time_machine","summary":"ok","observations":[],"evidence":[],"implications":[],"risks":[],"possible_actions":[]}'
        assert GroqService._extract_json(raw) == raw

    def test_strips_markdown_json_fence(self):
        from app.services.groq_service import GroqService
        raw = '```json\n{"summary": "ok"}\n```'
        result = GroqService._extract_json(raw)
        assert result == '{"summary": "ok"}'

    def test_strips_plain_markdown_fence(self):
        from app.services.groq_service import GroqService
        raw = '```\n{"summary": "ok"}\n```'
        result = GroqService._extract_json(raw)
        assert result == '{"summary": "ok"}'

    def test_extracts_json_from_surrounding_text(self):
        from app.services.groq_service import GroqService
        raw = 'Here is the response: {"summary": "test"} End.'
        result = GroqService._extract_json(raw)
        assert result == '{"summary": "test"}'

    def test_whitespace_handling(self):
        from app.services.groq_service import GroqService
        raw = '  \n  {"summary": "ok"}  \n  '
        result = GroqService._extract_json(raw)
        assert result == '{"summary": "ok"}'


# ---------------------------------------------------------------------------
# GroqService.call_groq tests
# ---------------------------------------------------------------------------

class TestGroqServiceCallGroq:
    """Tests for GroqService.call_groq()."""

    def _get_system_prompt(self):
        from app.prompts import get_system_prompt
        from app.schemas import AnalysisType
        return get_system_prompt(AnalysisType.TIME_MACHINE)

    def test_returns_model_content_on_success(self):
        from app.services.groq_service import GroqService
        mock_client = _make_mock_groq_client("hello world")
        service = GroqService(client=mock_client)
        result = service.call_groq("test prompt", self._get_system_prompt())
        assert result == "hello world"

    def test_raises_on_empty_choices(self):
        from app.services.groq_service import GroqService, GroqServiceError
        mock_client = MagicMock()
        mock_client.chat.completions.create.return_value = SimpleNamespace(choices=[])
        service = GroqService(client=mock_client)
        with pytest.raises(GroqServiceError):
            service.call_groq("test prompt", self._get_system_prompt())

    def test_raises_on_none_message_content(self):
        from app.services.groq_service import GroqService, GroqServiceError
        mock_message = SimpleNamespace(content=None)
        mock_choice  = SimpleNamespace(message=mock_message)
        mock_client  = MagicMock()
        mock_client.chat.completions.create.return_value = SimpleNamespace(choices=[mock_choice])
        service = GroqService(client=mock_client)
        with pytest.raises(GroqServiceError):
            service.call_groq("test prompt", self._get_system_prompt())

    def test_wraps_sdk_exception_in_groq_service_error(self):
        from app.services.groq_service import GroqService, GroqServiceError
        mock_client = MagicMock()
        mock_client.chat.completions.create.side_effect = RuntimeError("network error")
        service = GroqService(client=mock_client)
        with pytest.raises(GroqServiceError) as exc_info:
            service.call_groq("test prompt", self._get_system_prompt())
        assert "network error" in exc_info.value.message

    def test_passes_system_and_user_messages(self):
        from app.services.groq_service import GroqService
        mock_client = _make_mock_groq_client("response")
        service = GroqService(client=mock_client)
        service.call_groq("my user prompt", self._get_system_prompt())
        call_kwargs = mock_client.chat.completions.create.call_args
        messages = call_kwargs[1]["messages"] if call_kwargs[1] else call_kwargs[0][1]
        roles = [m["role"] for m in messages]
        assert "system" in roles
        assert "user" in roles


# ---------------------------------------------------------------------------
# GroqService.analyze tests
# ---------------------------------------------------------------------------

class TestGroqServiceAnalyze:
    """Tests for GroqService.analyze() — the main public method."""

    def _make_request(self, **kwargs):
        from app.schemas import AnalyzeRequest, AnalysisType, TimeMachineInput, FinancialPosition
        return AnalyzeRequest(
            analysis_type=AnalysisType.TIME_MACHINE,
            time_machine=TimeMachineInput(
                financial_position=FinancialPosition(
                    monthly_income=80000.0,
                    monthly_surplus=30000.0,
                    current_savings=200000.0,
                )
            ),
            **kwargs,
        )

    def test_returns_analyze_response_on_valid_output(self):
        from app.services.groq_service import GroqService
        mock_client = _make_mock_groq_client(_VALID_GROQ_JSON)
        service = GroqService(client=mock_client)
        response = service.analyze(self._make_request())
        assert response.summary
        assert response.analysis_type == "time_machine"
        assert isinstance(response.observations, list)
        assert isinstance(response.evidence, list)
        assert isinstance(response.implications, list)
        assert isinstance(response.risks, list)
        assert isinstance(response.possible_actions, list)

    def test_analysis_type_always_echoed_in_response(self):
        """analysis_type in the response must always match the request, even if the
        model returns a different value."""
        from app.schemas import AnalyzeRequest, AnalysisType, GoalAnalysisInput, FinancialGoal
        from app.services.groq_service import GroqService
        # Model returns wrong analysis_type — service should override it
        wrong_type_json = _make_valid_response("time_machine")
        mock_client = _make_mock_groq_client(wrong_type_json)
        service = GroqService(client=mock_client)
        request = AnalyzeRequest(
            analysis_type=AnalysisType.GOAL_ANALYSIS,
            goal_analysis=GoalAnalysisInput(
                goals=[FinancialGoal(title="Emergency Fund", target_amount=500000.0)]
            ),
        )
        response = service.analyze(request)
        assert response.analysis_type == "goal_analysis"

    def test_raises_on_malformed_json_response(self):
        from app.schemas import AnalyzeRequest, AnalysisType
        from app.services.groq_service import GroqService, GroqServiceError
        mock_client = _make_mock_groq_client("this is not json at all")
        service = GroqService(client=mock_client)
        request = AnalyzeRequest(analysis_type=AnalysisType.TIME_MACHINE)
        with pytest.raises(GroqServiceError) as exc_info:
            service.analyze(request)
        assert exc_info.value.status_code == 502

    def test_raises_on_json_missing_required_summary(self):
        from app.schemas import AnalyzeRequest, AnalysisType
        from app.services.groq_service import GroqService, GroqServiceError
        bad_json = json.dumps({"observations": [], "risks": [], "analysis_type": "time_machine"})
        mock_client = _make_mock_groq_client(bad_json)
        service = GroqService(client=mock_client)
        with pytest.raises(GroqServiceError):
            service.analyze(AnalyzeRequest(analysis_type=AnalysisType.TIME_MACHINE))

    def test_analyze_with_markdown_fenced_response(self):
        from app.schemas import AnalyzeRequest, AnalysisType
        from app.services.groq_service import GroqService
        fenced = f"```json\n{_VALID_GROQ_JSON}\n```"
        mock_client = _make_mock_groq_client(fenced)
        service = GroqService(client=mock_client)
        response = service.analyze(AnalyzeRequest(analysis_type=AnalysisType.TIME_MACHINE))
        assert response.summary

    def test_model_resolution_falls_back_to_env(self, monkeypatch):
        from app.services.groq_service import GroqService
        monkeypatch.setenv("GROQ_MODEL", "some-other-model")
        service = GroqService()
        assert service._get_model() == "some-other-model"

    def test_model_resolution_uses_constructor_arg(self):
        from app.services.groq_service import GroqService
        service = GroqService(model="my-model")
        assert service._get_model() == "my-model"


# ---------------------------------------------------------------------------
# Prompt system tests
# ---------------------------------------------------------------------------

class TestPromptSystem:
    """Tests verifying the per-mode prompt dispatch."""

    def test_all_modes_have_distinct_system_prompts(self):
        from app.prompts import get_system_prompt
        from app.schemas import AnalysisType
        prompts = {mode: get_system_prompt(mode) for mode in AnalysisType}
        # All prompts must share the base identity text
        for prompt in prompts.values():
            assert "MoneyLens Financial Intelligence" in prompt
        # Each mode must have at least one unique keyword
        assert "Time Machine" in prompts[AnalysisType.TIME_MACHINE]
        assert "Goal Analysis" in prompts[AnalysisType.GOAL_ANALYSIS]
        assert "Reverse Analysis" in prompts[AnalysisType.REVERSE_ANALYSIS]
        assert "Experiment Analysis" in prompts[AnalysisType.EXPERIMENT_ANALYSIS]
        assert "Radar Analysis" in prompts[AnalysisType.RADAR_ANALYSIS]

    def test_base_hard_constraints_present_in_all_modes(self):
        from app.prompts import get_system_prompt
        from app.schemas import AnalysisType
        must_contain = ["Do NOT invent financial numbers", "Do NOT perform calculations"]
        for mode in AnalysisType:
            prompt = get_system_prompt(mode)
            for phrase in must_contain:
                assert phrase in prompt, f"Missing '{phrase}' in {mode} prompt"

    def test_output_format_injected_in_all_modes(self):
        from app.prompts import get_system_prompt
        from app.schemas import AnalysisType
        for mode in AnalysisType:
            prompt = get_system_prompt(mode)
            assert '"analysis_type"' in prompt
            assert '"evidence"' in prompt
            assert '"implications"' in prompt

    def test_build_user_prompt_contains_mode_label(self):
        from app.prompts import build_user_prompt
        from app.schemas import AnalysisType
        result = build_user_prompt(AnalysisType.GOAL_ANALYSIS, '{"test": true}')
        assert "Goal Analysis" in result

    def test_build_user_prompt_contains_analysis_type_instruction(self):
        from app.prompts import build_user_prompt
        from app.schemas import AnalysisType
        result = build_user_prompt(AnalysisType.RADAR_ANALYSIS, '{}')
        assert "radar_analysis" in result

    def test_build_user_prompt_contains_payload(self):
        from app.prompts import build_user_prompt
        from app.schemas import AnalysisType
        payload = '{"monthly_income": 80000}'
        result = build_user_prompt(AnalysisType.TIME_MACHINE, payload)
        assert payload in result


# ---------------------------------------------------------------------------
# FastAPI endpoint tests — infrastructure
# ---------------------------------------------------------------------------

@pytest.fixture()
def client_with_mock_groq():
    """TestClient whose _groq_service uses a mock returning valid JSON."""
    from app.main import app
    from app.services.groq_service import GroqService
    mock_client = _make_mock_groq_client(_VALID_GROQ_JSON)
    mock_service = GroqService(client=mock_client)
    with patch("app.main._groq_service", mock_service):
        with TestClient(app) as tc:
            yield tc


class TestHealthEndpoint:
    def test_health_returns_200(self, client_with_mock_groq):
        assert client_with_mock_groq.get("/health").status_code == 200

    def test_health_response_schema(self, client_with_mock_groq):
        data = client_with_mock_groq.get("/health").json()
        assert data["status"] == "healthy"
        assert "service" in data
        assert "version" in data
        assert "provider" in data
        assert "model" in data

    def test_health_provider_is_groq(self, client_with_mock_groq):
        assert client_with_mock_groq.get("/health").json()["provider"] == "groq"


# ---------------------------------------------------------------------------
# FastAPI endpoint tests — /analyze core behaviour
# ---------------------------------------------------------------------------

class TestAnalyzeEndpointCore:
    """Core /analyze tests that apply across all modes."""

    def test_analyze_returns_200_with_valid_payload(self, client_with_mock_groq):
        assert client_with_mock_groq.post("/analyze", json=_TIME_MACHINE_PAYLOAD).status_code == 200

    def test_analyze_response_has_all_required_fields(self, client_with_mock_groq):
        data = client_with_mock_groq.post("/analyze", json=_TIME_MACHINE_PAYLOAD).json()
        for field in ("analysis_type", "summary", "observations", "evidence",
                      "implications", "risks", "possible_actions"):
            assert field in data, f"Missing field: {field}"

    def test_analyze_all_list_fields_are_lists(self, client_with_mock_groq):
        data = client_with_mock_groq.post("/analyze", json=_TIME_MACHINE_PAYLOAD).json()
        for field in ("observations", "evidence", "implications", "risks", "possible_actions"):
            assert isinstance(data[field], list), f"{field} is not a list"

    def test_invalid_analysis_type_returns_422(self, client_with_mock_groq):
        payload = {"analysis_type": "not_a_valid_mode"}
        response = client_with_mock_groq.post("/analyze", json=payload)
        assert response.status_code == 422

    def test_missing_analysis_type_returns_422(self, client_with_mock_groq):
        response = client_with_mock_groq.post("/analyze", json={})
        assert response.status_code == 422

    def test_analyze_returns_502_on_groq_api_error(self):
        from app.main import app
        from app.services.groq_service import GroqService
        failing_client = MagicMock()
        failing_client.chat.completions.create.side_effect = RuntimeError("API down")
        failing_service = GroqService(client=failing_client)
        with patch("app.main._groq_service", failing_service):
            with TestClient(app) as tc:
                response = tc.post("/analyze", json=_TIME_MACHINE_PAYLOAD)
        assert response.status_code == 502

    def test_analyze_returns_502_on_malformed_model_json(self):
        from app.main import app
        from app.services.groq_service import GroqService
        bad_service = GroqService(client=_make_mock_groq_client("not json at all"))
        with patch("app.main._groq_service", bad_service):
            with TestClient(app) as tc:
                response = tc.post("/analyze", json=_TIME_MACHINE_PAYLOAD)
        assert response.status_code == 502

    def test_groq_client_called_with_system_and_user_messages(self):
        from app.main import app
        from app.services.groq_service import GroqService
        mock_client = _make_mock_groq_client(_VALID_GROQ_JSON)
        service = GroqService(client=mock_client)
        with patch("app.main._groq_service", service):
            with TestClient(app) as tc:
                tc.post("/analyze", json=_TIME_MACHINE_PAYLOAD)
        call_kwargs = mock_client.chat.completions.create.call_args
        messages = call_kwargs[1]["messages"] if call_kwargs[1] else call_kwargs[0][1]
        roles = {m["role"] for m in messages}
        assert "system" in roles
        assert "user" in roles


# ---------------------------------------------------------------------------
# FastAPI endpoint tests — five MoneyLens AI modes
# ---------------------------------------------------------------------------

class TestTimeMachineMode:
    def test_time_machine_returns_200(self, client_with_mock_groq):
        resp = client_with_mock_groq.post("/analyze", json=_TIME_MACHINE_PAYLOAD)
        assert resp.status_code == 200

    def test_time_machine_analysis_type_in_response(self, client_with_mock_groq):
        data = client_with_mock_groq.post("/analyze", json=_TIME_MACHINE_PAYLOAD).json()
        assert data["analysis_type"] == "time_machine"

    def test_time_machine_sends_mode_specific_system_prompt(self):
        from app.main import app
        from app.services.groq_service import GroqService
        mock_client = _make_mock_groq_client(_VALID_GROQ_JSON)
        service = GroqService(client=mock_client)
        with patch("app.main._groq_service", service):
            with TestClient(app) as tc:
                tc.post("/analyze", json=_TIME_MACHINE_PAYLOAD)
        call_kwargs = mock_client.chat.completions.create.call_args
        messages = call_kwargs[1]["messages"] if call_kwargs[1] else call_kwargs[0][1]
        system_msg = next(m["content"] for m in messages if m["role"] == "system")
        assert "Time Machine" in system_msg

    def test_time_machine_accepts_simulation_result(self, client_with_mock_groq):
        assert client_with_mock_groq.post("/analyze", json=_TIME_MACHINE_PAYLOAD).status_code == 200

    def test_time_machine_without_typed_input_still_accepted(self, client_with_mock_groq):
        """analysis_type alone is sufficient; typed input is optional."""
        payload = {"analysis_type": "time_machine"}
        assert client_with_mock_groq.post("/analyze", json=payload).status_code == 200


class TestGoalAnalysisMode:
    def test_goal_analysis_returns_200(self, client_with_mock_groq):
        mock_response = _make_valid_response("goal_analysis")
        from app.main import app
        from app.services.groq_service import GroqService
        service = GroqService(client=_make_mock_groq_client(mock_response))
        with patch("app.main._groq_service", service):
            with TestClient(app) as tc:
                resp = tc.post("/analyze", json=_GOAL_ANALYSIS_PAYLOAD)
        assert resp.status_code == 200

    def test_goal_analysis_sends_mode_specific_prompt(self):
        from app.main import app
        from app.services.groq_service import GroqService
        mock_client = _make_mock_groq_client(_make_valid_response("goal_analysis"))
        service = GroqService(client=mock_client)
        with patch("app.main._groq_service", service):
            with TestClient(app) as tc:
                tc.post("/analyze", json=_GOAL_ANALYSIS_PAYLOAD)
        call_kwargs = mock_client.chat.completions.create.call_args
        messages = call_kwargs[1]["messages"] if call_kwargs[1] else call_kwargs[0][1]
        system_msg = next(m["content"] for m in messages if m["role"] == "system")
        assert "Goal Analysis" in system_msg

    def test_goal_analysis_requires_at_least_one_goal(self, client_with_mock_groq):
        """goals list must have at least 1 item."""
        payload = {
            "analysis_type": "goal_analysis",
            "goal_analysis": {"goals": []},
        }
        # Pydantic min_length=1 → 422
        assert client_with_mock_groq.post("/analyze", json=payload).status_code == 422


class TestReverseAnalysisMode:
    def test_reverse_analysis_returns_200(self):
        from app.main import app
        from app.services.groq_service import GroqService
        service = GroqService(client=_make_mock_groq_client(_make_valid_response("reverse_analysis")))
        with patch("app.main._groq_service", service):
            with TestClient(app) as tc:
                resp = tc.post("/analyze", json=_REVERSE_ANALYSIS_PAYLOAD)
        assert resp.status_code == 200

    def test_reverse_analysis_sends_mode_specific_prompt(self):
        from app.main import app
        from app.services.groq_service import GroqService
        mock_client = _make_mock_groq_client(_make_valid_response("reverse_analysis"))
        service = GroqService(client=mock_client)
        with patch("app.main._groq_service", service):
            with TestClient(app) as tc:
                tc.post("/analyze", json=_REVERSE_ANALYSIS_PAYLOAD)
        call_kwargs = mock_client.chat.completions.create.call_args
        messages = call_kwargs[1]["messages"] if call_kwargs[1] else call_kwargs[0][1]
        system_msg = next(m["content"] for m in messages if m["role"] == "system")
        assert "Reverse Analysis" in system_msg

    def test_reverse_analysis_requires_reverse_goal_field(self, client_with_mock_groq):
        """reverse_goal is required inside ReverseAnalysisInput."""
        payload = {
            "analysis_type": "reverse_analysis",
            "reverse_analysis": {},  # missing required reverse_goal
        }
        assert client_with_mock_groq.post("/analyze", json=payload).status_code == 422


class TestExperimentAnalysisMode:
    def test_experiment_analysis_returns_200(self):
        from app.main import app
        from app.services.groq_service import GroqService
        service = GroqService(client=_make_mock_groq_client(_make_valid_response("experiment_analysis")))
        with patch("app.main._groq_service", service):
            with TestClient(app) as tc:
                resp = tc.post("/analyze", json=_EXPERIMENT_ANALYSIS_PAYLOAD)
        assert resp.status_code == 200

    def test_experiment_analysis_sends_mode_specific_prompt(self):
        from app.main import app
        from app.services.groq_service import GroqService
        mock_client = _make_mock_groq_client(_make_valid_response("experiment_analysis"))
        service = GroqService(client=mock_client)
        with patch("app.main._groq_service", service):
            with TestClient(app) as tc:
                tc.post("/analyze", json=_EXPERIMENT_ANALYSIS_PAYLOAD)
        call_kwargs = mock_client.chat.completions.create.call_args
        messages = call_kwargs[1]["messages"] if call_kwargs[1] else call_kwargs[0][1]
        system_msg = next(m["content"] for m in messages if m["role"] == "system")
        assert "Experiment Analysis" in system_msg

    def test_experiment_analysis_requires_min_two_scenarios(self, client_with_mock_groq):
        """scenarios must have at least 2 items."""
        payload = {
            "analysis_type": "experiment_analysis",
            "experiment_analysis": {
                "scenarios": [
                    {"scenario_id": "a", "scenario_name": "Only One"}
                ]
            },
        }
        assert client_with_mock_groq.post("/analyze", json=payload).status_code == 422

    def test_experiment_analysis_response_contains_summary(self):
        from app.main import app
        from app.services.groq_service import GroqService
        service = GroqService(client=_make_mock_groq_client(_make_valid_response("experiment_analysis")))
        with patch("app.main._groq_service", service):
            with TestClient(app) as tc:
                data = tc.post("/analyze", json=_EXPERIMENT_ANALYSIS_PAYLOAD).json()
        assert data["summary"]


class TestRadarAnalysisMode:
    def test_radar_analysis_returns_200(self):
        from app.main import app
        from app.services.groq_service import GroqService
        service = GroqService(client=_make_mock_groq_client(_make_valid_response("radar_analysis")))
        with patch("app.main._groq_service", service):
            with TestClient(app) as tc:
                resp = tc.post("/analyze", json=_RADAR_ANALYSIS_PAYLOAD)
        assert resp.status_code == 200

    def test_radar_analysis_sends_mode_specific_prompt(self):
        from app.main import app
        from app.services.groq_service import GroqService
        mock_client = _make_mock_groq_client(_make_valid_response("radar_analysis"))
        service = GroqService(client=mock_client)
        with patch("app.main._groq_service", service):
            with TestClient(app) as tc:
                tc.post("/analyze", json=_RADAR_ANALYSIS_PAYLOAD)
        call_kwargs = mock_client.chat.completions.create.call_args
        messages = call_kwargs[1]["messages"] if call_kwargs[1] else call_kwargs[0][1]
        system_msg = next(m["content"] for m in messages if m["role"] == "system")
        assert "Radar Analysis" in system_msg

    def test_radar_analysis_requires_at_least_one_alert(self, client_with_mock_groq):
        """radar_alerts must have at least 1 item."""
        payload = {
            "analysis_type": "radar_analysis",
            "radar_analysis": {"radar_alerts": []},
        }
        assert client_with_mock_groq.post("/analyze", json=payload).status_code == 422

    def test_radar_analysis_response_has_risks(self):
        from app.main import app
        from app.services.groq_service import GroqService
        service = GroqService(client=_make_mock_groq_client(_make_valid_response("radar_analysis")))
        with patch("app.main._groq_service", service):
            with TestClient(app) as tc:
                data = tc.post("/analyze", json=_RADAR_ANALYSIS_PAYLOAD).json()
        assert isinstance(data["risks"], list)


# ---------------------------------------------------------------------------
# Schema-level validation tests
# ---------------------------------------------------------------------------

class TestSchemaValidation:
    """Verify AnalysisType enum enforcement and typed input contracts."""

    def test_all_five_valid_analysis_types_accepted(self, client_with_mock_groq):
        valid_types = [
            "time_machine", "goal_analysis", "reverse_analysis",
            "experiment_analysis", "radar_analysis",
        ]
        for t in valid_types:
            payload = {"analysis_type": t}
            resp = client_with_mock_groq.post("/analyze", json=payload)
            assert resp.status_code == 200, f"Expected 200 for analysis_type={t}, got {resp.status_code}"

    def test_invalid_analysis_type_rejected_with_422(self, client_with_mock_groq):
        for bad in ["chat", "general", "advice", "calculate", "", "TIME_MACHINE"]:
            payload = {"analysis_type": bad}
            resp = client_with_mock_groq.post("/analyze", json=payload)
            assert resp.status_code == 422, f"Expected 422 for '{bad}', got {resp.status_code}"

    def test_context_note_max_length_enforced(self, client_with_mock_groq):
        payload = {
            "analysis_type": "time_machine",
            "context_note": "x" * 301,  # exceeds 300-char limit
        }
        assert client_with_mock_groq.post("/analyze", json=payload).status_code == 422

    def test_context_note_within_limit_accepted(self, client_with_mock_groq):
        payload = {
            "analysis_type": "time_machine",
            "context_note": "x" * 300,
        }
        assert client_with_mock_groq.post("/analyze", json=payload).status_code == 200

    def test_analysis_type_echoed_in_response(self, client_with_mock_groq):
        data = client_with_mock_groq.post("/analyze", json=_TIME_MACHINE_PAYLOAD).json()
        assert data["analysis_type"] == "time_machine"
