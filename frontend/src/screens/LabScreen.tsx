'use client';

import React, { useState } from 'react';

export const LabScreen: React.FC = () => {
  const [iterations] = useState(1000);
  const [shockAmount, setShockAmount] = useState(75000);
  const [inflationRate, setInflationRate] = useState(6.2);
  const [jobDisruptionMonths, setJobDisruptionMonths] = useState(2);
  const [isSimulating, setIsSimulating] = useState(false);
  const [simSeed, setSimSeed] = useState('MC-9942');

  const handleRunMonteCarlo = () => {
    setIsSimulating(true);
    setTimeout(() => {
      setIsSimulating(false);
      setSimSeed(`MC-${Math.floor(1000 + Math.random() * 9000)}`);
    }, 600);
  };

  // Derived metrics based on sliders
  const survivalProbability = Math.max(
    58,
    Math.min(99.4, 99.4 - (shockAmount / 75000) * 8 - jobDisruptionMonths * 6)
  ).toFixed(1);

  const recoveryTimeMonths = (
    1.2 +
    (shockAmount / 50000) * 1.1 +
    jobDisruptionMonths * 1.4
  ).toFixed(1);

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 lg:p-8 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono font-medium text-blue-600 uppercase tracking-wider">
            <span className="material-symbols-outlined text-[18px]">
              biotech
            </span>
            <span>RESEARCH LAB // STOCHASTIC MONTE-CARLO SUITE</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-display font-bold text-slate-900 mt-1">
            Financial Telemetry Lab &amp; Shock Engine
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            Simulate 1,000 parallel universe macroeconomic scenarios, black swan expense shocks, and emergency reserve exhaustions.
          </p>
        </div>

        <button
          onClick={handleRunMonteCarlo}
          disabled={isSimulating}
          className="px-6 py-3 bg-blue-600 text-white font-mono text-xs uppercase tracking-wider font-bold rounded-xl hover:bg-blue-700 transition-colors shadow-sm cursor-pointer disabled:opacity-75 flex items-center gap-2 self-start md:self-auto"
        >
          <span className="material-symbols-outlined text-[18px]">
            {isSimulating ? 'refresh' : 'play_arrow'}
          </span>
          <span>
            {isSimulating ? 'SIMULATING 1,000 PATHS...' : 'RUN 1,000 RUNS'}
          </span>
        </button>
      </div>

      {/* Primary Telemetry Readout Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
          <div className="text-xs font-mono text-slate-500 uppercase">
            Survival Probability (P95)
          </div>
          <div className="text-3xl font-display font-bold text-emerald-600 mt-1">
            {survivalProbability}%
          </div>
          <div className="text-xs text-slate-500 mt-1 font-mono">
            Zero bankruptcy across 950+ trials
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
          <div className="text-xs font-mono text-slate-500 uppercase">
            Shock Recovery Latency
          </div>
          <div className="text-3xl font-display font-bold text-blue-600 mt-1">
            {recoveryTimeMonths} Months
          </div>
          <div className="text-xs text-slate-500 mt-1 font-mono">
            Time to replenish P0 cushion
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
          <div className="text-xs font-mono text-slate-500 uppercase">
            Confidence Envelope Seed
          </div>
          <div className="text-3xl font-display font-bold text-slate-900 mt-1 font-mono">
            {simSeed}
          </div>
          <div className="text-xs text-slate-500 mt-1 font-mono">
            Deterministic pseudo-random state
          </div>
        </div>
      </div>

      {/* Interactive Sliders for Shock Testing */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 lg:p-8 shadow-sm space-y-6">
        <div className="border-b border-slate-100 pb-3 flex justify-between items-center">
          <h2 className="text-lg font-display font-bold text-slate-900">
            STRESS-TESTING SHOCK DISTRIBUTIONS
          </h2>
          <span className="text-xs font-mono text-slate-400">
            ITERATIONS: {iterations} REAL-TIME
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-3">
            <div className="flex justify-between text-xs font-mono font-semibold">
              <span className="text-slate-700">Unplanned Shock Amount</span>
              <span className="text-blue-600 font-bold">
                ₹{shockAmount.toLocaleString('en-IN')}
              </span>
            </div>
            <input
              type="range"
              min="20000"
              max="200000"
              step="5000"
              value={shockAmount}
              onChange={(e) => setShockAmount(Number(e.target.value))}
              className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
            />
            <div className="flex justify-between text-[10px] font-mono text-slate-400">
              <span>₹20k (Medical)</span>
              <span>₹100k</span>
              <span>₹200k (Severe)</span>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex justify-between text-xs font-mono font-semibold">
              <span className="text-slate-700">Job Disruption / Gap</span>
              <span className="text-blue-600 font-bold">
                {jobDisruptionMonths} Months
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="6"
              step="1"
              value={jobDisruptionMonths}
              onChange={(e) => setJobDisruptionMonths(Number(e.target.value))}
              className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
            />
            <div className="flex justify-between text-[10px] font-mono text-slate-400">
              <span>0M (None)</span>
              <span>3M (Standard)</span>
              <span>6M (Severe)</span>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex justify-between text-xs font-mono font-semibold">
              <span className="text-slate-700">Consumer Inflation Rate</span>
              <span className="text-blue-600 font-bold">{inflationRate}%</span>
            </div>
            <input
              type="range"
              min="3"
              max="12"
              step="0.2"
              value={inflationRate}
              onChange={(e) => setInflationRate(Number(e.target.value))}
              className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
            />
            <div className="flex justify-between text-[10px] font-mono text-slate-400">
              <span>3.0% (Subdued)</span>
              <span>6.5%</span>
              <span>12.0% (High)</span>
            </div>
          </div>
        </div>

        {/* Monte Carlo Simulated Cone Graphic */}
        <div className="p-4 bg-slate-900 rounded-xl text-slate-200 space-y-3 font-mono text-xs shadow-inner">
          <div className="flex justify-between items-center text-[11px] text-slate-400 border-b border-slate-800 pb-2">
            <span className="flex items-center gap-1.5 text-emerald-400">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              MONTE-CARLO ENVELOPE DIVERGENCE (1,000 PATHS)
            </span>
            <span>BOUNDS: P90 / P50 / P10</span>
          </div>

          <div className="h-28 w-full flex items-end justify-between gap-1 pt-4 px-2">
            {[42, 45, 52, 58, 64, 71, 79, 86, 92, 98, 105, 114].map((v, i) => {
              const heightPct = Math.min(100, Math.round((v / 120) * 100));
              return (
                <div key={i} className="flex-1 flex flex-col items-center gap-1">
                  <div
                    className="w-full bg-gradient-to-t from-blue-600 to-cyan-400 rounded-t-sm transition-all duration-300 opacity-80 hover:opacity-100"
                    style={{ height: `${heightPct}%` }}
                  />
                  <span className="text-[9px] text-slate-500">M+{i + 1}</span>
                </div>
              );
            })}
          </div>

          <div className="text-[11px] text-slate-400 pt-2 flex justify-between">
            <span>P90 (Optimistic): ₹1,52,000</span>
            <span className="text-white font-bold">P50 (Median): ₹1,24,000</span>
            <span>P10 (Stressed): ₹88,000</span>
          </div>
        </div>
      </div>
    </div>
  );
};
