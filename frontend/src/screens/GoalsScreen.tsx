'use client';

import React, { useState } from 'react';
import { Goal } from '../types';
import { INITIAL_GOALS } from '../data/mockData';
import { EvidenceIntelligence } from '../components/EvidenceIntelligence';
import { useAIInsights } from '../hooks/use-ai-insights';
import { formatINR, parseIndianCurrency } from '@/lib/utils/currency';

export const GoalsScreen: React.FC = () => {
  const [goals, setGoals] = useState<Goal[]>(INITIAL_GOALS);
  const [showNewGoalModal, setShowNewGoalModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newTargetStr, setNewTargetStr] = useState('5,00,000');
  const [newInitialAllocatedStr, setNewInitialAllocatedStr] = useState('50,000');
  const [newMonths, setNewMonths] = useState(12);
  const [newCategory, setNewCategory] = useState('Milestone Target');

  const newTarget = parseIndianCurrency(newTargetStr) ?? 500000;
  const newInitial = parseIndianCurrency(newInitialAllocatedStr) ?? 0;
  const remaining = Math.max(0, newTarget - newInitial);
  const calculatedMonthly = newMonths > 0 ? Math.round(remaining / newMonths) : remaining;

  const handleAddGoal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const deadlineDate = new Date();
    deadlineDate.setMonth(deadlineDate.getMonth() + newMonths);
    const deadlineStr = deadlineDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

    const newGoal: Goal = {
      id: `goal-${Date.now()}`,
      title: newTitle.trim(),
      targetAmount: newTarget,
      currentAmount: newInitial,
      deadline: deadlineStr,
      category: newCategory,
      status: calculatedMonthly <= 30000 ? 'on_track' : 'at_risk',
      monthlyTarget: calculatedMonthly,
    };

    setGoals((prev) => [newGoal, ...prev]);
    setNewTitle('');
    setNewTargetStr('5,00,000');
    setNewInitialAllocatedStr('0');
    setNewMonths(12);
    setShowNewGoalModal(false);
  };

  const handleDeleteGoal = (id: string) => {
    setGoals((prev) => prev.filter((g) => g.id !== id));
  };

  const totalTarget = goals.reduce((sum, g) => sum + g.targetAmount, 0);
  const totalAccumulated = goals.reduce((sum, g) => sum + g.currentAmount, 0);
  const totalMonthlyCommitment = goals.reduce(
    (sum, g) => sum + g.monthlyTarget,
    0
  );
  const overallPercentage = totalTarget > 0 ? Math.round((totalAccumulated / totalTarget) * 100) : 0;

  const { insights, loading, refresh } = useAIInsights({
    analysis_type: 'goal_analysis',
    goal: {
      title: goals[0]?.title || 'Capital Goals Constellation',
      target_amount: totalTarget,
      current_savings_allocated: totalAccumulated,
      required_monthly_saving: totalMonthlyCommitment,
      is_reachable: totalMonthlyCommitment <= 30000,
    },
  });

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="bg-white rounded-3xl border border-slate-200/90 p-6 lg:p-8 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-blue-700 uppercase tracking-wider">
            <span className="material-symbols-outlined text-[18px]">flag</span>
            <span>Financial Milestones</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-display font-bold text-slate-900 mt-1">
            Goals &amp; Sinking Funds
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            Track goal velocity, required monthly contributions, and estimated completion timelines.
          </p>
        </div>

        <button
          onClick={() => setShowNewGoalModal(true)}
          className="px-5 py-2.5 bg-blue-600 text-white font-display text-xs uppercase tracking-wider font-bold rounded-xl hover:bg-blue-700 transition-all shadow-sm active:scale-95 cursor-pointer flex items-center gap-2 self-start md:self-auto"
        >
          <span className="material-symbols-outlined text-[18px]">add</span>
          <span>ADD NEW GOAL</span>
        </button>
      </div>

      {/* Overview Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
          <div className="text-xs font-mono text-slate-500 uppercase">
            Total Capital Target
          </div>
          <div className="text-3xl font-display font-bold text-slate-900 mt-1">
            {formatINR(totalTarget)}
          </div>
          <div className="text-xs text-slate-500 mt-1">
            Funded: {formatINR(totalAccumulated)} ({overallPercentage}%)
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
          <div className="text-xs font-mono text-slate-500 uppercase">
            Monthly Sinking Commitment
          </div>
          <div className="text-3xl font-display font-bold text-blue-600 mt-1">
            {formatINR(totalMonthlyCommitment)}/mo
          </div>
          <div className="text-xs text-slate-500 mt-1">
            Across {goals.length} Active Targets
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
          <div className="text-xs font-mono text-slate-500 uppercase">
            Milestone Health
          </div>
          <div className="text-3xl font-display font-bold text-emerald-600 mt-1">
            {overallPercentage}% Complete
          </div>
          <div className="text-xs text-slate-500 mt-1">
            {goals.filter((g) => g.status === 'on_track').length} of {goals.length} Goals on Schedule
          </div>
        </div>
      </div>

      {/* Goals Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {goals.map((g) => {
          const pct = Math.min(100, Math.round((g.currentAmount / Math.max(1, g.targetAmount)) * 100));
          return (
            <div
              key={g.id}
              className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col justify-between hover:border-slate-300 transition-colors relative group"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className="text-[11px] font-mono font-semibold text-slate-400 uppercase">
                    {g.category}
                  </span>
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded uppercase ${
                        g.status === 'on_track'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-amber-50 text-amber-700 border border-amber-200'
                      }`}
                    >
                      {g.status === 'on_track' ? 'ON TRACK' : 'ADJUST REQD'}
                    </span>
                    <button
                      onClick={() => handleDeleteGoal(g.id)}
                      className="text-slate-300 hover:text-rose-600 p-1 rounded transition-colors cursor-pointer"
                      title="Delete Goal"
                    >
                      <span className="material-symbols-outlined text-[16px]">delete</span>
                    </button>
                  </div>
                </div>
                <h3 className="text-lg font-display font-bold text-slate-900">
                  {g.title}
                </h3>
                <div className="mt-4 space-y-2">
                  <div className="flex justify-between text-xs text-slate-600">
                    <span>Progress:</span>
                    <span className="font-mono font-bold text-slate-900">
                      {formatINR(g.currentAmount)} / {formatINR(g.targetAmount)}
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                <span>Target: {g.deadline}</span>
                <span className="font-mono font-semibold text-blue-700">
                  {formatINR(g.monthlyTarget)}/mo
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* AI Intelligence Evidence Panel */}
      <EvidenceIntelligence
        insights={insights}
        loading={loading}
        onRefresh={refresh}
        title="Goal Velocity AI Intelligence"
        subtitle="Sinking Fund Feasibility"
      />

      {/* Add New Goal Modal */}
      {showNewGoalModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 max-w-lg w-full shadow-2xl space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600">
                  <span className="material-symbols-outlined text-[20px]">flag</span>
                </div>
                <div>
                  <h3 className="text-lg font-display font-bold text-slate-900">Add New Financial Goal</h3>
                  <p className="text-xs text-slate-500 font-normal">Set your target amount and timeline</p>
                </div>
              </div>
              <button
                onClick={() => setShowNewGoalModal(false)}
                className="text-slate-400 hover:text-slate-700 p-1.5 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddGoal} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Goal Name
                </label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g., Emergency Safety Fund, House Downpayment, Car"
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Target Amount (INR)
                  </label>
                  <input
                    type="text"
                    required
                    value={newTargetStr}
                    onChange={(e) => setNewTargetStr(e.target.value)}
                    placeholder="e.g. 5,00,000 or 5 lakh"
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600"
                  />
                  <div className="text-[11px] font-mono text-slate-500 mt-1">
                    Resolved: {formatINR(newTarget)}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Already Saved (INR)
                  </label>
                  <input
                    type="text"
                    value={newInitialAllocatedStr}
                    onChange={(e) => setNewInitialAllocatedStr(e.target.value)}
                    placeholder="e.g. 50,000 or 0"
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600"
                  />
                  <div className="text-[11px] font-mono text-slate-500 mt-1">
                    Resolved: {formatINR(newInitial)}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Target Timeline (Months)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="120"
                    value={newMonths}
                    onChange={(e) => setNewMonths(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Category
                  </label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600"
                  >
                    <option value="Emergency Safety">Emergency Safety</option>
                    <option value="Milestone Target">Milestone Target</option>
                    <option value="Asset Purchase">Asset Purchase</option>
                    <option value="Vacation & Travel">Vacation & Travel</option>
                    <option value="Education">Education</option>
                  </select>
                </div>
              </div>

              {/* Calculated Monthly Requirement Preview */}
              <div className="p-3.5 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-between text-xs">
                <span className="text-slate-700 font-medium">Required Monthly Sinking Contribution:</span>
                <span className="font-display font-bold text-sm text-blue-700">
                  {formatINR(calculatedMonthly)}/mo
                </span>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowNewGoalModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!newTitle.trim() || newTarget <= 0}
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-200 disabled:text-slate-400 text-white font-display text-xs font-bold rounded-xl transition-all shadow-sm active:scale-95 cursor-pointer"
                >
                  SAVE GOAL
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
