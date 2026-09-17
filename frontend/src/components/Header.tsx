'use client';

import React, { useState, useEffect, useRef } from 'react';
import { ScreenId } from '../types';

interface HeaderProps {
  currentScreen: ScreenId;
  onNavigate: (screen: ScreenId) => void;
  onOpenSettings: () => void;
  onOpenLogs: () => void;
  healthScore: number;
}

export const Header: React.FC<HeaderProps> = ({
  currentScreen,
  onNavigate,
  onOpenSettings,
  onOpenLogs,
  healthScore,
}) => {
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(3);
  const notifRef = useRef<HTMLDivElement>(null);

  // Close notifications on outside click
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotificationsOpen(false);
      }
    };
    if (notificationsOpen) {
      document.addEventListener('mousedown', handleOutsideClick);
    }
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, [notificationsOpen]);

  const navItems: { id: ScreenId; label: string; icon: string; badge?: string }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: 'dashboard' },
    { id: 'simulator', label: 'Simulator', icon: 'science' },
    { id: 'goals', label: 'Goals', icon: 'flag' },
    { id: 'reverse', label: 'Reverse', icon: 'fast_rewind' },
    { id: 'radar', label: 'Radar', icon: 'radar', badge: 'LIVE' },
    { id: 'lab', label: 'Lab', icon: 'biotech' },
  ];

  return (
    <header className="sticky top-0 z-50 w-full bg-white/85 backdrop-blur-xl border-b border-slate-200/90 shadow-[0_2px_12px_-2px_rgba(15,23,42,0.04)] transition-all">
      <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-12 h-16 flex justify-between items-center">
        {/* Brand Anchor */}
        <div className="flex items-center gap-3.5">
          <button
            onClick={() => onNavigate('dashboard')}
            className="flex items-center gap-2.5 group text-left cursor-pointer focus:outline-none"
          >
            {/* Holographic Crystal Mark */}
            <div className="relative flex items-center justify-center size-8 rounded-xl bg-gradient-to-tr from-blue-600 via-sky-500 to-teal-400 p-[1.5px] shadow-sm shadow-blue-500/20 group-hover:shadow-md group-hover:shadow-blue-500/30 transition-all duration-300 group-hover:scale-105">
              <div className="w-full h-full bg-white rounded-[10px] flex items-center justify-center">
                <span
                  className="w-3.5 h-3.5 bg-gradient-to-tr from-blue-600 to-sky-500 inline-block shadow-xs transition-transform duration-300 group-hover:rotate-45"
                  style={{ clipPath: 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)' }}
                />
              </div>
            </div>

            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="font-display font-extrabold text-base sm:text-lg tracking-tight text-slate-900 uppercase">
                  MONEY LENS
                </span>
                <span className="size-1.5 rounded-full bg-blue-600 animate-pulse" />
              </div>
              <span className="hidden sm:inline-block text-[9px] font-mono font-semibold tracking-wider text-slate-400 uppercase -mt-0.5">
                FINANCIAL SIMULATION OS
              </span>
            </div>
          </button>

          {/* Version Badge */}
          <div className="hidden 2xl:flex items-center gap-1.5 px-2.5 py-1 border border-slate-200/80 text-[10px] font-mono font-medium text-slate-500 bg-slate-50/80 rounded-full shadow-xs">
            <span className="size-1.5 rounded-full bg-emerald-500" />
            <span>V4.2.0 // MISSION CONTROL</span>
          </div>
        </div>

        {/* Center Desktop Navigation Tabs */}
        <nav className="hidden md:flex items-center p-1 bg-slate-100/70 border border-slate-200/80 rounded-xl shadow-inner">
          {navItems.map((item) => {
            const isActive = currentScreen === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={`relative px-3.5 py-1.5 rounded-lg font-mono text-xs uppercase tracking-wider transition-all duration-200 cursor-pointer flex items-center gap-1.5 ${
                  isActive
                    ? 'bg-white text-blue-700 font-bold shadow-xs border border-slate-200/60'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                }`}
              >
                <span
                  className={`material-symbols-outlined text-[15px] leading-none transition-colors ${
                    isActive ? 'text-blue-600' : 'text-slate-400'
                  }`}
                >
                  {item.icon}
                </span>
                <span>{item.label}</span>
                {item.badge && (
                  <span className="px-1.5 py-0.2 bg-emerald-100 text-emerald-800 text-[8px] font-mono font-bold rounded-full border border-emerald-200">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Trailing Actions & Real-Time Telemetry */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Health Score Pill */}
          <div
            className="hidden lg:flex items-center gap-2 bg-emerald-50/90 hover:bg-emerald-100/70 transition-colors px-3 py-1.5 border border-emerald-200/90 rounded-full shadow-2xs cursor-default"
            title="Aggregated Financial Vitality Index"
          >
            <div className="relative flex items-center justify-center">
              <span className="size-2 rounded-full bg-emerald-500 animate-ping absolute" />
              <span className="size-2 rounded-full bg-emerald-600" />
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-xs font-semibold text-emerald-900 tracking-tight">
                Health:
              </span>
              <span className="text-xs font-mono font-bold text-emerald-700">
                {healthScore}/100
              </span>
            </div>
          </div>

          {/* Telemetry Nominal Action */}
          <button
            onClick={onOpenLogs}
            className="hidden xl:flex items-center gap-1.5 px-3 py-1.5 bg-slate-100/90 hover:bg-slate-200/80 border border-slate-200/90 rounded-lg text-xs font-mono font-semibold text-slate-700 transition-all active:scale-95 cursor-pointer shadow-2xs"
            title="Open Mission Control System Logs"
          >
            <span className="size-1.5 bg-emerald-500 rounded-full" />
            <span>LOGS</span>
            <span className="text-[10px] text-slate-400 font-normal">12MS</span>
          </button>

          {/* Settings & Notifications */}
          <div className="flex items-center gap-1.5" ref={notifRef}>
            {/* Settings Calibration Button */}
            <button
              onClick={onOpenSettings}
              className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 active:bg-slate-200 transition-all rounded-xl border border-slate-200/80 shadow-2xs cursor-pointer group"
              title="System Settings & Baseline Engine Calibration"
            >
              <span className="material-symbols-outlined text-[19px] leading-none block group-hover:rotate-45 transition-transform duration-300">
                tune
              </span>
            </button>

            {/* Notifications Trigger */}
            <div className="relative">
              <button
                onClick={() => setNotificationsOpen(!notificationsOpen)}
                className={`p-2 transition-all rounded-xl border shadow-2xs relative cursor-pointer ${
                  notificationsOpen
                    ? 'bg-blue-50 border-blue-300 text-blue-700'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 border-slate-200/80'
                }`}
                title="Telemetry Anomaly Feeds"
              >
                <span className="material-symbols-outlined text-[19px] leading-none block">
                  notifications
                </span>
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 size-2 bg-blue-600 rounded-full ring-2 ring-white animate-pulse" />
                )}
              </button>

              {/* Notifications Dropdown Tray */}
              {notificationsOpen && (
                <div className="absolute top-12 right-0 w-80 sm:w-96 bg-white/95 backdrop-blur-xl border border-slate-200/90 rounded-2xl shadow-2xl p-4 z-50 animate-in fade-in zoom-in-95 duration-150">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                    <div className="flex items-center gap-2 font-mono text-xs font-bold text-slate-900 uppercase">
                      <span className="size-2 rounded-full bg-blue-600 animate-pulse" />
                      <span>Telemetry Feeds ({unreadCount} New)</span>
                    </div>
                    <button
                      onClick={() => setNotificationsOpen(false)}
                      className="text-slate-400 hover:text-slate-700 text-xs font-mono px-1.5 py-0.5 rounded hover:bg-slate-100 transition-colors"
                    >
                      ESC
                    </button>
                  </div>

                  <div className="divide-y divide-slate-100 max-h-72 overflow-y-auto pt-1">
                    {/* Item 1 */}
                    <div className="py-2.5 space-y-1 hover:bg-slate-50/70 p-2 rounded-lg transition-colors">
                      <div className="flex items-center justify-between text-[11px] font-mono">
                        <span className="text-emerald-700 font-bold bg-emerald-50 border border-emerald-200/60 px-1.5 py-0.5 rounded">
                          INCOME DETECT
                        </span>
                        <span className="text-slate-400">10m ago</span>
                      </div>
                      <p className="text-xs text-slate-800 leading-snug">
                        Salary credits consistently reached ₹55,000. Recalibration prompt active.
                      </p>
                    </div>

                    {/* Item 2 */}
                    <div className="py-2.5 space-y-1 hover:bg-slate-50/70 p-2 rounded-lg transition-colors">
                      <div className="flex items-center justify-between text-[11px] font-mono">
                        <span className="text-blue-700 font-bold bg-blue-50 border border-blue-200/60 px-1.5 py-0.5 rounded">
                          TIME MACHINE
                        </span>
                        <span className="text-slate-400">1h ago</span>
                      </div>
                      <p className="text-xs text-slate-800 leading-snug">
                        Simulation SIM-HASH: 849F-2027 confirmed buffer safe at 1.6x.
                      </p>
                    </div>

                    {/* Item 3 */}
                    <div className="py-2.5 space-y-1 hover:bg-slate-50/70 p-2 rounded-lg transition-colors">
                      <div className="flex items-center justify-between text-[11px] font-mono">
                        <span className="text-amber-700 font-bold bg-amber-50 border border-amber-200/60 px-1.5 py-0.5 rounded">
                          RADAR ALERT
                        </span>
                        <span className="text-slate-400">2h ago</span>
                      </div>
                      <p className="text-xs text-slate-800 leading-snug">
                        Phone EMI of -₹6,667 scheduled in 8 days. Reserve account ready.
                      </p>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex justify-between items-center text-xs">
                    <button
                      onClick={() => {
                        setNotificationsOpen(false);
                        onNavigate('radar');
                      }}
                      className="text-blue-600 hover:text-blue-800 font-mono text-[11px] font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                    >
                      <span>View Cash Radar</span>
                      <span>→</span>
                    </button>
                    <button
                      onClick={() => {
                        setUnreadCount(0);
                        setNotificationsOpen(false);
                      }}
                      className="text-slate-500 hover:text-slate-800 text-[11px] font-medium transition-colors cursor-pointer"
                    >
                      Mark All Read
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Mobile Hamburger Drawer Trigger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-slate-600 hover:text-slate-900 rounded-xl border border-slate-200/80 hover:bg-slate-100 transition-colors"
              aria-label="Toggle Navigation Drawer"
            >
              <span className="material-symbols-outlined text-[20px] block">
                {mobileMenuOpen ? 'close' : 'menu'}
              </span>
            </button>
          </div>

          {/* User Profile Avatar with Presence Indicator */}
          <div className="flex items-center pl-2 sm:pl-3 border-l border-slate-200/80">
            <div className="relative group cursor-pointer">
              <img
                alt="Ranvir Sahib // Lead Explorer"
                className="size-8 sm:size-8.5 rounded-full ring-2 ring-blue-500/20 group-hover:ring-blue-500/40 object-cover bg-slate-100 shadow-xs transition-all"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuBhHW8s24d-3XCeWWE9Lv15pJll5904fELLmEsmVcJbPNMEXCjDDbzsyuFRtUlPvrsPlaJjXD_62YxZ3_0FEIzJhhMYsqP_W7U9uFytEQ-SSuQL2FUvGrsRlPti0udtPpXSexWK7SXClvsTgPK7TMcyNzYpo-TeJHntO_2gETCq1h4viMp95xL3j75X9F4lE72xF43M4EHrYaiezTYaTS-vtzMlTkps92tj5_dDBU1WKoD2Nd7dwpUZ"
              />
              <span className="absolute bottom-0 right-0 size-2.5 bg-emerald-500 rounded-full ring-2 ring-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Responsive Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden w-full bg-white/95 backdrop-blur-xl border-b border-slate-200 p-4 shadow-xl animate-in slide-in-from-top-2 duration-150 flex flex-col gap-1.5">
          <div className="text-[10px] font-mono text-slate-400 uppercase tracking-wider px-3 pb-1">
            MISSION CONTROL MODULES
          </div>
          {navItems.map((item) => {
            const isActive = currentScreen === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  onNavigate(item.id);
                  setMobileMenuOpen(false);
                }}
                className={`text-left px-3.5 py-2.5 rounded-xl font-mono text-xs uppercase tracking-wider flex items-center justify-between transition-colors ${
                  isActive
                    ? 'bg-blue-50 text-blue-700 font-bold border border-blue-200/80'
                    : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <span className={`material-symbols-outlined text-[18px] ${isActive ? 'text-blue-600' : 'text-slate-400'}`}>
                    {item.icon}
                  </span>
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span className="px-1.5 py-0.5 bg-emerald-100 text-emerald-800 text-[9px] font-mono font-bold rounded-full">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
          <div className="pt-3 mt-1 border-t border-slate-100 flex items-center justify-between text-xs px-3 text-slate-600">
            <span className="font-medium">HEALTH INDEX: {healthScore}/100</span>
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenLogs();
              }}
              className="text-blue-600 font-mono text-xs hover:underline"
            >
              VIEW SYS LOGS →
            </button>
          </div>
        </div>
      )}
    </header>
  );
};

