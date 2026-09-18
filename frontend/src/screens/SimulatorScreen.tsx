'use client';

import React, { useState } from 'react';
import { FinancialTimeMachine } from '../components/FinancialTimeMachine';
import { TrajectoryVisualizer } from '../components/TrajectoryVisualizer';
import { EvidenceIntelligence } from '../components/EvidenceIntelligence';
import { TrajectoryNode } from '../types';
import { useAIInsights } from '../hooks/use-ai-insights';

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

  const { insights, loading, refresh } = useAIInsights({
    analysis_type: 'time_machine',
    financial_position: {
      monthly_income: income,
      monthly_expenses: expenses,
      current_savings: savings,
      monthly_surplus: income - expenses,
      emergency_fund_months: expenses > 0 ? Number((savings / expenses).toFixed(1)) : 3.0,
    },
    simulation_result: {
      scenario: 'purchase_impact',
      data: {
        purchase_amount: purchaseAmount,
        interest_rate: interestRate,
        tenure_months: tenure,
        monthly_emi: monthlyEMI,
        total_repayment: totalRepayment,
      },
    },
  });

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

      {/* AI Intelligence Panel */}
      <EvidenceIntelligence
        insights={insights}
        loading={loading}
        onRefresh={refresh}
        title="TIME MACHINE AI SYNTHESIS"
        subtitle="DYNAMIC TRADE-OFF MATRIX"
      />

      {/* Trajectory Canvas */}
      <TrajectoryVisualizer
        nodes={trajectoryNodes}
        selectedMonth={4}
        onSelectNode={(node) => console.log('Selected node in simulator:', node)}
      />

      {/* Scenarios Comparison Matrix */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 lg:p-8 shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-6">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-blue-600 text-[22px]">
              compare_arrows
            </span>
            <h3 className="text-lg font-display font-bold text-slate-900">
              Scenario Feasibility Comparison
            </h3>
          </div>
          <span className="text-xs font-mono text-slate-500 uppercase">
            4 Simulated Pathways
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {scenarios.map((sc, idx) => (
            <div
              key={idx}
              className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 flex flex-col justify-between hover:border-blue-200 transition-colors"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="text-xs font-mono font-semibold text-slate-500 uppercase">
                    Vector 0{idx + 1}
                  </span>
                  <span
                    className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded uppercase ${
                      sc.badgeColor === 'rose'
                        ? 'bg-rose-50 text-rose-700 border border-rose-200'
                        : sc.badgeColor === 'blue'
                        ? 'bg-blue-50 text-blue-700 border border-blue-200'
                        : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    }`}
                  >
                    {sc.recommendation}
                  </span>
                </div>
                <h4 className="text-sm font-display font-bold text-slate-900">
                  {sc.name}
                </h4>
                <div className="mt-4 space-y-2 text-xs">
                  <div className="flex justify-between text-slate-600">
                    <span>Monthly Cash Flow:</span>
                    <span className="font-mono font-semibold text-slate-900">
                      ₹{sc.monthly.toLocaleString('en-IN')}/mo
                    </span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Total Real Outflow:</span>
                    <span className="font-mono font-semibold text-slate-900">
                      ₹{sc.totalCost.toLocaleString('en-IN')}
                    </span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Liquidity Risk:</span>
                    <span className="font-medium text-slate-800">{sc.bufferRisk}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
