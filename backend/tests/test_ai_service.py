"""
Unit and Integration Tests for Amazon Bedrock AI Interpretation Layer.
Uses mocks to verify BedrockService and POST /api/v1/ai/analyze endpoint without making real AWS calls.
"""

import json
import pytest
from unittest.mock import MagicMock, patch
from botocore.exceptions import ClientError, BotoCoreError
from fastapi.testclient import TestClient

from app.main import app
from app.services.bedrock_service import BedrockService, BedrockServiceError
from app.schemas.ai import AIAnalyzeRequest, AIAnalyzeResponse

client = TestClient(app)


# ------------------ BedrockService Unit Tests ------------------

def test_bedrock_service_successful_response():
    """Verify BedrockService correctly parses a standard JSON Converse API response."""
    mock_boto_client = MagicMock()
    mock_boto_client.converse.return_value = {
        "output": {
            "message": {
                "role": "assistant",
                "content": [
                    {
                        "text": json.dumps({
                            "intent": "purchase_simulation",
                            "item": "phone",
                            "amount": 70000.0,
                            "time_period": "next_month",
                            "payment_method": None,
                            "goal": None
                        })
                    }
                ]
            }
        },
        "stopReason": "end_turn"
    }

    service = BedrockService(client=mock_boto_client)
    result = service.analyze_financial_query("Can I buy a ₹70,000 phone next month?")

    assert isinstance(result, AIAnalyzeResponse)
    assert result.intent == "purchase_simulation"
    assert result.item == "phone"
    assert result.amount == 70000.0
    assert result.time_period == "next_month"
    assert result.payment_method is None
    assert result.goal is None


def test_bedrock_service_markdown_wrapped_response():
    """Verify BedrockService handles responses wrapped in markdown code blocks."""
    mock_boto_client = MagicMock()
    markdown_json = """```json
{
  "intent": "emi_simulation",
  "item": "car",
  "amount": 500000.0,
  "time_period": "3 years",
  "payment_method": "emi",
  "goal": null
}
```"""
    mock_boto_client.converse.return_value = {
        "output": {
            "message": {
                "role": "assistant",
                "content": [{"text": markdown_json}]
            }
        }
    }

    service = BedrockService(client=mock_boto_client)
    result = service.analyze_financial_query("What if I buy a 5 lakh car on 3-year EMI?")

    assert result.intent == "emi_simulation"
    assert result.item == "car"
    assert result.amount == 500000.0
    assert result.time_period == "3 years"
    assert result.payment_method == "emi"


def test_bedrock_service_malformed_json_response():
    """Verify BedrockService raises BedrockServiceError when model returns invalid JSON."""
    mock_boto_client = MagicMock()
    mock_boto_client.converse.return_value = {
        "output": {
            "message": {
                "role": "assistant",
                "content": [{"text": "Sure, I can help you with that financial inquiry!"}]
            }
        }
    }

    service = BedrockService(client=mock_boto_client)
    with pytest.raises(BedrockServiceError) as exc_info:
        service.analyze_financial_query("Can I buy a phone?")

    assert exc_info.value.status_code == 502
    assert "malformed or invalid JSON" in exc_info.value.message


def test_bedrock_service_aws_client_error():
    """Verify BedrockService cleanly handles AWS ClientError."""
    mock_boto_client = MagicMock()
    mock_boto_client.converse.side_effect = ClientError(
        error_response={"Error": {"Code": "AccessDeniedException", "Message": "Access denied"}},
        operation_name="Converse"
    )

    service = BedrockService(client=mock_boto_client)
    with pytest.raises(BedrockServiceError) as exc_info:
        service.analyze_financial_query("Can I buy a laptop?")

    assert exc_info.value.status_code == 502
    assert "AWS Bedrock error" in exc_info.value.message


def test_bedrock_service_botocore_network_error():
    """Verify BedrockService cleanly handles BotoCore network / connection errors."""
    mock_boto_client = MagicMock()
    mock_boto_client.converse.side_effect = BotoCoreError()

    service = BedrockService(client=mock_boto_client)
    with pytest.raises(BedrockServiceError) as exc_info:
        service.analyze_financial_query("Can I buy a laptop?")

    assert exc_info.value.status_code == 502


def test_bedrock_service_empty_output_structure():
    """Verify BedrockService handles missing content structure gracefully."""
    mock_boto_client = MagicMock()
    mock_boto_client.converse.return_value = {"output": {"message": {"content": []}}}

    service = BedrockService(client=mock_boto_client)
    with pytest.raises(BedrockServiceError) as exc_info:
        service.analyze_financial_query("Test query")

    assert exc_info.value.status_code == 502


# ------------------ API Endpoint Integration Tests ------------------

def test_api_ai_analyze_success():
    """Test POST /api/v1/ai/analyze returns 200 with structured intent."""
    mock_response = AIAnalyzeResponse(
        intent="purchase_simulation",
        item="phone",
        amount=70000.0,
        time_period="next_month",
        payment_method=None,
        goal=None
    )

    with patch("app.routes.ai.bedrock_service.analyze_financial_query", return_value=mock_response):
        response = client.post(
            "/api/v1/ai/analyze",
            json={"message": "Can I buy a ₹70,000 phone next month?"}
        )
        assert response.status_code == 200
        data = response.json()
        assert data["intent"] == "purchase_simulation"
        assert data["item"] == "phone"
        assert data["amount"] == 70000.0
        assert data["time_period"] == "next_month"
        assert data["payment_method"] is None
        assert data["goal"] is None


def test_api_ai_analyze_bedrock_error():
    """Test POST /api/v1/ai/analyze handles BedrockServiceError and returns appropriate HTTP status."""
    with patch(
        "app.routes.ai.bedrock_service.analyze_financial_query",
        side_effect=BedrockServiceError("Bedrock model returned a malformed or invalid JSON response.", status_code=502)
    ):
        response = client.post(
            "/api/v1/ai/analyze",
            json={"message": "Malformed inquiry test"}
        )
        assert response.status_code == 502
        data = response.json()
        assert "malformed" in data["detail"].lower()


def test_api_ai_analyze_validation_empty_message():
    """Test POST /api/v1/ai/analyze validates non-empty message field."""
    response = client.post(
        "/api/v1/ai/analyze",
        json={"message": ""}
    )
    assert response.status_code == 422


def test_api_ai_analyze_validation_missing_message():
    """Test POST /api/v1/ai/analyze validates presence of message field."""
    response = client.post(
        "/api/v1/ai/analyze",
        json={}
    )
    assert response.status_code == 422
