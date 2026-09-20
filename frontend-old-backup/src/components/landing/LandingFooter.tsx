'use client';

import React from 'react';
import { ScreenId } from '../../types';

interface LandingFooterProps {
  onNavigate: (screen: ScreenId) => void;
}

export const LandingFooter: React.FC<LandingFooterProps> = ({ onNavigate }) => {
  return (
    <footer className="w-full bg-[#070D1F] text-slate-400 py-16 px-4 sm:px-6 lg:px-12 border-t border-slate-800 text-xs">
      <div className="max-w-[1400px] mx-auto space-y-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-3 md:col-span-2 text-left">
            <div className="flex items-center gap-2 text-white font-display font-bold text-base">
              <span className="material-symbols-outlined text-blue-400 text-[22px]">diamond</span>
              <span>MONEY LENS</span>
            </div>
            <p className="text-slate-400 max-w-md leading-relaxed">
              “See your financial future before you make today’s decision.” A non-custodial 3D financial simulation and forward trajectory projection engine.
            </p>
          </div>

          <div className="space-y-2 text-left">
            <div className="font-mono text-white font-bold uppercase tracking-wider text-[11px]">Subsystems</div>
            <div className="flex flex-col space-y-2">
              <button onClick={() => onNavigate('simulator')} className="text-left hover:text-white transition-colors cursor-pointer">Financial Time Machine</button>
              <button onClick={() => onNavigate('dashboard')} className="text-left hover:text-white transition-colors cursor-pointer">3D Trajectory Splines</button>
              <button onClick={() => onNavigate('reverse')} className="text-left hover:text-white transition-colors cursor-pointer">Reverse Time Machine</button>
              <button onClick={() => onNavigate('radar')} className="text-left hover:text-white transition-colors cursor-pointer">Cash Flow Radar</button>
              <button onClick={() => onNavigate('lab')} className="text-left hover:text-white transition-colors cursor-pointer">Research Lab</button>
            </div>
          </div>

          <div className="space-y-2 text-left">
            <div className="font-mono text-white font-bold uppercase tracking-wider text-[11px]">Access & Telemetry</div>
            <div className="flex flex-col space-y-2">
              <button onClick={() => onNavigate('login')} className="text-left text-blue-400 hover:text-blue-300 font-medium cursor-pointer">Sign In / Register Account →</button>
              <span className="text-slate-500">Engine V4.2.0</span>
              <span className="text-slate-500">FastAPI + AWS RDS PostgreSQL</span>
            </div>
          </div>
        </div>

        <div className="pt-8 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-500">
          <div>© {new Date().getFullYear()} MoneyLens Systems. Deterministic mathematical financial simulation.</div>
          <div className="flex gap-4 font-mono">
            <span>AUDIT: SHA-256 VERIFIED</span>
            <span>STATUS: TELEMETRY NOMINAL</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
