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
  title = "Evidence-Based Financial Intelligence",
  subtitle = "Deterministic Causal Reasoning",
}) => {
  const [actionAcknowledged, setActionAcknowledged] = useState(false);

  const headline = insights?.headline || "Cash Flow Trajectory & Causal Intelligence";
  const observations = insights?.observations || [
    "Monthly surplus remains positive with consistent savings allocation",
    "Discretionary spending is well-aligned with baseline living targets"
  ];
  const evidence = insights?.evidence || [
    "Monthly cash surplus verified at current rate",
    "Liquid emergency runway at 4.4 months"
  ];
  const implications = insights?.implications || [
    "Current savings trajectory supports hitting target milestones within estimated timeframe."
  ];
  const tradeOffs = insights?.trade_offs || [
    "Maintaining high cash reserves preserves liquidity but yields lower compounding returns."
  ];
  const possibleActions = insights?.possible_actions || [
    "Consider automating a monthly transfer to dedicated goal sinking funds."
  ];

  const handleAction = () => {
    setActionAcknowledged(true);
    onEngageCeiling?.();
  };

  return (
    <section className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-sm">
      {/* Top Banner & Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 pb-4 mb-6 gap-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600">
            <span className="material-symbols-outlined text-[20px]">psychology</span>
          </div>
          <div>
            <h4 className="text-base sm:text-lg font-display font-bold text-slate-900">
              {title}
            </h4>
            <p className="text-xs text-slate-500 font-normal">{headline}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {loading && (
            <span className="inline-flex items-center gap-1.5 text-xs font-mono font-medium text-amber-700 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200">
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
              Synthesizing...
            </span>
          )}
          {insights?.confidence_score && (
            <span className="text-xs font-semibold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
              {(insights.confidence_score * 100).toFixed(0)}% Confidence
            </span>
          )}
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
        <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50/70 flex flex-col justify-between hover:bg-white hover:border-slate-300 transition-all">
          <div>
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 flex items-center justify-between">
              <span>01 // Observation</span>
              <span className="material-symbols-outlined text-[16px] text-blue-600">visibility</span>
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

        {/* Step 2: Evidence */}
        <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50/70 flex flex-col justify-between hover:bg-white hover:border-slate-300 transition-all">
          <div>
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 flex items-center justify-between">
              <span>02 // Engine Evidence</span>
              <span className="material-symbols-outlined text-[16px] text-slate-600">analytics</span>
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

        {/* Step 3: Implications */}
        <div className="p-4 rounded-2xl border border-indigo-100 bg-indigo-50/40 flex flex-col justify-between hover:border-indigo-200 transition-all">
          <div>
            <div className="text-xs font-semibold text-indigo-700 uppercase tracking-wider mb-2 flex items-center justify-between">
              <span>03 // Implications</span>
              <span className="material-symbols-outlined text-[16px] text-indigo-600">trending_up</span>
            </div>
            <p className="text-sm font-medium text-slate-800 leading-snug">
              {implications[0] || tradeOffs[0]}
            </p>
          </div>
          {tradeOffs[0] && implications[0] && (
            <p className="text-xs text-slate-600 mt-3 pt-2 border-t border-indigo-100 line-clamp-2">
              Trade-off: {tradeOffs[0]}
            </p>
          )}
        </div>

        {/* Step 4: Possible Actions */}
        <div
          className={`p-4 rounded-2xl border transition-all flex flex-col justify-between ${
            actionAcknowledged
              ? 'border-emerald-300 bg-emerald-50/50 shadow-sm'
              : 'border-blue-200 bg-blue-50/40 shadow-sm'
          }`}
        >
          <div>
            <div
              className={`text-xs font-semibold uppercase tracking-wider mb-1 flex items-center justify-between ${
                actionAcknowledged ? 'text-emerald-800' : 'text-blue-800'
              }`}
            >
              <span>04 // Possible Next Steps</span>
              <span className="material-symbols-outlined text-[16px]">
                {actionAcknowledged ? 'check_circle' : 'lightbulb'}
              </span>
            </div>
            <p className="text-xs font-medium text-slate-800 leading-snug">
              {actionAcknowledged
                ? 'Action acknowledged for financial review.'
                : (possibleActions[0] || 'Apply recommended budget adjustments.')}
            </p>
          </div>
          <button
            onClick={handleAction}
            disabled={actionAcknowledged}
            className={`mt-3 w-full py-2 font-display font-semibold text-xs rounded-xl transition-all shadow-sm cursor-pointer ${
              actionAcknowledged
                ? 'bg-emerald-600 text-white cursor-default'
                : 'bg-blue-600 text-white hover:bg-blue-700 active:scale-95'
            }`}
          >
            {actionAcknowledged ? 'ACKNOWLEDGED' : 'CONSIDER ACTION'}
          </button>
        </div>
      </div>
    </section>
  );
};
