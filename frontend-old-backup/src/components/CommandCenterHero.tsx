'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { formatINR } from '@/lib/utils/currency';

interface CommandCenterHeroProps {
  onSimulateClick: () => void;
  onExploreClick: () => void;
  currentSavings?: number;
  monthlyIncome?: number;
  monthlyExpenses?: number;
  activeGoalsCount?: number;
  goalProgress?: number;
}

export const CommandCenterHero: React.FC<CommandCenterHeroProps> = ({
  onSimulateClick,
  onExploreClick,
  currentSavings = 200000,
  monthlyIncome = 80000,
  monthlyExpenses = 45000,
  activeGoalsCount = 3,
  goalProgress = 68,
}) => {
  const surplus = Math.max(0, monthlyIncome - monthlyExpenses);
  const emergencyMonths = monthlyExpenses > 0 ? (currentSavings / monthlyExpenses).toFixed(1) : '4.4';
  const savingsRate = monthlyIncome > 0 ? Math.round((surplus / monthlyIncome) * 100) : 40;

  return (
    <motion.section
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
      className="bg-white rounded-3xl border border-slate-200/90 shadow-sm overflow-hidden"
    >
      {/* Top Professional Trust Banner */}
      <div className="flex items-center justify-between border-b border-slate-100 px-6 py-3 bg-slate-50/70 text-xs">
        <div className="flex items-center gap-2 font-medium text-slate-700">
          <span className="w-2 h-2 rounded-full bg-emerald-500" />
          <span className="font-semibold text-slate-900">Money Lens Intelligence</span>
          <span className="text-slate-400">|</span>
          <span className="text-slate-500">Deterministic Financial Future Simulator</span>
        </div>
        <div className="text-slate-500 font-mono text-[11px] hidden sm:block">
          100% Mathematical Calculation Core
        </div>
      </div>

      {/* Main Hero Header */}
      <div className="p-6 md:p-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        <div className="lg:col-span-7 space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 border border-blue-200 text-xs font-semibold text-blue-800 rounded-full">
            <span className="material-symbols-outlined text-[14px]">auto_graph</span>
            12-Month Predictive Cash Flow Forecast
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-display font-extrabold text-slate-900 tracking-tight leading-tight">
            See your financial future before you make{' '}
            <span className="text-blue-600">today’s decision.</span>
          </h1>
          <p className="text-sm sm:text-base text-slate-600 max-w-xl leading-relaxed font-normal">
            Simulate big purchases, EMI loans, backward-calculated savings targets, and financial risks with strict mathematical precision before spending a single rupee.
          </p>
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              onClick={onSimulateClick}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-display text-sm font-bold rounded-xl transition-all shadow-sm hover:shadow-md active:scale-95 cursor-pointer flex items-center gap-2"
            >
              <span className="material-symbols-outlined text-[18px]">play_arrow</span>
              <span>SIMULATE A DECISION</span>
            </button>
            <button
              onClick={onExploreClick}
              className="px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-display text-sm font-semibold rounded-xl transition-all active:scale-95 cursor-pointer flex items-center gap-2"
            >
              <span className="material-symbols-outlined text-[18px]">science</span>
              <span>SCENARIO LAB</span>
            </button>
          </div>
        </div>

        {/* Financial Position Snapshot Cards */}
        <div className="lg:col-span-5 grid grid-cols-2 gap-3.5">
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 hover:bg-white hover:shadow-sm transition-all">
            <div className="text-xs font-medium text-slate-500 uppercase tracking-wider">
              Liquid Savings
            </div>
            <div className="text-xl sm:text-2xl font-display font-bold text-slate-900 mt-1">
              {formatINR(currentSavings)}
            </div>
            <div className="text-[11px] text-emerald-600 mt-1 font-semibold flex items-center gap-1">
              <span>Verified Balance</span>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 hover:bg-white hover:shadow-sm transition-all">
            <div className="text-xs font-medium text-slate-500 uppercase tracking-wider">
              Monthly Surplus
            </div>
            <div className="text-xl sm:text-2xl font-display font-bold text-blue-700 mt-1">
              {formatINR(surplus)}
            </div>
            <div className="text-[11px] text-blue-600 mt-1 font-semibold">
              {savingsRate}% Savings Rate
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 hover:bg-white hover:shadow-sm transition-all">
            <div className="text-xs font-medium text-slate-500 uppercase tracking-wider">
              Emergency Runway
            </div>
            <div className="text-xl sm:text-2xl font-display font-bold text-emerald-700 mt-1">
              {emergencyMonths} months
            </div>
            <div className="w-full bg-slate-200 h-1.5 rounded-full mt-2 overflow-hidden">
              <div
                className={`h-full rounded-full ${Number(emergencyMonths) >= 3 ? 'bg-emerald-600' : 'bg-amber-500'}`}
                style={{ width: `${Math.min(100, (Number(emergencyMonths) / 6) * 100)}%` }}
              />
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 hover:bg-white hover:shadow-sm transition-all">
            <div className="text-xs font-medium text-slate-500 uppercase tracking-wider">
              Active Goals
            </div>
            <div className="text-xl sm:text-2xl font-display font-bold text-slate-900 mt-1">
              {activeGoalsCount} Targets
            </div>
            <div className="text-[11px] text-emerald-600 mt-1 font-semibold">
              {goalProgress}% Aggregate Pace
            </div>
          </div>
        </div>
      </div>
    </motion.section>
  );
};
