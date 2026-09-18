'use client';

import React, { useState } from 'react';
import { ScreenId } from '../types';
import { useAuth, DEMO_PROFILES } from '../context/AuthContext';

interface LoginScreenProps {
  onNavigate: (screen: ScreenId) => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onNavigate }) => {
  const { login, loginWithProfile } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setIsAuthenticating(true);
    setTimeout(() => {
      login(email, password);
      setIsAuthenticating(false);
      onNavigate('dashboard');
    }, 450);
  };

  const handleSelectDemoPersona = (profileId: string) => {
    setIsAuthenticating(true);
    setTimeout(() => {
      loginWithProfile(profileId);
      setIsAuthenticating(false);
      onNavigate('dashboard');
    }, 350);
  };

  return (
    <div className="w-full min-h-[80vh] flex items-center justify-center py-12 px-4 animate-in fade-in duration-300">
      <div className="w-full max-w-5xl bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden grid grid-cols-1 lg:grid-cols-12">
        {/* Left Editorial Branding Banner */}
        <div className="lg:col-span-5 bg-[#002992] text-white p-8 sm:p-12 flex flex-col justify-between relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(#61CCFF_1px,transparent_1px)] opacity-10 [background-size:20px_20px] pointer-events-none" />

          <div className="space-y-6 relative z-10">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[#61CCFF] text-[24px]">diamond</span>
              <span className="font-display font-extrabold text-lg tracking-wider">MONEY LENS</span>
            </div>

            <div className="space-y-2">
              <h2 className="text-2xl sm:text-3xl font-display font-extrabold leading-tight">
                Deterministic Mission Control
              </h2>
              <p className="text-xs text-slate-300 leading-relaxed">
                Log in to access your synchronized 3D trajectory splines, backward-propagated sinking funds, and tactical radar.
              </p>
            </div>
          </div>

          <div className="pt-8 border-t border-white/10 space-y-3 relative z-10 text-xs font-mono text-slate-300">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <span>FastAPI Mathematical Engine: Online</span>
            </div>
            <div className="text-[11px] text-slate-400">
              Zero generative hallucinations. 100% deterministic calculus.
            </div>
          </div>
        </div>

        {/* Right Authentication Form */}
        <div className="lg:col-span-7 p-8 sm:p-12 space-y-8 bg-slate-50/50">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl sm:text-2xl font-display font-bold text-slate-900">Sign In to MoneyLens</h3>
              <p className="text-xs text-slate-500 mt-1">Select a pre-loaded demo persona or enter your credentials</p>
            </div>
            <button
              onClick={() => onNavigate('landing')}
              className="text-xs font-mono text-slate-500 hover:text-slate-900 cursor-pointer"
            >
              ← Back to Site
            </button>
          </div>

          {/* Quick Demo Personas */}
          <div className="space-y-2.5">
            <div className="text-[11px] font-mono text-slate-400 uppercase font-semibold">
              // 1-CLICK DEMO PERSONA ACCESS
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {DEMO_PROFILES.map((p) => (
                <button
                  key={p.id}
                  onClick={() => handleSelectDemoPersona(p.id)}
                  className="p-3 bg-white hover:bg-blue-50/70 border border-slate-200 hover:border-blue-400 rounded-2xl transition-all text-left space-y-1 shadow-sm cursor-pointer group"
                >
                  <div className="flex items-center justify-between">
                    <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 text-xs font-bold flex items-center justify-center">
                      {p.avatar}
                    </span>
                    <span className="text-[10px] font-mono text-emerald-600 font-bold">₹{(p.monthlyIncome/1000).toFixed(0)}k/mo</span>
                  </div>
                  <div className="text-xs font-bold text-slate-900 group-hover:text-blue-700">{p.name}</div>
                  <div className="text-[10px] text-slate-500 truncate">{p.role}</div>
                </button>
              ))}
            </div>
          </div>

          <div className="relative flex items-center">
            <div className="flex-grow border-t border-slate-200"></div>
            <span className="flex-shrink mx-4 text-slate-400 text-[11px] font-mono uppercase">or manual credentials</span>
            <div className="flex-grow border-t border-slate-200"></div>
          </div>

          {/* Manual Login Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-mono uppercase text-slate-600 font-semibold">Work / Personal Email</label>
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
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-medium text-slate-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <button
              type="submit"
              disabled={isAuthenticating}
              className="w-full py-3.5 bg-[#002992] hover:bg-black text-white font-bold text-sm rounded-full transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md disabled:opacity-75"
            >
              <span className="material-symbols-outlined text-[18px]">
                {isAuthenticating ? 'sync' : 'login'}
              </span>
              <span>{isAuthenticating ? 'Authenticating...' : 'Sign In & Launch Mission Control'}</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
