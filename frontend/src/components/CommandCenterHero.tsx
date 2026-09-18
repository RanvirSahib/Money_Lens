'use client';

import React from 'react';
import { motion } from 'framer-motion';

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
  currentSavings = 40000,
  monthlyIncome = 55000,
  monthlyExpenses = 25000,
  activeGoalsCount = 3,
  goalProgress = 68,
}) => {
  const surplus = monthlyIncome - monthlyExpenses;

  return (
    <motion.section
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      className="bg-white rounded-3xl border border-slate-200/90 shadow-sm shadow-slate-200/50 overflow-hidden"
    >
      {/* Top Monoline Status Ribbon */}
      <div className="flex items-center justify-between border-b border-slate-100 px-6 py-2.5 bg-slate-50/70 text-xs font-mono">
        <div className="flex items-center gap-2 font-medium text-blue-600 tracking-wide uppercase">
          <span className="material-symbols-outlined text-[16px]">memory</span>
          <span>AI-POWERED FINANCIAL SIMULATION // CORE SYSTEM RUNTIME</span>
        </div>
        <div className="text-slate-400 tracking-wider hidden sm:block">
          LATENCY: 12MS // DETERMINISTIC ENGINE
        </div>
      </div>

      {/* Hero Statement */}
      <div className="p-6 md:p-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        <div className="lg:col-span-8 space-y-5">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 border border-blue-200 text-xs font-mono font-medium text-blue-700 tracking-wider rounded-full uppercase">
            <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
            PREDICTIVE CASH FLOW HORIZON : 12 MONTHS
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-display font-extrabold text-slate-900 tracking-tight leading-tight">
            See your financial future before you make{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-700 to-sky-500">today’s decision.</span>
          </h1>
          <p className="text-base text-slate-600 max-w-2xl font-normal leading-relaxed">
            Turn your financial profile into an interactive predictive sandbox. Simulate loans, major purchases, runway shocks, and backward-propagated sinking funds with 100% mathematical precision.
          </p>
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              onClick={onSimulateClick}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-display text-sm font-bold rounded-full transition-all duration-200 flex items-center gap-2 shadow-md shadow-blue-500/20 hover:shadow-lg hover:shadow-blue-500/30 active:scale-95 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[18px]">
                play_arrow
              </span>
              <span>SIMULATE A DECISION</span>
            </button>
            <button
              onClick={onExploreClick}
              className="px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-display text-sm font-semibold rounded-full transition-all duration-200 flex items-center gap-2 active:scale-95 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[18px]">
                science
              </span>
              <span>MONTE CARLO LAB</span>
            </button>
          </div>
        </div>

        {/* Dynamic Key Metric HUD Cards */}
        <div className="lg:col-span-4 grid grid-cols-2 gap-3.5">
          <div className="p-4 rounded-2xl bg-slate-50/80 border border-slate-200/80 hover:bg-white hover:shadow-md hover:border-slate-300 transition-all duration-200">
            <div className="text-[11px] font-mono text-slate-400 uppercase tracking-wider">
              Liquid Savings
            </div>
            <div className="text-2xl font-display font-bold text-slate-900 mt-1">
              ₹{currentSavings.toLocaleString('en-IN')}
            </div>
            <div className="text-[11px] font-mono text-emerald-600 mt-1 flex items-center gap-1 font-semibold">
              <span>↑ Verified Floor</span>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50/80 border border-slate-200/80 hover:bg-white hover:shadow-md hover:border-slate-300 transition-all duration-200">
            <div className="text-[11px] font-mono text-slate-400 uppercase tracking-wider">
              Monthly Surplus
            </div>
            <div className="text-2xl font-display font-bold text-blue-700 mt-1">
              ₹{surplus.toLocaleString('en-IN')}
            </div>
            <div className="text-[11px] font-mono text-blue-600 mt-1 flex items-center gap-1 font-semibold">
              <span>₹{(monthlyIncome/1000).toFixed(0)}K Inflow</span>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50/80 border border-slate-200/80 hover:bg-white hover:shadow-md hover:border-slate-300 transition-all duration-200">
            <div className="text-[11px] font-mono text-slate-400 uppercase tracking-wider">
              Active Goals
            </div>
            <div className="text-2xl font-display font-bold text-slate-900 mt-1">
              {activeGoalsCount} Targets
            </div>
            <div className="text-[11px] font-mono text-emerald-600 mt-1 font-semibold">
              {goalProgress}% Aggregate
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50/80 border border-slate-200/80 hover:bg-white hover:shadow-md hover:border-slate-300 transition-all duration-200">
            <div className="text-[11px] font-mono text-slate-400 uppercase tracking-wider">
              Emergency Runway
            </div>
            <div className="text-2xl font-display font-bold text-emerald-700 mt-1">
              {(currentSavings / Math.max(1, monthlyExpenses)).toFixed(1)} mo
            </div>
            <div className="text-[11px] font-mono text-emerald-600 mt-1 font-semibold">
              Safe Cushion
            </div>
          </div>
        </div>
      </div>
    </motion.section>
  );
};
