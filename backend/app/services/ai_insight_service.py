"""
MoneyLens Backend AI Insight Adapter and Client.

Handles the integration between the MoneyLens backend financial calculation
engines and the independent AI service (http://localhost:8001/analyze).

Responsibilities:
- Adapts deterministic calculation results into AI input schemas
- Communicates with the AI service via HTTP POST
- Preserves 100% deterministic calculation integrity
"""

from typing import Any, Dict, Optional, List
import httpx
from app.core.config import settings
from app.schemas.goals import (
    GoalCalculationRequest,
    GoalCalculationResponse,
    GoalResponse,
    ReverseGoalRequest,
    ReverseGoalResponse,
)
from app.schemas.experiments import (
    ExperimentCompareRequest,
    ExperimentCompareResponse,
)
from app.schemas.radar import (
    RadarAlert,
    RadarProfileRequest,
    FinancialRadarResponse,
)
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
from app.services.goal_service import goal_service
from app.services.experiment_service import experiment_service
from app.services.radar_service import radar_service
from app.services.simulation_service import simulation_service


def adapt_reverse_goal_to_ai_input(
    reverse_goal: ReverseGoalResponse | Dict[str, Any],
    financial_position: Optional[Dict[str, Any]] = None
) -> Dict[str, Any]:
    """
    Transforms backend ReverseGoalResponse into the AI service ReverseAnalysisInput shape.
    
    Field translation:
    - alternative_timeline_at_current_surplus_months -> alternative_timeline_months
    """
    if hasattr(reverse_goal, "model_dump"):
        goal_data = reverse_goal.model_dump()
    elif isinstance(reverse_goal, dict):
        goal_data = reverse_goal
    else:
        goal_data = dict(reverse_goal)

    reverse_goal_payload = {
        "target_amount": goal_data.get("target_amount"),
        "target_months": goal_data.get("target_months"),
        "required_monthly_saving": goal_data.get("required_monthly_saving"),
        "current_monthly_surplus": goal_data.get("current_monthly_surplus"),
        "additional_monthly_needed": goal_data.get("additional_monthly_needed"),
        "is_currently_sufficient": goal_data.get("is_currently_sufficient"),
        "alternative_timeline_months": goal_data.get(
            "alternative_timeline_at_current_surplus_months",
            goal_data.get("alternative_timeline_months")
        ),
        "actionable_levers": goal_data.get("actionable_levers", {})
    }

    payload: Dict[str, Any] = {
        "reverse_goal": reverse_goal_payload
    }

    if financial_position:
        payload["financial_position"] = financial_position

    return payload


def build_reverse_analysis_request(
    reverse_goal: ReverseGoalResponse | Dict[str, Any],
    financial_position: Optional[Dict[str, Any]] = None,
    context_note: Optional[str] = None
) -> Dict[str, Any]:
    """
    Constructs the exact AnalyzeRequest expected by POST /analyze on the AI service.
    """
    return {
        "analysis_type": "reverse_analysis",
        "context_note": context_note,
        "reverse_analysis": adapt_reverse_goal_to_ai_input(
            reverse_goal=reverse_goal,
            financial_position=financial_position
        )
    }


def build_experiment_analysis_request(
    experiment_result: ExperimentCompareResponse | Dict[str, Any],
    financial_position: Optional[Dict[str, Any]] = None,
    context_note: Optional[str] = None,
    goals: Optional[List[Dict[str, Any]]] = None
) -> Dict[str, Any]:
    """
    Constructs the exact AnalyzeRequest expected by POST /analyze on the AI service for experiment_analysis.

    Zero-adapter mapping: The backend's comparison_matrix has 11/11 matching fields and identical
    types to the AI service's ScenarioComparison schema, so it is passed directly without transformation.
    """
    if hasattr(experiment_result, "model_dump"):
        exp_data = experiment_result.model_dump()
    elif isinstance(experiment_result, dict):
        exp_data = experiment_result
    else:
        exp_data = dict(experiment_result)

    scenarios = exp_data.get("comparison_matrix", [])

    experiment_analysis_payload: Dict[str, Any] = {
        "scenarios": scenarios
    }

    if financial_position:
        experiment_analysis_payload["financial_position"] = financial_position

    if goals:
        experiment_analysis_payload["goals"] = goals

    return {
        "analysis_type": "experiment_analysis",
        "context_note": context_note,
        "experiment_analysis": experiment_analysis_payload
    }


