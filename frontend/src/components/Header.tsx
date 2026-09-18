'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ScreenId } from '../types';
import { useAuth, DEMO_PROFILES } from '../context/AuthContext';

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
  const { user, logout, loginWithProfile } = useAuth();
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(3);
  const notifRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotificationsOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileDropdownOpen(false);
      }
    };
    if (notificationsOpen || profileDropdownOpen) {
      document.addEventListener('mousedown', handleOutsideClick);
    }
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, [notificationsOpen, profileDropdownOpen]);

  const navItems: { id: ScreenId; label: string; badge?: string }[] = [
    { id: 'landing', label: 'Overview' },
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'simulator', label: 'Simulator' },
    { id: 'goals', label: 'Goals' },
    { id: 'reverse', label: 'Reverse' },
    { id: 'radar', label: 'Radar', badge: 'Live' },
    { id: 'lab', label: 'Lab' },
  ];

  return (
    <header className="sticky top-0 z-50 w-full bg-white/90 backdrop-blur-xl border-b border-slate-200/80 shadow-[0_1px_8px_-2px_rgba(15,23,42,0.04)] transition-all">
      <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Left: Brand Anchor */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => onNavigate('landing')}
            className="flex items-center gap-2.5 group text-left cursor-pointer focus:outline-none"
          >
            {/* Holographic Crystal Mark */}
            <div className="relative flex items-center justify-center size-8 rounded-xl bg-gradient-to-tr from-blue-600 via-sky-500 to-indigo-600 p-[1.5px] shadow-xs group-hover:shadow-md transition-all duration-300 group-hover:scale-105">
              <div className="w-full h-full bg-white rounded-[10px] flex items-center justify-center">
                <span
                  className="w-3.5 h-3.5 bg-gradient-to-tr from-blue-600 to-sky-500 inline-block transition-transform duration-300 group-hover:rotate-45"
                  style={{ clipPath: 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)' }}
                />
              </div>
            </div>

            <span className="font-display font-black text-lg tracking-tight text-slate-900 whitespace-nowrap">
              MONEY<span className="text-blue-600">LENS</span>
            </span>
          </button>
        </div>

        {/* Center: Spacious, Clean Modern Navigation Tabs */}
        <nav className="hidden lg:flex items-center p-1 bg-slate-100/90 border border-slate-200/70 rounded-full shadow-inner relative">
          {navItems.map((item) => {
            const isActive = currentScreen === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={`relative px-3.5 py-1.5 rounded-full font-display font-semibold text-[13px] tracking-tight transition-colors duration-200 cursor-pointer flex items-center gap-1.5 z-10 select-none ${
                  isActive
                    ? 'text-blue-700'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="activeNavPill"
                    className="absolute inset-0 bg-white rounded-full shadow-xs border border-slate-200/70 -z-10"
                    transition={{ type: 'spring', stiffness: 450, damping: 35 }}
                  />
                )}
                <span>{item.label}</span>
                {item.badge && (
                  <span className="px-1.5 py-0.2 bg-emerald-100 text-emerald-800 text-[9px] font-mono font-bold rounded-full border border-emerald-200">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Right: Streamlined Actions & Profile */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* Health Score Pill */}
          <div
            className="hidden sm:flex items-center gap-1.5 bg-emerald-50/90 hover:bg-emerald-100/70 transition-colors px-3 py-1.5 border border-emerald-200/90 rounded-full shadow-2xs cursor-default"
            title="Aggregated Financial Health Score"
          >
            <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-display font-bold text-emerald-800">
              {healthScore}/100
            </span>
          </div>

          {/* Action Icons */}
          <div className="flex items-center gap-1" ref={notifRef}>
            {/* Settings Calibration */}
            <button
              onClick={onOpenSettings}
              className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 active:scale-95 transition-all rounded-full border border-slate-200/80 shadow-2xs cursor-pointer"
              title="Calibration Settings"
            >
              <span className="material-symbols-outlined text-[19px] leading-none block">
                tune
              </span>
            </button>

            {/* Notifications Trigger */}
            <div className="relative">
              <button
                onClick={() => setNotificationsOpen(!notificationsOpen)}
                className={`p-2 transition-all rounded-full border shadow-2xs relative cursor-pointer active:scale-95 ${
                  notificationsOpen
                    ? 'bg-blue-50 border-blue-300 text-blue-700'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 border-slate-200/80'
                }`}
                title="Notifications"
              >
                <span className="material-symbols-outlined text-[19px] leading-none block">
                  notifications
                </span>
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 size-2 bg-blue-600 rounded-full ring-2 ring-white animate-pulse" />
                )}
              </button>

              {/* Notifications Dropdown */}
              <AnimatePresence>
                {notificationsOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 4, scale: 0.95 }}
                    transition={{ duration: 0.15, ease: 'easeOut' }}
                    className="absolute top-12 right-0 w-80 sm:w-96 bg-white/95 backdrop-blur-xl border border-slate-200/90 rounded-2xl shadow-2xl p-4 z-50 space-y-2"
                  >
                    <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                      <div className="flex items-center gap-2 font-display font-bold text-xs text-slate-900">
                        <span className="size-2 rounded-full bg-blue-600 animate-pulse" />
                        <span>Telemetry Alerts ({unreadCount})</span>
                      </div>
                      <button
                        onClick={() => setNotificationsOpen(false)}
                        className="text-slate-400 hover:text-slate-700 text-xs font-mono px-1.5 py-0.5 rounded hover:bg-slate-100 transition-colors"
                      >
                        ESC
                      </button>
                    </div>

                    <div className="divide-y divide-slate-100 max-h-72 overflow-y-auto pt-1 text-left">
                      <div className="py-2.5 space-y-1 hover:bg-slate-50/80 p-2 rounded-xl transition-colors">
                        <div className="flex items-center justify-between text-[11px] font-mono">
                          <span className="text-emerald-700 font-bold bg-emerald-50 border border-emerald-200/60 px-1.5 py-0.5 rounded">
                            INCOME DETECT
                          </span>
                          <span className="text-slate-400">10m ago</span>
                        </div>
                        <p className="text-xs text-slate-800 leading-snug">
                          Salary credits reached ₹55,000. Recalibration prompt active.
                        </p>
                      </div>

                      <div className="py-2.5 space-y-1 hover:bg-slate-50/80 p-2 rounded-xl transition-colors">
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

                      <div className="py-2.5 space-y-1 hover:bg-slate-50/80 p-2 rounded-xl transition-colors">
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
                        className="text-blue-600 hover:text-blue-800 font-display font-semibold text-xs flex items-center gap-1 transition-colors cursor-pointer"
                      >
                        <span>View Cash Radar</span>
                        <span>→</span>
                      </button>
                      <button
                        onClick={() => {
                          setUnreadCount(0);
                          setNotificationsOpen(false);
                        }}
                        className="text-slate-500 hover:text-slate-800 text-xs font-medium transition-colors cursor-pointer"
                      >
                        Mark All Read
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Mobile Hamburger Trigger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 text-slate-600 hover:text-slate-900 rounded-full border border-slate-200/80 hover:bg-slate-100 transition-colors"
              aria-label="Toggle Navigation Drawer"
            >
              <span className="material-symbols-outlined text-[20px] block">
                {mobileMenuOpen ? 'close' : 'menu'}
              </span>
            </button>
          </div>

          {/* User Profile Pill */}
          <div className="relative pl-1 sm:pl-2" ref={profileRef}>
            {user ? (
              <div>
                <button
                  onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                  className="flex items-center gap-2 px-2.5 py-1 rounded-full bg-slate-50 hover:bg-slate-100 border border-slate-200 transition-all cursor-pointer group active:scale-95 whitespace-nowrap"
                >
                  <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center font-display font-bold text-[10px]">
                    {user.avatar}
                  </div>
                  <span className="text-xs font-display font-semibold text-slate-800 hidden sm:inline">
                    {user.name.split(' ')[0]}
                  </span>
                  <span className="material-symbols-outlined text-[15px] text-slate-400 group-hover:translate-y-0.5 transition-transform">
                    expand_more
                  </span>
                </button>

                <AnimatePresence>
                  {profileDropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 8, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 4, scale: 0.95 }}
                      transition={{ duration: 0.15, ease: 'easeOut' }}
                      className="absolute top-12 right-0 w-72 bg-white/95 backdrop-blur-xl border border-slate-200/90 rounded-2xl shadow-2xl p-4 z-50 space-y-3 text-left"
                    >
                      <div className="border-b border-slate-100 pb-3">
                        <div className="text-sm font-display font-bold text-slate-900">{user.name}</div>
                        <div className="text-xs text-slate-500">{user.email}</div>
                        <div className="text-[10px] font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full mt-1.5 inline-block font-semibold border border-emerald-200">
                          {user.role}
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <div className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">SWITCH DEMO PERSONA</div>
                        {DEMO_PROFILES.map((p) => (
                          <button
                            key={p.id}
                            onClick={() => {
                              loginWithProfile(p.id);
                              setProfileDropdownOpen(false);
                            }}
                            className={`w-full text-left p-2.5 rounded-xl text-xs flex items-center justify-between transition-all cursor-pointer ${
                              user.id === p.id
                                ? 'bg-blue-50 text-blue-700 font-bold border border-blue-200/60'
                                : 'hover:bg-slate-50 text-slate-700'
                            }`}
                          >
                            <span className="font-display font-medium">{p.name}</span>
                            <span className="font-mono text-[10px] text-slate-500">₹{(p.monthlyIncome/1000).toFixed(0)}k/mo</span>
                          </button>
                        ))}
                      </div>

                      <div className="pt-2 border-t border-slate-100 flex justify-between">
                        <button
                          onClick={() => {
                            setProfileDropdownOpen(false);
                            onNavigate('login');
                          }}
                          className="text-xs text-blue-600 font-display font-semibold hover:underline cursor-pointer"
                        >
                          Login Screen
                        </button>
                        <button
                          onClick={() => {
                            logout();
                            setProfileDropdownOpen(false);
                            onNavigate('landing');
                          }}
                          className="text-xs text-rose-600 font-display font-semibold hover:underline cursor-pointer"
                        >
                          Sign Out
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <button
                onClick={() => onNavigate('login')}
                className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-display font-bold text-xs rounded-full transition-all cursor-pointer shadow-sm active:scale-95"
              >
                Sign In
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Responsive Mobile Drawer Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="lg:hidden w-full bg-white/95 backdrop-blur-xl border-b border-slate-200 p-4 shadow-xl flex flex-col gap-1.5 overflow-hidden"
          >
            <div className="text-[10px] font-mono text-slate-400 uppercase tracking-wider px-3 pb-1">
              NAVIGATION MODULES
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
                  className={`text-left px-3.5 py-2.5 rounded-xl font-display font-semibold text-xs flex items-center justify-between transition-colors ${
                    isActive
                      ? 'bg-blue-50 text-blue-700 font-bold border border-blue-200/80'
                      : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <span>{item.label}</span>
                  {item.badge && (
                    <span className="px-1.5 py-0.5 bg-emerald-100 text-emerald-800 text-[9px] font-mono font-bold rounded-full">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
            <div className="pt-3 mt-1 border-t border-slate-100 flex items-center justify-between text-xs px-3 text-slate-600">
              <span className="font-medium font-display">Health: {healthScore}/100</span>
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenLogs();
                }}
                className="text-blue-600 font-display font-semibold text-xs hover:underline"
              >
                View Logs →
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};
