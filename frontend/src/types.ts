export type ScreenId = 'dashboard' | 'simulator' | 'goals' | 'reverse' | 'radar' | 'lab';

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
