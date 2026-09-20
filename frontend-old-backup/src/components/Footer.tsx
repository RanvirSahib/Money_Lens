'use client';

import React from 'react';

interface FooterProps {
  onOpenLogs: () => void;
  onOpenTerms: () => void;
  onOpenAudit: () => void;
}

export const Footer: React.FC<FooterProps> = ({
  onOpenLogs,
  onOpenTerms,
  onOpenAudit,
}) => {
  return (
    <footer className="flex flex-col md:flex-row justify-between items-center w-full px-6 lg:px-12 py-6 bg-white border-t border-slate-200 mt-12 text-xs font-mono text-slate-500">
      <div className="tracking-wide uppercase mb-3 md:mb-0">
        MONEY LENS // ENGINE V4.2.0 • MISSION CONTROL ACTIVE • TELEMETRY BUFFER 12MS
      </div>
      <div className="flex flex-wrap items-center gap-6">
        <button
          onClick={onOpenLogs}
          className="hover:text-slate-900 transition-colors uppercase cursor-pointer"
        >
          SYS LOGS
        </button>
        <button
          onClick={onOpenTerms}
          className="hover:text-slate-900 transition-colors uppercase cursor-pointer"
        >
          TERMS OF SIMULATION
        </button>
        <button
          onClick={onOpenAudit}
          className="hover:text-slate-900 transition-colors uppercase cursor-pointer"
        >
          INTEGRITY AUDIT
        </button>
        <span className="text-emerald-700 font-semibold flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          STATUS: OPTIMAL
        </span>
      </div>
    </footer>
  );
};
