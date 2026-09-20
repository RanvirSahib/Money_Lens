'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { ScreenId } from '../../types';

interface LandingRadarSectionProps {
  onNavigate: (screen: ScreenId) => void;
}

export const LandingRadarSection: React.FC<LandingRadarSectionProps> = ({ onNavigate }) => {
  return (
    <section className="w-full bg-[#0B132B] text-white py-24 sm:py-32 px-4 sm:px-6 lg:px-12 border-t border-slate-800 relative">
      <div className="max-w-[1400px] mx-auto space-y-16">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-3 max-w-2xl text-left">
            <div className="inline-flex items-center gap-2 text-xs font-mono font-bold text-sky-400 uppercase tracking-wider">
              <span className="material-symbols-outlined text-[18px]">radar</span>
              <span>TACTICAL CASH FLOW RADAR</span>
            </div>
            <h2 className="text-3xl sm:text-5xl font-display font-extrabold tracking-tight">
              Detect liquidity troughs 30 days before they hit your account.
            </h2>
          </div>

          <button
            onClick={() => onNavigate('radar')}
            className="px-7 py-3.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs font-mono uppercase tracking-wider rounded-full transition-all cursor-pointer self-start md:self-auto shadow-md"
          >
            Open Radar Screen →
          </button>
        </div>

        {/* 3 Tactical Cards with Imagery */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 space-y-4 flex flex-col justify-between"
          >
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-rose-500/15 text-rose-400 flex items-center justify-center font-bold">
                <span className="material-symbols-outlined text-[24px]">event_repeat</span>
              </div>
              <h3 className="text-lg font-bold">Committed Outflow Surveillance</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Maintains an exact chronological calendar of housing rent, device EMIs, health coverage renewals, and recurring SaaS subscriptions.
              </p>
            </div>
            <div className="pt-4 border-t border-slate-800 text-[11px] font-mono text-slate-400 flex justify-between">
              <span>Sync Frequency:</span>
              <span className="text-emerald-400 font-bold">Continuous</span>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 space-y-4 flex flex-col justify-between"
          >
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-sky-500/15 text-sky-400 flex items-center justify-center font-bold">
                <span className="material-symbols-outlined text-[24px]">shield</span>
              </div>
              <h3 className="text-lg font-bold">Buffer Floor Target Defense</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Constantly verifies that your estimated minimum cash trough stays safely above your 1.5x monthly expense emergency cushion.
              </p>
            </div>
            <div className="pt-4 border-t border-slate-800 text-[11px] font-mono text-slate-400 flex justify-between">
              <span>Safety Cushion:</span>
              <span className="text-sky-400 font-bold">1.5x Expenses</span>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 space-y-4 flex flex-col justify-between"
          >
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center font-bold">
                <span className="material-symbols-outlined text-[24px]">fast_rewind</span>
              </div>
              <h3 className="text-lg font-bold">Backward Sinking-Fund Solver</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Start with your future milestone and let the algorithm calculate the exact required monthly velocity and actionable acceleration levers.
              </p>
            </div>
            <div className="pt-4 border-t border-slate-800 text-[11px] font-mono text-slate-400 flex justify-between">
              <span>Accuracy:</span>
              <span className="text-emerald-400 font-bold">Deterministic</span>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
