"""
AI Interpretation Layer Routes (Intent Parser, Bedrock, and Groq Gateway).
Accepts natural language user financial queries and maps them to structured intent and execution.
Does not perform financial calculations internally — delegates to deterministic engines.
"""

import logging
from typing import Optional, Dict, Any
from fastapi import APIRouter, HTTPException, status
from app.schemas.ai import (
    AIAnalyzeRequest,
    AIAnalyzeResponse,
    AIInsightRequest,
    AIInsightResponse,
    ParseIntentRequest,
    AIQueryRequest,
    AIQueryResponse,
    AnalysisType,
)
from app.schemas.simulation import (
    PurchaseSimulationRequest,
    EMISimulationRequest,
    FinancialPositionRequest,
)
from app.schemas.goals import (
    GoalCalculationRequest,
    ReverseGoalRequest,
)
from app.schemas.radar import RadarProfileRequest
from app.schemas.experiments import (
    ExperimentCompareRequest,
    ScenarioInput,
    ScenarioType,
)
from app.services.bedrock_service import bedrock_service, BedrockServiceError
from app.services.ai_gateway_service import ai_gateway_service
from app.services.intent_service import intent_service, MoneyLensIntent, ParsedFinancialIntent
from app.services.ai_insight_service import ai_insight_service

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/ai", tags=["AI Interpretation & Insights"])


@router.post(
    "/parse-intent",
    response_model=ParsedFinancialIntent,
    status_code=status.HTTP_200_OK,
    summary="Parse natural language financial query into structured MoneyLens intent and Indian amounts"
)
def parse_natural_language_intent(payload: ParseIntentRequest):
    """
    Deterministically parses natural language financial queries.
    Understands Indian currency expressions ('6 lakh', '₹5 crore', '50 thousand', '70,000', 'six lakh')
    and maps them to one of the 5 MoneyLens modes without modifying or calculating financial data.
    """
    return intent_service.parse_intent(payload.query)


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


