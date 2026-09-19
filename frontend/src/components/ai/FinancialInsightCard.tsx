'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { AIInsightResponse, AIQueryResponse } from '@/types/ai';
import { formatINR, formatCompactINR } from '@/lib/utils/currency';

interface FinancialInsightCardProps {
  response?: AIQueryResponse | null;
  loading?: boolean;
  error?: string | null;
  onRetry?: () => void;
  onClose?: () => void;
  monthlyIncome?: number;
  monthlyExpenses?: number;
  currentSavings?: number;
}

export const FinancialInsightCard: React.FC<FinancialInsightCardProps> = ({
  response,
  loading = false,
  error = null,
  onRetry,
  onClose,
  monthlyIncome = 80000,
  monthlyExpenses = 45000,
  currentSavings = 200000,
}) => {
  if (loading) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200/90 p-6 sm:p-8 shadow-sm text-slate-800">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-9 h-9 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600">
            <span className="material-symbols-outlined text-[20px] animate-spin">progress_activity</span>
          </div>
          <div>
            <h3 className="text-base font-display font-bold text-slate-900">Simulating Decision Impact</h3>
            <p className="text-xs text-slate-500">Executing deterministic financial calculation & generating AI interpretation...</p>
          </div>
        </div>

        <div className="space-y-4 animate-pulse">
          <div className="h-4 bg-slate-100 rounded-lg w-3/4" />
          <div className="h-20 bg-slate-50 border border-slate-100 rounded-xl" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="h-24 bg-slate-50 border border-slate-100 rounded-xl" />
            <div className="h-24 bg-slate-50 border border-slate-100 rounded-xl" />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-2xl border border-rose-200 p-6 sm:p-8 shadow-sm">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-xl bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-600 shrink-0">
            <span className="material-symbols-outlined text-[22px]">info</span>
          </div>
          <div className="flex-1">
            <h3 className="text-base font-display font-bold text-slate-900">Analysis Notice</h3>
            <p className="text-sm text-slate-600 mt-1 leading-relaxed">{error}</p>
            <div className="mt-4 flex items-center gap-3">
              {onRetry && (
                <button
                  onClick={onRetry}
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer"
                >
                  Try Again
                </button>
              )}
              {onClose && (
                <button
                  onClick={onClose}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
                >
                  Dismiss
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!response) return null;

  if (response.status === 'clarification_needed') {
    return (
      <div className="bg-white rounded-2xl border border-amber-200 p-6 sm:p-8 shadow-sm">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600 shrink-0">
            <span className="material-symbols-outlined text-[22px]">help_outline</span>
          </div>
          <div className="flex-1">
            <h3 className="text-base font-display font-bold text-slate-900">Clarification Needed</h3>
            <p className="text-sm text-slate-700 mt-1 leading-relaxed">
              {response.clarification_question || "Could you provide more details on the purchase amount or timeframe?"}
            </p>
            {onClose && (
              <button
                onClick={onClose}
                className="mt-4 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
              >
                Close
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  const insight: AIInsightResponse | undefined = response.ai_insight;
  const calc = response.calculation || {};
  const cost = response.parsed_entities?.amount ?? response.parsed_entities?.purchase_amount ?? 0;
  const item = response.parsed_entities?.item ?? "Purchase";

  // Derive metrics safely
  const preSavings = currentSavings;
  const postSavings = calc.immediate_savings_after_purchase ?? calc.immediate_savings ?? Math.max(0, currentSavings - (cost || 0));
  const preRunway = monthlyExpenses > 0 ? (currentSavings / monthlyExpenses).toFixed(1) : "4.4";
  const postRunway = calc.post_purchase_emergency_runway_months ?? calc.post_emergency_runway_months ?? (monthlyExpenses > 0 ? (postSavings / monthlyExpenses).toFixed(1) : "2.0");
  const monthlySurplus = Math.max(0, monthlyIncome - monthlyExpenses);

  const observations = insight?.observations ?? [];
  const implications = insight?.implications ?? [];
  const risks = insight?.risks ?? [];
  const possibleActions = insight?.possible_actions ?? [];
  const evidence = insight?.evidence ?? [];

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
      className="bg-white rounded-3xl border border-slate-200/90 shadow-sm overflow-hidden"
    >
      {/* Header bar */}
      <div className="bg-slate-50/80 border-b border-slate-100 px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white shadow-sm">
            <span className="material-symbols-outlined text-[18px]">insights</span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-semibold uppercase tracking-wider text-blue-700">
                {response.capability || "Financial Decision Intelligence"}
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-medium">
                Verified Engine Result
              </span>
            </div>
            <h3 className="text-base sm:text-lg font-display font-bold text-slate-900 mt-0.5">
              {insight?.headline || `Simulation Impact: ${item}`}
            </h3>
          </div>
        </div>

        {onClose && (
          <button
            onClick={onClose}
            className="self-end sm:self-center text-slate-400 hover:text-slate-700 p-1.5 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
            title="Dismiss simulation"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        )}
      </div>

      <div className="p-6 sm:p-8 space-y-6">
        {/* Executive Summary */}
        <div className="p-4 sm:p-5 rounded-2xl bg-blue-50/60 border border-blue-100/90">
          <div className="text-xs font-mono font-semibold uppercase tracking-wider text-blue-800 mb-1 flex items-center gap-1.5">
            <span className="material-symbols-outlined text-[16px]">summarize</span>
            Executive Summary
          </div>
          <p className="text-sm sm:text-base text-slate-800 leading-relaxed font-normal">
            {insight?.summary || (
              cost > 0
                ? `Simulating this ₹${cost.toLocaleString('en-IN')} ${item} decision will adjust your liquid reserves from ₹${preSavings.toLocaleString('en-IN')} to ₹${postSavings.toLocaleString('en-IN')}, with emergency coverage shifting from ${preRunway} months to ${postRunway} months.`
                : "Simulation completed against your current cash flow profile and savings baseline."
            )}
          </p>
        </div>

        {/* Before vs After Impact Telemetry */}
        {cost > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
              <div className="text-xs font-mono text-slate-500 uppercase tracking-wider">Current Savings</div>
              <div className="text-xl sm:text-2xl font-display font-bold text-slate-900 mt-1">
                {formatINR(preSavings)}
              </div>
              <div className="text-xs text-slate-500 mt-1">Existing liquid buffer</div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
              <div className="text-xs font-mono text-slate-500 uppercase tracking-wider">After Decision</div>
              <div className="text-xl sm:text-2xl font-display font-bold text-blue-700 mt-1">
                {formatINR(postSavings)}
              </div>
              <div className="text-xs text-slate-500 mt-1">
                {cost > 0 ? `-₹${cost.toLocaleString('en-IN')} outlay` : 'Projected reserve'}
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
              <div className="text-xs font-mono text-slate-500 uppercase tracking-wider">Emergency Runway</div>
              <div className="text-xl sm:text-2xl font-display font-bold text-slate-900 mt-1 flex items-center gap-2">
                <span>{preRunway}m</span>
                <span className="text-slate-400 text-sm font-normal">→</span>
                <span className={Number(postRunway) < 3 ? 'text-amber-600' : 'text-emerald-700'}>
                  {postRunway}m
                </span>
              </div>
              <div className="text-xs text-slate-500 mt-1">Months of living expenses</div>
            </div>
          </div>
        )}

        {/* Structured 4-Section Financial Insight Matrix */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Section 1: What We Observed */}
          <div className="p-5 rounded-2xl border border-slate-200 bg-white">
            <div className="text-xs font-mono font-semibold uppercase tracking-wider text-slate-600 mb-2 flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[16px] text-blue-600">visibility</span>
              What We Observed
            </div>
            <ul className="space-y-2 text-sm text-slate-700">
              {observations.length > 0 ? (
                observations.map((obs, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-blue-500 mt-1">•</span>
                    <span>{obs}</span>
                  </li>
                ))
              ) : (
                <li className="text-slate-500 text-xs">Simulated trajectory models baseline cash flow resilience.</li>
              )}
            </ul>
          </div>

          {/* Section 2: Why It Matters (Implications) */}
          <div className="p-5 rounded-2xl border border-slate-200 bg-white">
            <div className="text-xs font-mono font-semibold uppercase tracking-wider text-slate-600 mb-2 flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[16px] text-indigo-600">psychology</span>
              Why It Matters
            </div>
            <ul className="space-y-2 text-sm text-slate-700">
              {implications.length > 0 ? (
                implications.map((imp, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-indigo-500 mt-1">•</span>
                    <span>{imp}</span>
                  </li>
                ))
              ) : (
                <li className="text-slate-500 text-xs">
                  Your monthly cash flow remains positive at ₹{monthlySurplus.toLocaleString('en-IN')}/mo.
                </li>
              )}
            </ul>
          </div>

          {/* Section 3: Financial Risks & Watchouts */}
          <div className="p-5 rounded-2xl border border-amber-200 bg-amber-50/30">
            <div className="text-xs font-mono font-semibold uppercase tracking-wider text-amber-800 mb-2 flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[16px] text-amber-600">warning_amber</span>
              Financial Risks & Factors
            </div>
            <ul className="space-y-2 text-sm text-slate-800">
              {risks.length > 0 ? (
                risks.map((risk, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-amber-600 mt-1">•</span>
                    <span>{risk}</span>
                  </li>
                ))
              ) : (
                <li className="text-slate-600 text-xs">
                  {Number(postRunway) < 3
                    ? "Emergency runway falls below recommended 3 months buffer."
                    : "No high-severity liquidity risks detected for this scenario."}
                </li>
              )}
            </ul>
          </div>

          {/* Section 4: Possible Actions (Non-Prescriptive) */}
          <div className="p-5 rounded-2xl border border-emerald-200 bg-emerald-50/30">
            <div className="text-xs font-mono font-semibold uppercase tracking-wider text-emerald-800 mb-2 flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[16px] text-emerald-600">lightbulb</span>
              Possible Next Steps
            </div>
            <ul className="space-y-2 text-sm text-slate-800">
              {possibleActions.length > 0 ? (
                possibleActions.map((act, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-emerald-600 mt-1">•</span>
                    <span>{act}</span>
                  </li>
                ))
              ) : (
                <>
                  <li className="flex items-start gap-2">
                    <span className="text-emerald-600 mt-1">•</span>
                    <span>One possible approach is to compare an EMI scenario to preserve liquid cash.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-emerald-600 mt-1">•</span>
                    <span>You could also evaluate building a dedicated sinking fund over 3-6 months.</span>
                  </li>
                </>
              )}
            </ul>
          </div>
        </div>

        {/* Evidence & Deterministic Facts */}
        {evidence.length > 0 && (
          <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center gap-2 text-xs font-mono text-slate-500">
            <span className="font-semibold text-slate-700">Engine Evidence:</span>
            {evidence.map((ev, idx) => (
              <span key={idx} className="bg-slate-100 px-2.5 py-1 rounded-md text-slate-700">
                {ev}
              </span>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
};
