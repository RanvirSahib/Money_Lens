export type ScreenId = 'landing' | 'login' | 'dashboard' | 'simulator' | 'goals' | 'reverse' | 'radar' | 'lab' | 'profile' | 'spending' | 'statements';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  username?: string;
  avatar: string;
  role: string;
  monthlyIncome: number;
  monthlyExpenses: number;
  currentSavings: number;
  healthScore: number;
}

export interface DetailedFinancialProfile {
  id?: string;
  user_id?: string;
  name: string;
  monthly_income: number;
  essential_expenses: number;
  discretionary_expenses: number;
  current_savings: number;
  monthly_investments: number;
  active_emis: number;
  active_loans: number;
  other_recurring_expenses: number;
  total_monthly_expenses: number;
  monthly_surplus: number;
  savings_rate_pct: number;
  dti_ratio_pct: number;
  emergency_fund_runway_months: number;
  health_score: number;
}

export interface TrajectoryNode {
  label: string;
  monthIndex: number;
  baseline: number;
  scenario?: number;
  accelerated?: number;
  subtitle: string;
  isDivergence?: boolean;
  isPeak?: boolean;
}

export interface SimulationResult {
  query: string;
  decision: 'buy_now' | 'emi_active' | 'save_first' | 'wait_3m' | 'custom';
  cost: number;
  emiMonthly: number;
  tenureMonths: number;
  projectedSavings: number;
  baselineSavings: number;
  monthlyCashFlowDelta: number;
  goalLagMonths: number;
  potentialPressure: 'LOW' | 'MODERATE' | 'ELEVATED' | 'HIGH';
  stressIndex: number;
  notes: string;
  simHash: string;
}

export interface AdjustmentLever {
  id: string;
  title: string;
  description: string;
  monthlyImpact: number;
  lumpSumImpact?: number;
  color: 'emerald' | 'blue' | 'amber';
  applied: boolean;
}

export interface CashFlowItem {
  id: string;
  title: string;
  subtitle: string;
  amount: number;
  type: 'outflow' | 'inflow';
  category: 'emi' | 'housing' | 'insurance' | 'salary' | 'bonus' | 'discretionary';
  dueDays: number;
  statusText: string;
  icon: string;
}

export interface Goal {
  id: string;
  title: string;
  targetAmount: number;
  currentAmount: number;
  deadline: string;
  category: string;
  status: 'on_track' | 'at_risk' | 'accelerated';
  monthlyTarget: number;
}

export interface IntelligenceItem {
  step: string;
  label: string;
  content: string;
  highlight?: boolean;
}

export interface HealthVital {
  id: string;
  label: string;
  scoreText: string;
  percentage: number;
  color: 'emerald' | 'blue' | 'amber' | 'rose';
}

export interface CategorySpendingItem {
  category: string;
  total_amount: number;
  percentage_of_total: number;
  transaction_count: number;
  is_essential: boolean;
  is_recurring: boolean;
  period_change_pct?: number;
}

export interface SpendingObservation {
  type: string;
  title: string;
  summary: string;
  evidence: string;
  relevant_metrics: Record<string, any>;
  implication: string;
  possible_action: string;
}

export interface SpendingInsightsData {
  total_spending: number;
  essential_total: number;
  discretionary_total: number;
  essential_pct: number;
  discretionary_pct: number;
  recurring_total: number;
  weekend_spending: number;
  weekday_spending: number;
  weekend_pct: number;
  frequent_small_purchases_total: number;
  frequent_small_purchases_count: number;
  categories: CategorySpendingItem[];
  observations: SpendingObservation[];
}

export interface PendingActionPayload {
  action_type: 'UPDATE_PROFILE' | 'CREATE_GOAL' | 'NONE';
  title: string;
  description: string;
  data: Record<string, any>;
  confirmed?: boolean;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant' | 'system';
  text: string;
  timestamp: string;
  action_payload?: PendingActionPayload;
  evidence?: string;
  relevant_metrics?: Record<string, any>;
  suggested_followups?: string[];
}

export interface StatementSummary {
  statement_id: string;
  filename: string;
  save_raw: boolean;
  total_credits: number;
  total_debits: number;
  net_cashflow: number;
  transaction_count: number;
  date_range_start?: string;
  date_range_end?: string;
  category_breakdown: Record<string, number>;
  essential_spending: number;
  discretionary_spending: number;
  recurring_spending: number;
  observations: string[];
}

export interface DiscrepancyComparison {
  metric: string;
  profile_value: number;
  statement_value: number;
  variance: number;
  variance_pct: number;
  note: string;
  recommendation: string;
}
