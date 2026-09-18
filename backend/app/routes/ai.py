"""
AI Interpretation Layer Routes (Amazon Bedrock).
Accepts natural language user financial queries and maps them to structured intent.
Does not perform financial calculations.
"""

from fastapi import APIRouter, HTTPException, status
from app.schemas.ai import AIAnalyzeRequest, AIAnalyzeResponse
from app.services.bedrock_service import bedrock_service, BedrockServiceError

router = APIRouter(prefix="/ai", tags=["AI Interpretation"])


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
