'use client';

import React, { useState } from 'react';
import { ReverseTimeMachine } from '../components/ReverseTimeMachine';
import { AdjustmentLever } from '../types';

interface ReverseScreenProps {
  savings: number;
  income?: number;
  expenses?: number;
}

export const ReverseScreen: React.FC<ReverseScreenProps> = ({
  savings,
  income = 55000,
  expenses = 25000,
}) => {
  const [targetAmt, setTargetAmt] = useState(100000);
  const [targetDate, setTargetDate] = useState('MARCH 2027');

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 lg:p-8 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono font-medium text-emerald-600 uppercase tracking-wider">
              <span className="material-symbols-outlined text-[18px]">
                fast_rewind
              </span>
              <span>BACKWARD-PROPAGATION &amp; REVERSE HORIZON SOLVER</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-display font-bold text-slate-900 mt-1">
              Reverse Time Machine
            </h1>
            <p className="text-sm text-slate-600 mt-1">
              Specify your destination capital milestone and allow deterministic backward-propagation to calculate the required monthly velocity and actionable levers.
            </p>
          </div>

          <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 px-3.5 py-1.5 rounded-lg text-emerald-800 text-xs font-mono font-semibold">
            <span>ALGORITHM: REVERSE DYNAMIC AMORTIZATION</span>
          </div>
        </div>
      </div>

      {/* Target Milestone Configuration */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-xs font-mono uppercase text-slate-500 mb-1">
            Destination Capital Milestone (₹)
          </label>
          <div className="flex items-center gap-3">
            <input
              type="number"
              value={targetAmt}
              onChange={(e) => setTargetAmt(Number(e.target.value))}
              className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-base font-bold font-mono text-slate-900 focus:bg-white focus:ring-2 focus:ring-emerald-500"
            />
            <div className="flex gap-1.5">
              {[100000, 250000, 500000].map((val) => (
                <button
                  key={val}
                  onClick={() => setTargetAmt(val)}
                  className="px-2.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-mono rounded-lg transition-colors cursor-pointer"
                >
                  ₹{val / 1000}k
                </button>
              ))}
            </div>
          </div>
        </div>

        <div>
          <label className="block text-xs font-mono uppercase text-slate-500 mb-1">
            Target Horizon Deadline
          </label>
          <select
            value={targetDate}
            onChange={(e) => setTargetDate(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm font-semibold font-mono text-slate-900 focus:bg-white focus:ring-2 focus:ring-emerald-500"
          >
            <option value="DECEMBER 2026">DECEMBER 2026 (12 Months)</option>
            <option value="MARCH 2027">MARCH 2027 (16 Months)</option>
            <option value="OCTOBER 2027">OCTOBER 2027 (22 Months)</option>
            <option value="DECEMBER 2027">DECEMBER 2027 (24 Months)</option>
          </select>
        </div>
      </div>

      {/* Reverse Time Machine Interactive Engine */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8">
          <ReverseTimeMachine
            targetAmount={targetAmt}
            currentAmount={savings}
            monthlyIncome={income}
            monthlyExpenses={expenses}
            deadline={targetDate}
          />
        </div>

        {/* Strategic Analysis Sidecar */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
            <div className="text-xs font-mono font-bold text-slate-700 uppercase">
              PROPAGATION SENSITIVITY
            </div>
            <div className="text-xs text-slate-600 leading-relaxed">
              If discretionary cuts are engaged (+₹1,500/mo), the target milestone is achieved <strong>4.2 months earlier</strong> without reducing core lifestyle standards.
            </div>

            <div className="pt-3 border-t border-slate-100 space-y-2">
              <div className="flex justify-between text-xs font-mono">
                <span className="text-slate-500">Unconstrained Deadline:</span>
                <span className="font-bold text-slate-800">July 2027</span>
              </div>
              <div className="flex justify-between text-xs font-mono">
                <span className="text-slate-500">Accelerated Vector:</span>
                <span className="font-bold text-emerald-600">{targetDate}</span>
              </div>
              <div className="flex justify-between text-xs font-mono">
                <span className="text-slate-500">Probability of Arrival:</span>
                <span className="font-bold text-blue-600">94.8% (Deterministic)</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
