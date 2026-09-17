'use client';

import React, { useState } from 'react';

interface IncomeNotificationProps {
  onConfirmIncome?: (amount: number) => void;
  onKeepIncome?: (amount: number) => void;
}

export const IncomeNotification: React.FC<IncomeNotificationProps> = ({
  onConfirmIncome,
  onKeepIncome,
}) => {
  const [status, setStatus] = useState<'pending' | 'confirmed' | 'retained'>('pending');

  const handleConfirm = () => {
    setStatus('confirmed');
    onConfirmIncome?.(55000);
  };

  const handleKeep = () => {
    setStatus('retained');
    onKeepIncome?.(45000);
  };

  return (
    <section className="lg:col-span-5 rounded-2xl border border-blue-200 bg-blue-50/30 p-6 lg:p-7 flex flex-col justify-between shadow-sm">
      <div className="space-y-4">
        <div className="flex items-center justify-between border-b border-blue-200 pb-3">
          <div className="flex items-center gap-2 text-blue-700 font-semibold text-xs tracking-wider">
            <span className="material-symbols-outlined text-[18px]">verified</span>
            <span>INCOME INTELLIGENCE NOTIFICATION</span>
          </div>
          <span
            className={`text-xs font-mono font-semibold px-2 py-0.5 rounded ${
              status === 'confirmed'
                ? 'bg-emerald-200 text-emerald-800'
                : status === 'retained'
                  ? 'bg-slate-200 text-slate-700'
                  : 'text-emerald-700 bg-emerald-100'
            }`}
          >
            {status === 'confirmed'
              ? 'RECALIBRATED'
              : status === 'retained'
                ? 'MAINTAINED'
                : 'CONFIRMATION REQ'}
          </span>
        </div>

        <p className="text-sm text-slate-700">
          <strong>Possible Income Change Detected:</strong> Recent monthly credits shifted upwards consistently:
        </p>

        <div className="p-3 bg-white rounded-xl border border-blue-200 font-mono text-sm font-bold text-center text-blue-700 shadow-sm">
          ₹45K → ₹45K → ₹55K → ₹55K
        </div>

        <p className="text-xs text-slate-600 leading-relaxed">
          {status === 'confirmed'
            ? 'Baseline set to ₹55,000. All emergency buffers and goal amortization trajectories calibrated.'
            : status === 'retained'
              ? 'Baseline maintained at ₹45,000. Surplus will be treated as discretionary liquidity.'
              : 'Confirm ₹55,000 as your updated baseline income to automatically recalibrate all simulation engines and emergency cushions?'}
        </p>
      </div>

      <div className="flex items-center gap-3 pt-6">
        {status === 'pending' ? (
          <>
            <button
              onClick={handleConfirm}
              className="flex-1 py-2.5 bg-blue-600 text-white font-mono text-xs uppercase tracking-wider font-bold rounded-xl hover:bg-blue-700 transition-colors shadow-sm cursor-pointer"
            >
              CONFIRM ₹55,000
            </button>
            <button
              onClick={handleKeep}
              className="px-4 py-2.5 bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 font-mono text-xs uppercase tracking-wider transition-colors rounded-xl shadow-sm cursor-pointer"
            >
              KEEP ₹45,000
            </button>
          </>
        ) : (
          <div className="w-full text-center py-2 text-xs font-mono text-slate-500 bg-white/70 rounded-xl border border-blue-100">
            {status === 'confirmed' ? '✓ ₹55,000 Locked in Telemetry Core' : '✓ Maintained at ₹45,000'}
          </div>
        )}
      </div>
    </section>
  );
};
