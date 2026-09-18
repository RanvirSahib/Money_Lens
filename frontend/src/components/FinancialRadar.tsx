'use client';

import React, { useState } from 'react';
import { CashFlowItem } from '../types';
import { INITIAL_OUTFLOWS, INITIAL_INFLOWS } from '../data/mockData';

interface FinancialRadarProps {
  onItemClick?: (item: CashFlowItem) => void;
  monthlyIncome?: number;
  monthlyExpenses?: number;
  currentSavings?: number;
}

export const FinancialRadar: React.FC<FinancialRadarProps> = ({
  onItemClick,
  monthlyIncome = 55000,
  monthlyExpenses = 25000,
  currentSavings = 40000,
}) => {
  const [filter, setFilter] = useState<'all' | 'outflows' | 'inflows'>('all');
  const [outflows] = useState<CashFlowItem[]>(INITIAL_OUTFLOWS);
  const [inflows] = useState<CashFlowItem[]>(INITIAL_INFLOWS);

  const totalOutflows = outflows.reduce((sum, item) => sum + Math.abs(item.amount), 0);
  const totalInflows = inflows.reduce((sum, item) => sum + item.amount, 0);
  const net30Day = totalInflows - totalOutflows;
  
  // Tactical liquidity calculations
  const bufferFloor = Math.round(monthlyExpenses * 1.5);
  const troughLiquidity = currentSavings + net30Day;
  const isHealthyMargin = troughLiquidity >= bufferFloor;

  return (
    <section
      className="bg-white rounded-2xl border border-slate-200 p-6 lg:p-8 shadow-sm shadow-slate-200/50 space-y-6"
      id="radar"
    >
      <div className="border-b border-slate-100 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-1.5 text-xs font-mono font-medium text-slate-600 uppercase tracking-wider">
            <span className="material-symbols-outlined text-[16px]">radar</span>
            <span>TACTICAL SURVEILLANCE MATRIX</span>
          </div>
          <h3 className="text-xl font-display font-bold text-slate-900">
            FINANCIAL RADAR (30-DAY OUTLOOK)
          </h3>
          <p className="text-sm text-slate-600">
            See what may affect your cash flow before it happens.
          </p>
        </div>

        {/* Quick Readout: Net Delta + Trough Buffer */}
        <div className="flex items-center gap-4 text-right">
          <div>
            <div className="text-[10px] font-mono text-slate-400 uppercase">
              30-DAY TROUGH
            </div>
            <div className="text-sm font-bold font-mono text-slate-900">
              ₹{troughLiquidity.toLocaleString('en-IN')}
            </div>
          </div>
          <div className="border-l border-slate-200 pl-4">
            <div className="text-[10px] font-mono text-slate-400 uppercase">
              NET DELTA
            </div>
            <div className={`text-sm font-bold font-mono ${net30Day >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
              {net30Day >= 0 ? '+' : '-'}₹{Math.abs(net30Day).toLocaleString('en-IN')}
            </div>
          </div>
        </div>
      </div>

      {/* Trough & Floor Banner */}
      <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs font-mono">
        <div className="flex items-center gap-2">
          <span className={`w-2 h-2 rounded-full ${isHealthyMargin ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
          <span className="text-slate-700">
            Buffer Floor Target (1.5x Exp): <strong>₹{bufferFloor.toLocaleString('en-IN')}</strong>
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-slate-500">Margin Status:</span>
          <span className={`px-2 py-0.5 rounded font-bold ${isHealthyMargin ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>
            {isHealthyMargin ? 'SECURE (+₹' + (troughLiquidity - bufferFloor).toLocaleString('en-IN') + ')' : 'WATCHLIST'}
          </span>
        </div>
      </div>

      {/* Committed Outflows */}
      {(filter === 'all' || filter === 'outflows') && (
        <div className="space-y-2.5">
          <div className="flex items-center justify-between text-xs font-mono font-semibold text-slate-400 uppercase tracking-wider">
            <span>UPCOMING COMMITTED OUTFLOWS</span>
            <span className="text-rose-600">
              -₹{totalOutflows.toLocaleString('en-IN')}
            </span>
          </div>

          {outflows.slice(0, 3).map((item) => (
            <div
              key={item.id}
              onClick={() => onItemClick?.(item)}
              className="p-3 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-white hover:border-slate-300 transition-all flex items-center justify-between cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-rose-100 text-rose-600 flex items-center justify-center">
                  <span className="material-symbols-outlined text-[18px]">
                    {item.icon}
                  </span>
                </div>
                <div>
                  <div className="text-sm font-semibold text-slate-900">
                    {item.title}
                  </div>
                  <div className="text-[11px] text-slate-500">{item.subtitle}</div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-base font-bold text-rose-600 font-display">
                  -₹{Math.abs(item.amount).toLocaleString('en-IN')}
                </div>
                <div className="text-[11px] font-mono text-slate-400">
                  {item.statusText}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Projected Inflows */}
      {(filter === 'all' || filter === 'inflows') && (
        <div className="space-y-2.5 pt-2 border-t border-slate-100">
          <div className="flex items-center justify-between text-xs font-mono font-semibold text-slate-400 uppercase tracking-wider">
            <span>PROJECTED INFLOW VECTORS</span>
            <span className="text-emerald-700">
              +₹{totalInflows.toLocaleString('en-IN')}
            </span>
          </div>

          {inflows.slice(0, 2).map((item) => (
            <div
              key={item.id}
              onClick={() => onItemClick?.(item)}
              className="p-3 rounded-xl border border-slate-200 bg-emerald-50/30 hover:bg-emerald-50/60 hover:border-emerald-300 transition-all flex items-center justify-between cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
                  <span className="material-symbols-outlined text-[18px]">
                    {item.icon}
                  </span>
                </div>
                <div>
                  <div className="text-sm font-semibold text-slate-900">
                    {item.title}
                  </div>
                  <div className="text-[11px] text-slate-500">{item.subtitle}</div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-base font-bold text-emerald-600 font-display">
                  +₹{item.amount.toLocaleString('en-IN')}
                </div>
                <div className="text-[11px] font-mono text-emerald-700/80">
                  {item.statusText}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
};
