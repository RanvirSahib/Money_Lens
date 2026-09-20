import { ProjectionPoint } from './financial';

export type FinancingType = 'buy_now' | 'emi' | 'save_first' | 'custom';

export interface SimulationRequest {
  title?: string;
  scenarioType: FinancingType;
  purchaseAmount: number;
  downPayment?: number;
  durationMonths?: number;
  interestRate?: number;
  notes?: string;
}

export interface SimulationResult {
  scenarioId: string;
  scenarioType: FinancingType;
  purchaseAmount: number;
  monthlyImpact: number;
  lowestProjectedBalance: number;
  goalDelayMonths: number;
  cashFlowPressureLevel: 'low' | 'medium' | 'high';
  aiRecommendation?: string;
  projection: ProjectionPoint[];
}

export interface ScenarioComparison {
  title: string;
  scenarios: SimulationResult[];
}