def adapt_radar_alert_to_ai(alert: RadarAlert | Dict[str, Any]) -> Dict[str, Any]:
    """
    Maps a backend RadarAlert to AI RadarAlert schema.
    Explicitly excludes 'trigger_rule' as required by the AI schema.
    """
    if hasattr(alert, "model_dump"):
        data = alert.model_dump()
    elif isinstance(alert, dict):
        data = alert
    else:
        data = dict(alert)

    category = data.get("category")
    if hasattr(category, "value"):
        category = category.value

    severity = data.get("severity")
    if hasattr(severity, "value"):
        severity = severity.value

    return {
        "id": data.get("id"),
        "category": str(category) if category is not None else None,
        "severity": str(severity) if severity is not None else None,
        "title": data.get("title"),
        "message": data.get("message"),
        "metric_value": data.get("metric_value"),
        "threshold_value": data.get("threshold_value"),
        "impact": data.get("impact"),
    }


def adapt_radar_metrics_to_financial_position(metrics_summary: Dict[str, Any]) -> Dict[str, Any]:
    """
    Maps deterministic radar metrics_summary dictionary into AI FinancialPosition.
    Only maps fields present in metrics_summary; does NOT invent existing_emi.
    """
    pos: Dict[str, Any] = {
        "monthly_income": metrics_summary.get("monthly_income"),
        "monthly_expenses": metrics_summary.get("monthly_expenses"),
        "monthly_surplus": metrics_summary.get("monthly_surplus"),
        "savings_rate_pct": metrics_summary.get("savings_rate_pct"),
        "current_savings": metrics_summary.get("current_savings"),
        "emergency_fund_months": metrics_summary.get("emergency_fund_months"),
    }
    # Only include existing_emi if explicitly provided in metrics_summary
    if "existing_emi" in metrics_summary and metrics_summary["existing_emi"] is not None:
        pos["existing_emi"] = metrics_summary["existing_emi"]

    return pos


def build_radar_analysis_request(
    radar_result: FinancialRadarResponse | Dict[str, Any],
    context_note: Optional[str] = None,
    goals: Optional[List[Dict[str, Any]]] = None
) -> Dict[str, Any]:
    """
    Constructs the exact AnalyzeRequest expected by POST /analyze on the AI service for radar_analysis.
    """
    if hasattr(radar_result, "model_dump"):
        radar_data = radar_result.model_dump()
    elif isinstance(radar_result, dict):
        radar_data = radar_result
    else:
        radar_data = dict(radar_result)

    raw_alerts = radar_data.get("alerts", [])
    adapted_alerts = [adapt_radar_alert_to_ai(a) for a in raw_alerts]

    metrics = radar_data.get("metrics_summary", {})
    financial_position = adapt_radar_metrics_to_financial_position(metrics)

    radar_analysis_payload: Dict[str, Any] = {
        "financial_position": financial_position,
        "radar_alerts": adapted_alerts,
    }

    if goals:
        radar_analysis_payload["goals"] = goals

    return {
        "analysis_type": "radar_analysis",
        "context_note": context_note,
        "radar_analysis": radar_analysis_payload
    }


