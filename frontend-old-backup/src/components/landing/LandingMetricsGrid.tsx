'use client';

import React from 'react';
import { motion } from 'framer-motion';

export const LandingMetricsGrid: React.FC = () => {
  return (
    <section className="w-full bg-slate-50 text-slate-900 py-24 px-4 sm:px-6 lg:px-12 border-t border-slate-200/80">
      <div className="max-w-[1400px] mx-auto space-y-12">
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <div className="text-xs font-mono font-bold text-blue-600 uppercase tracking-widest">
            ENGINE VERIFICATION BENCHMARKS
          </div>
          <h2 className="text-3xl sm:text-4xl font-display font-extrabold text-slate-900">
            Engineered for zero-error financial clarity.
          </h2>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="p-8 rounded-3xl bg-white border border-slate-200/90 text-center space-y-2 shadow-xs hover:shadow-md transition-shadow"
          >
            <div className="text-4xl sm:text-5xl font-display font-extrabold text-blue-700">100%</div>
            <div className="text-xs font-mono text-slate-500 uppercase font-semibold">Deterministic Math</div>
            <p className="text-xs text-slate-600">Zero AI hallucination in financial calculations</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="p-8 rounded-3xl bg-white border border-slate-200/90 text-center space-y-2 shadow-xs hover:shadow-md transition-shadow"
          >
            <div className="text-4xl sm:text-5xl font-display font-extrabold text-blue-700">1,000</div>
            <div className="text-xs font-mono text-slate-500 uppercase font-semibold">Monte Carlo Paths</div>
            <p className="text-xs text-slate-600">Stress-tested against inflation and unexpected shocks</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="p-8 rounded-3xl bg-white border border-slate-200/90 text-center space-y-2 shadow-xs hover:shadow-md transition-shadow"
          >
            <div className="text-4xl sm:text-5xl font-display font-extrabold text-blue-700">30 Days</div>
            <div className="text-xs font-mono text-slate-500 uppercase font-semibold">Tactical Radar</div>
            <p className="text-xs text-slate-600">Surveillance for committed auto-debits & salary credits</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
            className="p-8 rounded-3xl bg-white border border-slate-200/90 text-center space-y-2 shadow-xs hover:shadow-md transition-shadow"
          >
            <div className="text-4xl sm:text-5xl font-display font-extrabold text-blue-700">33 / 33</div>
            <div className="text-xs font-mono text-slate-500 uppercase font-semibold">Pytest Verification</div>
            <p className="text-xs text-slate-600">Automated formula and endpoint test coverage</p>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
