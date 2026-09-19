'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AIQueryResponse, ParsedFinancialIntent } from '@/types/ai';
import { executeAIQuery, parseAIIntent } from '@/lib/api/ai';
import { formatINR, parseIndianCurrency } from '@/lib/utils/currency';
import { FinancialInsightCard } from './FinancialInsightCard';

interface NaturalLanguageDecisionInputProps {
  monthlyIncome?: number;
  monthlyExpenses?: number;
  currentSavings?: number;
  existingEmi?: number;
  onSimulationCompleted?: (result: AIQueryResponse) => void;
}

const EXAMPLE_SUGGESTIONS = [
  { label: '🚗 Buy ₹6 lakh car', query: 'I want to buy a 6 lakh car' },
  { label: '📱 Buy ₹70,000 phone', query: 'What happens if I buy a phone for ₹70,000?' },
  { label: '🎯 Save ₹5 lakh in 1 year', query: 'I want to save ₹5 lakh in one year' },
  { label: '💡 How much to save monthly for 5L', query: 'How much should I save every month to reach ₹5 lakh?' },
  { label: '⚖️ Buy car now vs wait 6 months', query: 'Compare buying this car now versus waiting 6 months' },
  { label: '🛡️ Check emergency runway', query: 'Do I have enough emergency savings?' },
  { label: '⚠️ Any financial risks?', query: 'Are there any financial problems coming up?' },
];

export const NaturalLanguageDecisionInput: React.FC<NaturalLanguageDecisionInputProps> = ({
  monthlyIncome = 80000,
  monthlyExpenses = 45000,
  currentSavings = 200000,
  existingEmi = 0,
  onSimulationCompleted,
}) => {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AIQueryResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [parsedPreview, setParsedPreview] = useState<{ amount: number | null; intentHint: string | null }>({
    amount: null,
    intentHint: null,
  });

  // Client-side quick intent & currency preview as user types
  useEffect(() => {
    if (!query.trim()) {
      setParsedPreview({ amount: null, intentHint: null });
      return;
    }

    const amount = parseIndianCurrency(query);
    const lower = query.toLowerCase();
    let hint = 'Time Machine Simulation';

    if (lower.includes('emergency') || lower.includes('risk') || lower.includes('problem') || lower.includes('runway')) {
      hint = 'Financial Radar Scan';
    } else if (lower.includes('compare') || lower.includes('vs') || lower.includes('versus')) {
      hint = 'Scenario Comparison';
    } else if (lower.includes('how much') && (lower.includes('save') || lower.includes('monthly'))) {
      hint = 'Reverse Goal Calculation';
    } else if (lower.includes('save') || lower.includes('goal') || lower.includes('target')) {
      hint = 'Goal Velocity Analysis';
    }

    setParsedPreview({ amount, intentHint: hint });
  }, [query]);

  const handleSubmit = async (e?: React.FormEvent, customQuery?: string) => {
    if (e) e.preventDefault();
    const queryToRun = (customQuery ?? query).trim();
    if (!queryToRun) return;

    setLoading(true);
    setError(null);

    try {
      const response = await executeAIQuery({
        query: queryToRun,
        monthly_income: monthlyIncome,
        monthly_expenses: monthlyExpenses,
        current_savings: currentSavings,
        existing_emi: existingEmi,
      });

      setResult(response);
      onSimulationCompleted?.(response);
    } catch (err: any) {
      setError(
        "Money Lens couldn't complete the analysis right now. Your financial data hasn't been changed."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSuggestionClick = (suggestedQuery: string) => {
    setQuery(suggestedQuery);
    handleSubmit(undefined, suggestedQuery);
  };

  return (
    <div className="space-y-6">
      {/* Search / Decision Planning Input Area */}
      <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-sm transition-all hover:border-slate-300">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
          <div>
            <h2 className="text-xl sm:text-2xl font-display font-bold text-slate-900 tracking-tight">
              What are you planning?
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 font-normal mt-0.5">
              Ask in plain English. Money Lens calculates the exact financial consequences before you decide.
            </p>
          </div>

          {parsedPreview.intentHint && query.trim() && (
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 border border-blue-200 text-blue-700 rounded-full text-xs font-mono font-medium self-start sm:self-center">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse" />
              <span>{parsedPreview.intentHint}</span>
              {parsedPreview.amount && (
                <span className="font-semibold text-blue-900 border-l border-blue-200 pl-2">
                  {formatINR(parsedPreview.amount)}
                </span>
              )}
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit} className="relative">
          <div className="relative flex items-center">
            <span className="absolute left-4 text-slate-400 material-symbols-outlined text-[22px] pointer-events-none">
              search
            </span>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Tell Money Lens what you're planning (e.g., 'I want to buy a 6 lakh car')..."
              className="w-full pl-12 pr-32 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 placeholder:text-slate-400 text-sm sm:text-base font-normal focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-all shadow-inner"
            />
            <button
              type="submit"
              disabled={loading || !query.trim()}
              className="absolute right-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-200 disabled:text-slate-400 text-white font-display text-xs sm:text-sm font-bold rounded-xl transition-all shadow-sm active:scale-95 cursor-pointer disabled:cursor-not-allowed flex items-center gap-1.5"
            >
              {loading ? (
                <>
                  <span className="material-symbols-outlined text-[16px] animate-spin">progress_activity</span>
                  <span>SIMULATING</span>
                </>
              ) : (
                <>
                  <span>EVALUATE</span>
                  <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                </>
              )}
            </button>
          </div>
        </form>

        {/* Suggestion Chips */}
        <div className="mt-4 pt-4 border-t border-slate-100">
          <div className="text-[11px] font-mono text-slate-400 uppercase tracking-wider mb-2 font-medium">
            Try a common financial scenario:
          </div>
          <div className="flex flex-wrap gap-2">
            {EXAMPLE_SUGGESTIONS.map((s, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSuggestionClick(s.query)}
                className="px-3 py-1.5 rounded-full bg-slate-100 hover:bg-blue-50 hover:text-blue-700 hover:border-blue-200 border border-transparent text-xs text-slate-600 font-medium transition-all duration-150 active:scale-95 cursor-pointer"
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Simulated AI Result Card */}
      <AnimatePresence mode="wait">
        {(result || loading || error) && (
          <FinancialInsightCard
            response={result}
            loading={loading}
            error={error}
            onRetry={() => handleSubmit()}
            onClose={() => setResult(null)}
            monthlyIncome={monthlyIncome}
            monthlyExpenses={monthlyExpenses}
            currentSavings={currentSavings}
          />
        )}
      </AnimatePresence>
    </div>
  );
};