def adapt_financial_position_to_ai(position: FinancialPositionResponse | Dict[str, Any]) -> Dict[str, Any]:
    """
    Transforms backend FinancialPositionResponse into the AI FinancialPosition shape.
    All 10 fields map 1-to-1 directly.
    """
    if hasattr(position, "model_dump"):
        data = position.model_dump()
    elif isinstance(position, dict):
        data = position
    else:
        data = dict(position)

    return {
        "monthly_income": data.get("monthly_income"),
        "monthly_expenses": data.get("monthly_expenses"),
        "existing_emi": data.get("existing_emi"),
        "monthly_surplus": data.get("monthly_surplus"),
        "savings_rate_pct": data.get("savings_rate_pct"),
        "current_savings": data.get("current_savings"),
        "emergency_fund_months": data.get("emergency_fund_months"),
        "projected_balance_3_months": data.get("projected_balance_3_months"),
        "projected_balance_6_months": data.get("projected_balance_6_months"),
        "projected_balance_12_months": data.get("projected_balance_12_months"),
    }


def adapt_simulation_result_to_ai(
    simulation_result: Any,
    scenario_label: Optional[str] = None
) -> Dict[str, Any]:
    """
    Transforms any backend simulation response (Purchase, EMI, Savings) into the AI SimulationResult shape.
    """
    if hasattr(simulation_result, "model_dump"):
        data = simulation_result.model_dump()
    elif isinstance(simulation_result, dict):
        data = simulation_result
    else:
        data = dict(simulation_result)

    scenario = scenario_label or data.get("scenario") or "simulation"
    return {
        "scenario": scenario,
        "data": data
    }


def build_time_machine_analysis_request(
    financial_position: FinancialPositionResponse | Dict[str, Any],
    simulation_result: Any,
    context_note: Optional[str] = None,
    scenario_label: Optional[str] = None,
    goals: Optional[List[Dict[str, Any]]] = None,
    radar_alerts: Optional[List[Dict[str, Any]]] = None
) -> Dict[str, Any]:
    """
    Constructs the exact AnalyzeRequest expected by POST /analyze on the AI service for time_machine mode.
    Combines the two deterministic backend outputs:
    1. Baseline Financial Position
    2. Decision Simulation Result
    """
    adapted_position = adapt_financial_position_to_ai(financial_position)
    adapted_simulation = adapt_simulation_result_to_ai(simulation_result, scenario_label=scenario_label)

    time_machine_payload: Dict[str, Any] = {
        "financial_position": adapted_position,
        "simulation_result": adapted_simulation,
    }
    if goals:
        time_machine_payload["goals"] = goals
    if radar_alerts:
        time_machine_payload["radar_alerts"] = radar_alerts

    return {
        "analysis_type": "time_machine",
        "context_note": context_note,
        "time_machine": time_machine_payload
    }


def adapt_goal_calculation_to_ai(
    goal_calc: GoalCalculationResponse | Dict[str, Any],
    title: Optional[str] = None
) -> Dict[str, Any]:
    """
    Transforms backend GoalCalculationResponse into the AI FinancialGoal shape.
    
    Field translation:
    - projected_completion_months_at_current_rate -> projected_completion_months
    - title is supplied from the resolved goal record or request
    """
    if hasattr(goal_calc, "model_dump"):
        calc_data = goal_calc.model_dump()
    elif isinstance(goal_calc, dict):
        calc_data = goal_calc
    else:
        calc_data = dict(goal_calc)

    return {
        "title": title or calc_data.get("title") or "Financial Goal",
        "target_amount": calc_data.get("target_amount"),
        "current_savings_allocated": calc_data.get("current_savings_allocated"),
        "target_months": calc_data.get("target_months"),
        "required_monthly_saving": calc_data.get("required_monthly_saving"),
        "monthly_gap_or_shortfall": calc_data.get("monthly_gap_or_shortfall"),
        "is_reachable": calc_data.get("is_reachable"),
        "projected_completion_months": calc_data.get(
            "projected_completion_months_at_current_rate",
            calc_data.get("projected_completion_months")
        ),
        "status": calc_data.get("status"),
        "status_description": calc_data.get("status_description"),
    }


