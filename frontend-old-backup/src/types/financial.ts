export interface FinancialSummary {
  currentSavings: number;
  monthlyIncome: number;
  monthlyExpenses: number;
  activeGoals: number;
  netSavingsRate: number; // percentage e.g. 54.5%
  savingsChangeMonthOverMonth: number; // percentage change e.g. +8.2%
}

export interface ProjectionPoint {
  month: string;          // e.g. 'Oct 2026' or '2026-10'
  income: number;
  expenses: number;
  savings: number;
  balance: number;
  isBaseline?: boolean;
}

export interface TrajectoryData {
  baselineProjection: ProjectionPoint[];
  milestones: {
    month: string;
    title: string;
    amount: number;
    type: 'goal' | 'income_hike' | 'expense_peak';
  }[];
}
