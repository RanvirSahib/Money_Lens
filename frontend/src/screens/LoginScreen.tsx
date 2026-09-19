'use client';

import React, { useState } from 'react';
import { ScreenId } from '../types';
import { useAuth } from '../context/AuthContext';

interface LoginScreenProps {
  onNavigate: (screen: ScreenId) => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onNavigate }) => {
  const { login, signup } = useAuth();
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  
  // Form fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [income, setIncome] = useState('85000');
  const [expenses, setExpenses] = useState('35000');
  const [savings, setSavings] = useState('150000');

  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!email || !password) {
      setErrorMessage('Please provide both email and password.');
      return;
    }

    setIsAuthenticating(true);
    try {
      if (mode === 'signup') {
        if (!name.trim()) {
          setErrorMessage('Please provide your full name.');
          setIsAuthenticating(false);
          return;
        }
        await signup({
          email: email.trim(),
          name: name.trim(),
          password,
          monthly_income: parseFloat(income) || 85000,
          monthly_expenses: parseFloat(expenses) || 35000,
          current_savings: parseFloat(savings) || 150000,
        });
      } else {
        await login(email.trim(), password);
      }
      setIsAuthenticating(false);
      onNavigate('dashboard');
    } catch (err: any) {
      setIsAuthenticating(false);
      setErrorMessage(err?.message || 'Authentication failed. Please check your credentials.');
    }
  };

  return (
    <div className="w-full min-h-[80vh] flex items-center justify-center py-12 px-4 animate-in fade-in duration-300">
      <div className="w-full max-w-4xl bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden grid grid-cols-1 lg:grid-cols-12">
        {/* Left Branding Banner */}
        <div className="lg:col-span-5 bg-[#002992] text-white p-8 sm:p-12 flex flex-col justify-between relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(#61CCFF_1px,transparent_1px)] opacity-10 [background-size:20px_20px] pointer-events-none" />

          <div className="space-y-6 relative z-10">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[#61CCFF] text-[24px]">diamond</span>
              <span className="font-display font-extrabold text-lg tracking-wider">MONEY LENS</span>
            </div>

            <div className="space-y-2">
              <h2 className="text-2xl sm:text-3xl font-display font-extrabold leading-tight">
                {mode === 'signin' ? 'Welcome Back' : 'Create Your Account'}
              </h2>
              <p className="text-xs text-slate-300 leading-relaxed">
                {mode === 'signin'
                  ? 'Sign in to access your synchronized 3D trajectory projections and real-time database portfolio.'
                  : 'Start your deterministic financial modeling with secure AWS RDS PostgreSQL cloud persistence.'}
              </p>
            </div>
          </div>

          <div className="pt-8 border-t border-white/10 space-y-3 relative z-10 text-xs font-mono text-slate-300">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>AWS RDS PostgreSQL Database: Connected</span>
            </div>
            <div className="text-[11px] text-slate-400">
              Deterministic mathematical engine. Real portfolio records.
            </div>
          </div>
        </div>

        {/* Right Authentication Form */}
        <div className="lg:col-span-7 p-8 sm:p-12 space-y-6 bg-slate-50/50">
          <div className="flex items-center justify-between">
            {/* Mode Switcher Tabs */}
            <div className="flex items-center p-1 bg-slate-200/70 rounded-full text-xs font-display font-semibold">
              <button
                type="button"
                onClick={() => {
                  setMode('signin');
                  setErrorMessage(null);
                }}
                className={`px-4 py-1.5 rounded-full transition-all cursor-pointer ${
                  mode === 'signin'
                    ? 'bg-white text-blue-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => {
                  setMode('signup');
                  setErrorMessage(null);
                }}
                className={`px-4 py-1.5 rounded-full transition-all cursor-pointer ${
                  mode === 'signup'
                    ? 'bg-white text-blue-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Create Account
              </button>
            </div>

            <button
              onClick={() => onNavigate('landing')}
              className="text-xs font-mono text-slate-500 hover:text-slate-900 cursor-pointer"
            >
              ← Back to Site
            </button>
          </div>

          <div>
            <h3 className="text-xl font-display font-bold text-slate-900">
              {mode === 'signin' ? 'Sign In to MoneyLens' : 'Register New Investor Account'}
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              {mode === 'signin'
                ? 'Enter your registered credentials to launch your dashboard.'
                : 'Enter your profile details to persist your records to the cloud database.'}
            </p>
          </div>

          {errorMessage && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs font-medium flex items-center gap-2 animate-in fade-in duration-200">
              <span className="material-symbols-outlined text-[16px] shrink-0">error</span>
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'signup' && (
              <div className="space-y-1.5">
                <label className="block text-xs font-mono uppercase text-slate-600 font-semibold">Full Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Vikramaditya Singhania"
                  className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-medium text-slate-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            )}

            <div className="space-y-1.5">
              <label className="block text-xs font-mono uppercase text-slate-600 font-semibold">Email Address</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-medium text-slate-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-mono uppercase text-slate-600 font-semibold">Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-medium text-slate-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {mode === 'signup' && (
              <div className="pt-2 border-t border-slate-200/80 space-y-3">
                <div className="text-[11px] font-mono text-slate-500 uppercase font-semibold">
                  Initial Financial Parameters (₹ INR)
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  <div className="space-y-1">
                    <label className="text-[10px] font-mono text-slate-500">Monthly Income</label>
                    <input
                      type="number"
                      value={income}
                      onChange={(e) => setIncome(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-mono font-medium text-slate-900"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-mono text-slate-500">Monthly Expenses</label>
                    <input
                      type="number"
                      value={expenses}
                      onChange={(e) => setExpenses(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-mono font-medium text-slate-900"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-mono text-slate-500">Current Savings</label>
                    <input
                      type="number"
                      value={savings}
                      onChange={(e) => setSavings(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-mono font-medium text-slate-900"
                    />
                  </div>
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={isAuthenticating}
              className="w-full py-3.5 bg-[#002992] hover:bg-black text-white font-bold text-sm rounded-full transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md disabled:opacity-75"
            >
              <span className="material-symbols-outlined text-[18px]">
                {isAuthenticating ? 'sync' : mode === 'signin' ? 'login' : 'how_to_reg'}
              </span>
              <span>
                {isAuthenticating
                  ? 'Contacting Database...'
                  : mode === 'signin'
                  ? 'Sign In to Dashboard'
                  : 'Create Account & Save to Database'}
              </span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
