'use client';

import React, { useState } from 'react';
import { SimulationResult } from '../types';

interface FinancialTimeMachineProps {
  onSimulationChange?: (result: SimulationResult) => void;
  currentSavings?: number;
  monthlyIncome?: number;
  monthlyExpenses?: number;
  existingEmi?: number;
}

export const FinancialTimeMachine: React.FC<FinancialTimeMachineProps> = ({
  onSimulationChange,
  currentSavings = 40000,
  monthlyIncome = 55000,
  monthlyExpenses = 25000,
  existingEmi = 0,
}) => {
  const [query, setQuery] = useState('I want to buy an ₹80,000 phone');
  const [decision, setDecision] = useState<
    'buy_now' | 'emi_active' | 'save_first' | 'wait_3m' | 'custom'
  >('emi_active');
  const [isSimulating, setIsSimulating] = useState(false);

  // Extract amount from query or fallback
  const parseAmount = (q: string): number => {
    const match = q.replace(/,/g, '').match(/\d+/);
    return match ? parseInt(match[0], 10) : 80000;
  };

  const currentCost = parseAmount(query);
  const monthlySurplus = Math.max(0, monthlyIncome - monthlyExpenses - existingEmi);
  const baselineSavings = currentSavings + 12 * monthlySurplus;

  // Compute telemetry metrics dynamically based on decision, cost, & user financial profile
  const computeSimulation = (): SimulationResult => {
    const cost = currentCost;
    if (decision === 'buy_now') {
      const immediateSavings = Math.max(0, currentSavings - cost);
      const projectedSavings = immediateSavings + 12 * monthlySurplus;
      const recoveryMonths = monthlySurplus > 0 ? Math.ceil(cost / monthlySurplus) : 12;
      const stressIndex = Math.min(96, Math.max(25, Math.round((cost / Math.max(1, currentSavings + monthlySurplus)) * 75)));

      return {
        query,
        decision,
        cost,
        emiMonthly: 0,
        tenureMonths: 1,
        projectedSavings,
        baselineSavings,
        monthlyCashFlowDelta: -cost,
        goalLagMonths: Math.max(1, recoveryMonths),
        potentialPressure: stressIndex > 65 ? 'HIGH' : stressIndex > 40 ? 'ELEVATED' : 'MODERATE',
        stressIndex,
        notes: `Immediate liquidity extraction of ₹${cost.toLocaleString('en-IN')}. Emergency buffer recovers in ${recoveryMonths} month${recoveryMonths > 1 ? 's' : ''} at ₹${monthlySurplus.toLocaleString('en-IN')}/mo surplus.`,
        simHash: '849F-BN01',
      };
    }

    if (decision === 'save_first') {
      const monthsNeeded = monthlySurplus > 0 ? Math.ceil(cost / monthlySurplus) : 12;
      const projectedSavings = Math.max(0, baselineSavings - cost);

      return {
        query,
        decision,
        cost,
        emiMonthly: 0,
        tenureMonths: monthsNeeded,
        projectedSavings,
        baselineSavings,
        monthlyCashFlowDelta: 0,
        goalLagMonths: 0,
        potentialPressure: 'LOW',
        stressIndex: 12,
        notes: `Zero leverage shock. Purchase deferred until Month +${monthsNeeded} via planned monthly surplus allocation of ₹${monthlySurplus.toLocaleString('en-IN')}.`,
        simHash: '849F-SF03',
      };
    }

    if (decision === 'wait_3m') {
      const emiMonthly = Math.round(cost / 12);
      const projectedSavings = currentSavings + 3 * monthlySurplus + 9 * Math.max(0, monthlySurplus - emiMonthly);
      const stressIndex = Math.min(70, Math.max(18, Math.round((emiMonthly / Math.max(1, monthlySurplus)) * 45)));

      return {
        query,
        decision,
        cost,
        emiMonthly,
        tenureMonths: 12,
        projectedSavings,
        baselineSavings,
        monthlyCashFlowDelta: -emiMonthly,
        goalLagMonths: 1,
        potentialPressure: stressIndex > 45 ? 'MODERATE' : 'LOW',
        stressIndex,
        notes: `Delaying 90 days allows building ₹${(3 * monthlySurplus).toLocaleString('en-IN')} buffer. Strain vector reduced vs immediate purchase.`,
        simHash: '849F-W3M2',
      };
    }

    if (decision === 'custom') {
      const emiMonthly = Math.round(cost / 18);
      const projectedSavings = currentSavings + 12 * Math.max(0, monthlySurplus - emiMonthly);
      const stressIndex = Math.min(80, Math.max(20, Math.round((emiMonthly / Math.max(1, monthlySurplus)) * 50)));

      return {
        query,
        decision,
        cost,
        emiMonthly,
        tenureMonths: 18,
        projectedSavings,
        baselineSavings,
        monthlyCashFlowDelta: -emiMonthly,
        goalLagMonths: Math.max(1, Math.round((cost / Math.max(1, monthlySurplus)) * 0.4)),
        potentialPressure: stressIndex > 50 ? 'ELEVATED' : 'MODERATE',
        stressIndex,
        notes: `Customized 18-month amortization structure balances cash burn (₹${emiMonthly.toLocaleString('en-IN')}/mo) against reserve security.`,
        simHash: '849F-CST9',
      };
    }

    // Default: EMI Active (12-month tenure)
    const emi = Math.round(cost / 12);
    const postEmiSurplus = Math.max(0, monthlySurplus - emi);
    const projectedSavings = currentSavings + 12 * postEmiSurplus;
    const stressIndex = Math.min(92, Math.max(28, Math.round((emi / Math.max(1, monthlySurplus)) * 70)));

    return {
      query,
      decision: 'emi_active',
      cost,
      emiMonthly: emi,
      tenureMonths: 12,
      projectedSavings,
      baselineSavings,
      monthlyCashFlowDelta: -emi,
      goalLagMonths: monthlySurplus > 0 ? Math.max(1, Math.round((cost / monthlySurplus) * 0.6)) : 3,
      potentialPressure: stressIndex > 60 ? 'ELEVATED' : stressIndex > 35 ? 'MODERATE' : 'LOW',
      stressIndex,
      notes: `Divergence occurs in Month 2. Emergency buffer remains monitored under the 12-month tenure model (₹${emi.toLocaleString('en-IN')}/mo EMI).`,
      simHash: '849F-2027',
    };
  };

  const simResult = computeSimulation();

  const handleRunSimulation = () => {
    setIsSimulating(true);
    setTimeout(() => {
      setIsSimulating(false);
      onSimulationChange?.(simResult);
    }, 450);
  };

  const handleSelectDecision = (
    d: 'buy_now' | 'emi_active' | 'save_first' | 'wait_3m' | 'custom'
  ) => {
    setDecision(d);
  };

  const handlePresetSelect = (text: string) => {
    setQuery(text);
  };

  return (
    <section
      className="bg-white rounded-2xl border border-slate-200 p-6 lg:p-8 shadow-sm shadow-slate-200/50 space-y-6"
      id="simulator"
    >
      <div className="border-b border-slate-100 pb-4 flex flex-col md:flex-row md:items-center justify-between gap-2">
        <div>
          <div className="flex items-center gap-1.5 text-xs font-mono font-medium text-blue-600 uppercase tracking-wider">
            <span className="material-symbols-outlined text-[16px]">
              history_toggle_off
            </span>
            <span>SCENARIO CALCULATION SUBSYSTEM</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-display font-bold text-slate-900">
            FINANCIAL TIME MACHINE
          </h2>
          <p className="text-sm text-slate-600">
            Test a financial decision before it becomes a real one.
          </p>
        </div>
        <div className="text-xs font-mono text-slate-500 uppercase bg-slate-100 px-2.5 py-1 rounded">
          MODEL: EMI-STRAIN &amp; LIQUIDITY ABSORPTION
        </div>
      </div>

      {/* Query Bar & Parameter Pills */}
      <div className="bg-slate-50 rounded-xl border border-slate-200 p-4 sm:p-5 space-y-4">
        <div className="flex flex-col sm:flex-row gap-3 items-stretch">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <span className="material-symbols-outlined text-[20px]">search</span>
            </div>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleRunSimulation();
              }}
              placeholder="e.g. I want to buy an ₹80,000 phone"
              className="w-full bg-white border border-slate-200 text-slate-900 pl-11 pr-4 py-3 text-base rounded-xl font-medium focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm"
            />
          </div>
          <button
            onClick={handleRunSimulation}
            disabled={isSimulating}
            className="px-8 py-3 bg-blue-600 text-white font-semibold text-sm rounded-xl hover:bg-blue-700 transition-all blue-glow flex items-center justify-center gap-2 shadow-sm cursor-pointer disabled:opacity-75"
          >
            <span className="material-symbols-outlined text-[18px]">
              {isSimulating ? 'sync' : 'play_circle'}
            </span>
            <span>{isSimulating ? 'COMPUTING...' : 'RUN SIMULATION'}</span>
          </button>
        </div>

        {/* Quick Suggestion Chips */}
        <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
          <span className="font-mono text-[11px] text-slate-400">QUICK SCENARIOS:</span>
          {[
            'I want to buy an ₹80,000 phone',
            'Upgrade work laptop ₹1,20,000',
            'Take European sabbatical ₹2,50,000',
            'Prepay bike loan ₹45,000',
          ].map((preset) => (
            <button
              key={preset}
              onClick={() => handlePresetSelect(preset)}
              className="px-2.5 py-1 rounded bg-white border border-slate-200 hover:border-blue-300 text-slate-600 hover:text-blue-700 transition-colors cursor-pointer text-[11px]"
            >
              {preset}
            </button>
          ))}
        </div>

        {/* Parameter Scenario Pills */}
        <div className="flex flex-wrap items-center gap-2 pt-1">
          <span className="text-xs font-mono font-semibold text-slate-400 uppercase mr-1">
            DECISION MATRIX:
          </span>

          <button
            onClick={() => handleSelectDecision('buy_now')}
            className={`px-3 py-1 text-xs font-mono rounded-lg transition-all cursor-pointer shadow-sm ${
              decision === 'buy_now'
                ? 'bg-blue-50 border-2 border-blue-600 font-semibold text-blue-700'
                : 'bg-white border border-slate-200 text-slate-700 hover:border-slate-300'
            }`}
          >
            Buy Now
          </button>

          <button
            onClick={() => handleSelectDecision('emi_active')}
            className={`px-3 py-1 text-xs font-mono rounded-lg transition-all cursor-pointer shadow-sm flex items-center gap-1.5 ${
              decision === 'emi_active'
                ? 'bg-blue-50 border-2 border-blue-600 font-semibold text-blue-700'
                : 'bg-white border border-slate-200 text-slate-700 hover:border-slate-300'
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-blue-600" />
            <span>EMI Active (₹{Math.round(currentCost / 12).toLocaleString('en-IN')}/mo)</span>
          </button>

          <button
            onClick={() => handleSelectDecision('save_first')}
            className={`px-3 py-1 text-xs font-mono rounded-lg transition-all cursor-pointer shadow-sm ${
              decision === 'save_first'
                ? 'bg-blue-50 border-2 border-blue-600 font-semibold text-blue-700'
                : 'bg-white border border-slate-200 text-slate-700 hover:border-slate-300'
            }`}
          >
            Save First
          </button>

          <button
            onClick={() => handleSelectDecision('wait_3m')}
            className={`px-3 py-1 text-xs font-mono rounded-lg transition-all cursor-pointer shadow-sm ${
              decision === 'wait_3m'
                ? 'bg-blue-50 border-2 border-blue-600 font-semibold text-blue-700'
                : 'bg-white border border-slate-200 text-slate-700 hover:border-slate-300'
            }`}
          >
            Wait 3M
          </button>

          <button
            onClick={() => handleSelectDecision('custom')}
            className={`px-3 py-1 text-xs font-mono rounded-lg transition-all cursor-pointer shadow-sm ${
              decision === 'custom'
                ? 'bg-blue-50 border-2 border-blue-600 font-semibold text-blue-700'
                : 'bg-white border border-slate-200 text-slate-700 hover:border-slate-300'
            }`}
          >
            Custom
          </button>
        </div>
      </div>

      {/* Simulation Projection Results (4 Telemetry Cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Delta 01: Projected Savings */}
        <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-5 space-y-1.5 transition-all hover:bg-white hover:shadow-sm">
          <div className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">
            // TELEMETRY DELTA 01
          </div>
          <div className="text-xs font-medium text-slate-500">
            Projected Savings
          </div>
          <div className="text-2xl font-display font-bold text-slate-900">
            ₹{simResult.projectedSavings.toLocaleString('en-IN')}
          </div>
          <div className="text-[11px] font-mono text-slate-500 pt-2 border-t border-slate-200">
            Baseline: ₹{simResult.baselineSavings.toLocaleString('en-IN')} (Δ {simResult.baselineSavings >= simResult.projectedSavings ? '-' : '+'}₹{Math.abs(simResult.baselineSavings - simResult.projectedSavings).toLocaleString('en-IN')})
          </div>
        </div>

        {/* Delta 02: Monthly Cash Flow */}
        <div className="rounded-xl border border-rose-200 bg-rose-50/50 p-5 space-y-1.5 transition-all hover:shadow-sm">
          <div className="text-[10px] font-mono text-rose-500 uppercase tracking-wider">
            // TELEMETRY DELTA 02
          </div>
          <div className="text-xs font-medium text-slate-600">
            Monthly Cash Flow
          </div>
          <div className="text-2xl font-display font-bold text-rose-600">
            {simResult.monthlyCashFlowDelta === 0 ? '₹0' : `-₹${Math.abs(simResult.monthlyCashFlowDelta).toLocaleString('en-IN')}`}{' '}
            <span className="text-sm font-normal">/mo</span>
          </div>
          <div className="text-[11px] font-mono text-rose-700/80 pt-2 border-t border-rose-200">
            Impact: {simResult.monthlyCashFlowDelta === 0 ? '0.0% Neutral' : '-26.6% Burn Vector'}
          </div>
        </div>

        {/* Delta 03: Goal Lag */}
        <div className="rounded-xl border border-blue-200 bg-blue-50/40 p-5 space-y-1.5 transition-all hover:shadow-sm">
          <div className="text-[10px] font-mono text-blue-500 uppercase tracking-wider">
            // TELEMETRY DELTA 03
          </div>
          <div className="text-xs font-medium text-slate-600">Goal Lag</div>
          <div className="text-2xl font-display font-bold text-blue-700">
            +{simResult.goalLagMonths} Months
          </div>
          <div className="text-[11px] font-mono text-blue-700/80 pt-2 border-t border-blue-200">
            {simResult.goalLagMonths === 0
              ? 'Zero milestone deviation'
              : 'Emergency Fund shift verified'}
          </div>
        </div>

        {/* Delta 04: Potential Pressure */}
        <div
          className={`rounded-xl p-5 space-y-1.5 transition-all hover:shadow-sm border ${
            simResult.potentialPressure === 'LOW'
              ? 'border-emerald-200 bg-emerald-50/50'
              : simResult.potentialPressure === 'MODERATE'
                ? 'border-amber-200 bg-amber-50/60'
                : 'border-rose-200 bg-rose-50/60'
          }`}
        >
          <div
            className={`text-[10px] font-mono uppercase tracking-wider ${
              simResult.potentialPressure === 'LOW'
                ? 'text-emerald-600'
                : simResult.potentialPressure === 'MODERATE'
                  ? 'text-amber-600'
                  : 'text-rose-600'
            }`}
          >
            // TELEMETRY DELTA 04
          </div>
          <div className="text-xs font-medium text-slate-600">
            Potential Pressure
          </div>
          <div
            className={`text-2xl font-display font-bold ${
              simResult.potentialPressure === 'LOW'
                ? 'text-emerald-600'
                : simResult.potentialPressure === 'MODERATE'
                  ? 'text-amber-600'
                  : 'text-rose-600'
            }`}
          >
            {simResult.potentialPressure}
          </div>
          <div
            className={`text-[11px] font-mono pt-2 border-t ${
              simResult.potentialPressure === 'LOW'
                ? 'text-emerald-700/80 border-emerald-200'
                : simResult.potentialPressure === 'MODERATE'
                  ? 'text-amber-700/80 border-amber-200'
                  : 'text-rose-700/80 border-rose-200'
            }`}
          >
            Stress Index: {simResult.stressIndex}% ({simResult.stressIndex < 30 ? 'Safe margin' : 'Nominal limits'})
          </div>
        </div>
      </div>

      {/* Comparison Summary Note */}
      <div className="p-3.5 rounded-xl bg-blue-50/60 border border-blue-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-slate-700">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-blue-600 text-[18px]">
            insights
          </span>
          <span>
            <strong>Telemetry Comparison:</strong> {simResult.notes}
          </span>
        </div>
        <span className="font-mono text-slate-400 text-[11px] uppercase tracking-wider whitespace-nowrap">
          SIM-HASH: {simResult.simHash}
        </span>
      </div>
    </section>
  );
};
