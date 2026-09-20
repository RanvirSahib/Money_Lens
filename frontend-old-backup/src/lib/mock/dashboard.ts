import { FinancialSummary, TrajectoryData } from '@/types/financial';
import { Goal } from '@/types/goal';
import { RadarData } from '@/types/radar';

export interface DashboardData {
  summary: FinancialSummary;
  trajectory: TrajectoryData;
  goals: Goal[];
  radar: RadarData;
}

export const MOCK_DASHBOARD_DATA: DashboardData = {
  summary: {
    currentSavings: 40000,
    monthlyIncome: 55000,
    monthlyExpenses: 25000,
    activeGoals: 2,
    netSavingsRate: 54.5,
    savingsChangeMonthOverMonth: 8.2,
  },
  trajectory: {
    baselineProjection: [
      { month: 'Oct 2026', income: 55000, expenses: 25000, savings: 30000, balance: 70000 },
      { month: 'Nov 2026', income: 55000, expenses: 25000, savings: 30000, balance: 100000 },
      { month: 'Dec 2026', income: 65000, expenses: 28000, savings: 37000, balance: 137000 }, // festival / bonus
      { month: 'Jan 2027', income: 55000, expenses: 25000, savings: 30000, balance: 167000 },
      { month: 'Feb 2027', income: 55000, expenses: 25000, savings: 30000, balance: 197000 },
      { month: 'Mar 2027', income: 60000, expenses: 26000, savings: 34000, balance: 231000 },
      { month: 'Apr 2027', income: 60000, expenses: 26000, savings: 34000, balance: 265000 },
      { month: 'May 2027', income: 60000, expenses: 26000, savings: 34000, balance: 299000 },
      { month: 'Jun 2027', income: 60000, expenses: 26000, savings: 34000, balance: 333000 },
      { month: 'Jul 2027', income: 60000, expenses: 26000, savings: 34000, balance: 367000 },
      { month: 'Aug 2027', income: 60000, expenses: 26000, savings: 34000, balance: 401000 },
      { month: 'Sep 2027', income: 60000, expenses: 26000, savings: 34000, balance: 435000 },
    ],
    milestones: [
      { month: 'Dec 2026', title: 'Target: New Phone Goal', amount: 70000, type: 'goal' },
      { month: 'Mar 2027', title: 'Expected Appraisal (+₹5k)', amount: 60000, type: 'income_hike' },
      { month: 'Jun 2027', title: 'Target: Emergency Fund Goal', amount: 100000, type: 'goal' },
    ],
  },
  goals: [
    {
      id: 'g-1',
      name: 'New Phone (Flagship)',
      category: 'purchase',
      targetAmount: 70000,
      currentAmount: 40000,
      targetDate: '2026-12-31',
      monthlyAllocation: 10000,
      isCompleted: false,
      priority: 'high',
    },
    {
      id: 'g-2',
      name: 'Emergency Fund',
      category: 'emergency_fund',
      targetAmount: 100000,
      currentAmount: 20000,
      targetDate: '2027-06-30',
      monthlyAllocation: 8000,
      isCompleted: false,
      priority: 'high',
    },
  ],
  radar: {
    pressureIndex: 28,
    upcomingEvents: [
      {
        id: 'r-1',
        title: 'Upcoming House Rent',
        amount: 15000,
        type: 'recurring_expense',
        dueDate: '2026-10-01',
        daysRemaining: 5,
        isCritical: true,
        category: 'Housing',
      },
      {
        id: 'r-2',
        title: 'Cloud & App Subscriptions',
        amount: 1899,
        type: 'subscription',
        dueDate: '2026-10-04',
        daysRemaining: 8,
        category: 'Digital',
      },
      {
        id: 'r-3',
        title: 'Expected Salary Credit',
        amount: 55000,
        type: 'income',
        dueDate: '2026-10-01',
        daysRemaining: 5,
        category: 'Salary',
      },
      {
        id: 'r-4',
        title: 'Internet & Utility Bills',
        amount: 2400,
        type: 'due_payment',
        dueDate: '2026-10-10',
        daysRemaining: 14,
        category: 'Utilities',
      },
    ],
    alerts: [
      {
        id: 'a-1',
        severity: 'warning',
        title: 'Potential cash-flow pressure',
        description:
          'Your projected balance may briefly drop before monthly salary is credited due to clustered beginning-of-month payments.',
        estimatedWindow: 'Oct 01 - Oct 05',
      },
    ],
  },
};
