"""
AI Interpretation Layer Routes (Amazon Bedrock).
Accepts natural language user financial queries and maps them to structured intent.
Does not perform financial calculations.
"""

from fastapi import APIRouter, HTTPException, status
from app.schemas.ai import (
    AIAnalyzeRequest,
    AIAnalyzeResponse,
    AIInsightRequest,
    AIInsightResponse
)
from app.services.bedrock_service import bedrock_service, BedrockServiceError
from app.services.ai_gateway_service import ai_gateway_service

router = APIRouter(prefix="/ai", tags=["AI Interpretation & Insights"])


@router.post(
    "/analyze",
    response_model=AIAnalyzeResponse,
    status_code=status.HTTP_200_OK,
    summary="Analyze natural language financial query using Amazon Bedrock"
)
def analyze_financial_query(payload: AIAnalyzeRequest):
    """
    Interprets natural language financial questions via Amazon Bedrock Converse API (`amazon.nova-micro-v1:0`).
    Extracts structured intent parameters (`intent`, `item`, `amount`, `time_period`, `payment_method`, `goal`).
    
    *Note: Deterministic calculations (EMI, savings, position) are handled exclusively by backend simulation engines.*
    """
    try:
        return bedrock_service.analyze_financial_query(payload.message)
    except BedrockServiceError as e:
        raise HTTPException(status_code=e.status_code, detail=e.message)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"An unexpected error occurred during AI analysis: {str(e)}"
        )


@router.post(
    "/insights",
    response_model=AIInsightResponse,
    status_code=status.HTTP_200_OK,
    summary="Generate plain-English narrative observations, trade-offs, and evidence from structured financial results"
)
async def generate_financial_insights(payload: AIInsightRequest):
    """
    Connects to the MoneyLens Groq AI microservice (:8001) to synthesize high-level narrative insights,
    observations, trade-offs, and risk factors from pre-calculated financial data.
    Provides graceful fallback synthesis if the AI microservice is not yet running.
    """
    try:
        return await ai_gateway_service.get_insights(payload)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error generating financial insights: {str(e)}"
        )

