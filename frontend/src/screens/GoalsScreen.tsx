'use client';

import React, { useState, useEffect } from 'react';
import { Goal } from '../types';
import { EvidenceIntelligence } from '../components/EvidenceIntelligence';
import { useAIInsights } from '../hooks/use-ai-insights';
import { formatINR, parseIndianCurrency } from '@/lib/utils/currency';
import { getSavedGoals, saveGoal, deleteSavedGoal, calculateGoal } from '@/lib/api/goals';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';

export const GoalsScreen: React.FC = () => {
  const { user } = useAuth();
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loadingGoals, setLoadingGoals] = useState(true);
  const [showNewGoalModal, setShowNewGoalModal] = useState(false);
  const [savingGoal, setSavingGoal] = useState(false);

  // Modal form states
  const [newTitle, setNewTitle] = useState('');
  const [newTargetStr, setNewTargetStr] = useState('5,00,000');
  const [newInitialAllocatedStr, setNewInitialAllocatedStr] = useState('50,000');
  const [newMonths, setNewMonths] = useState(12);
  const [newCategory, setNewCategory] = useState('Milestone Target');

  const monthlyIncome = user?.monthlyIncome ?? 85000;
  const monthlyExpenses = user?.monthlyExpenses ?? 35000;
  const monthlySurplus = monthlyIncome - monthlyExpenses;

  const [goalError, setGoalError] = useState<string | null>(null);

  // Load real saved goals from AWS RDS PostgreSQL on mount
  const loadGoals = async () => {
    setLoadingGoals(true);
    try {
      const liveSaved = await getSavedGoals();
      if (liveSaved && liveSaved.length > 0) {
        const mapped: Goal[] = liveSaved.map((item: any) => {
          const target = item.target_amount || 0;
          const current = item.current_savings_allocated || item.current_amount || 0;
          const months = item.target_months || item.deadline_months || 12;
          const reqMonthly = months > 0 ? Math.round((target - current) / months) : 0;
          return {
            id: String(item.id || item.goal_id),
            title: item.title,
            targetAmount: target,
            currentAmount: current,
            deadline: `${months} Months`,
            category: item.category || 'Financial Goal',
            status: reqMonthly <= monthlySurplus ? 'on_track' : 'at_risk',
            monthlyTarget: reqMonthly,
          };
        });
        setGoals(mapped);
      } else {
        // Default real initial template if database has no rows yet
        setGoals([
          {
            id: 'default-emergency',
            title: '6-Month Emergency Liquidity Reserve',
            targetAmount: monthlyExpenses * 6,
            currentAmount: user?.currentSavings ?? 150000,
            deadline: '12 Months',
            category: 'Safety Buffer',
            status: 'on_track',
            monthlyTarget: Math.round(Math.max(0, (monthlyExpenses * 6) - (user?.currentSavings ?? 150000)) / 12),
          }
        ]);
      }
    } catch (err) {
      console.warn("Could not load goals from backend:", err);
    } finally {
      setLoadingGoals(false);
    }
  };

  useEffect(() => {
    loadGoals();
  }, [user]);

  const newTarget = parseIndianCurrency(newTargetStr) ?? 500000;
  const newInitial = parseIndianCurrency(newInitialAllocatedStr) ?? 0;
  const remaining = Math.max(0, newTarget - newInitial);
  const calculatedMonthly = newMonths > 0 ? Math.round(remaining / newMonths) : remaining;

  const handleAddGoal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    setSavingGoal(true);
    setGoalError(null);

    let isReachable = calculatedMonthly <= monthlySurplus;
    let reqMonthly = calculatedMonthly;
    let savedId = `goal-${Date.now()}`;

    try {
      // 1. Calculate deterministic feasibility via backend calculation engine
      try {
        const calcResult = await calculateGoal({
          title: newTitle.trim(),
          target_amount: newTarget,
          current_savings_allocated: newInitial,
          target_months: newMonths,
          monthly_income: monthlyIncome,
          monthly_expenses: monthlyExpenses,
        });
        if (calcResult) {
          isReachable = calcResult.is_reachable ?? isReachable;
          reqMonthly = calcResult.required_monthly_saving ?? reqMonthly;
        }
      } catch (calcErr: any) {
        console.warn("Calculation API note:", calcErr);
      }

      // 2. Persist directly to AWS RDS PostgreSQL
      const saved = await saveGoal({
        title: newTitle.trim(),
        target_amount: newTarget,
        current_savings_allocated: newInitial,
        target_months: newMonths,
        category: newCategory,
      });

      if (saved && (saved.id || saved.goal_id)) {
        savedId = String(saved.id || saved.goal_id);
      }

      const newGoal: Goal = {
        id: savedId,
        title: newTitle.trim(),
        targetAmount: newTarget,
        currentAmount: newInitial,
        deadline: `${newMonths} Months`,
        category: newCategory,
        status: isReachable ? 'on_track' : 'at_risk',
        monthlyTarget: reqMonthly,
      };

      setGoals((prev) => [newGoal, ...prev]);
      setNewTitle('');
      setNewTargetStr('5,00,000');
      setNewInitialAllocatedStr('0');
      setNewMonths(12);
      setShowNewGoalModal(false);
    } catch (err: any) {
      console.error("Failed to save goal to database:", err);
      setGoalError(err?.message || "Failed to persist goal to backend. Please check network connection.");
    } finally {
      setSavingGoal(false);
    }
  };

  const handleDeleteGoal = async (id: string) => {
    try {
      await deleteSavedGoal(id);
      setGoals((prev) => prev.filter((g) => g.id !== id));
    } catch (err) {
      console.error("Failed to delete goal:", err);
      setGoals((prev) => prev.filter((g) => g.id !== id));
    }
  };

  const totalTarget = goals.reduce((sum, g) => sum + g.targetAmount, 0);
  const totalAccumulated = goals.reduce((sum, g) => sum + g.currentAmount, 0);
  const totalMonthlyCommitment = goals.reduce((sum, g) => sum + g.monthlyTarget, 0);
  const overallPercentage = totalTarget > 0 ? Math.round((totalAccumulated / totalTarget) * 100) : 0;

  const { insights, loading, refresh } = useAIInsights({
    analysis_type: 'goal_analysis',
    goal: {
      title: goals[0]?.title || 'Capital Goals Portfolio',
      target_amount: totalTarget,
      current_savings_allocated: totalAccumulated,
      required_monthly_saving: totalMonthlyCommitment,
      is_reachable: totalMonthlyCommitment <= monthlySurplus,
    },
  });

  return (
    <div className="space-y-8 animate-in fade-in duration-300 text-left">
      {/* Header Banner */}
      <div className="bg-white rounded-3xl border border-slate-200/90 p-6 lg:p-8 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-blue-700 uppercase tracking-wider">
              <span className="material-symbols-outlined text-[18px]">flag</span>
              <span>Sinking Fund Schedulers</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-display font-bold text-slate-900 mt-1">
              Financial Goals Portfolio
            </h1>
            <p className="text-sm text-slate-600 mt-1">
              Synchronized backward-propagating sinking funds for future capital allocations.
            </p>
          </div>
          <button
            onClick={() => setShowNewGoalModal(true)}
            className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-sky-600 text-white font-display text-xs uppercase tracking-wider font-bold rounded-xl hover:from-blue-700 hover:to-sky-700 transition-all shadow-sm active:scale-95 cursor-pointer flex items-center gap-2 self-start md:self-auto"
          >
            <span className="material-symbols-outlined text-[18px]">add_circle</span>
            <span>Create Goal</span>
          </button>
        </div>

        {/* Global Progress Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8 pt-6 border-t border-slate-100">
          <div>
            <div className="text-xs font-mono text-slate-500 uppercase">TOTAL CAPITAL TARGET</div>
            <div className="text-3xl font-display font-bold text-slate-900 mt-1">
              {formatINR(totalTarget)}
            </div>
          </div>
          <div>
            <div className="text-xs font-mono text-slate-500 uppercase">ACCUMULATED SINKING CAPITAL</div>
            <div className="text-3xl font-display font-bold text-blue-600 mt-1">
              {formatINR(totalAccumulated)}
              <span className="text-sm font-normal text-slate-500 ml-2">
                ({overallPercentage}%)
              </span>
            </div>
          </div>
          <div>
            <div className="text-xs font-mono text-slate-500 uppercase">MONTHLY SINKING REQUISITION</div>
            <div className={`text-3xl font-display font-bold mt-1 ${totalMonthlyCommitment <= monthlySurplus ? 'text-emerald-600' : 'text-amber-600'}`}>
              {formatINR(totalMonthlyCommitment)}
              <span className="text-sm font-normal text-slate-500 ml-1">/mo</span>
            </div>
          </div>
        </div>
      </div>

      {/* Goals Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {goals.map((goal) => {
          const progress = goal.targetAmount > 0
            ? Math.min(100, Math.round((goal.currentAmount / goal.targetAmount) * 100))
            : 0;

          return (
            <div
              key={goal.id}
              className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-sm hover:shadow-md transition-shadow relative flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <span className="text-[11px] font-mono font-semibold text-slate-400 uppercase">
                    {goal.category}
                  </span>
                  <div className="flex items-center gap-1.5">
                    <span
                      className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded uppercase ${
                        goal.status === 'on_track'
                          ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                          : 'bg-rose-50 text-rose-800 border border-rose-200'
                      }`}
                    >
                      {goal.status === 'on_track' ? 'Achievable' : 'Stretch Target'}
                    </span>
                    <button
                      onClick={() => handleDeleteGoal(goal.id)}
                      className="text-slate-400 hover:text-rose-600 p-1 rounded-lg transition-colors cursor-pointer"
                      title="Delete Goal"
                    >
                      <span className="material-symbols-outlined text-[16px]">delete</span>
                    </button>
                  </div>
                </div>

                <h3 className="text-lg font-display font-bold text-slate-900 mt-2">
                  {goal.title}
                </h3>

                <div className="mt-4 flex items-baseline justify-between text-xs">
                  <span className="text-slate-500">Accumulated</span>
                  <span className="font-mono font-bold text-slate-900">
                    {formatINR(goal.currentAmount)} of {formatINR(goal.targetAmount)}
                  </span>
                </div>

                {/* Progress Bar */}
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden mt-2">
                  <div
                    className="h-full bg-gradient-to-r from-blue-600 to-sky-500 rounded-full transition-all duration-500"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-slate-500">Monthly Sinking Allocation:</span>
                <span className="font-mono font-bold text-blue-700">
                  {formatINR(goal.monthlyTarget)}/mo
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* AI Intelligence Panel */}
      <EvidenceIntelligence
        insights={insights}
        loading={loading}
        onRefresh={refresh}
        title="Goal Sinking Strategy & Feasibility"
        subtitle="Deterministic Goal Allocation Engine"
      />

      {/* Create New Goal Modal */}
      {showNewGoalModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-xs">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-6"
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-lg font-display font-bold text-slate-900">Create Financial Goal</h3>
                <p className="text-xs text-slate-500">Persists directly to AWS RDS PostgreSQL</p>
              </div>
              <button
                onClick={() => setShowNewGoalModal(false)}
                className="text-slate-400 hover:text-slate-700 p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            {goalError && (
              <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-start gap-2">
                <span className="font-bold">⚠️</span>
                <span>{goalError}</span>
              </div>
            )}

            <form onSubmit={handleAddGoal} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Goal Title / Purpose
                </label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Electric Vehicle Downpayment"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-xs font-medium text-slate-900 focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Target Amount (₹)
                </label>
                <input
                  type="text"
                  required
                  value={newTargetStr}
                  onChange={(e) => setNewTargetStr(e.target.value)}
                  placeholder="5,00,000"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-xs font-medium text-slate-900 focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Initial Savings Already Allocated (₹)
                </label>
                <input
                  type="text"
                  value={newInitialAllocatedStr}
                  onChange={(e) => setNewInitialAllocatedStr(e.target.value)}
                  placeholder="0"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-xs font-medium text-slate-900 focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Target Timeline (Months): {newMonths} Months
                </label>
                <input
                  type="range"
                  min="3"
                  max="60"
                  step="1"
                  value={newMonths}
                  onChange={(e) => setNewMonths(parseInt(e.target.value))}
                  className="w-full accent-blue-600 cursor-pointer"
                />
              </div>

              <div className="p-3 bg-blue-50/80 rounded-2xl border border-blue-200/80 text-xs flex justify-between items-center">
                <span className="text-slate-700 font-medium">Required Monthly Sinking:</span>
                <span className="font-display font-bold text-sm text-blue-700">
                  {formatINR(calculatedMonthly)}/mo
                </span>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowNewGoalModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 rounded-xl transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingGoal || !newTitle.trim()}
                  className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-sky-600 hover:from-blue-700 hover:to-sky-700 text-white font-display text-xs font-bold rounded-xl transition-all shadow-sm active:scale-95 cursor-pointer disabled:opacity-50"
                >
                  {savingGoal ? "Persisting..." : "Save Goal to Database"}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
};
