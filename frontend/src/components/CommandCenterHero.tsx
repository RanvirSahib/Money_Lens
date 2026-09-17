'use client';

import React from 'react';

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
  return (
    <section className="bg-white rounded-2xl border border-slate-200 shadow-sm shadow-slate-200/50 overflow-hidden">
      {/* Top Monoline Status Ribbon */}
      <div className="flex items-center justify-between border-b border-slate-100 px-6 py-2.5 bg-slate-50/70">
        <div className="flex items-center gap-2 text-xs font-mono font-medium text-blue-600 tracking-wide uppercase">
          <span className="material-symbols-outlined text-[16px]">memory</span>
          <span>AI-POWERED FINANCIAL SIMULATION // CORE SYSTEM RUNTIME</span>
        </div>
        <div className="text-xs font-mono text-slate-400 tracking-wider">
          LOC: LATENCY 12MS // DETERMINISTIC ENGINE
        </div>
      </div>

      {/* Hero Statement */}
      <div className="p-6 md:p-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        <div className="lg:col-span-8 space-y-5">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 border border-blue-200 text-xs font-mono font-medium text-blue-700 tracking-wider rounded-md uppercase">
            <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
            PREDICTIVE CASH FLOW HORIZON : 12 MONTHS
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-display font-bold text-slate-900 tracking-tight leading-tight">
            See your financial future before you make{' '}
            <span className="text-blue-600">today’s decision.</span>
          </h1>
          <p className="text-base text-slate-600 max-w-2xl font-normal leading-relaxed">
            Turn your financial history into a living model of what could happen next. Test variable leverage, analyze shock tolerances, and safeguard your life trajectory with cold deterministic certainty.
          </p>
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              onClick={onSimulateClick}
              className="px-6 py-3 bg-blue-600 text-white font-sans text-sm font-semibold rounded-xl hover:bg-blue-700 transition-all blue-glow flex items-center gap-2 shadow-sm cursor-pointer"
            >
              <span className="material-symbols-outlined text-[18px]">
                play_arrow
              </span>
              <span>SIMULATE A DECISION</span>
            </button>
            <button
              onClick={onExploreClick}
              className="px-6 py-3 bg-white border border-slate-300 text-slate-700 font-sans text-sm font-medium rounded-xl hover:border-slate-400 hover:bg-slate-50 transition-colors flex items-center gap-2 shadow-sm cursor-pointer"
            >
              <span className="material-symbols-outlined text-[18px]">
                terminal
              </span>
              <span>EXPLORE MONEY LENS</span>
            </button>
          </div>
        </div>

        {/* Real-Time Pulse Metric Console */}
        <div className="lg:col-span-4 rounded-xl border border-slate-200 bg-slate-50/70 p-5 space-y-3.5 shadow-inner">
          <div className="flex items-center justify-between border-b border-slate-200 pb-2">
            <span className="text-[11px] font-mono font-semibold text-slate-500 uppercase tracking-wider">
              CAPITAL COMPLIANCE INDEX
            </span>
            <span className="text-xs font-mono font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
              STABLE 98.4%
            </span>
          </div>

          <div className="space-y-1.5">
            <div className="flex justify-between text-xs font-medium text-slate-600">
              <span>Buffer Reserves Ratio</span>
              <span className="font-mono text-slate-900 font-semibold">1.62X</span>
            </div>
            <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
              <div className="bg-blue-600 h-full rounded-full w-[82%]" />
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="flex justify-between text-xs font-medium text-slate-600">
              <span>Unplanned Volatility Tolerance</span>
              <span className="font-mono text-emerald-700 font-semibold">
                HIGH (₹75,000)
              </span>
            </div>
            <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
              <div className="bg-emerald-500 h-full rounded-full w-[74%]" />
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="flex justify-between text-xs font-medium text-slate-600">
              <span>Cash Flow Recovery Coefficient</span>
              <span className="font-mono text-blue-800 font-semibold">
                0.91 Sigma
              </span>
            </div>
            <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
              <div className="bg-sky-500 h-full rounded-full w-[91%]" />
            </div>
          </div>
        </div>
      </div>

      {/* 4-Column Metric HUD Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 border-t border-slate-200 divide-y sm:divide-y-0 sm:divide-x divide-slate-200 bg-slate-50/50">
        {/* HUD 1 */}
        <div className="p-6 space-y-1 hover:bg-white transition-colors">
          <div className="flex items-center justify-between text-xs font-medium text-slate-500 uppercase tracking-wider">
            <span>Current Savings</span>
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
          </div>
          <div className="text-3xl font-display font-bold text-slate-900">
            ₹{currentSavings.toLocaleString('en-IN')}
          </div>
          <div className="flex items-center gap-1.5 text-xs font-medium text-emerald-600 pt-1">
            <span className="material-symbols-outlined text-[16px]">
              verified_user
            </span>
            <span>Safe buffer: {(currentSavings / monthlyExpenses).toFixed(1)} mo</span>
          </div>
        </div>

        {/* HUD 2 */}
        <div className="p-6 space-y-1 hover:bg-white transition-colors">
          <div className="flex items-center justify-between text-xs font-medium text-slate-500 uppercase tracking-wider">
            <span>Monthly Income</span>
            <span className="w-2 h-2 rounded-full bg-blue-600" />
          </div>
          <div className="text-3xl font-display font-bold text-slate-900">
            ₹{monthlyIncome.toLocaleString('en-IN')}
          </div>
          <div className="flex items-center gap-1.5 text-xs font-medium text-blue-600 pt-1">
            <span className="material-symbols-outlined text-[16px]">
              auto_graph
            </span>
            <span>Predictability: High</span>
          </div>
        </div>

        {/* HUD 3 */}
        <div className="p-6 space-y-1 hover:bg-white transition-colors">
          <div className="flex items-center justify-between text-xs font-medium text-slate-500 uppercase tracking-wider">
            <span>Monthly Expenses</span>
            <span className="w-2 h-2 rounded-full bg-slate-400" />
          </div>
          <div className="text-3xl font-display font-bold text-slate-900">
            ₹{monthlyExpenses.toLocaleString('en-IN')}
          </div>
          <div className="flex items-center gap-1.5 text-xs font-medium text-slate-600 pt-1">
            <span className="material-symbols-outlined text-[16px]">
              donut_large
            </span>
            <span>Fixed load: 60%</span>
          </div>
        </div>

        {/* HUD 4 */}
        <div className="p-6 space-y-1 hover:bg-white transition-colors">
          <div className="flex items-center justify-between text-xs font-medium text-slate-500 uppercase tracking-wider">
            <span>Active Goals</span>
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
          </div>
          <div className="text-3xl font-display font-bold text-slate-900">
            {activeGoalsCount} Target
          </div>
          <div className="flex items-center gap-1.5 text-xs font-medium text-emerald-600 pt-1">
            <span className="material-symbols-outlined text-[16px]">
              flag
            </span>
            <span>Goal Progress: {goalProgress}%</span>
          </div>
        </div>
      </div>
    </section>
  );
};
