'use client';

import React, { useState } from 'react';
import { AIInsightResponse } from '@/types/ai';

interface EvidenceIntelligenceProps {
  insights?: AIInsightResponse;
  loading?: boolean;
  onRefresh?: () => void;
  onEngageCeiling?: () => void;
  title?: string;
  subtitle?: string;
}

export const EvidenceIntelligence: React.FC<EvidenceIntelligenceProps> = ({
  insights,
  loading = false,
  onRefresh,
  onEngageCeiling,
  title = "EVIDENCE-BASED FINANCIAL INTELLIGENCE",
  subtitle = "AUTOMATED CAUSAL CHAIN",
}) => {
  const [actionEngaged, setActionEngaged] = useState(false);

  const headline = insights?.headline || "Financial Trajectory & Causal Intelligence";
  const observations = insights?.observations || [
    "Discretionary spending increased by 18% over prior period",
    "Net surplus growth pace slightly decelerated"
  ];
  const evidence = insights?.evidence || [
    "Dining & gadgets tracked from ₹7,200/mo → ₹8,500/mo over 60 days",
    "Liquid emergency runway at 3.2 months"
  ];
  const implications = insights?.implications || [
    "Milestone arrival trajectory extends outward by 45 days"
  ];
  const tradeOffs = insights?.trade_offs || [
    "Preserving current discretionary spending delays milestone targets."
  ];
  const possibleActions = insights?.possible_actions || [
    "Apply discretionary budget ceiling of ₹7,500/mo"
  ];

  const handleEngage = () => {
    setActionEngaged(true);
    onEngageCeiling?.();
  };

  return (
    <section className="bg-white rounded-2xl border border-slate-200 p-6 lg:p-8 shadow-sm shadow-slate-200/50 relative overflow-hidden">
      {/* Top Banner & Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 pb-4 mb-6 gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600">
            <span className="material-symbols-outlined text-[20px]">
              psychology
            </span>
          </div>
          <div>
            <h4 className="text-base sm:text-lg font-display font-bold text-slate-900 tracking-tight">
              {title}
            </h4>
            <p className="text-xs text-slate-500 font-medium">{headline}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {loading && (
            <span className="inline-flex items-center gap-1.5 text-xs font-mono font-medium text-amber-600 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200">
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping"></span>
              SYNTHESIZING...
            </span>
          )}
          {insights?.confidence_score && (
            <span className="text-[11px] font-mono font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200">
              {(insights.confidence_score * 100).toFixed(0)}% CONFIDENCE
            </span>
          )}
          <span className="text-xs font-mono font-semibold text-blue-600 tracking-wider">
            {subtitle}
          </span>
          {onRefresh && (
            <button
              onClick={onRefresh}
              disabled={loading}
              className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
              title="Refresh AI Insights"
            >
              <span className={`material-symbols-outlined text-[18px] ${loading ? "animate-spin text-blue-600" : ""}`}>
                refresh
              </span>
            </button>
          )}
        </div>
      </div>

      {/* 4-Column Causal Matrix */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-stretch">
        {/* Step 1: Observation */}
        <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/70 flex flex-col justify-between hover:border-slate-300 transition-colors">
          <div>
            <div className="text-[11px] font-mono font-semibold text-slate-400 uppercase mb-2 flex items-center justify-between">
              <span>01 // OBSERVATION</span>
              <span className="material-symbols-outlined text-[14px] text-slate-400">visibility</span>
            </div>
            <p className="text-sm font-medium text-slate-800 leading-snug">
              {observations[0]}
            </p>
          </div>
          {observations[1] && (
            <p className="text-xs text-slate-500 mt-3 pt-2 border-t border-slate-200/60 line-clamp-2">
              {observations[1]}
            </p>
          )}
        </div>

        {/* Step 2: Telemetric Evidence */}
        <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/70 flex flex-col justify-between hover:border-slate-300 transition-colors">
          <div>
            <div className="text-[11px] font-mono font-semibold text-slate-400 uppercase mb-2 flex items-center justify-between">
              <span>02 // EVIDENCE</span>
              <span className="material-symbols-outlined text-[14px] text-slate-400">analytics</span>
            </div>
            <p className="text-sm text-slate-700 leading-snug">
              {evidence[0]}
            </p>
          </div>
          {evidence[1] && (
            <p className="text-xs text-slate-500 mt-3 pt-2 border-t border-slate-200/60 line-clamp-2">
              {evidence[1]}
            </p>
          )}
        </div>

        {/* Step 3: Simulated Divergence & Trade-offs */}
        <div className="p-4 rounded-xl border border-rose-200 bg-rose-50/40 flex flex-col justify-between hover:border-rose-300 transition-colors">
          <div>
            <div className="text-[11px] font-mono font-semibold text-rose-500 uppercase mb-2 flex items-center justify-between">
              <span>03 // IMPLICATIONS</span>
              <span className="material-symbols-outlined text-[14px] text-rose-500">trending_down</span>
            </div>
            <p className="text-sm font-medium text-rose-800 leading-snug">
              {implications[0] || tradeOffs[0]}
            </p>
          </div>
          {tradeOffs[0] && implications[0] && (
            <p className="text-xs text-rose-700/80 mt-3 pt-2 border-t border-rose-200/60 line-clamp-2">
              Trade-off: {tradeOffs[0]}
            </p>
          )}
        </div>

        {/* Step 4: Recovery Vector & Recommended Action */}
        <div
          className={`p-4 rounded-xl border-2 flex flex-col justify-between transition-all ${
            actionEngaged
              ? 'border-emerald-600 bg-emerald-50/50 shadow-sm'
              : 'border-blue-600 bg-blue-50/40 shadow-sm'
          }`}
        >
          <div>
            <div
              className={`text-[11px] font-mono font-bold uppercase mb-1 flex items-center justify-between ${
                actionEngaged ? 'text-emerald-700' : 'text-blue-600'
              }`}
            >
              <span>04 // RECOVERY VECTOR</span>
              <span className="material-symbols-outlined text-[14px]">
                {actionEngaged ? 'check_circle' : 'bolt'}
              </span>
            </div>
            <p className="text-xs font-medium text-slate-800 leading-snug">
              {actionEngaged
                ? 'Recommendation acknowledged & operational constraint locked.'
                : (possibleActions[0] || 'Apply recommended budget adjustments.')}
            </p>
          </div>
          <button
            onClick={handleEngage}
            disabled={actionEngaged}
            className={`mt-3 w-full py-2 font-mono font-bold uppercase tracking-wider text-xs rounded-lg transition-all shadow-sm cursor-pointer ${
              actionEngaged
                ? 'bg-emerald-600 text-white cursor-default'
                : 'bg-blue-600 text-white hover:bg-blue-700 active:scale-95'
            }`}
          >
            {actionEngaged ? 'OPTIMIZATION LOCKED' : 'ENGAGE RECOVERY'}
          </button>
        </div>
      </div>
    </section>
  );
};
