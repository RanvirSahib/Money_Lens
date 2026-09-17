export type CurrencyAmount = number;

export type ImpactTone = "positive" | "warning" | "danger" | "neutral";

export type ScenarioType = "buy_now" | "emi" | "save_first" | "custom";

export interface FinancialSummary {
  currentSavings: CurrencyAmount;
  monthlyIncome: CurrencyAmount;
  monthlyExpenses: CurrencyAmount;
  activeGoals: number;
  sampleDataLabel: string;
}

export interface ProjectionPoint {
  month: string;
  income: CurrencyAmount;
  expenses: CurrencyAmount;
  additionalPayment: CurrencyAmount;
  savings: CurrencyAmount;
  balance: CurrencyAmount;
  milestone?: string;
  cashFlowStatus: "healthy" | "watch" | "pressure";
}

export interface Transaction {
  id: string;
  date: string;
  description: string;
  merchant: string;
  category: string;
  amount: CurrencyAmount;
  type: "income" | "expense";
}

export interface Goal {
  id: string;
  name: string;
  targetAmount: CurrencyAmount;
  currentAmount: CurrencyAmount;
  targetDate: string;
  progressPercent: number;
  requiredMonthlyContribution: CurrencyAmount;
  status: "on_track" | "attention" | "at_risk";
  possibleImpact?: string;
}

export interface GoalCreateRequest {
  name: string;
  targetAmount: CurrencyAmount;
  currentAmount: CurrencyAmount;
  targetDate: string;
  monthlyContribution?: CurrencyAmount;
}

export interface GoalUpdateRequest extends Partial<GoalCreateRequest> {
  id: string;
}

export interface RadarEvent {
  id: string;
  date: string;
  description: string;
  amount: CurrencyAmount;
  category: string;
  type: "income" | "expense";
  status: string;
  severity: ImpactTone;
  daysAway: number;
}

export interface RadarAlert {
  id: string;
  title: string;
  description: string;
  severity: ImpactTone;
}

export interface ScenarioParameters {
  purchaseAmount?: CurrencyAmount;
  durationMonths?: number;
  interestRate?: number;
  additionalIncome?: CurrencyAmount;
  additionalExpense?: CurrencyAmount;
  optionalEvent?: string;
}

export interface SimulationRequest {
  prompt: string;
  scenarioType: ScenarioType;
  parameters: ScenarioParameters;
}

export interface SimulationMetric {
  label: string;
  value: string;
  helper: string;
  tone: ImpactTone;
}

export interface ScenarioSummary {
  id: string;
  type: ScenarioType;
  title: string;
  description: string;
  projectedBalance: CurrencyAmount;
  lowestProjectedBalance: CurrencyAmount;
  monthlyImpact: string;
  goalImpact: string;
  timeline: string;
  tone: ImpactTone;
}

export interface ComparisonPoint {
  month: string;
  buyNow: CurrencyAmount;
  emi: CurrencyAmount;
  saveFirst: CurrencyAmount;
}

export interface SimulationResult {
  id: string;
  inputSummary: string;
  metrics: SimulationMetric[];
  projection: ProjectionPoint[];
  comparison: ComparisonPoint[];
  scenarios: ScenarioSummary[];
  insight: string;
}

export interface ReverseRequest {
  targetAmount: CurrencyAmount;
  currentSavings: CurrencyAmount;
  targetDate: string;
}

export interface FinancialLever {
  id: string;
  title: string;
  description: string;
  monthlyEffect: string;
  tone: ImpactTone;
}

export interface ReverseResult {
  targetLabel: string;
  remainingAmount: CurrencyAmount;
  requiredMonthlySaving: CurrencyAmount;
  timeline: string;
  levers: FinancialLever[];
  projection: ProjectionPoint[];
}

export interface ExperimentScenario {
  id: string;
  name: string;
  scenarioType: ScenarioType;
  summary: string;
  inputs: string[];
}

export interface ExperimentRequest {
  scenarios: ExperimentScenario[];
}

export interface ExperimentResult {
  id: string;
  scenarios: ScenarioSummary[];
  comparison: ComparisonPoint[];
  differences: string[];
  note: string;
}

export interface DashboardResponse {
  greeting: string;
  summary: FinancialSummary;
  projection: ProjectionPoint[];
  quickInsights: string[];
  goals: Goal[];
  radar: RadarEvent[];
  transactions: Transaction[];
}

export interface RadarResponse {
  events: RadarEvent[];
  alerts: RadarAlert[];
}

export interface ApiErrorShape {
  message: string;
  status?: number;
}
