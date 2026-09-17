'use client';

import React, { useState } from 'react';
import { AdjustmentLever } from '../types';
import { INITIAL_LEVERS } from '../data/mockData';

interface ReverseTimeMachineProps {
  onLeversChange?: (levers: AdjustmentLever[]) => void;
  targetAmount?: number;
  currentAmount?: number;
  deadline?: string;
}

export const ReverseTimeMachine: React.FC<ReverseTimeMachineProps> = ({
  onLeversChange,
  targetAmount = 100000,
  currentAmount = 40000,
  deadline = 'MARCH 2027',
}) => {
  const [levers, setLevers] = useState<AdjustmentLever[]>(INITIAL_LEVERS);

  // Remaining gap
  const gap = targetAmount - currentAmount;
  // 16 months to March 2027
  const baseMonths = 16;
  const baseMonthly = Math.round(gap / baseMonths);

  // Compute effective monthly requirement after applied levers
  const appliedMonthlyReduction = levers
    .filter((l) => l.applied)
    .reduce((sum, l) => sum + l.monthlyImpact, 0);

  const appliedLumpSum = levers
    .filter((l) => l.applied)
    .reduce((sum, l) => sum + (l.lumpSumImpact || 0), 0);

  const adjustedGap = Math.max(0, gap - appliedLumpSum);
  const calculatedMonthly = Math.max(
    0,
    Math.round(adjustedGap / baseMonths) - appliedMonthlyReduction
  );

  const toggleLever = (id: string) => {
    const updated = levers.map((l) =>
      l.id === id ? { ...l, applied: !l.applied } : l
    );
    setLevers(updated);
    onLeversChange?.(updated);
  };

  return (
    <section
      className="bg-white rounded-2xl border border-slate-200 p-6 lg:p-8 shadow-sm shadow-slate-200/50 space-y-6"
      id="reverse"
    >
      <div className="border-b border-slate-100 pb-4">
        <div className="flex items-center gap-1.5 text-xs font-mono font-medium text-emerald-600 uppercase tracking-wider">
          <span className="material-symbols-outlined text-[16px]">
            fast_rewind
          </span>
          <span>BACKWARD-PROPAGATION MODULE</span>
        </div>
        <h3 className="text-xl font-display font-bold text-slate-900">
          REVERSE TIME MACHINE
        </h3>
        <p className="text-sm text-slate-600">
          Start with the future you want and work backward.
        </p>
      </div>

      {/* Target Metrics Display */}
      <div className="p-5 rounded-xl border border-emerald-200 bg-emerald-50/40 space-y-3">
        <div className="flex justify-between items-center text-xs font-mono uppercase">
          <span className="text-slate-500 font-medium">Target Milestone</span>
          <span className="text-emerald-700 font-bold bg-white px-2 py-0.5 rounded border border-emerald-200">
            DEADLINE: {deadline}
          </span>
        </div>
        <div className="flex items-baseline justify-between">
          <span className="text-3xl font-display font-extrabold text-emerald-700">
            ₹{targetAmount.toLocaleString('en-IN')}
          </span>
          <span className="text-xs font-medium text-slate-500">
            Current: ₹{currentAmount.toLocaleString('en-IN')}
          </span>
        </div>
        <div className="p-3 bg-white rounded-lg border border-slate-200 flex justify-between items-center text-xs font-mono shadow-sm">
          <span className="text-slate-600 uppercase">
            Required Monthly Saving
          </span>
          <span className="text-blue-600 font-bold text-base">
            ₹{calculatedMonthly.toLocaleString('en-IN')} /mo
          </span>
        </div>
        {levers.some((l) => l.applied) && (
          <div className="text-[11px] font-mono text-emerald-700 bg-emerald-100/70 p-2 rounded flex items-center justify-between">
            <span>LEVERS ENGAGED: ACCELERATION ACTIVE</span>
            <span>-₹{(baseMonthly - calculatedMonthly).toLocaleString('en-IN')}/mo relief</span>
          </div>
        )}
      </div>

      {/* Available Levers */}
      <div className="space-y-3">
        <div className="text-xs font-mono font-semibold text-slate-400 uppercase tracking-wider">
          AVAILABLE ADJUSTMENT LEVERS
        </div>

        {levers.map((lever) => {
          const isApplied = lever.applied;
          const indicatorColor =
            lever.color === 'emerald'
              ? 'bg-emerald-500'
              : lever.color === 'blue'
                ? 'bg-blue-600'
                : 'bg-amber-500';

          const btnTheme =
            lever.color === 'emerald'
              ? isApplied
                ? 'bg-emerald-600 text-white border-emerald-600'
                : 'border-emerald-300 bg-emerald-50 hover:bg-emerald-100 text-emerald-700'
              : lever.color === 'blue'
                ? isApplied
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'border-blue-300 bg-blue-50 hover:bg-blue-100 text-blue-700'
                : isApplied
                  ? 'bg-amber-600 text-white border-amber-600'
                  : 'border-amber-300 bg-amber-50 hover:bg-amber-100 text-amber-700';

          return (
            <div
              key={lever.id}
              className={`p-3.5 rounded-xl border transition-all flex items-center justify-between shadow-sm ${
                isApplied
                  ? 'border-emerald-500 bg-emerald-50/20 ring-1 ring-emerald-500/20'
                  : 'border-slate-200 bg-white hover:border-slate-300'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className={`w-1.5 h-8 rounded-full ${indicatorColor}`} />
                <div>
                  <div className="text-sm font-semibold text-slate-900">
                    {lever.title}
                  </div>
                  <div className="text-xs text-slate-500">
                    {lever.description}
                  </div>
                </div>
              </div>

              <button
                onClick={() => toggleLever(lever.id)}
                className={`px-3 py-1.5 border text-xs font-mono font-bold rounded-lg uppercase tracking-wider transition-colors cursor-pointer ${btnTheme}`}
              >
                {isApplied ? 'ACTIVE' : 'APPLY'}
              </button>
            </div>
          );
        })}
      </div>
    </section>
  );
};
