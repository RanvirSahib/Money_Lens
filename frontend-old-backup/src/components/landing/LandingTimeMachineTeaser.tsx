'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { ScreenId } from '../../types';

interface LandingTimeMachineTeaserProps {
  onNavigate: (screen: ScreenId) => void;
}

export const LandingTimeMachineTeaser: React.FC<LandingTimeMachineTeaserProps> = ({ onNavigate }) => {
  const cards = [
    {
      title: 'Outright Cash Purchase',
      desc: 'Zero interest penalty, but extracts immediate liquid reserves, creating a temporary emergency runway trough.',
      image: 'https://images.unsplash.com/photo-1556742049-0a67e55722c0?w=600&auto=format&fit=crop&q=80',
      tag: 'CASH IMPACT',
      statLabel: 'Runway Impact',
      statVal: 'Immediate Shock',
      statColor: 'text-rose-600',
    },
    {
      title: 'Financed EMI Model',
      desc: 'Smooths the cash outflow over 6–24 months to preserve minimum liquid runway safely above the 1.5x buffer floor.',
      image: 'https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?w=600&auto=format&fit=crop&q=80',
      tag: 'LEVERAGE MODEL',
      statLabel: 'Buffer Preservation',
      statVal: '92% Protected',
      statColor: 'text-blue-600',
      popular: true,
    },
    {
      title: 'Save First (Sinking Fund)',
      desc: 'Defers purchase by 3–6 months to accumulate surplus organically with zero interest and zero debt exposure.',
      image: 'https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?w=600&auto=format&fit=crop&q=80',
      tag: 'ORGANIC SURPLUS',
      statLabel: 'Financial Stress',
      statVal: 'Zero Strain',
      statColor: 'text-emerald-700',
    },
  ];

  return (
    <section className="w-full bg-white text-slate-900 py-24 px-4 sm:px-6 lg:px-12 border-b border-slate-100">
      <div className="max-w-[1400px] mx-auto space-y-16">
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-1.5 text-xs font-mono font-bold text-blue-600 uppercase tracking-widest bg-blue-50 px-3.5 py-1 rounded-full border border-blue-200">
            <span className="material-symbols-outlined text-[16px]">history_toggle_off</span>
            <span>DECISION ARCHITECTURE</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-display font-extrabold text-slate-900 tracking-tight">
            Compare purchase vectors side by side.
          </h2>
          <p className="text-base sm:text-lg text-slate-600">
            Every choice comes with a trade-off. MoneyLens reveals the exact ripple effects on your emergency savings, cash flow, and future milestone arrivals.
          </p>
        </div>

        {/* 3 Lifestyle Product Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {cards.map((card, idx) => (
            <motion.div
              key={card.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
              className={`rounded-3xl overflow-hidden border transition-all duration-300 flex flex-col bg-white ${
                card.popular
                  ? 'border-blue-500 ring-2 ring-blue-500/20 shadow-xl'
                  : 'border-slate-200 shadow-sm hover:shadow-md hover:border-slate-300'
              }`}
            >
              {/* Card Image */}
              <div className="relative h-48 overflow-hidden bg-slate-900">
                <img
                  src={card.image}
                  alt={card.title}
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />
                <span className="absolute top-4 left-4 text-[10px] font-mono font-bold bg-white/90 backdrop-blur-md text-slate-900 px-3 py-1 rounded-full uppercase tracking-wider">
                  {card.tag}
                </span>
                {card.popular && (
                  <span className="absolute top-4 right-4 text-[10px] font-mono font-bold bg-blue-600 text-white px-3 py-1 rounded-full uppercase tracking-wider shadow-sm">
                    OPTIMAL VECTOR
                  </span>
                )}
              </div>

              {/* Card Body */}
              <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                <div className="space-y-2">
                  <h3 className="text-xl font-display font-bold text-slate-900">{card.title}</h3>
                  <p className="text-sm text-slate-600 leading-relaxed">{card.desc}</p>
                </div>

                <div className="pt-4 border-t border-slate-100 flex justify-between items-center text-xs font-mono">
                  <span className="text-slate-500">{card.statLabel}:</span>
                  <span className={`font-bold ${card.statColor}`}>{card.statVal}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="text-center pt-4">
          <button
            onClick={() => onNavigate('simulator')}
            className="px-8 py-4 bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm rounded-full transition-all inline-flex items-center gap-2 cursor-pointer shadow-md hover:shadow-lg"
          >
            <span>Launch Financial Time Machine</span>
            <span className="material-symbols-outlined text-[18px]">play_circle</span>
          </button>
        </div>
      </div>
    </section>
  );
};
