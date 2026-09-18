"""
MoneyLens AI Service — Groq Integration Service.

Wraps the Groq Python SDK. The core abstractions are preserved from v1:
- Lazy client initialisation (test injection via constructor arg).
- _extract_json static helper for stripping markdown fences.
- GroqServiceError with status_code for clean route-layer handling.

Changes from v1
---------------
- call_groq() accepts an explicit system_prompt string instead of importing a
  global constant — enabling per-mode system prompts.
- analyze() dispatches to get_system_prompt() and build_user_prompt() from
  app.prompts, passing the analysis_type for mode-aware behaviour.
- AnalyzeResponse now includes analysis_type, evidence, and implications fields.
"""

import json
import logging
import re
from typing import Any, Optional

from groq import Groq
from pydantic import ValidationError

from app.prompts import get_system_prompt, build_user_prompt
from app.schemas import AnalyzeRequest, AnalyzeResponse

logger = logging.getLogger(__name__)


# ---------------------------------------------------------------------------
# Custom Exception
# ---------------------------------------------------------------------------

class GroqServiceError(Exception):
    """Raised when the Groq API call or response parsing fails."""

    def __init__(
        self,
        message: str,
        status_code: int = 502,
        details: Optional[str] = None,
    ) -> None:
        super().__init__(message)
        self.message = message
        self.status_code = status_code
        self.details = details


# ---------------------------------------------------------------------------
# Service Class
# ---------------------------------------------------------------------------

class GroqService:
    """
    Service wrapper around the Groq Python SDK.

    Parameters
    ----------
    api_key : str, optional
        Groq API key. When omitted the SDK reads GROQ_API_KEY from env.
    model : str, optional
        Model identifier. Defaults to GROQ_MODEL env var, then hard default.
    client : Any, optional
        Pre-constructed client — used in tests to inject a mock.
    """

    def __init__(
        self,
        api_key: Optional[str] = None,
        model: Optional[str] = None,
        client: Optional[Any] = None,
    ) -> None:
        self._api_key = api_key
        self._model = model
        self._client = client

    # ------------------------------------------------------------------
    # Internal helpers
    # ------------------------------------------------------------------

    def _get_model(self) -> str:
        """Resolve model name: constructor arg → GROQ_MODEL env var → hard default."""
        if self._model:
            return self._model
        import os
        return os.getenv("GROQ_MODEL", "openai/gpt-oss-120b")

    @property
    def client(self) -> Groq:
        """Lazy Groq client — reads GROQ_API_KEY from env on first access."""
        if self._client is None:
            kwargs: dict[str, Any] = {}
            if self._api_key:
                kwargs["api_key"] = self._api_key
            self._client = Groq(**kwargs)
        return self._client

    @staticmethod
    def _extract_json(raw: str) -> str:
        """
        Strip markdown code fences and leading/trailing prose from raw model
        output, returning a clean JSON string ready for json.loads().
        """
        text = raw.strip()
        if text.startswith("```"):
            text = re.sub(r"^```(?:json)?\s*", "", text, flags=re.IGNORECASE)
            text = re.sub(r"\s*```$", "", text)
            text = text.strip()
        start = text.find("{")
        end = text.rfind("}")
        if start != -1 and end != -1 and end > start:
            return text[start : end + 1]
        return text

    # ------------------------------------------------------------------
    # Public API
    # ------------------------------------------------------------------

    def call_groq(self, user_prompt: str, system_prompt: str) -> str:
        """
        Send a chat-completion request to Groq and return the raw text response.

        Parameters
        ----------
        user_prompt : str
            The fully-constructed user turn content.
        system_prompt : str
            The mode-specific system prompt (from app.prompts.get_system_prompt).

        Returns
        -------
        str
            Raw model output text.

        Raises
        ------
        GroqServiceError
            On any Groq API error or unexpected response structure.
        """
        try:
            response = self.client.chat.completions.create(
                model=self._get_model(),
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user",   "content": user_prompt},
                ],
                temperature=0.2,
                max_tokens=1200,
            )
            choices = response.choices
            if not choices or not choices[0].message or not choices[0].message.content:
                raise GroqServiceError(
                    message="Groq API returned an empty or unexpected response.",
                    status_code=502,
                )
            return choices[0].message.content

        except GroqServiceError:
            raise
        except Exception as exc:
            logger.error("Groq API call failed: %s", str(exc))
            raise GroqServiceError(
                message=f"Groq API error: {str(exc)}",
                status_code=502,
                details=str(exc),
            ) from exc

    def analyze(self, request: AnalyzeRequest) -> AnalyzeResponse:
        """
        Accept a structured AnalyzeRequest, call Groq with the mode-specific
        prompt, and return a validated AnalyzeResponse.

        Parameters
        ----------
        request : AnalyzeRequest
            Structured financial data from the MoneyLens financial engine,
            including the analysis_type discriminator.

        Returns
        -------
        AnalyzeResponse
            Validated structured AI insight response.

        Raises
        ------
        GroqServiceError
            On API failure or malformed model response.
        """
        system_prompt = get_system_prompt(request.analysis_type)
        payload_json  = request.model_dump_json(exclude_none=True, indent=2)
        user_prompt   = build_user_prompt(request.analysis_type, payload_json)

        raw_text = self.call_groq(user_prompt, system_prompt)
        json_str = self._extract_json(raw_text)

        try:
            parsed = json.loads(json_str)
            if not isinstance(parsed, dict):
                raise ValueError("Model output is not a JSON object.")

            # Ensure analysis_type is echoed correctly regardless of model output
            parsed["analysis_type"] = request.analysis_type.value

            return AnalyzeResponse.model_validate(parsed)

        except (json.JSONDecodeError, ValueError, ValidationError) as parse_err:
            logger.error(
                "Failed to parse Groq response: %s | raw: %s",
                str(parse_err),
                raw_text,
            )
            raise GroqServiceError(
                message="Groq model returned a malformed or invalid JSON response.",
                status_code=502,
                details=f"Parse error: {parse_err} | Raw output: {raw_text}",
            ) from parse_err


# ---------------------------------------------------------------------------
# Module-level singleton — reads env at first use
# ---------------------------------------------------------------------------
groq_service = GroqService()
