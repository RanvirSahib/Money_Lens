'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ScreenId } from '../../types';

interface LandingHeroProps {
  onNavigate: (screen: ScreenId) => void;
}

export const LandingHero: React.FC<LandingHeroProps> = ({ onNavigate }) => {
  const [demoAmount, setDemoAmount] = useState(80000);
  const [selectedPlan, setSelectedPlan] = useState<'buy_now' | 'emi' | 'save'>('emi');

  const monthlyEMI = Math.round(demoAmount / 12);
  const recoveryMonths = Math.ceil(demoAmount / 30000);

  return (
    <section className="w-full bg-gradient-to-b from-[#F0F5FF] via-[#F8FAFC] to-white text-slate-900 py-16 sm:py-24 px-4 sm:px-6 lg:px-12 relative overflow-hidden">
      {/* Soft luminous ambient glows */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[450px] bg-gradient-to-r from-blue-400/15 via-sky-300/20 to-teal-300/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[radial-gradient(#002992_1px,transparent_1px)] [background-size:24px_24px]" />

      <div className="max-w-[1400px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center relative z-10">
        {/* Left Column: Bold Editorial Copy & CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="lg:col-span-7 space-y-7 text-left"
        >
          <div className="inline-flex items-center gap-2 bg-blue-50 border border-blue-200/80 text-blue-800 px-4 py-1.5 rounded-full text-xs font-mono font-semibold tracking-wider shadow-xs">
            <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
            <span>FINANCIAL TIME MACHINE // V4.2</span>
          </div>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-display font-black tracking-tight text-slate-900 leading-[1.06]">
            See your financial future <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-700 via-blue-600 to-sky-500">before you spend.</span>
          </h1>

          <p className="text-lg sm:text-xl text-slate-600 font-normal max-w-2xl leading-relaxed">
            Test any purchase, loan amortization, or lifestyle upgrade before it impacts your bank balance. 100% deterministic 3D simulation with zero guesswork.
          </p>

          <div className="flex flex-wrap items-center gap-4 pt-2">
            <button
              onClick={() => onNavigate('simulator')}
              className="px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold text-base rounded-full shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/35 transition-all flex items-center gap-2.5 cursor-pointer transform hover:-translate-y-0.5 active:translate-y-0"
            >
              <span>Test a Decision Now</span>
              <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
            </button>

            <button
              onClick={() => onNavigate('dashboard')}
              className="px-8 py-4 bg-white text-slate-800 hover:bg-slate-50 font-bold text-base rounded-full border border-slate-300 shadow-sm hover:shadow-md transition-all flex items-center gap-2 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[20px] text-blue-600">view_in_ar</span>
              <span>Open 3D Trajectory</span>
            </button>
          </div>

          {/* Social Proof & Metrics */}
          <div className="pt-6 border-t border-slate-200/80 flex flex-wrap items-center gap-8 text-xs font-medium text-slate-500">
            <div className="flex items-center gap-2">
              <div className="flex -space-x-2">
                <img className="w-7 h-7 rounded-full border-2 border-white object-cover shadow-xs" src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80" alt="User" />
                <img className="w-7 h-7 rounded-full border-2 border-white object-cover shadow-xs" src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80" alt="User" />
                <img className="w-7 h-7 rounded-full border-2 border-white object-cover shadow-xs" src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80" alt="User" />
              </div>
              <span className="text-slate-700 font-semibold">12,000+ Decisions Tested</span>
            </div>

            <div className="flex items-center gap-1.5 text-emerald-700 font-semibold">
              <span className="material-symbols-outlined text-[18px]">verified</span>
              <span>100% Deterministic Math</span>
            </div>
          </div>
        </motion.div>

        {/* Right Column: High-End Live Interactive Preview Card with Lifestyle Image */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
          className="lg:col-span-5"
        >
          <div className="bg-white/95 backdrop-blur-xl rounded-3xl p-6 sm:p-7 shadow-2xl shadow-blue-900/10 border border-slate-200/90 space-y-5 relative">
            {/* Card Header with Real-Time Badge */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-3.5">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-600 animate-pulse" />
                <span className="text-xs font-mono font-bold text-slate-800 uppercase tracking-wide">LIVE SCENARIO PROJECTION</span>
              </div>
              <span className="text-[11px] font-mono text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full font-bold border border-emerald-200">
                ACTIVE
              </span>
            </div>

            {/* Product Card with Lifestyle Photo */}
            <div className="relative rounded-2xl overflow-hidden border border-slate-200 group bg-slate-900">
              <img
                src="https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=600&auto=format&fit=crop&q=80"
                alt="Smartphone Purchase"
                className="w-full h-32 object-cover opacity-75 group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
              <div className="absolute bottom-3 left-4 right-4 flex items-end justify-between text-white">
                <div>
                  <div className="text-[10px] font-mono text-blue-300 uppercase tracking-wider">PURCHASE INTENT</div>
                  <div className="text-base font-bold">Flagship Smartphone</div>
                </div>
                <div className="text-xl font-display font-extrabold text-white">
                  ₹{demoAmount.toLocaleString('en-IN')}
                </div>
              </div>
            </div>

            {/* Decision Switcher Pills */}
            <div className="grid grid-cols-3 gap-2 bg-slate-100 p-1 rounded-2xl">
              {(['buy_now', 'emi', 'save'] as const).map((mode) => (
                <button
                  key={mode}
                  onClick={() => setSelectedPlan(mode)}
                  className={`py-2 px-2 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer text-center ${
                    selectedPlan === mode
                      ? 'bg-white text-blue-700 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {mode === 'buy_now' ? 'Buy Now' : mode === 'emi' ? '12M EMI' : 'Save First'}
                </button>
              ))}
            </div>

            {/* Simulated Live Impact HUD */}
            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 space-y-2.5">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-600 font-medium">Monthly Outflow Impact:</span>
                <span className={`font-mono font-bold ${selectedPlan === 'emi' ? 'text-rose-600' : selectedPlan === 'buy_now' ? 'text-rose-600' : 'text-emerald-700'}`}>
                  {selectedPlan === 'emi' ? `-₹${monthlyEMI.toLocaleString('en-IN')}/mo` : selectedPlan === 'buy_now' ? `-₹${demoAmount.toLocaleString('en-IN')} (One-time)` : '₹0/mo strain'}
                </span>
              </div>

              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-600 font-medium">Emergency Runway Recovery:</span>
                <span className="font-mono font-bold text-slate-800">
                  {selectedPlan === 'buy_now' ? `${recoveryMonths} Months to Refill` : selectedPlan === 'emi' ? '1.4x Safe Floor Maintained' : '100% Buffer Intact'}
                </span>
              </div>

              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-600 font-medium">Goal Completion Impact:</span>
                <span className="font-mono font-bold text-blue-700">
                  {selectedPlan === 'buy_now' ? '+3.5 Months Lag' : selectedPlan === 'emi' ? '+1.5 Months Lag' : 'Zero Milestone Delay'}
                </span>
              </div>
            </div>

            <button
              onClick={() => onNavigate('simulator')}
              className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-full transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-blue-600/20"
            >
              <span>Simulate with Custom Parameters</span>
              <span className="material-symbols-outlined text-[18px]">insights</span>
            </button>
          </div>
        </motion.div>
      </div>
    </section>
  );
};
