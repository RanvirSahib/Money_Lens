'use client';

import React from 'react';

interface SysLogsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SysLogsModal: React.FC<SysLogsModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const logs = [
    { time: '12:45:02.114', tag: 'CORE', level: 'INFO', msg: 'Engine V4.2.0 initialized. State buffer loaded (12ms).' },
    { time: '12:45:04.582', tag: 'TELEMETRY', level: 'SUCCESS', msg: 'Deterministic Cash Flow Vector calibrated with 1,000 iterations.' },
    { time: '12:45:09.912', tag: 'INCOME_MONITOR', level: 'WARN', msg: 'Credit inflection: consecutive inflow sequence [45K, 45K, 55K, 55K].' },
    { time: '12:45:15.302', tag: 'REVERSE_VM', level: 'INFO', msg: 'Target Milestone ₹1,00,000 backward-propagation solved: ₹3,750/mo required.' },
    { time: '12:45:21.849', tag: 'RADAR', level: 'NOMINAL', msg: 'Committed outflow sync complete: 3 auto-debits within 21-day window.' },
    { time: '12:45:28.012', tag: 'SHOCK_TEST', level: 'INFO', msg: 'Buffer compliance: 1.62x. Maximum allowable unplanned shock: ₹75,000.' },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-950 border border-slate-800 rounded-2xl w-full max-w-2xl text-slate-200 shadow-2xl overflow-hidden font-mono text-xs">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 bg-slate-900/90 border-b border-slate-800">
          <div className="flex items-center gap-2 text-slate-300">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-bold tracking-wider uppercase">
              MONEY LENS // MISSION CONTROL LOG STREAM
            </span>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors cursor-pointer text-sm"
          >
            ✕
          </button>
        </div>

        {/* Log content */}
        <div className="p-5 space-y-2.5 max-h-96 overflow-y-auto bg-black/40">
          {logs.map((log, i) => (
            <div key={i} className="flex items-start gap-2.5 leading-relaxed">
              <span className="text-slate-500 select-none">[{log.time}]</span>
              <span
                className={`px-1.5 py-0.2 rounded text-[10px] font-bold ${
                  log.level === 'SUCCESS'
                    ? 'bg-emerald-950 text-emerald-400 border border-emerald-800/60'
                    : log.level === 'WARN'
                      ? 'bg-amber-950 text-amber-400 border border-amber-800/60'
                      : 'bg-blue-950 text-blue-400 border border-blue-800/60'
                }`}
              >
                {log.tag}
              </span>
              <span className="text-slate-300 flex-1">{log.msg}</span>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 bg-slate-900/90 border-t border-slate-800 flex justify-between items-center text-[11px] text-slate-400">
          <span>PIPELINE: REALTIME DETERMINISTIC // HASH: 849F-2027</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg transition-colors cursor-pointer"
          >
            DISMISS
          </button>
        </div>
      </div>
    </div>
  );
};
