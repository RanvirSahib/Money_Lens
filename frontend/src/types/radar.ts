export interface RadarEvent {
  id: string;
  title: string;
  amount: number;
  type: 'income' | 'recurring_expense' | 'due_payment' | 'subscription';
  dueDate: string;        // e.g. '2026-10-01'
  daysRemaining: number;
  isCritical?: boolean;
  category?: string;
}

export interface CashFlowAlert {
  id: string;
  severity: 'info' | 'warning' | 'critical';
  title: string;
  description: string;
  estimatedWindow: string; // e.g. 'Oct 10 - Oct 15'
}

export interface RadarData {
  upcomingEvents: RadarEvent[];
  alerts: CashFlowAlert[];
  pressureIndex: number; // 0 - 100
}
