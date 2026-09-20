'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { ScreenId } from '../../types';

interface LandingCTAProps {
  onNavigate: (screen: ScreenId) => void;
}

export const LandingCTA: React.FC<LandingCTAProps> = ({ onNavigate }) => {
  return (
    <section className="w-full bg-gradient-to-r from-blue-700 via-blue-800 to-indigo-900 text-white py-24 sm:py-28 px-4 sm:px-6 lg:px-12 text-center relative overflow-hidden">
      <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="max-w-4xl mx-auto space-y-8 relative z-10"
      >
        <h2 className="text-4xl sm:text-6xl font-display font-black tracking-tight leading-tight">
          Ready to see your financial future in 3D?
        </h2>
        <p className="text-lg sm:text-xl text-blue-100 max-w-2xl mx-auto font-normal">
          Test your next purchase, EMI structure, or long-term capital milestone with mathematical precision.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
          <button
            onClick={() => onNavigate('dashboard')}
            className="px-10 py-4 bg-white text-blue-900 hover:bg-slate-100 font-bold text-base rounded-full shadow-2xl transition-all cursor-pointer transform hover:-translate-y-0.5 active:translate-y-0"
          >
            Launch Mission Control
          </button>
          <button
            onClick={() => onNavigate('login')}
            className="px-8 py-4 bg-blue-600 hover:bg-blue-500 text-white font-bold text-base rounded-full border border-blue-400/40 shadow-lg transition-all cursor-pointer"
          >
            Sign In / Create Account
          </button>
        </div>
      </motion.div>
    </section>
  );
};
