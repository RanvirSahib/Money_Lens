'use client';

import React from 'react';
import { FinancialRadar } from '../components/FinancialRadar';
import { EvidenceIntelligence } from '../components/EvidenceIntelligence';
import { useAIInsights } from '../hooks/use-ai-insights';

interface RadarScreenProps {
  savings?: number;
  income?: number;
  expenses?: number;
}

export const RadarScreen: React.FC<RadarScreenProps> = ({
  savings = 40000,
  income = 55000,
  expenses = 25000,
}) => {
  const runway = expenses > 0 ? Number((savings / expenses).toFixed(1)) : 3.0;

  const { insights, loading, refresh } = useAIInsights({
    analysis_type: 'radar_analysis',
    radar: {
      cash_flow_health: runway >= 2.0 ? 'stable' : 'warning',
      runway_months: runway,
      recurring_expense_ratio_pct: 35.0,
    },
  });

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 lg:p-8 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono font-medium text-amber-600 uppercase tracking-wider">
              <span className="material-symbols-outlined text-[18px]">
                radar
              </span>
              <span>SURVEILLANCE &amp; LIQUIDITY RADAR</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-display font-bold text-slate-900 mt-1">
              Financial Radar &amp; Cash Flow Telemetry
            </h1>
            <p className="text-sm text-slate-600 mt-1">
              Detect upcoming liquidity troughs, recurring expense burdens, and protect cash runway buffers.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs font-mono px-3 py-1.5 bg-amber-50 border border-amber-200 text-amber-700 rounded-lg font-semibold">
              30-DAY TELEMETRIC HORIZON
            </span>
          </div>
        </div>
      </div>

      {/* Main Radar Component */}
      <FinancialRadar
        currentSavings={savings}
        monthlyIncome={income}
        monthlyExpenses={expenses}
      />

      {/* AI Intelligence Evidence Panel */}
      <EvidenceIntelligence
        insights={insights}
        loading={loading}
        onRefresh={refresh}
        title="CASH FLOW RADAR AI SURVEILLANCE"
        subtitle="LIQUIDITY SHORTAGE PREVENTATIVE INTELLIGENCE"
      />
    </div>
  );
};
