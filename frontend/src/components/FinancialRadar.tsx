'use client';

import React, { useState } from 'react';
import { CashFlowItem } from '../types';
import { INITIAL_OUTFLOWS, INITIAL_INFLOWS } from '../data/mockData';

interface FinancialRadarProps {
  onItemClick?: (item: CashFlowItem) => void;
}

export const FinancialRadar: React.FC<FinancialRadarProps> = ({ onItemClick }) => {
  const [filter, setFilter] = useState<'all' | 'outflows' | 'inflows'>('all');
  const [outflows] = useState<CashFlowItem[]>(INITIAL_OUTFLOWS);
  const [inflows] = useState<CashFlowItem[]>(INITIAL_INFLOWS);

  const totalOutflows = outflows.reduce((sum, item) => sum + Math.abs(item.amount), 0);
  const totalInflows = inflows.reduce((sum, item) => sum + item.amount, 0);
  const net30Day = totalInflows - totalOutflows;

  return (
    <section
      className="bg-white rounded-2xl border border-slate-200 p-6 lg:p-8 shadow-sm shadow-slate-200/50 space-y-6"
      id="radar"
    >
      <div className="border-b border-slate-100 pb-4 flex items-center justify-between">
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

        {/* Quick Net Surplus Readout */}
        <div className="hidden sm:block text-right">
          <div className="text-[10px] font-mono text-slate-400 uppercase">
            30-DAY NET DELTA
          </div>
          <div className="text-sm font-bold font-mono text-emerald-600">
            +₹{net30Day.toLocaleString('en-IN')}
          </div>
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
