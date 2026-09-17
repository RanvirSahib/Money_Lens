'use client';

import React from 'react';
import { HealthVital } from '../types';
import { INITIAL_HEALTH_VITALS } from '../data/mockData';

interface HealthVitalsProps {
  vitals?: HealthVital[];
  aggregateScore?: number;
}

export const HealthVitals: React.FC<HealthVitalsProps> = ({
  vitals = INITIAL_HEALTH_VITALS,
  aggregateScore = 84,
}) => {
  return (
    <section className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 p-6 lg:p-7 space-y-5 shadow-sm shadow-slate-200/50">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <h4 className="text-base font-display font-bold text-slate-900">
          MULTI-DIMENSIONAL FINANCIAL HEALTH VITALS
        </h4>
        <span className="text-xs font-mono font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-md">
          AGGREGATE: {aggregateScore}/100
        </span>
      </div>

      <div className="space-y-4">
        {vitals.map((vital) => {
          const barColor =
            vital.color === 'emerald'
              ? 'bg-emerald-500'
              : vital.color === 'blue'
                ? 'bg-blue-600'
                : vital.color === 'amber'
                  ? 'bg-amber-500'
                  : 'bg-rose-500';

          const textColor =
            vital.color === 'emerald'
              ? 'text-emerald-700'
              : vital.color === 'blue'
                ? 'text-blue-700'
                : vital.color === 'amber'
                  ? 'text-amber-700'
                  : 'text-rose-700';

          return (
            <div key={vital.id} className="space-y-1.5">
              <div className="flex justify-between text-xs font-medium">
                <span className="text-slate-800">{vital.label}</span>
                <span className={`${textColor} font-mono font-semibold`}>
                  {vital.scoreText}
                </span>
              </div>
              <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                <div
                  className={`${barColor} h-full rounded-full transition-all duration-700`}
                  style={{ width: `${vital.percentage}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