@router.post(
    "/query",
    response_model=AIQueryResponse,
    status_code=status.HTTP_200_OK,
    summary="End-to-end natural language financial execution (NLP -> Engine -> AI Insight)"
)
def execute_natural_language_query(payload: AIQueryRequest):
    """
    One-stop execution for natural language financial decision simulation:
    1. Parses natural language and Indian currency expressions
    2. Dispatches to the relevant deterministic financial engine (Time Machine, Goals, Reverse, Experiment, Radar)
    3. Interprets the calculation output using the Groq AI service
    4. Returns structured results for UI rendering
    """
    parsed = intent_service.parse_intent(payload.query)

    if parsed.is_ambiguous or parsed.intent == MoneyLensIntent.CLARIFICATION_NEEDED:
        return AIQueryResponse(
            status="clarification_needed",
            intent="clarification_needed",
            capability="MoneyLens AI",
            parsed_entities={"raw_query": payload.query},
            clarification_question=parsed.clarification_question or "Please provide more details on what you'd like to evaluate."
        )

    inc = payload.monthly_income if payload.monthly_income is not None else 80000.0
    exp = payload.monthly_expenses if payload.monthly_expenses is not None else 45000.0
    sav = payload.current_savings if payload.current_savings is not None else 200000.0
    emi = payload.existing_emi if payload.existing_emi is not None else 0.0

    intent = parsed.intent
    amount = parsed.amount or 50000.0
    timeline = parsed.timeline_months or 12

    try:
        # 1. TIME_MACHINE
        if intent == MoneyLensIntent.TIME_MACHINE:
            if parsed.payment_method == "emi":
                emi_req = EMISimulationRequest(
                    purchase_price=amount,
                    down_payment=0.0,
                    annual_interest_rate_pct=10.5,
                    tenure_months=timeline if timeline in (6, 12, 24, 36, 48, 60) else 12,
                    monthly_income=inc,
                    monthly_expenses=exp,
                    current_savings=sav,
                    existing_emi=emi,
                    item_name=parsed.item or "Simulated Item",
                    context_note=payload.query
                )
                res = ai_insight_service.analyze_emi_simulation(emi_req)
                return AIQueryResponse(
                    status="success",
                    intent=MoneyLensIntent.TIME_MACHINE.value,
                    capability="Time Machine (EMI Financed)",
                    parsed_entities=parsed.model_dump(),
                    calculation=res.get("calculation"),
                    ai_insight=res.get("ai_insight")
                )
            else:
                purchase_req = PurchaseSimulationRequest(
                    purchase_amount=amount,
                    monthly_income=inc,
                    monthly_expenses=exp,
                    current_savings=sav,
                    existing_emi=emi,
                    item_name=parsed.item or "Simulated Purchase",
                    context_note=payload.query
                )
                res = ai_insight_service.analyze_purchase_simulation(purchase_req)
                return AIQueryResponse(
                    status="success",
                    intent=MoneyLensIntent.TIME_MACHINE.value,
                    capability="Time Machine (Cash Purchase)",
                    parsed_entities=parsed.model_dump(),
                    calculation=res.get("calculation"),
                    ai_insight=res.get("ai_insight")
                )

        # 2. GOAL_ANALYSIS
        elif intent == MoneyLensIntent.GOAL_ANALYSIS:
            goal_req = GoalCalculationRequest(
                title=parsed.goal_title or "Savings Goal",
                target_amount=amount,
                current_savings_allocated=0.0,
                target_months=timeline,
                monthly_income=inc,
                monthly_expenses=exp,
                existing_emi=emi,
                context_note=payload.query
            )
            res = ai_insight_service.analyze_goal(goal_req, title=goal_req.title)
            return AIQueryResponse(
                status="success",
                intent=MoneyLensIntent.GOAL_ANALYSIS.value,
                capability="Goal Velocity Analysis",
                parsed_entities=parsed.model_dump(),
                calculation=res.get("calculation"),
                ai_insight=res.get("ai_insight")
            )

        # 3. REVERSE_ANALYSIS
        elif intent == MoneyLensIntent.REVERSE_ANALYSIS:
            rev_req = ReverseGoalRequest(
                title=parsed.goal_title or f"Target ₹{amount:,.0f}",
                target_amount=amount,
                target_months=timeline,
                monthly_income=inc,
                monthly_expenses=exp,
                existing_emi=emi,
                context_note=payload.query
            )
            res = ai_insight_service.analyze_reverse_goal(rev_req)
            return AIQueryResponse(
                status="success",
                intent=MoneyLensIntent.REVERSE_ANALYSIS.value,
                capability="Reverse Goal Engineering",
                parsed_entities=parsed.model_dump(),
                calculation=res.get("calculation"),
                ai_insight=res.get("ai_insight")
            )

        # 4. EXPERIMENT_ANALYSIS
        elif intent == MoneyLensIntent.EXPERIMENT_ANALYSIS:
            exp_req = ExperimentCompareRequest(
                monthly_income=inc,
                monthly_expenses=exp,
                current_savings=sav,
                existing_emi=emi,
                scenarios=[
                    ScenarioInput(
                        scenario_id="scenario_status_quo",
                        scenario_name="Status Quo (No Purchase)",
                        scenario_type=ScenarioType.NO_PURCHASE
                    ),
                    ScenarioInput(
                        scenario_id="scenario_cash",
                        scenario_name=f"Upfront Cash (₹{amount:,.0f})",
                        scenario_type=ScenarioType.CASH_PURCHASE,
                        purchase_amount=amount
                    ),
                    ScenarioInput(
                        scenario_id="scenario_emi",
                        scenario_name=f"12M EMI Financing (₹{amount:,.0f})",
                        scenario_type=ScenarioType.EMI_PURCHASE,
                        purchase_amount=amount,
                        tenure_months=12,
                        annual_interest_rate_pct=10.5
                    )
                ],
                context_note=payload.query
            )
            res = ai_insight_service.analyze_experiment_comparison(exp_req)
            return AIQueryResponse(
                status="success",
                intent=MoneyLensIntent.EXPERIMENT_ANALYSIS.value,
                capability="Experiment Lab (Multi-Scenario Comparison)",
                parsed_entities=parsed.model_dump(),
                calculation=res.get("calculation"),
                ai_insight=res.get("ai_insight")
            )

        # 5. RADAR_ANALYSIS
        else:
            rad_profile = RadarProfileRequest(
                monthly_income=inc,
                monthly_expenses=exp,
                current_savings=sav,
                existing_emi=emi,
                context_note=payload.query
            )
            res = ai_insight_service.analyze_radar(rad_profile)
            return AIQueryResponse(
                status="success",
                intent=MoneyLensIntent.RADAR_ANALYSIS.value,
                capability="Financial Radar & Risk Surveillance",
                parsed_entities=parsed.model_dump(),
                calculation=res.get("calculation"),
                ai_insight=res.get("ai_insight")
            )

    except Exception as exc:
        logger.exception("Error executing natural language query: %s", str(exc))
        return AIQueryResponse(
            status="error",
            intent=parsed.intent.value,
            capability="MoneyLens AI",
            parsed_entities=parsed.model_dump(),
            clarification_question=f"MoneyLens couldn't complete the full analysis right now ({str(exc)}). Your financial data has not been changed."
        )
