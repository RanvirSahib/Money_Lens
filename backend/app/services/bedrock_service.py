"""
Amazon Bedrock Integration Service for Money Lens.
Provides natural language interpretation using Amazon Bedrock Runtime Converse API.
Uses model: amazon.nova-micro-v1:0 in region: us-east-1.
Extracts structured financial intent without performing deterministic calculations.
"""

import json
import logging
import re
from typing import Optional, Dict, Any
import boto3
from botocore.exceptions import BotoCoreError, ClientError
from pydantic import ValidationError

from app.core.config import settings
from app.schemas.ai import AIAnalyzeResponse

logger = logging.getLogger(__name__)

SYSTEM_PROMPT = """You are the AI interpretation layer of Money Lens, an AI-powered financial future simulator.

Your job is to understand natural-language financial requests and convert them into structured intent.

You are NOT the financial calculator.

Never invent financial calculations.
Never claim certainty about a user's financial future.
The backend financial engine performs calculations.

For a request such as:
'Can I buy a ₹70,000 phone next month?'

extract:
- intent
- item
- amount
- time_period
- payment_method
- goal if mentioned

Return ONLY valid JSON matching this schema:
{
  "intent": "purchase_simulation" | "emi_simulation" | "savings_projection" | "goal_tracking" | "expense_analysis" | "general_query",
  "item": string | null,
  "amount": number | null,
  "time_period": string | null,
  "payment_method": string | null,
  "goal": string | null
}
Do not wrap your response in markdown fences. Return only the valid JSON string."""


class BedrockServiceError(Exception):
    """Custom exception for Bedrock service failures."""
    def __init__(self, message: str, status_code: int = 502, details: Optional[str] = None):
        super().__init__(message)
        self.message = message
        self.status_code = status_code
        self.details = details


class BedrockService:
    """Service wrapper for AWS Bedrock Runtime Converse API."""

    def __init__(
        self,
        region_name: Optional[str] = None,
        model_id: Optional[str] = None,
        client: Optional[Any] = None
    ):
        self.region_name = region_name or settings.AWS_REGION
        self.model_id = model_id or settings.BEDROCK_MODEL_ID
        self._client = client

    @property
    def client(self):
        """Lazy initialization of boto3 bedrock-runtime client."""
        if self._client is None:
            client_kwargs: Dict[str, Any] = {
                "service_name": "bedrock-runtime",
                "region_name": self.region_name,
            }
            # Only provide explicit credentials if present in settings/env
            if settings.AWS_ACCESS_KEY_ID and settings.AWS_SECRET_ACCESS_KEY:
                client_kwargs["aws_access_key_id"] = settings.AWS_ACCESS_KEY_ID
                client_kwargs["aws_secret_access_key"] = settings.AWS_SECRET_ACCESS_KEY
                if settings.AWS_SESSION_TOKEN:
                    client_kwargs["aws_session_token"] = settings.AWS_SESSION_TOKEN

            self._client = boto3.client(**client_kwargs)
        return self._client

    def _clean_and_extract_json(self, raw_text: str) -> str:
        """Extract and clean JSON payload from raw model response."""
        text = raw_text.strip()
        # Strip markdown code blocks if present (```json ... ``` or ``` ... ```)
        if text.startswith("```"):
            text = re.sub(r"^```(?:json)?\s*", "", text, flags=re.IGNORECASE)
            text = re.sub(r"\s*```$", "", text)
            text = text.strip()

        # If there's surrounding text, locate outer braces
        start = text.find("{")
        end = text.rfind("}")
        if start != -1 and end != -1 and end > start:
            return text[start : end + 1]

        return text

    def call_converse_api(self, message: str) -> str:
        """
        Calls Amazon Bedrock Converse API with amazon.nova-micro-v1:0.
        Returns the raw text content produced by the model.
        """
        try:
            response = self.client.converse(
                modelId=self.model_id,
                messages=[
                    {
                        "role": "user",
                        "content": [{"text": message}]
                    }
                ],
                system=[
                    {"text": SYSTEM_PROMPT}
                ],
                inferenceConfig={
                    "temperature": 0.1,
                    "maxTokens": 500,
                }
            )
            
            output_message = response.get("output", {}).get("message", {})
            content_list = output_message.get("content", [])
            if not content_list or "text" not in content_list[0]:
                raise BedrockServiceError(
                    message="Bedrock Converse API returned an unexpected response structure.",
                    status_code=502
                )
            
            return content_list[0]["text"]

        except (ClientError, BotoCoreError) as aws_err:
            logger.error("AWS Bedrock Converse API error: %s", str(aws_err))
            raise BedrockServiceError(
                message=f"AWS Bedrock error: {str(aws_err)}",
                status_code=502,
                details=str(aws_err)
            ) from aws_err
        except BedrockServiceError:
            raise
        except Exception as e:
            logger.error("Unexpected error invoking Bedrock Converse API: %s", str(e))
            raise BedrockServiceError(
                message=f"Failed to communicate with Bedrock: {str(e)}",
                status_code=500,
                details=str(e)
            ) from e

    def analyze_financial_query(self, message: str) -> AIAnalyzeResponse:
        """
        Accepts a user's natural language financial question, calls Bedrock Converse API,
        parses the structured JSON response, and validates it against AIAnalyzeResponse schema.
        """
        raw_text = self.call_converse_api(message)
        json_str = self._clean_and_extract_json(raw_text)

        try:
            parsed_data = json.loads(json_str)
            if not isinstance(parsed_data, dict):
                raise ValueError("Model output did not parse into a JSON object dictionary")
            
            return AIAnalyzeResponse.model_validate(parsed_data)
        except (json.JSONDecodeError, ValueError, ValidationError) as parse_err:
            logger.error("Failed to parse Bedrock response as AIAnalyzeResponse: %s. Raw text: %s", str(parse_err), raw_text)
            raise BedrockServiceError(
                message="Bedrock model returned a malformed or invalid JSON response.",
                status_code=502,
                details=f"Parse error: {str(parse_err)} | Raw model output: {raw_text}"
            ) from parse_err


# Singleton instance
bedrock_service = BedrockService()
