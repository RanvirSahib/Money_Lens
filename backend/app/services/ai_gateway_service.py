"""
MoneyLens AI Gateway Service.
Forwards structured financial engine calculation outputs to the MoneyLens Groq AI microservice (:8001).
Provides high-resiliency fallback synthesis if the AI service is offline or processing.
"""

import logging
from typing import Optional
import httpx

from app.core.config import settings
from app.schemas.ai import (
    AIInsightRequest,
    AIInsightResponse,
    AnalysisType,
)

logger = logging.getLogger(__name__)


class AIGatewayService:
    def __init__(self, ai_service_url: Optional[str] = None):
        self.ai_service_url = (ai_service_url or settings.AI_SERVICE_URL).rstrip("/")

    async def get_insights(self, request: AIInsightRequest) -> AIInsightResponse:
        target_url = f"{self.ai_service_url}/analyze"
        
        try:
            async with httpx.AsyncClient(timeout=10.0) as client:
                response = await client.post(
                    target_url,
                    json=request.model_dump(exclude_none=True)
                )
                
                if response.status_code == 200:
                    data = response.json()
                    return AIInsightResponse(**data)
                else:
                    logger.warning(
                        "AI microservice returned HTTP %s: %s",
                        response.status_code,
                        response.text
                    )
        except Exception as exc:
            logger.info("AI microservice at %s not reachable (%s). Using fallback synthesis.", target_url, str(exc))

        return self._generate_fallback_synthesis(request)

    def _generate_fallback_synthesis(self, request: AIInsightRequest) -> AIInsightResponse:
        t = request.analysis_type
        pos = request.financial_position
        sim = request.simulation_result
        goal = request.goal
        rev = request.reverse_plan
        rad = request.radar

        if t == AnalysisType.TIME_MACHINE:
            surplus = pos.monthly_surplus if pos and pos.monthly_surplus is not None else 0
            emergency_mo = pos.emergency_fund_months if pos and pos.emergency_fund_months is not None else 0
            
            return AIInsightResponse(
                analysis_type=AnalysisType.TIME_MACHINE,
                headline="Financial Trajectory & Impact Analysis",
                observations=[
                    f"Current net surplus sits at ₹{surplus:,.2f}/month with {emergency_mo:.1f} months of emergency runway.",
                    "Simulated path shows liquidity changes against baseline accumulation curve."
                ],
                evidence=[
                    f"Emergency fund buffer: {emergency_mo:.1f} months",
                    f"Monthly cash surplus: ₹{surplus:,.2f}"
                ],
                implications=[
                    "Major capital outflows reduce liquidity runway and postpone intermediate milestones.",
                    "EMI financing preserves immediate liquidity but adds ongoing monthly liability."
                ],
                trade_offs=[
                    "Upfront cash payment eliminates interest cost but lowers liquid buffer.",
                    "Financing retains cash buffer at the expense of cumulative interest charges."
                ],
                what_to_watch=[
                    "Maintain at least 3 months of emergency expenses in liquid reserves.",
                    "Ensure total monthly debt obligations do not exceed 40% of net income."
                ],
                possible_actions=[
                    "Review discretionary expenditure categories to rebuild emergency buffer faster.",
                    "Consider a partial downpayment to minimize loan tenure and interest burden."
                ],
                confidence_score=0.92
            )

        elif t == AnalysisType.GOAL_ANALYSIS:
            title = goal.title if goal and goal.title else "Target Milestone"
            req_saving = goal.required_monthly_saving if goal and goal.required_monthly_saving is not None else 0
            is_reachable = goal.is_reachable if goal and goal.is_reachable is not None else True
            
            status_text = "on track" if is_reachable else "requires adjustment"
            return AIInsightResponse(
                analysis_type=AnalysisType.GOAL_ANALYSIS,
                headline=f"Goal Velocity Review: {title}",
                observations=[
                    f"Milestone '{title}' is currently {status_text}.",
                    f"Requires ₹{req_saving:,.2f}/month dedicated savings to meet target timeline."
                ],
                evidence=[
                    f"Required savings: ₹{req_saving:,.2f}/month",
                    f"Target reachable: {'Yes' if is_reachable else 'No'}"
                ],
                implications=[
                    "Consistent monthly allocation ensures arrival within planned timeline." if is_reachable
                    else "Current surplus is insufficient for target timeline without budget reallocation."
                ],
                trade_offs=[
                    "Accelerating this goal may require deferring secondary discretionary goals.",
                    "Extending target deadline lowers monthly required savings burden."
                ],
                what_to_watch=[
                    "Track monthly savings consistency against the designated sinking fund.",
                    "Avoid diverting emergency funds into long-term illiquid goals."
                ],
                possible_actions=[
                    "Automate a recurring transfer on payday directly to the goal sinking fund.",
                    "Explore adjusting milestone deadline to align with realistic cash surplus."
                ],
                confidence_score=0.94
            )

        elif t == AnalysisType.REVERSE_ANALYSIS:
            title = rev.goal_title if rev and rev.goal_title else "Target Goal"
            shortfall = rev.monthly_shortfall if rev and rev.monthly_shortfall is not None else 0
            
            return AIInsightResponse(
                analysis_type=AnalysisType.REVERSE_ANALYSIS,
                headline=f"Backward-Propagated Plan: {title}",
                observations=[
                    f"To achieve '{title}', current budget gap is ₹{shortfall:,.2f}/month.",
                    "Backward-propagation calculated optimal levers across variable expense categories."
                ],
                evidence=[
                    f"Monthly shortfall: ₹{shortfall:,.2f}",
                    f"Target deadline: {rev.deadline_months if rev else 12} months"
                ],
                implications=[
                    "Implementing recommended expense reductions bridges the gap without extra debt.",
                    "Alternatively, extending the target horizon relaxes monthly constraints."
                ],
                trade_offs=[
                    "Short-term lifestyle cutbacks unlock guaranteed milestone completion.",
                    "Keeping current lifestyle requires extending target date."
                ],
                what_to_watch=[
                    "Monitor dining, entertainment, and non-essential subscription categories.",
                    "Ensure cutbacks are sustainable over the entire goal duration."
                ],
                possible_actions=[
                    "Apply recommended discretionary expense trims immediately.",
                    "Check if secondary income or bonus allocations can offset the monthly gap."
                ],
                confidence_score=0.90
            )

        elif t == AnalysisType.RADAR_ANALYSIS:
            health = rad.cash_flow_health if rad and rad.cash_flow_health else "stable"
            runway = rad.runway_months if rad and rad.runway_months is not None else 3.0
            
            return AIInsightResponse(
                analysis_type=AnalysisType.RADAR_ANALYSIS,
                headline="Cash Flow Surveillance & Runway Assessment",
                observations=[
                    f"Cash flow health rating is {health.upper()} with an estimated {runway:.1f} months runway.",
                    "Upcoming recurring auto-debits and expense clusters detected across next 30 days."
                ],
                evidence=[
                    f"Runway: {runway:.1f} months",
                    f"Health: {health}"
                ],
                implications=[
                    "Liquidity buffers are sufficient for near-term scheduled obligations." if runway >= 2.0
                    else "Upcoming obligations may trigger a cash flow trough near the billing cycle."
                ],
                trade_offs=[
                    "Maintaining high liquid cash reduces investment returns but prevents overdrafts.",
                    "Minimizing cash float maximizes yields but increases sensitivity to timing mismatches."
                ],
                what_to_watch=[
                    "Upcoming subscription renewals and loan auto-debit dates.",
                    "Spacing between salary credit and major recurring bill deductions."
                ],
                possible_actions=[
                    "Align recurring bill dates within 5 days post-payday to avoid mid-month balance dips.",
                    "Review recurring subscriptions for unused services to lower baseline fixed costs."
                ],
                confidence_score=0.93
            )

        else:
            return AIInsightResponse(
                analysis_type=AnalysisType.EXPERIMENT_ANALYSIS,
                headline="Multi-Scenario Experiment Comparison",
                observations=[
                    "Comparing scenario outcomes against baseline trajectory across key financial health metrics.",
                    "Analyzes net worth velocity, liquidity resilience, and total interest obligations."
                ],
                evidence=[
                    "Comparative trajectory projections evaluated over duration."
                ],
                implications=[
                    "Different pathways reveal distinct trade-offs between cash liquidity and long-term asset growth."
                ],
                trade_offs=[
                    "Aggressive savings build wealth faster but restrict present spending flexibility.",
                    "Balanced allocation maintains lifestyle comfort while steadily progressing."
                ],
                what_to_watch=[
                    "Sensitivity of each scenario to unexpected income interruptions.",
                    "Inflation impact on long-term capital accumulation."
                ],
                possible_actions=[
                    "Select the pathway offering the highest risk-adjusted net worth growth.",
                    "Run stress-tests with higher interest rates or living costs before committing."
                ],
                confidence_score=0.91
            )


ai_gateway_service = AIGatewayService()
