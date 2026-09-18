'use client';

import React, { useState } from 'react';
import { FinancialTimeMachine } from '../components/FinancialTimeMachine';
import { TrajectoryVisualizer } from '../components/TrajectoryVisualizer';
import { TrajectoryNode } from '../types';

interface SimulatorScreenProps {
  trajectoryNodes: TrajectoryNode[];
  savings?: number;
  income?: number;
  expenses?: number;
}

export const SimulatorScreen: React.FC<SimulatorScreenProps> = ({
  trajectoryNodes,
  savings = 40000,
  income = 55000,
  expenses = 25000,
}) => {
  const [purchaseAmount, setPurchaseAmount] = useState(80000);
  const [interestRate, setInterestRate] = useState(14);
  const [tenure, setTenure] = useState(12);

  const monthlyEMI = Math.round(
    (purchaseAmount * (1 + (interestRate / 100) * (tenure / 12))) / tenure
  );
  const totalRepayment = monthlyEMI * tenure;
  const interestTotal = totalRepayment - purchaseAmount;

  // Comparison matrix options
  const scenarios = [
    {
      name: 'Full Lump-Sum (Cash Outright)',
      monthly: 0,
      initialHit: purchaseAmount,
      totalCost: purchaseAmount,
      bufferRisk: 'Elevated (Drops to 0.4 mo)',
      recommendation: 'Not Recommended',
      badgeColor: 'rose',
    },
    {
      name: `Active EMI (${tenure} Months @ ${interestRate}%)`,
      monthly: monthlyEMI,
      initialHit: 0,
      totalCost: totalRepayment,
      bufferRisk: 'Moderate (Safe buffer 1.3 mo)',
      recommendation: 'Optimal Balance',
      badgeColor: 'blue',
    },
    {
      name: 'Save First (Wait 6 Months)',
      monthly: Math.round(purchaseAmount / 6),
      initialHit: 0,
      totalCost: purchaseAmount,
      bufferRisk: 'Minimal (Buffer intact at 1.8 mo)',
      recommendation: 'Safest Vector',
      badgeColor: 'emerald',
    },
    {
      name: 'Wait 3 Months (Apply Bonus)',
      monthly: Math.round(purchaseAmount / 12),
      initialHit: 0,
      totalCost: totalRepayment,
      bufferRisk: 'Low (Bonus offsets ₹50,000)',
      recommendation: 'High Strategic Advantage',
      badgeColor: 'emerald',
    },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Page Header */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 lg:p-8 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono font-medium text-blue-600 uppercase tracking-wider">
              <span className="material-symbols-outlined text-[18px]">
                science
              </span>
              <span>SIMULATION LAB // MULTI-SCENARIO ENGINE</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-display font-bold text-slate-900 mt-1">
              Financial Time Machine &amp; Stress Simulator
            </h1>
            <p className="text-sm text-slate-600 mt-1">
              Simulate leverage impact, liquidity drawdown, and runway degradation across custom parameters.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs font-mono px-3 py-1.5 bg-blue-50 border border-blue-200 text-blue-700 rounded-lg font-semibold">
              RUNNING MODEL: STOCHASTIC EMI
            </span>
          </div>
        </div>
      </div>

      {/* Main Interactive Subsystem */}
      <FinancialTimeMachine
        currentSavings={savings}
        monthlyIncome={income}
        monthlyExpenses={expenses}
      />

      {/* Parameter Adjustment Deck */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
          <div className="flex justify-between items-center text-xs font-mono font-semibold text-slate-600 uppercase">
            <span>Purchase Capital</span>
            <span className="text-blue-600 font-bold text-sm">
              ₹{purchaseAmount.toLocaleString('en-IN')}
            </span>
          </div>
          <input
            type="range"
            min="10000"
            max="300000"
            step="5000"
            value={purchaseAmount}
            onChange={(e) => setPurchaseAmount(Number(e.target.value))}
            className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
          />
          <div className="flex justify-between text-[10px] font-mono text-slate-400">
            <span>₹10,000</span>
            <span>₹1,50,000</span>
            <span>₹3,00,000</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
          <div className="flex justify-between items-center text-xs font-mono font-semibold text-slate-600 uppercase">
            <span>Tenure Period</span>
            <span className="text-blue-600 font-bold text-sm">
              {tenure} Months
            </span>
          </div>
          <input
            type="range"
            min="3"
            max="36"
            step="3"
            value={tenure}
            onChange={(e) => setTenure(Number(e.target.value))}
            className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
          />
          <div className="flex justify-between text-[10px] font-mono text-slate-400">
            <span>3M</span>
            <span>12M</span>
            <span>24M</span>
            <span>36M</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
          <div className="flex justify-between items-center text-xs font-mono font-semibold text-slate-600 uppercase">
            <span>Annual Interest APR</span>
            <span className="text-blue-600 font-bold text-sm">
              {interestRate}%
            </span>
          </div>
          <input
            type="range"
            min="0"
            max="24"
            step="1"
            value={interestRate}
            onChange={(e) => setInterestRate(Number(e.target.value))}
            className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
          />
          <div className="flex justify-between text-[10px] font-mono text-slate-400">
            <span>0% (No-Cost)</span>
            <span>12%</span>
            <span>24%</span>
          </div>
        </div>
      </div>

      {/* Side-by-Side Scenario Evaluation Matrix */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 lg:p-8 shadow-sm space-y-5">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h3 className="text-lg font-display font-bold text-slate-900">
            COMPARATIVE DECISION MATRIX
          </h3>
          <span className="text-xs font-mono text-slate-400">
            FINANCING VS LIQUIDITY PRESERVATION
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {scenarios.map((scen, idx) => (
            <div
              key={idx}
              className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 flex flex-col justify-between space-y-4 hover:bg-white hover:border-blue-400 hover:shadow-md transition-all"
            >
              <div className="space-y-2">
                <div className="text-xs font-mono font-bold text-slate-700">
                  {scen.name}
                </div>
                <div className="text-2xl font-display font-extrabold text-slate-900">
                  {scen.monthly > 0 ? (
                    <>
                      ₹{scen.monthly.toLocaleString('en-IN')}{' '}
                      <span className="text-xs font-normal text-slate-500">
                        /mo
                      </span>
                    </>
                  ) : (
                    `₹${scen.initialHit.toLocaleString('en-IN')}`
                  )}
                </div>
                <div className="text-xs text-slate-500 font-mono">
                  Total Outflow: ₹{scen.totalCost.toLocaleString('en-IN')}
                </div>
              </div>

              <div className="pt-3 border-t border-slate-200 space-y-2 text-xs font-mono">
                <div className="text-slate-600">
                  Buffer: <span className="font-semibold">{scen.bufferRisk}</span>
                </div>
                <div
                  className={`inline-block px-2 py-0.5 rounded text-[11px] font-bold ${
                    scen.badgeColor === 'emerald'
                      ? 'bg-emerald-100 text-emerald-800'
                      : scen.badgeColor === 'blue'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-rose-100 text-rose-800'
                  }`}
                >
                  {scen.recommendation}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Trajectory projection under simulation */}
      <TrajectoryVisualizer
        nodes={trajectoryNodes}
        selectedMonth={3}
      />
    </div>
  );
};
