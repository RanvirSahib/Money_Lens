'use client';

import React, { useState } from 'react';
import { Goal } from '../types';
import { INITIAL_GOALS } from '../data/mockData';

export const GoalsScreen: React.FC = () => {
  const [goals, setGoals] = useState<Goal[]>(INITIAL_GOALS);
  const [showNewGoalModal, setShowNewGoalModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newTarget, setNewTarget] = useState(50000);
  const [newDeadline, setNewDeadline] = useState('December 2027');

  const handleAddGoal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    const newGoal: Goal = {
      id: `goal-${Date.now()}`,
      title: newTitle,
      targetAmount: newTarget,
      currentAmount: 0,
      deadline: newDeadline,
      category: 'Target Milestones',
      status: 'on_track',
      monthlyTarget: Math.round(newTarget / 14),
    };
    setGoals([...goals, newGoal]);
    setNewTitle('');
    setShowNewGoalModal(false);
  };

  const totalTarget = goals.reduce((sum, g) => sum + g.targetAmount, 0);
  const totalAccumulated = goals.reduce((sum, g) => sum + g.currentAmount, 0);
  const totalMonthlyCommitment = goals.reduce(
    (sum, g) => sum + g.monthlyTarget,
    0
  );
  const overallPercentage = Math.round((totalAccumulated / totalTarget) * 100);

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 lg:p-8 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono font-medium text-emerald-600 uppercase tracking-wider">
            <span className="material-symbols-outlined text-[18px]">flag</span>
            <span>MILESTONE CONSTELLATION BAY</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-display font-bold text-slate-900 mt-1">
            Financial Goals &amp; Capital Accumulation
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            Track completion velocity, amortize required contributions, and prevent goal collisions.
          </p>
        </div>

        <button
          onClick={() => setShowNewGoalModal(true)}
          className="px-5 py-2.5 bg-blue-600 text-white font-mono text-xs uppercase tracking-wider font-bold rounded-xl hover:bg-blue-700 transition-colors shadow-sm cursor-pointer flex items-center gap-2 self-start md:self-auto"
        >
          <span className="material-symbols-outlined text-[18px]">add</span>
          <span>INITIALIZE NEW GOAL</span>
        </button>
      </div>

      {/* Overview Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
          <div className="text-xs font-mono text-slate-500 uppercase">
            Total Capital Target
          </div>
          <div className="text-3xl font-display font-bold text-slate-900 mt-1">
            ₹{totalTarget.toLocaleString('en-IN')}
          </div>
          <div className="text-xs text-slate-500 mt-1">
            Funded: ₹{totalAccumulated.toLocaleString('en-IN')} ({overallPercentage}%)
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
          <div className="text-xs font-mono text-slate-500 uppercase">
            Aggregate Monthly Commitment
          </div>
          <div className="text-3xl font-display font-bold text-blue-600 mt-1">
            ₹{totalMonthlyCommitment.toLocaleString('en-IN')}
            <span className="text-sm font-normal text-slate-500"> /mo</span>
          </div>
          <div className="text-xs text-blue-600 mt-1 font-mono">
            45.8% of available surplus
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
          <div className="text-xs font-mono text-slate-500 uppercase">
            Overall Goal Velocity
          </div>
          <div className="text-3xl font-display font-bold text-emerald-600 mt-1">
            82%
          </div>
          <div className="text-xs text-emerald-600 mt-1 font-mono">
            Pacing ahead of target deadlines
          </div>
        </div>
      </div>

      {/* Goals Cards List */}
      <div className="space-y-4">
        <h2 className="text-lg font-display font-bold text-slate-900">
          ACTIVE FINANCIAL TRAJECTORIES ({goals.length})
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {goals.map((goal) => {
            const pct = Math.min(
              100,
              Math.round((goal.currentAmount / goal.targetAmount) * 100)
            );
            const isAtRisk = goal.status === 'at_risk';
            const isAccelerated = goal.status === 'accelerated';

            return (
              <div
                key={goal.id}
                className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col justify-between space-y-4 hover:border-slate-300 transition-all"
              >
                <div>
                  <div className="flex items-center justify-between text-xs font-mono mb-2">
                    <span className="text-slate-400 uppercase">
                      {goal.category}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded font-bold text-[10px] uppercase ${
                        isAtRisk
                          ? 'bg-rose-100 text-rose-800'
                          : isAccelerated
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-blue-100 text-blue-800'
                      }`}
                    >
                      {goal.status.replace('_', ' ')}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-slate-900 font-display">
                    {goal.title}
                  </h3>

                  <div className="flex items-baseline justify-between mt-3">
                    <span className="text-2xl font-bold font-display text-slate-900">
                      ₹{goal.currentAmount.toLocaleString('en-IN')}
                    </span>
                    <span className="text-xs font-mono text-slate-400">
                      of ₹{goal.targetAmount.toLocaleString('en-IN')}
                    </span>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden mt-2">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        isAtRisk
                          ? 'bg-rose-500'
                          : isAccelerated
                            ? 'bg-emerald-500'
                            : 'bg-blue-600'
                      }`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-[11px] font-mono text-slate-500 mt-1">
                    <span>{pct}% Completed</span>
                    <span>Deadline: {goal.deadline}</span>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-mono">
                  <span className="text-slate-500">Required:</span>
                  <span className="text-blue-600 font-bold">
                    ₹{goal.monthlyTarget.toLocaleString('en-IN')} /mo
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* New Goal Modal */}
      {showNewGoalModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-md shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-display font-bold text-slate-900">
                Initialize Target Goal
              </h3>
              <button
                onClick={() => setShowNewGoalModal(false)}
                className="text-slate-400 hover:text-slate-700"
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleAddGoal} className="space-y-4">
              <div>
                <label className="block text-xs font-mono uppercase text-slate-500 mb-1">
                  Goal Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Electric Vehicle Down Payment"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm font-medium focus:bg-white"
                />
              </div>
              <div>
                <label className="block text-xs font-mono uppercase text-slate-500 mb-1">
                  Target Amount (₹)
                </label>
                <input
                  type="number"
                  required
                  value={newTarget}
                  onChange={(e) => setNewTarget(Number(e.target.value))}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm font-mono focus:bg-white"
                />
              </div>
              <div>
                <label className="block text-xs font-mono uppercase text-slate-500 mb-1">
                  Target Deadline
                </label>
                <input
                  type="text"
                  required
                  value={newDeadline}
                  onChange={(e) => setNewDeadline(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm font-medium focus:bg-white"
                />
              </div>
              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowNewGoalModal(false)}
                  className="flex-1 py-2.5 border border-slate-300 text-slate-700 text-xs font-mono uppercase rounded-xl hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-blue-600 text-white text-xs font-mono uppercase font-bold rounded-xl hover:bg-blue-700 shadow-sm"
                >
                  Create Goal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
