'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  PieChart as PieIcon, 
  TrendingUp, 
  Calendar, 
  ShoppingBag, 
  Coffee, 
  Zap, 
  Utensils, 
  Tv, 
  HeartPulse, 
  GraduationCap, 
  Plane, 
  HelpCircle,
  Truck,
  Car,
  AlertCircle,
  ArrowRight,
  Sparkles
} from 'lucide-react';
import { SpendingInsightsData, CategorySpendingItem, SpendingObservation } from '@/types';
import { getSpendingInsights } from '@/lib/api/spending';
import { formatINR } from '@/lib/utils/currency';

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  Food: <ShoppingBag className="w-4 h-4 text-emerald-600" />,
  Restaurants: <Coffee className="w-4 h-4 text-amber-600" />,
  'Food Delivery': <Utensils className="w-4 h-4 text-orange-600" />,
  Shopping: <ShoppingBag className="w-4 h-4 text-blue-600" />,
  Transport: <Car className="w-4 h-4 text-slate-600" />,
  Entertainment: <Tv className="w-4 h-4 text-purple-600" />,
  Subscriptions: <Zap className="w-4 h-4 text-indigo-600" />,
  Utilities: <Zap className="w-4 h-4 text-yellow-600" />,
  Healthcare: <HeartPulse className="w-4 h-4 text-rose-600" />,
  Education: <GraduationCap className="w-4 h-4 text-sky-600" />,
  Travel: <Plane className="w-4 h-4 text-teal-600" />,
  Other: <HelpCircle className="w-4 h-4 text-slate-400" />,
};

export const SpendingScreen: React.FC = () => {
  const [data, setData] = useState<SpendingInsightsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'essential' | 'discretionary'>('all');

  useEffect(() => {
    loadSpending();
  }, []);

  const loadSpending = async () => {
    setIsLoading(true);
    try {
      const res = await getSpendingInsights();
      setData(res);
    } catch (err) {
      console.error('Failed to load spending insights:', err);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading || !data) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-3 border-emerald-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs font-mono text-slate-500 uppercase tracking-wider">Analyzing Outflow Telemetry...</p>
        </div>
      </div>
    );
  }

  const filteredCategories = data.categories.filter((cat) => {
    if (filter === 'essential') return cat.is_essential;
    if (filter === 'discretionary') return !cat.is_essential;
    return true;
  });

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 text-xs font-semibold uppercase tracking-wider bg-emerald-50 text-emerald-700 rounded-md border border-emerald-200">
              Spending Intelligence
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 mt-2">
            Categorized Spending Insights
          </h1>
          <p className="text-sm text-slate-500 mt-1 max-w-2xl">
            Neutral, evidence-based decomposition of your monthly expenses across 12 standard categories, behavioral patterns, and recurring commitments.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-xl self-start md:self-auto">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors cursor-pointer ${
              filter === 'all' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            All Categories
          </button>
          <button
            onClick={() => setFilter('essential')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors cursor-pointer ${
              filter === 'essential' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Essential
          </button>
          <button
            onClick={() => setFilter('discretionary')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors cursor-pointer ${
              filter === 'discretionary' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Discretionary
          </button>
        </div>
      </div>

      {/* Summary Vitals Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-1">
          <span className="text-xs text-slate-500 font-medium">Total Monthly Spending</span>
          <div className="text-2xl font-bold text-slate-900 tracking-tight">
            {formatINR(data.total_spending)}
          </div>
          <p className="text-[11px] text-slate-400">100% of tracked outflows</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-1">
          <span className="text-xs text-slate-500 font-medium">Essential vs Discretionary</span>
          <div className="text-2xl font-bold text-slate-900 tracking-tight">
            {data.essential_pct}% <span className="text-sm font-normal text-slate-400">/ {data.discretionary_pct}%</span>
          </div>
          <p className="text-[11px] text-slate-400">{formatINR(data.essential_total)} essential floor</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-1">
          <span className="text-xs text-slate-500 font-medium">Fixed Recurring Baseline</span>
          <div className="text-2xl font-bold text-emerald-600 tracking-tight">
            {formatINR(data.recurring_total)}
          </div>
          <p className="text-[11px] text-slate-400">Utilities + Digital Subscriptions</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-1">
          <span className="text-xs text-slate-500 font-medium">Weekend Outflows</span>
          <div className="text-2xl font-bold text-slate-900 tracking-tight">
            {data.weekend_pct}% <span className="text-xs text-slate-400 font-normal">({formatINR(data.weekend_spending)})</span>
          </div>
          <p className="text-[11px] text-slate-400">Saturday & Sunday activity</p>
        </div>
      </div>

      {/* Main Grid: Category Table & Observations */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: 12 Category Breakdown Table (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <PieIcon className="w-4 h-4 text-emerald-600" />
              <span>Standard 12 Categories Breakdown</span>
            </h2>
            <span className="text-xs font-mono text-slate-400">{filteredCategories.length} items</span>
          </div>

          <div className="divide-y divide-slate-100">
            {filteredCategories.map((cat, idx) => (
              <div key={idx} className="py-3.5 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-8 h-8 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-center shrink-0">
                    {CATEGORY_ICONS[cat.category] || <HelpCircle className="w-4 h-4 text-slate-400" />}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-slate-900 truncate">
                        {cat.category}
                      </span>
                      {cat.is_essential && (
                        <span className="px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-600 rounded">
                          Essential
                        </span>
                      )}
                      {cat.is_recurring && (
                        <span className="px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-700 rounded">
                          Recurring
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-400 font-mono">
                      {cat.transaction_count} transactions
                    </p>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <div className="text-sm font-bold text-slate-900 font-mono">
                    {formatINR(cat.total_amount)}
                  </div>
                  <div className="text-xs text-slate-500 font-mono">
                    {cat.percentage_of_total}%
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: AI Evidence-Based Observations (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="w-4 h-4 text-emerald-600" />
            <h2 className="text-base font-bold text-slate-900">
              Evidence-Based AI Observations
            </h2>
          </div>

          {data.observations.map((obs, i) => (
            <div
              key={i}
              className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-3"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-900">
                  {obs.title}
                </span>
                <span className="px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider bg-slate-100 text-slate-600 rounded-md">
                  {obs.type.replace('_', ' ')}
                </span>
              </div>

              <p className="text-xs text-slate-700 leading-relaxed font-medium">
                {obs.summary}
              </p>

              <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                  Empirical Evidence
                </span>
                <p className="text-xs text-slate-600 font-mono">
                  {obs.evidence}
                </p>
              </div>

              <div className="text-xs text-slate-600 leading-relaxed">
                <span className="font-semibold text-slate-900">Implication: </span>
                {obs.implication}
              </div>

              <div className="text-xs text-emerald-800 bg-emerald-50/70 border border-emerald-100 p-2.5 rounded-xl leading-relaxed">
                <span className="font-semibold text-emerald-950">Possible Approach: </span>
                {obs.possible_action}
              </div>
            </div>
          ))}

          {/* Micro-transactions card */}
          {data.frequent_small_purchases_count > 0 && (
            <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-2">
              <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                <Coffee className="w-4 h-4 text-amber-600" />
                Micro-Purchases (under ₹500)
              </span>
              <p className="text-xs text-slate-600 leading-relaxed">
                Detected {data.frequent_small_purchases_count} small purchases totaling <span className="font-mono font-bold text-slate-900">{formatINR(data.frequent_small_purchases_total)}</span>.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
