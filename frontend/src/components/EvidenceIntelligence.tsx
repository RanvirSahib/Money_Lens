'use client';

import React, { useState } from 'react';

interface EvidenceIntelligenceProps {
  onEngageCeiling?: () => void;
}

export const EvidenceIntelligence: React.FC<EvidenceIntelligenceProps> = ({
  onEngageCeiling,
}) => {
  const [ceilingEngaged, setCeilingEngaged] = useState(false);

  const handleEngage = () => {
    setCeilingEngaged(true);
    onEngageCeiling?.();
  };

  return (
    <section className="bg-white rounded-2xl border border-slate-200 p-6 lg:p-8 shadow-sm shadow-slate-200/50">
      <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-6">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-blue-600 text-[22px]">
            psychology
          </span>
          <h4 className="text-lg font-display font-bold text-slate-900">
            EVIDENCE-BASED FINANCIAL INTELLIGENCE
          </h4>
        </div>
        <span className="text-xs font-mono font-semibold text-blue-600 tracking-wider">
          AUTOMATED CAUSAL CHAIN
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-stretch">
        {/* Step 1 */}
        <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 flex flex-col justify-between">
          <div className="text-[11px] font-mono font-semibold text-slate-400 uppercase mb-2">
            01 // OBSERVATION
          </div>
          <p className="text-sm font-medium text-slate-800">
            Discretionary spending increased by 18% over prior period
          </p>
        </div>

        {/* Step 2 */}
        <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 flex flex-col justify-between">
          <div className="text-[11px] font-mono font-semibold text-slate-400 uppercase mb-2">
            02 // TELEMETRIC EVIDENCE
          </div>
          <p className="text-sm text-slate-600">
            Dining &amp; gadgets tracked from ₹7,200/mo → ₹8,500/mo over 60 days
          </p>
        </div>

        {/* Step 3 */}
        <div className="p-4 rounded-xl border border-rose-200 bg-rose-50/50 flex flex-col justify-between">
          <div className="text-[11px] font-mono font-semibold text-rose-500 uppercase mb-2">
            03 // SIMULATED DIVERGENCE
          </div>
          <p className="text-sm font-medium text-rose-700">
            Laptop goal trajectory extends outward by 45 days
          </p>
        </div>

        {/* Step 4 */}
        <div
          className={`p-4 rounded-xl border-2 flex flex-col justify-between transition-all ${
            ceilingEngaged
              ? 'border-emerald-600 bg-emerald-50/50'
              : 'border-blue-600 bg-blue-50/50'
          }`}
        >
          <div>
            <div
              className={`text-[11px] font-mono font-bold uppercase mb-1 ${
                ceilingEngaged ? 'text-emerald-700' : 'text-blue-600'
              }`}
            >
              04 // RECOVERY VECTOR
            </div>
            <p className="text-xs font-medium text-slate-800">
              {ceilingEngaged
                ? 'Ceiling locked at ₹7,500/mo. Goal delay restored.'
                : 'Apply discretionary budget ceiling of ₹7,500/mo'}
            </p>
          </div>
          <button
            onClick={handleEngage}
            disabled={ceilingEngaged}
            className={`mt-3 w-full py-2 font-mono font-bold uppercase tracking-wider text-xs rounded-lg transition-colors shadow-sm cursor-pointer ${
              ceilingEngaged
                ? 'bg-emerald-600 text-white cursor-default'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            {ceilingEngaged ? 'CEILING ENGAGED' : 'ENGAGE CEILING'}
          </button>
        </div>
      </div>
    </section>
  );
};