def build_goal_analysis_request(
    goals: List[Dict[str, Any]],
    financial_position: Optional[Dict[str, Any]] = None,
    context_note: Optional[str] = None
) -> Dict[str, Any]:
    """
    Constructs the exact AnalyzeRequest expected by POST /analyze on the AI service for goal_analysis.
    """
    goal_analysis_payload: Dict[str, Any] = {
        "goals": goals
    }
    if financial_position:
        goal_analysis_payload["financial_position"] = financial_position

    return {
        "analysis_type": "goal_analysis",
        "context_note": context_note,
        "goal_analysis": goal_analysis_payload
    }


class AIInsightServiceError(Exception):
    """Raised when communication with the AI service fails."""
    def __init__(self, message: str, status_code: int = 502):
        super().__init__(message)
        self.message = message
        self.status_code = status_code


class AIInsightService:
    """Client for dispatching insight requests to the independent AI service."""

    def __init__(self, base_url: Optional[str] = None, timeout: float = 30.0):
        self.base_url = (base_url or settings.AI_SERVICE_URL).rstrip("/")
        self.timeout = timeout

    def send_analyze_request(self, payload: Dict[str, Any]) -> Dict[str, Any]:
        """Sends an AnalyzeRequest payload to the AI service."""
        url = f"{self.base_url}/analyze"
        try:
            with httpx.Client(timeout=self.timeout) as client:
                response = client.post(url, json=payload)
                if response.status_code != 200:
                    raise AIInsightServiceError(
                        f"AI service returned HTTP {response.status_code}: {response.text}",
                        status_code=502
                    )
                return response.json()
        except httpx.RequestError as exc:
            raise AIInsightServiceError(
                f"Failed to connect to AI service at {url}: {str(exc)}",
                status_code=503
            ) from exc

    def analyze_reverse_goal(
        self,
        req: ReverseGoalRequest,
        context_note: Optional[str] = None,
        financial_position: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """
        Executes reverse goal calculation via the deterministic financial engine,
        adapts the result for the AI service, and retrieves structured AI insights.
        """
        # 1. Deterministic financial engine calculation (untouched)
        calc_result = goal_service.calculate_reverse_goal_engine(req)

        # 2. Derive position if not explicitly supplied
        if financial_position is None and req.current_monthly_income is not None:
            financial_position = {
                "monthly_income": req.current_monthly_income,
                "monthly_expenses": req.current_monthly_expenses,
                "existing_emi": req.existing_emi,
                "monthly_surplus": calc_result.current_monthly_surplus,
            }

        # 3. Build adapter payload
        ai_payload = build_reverse_analysis_request(
            reverse_goal=calc_result,
            financial_position=financial_position,
            context_note=context_note
        )

        # 4. Request AI interpretation
        ai_insight = self.send_analyze_request(ai_payload)

        return {
            "calculation": calc_result.model_dump(),
            "ai_insight": ai_insight
        }

    def analyze_experiment_comparison(
        self,
        req: ExperimentCompareRequest,
        context_note: Optional[str] = None,
        financial_position: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """
        Executes multi-scenario experiment comparison via the deterministic engine,
        passes the comparison_matrix directly to the AI service, and retrieves structured AI insights.
        """
        # 1. Deterministic financial engine calculation (untouched)
        calc_result = experiment_service.compare_scenarios(req)

        # 2. Derive position if not explicitly supplied
        if financial_position is None:
            base_surplus = req.monthly_income - req.monthly_expenses - req.existing_emi
            emergency_months = round(req.current_savings / req.monthly_expenses, 2) if req.monthly_expenses > 0 else 0.0
            financial_position = {
                "monthly_income": req.monthly_income,
                "monthly_expenses": req.monthly_expenses,
                "existing_emi": req.existing_emi,
                "current_savings": req.current_savings,
                "monthly_surplus": base_surplus,
                "emergency_fund_months": emergency_months,
            }

        # Optional goal context if target_goal_amount was provided
        goals_payload = None
        if req.target_goal_amount and req.target_goal_amount > 0:
            goals_payload = [
                {
                    "title": "Target Goal",
                    "target_amount": req.target_goal_amount,
                    "target_months": req.target_goal_months,
                }
            ]

        # 3. Build payload (comparison_matrix passed directly with zero transformation)
        ai_payload = build_experiment_analysis_request(
            experiment_result=calc_result,
            financial_position=financial_position,
            context_note=context_note or req.context_note,
            goals=goals_payload
        )

        # 4. Request AI interpretation
        ai_insight = self.send_analyze_request(ai_payload)

        return {
            "calculation": calc_result.model_dump(),
            "ai_insight": ai_insight
        }

    def analyze_radar(
        self,
        profile: Optional[RadarProfileRequest] = None,
        context_note: Optional[str] = None,
        goals: Optional[List[Dict[str, Any]]] = None
    ) -> Dict[str, Any]:
        """
        Executes deterministic Financial Radar evaluation,
        maps radar alerts (excluding trigger_rule) and metrics_summary to AI schema,
        and retrieves structured AI insights.
        """
        # 1. Deterministic radar calculation (untouched engine)
        calc_result = radar_service.evaluate_radar(profile=profile)

        # 2. Build radar analysis payload
        ai_payload = build_radar_analysis_request(
            radar_result=calc_result,
            context_note=context_note or (profile.context_note if profile else None),
            goals=goals
        )

        # 3. Request AI interpretation
        ai_insight = self.send_analyze_request(ai_payload)

        return {
            "calculation": calc_result.model_dump(),
            "ai_insight": ai_insight
        }

    def analyze_time_machine(
        self,
        position_req: FinancialPositionRequest,
        simulation_result: Any,
        context_note: Optional[str] = None,
        scenario_label: Optional[str] = None,
        goals: Optional[List[Dict[str, Any]]] = None,
        radar_alerts: Optional[List[Dict[str, Any]]] = None
    ) -> Dict[str, Any]:
        """
        Combines baseline financial position and simulation output,
        and requests structured AI insight from the independent AI service.
        """
        # 1. Deterministic baseline position calculation
        baseline_position = simulation_service.get_financial_position(position_req)

        # 2. Build time machine AI request combining position + simulation
        ai_payload = build_time_machine_analysis_request(
            financial_position=baseline_position,
            simulation_result=simulation_result,
            context_note=context_note,
            scenario_label=scenario_label,
            goals=goals,
            radar_alerts=radar_alerts
        )

        # 3. Request AI interpretation
        ai_insight = self.send_analyze_request(ai_payload)

        return {
            "baseline_position": baseline_position.model_dump(),
            "calculation": simulation_result.model_dump() if hasattr(simulation_result, "model_dump") else simulation_result,
            "ai_insight": ai_insight
        }

    def analyze_purchase_simulation(
        self,
        req: PurchaseSimulationRequest,
        context_note: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Executes purchase simulation and baseline position calculation,
        combines them, and requests AI time_machine insight.
        """
        # 1. Deterministic purchase simulation (untouched engine)
        sim_result = simulation_service.simulate_purchase(req)

        # 2. Deterministic baseline position from request parameters
        pos_req = FinancialPositionRequest(
            monthly_income=req.monthly_income,
            monthly_expenses=req.monthly_expenses,
            current_savings=req.current_savings,
            existing_emi=req.existing_emi
        )
        return self.analyze_time_machine(
            position_req=pos_req,
            simulation_result=sim_result,
            context_note=context_note or req.context_note,
            scenario_label="upfront_cash_purchase"
        )

    def analyze_emi_simulation(
        self,
        req: EMISimulationRequest,
        context_note: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Executes EMI simulation and baseline position calculation,
        combines them, and requests AI time_machine insight.
        """
        # 1. Deterministic EMI simulation (untouched engine)
        sim_result = simulation_service.simulate_emi(req)

        # 2. Deterministic baseline position from request parameters
        pos_req = FinancialPositionRequest(
            monthly_income=req.monthly_income,
            monthly_expenses=req.monthly_expenses,
            current_savings=req.current_savings,
            existing_emi=req.existing_emi
        )
        return self.analyze_time_machine(
            position_req=pos_req,
            simulation_result=sim_result,
            context_note=context_note or req.context_note,
            scenario_label="emi_financed_purchase"
        )

    def analyze_savings_simulation(
        self,
        req: SavingsProjectionRequest,
        context_note: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Executes savings projection and baseline position calculation,
        combines them, and requests AI time_machine insight.
        """
        # 1. Deterministic savings projection (untouched engine)
        sim_result = simulation_service.project_savings(req)

        # 2. Deterministic baseline position from request parameters
        pos_req = FinancialPositionRequest(
            monthly_income=req.monthly_income,
            monthly_expenses=req.monthly_expenses,
            current_savings=req.current_savings,
            existing_emi=req.existing_emi
        )
        return self.analyze_time_machine(
            position_req=pos_req,
            simulation_result=sim_result,
            context_note=context_note or req.context_note,
            scenario_label="savings_projection"
        )

    def analyze_goal(
        self,
        req: GoalCalculationRequest,
        title: Optional[str] = None,
        context_note: Optional[str] = None,
        financial_position: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """
        Calculates forward goal feasibility, resolves the title,
        formats the goal_analysis payload, and requests AI interpretation.
        """
        # 1. Deterministic goal calculation (untouched engine)
        calc_result = goal_service.calculate_forward_goal(req)

        resolved_title = title or req.title or "Financial Goal"

        # 2. Derive position if not provided
        if financial_position is None:
            financial_position = {
                "monthly_income": req.monthly_income,
                "monthly_expenses": req.monthly_expenses,
                "existing_emi": req.existing_emi,
                "monthly_surplus": calc_result.current_monthly_surplus,
            }

        # 3. Adapt goal calculation with resolved title
        adapted_goal = adapt_goal_calculation_to_ai(calc_result, title=resolved_title)

        # 4. Build AI payload
        ai_payload = build_goal_analysis_request(
            goals=[adapted_goal],
            financial_position=financial_position,
            context_note=context_note or req.context_note
        )

        # 5. Request AI interpretation
        ai_insight = self.send_analyze_request(ai_payload)

        return {
            "calculation": calc_result.model_dump(),
            "ai_insight": ai_insight
        }

    def analyze_saved_goal(
        self,
        goal_id: str,
        monthly_income: Optional[float] = None,
        monthly_expenses: Optional[float] = None,
        existing_emi: Optional[float] = None,
        expected_annual_return_pct: Optional[float] = None,
        context_note: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Resolves a saved goal by ID from repository, resolves its stored title and target parameters,
        runs the deterministic goal calculation, and retrieves structured AI insights.
        """
        saved_goal = goal_service.repository.get_by_id(goal_id)
        if not saved_goal:
            raise AIInsightServiceError(f"Goal with ID '{goal_id}' not found.", status_code=404)

        inc = monthly_income if monthly_income is not None else 80000.0
        exp = monthly_expenses if monthly_expenses is not None else 45000.0
        emi = existing_emi if existing_emi is not None else 0.0
        ret_pct = expected_annual_return_pct if expected_annual_return_pct is not None else 0.0

        calc_req = GoalCalculationRequest(
            target_amount=saved_goal.target_amount,
            current_savings_allocated=saved_goal.current_savings_allocated,
            target_months=saved_goal.target_months,
            target_date=saved_goal.target_date,
            monthly_income=inc,
            monthly_expenses=exp,
            existing_emi=emi,
            expected_annual_return_pct=ret_pct,
            title=saved_goal.title
        )

        result = self.analyze_goal(
            req=calc_req,
            title=saved_goal.title,
            context_note=context_note
        )

        return {
            "goal": saved_goal.model_dump(),
            "calculation": result["calculation"],
            "ai_insight": result["ai_insight"]
        }


ai_insight_service = AIInsightService()



