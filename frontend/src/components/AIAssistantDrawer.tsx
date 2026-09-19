'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { fetchAIInsights } from '../lib/api/ai';
import { AIInsightResponse, AnalysisType } from '../types/ai';

interface AIAssistantDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyScenario?: (type: string, data: any) => void;
}

export const AIAssistantDrawer: React.FC<AIAssistantDrawerProps> = ({
  isOpen,
  onClose,
  onApplyScenario,
}) => {
  const { user } = useAuth();
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<AIInsightResponse | null>(null);

  const presetQueries = [
    'Can I afford an ₹80,000 phone on 12-month EMI?',
    'How to save ₹1,00,000 in 8 months for emergency safety?',
    'What happens to my runway if I take a 10% rent hike?',
    'Compare buying a car vs investing surplus in index funds',
  ];

  const handleSendQuery = async (queryText: string) => {
    if (!queryText.trim()) return;
    setLoading(true);
    setPrompt(queryText);

    // Parse intent
    const lower = queryText.toLowerCase();
    let mode: AnalysisType = 'time_machine';
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
          monthly_income: user.monthlyIncome,
          monthly_expenses: user.monthlyExpenses,
          current_savings: user.currentSavings,
          monthly_surplus: user.monthlyIncome - user.monthlyExpenses,
          emergency_fund_months:
            user.monthlyExpenses > 0
              ? Number((user.currentSavings / user.monthlyExpenses).toFixed(1))
              : 3.5,
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
                  <span className="font-bold text-slate-900">{user.name}</span>
                </div>
                <div className="font-mono text-slate-500">
                  ₹{user.monthlyIncome.toLocaleString('en-IN')}/mo (Surplus: ₹
                  {(user.monthlyIncome - user.monthlyExpenses).toLocaleString(
                    'en-IN'
                  )}
                  )
                </div>
              </div>

              {/* Preset Prompts (if no response yet) */}
              {!response && !loading && (
                <div className="space-y-3">
                  <p className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider">
                    // QUICK FINANCIAL INQUIRIES
                  </p>
                  <div className="space-y-2">
                    {presetQueries.map((q, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleSendQuery(q)}
                        className="w-full text-left p-3 rounded-xl border border-slate-200 hover:border-blue-300 bg-white hover:bg-blue-50/50 text-xs font-medium text-slate-700 transition-all shadow-2xs hover:shadow-xs cursor-pointer flex items-center justify-between group"
                      >
                        <span>{q}</span>
                        <span className="material-symbols-outlined text-slate-400 group-hover:text-blue-600 text-[18px] transition-transform group-hover:translate-x-1">
                          arrow_forward
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Loading State */}
              {loading && (
                <div className="p-6 rounded-2xl border border-blue-200 bg-blue-50/40 space-y-3 text-center animate-pulse">
                  <div className="size-10 rounded-full bg-blue-600 text-white flex items-center justify-center mx-auto">
                    <span className="material-symbols-outlined text-[20px] animate-spin">
                      progress_activity
                    </span>
                  </div>
                  <h4 className="font-display font-bold text-slate-900 text-sm">
                    Synthesizing Causal Financial Projections...
                  </h4>
                  <p className="text-xs text-slate-500">
                    Running reducing-balance loans, trajectory splines, and Groq LLM verification.
                  </p>
                </div>
              )}

              {/* AI Response Card */}
              {response && (
                <div className="space-y-4">
                  {/* Headline & Badge */}
                  <div className="p-4 rounded-2xl border border-blue-200 bg-gradient-to-br from-blue-50/80 via-white to-indigo-50/40 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-mono font-bold uppercase text-blue-700 bg-blue-100/70 px-2 py-0.5 rounded-md">
                        {response.analysis_type.replace('_', ' ')}
                      </span>
                      <span className="text-[11px] font-mono text-emerald-700 font-semibold bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md">
                        {(response.confidence_score * 100).toFixed(0)}% Confidence
                      </span>
                    </div>
                    <h4 className="font-display font-bold text-slate-900 text-base">
                      {response.headline}
                    </h4>
                  </div>

                  {/* Observations */}
                  <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 space-y-2">
                    <div className="text-[11px] font-mono font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-[14px]">
                        visibility
                      </span>
                      <span>KEY OBSERVATIONS</span>
                    </div>
                    <ul className="space-y-1.5 text-xs text-slate-700">
                      {response.observations.map((obs, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <span className="text-blue-600 font-bold">•</span>
                          <span>{obs}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Telemetric Evidence */}
                  <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 space-y-2">
                    <div className="text-[11px] font-mono font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-[14px]">
                        analytics
                      </span>
                      <span>TELEMETRIC EVIDENCE</span>
                    </div>
                    <ul className="space-y-1.5 text-xs text-slate-700">
                      {response.evidence.map((ev, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <span className="text-emerald-600 font-bold">✓</span>
                          <span>{ev}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Trade-offs & Implications */}
                  <div className="p-4 rounded-xl border border-amber-200 bg-amber-50/40 space-y-2">
                    <div className="text-[11px] font-mono font-bold text-amber-700 uppercase tracking-wider flex items-center gap-1.5">
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

                  {/* Possible Actions */}
                  <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50/40 space-y-2">
                    <div className="text-[11px] font-mono font-bold text-emerald-700 uppercase tracking-wider flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-[14px]">
                        bolt
                      </span>
                      <span>RECOMMENDED ACTIONS</span>
                    </div>
                    <ul className="space-y-1.5 text-xs text-slate-800">
                      {response.possible_actions.map((act, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <span className="text-emerald-700 font-bold">→</span>
                          <span>{act}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Ask Another Prompt button */}
                  <button
                    onClick={() => {
                      setResponse(null);
                      setPrompt('');
                    }}
                    className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-mono font-bold uppercase transition-colors cursor-pointer"
                  >
                    Ask Another Financial Decision
                  </button>
                </div>
              )}
            </div>

            {/* Input Bar */}
            <div className="p-4 border-t border-slate-200 bg-white">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendQuery(prompt);
                }}
                className="flex items-center gap-2"
              >
                <input
                  type="text"
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="Ask a financial question (e.g. Can I buy ₹60k laptop?)..."
                  className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 text-slate-800 placeholder-slate-400 bg-slate-50/60"
                />
                <button
                  type="submit"
                  disabled={loading || !prompt.trim()}
                  className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-xl text-xs font-mono font-bold uppercase transition-all shadow-xs cursor-pointer flex items-center gap-1 shrink-0"
                >
                  <span>Ask AI</span>
                  <span className="material-symbols-outlined text-[16px]">
                    send
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
