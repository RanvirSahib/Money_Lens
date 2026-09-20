'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  User, 
  Wallet, 
  CreditCard, 
  TrendingUp, 
  ShieldCheck, 
  Save, 
  RefreshCw, 
  AlertCircle, 
  CheckCircle2,
  DollarSign,
  PieChart,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import { DetailedFinancialProfile, DiscrepancyComparison } from '@/types';
import { getProfile, updateProfile, getProfileDiscrepancies } from '@/lib/api/profile';
import { formatINR } from '@/lib/utils/currency';

interface ProfileScreenProps {
  onProfileUpdated?: (updated: DetailedFinancialProfile) => void;
}

export const ProfileScreen: React.FC<ProfileScreenProps> = ({ onProfileUpdated }) => {
  const [profile, setProfile] = useState<DetailedFinancialProfile>({
    name: 'Aarav Sharma',
    monthly_income: 85000,
    essential_expenses: 20000,
    discretionary_expenses: 15000,
    current_savings: 150000,
    monthly_investments: 10000,
    active_emis: 0,
    active_loans: 0,
    other_recurring_expenses: 0,
    total_monthly_expenses: 35000,
    monthly_surplus: 40000,
    savings_rate_pct: 11.8,
    dti_ratio_pct: 0,
    emergency_fund_runway_months: 4.3,
    health_score: 88,
  });

  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [discrepancies, setDiscrepancies] = useState<DiscrepancyComparison[]>([]);

  // Form states
  const [name, setName] = useState(profile.name);
  const [income, setIncome] = useState(profile.monthly_income);
  const [essential, setEssential] = useState(profile.essential_expenses);
  const [discretionary, setDiscretionary] = useState(profile.discretionary_expenses);
  const [savings, setSavings] = useState(profile.current_savings);
  const [investments, setInvestments] = useState(profile.monthly_investments);
  const [emis, setEmis] = useState(profile.active_emis);
  const [loans, setLoans] = useState(profile.active_loans);
  const [recurring, setRecurring] = useState(profile.other_recurring_expenses);

  useEffect(() => {
    loadProfileData();
  }, []);

  const loadProfileData = async () => {
    setIsLoading(true);
    try {
      const data = await getProfile();
      setProfile(data);
      setName(data.name);
      setIncome(data.monthly_income);
      setEssential(data.essential_expenses);
      setDiscretionary(data.discretionary_expenses);
      setSavings(data.current_savings);
      setInvestments(data.monthly_investments);
      setEmis(data.active_emis);
      setLoans(data.active_loans);
      setRecurring(data.other_recurring_expenses);

      const discList = await getProfileDiscrepancies();
      setDiscrepancies(discList);
    } catch (err: any) {
      console.error('Failed to load profile:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Real-time calculated live projections
  const totalExpenses = Number(essential) + Number(discretionary) + Number(emis) + Number(recurring);
  const monthlySurplus = Number(income) - (totalExpenses + Number(investments));
  const savingsRate = Number(income) > 0 ? Number(((Number(investments) / Number(income)) * 100).toFixed(1)) : 0;
  const dtiRatio = Number(income) > 0 ? Number(((Number(emis) / Number(income)) * 100).toFixed(1)) : 0;
  const runwayMonths = totalExpenses > 0 ? Number((Number(savings) / totalExpenses).toFixed(1)) : 6;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const updated = await updateProfile({
        name,
        monthly_income: Number(income),
        essential_expenses: Number(essential),
        discretionary_expenses: Number(discretionary),
        current_savings: Number(savings),
        monthly_investments: Number(investments),
        active_emis: Number(emis),
        active_loans: Number(loans),
        other_recurring_expenses: Number(recurring),
      });

      setProfile(updated);
      setSuccessMessage('Financial profile successfully updated and baseline engine recalibrated.');
      if (onProfileUpdated) {
        onProfileUpdated(updated);
      }
      setTimeout(() => setSuccessMessage(null), 4000);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to update profile.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 text-xs font-semibold uppercase tracking-wider bg-emerald-50 text-emerald-700 rounded-md border border-emerald-200">
              Single Source of Truth
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 mt-2">
            Financial Profile
          </h1>
          <p className="text-sm text-slate-500 mt-1 max-w-2xl">
            Configure your monthly cash flow, baseline obligations, and assets. The deterministic financial engine calculates projections based on these parameters.
          </p>
        </div>

        <button
          onClick={loadProfileData}
          disabled={isLoading}
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer self-start md:self-auto"
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          <span>Reload Profile</span>
        </button>
      </div>

      {/* Discrepancy Alert */}
      {discrepancies.length > 0 && (
        <div className="bg-amber-50/80 border border-amber-200 rounded-2xl p-5 shadow-xs">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5 shrink-0" />
            <div className="space-y-2">
              <h3 className="text-sm font-bold text-amber-900">
                Statement Activity Discrepancy Detected
              </h3>
              {discrepancies.map((d, i) => (
                <div key={i} className="text-xs text-amber-800 leading-relaxed">
                  <p>{d.note}</p>
                  <p className="font-semibold text-amber-900 mt-1">{d.recommendation}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Real-time Calculated Health Vital Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
            <span>Total Monthly Expenses</span>
            <ArrowDownRight className="w-4 h-4 text-rose-500" />
          </div>
          <div className="text-2xl font-bold text-slate-900 tracking-tight">
            {formatINR(totalExpenses)}
          </div>
          <p className="text-[11px] text-slate-400">Essential + Discretionary + Debt</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
            <span>Monthly Surplus</span>
            <ArrowUpRight className="w-4 h-4 text-emerald-500" />
          </div>
          <div className={`text-2xl font-bold tracking-tight ${monthlySurplus >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
            {formatINR(monthlySurplus)}
          </div>
          <p className="text-[11px] text-slate-400">Uncommitted discretionary room</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
            <span>Emergency Runway</span>
            <ShieldCheck className="w-4 h-4 text-blue-500" />
          </div>
          <div className="text-2xl font-bold text-slate-900 tracking-tight">
            {runwayMonths} <span className="text-sm font-normal text-slate-500">months</span>
          </div>
          <p className="text-[11px] text-slate-400">Based on liquid savings reserve</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
            <span>Savings & SIP Rate</span>
            <TrendingUp className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-bold text-slate-900 tracking-tight">
            {savingsRate}%
          </div>
          <p className="text-[11px] text-slate-400">DTI Debt Ratio: {dtiRatio}%</p>
        </div>
      </div>

      {/* Main Profile Form */}
      <form onSubmit={handleSave} className="bg-white rounded-2xl border border-slate-200/80 p-6 sm:p-8 shadow-xs space-y-8">
        {/* Messages */}
        {successMessage && (
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm px-4 py-3 rounded-xl flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}
        {errorMessage && (
          <div className="bg-rose-50 border border-rose-200 text-rose-800 text-sm px-4 py-3 rounded-xl flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Section 1: Personal & Primary Cash Flow */}
        <div className="space-y-4">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <User className="w-4 h-4 text-emerald-600" />
            <span>Primary Information & Monthly Cash Flow</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-600">
                Display Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:outline-none focus:border-emerald-500 focus:bg-white transition-all"
                placeholder="e.g. Aarav Sharma"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-600">
                Monthly Net Income (₹)
              </label>
              <input
                type="number"
                value={income}
                onChange={(e) => setIncome(Number(e.target.value))}
                required
                min={0}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:outline-none focus:border-emerald-500 focus:bg-white transition-all font-mono"
                placeholder="85000"
              />
            </div>
          </div>
        </div>

        <hr className="border-slate-100" />

        {/* Section 2: Expense Breakdown */}
        <div className="space-y-4">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <PieChart className="w-4 h-4 text-emerald-600" />
            <span>Categorized Monthly Expenses</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-600">
                Essential Expenses (₹)
              </label>
              <input
                type="number"
                value={essential}
                onChange={(e) => setEssential(Number(e.target.value))}
                min={0}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:outline-none focus:border-emerald-500 focus:bg-white transition-all font-mono"
                placeholder="20000"
              />
              <p className="text-[11px] text-slate-400">Housing, groceries, utilities, healthcare</p>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-600">
                Discretionary Expenses (₹)
              </label>
              <input
                type="number"
                value={discretionary}
                onChange={(e) => setDiscretionary(Number(e.target.value))}
                min={0}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:outline-none focus:border-emerald-500 focus:bg-white transition-all font-mono"
                placeholder="15000"
              />
              <p className="text-[11px] text-slate-400">Dining out, entertainment, shopping</p>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-600">
                Other Recurring (₹)
              </label>
              <input
                type="number"
                value={recurring}
                onChange={(e) => setRecurring(Number(e.target.value))}
                min={0}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:outline-none focus:border-emerald-500 focus:bg-white transition-all font-mono"
                placeholder="0"
              />
              <p className="text-[11px] text-slate-400">Subscriptions, annual insurance / 12</p>
            </div>
          </div>
        </div>

        <hr className="border-slate-100" />

        {/* Section 3: Savings, Investments & Debt */}
        <div className="space-y-4">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-emerald-600" />
            <span>Savings, Investments & Liabilities</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-600">
                Current Liquid Savings (₹)
              </label>
              <input
                type="number"
                value={savings}
                onChange={(e) => setSavings(Number(e.target.value))}
                min={0}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:outline-none focus:border-emerald-500 focus:bg-white transition-all font-mono"
                placeholder="150000"
              />
              <p className="text-[11px] text-slate-400">Liquid bank & FD emergency fund</p>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-600">
                Monthly Investments (₹)
              </label>
              <input
                type="number"
                value={investments}
                onChange={(e) => setInvestments(Number(e.target.value))}
                min={0}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:outline-none focus:border-emerald-500 focus:bg-white transition-all font-mono"
                placeholder="10000"
              />
              <p className="text-[11px] text-slate-400">SIPs, mutual funds, PF, equities</p>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-600">
                Active Monthly EMIs (₹)
              </label>
              <input
                type="number"
                value={emis}
                onChange={(e) => setEmis(Number(e.target.value))}
                min={0}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:outline-none focus:border-emerald-500 focus:bg-white transition-all font-mono"
                placeholder="0"
              />
              <p className="text-[11px] text-slate-400">Total monthly loan installments</p>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-600">
                Total Outstanding Loans (₹)
              </label>
              <input
                type="number"
                value={loans}
                onChange={(e) => setLoans(Number(e.target.value))}
                min={0}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:outline-none focus:border-emerald-500 focus:bg-white transition-all font-mono"
                placeholder="0"
              />
              <p className="text-[11px] text-slate-400">Total remaining loan principal</p>
            </div>
          </div>
        </div>

        {/* Submit Actions */}
        <div className="flex items-center justify-end gap-3 pt-4">
          <button
            type="submit"
            disabled={isSaving}
            className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-xl shadow-xs transition-colors cursor-pointer disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{isSaving ? 'Recalibrating Engine...' : 'Save Profile Changes'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
