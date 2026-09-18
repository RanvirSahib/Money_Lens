'use client';

import React from 'react';
import { ReverseTimeMachine } from '../components/ReverseTimeMachine';
import { EvidenceIntelligence } from '../components/EvidenceIntelligence';
import { useAIInsights } from '../hooks/use-ai-insights';

interface ReverseScreenProps {
  savings?: number;
  income?: number;
  expenses?: number;
}

export const ReverseScreen: React.FC<ReverseScreenProps> = ({
  savings = 40000,
  income = 55000,
  expenses = 25000,
}) => {
  const targetGoal = 100000;
  const deadlineMonths = 12;
  const surplus = income - expenses;
  const requiredSaving = Math.round((targetGoal - savings) / deadlineMonths);
  const shortfall = Math.max(0, requiredSaving - surplus);

  const { insights, loading, refresh } = useAIInsights({
    analysis_type: 'reverse_analysis',
    reverse_plan: {
      goal_title: 'Emergency Safety Corpus',
      target_amount: targetGoal,
      deadline_months: deadlineMonths,
      required_monthly_saving: requiredSaving,
      current_monthly_surplus: surplus,
      monthly_shortfall: shortfall,
      is_feasible_without_changes: shortfall === 0,
    },
  });

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 lg:p-8 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono font-medium text-indigo-600 uppercase tracking-wider">
              <span className="material-symbols-outlined text-[18px]">
                history_toggle_off
              </span>
              <span>BACKWARD-PROPAGATION SOLVER</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-display font-bold text-slate-900 mt-1">
              Reverse Time Machine
            </h1>
            <p className="text-sm text-slate-600 mt-1">
              Select any target deadline and let our optimization engine solve the exact budget levers required.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs font-mono px-3 py-1.5 bg-indigo-50 border border-indigo-200 text-indigo-700 rounded-lg font-semibold">
              DYNAMIC SINKING FUND
            </span>
          </div>
        </div>
      </div>

      {/* Reverse Time Machine Main Solver Component */}
      <ReverseTimeMachine
        targetAmount={targetGoal}
        currentAmount={savings}
        monthlyIncome={income}
        monthlyExpenses={expenses}
        deadline="MARCH 2027"
      />

      {/* AI Intelligence Evidence Panel */}
      <EvidenceIntelligence
        insights={insights}
        loading={loading}
        onRefresh={refresh}
        title="BACKWARD-PROPAGATED AI INTELLIGENCE"
        subtitle="BUDGET REALLOCATION LEVERS"
      />
    </div>
  );
};
