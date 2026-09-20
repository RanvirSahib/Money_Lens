export interface Goal {
  id: string;
  name: string;
  category: 'purchase' | 'emergency_fund' | 'travel' | 'investment' | 'other';
  targetAmount: number;
  currentAmount: number;
  targetDate: string;     // ISO format 'YYYY-MM-DD' or 'Month YYYY'
  monthlyAllocation: number;
  isCompleted: boolean;
  priority: 'high' | 'medium' | 'low';
}

export interface CreateGoalRequest {
  name: string;
  category: string;
  targetAmount: number;
  currentAmount: number;
  targetDate: string;
  monthlyAllocation?: number;
}
