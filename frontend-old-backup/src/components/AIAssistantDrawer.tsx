'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { fetchAIInsights } from '../lib/api/ai';
import { AIInsightResponse, AnalysisType } from '../types/ai';

interface AIAssistantDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

const PRESET_QUERIES = [
  {
    title: 'Major Purchase Impact',
    prompt: 'How will buying a ₹75,000 laptop affect my 6-month runway and goal timeline?',
    icon: 'shopping_bag',
    mode: 'time_machine' as AnalysisType,
  },
  {
    title: 'Emergency Buffer Audit',
    prompt: 'Do I have enough runway buffer to withstand an unexpected ₹50,000 emergency?',
    icon: 'shield',
    mode: 'radar_analysis' as AnalysisType,
  },
  {
    title: 'Reverse Sinking Fund',
    prompt: 'How much do I need to save monthly to reach a ₹3,00,000 milestone in 12 months?',
    icon: 'history_toggle_off',
    mode: 'reverse_analysis' as AnalysisType,
  },
  {
    title: 'Cash vs EMI Dilemma',
    prompt: 'Compare upfront cash payment against a 12-month EMI at 12% interest.',
    icon: 'compare_arrows',
    mode: 'experiment_analysis' as AnalysisType,
  },
];

export const AIAssistantDrawer: React.FC<AIAssistantDrawerProps> = ({
  isOpen,
  onClose,
}) => {
  const { user } = useAuth();
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<AIInsightResponse | null>(null);

  const income = user?.monthlyIncome ?? 85000;
  const expenses = user?.monthlyExpenses ?? 35000;
  const savings = user?.currentSavings ?? 150000;
  const surplus = Math.max(0, income - expenses);
  const userName = user?.name ?? 'User';

  const handleRunAnalysis = async (queryText: string, forcedMode?: AnalysisType) => {
    if (!queryText.trim()) return;
    setLoading(true);
    setResponse(null);

    let mode: AnalysisType = forcedMode || 'time_machine';
    const lower = queryText.toLowerCase();
    if (lower.includes('goal') || lower.includes('save') || lower.includes('target')) {
      mode = 'goal_analysis';
    } else if (lower.includes('how to') || lower.includes('backward') || lower.includes('reach')) {
      mode = 'reverse_analysis';
    } else if (lower.includes('runway') || lower.includes('rent') || lower.includes('cash flow')) {
      mode = 'radar_analysis';
    } else if (lower.includes('compare') || lower.includes('vs') || lower.includes('invest')) {
      mode = 'experiment_analysis';
    }

    try {
      const res = await fetchAIInsights({
        analysis_type: mode,
        financial_position: {
          monthly_income: income,
          monthly_expenses: expenses,
          current_savings: savings,
          monthly_surplus: surplus,
          emergency_fund_months: expenses > 0 ? Number((savings / expenses).toFixed(1)) : 3.5,
        },
        context_note: queryText,
      });
      setResponse(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs cursor-pointer"
          />

          {/* Drawer Container */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 280 }}
            className="relative w-full max-w-lg bg-white h-full shadow-2xl z-10 flex flex-col border-l border-slate-200 overflow-hidden"
          >
            {/* Header */}
            <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-gradient-to-r from-blue-50/70 via-indigo-50/40 to-white">
              <div className="flex items-center gap-3">
                <div className="size-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-md shadow-blue-500/20">
                  <span className="material-symbols-outlined text-[22px]">
                    smart_toy
                  </span>
                </div>
                <div>
                  <h3 className="font-display font-bold text-slate-900 text-lg flex items-center gap-2">
                    MoneyLens AI Copilot
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-blue-100 text-blue-800 font-semibold uppercase">
                      Groq 120B
                    </span>
                  </h3>
                  <p className="text-xs text-slate-500">
                    Deterministic causal financial intelligence
                  </p>
                </div>
              </div>

              <button
                onClick={onClose}
                className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined text-[20px]">
                  close
                </span>
              </button>
            </div>

            {/* Conversation / Results Body */}
            <div className="flex-1 overflow-y-auto p-5 space-y-5">
              {/* Persona Context Card */}
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="font-medium text-slate-600">Active Profile:</span>
                  <span className="font-bold text-slate-900">{userName}</span>
                </div>
                <div className="font-mono text-slate-500">
                  ₹{income.toLocaleString('en-IN')}/mo (Surplus: ₹{surplus.toLocaleString('en-IN')})
                </div>
              </div>

              {/* Preset Prompts (if no response yet) */}
              {!response && !loading && (
                <div className="space-y-3">
                  <div className="text-xs font-mono font-semibold text-slate-400 uppercase tracking-wider">
                    RECOMMENDED FINANCIAL INQUIRIES
                  </div>
                  <div className="grid grid-cols-1 gap-2.5">
                    {PRESET_QUERIES.map((p, idx) => (
                      <button
                        key={idx}
                        onClick={() => {
                          setQuery(p.prompt);
                          handleRunAnalysis(p.prompt, p.mode);
                        }}
                        className="p-3.5 rounded-xl border border-slate-200 bg-white hover:border-blue-400 hover:bg-blue-50/30 transition-all text-left group shadow-xs cursor-pointer flex items-start gap-3"
                      >
                        <div className="size-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                          <span className="material-symbols-outlined text-[18px]">
                            {p.icon}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-semibold text-slate-800 group-hover:text-blue-700">
                            {p.title}
                          </div>
                          <div className="text-xs text-slate-500 line-clamp-2 mt-0.5">
                            {p.prompt}
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Loading State */}
              {loading && (
                <div className="py-12 flex flex-col items-center justify-center gap-4 text-center">
                  <div className="size-12 rounded-2xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600 animate-spin">
                    <span className="material-symbols-outlined text-[24px]">
                      progress_activity
                    </span>
                  </div>
                  <div>
                    <h4 className="font-display font-bold text-slate-900 text-sm">
                      Synthesizing Causal Financial Chains...
                    </h4>
                    <p className="text-xs text-slate-500 mt-1 max-w-xs">
                      Consulting deterministic engines across 12-month forward horizon.
                    </p>
                  </div>
                </div>
              )}

              {/* Response Display */}
              {response && !loading && (
                <div className="space-y-4 animate-in fade-in duration-300">
                  {/* Headline */}
                  <div className="p-4 rounded-xl bg-blue-50 border border-blue-200/80">
                    <div className="flex items-center gap-2 text-xs font-mono font-semibold text-blue-700 uppercase mb-1">
                      <span className="material-symbols-outlined text-[16px]">
                        psychology
                      </span>
                      <span>SYNTHESIZED INTELLIGENCE</span>
                    </div>
                    <h4 className="font-display font-bold text-slate-900 text-base leading-snug">
                      {response.headline}
                    </h4>
                  </div>

                  {/* Observations */}
                  <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs space-y-2">
                    <div className="text-xs font-mono font-semibold text-slate-500 uppercase flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-[14px]">
                        visibility
                      </span>
                      <span>KEY OBSERVATIONS</span>
                    </div>
                    <ul className="space-y-1.5 text-xs text-slate-700">
                      {response.observations.map((obs, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <span className="text-blue-500 font-bold">•</span>
                          <span>{obs}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Evidence */}
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 shadow-xs space-y-2">
                    <div className="text-xs font-mono font-semibold text-slate-500 uppercase flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-[14px]">
                        analytics
                      </span>
                      <span>TELEMETRIC EVIDENCE</span>
                    </div>
                    <ul className="space-y-1.5 text-xs text-slate-700">
                      {response.evidence.map((ev, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <span className="text-slate-400 font-mono">#</span>
                          <span>{ev}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Trade-offs / Implications */}
                  {response.trade_offs && response.trade_offs.length > 0 && (
                    <div className="p-4 rounded-xl bg-amber-50/60 border border-amber-200/80 shadow-xs space-y-2">
                      <div className="text-xs font-mono font-semibold text-amber-700 uppercase flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-[14px]">
                          balance
                        </span>
                        <span>TRADE-OFFS &amp; IMPLICATIONS</span>
                      </div>
                      <ul className="space-y-1.5 text-xs text-slate-800">
                        {response.trade_offs.map((to, i) => (
                          <li key={i} className="flex items-start gap-2">
                            <span className="text-amber-600 font-bold">⇄</span>
                            <span>{to}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Possible Actions */}
                  <div className="p-4 rounded-xl bg-emerald-50/60 border border-emerald-200/80 shadow-xs space-y-2">
                    <div className="text-xs font-mono font-semibold text-emerald-800 uppercase flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-[14px]">
                        bolt
                      </span>
                      <span>RECOMMENDED ADAPTIVE ACTIONS</span>
                    </div>
                    <ul className="space-y-1.5 text-xs text-slate-800">
                      {response.possible_actions.map((act, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <span className="text-emerald-600 font-bold">✓</span>
                          <span>{act}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
            </div>

            {/* Input Footer */}
            <div className="p-4 border-t border-slate-200 bg-slate-50/80">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleRunAnalysis(query);
                }}
                className="flex items-center gap-2"
              >
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Ask any financial decision query..."
                  className="flex-1 px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 shadow-xs"
                />
                <button
                  type="submit"
                  disabled={loading || !query.trim()}
                  className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-200 disabled:text-slate-400 text-white font-mono text-xs uppercase font-bold rounded-xl transition-colors shadow-xs cursor-pointer disabled:cursor-not-allowed flex items-center gap-1"
                >
                  <span>ASK</span>
                  <span className="material-symbols-outlined text-[16px]">
                    arrow_forward
                  </span>
                </button>
              </form>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
