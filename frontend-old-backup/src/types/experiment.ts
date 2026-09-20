import { ProjectionPoint } from './financial';

export interface ExperimentScenario {
  id: string;
  name: string;
  salary: number;
  monthlyExpenses: number;
  majorPurchase?: number;
  purchaseTiming?: string;
  hasBonus?: boolean;
  bonusAmount?: number;
  projection: ProjectionPoint[];
}

export interface Experiment {
  id: string;
  title: string;
  createdAt: string;
  scenarios: ExperimentScenario[];
}
