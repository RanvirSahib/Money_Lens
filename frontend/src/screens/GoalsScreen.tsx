'use client';

import React, { useState } from 'react';
import { Goal } from '../types';
import { INITIAL_GOALS } from '../data/mockData';
import { EvidenceIntelligence } from '../components/EvidenceIntelligence';
import { useAIInsights } from '../hooks/use-ai-insights';

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
            Monthly Sinking Commitment
          </div>
          <div className="text-3xl font-display font-bold text-blue-600 mt-1">
            ₹{totalMonthlyCommitment.toLocaleString('en-IN')}/mo
          </div>
          <div className="text-xs text-slate-500 mt-1">
            Across {goals.length} Active Targets
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
          <div className="text-xs font-mono text-slate-500 uppercase">
            Constellation Health
          </div>
          <div className="text-3xl font-display font-bold text-emerald-600 mt-1">
            {overallPercentage}% Complete
          </div>
          <div className="text-xs text-slate-500 mt-1">
            Zero Collisions Detected
          </div>
        </div>
      </div>

      {/* Goals Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {goals.map((g) => {
          const pct = Math.min(100, Math.round((g.currentAmount / g.targetAmount) * 100));
          return (
            <div
              key={g.id}
              className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col justify-between hover:border-slate-300 transition-colors"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className="text-[11px] font-mono font-semibold text-slate-400 uppercase">
                    {g.category}
                  </span>
                  <span
                    className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded uppercase ${
                      g.status === 'on_track'
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : 'bg-amber-50 text-amber-700 border border-amber-200'
                    }`}
                  >
                    {g.status === 'on_track' ? 'ON TRACK' : 'ADJUST REQD'}
                  </span>
                </div>
                <h3 className="text-lg font-display font-bold text-slate-900">
                  {g.title}
                </h3>
                <div className="mt-4 space-y-2">
                  <div className="flex justify-between text-xs text-slate-600">
                    <span>Progress:</span>
                    <span className="font-mono font-bold text-slate-900">
                      ₹{g.currentAmount.toLocaleString('en-IN')} / ₹{g.targetAmount.toLocaleString('en-IN')}
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                <span>Target: {g.deadline}</span>
                <span className="font-mono font-semibold text-slate-800">
                  ₹{g.monthlyTarget.toLocaleString('en-IN')}/mo
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
        title="GOAL VELOCITY AI INTELLIGENCE"
        subtitle="ACCELERATION VECTORS"
      />
    </div>
  );
};
