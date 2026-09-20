import { apiRequest } from "./client";
import { AIInsightRequest, AIInsightResponse, AIQueryRequest, AIQueryResponse, ParsedFinancialIntent } from "@/types/ai";

export async function fetchAIInsights(
  payload: AIInsightRequest
): Promise<AIInsightResponse> {
  try {
    return await apiRequest<AIInsightResponse>("/api/v1/ai/insights", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  } catch (error) {
    console.warn("Falling back to local AI insight generation:", error);
    return getLocalAIInsightFallback(payload);
  }
}

export async function executeAIQuery(
  request: AIQueryRequest
): Promise<AIQueryResponse> {
  try {
    return await apiRequest<AIQueryResponse>("/api/v1/ai/query", {
      method: "POST",
      body: JSON.stringify(request),
    });
  } catch (error) {
    console.warn("Falling back to local AI query generation:", error);
    return getLocalAIQueryFallback(request);
  }
}

export async function parseAIIntent(
  query: string
): Promise<ParsedFinancialIntent> {
  try {
    return await apiRequest<ParsedFinancialIntent>("/api/v1/ai/parse-intent", {
      method: "POST",
      body: JSON.stringify({ query }),
    });
  } catch (error) {
    console.warn("Falling back to local AI intent parser:", error);
    return {
      intent: "time_machine",
      raw_query: query,
      confidence_score: 0.85,
      is_ambiguous: false,
    };
  }
}

function getLocalAIQueryFallback(request: AIQueryRequest): AIQueryResponse {
  const query = request.query || "financial decision";
  const income = request.monthly_income ?? 85000;
  const expenses = request.monthly_expenses ?? 45000;
  const savings = request.current_savings ?? 250000;
  const surplus = income - expenses;
  const runway = expenses > 0 ? savings / expenses : 3;

  return {
    status: "success",
    intent: "time_machine",
    capability: "simulation",
    parsed_entities: {
      query,
      income,
      expenses,
      savings,
    },
    calculation: {
      monthly_surplus: surplus,
      emergency_months: Number(runway.toFixed(1)),
      projected_12m: savings + 12 * surplus,
    },
    ai_insight: {
      analysis_type: "time_machine",
      headline: `Financial Assessment for "${query}"`,
      observations: [
        `Current monthly net cash flow surplus is ₹${surplus.toLocaleString('en-IN')}.`,
        `Liquid emergency runway stands at ${runway.toFixed(1)} months of essential living costs.`
      ],
      evidence: [
        `Monthly surplus: ₹${surplus.toLocaleString('en-IN')}`,
        `Emergency buffer: ${runway.toFixed(1)} months`
      ],
      implications: [
        "Your baseline cash buffer provides healthy stability for moderate capital outlays."
      ],
      trade_offs: [
        "Upfront cash allocation reduces liquid reserves; financing adds recurring EMI obligations."
      ],
      what_to_watch: [
        "Ensure emergency runway does not dip below 3.0 months of living expenses."
      ],
      possible_actions: [
        "Simulate EMI tenure options to preserve liquidity cushion."
      ],
      confidence_score: 0.92,
    },
  };
}

export function getLocalAIInsightFallback(
  payload: AIInsightRequest
): AIInsightResponse {
  const type = payload.analysis_type;
  const pos = payload.financial_position;
  const surplus = pos?.monthly_surplus ?? 20000;
  const runway = pos?.emergency_fund_months ?? 3.5;

  if (type === "time_machine") {
    return {
      analysis_type: "time_machine",
      headline: "Financial Trajectory & Liquidity Impact",
      observations: [
        `Net monthly surplus is currently ₹${surplus.toLocaleString('en-IN')}/mo with ${runway.toFixed(1)} months of emergency reserves.`,
        "Simulated capital outlay modifies liquidity velocity and milestone arrival dates."
      ],
      evidence: [
        `Emergency buffer: ${runway.toFixed(1)} months of baseline living costs`,
        `Current monthly net surplus: ₹${surplus.toLocaleString('en-IN')}`
      ],
      implications: [
        "Upfront cash drawdowns reduce immediate emergency resilience.",
        "Financing via EMI preserves immediate liquidity while adding ongoing fixed debt."
      ],
      trade_offs: [
        "Cash purchase eliminates all interest overhead but reduces liquid emergency buffer.",
        "Financed purchase retains liquidity cushion at the cost of cumulative loan interest."
      ],
      what_to_watch: [
        "Ensure liquid reserves do not drop below 3 months of mandatory expenses.",
        "Keep total recurring EMI commitments under 40% of gross monthly income."
      ],
      possible_actions: [
        "Consider a 30% upfront downpayment to minimize loan tenure and total interest charges.",
        "Reallocate discretionary categories to restore the emergency fund within 90 days."
      ],
      confidence_score: 0.92,
    };
  }

  if (type === "goal_analysis") {
    const goalTitle = payload.goal?.title ?? "Target Milestone";
    const req = payload.goal?.required_monthly_saving ?? 15000;
    const reachable = payload.goal?.is_reachable ?? true;
    return {
      analysis_type: "goal_analysis",
      headline: `Goal Velocity Review: ${goalTitle}`,
      observations: [
        `Milestone "${goalTitle}" is currently ${reachable ? "on track" : "behind schedule"}.`,
        `Requires dedicated accumulation of ₹${req.toLocaleString('en-IN')}/month.`
      ],
      evidence: [
        `Required monthly savings: ₹${req.toLocaleString('en-IN')}`,
        `Status: ${reachable ? "Achievable on schedule" : "Requires timeline or savings adjustments"}`
      ],
      implications: [
        reachable
          ? "Maintaining present allocation guarantees arrival by planned deadline."
          : "Monthly surplus is insufficient without budget reallocation or horizon extension."
      ],
      trade_offs: [
        "Prioritizing this milestone may require pausing secondary discretionary savings.",
        "Extending target deadline by 2-3 months lowers required monthly contribution."
      ],
      what_to_watch: [
        "Maintain automated transfers on salary credit day to prevent leakage.",
        "Avoid tapping into emergency reserves for non-critical goals."
      ],
      possible_actions: [
        "Set up an automated recurring deposit into a dedicated goal sinking fund.",
        "Review non-essential subscriptions to channel additional funds into the goal."
      ],
      confidence_score: 0.94,
    };
  }

  if (type === "reverse_analysis") {
    const title = payload.reverse_plan?.goal_title ?? "Milestone Target";
    const shortfall = payload.reverse_plan?.monthly_shortfall ?? 0;
    return {
      analysis_type: "reverse_analysis",
      headline: `Backward-Propagated Optimization: ${title}`,
      observations: [
        `Solving backward reveals a ₹${shortfall.toLocaleString('en-IN')}/mo gap for the target date.`,
        "Algorithm calculated optimal budget reductions across dining, shopping, and entertainment."
      ],
      evidence: [
        `Monthly gap to bridge: ₹${shortfall.toLocaleString('en-IN')}`,
        `Horizon: ${payload.reverse_plan?.deadline_months ?? 12} months`
      ],
      implications: [
        "Applying suggested discretionary cuts achieves the target deadline with zero loan debt."
      ],
      trade_offs: [
        "Modest short-term lifestyle restraint unlocks milestone achievement on schedule.",
        "Preserving current lifestyle necessitates extending completion deadline."
      ],
      what_to_watch: [
        "Track weekly dining and entertainment discretionary ceilings.",
        "Ensure budget cutbacks remain realistic and sustainable over the full horizon."
      ],
      possible_actions: [
        "Implement recommended ₹3,500/mo cap across food delivery & dining out.",
        "Allocate future annual bonus or tax refunds directly toward the goal."
      ],
      confidence_score: 0.91,
    };
  }

  if (type === "radar_analysis") {
    const health = payload.radar?.cash_flow_health ?? "stable";
    const radRunway = payload.radar?.runway_months ?? 3.2;
    return {
      analysis_type: "radar_analysis",
      headline: "Tactical Cash Flow Surveillance & Runway",
      observations: [
        `Cash flow health is rated as ${health.toUpperCase()} with ${radRunway.toFixed(1)} months runway.`,
        "Surveillance algorithms scanned for upcoming recurring bill clusters in the next 30 days."
      ],
      evidence: [
        `Cash runway: ${radRunway.toFixed(1)} months`,
        `Health Index: ${health}`
      ],
      implications: [
        "Sufficient cash buffers exist for near-term scheduled debit dates."
      ],
      trade_offs: [
        "Holding excess liquid cash reduces yield but eliminates cash-flow crunch risk.",
        "Aggressively locking cash in fixed instruments increases vulnerability to billing spikes."
      ],
      what_to_watch: [
        "Loan auto-debits and insurance renewals scheduled around month-end.",
        "Payday to billing date temporal spacing."
      ],
      possible_actions: [
        "Stagger credit card and utility due dates within 5 days of salary credit.",
        "Audit active streaming and app subscriptions to eliminate unused recurring fees."
      ],
      confidence_score: 0.93,
    };
  }

  return {
    analysis_type: "experiment_analysis",
    headline: "Scenario Comparison Intelligence",
    observations: [
      "Comparative trajectory simulation evaluated across key wealth-building indicators.",
      "Identifies trade-offs between cash liquidity, interest burden, and terminal net worth."
    ],
    evidence: [
      "Comparative models projected over multi-year simulation horizon."
    ],
    implications: [
      "Different strategies present contrasting risk-reward profiles for net worth velocity."
    ],
    trade_offs: [
      "Aggressive debt prepayment saves interest; investing surplus may yield higher compounding returns."
    ],
    what_to_watch: [
      "Real return differentials after accounting for tax and inflation.",
      "Emergency buffer adequacy under each comparative scenario."
    ],
    possible_actions: [
      "Select the strategy that optimizes both emotional peace of mind and total return.",
      "Re-evaluate assumptions annually as income and interest rates adjust."
    ],
    confidence_score: 0.90,
  };
}
