'use client';

import React, { useState } from 'react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  monthlyIncome: number;
  monthlyExpenses: number;
  savings: number;
  onSave: (income: number, expenses: number, savings: number) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  monthlyIncome,
  monthlyExpenses,
  savings,
  onSave,
}) => {
  const [inc, setInc] = useState(monthlyIncome);
  const [exp, setExp] = useState(monthlyExpenses);
  const [sav, setSav] = useState(savings);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(inc, exp, sav);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-in fade-in zoom-in-95">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/70">
          <div className="flex items-center gap-2 text-slate-900 font-display font-bold">
            <span className="material-symbols-outlined text-blue-600 text-[20px]">
              tune
            </span>
            <span>SYSTEM CALIBRATION PARAMETERS</span>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 cursor-pointer"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-mono font-medium text-slate-500 uppercase mb-1">
              Baseline Monthly Income (₹)
            </label>
            <input
              type="number"
              value={inc}
              onChange={(e) => setInc(Number(e.target.value))}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm font-semibold font-mono text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-mono font-medium text-slate-500 uppercase mb-1">
              Monthly Fixed Expenses (₹)
            </label>
            <input
              type="number"
              value={exp}
              onChange={(e) => setExp(Number(e.target.value))}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm font-semibold font-mono text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-mono font-medium text-slate-500 uppercase mb-1">
              Current Liquid Savings (₹)
            </label>
            <input
              type="number"
              value={sav}
              onChange={(e) => setSav(Number(e.target.value))}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm font-semibold font-mono text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="pt-2 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 border border-slate-300 text-slate-700 text-xs font-mono uppercase font-semibold rounded-xl hover:bg-slate-50 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 py-2.5 bg-blue-600 text-white text-xs font-mono uppercase font-bold rounded-xl hover:bg-blue-700 transition-colors shadow-sm cursor-pointer"
            >
              Recalibrate Engine
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
