"""
Pydantic Schemas for AI Interpretation Layer (Amazon Bedrock).
Defines request and structured response models for natural language financial queries.
"""

from typing import Optional
from pydantic import BaseModel, Field


class AIAnalyzeRequest(BaseModel):
    """Natural language financial request sent by the user."""
    message: str = Field(
        ...,
        min_length=1,
        examples=["Can I buy a ₹70,000 phone next month?"],
        description="User's natural language financial inquiry or hypothetical decision"
    )


class AIAnalyzeResponse(BaseModel):
    """Structured intent representation extracted by the AI interpretation layer."""
    intent: str = Field(
        ...,
        examples=["purchase_simulation"],
        description="Primary financial intent (e.g. purchase_simulation, emi_simulation, savings_projection, goal_tracking, expense_analysis, general_query)"
    )
    item: Optional[str] = Field(
        default=None,
        examples=["phone"],
        description="Identified item, asset, or subject of the query"
    )
    amount: Optional[float] = Field(
        default=None,
        examples=[70000.0],
        description="Target amount or price identified in the query"
    )
    time_period: Optional[str] = Field(
        default=None,
        examples=["next_month"],
        description="Temporal reference or timeframe mentioned"
    )
    payment_method: Optional[str] = Field(
        default=None,
        examples=["emi", "cash", "credit_card"],
        description="Payment mode or funding method if specified"
    )
    goal: Optional[str] = Field(
        default=None,
        examples=["emergency_fund", "house_downpayment"],
        description="Financial goal referenced in the inquiry"
    )
