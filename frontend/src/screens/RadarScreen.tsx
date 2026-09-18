'use client';

import React, { useState } from 'react';
import { FinancialRadar } from '../components/FinancialRadar';
import { INITIAL_OUTFLOWS, INITIAL_INFLOWS } from '../data/mockData';

interface RadarScreenProps {
  savings?: number;
  income?: number;
  expenses?: number;
}

export const RadarScreen: React.FC<RadarScreenProps> = ({
  savings = 40000,
  income = 55000,
  expenses = 25000,
}) => {
  const [timeHorizon, setTimeHorizon] = useState<'30' | '60' | '90'>('30');

  const bufferFloor = Math.round(expenses * 1.0);
  const totalOutflows = INITIAL_OUTFLOWS.reduce((sum, item) => sum + Math.abs(item.amount), 0);
  const totalInflows = INITIAL_INFLOWS.reduce((sum, item) => sum + item.amount, 0);
  const net30Day = totalInflows - totalOutflows;
  const troughLiquidity = Math.max(0, savings + net30Day);
  const clearance = troughLiquidity - bufferFloor;
  const isSafe = clearance >= 0;

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 lg:p-8 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono font-medium text-blue-600 uppercase tracking-wider">
            <span className="material-symbols-outlined text-[18px]">radar</span>
            <span>TACTICAL SURVEILLANCE &amp; LIQUIDITY RADAR</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-display font-bold text-slate-900 mt-1">
            Cash Flow Surveillance Radar
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            Track upcoming committed auto-debits, recurring vendor subscriptions, and verified salary inflow trajectories.
          </p>
        </div>

        {/* Horizon selector */}
        <div className="inline-flex rounded-xl border border-slate-200 bg-slate-100 p-1 shadow-inner self-start md:self-auto">
          {(['30', '60', '90'] as const).map((h) => (
            <button
              key={h}
              onClick={() => setTimeHorizon(h)}
              className={`px-3.5 py-1.5 text-xs font-mono font-semibold transition-all rounded-lg cursor-pointer ${
                timeHorizon === h
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {h}-DAY HORIZON
            </button>
          ))}
        </div>
      </div>

      {/* Main Radar Widget */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-7">
          <FinancialRadar
            currentSavings={savings}
            monthlyIncome={income}
            monthlyExpenses={expenses}
          />
        </div>

        {/* Tactical Liquidity Cushion Projection */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <span className="text-xs font-mono font-bold text-slate-700 uppercase">
                MINIMUM LIQUIDITY TROUGH
              </span>
              <span className={`text-xs font-mono font-bold px-2 py-0.5 rounded border ${isSafe ? 'text-emerald-700 bg-emerald-50 border-emerald-200' : 'text-amber-700 bg-amber-50 border-amber-200'}`}>
                {isSafe ? 'SAFE' : 'TIGHT'}: ₹{troughLiquidity.toLocaleString('en-IN')}
              </span>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              At Day 12 (Committed auto-debits), your liquid cash account dips to a tactical trough of <strong>₹{troughLiquidity.toLocaleString('en-IN')}</strong> before recovering upon scheduled salary tranches.
            </p>

            <div className="p-3 bg-blue-50/70 border border-blue-200 rounded-xl space-y-1.5 text-xs font-mono">
              <div className="flex justify-between text-slate-700">
                <span>Emergency Buffer Floor:</span>
                <span className="font-bold">₹{bufferFloor.toLocaleString('en-IN')} (1.0 mo)</span>
              </div>
              <div className={`flex justify-between font-bold ${isSafe ? 'text-blue-700' : 'text-amber-700'}`}>
                <span>Projected Trough Clearance:</span>
                <span>{clearance >= 0 ? '+' : '-'}₹{Math.abs(clearance).toLocaleString('en-IN')} {isSafe ? 'Safe Margin' : 'Deficit Watch'}</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-3">
            <div className="text-xs font-mono font-bold text-slate-700 uppercase">
              RECURRING VENDOR AUDIT
            </div>
            <div className="divide-y divide-slate-100 text-xs">
              <div className="py-2 flex justify-between items-center">
                <span className="text-slate-700">Housing (Rent Lease)</span>
                <span className="font-mono font-semibold text-slate-900">₹12,000 /mo</span>
              </div>
              <div className="py-2 flex justify-between items-center">
                <span className="text-slate-700">Device EMI Financing</span>
                <span className="font-mono font-semibold text-slate-900">₹6,667 /mo</span>
              </div>
              <div className="py-2 flex justify-between items-center">
                <span className="text-slate-700">Health Coverage Premium</span>
                <span className="font-mono font-semibold text-slate-900">₹708 /mo amortized</span>
              </div>
              <div className="py-2 flex justify-between items-center">
                <span className="text-slate-700">SaaS &amp; Utilities</span>
                <span className="font-mono font-semibold text-slate-900">₹2,499 /mo</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
