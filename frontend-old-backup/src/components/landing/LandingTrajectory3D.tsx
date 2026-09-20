'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { ScreenId } from '../../types';

interface LandingTrajectory3DProps {
  onNavigate: (screen: ScreenId) => void;
}

export const LandingTrajectory3D: React.FC<LandingTrajectory3DProps> = ({ onNavigate }) => {
  return (
    <section className="w-full bg-[#070D1F] text-white py-24 sm:py-32 px-4 sm:px-6 lg:px-12 relative overflow-hidden">
      {/* Background ambient lighting */}
      <div className="absolute top-1/4 right-0 w-[550px] h-[550px] bg-blue-600/15 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-[1400px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center relative z-10">
        {/* Left: Copy & Features */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="lg:col-span-6 space-y-6 text-left"
        >
          <div className="inline-flex items-center gap-2 bg-blue-500/15 border border-blue-400/30 text-blue-300 px-4 py-1.5 rounded-full text-xs font-mono font-bold tracking-wider">
            <span className="material-symbols-outlined text-[16px]">view_in_ar</span>
            <span>THREE.JS WEBGL VECTOR ENGINE</span>
          </div>

          <h2 className="text-3xl sm:text-5xl lg:text-6xl font-display font-extrabold tracking-tight leading-[1.08] text-white">
            Your financial path mapped in <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-sky-300 to-teal-300">continuous 3D space.</span>
          </h2>

          <p className="text-base sm:text-lg text-slate-300 leading-relaxed">
            Move beyond static spreadsheets. MoneyLens renders continuous 12-to-36-month Catmull-Rom splines so you can orbit in 3D space, zoom into divergence points, and inspect financial inflection nodes.
          </p>

          <div className="space-y-3.5 pt-2">
            <div className="flex items-start gap-3 bg-white/5 border border-white/10 p-3.5 rounded-2xl">
              <div className="w-6 h-6 rounded-full bg-blue-500 text-white flex items-center justify-center font-bold text-xs mt-0.5 shrink-0">
                ✓
              </div>
              <div>
                <h4 className="font-bold text-sm text-white">Dynamic Milestone Spheres</h4>
                <p className="text-xs text-slate-400">Pulsating 3D nodes calculate 2D projected HUD labels in real time.</p>
              </div>
            </div>

            <div className="flex items-start gap-3 bg-white/5 border border-white/10 p-3.5 rounded-2xl">
              <div className="w-6 h-6 rounded-full bg-blue-500 text-white flex items-center justify-center font-bold text-xs mt-0.5 shrink-0">
                ✓
              </div>
              <div>
                <h4 className="font-bold text-sm text-white">Multi-Curve Scenario Divergence</h4>
                <p className="text-xs text-slate-400">Side-by-side comparison of baseline, discretionary shock, and accelerated accumulation.</p>
              </div>
            </div>
          </div>

          <div className="pt-4">
            <button
              onClick={() => onNavigate('dashboard')}
              className="px-8 py-4 bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm rounded-full transition-all flex items-center gap-2 cursor-pointer shadow-lg shadow-blue-600/30"
            >
              <span>Launch 3D WebGL Canvas</span>
              <span className="material-symbols-outlined text-[18px]">3d_rotation</span>
            </button>
          </div>
        </motion.div>

        {/* Right: 3D Visualization Mockup Card */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="lg:col-span-6"
        >
          <div className="bg-slate-900/90 rounded-3xl p-6 sm:p-8 border border-white/10 backdrop-blur-2xl shadow-2xl space-y-6">
            <div className="flex justify-between items-center border-b border-white/10 pb-4 text-xs font-mono">
              <div className="flex items-center gap-2 text-blue-400 font-bold">
                <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
                <span>// VECTOR SPLINE TELEMETRY</span>
              </div>
              <span className="text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
                ORBITAL CAMERA: ONLINE
              </span>
            </div>

            {/* Visual Spline Representation */}
            <div className="h-64 bg-slate-950/80 rounded-2xl border border-white/10 relative flex items-center justify-center overflow-hidden">
              <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff08_1px,transparent_1px),linear-gradient(to_bottom,#ffffff08_1px,transparent_1px)] bg-[size:24px_24px]" />
              
              <svg className="w-full h-full p-4 relative z-10" viewBox="0 0 400 180">
                <line x1="20" y1="150" x2="380" y2="150" stroke="#ffffff15" strokeWidth="1" strokeDasharray="4 4" />
                <line x1="20" y1="90" x2="380" y2="90" stroke="#ffffff10" strokeWidth="1" strokeDasharray="4 4" />
                
                {/* Baseline Blue Curve */}
                <path
                  d="M 30 140 Q 120 125 200 90 T 370 30"
                  fill="none"
                  stroke="#38BDF8"
                  strokeWidth="3.5"
                  className="drop-shadow-[0_0_12px_#38BDF8]"
                />

                {/* Scenario Divergence Amber Curve */}
                <path
                  d="M 120 125 Q 160 145 220 120 T 370 70"
                  fill="none"
                  stroke="#F59E0B"
                  strokeWidth="2.5"
                  strokeDasharray="5 5"
                />

                {/* Accelerated Emerald Curve */}
                <path
                  d="M 120 125 Q 180 80 250 50 T 370 15"
                  fill="none"
                  stroke="#10B981"
                  strokeWidth="2.5"
                  strokeDasharray="3 3"
                />

                {/* Spheres */}
                <circle cx="30" cy="140" r="5" fill="#38BDF8" />
                <circle cx="120" cy="125" r="7" fill="#F59E0B" />
                <circle cx="370" cy="30" r="6" fill="#38BDF8" />
              </svg>

              <div className="absolute bottom-3 right-4 text-[10px] font-mono text-slate-400 bg-slate-900/90 px-2.5 py-1 rounded-lg border border-white/10">
                TENSION: 0.5 // DIVERGENCE: M+3
              </div>
            </div>

            {/* Readout stats */}
            <div className="grid grid-cols-3 gap-3 text-xs font-mono">
              <div className="p-3 bg-white/5 rounded-xl border border-white/10">
                <div className="text-slate-400 text-[10px]">BASELINE (12M)</div>
                <div className="text-base font-bold text-sky-400">₹4,00,000</div>
              </div>
              <div className="p-3 bg-white/5 rounded-xl border border-white/10">
                <div className="text-slate-400 text-[10px]">DIVERGENCE Δ</div>
                <div className="text-base font-bold text-amber-400">-₹80,000</div>
              </div>
              <div className="p-3 bg-white/5 rounded-xl border border-white/10">
                <div className="text-slate-400 text-[10px]">ACCELERATED</div>
                <div className="text-base font-bold text-emerald-400">+₹95,000</div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};
