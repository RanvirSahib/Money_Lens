export type AnalysisType =
  | "time_machine"
  | "goal_analysis"
  | "reverse_analysis"
  | "experiment_analysis"
  | "radar_analysis"
  | "clarification_needed";

export interface FinancialPositionPayload {
  monthly_income?: number;
  monthly_expenses?: number;
  existing_emi?: number;
  monthly_surplus?: number;
  savings_rate_pct?: number;
  current_savings?: number;
  emergency_fund_months?: number;
  projected_balance_3_months?: number;
  projected_balance_6_months?: number;
  projected_balance_12_months?: number;
}

export interface SimulationResultPayload {
  scenario?: string;
  data?: Record<string, any>;
}

export interface FinancialGoalPayload {
  title?: string;
  target_amount?: number;
  current_savings_allocated?: number;
  target_months?: number;
  required_monthly_saving?: number;
  monthly_gap_or_shortfall?: number;
  is_reachable?: boolean;
  projected_completion_months?: number;
  status?: string;
  status_description?: string;
}

export interface ReversePlanPayload {
  goal_title?: string;
  target_amount?: number;
  deadline_months?: number;
  required_monthly_saving?: number;
  current_monthly_surplus?: number;
  monthly_shortfall?: number;
  is_feasible_without_changes?: boolean;
  suggested_expense_cuts?: Array<Record<string, any>>;
  suggested_timeline_extension_months?: number;
  recommendations?: string[];
}

export interface RadarDataPayload {
  cash_flow_health?: string;
  runway_months?: number;
  recurring_expense_ratio_pct?: number;
  high_risk_alerts?: Array<Record<string, any>>;
  upcoming_expenses_30d?: Array<Record<string, any>>;
}

export interface AIInsightRequest {
  analysis_type: AnalysisType;
  financial_position?: FinancialPositionPayload;
  simulation_result?: SimulationResultPayload;
  goal?: FinancialGoalPayload;
  reverse_plan?: ReversePlanPayload;
  radar?: RadarDataPayload;
  context_note?: string;
}

export interface AIInsightResponse {
  analysis_type: AnalysisType;
  headline: string;
  summary?: string;
  observations: string[];
  evidence: string[];
  implications: string[];
  trade_offs?: string[];
  risks?: string[];
  what_to_watch?: string[];
  possible_actions: string[];
  confidence_score: number;
}

export interface ParsedFinancialIntent {
  intent: AnalysisType;
  raw_query: string;
  item?: string | null;
  amount?: number | null;
  timeline_months?: number | null;
  payment_method?: string | null;
  goal_title?: string | null;
  confidence_score: number;
  is_ambiguous: boolean;
  clarification_question?: string | null;
  extracted_entities?: Record<string, any>;
}

export interface AIQueryRequest {
  query: string;
  monthly_income?: number;
  monthly_expenses?: number;
  current_savings?: number;
  existing_emi?: number;
}

export interface AIQueryResponse {
  status: "success" | "clarification_needed" | "error";
  intent: string;
  capability: string;
  parsed_entities: Record<string, any>;
  calculation?: Record<string, any>;
  ai_insight?: AIInsightResponse;
  clarification_question?: string | null;
}
