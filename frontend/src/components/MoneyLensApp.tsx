'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ScreenId, TrajectoryNode, SimulationResult, CashFlowItem } from '../types';
import { INITIAL_TRAJECTORY_NODES } from '../data/mockData';
import { AuthProvider, useAuth } from '../context/AuthContext';
import { Header } from './Header';
import { Footer } from './Footer';
import { LandingScreen } from '../screens/LandingScreen';
import { LoginScreen } from '../screens/LoginScreen';
import { DashboardScreen } from '../screens/DashboardScreen';
import { SimulatorScreen } from '../screens/SimulatorScreen';
import { GoalsScreen } from '../screens/GoalsScreen';
import { ReverseScreen } from '../screens/ReverseScreen';
import { RadarScreen } from '../screens/RadarScreen';
import { LabScreen } from '../screens/LabScreen';
import { SysLogsModal } from './SysLogsModal';
import { SettingsModal } from './SettingsModal';
import { InfoModal } from './InfoModals';

interface MoneyLensAppProps {
  initialScreen?: ScreenId;
}

function MoneyLensAppInner({ initialScreen = 'landing' }: MoneyLensAppProps) {
  const { user, updateUserParams } = useAuth();
  const [currentScreen, setCurrentScreen] = useState<ScreenId>(initialScreen);
  const [savings, setSavings] = useState(40000);
  const [income, setIncome] = useState(55000);
  const [expenses, setExpenses] = useState(25000);
  const [healthScore, setHealthScore] = useState(84);
  const [trajectoryNodes, setTrajectoryNodes] = useState<TrajectoryNode[]>(
    INITIAL_TRAJECTORY_NODES
  );

  const [isLogsOpen, setIsLogsOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [infoModalType, setInfoModalType] = useState<'terms' | 'audit' | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Sync user profile changes to baseline calculations
  useEffect(() => {
    if (user) {
      setSavings(user.currentSavings);
      setIncome(user.monthlyIncome);
      setExpenses(user.monthlyExpenses);
      setHealthScore(user.healthScore);
      
      const updated = INITIAL_TRAJECTORY_NODES.map((n) => ({
        ...n,
        baseline: user.currentSavings + n.monthIndex * (user.monthlyIncome - user.monthlyExpenses),
      }));
      setTrajectoryNodes(updated);
    }
  }, [user]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  const handleNavigate = (screen: ScreenId) => {
    setCurrentScreen(screen);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSimulationChange = (res: SimulationResult) => {
    showToast(`Simulation recalibrated: ${res.potentialPressure} pressure detected.`);
  };

  const handleConfirmIncome = (amt: number) => {
    setIncome(amt);
    setHealthScore(88);
    updateUserParams(amt, expenses, savings);
    showToast(`Income updated to ₹${amt.toLocaleString('en-IN')}. Engine recalibrated.`);
  };

  const handleKeepIncome = (amt: number) => {
    setIncome(amt);
    showToast(`Income maintained at ₹${amt.toLocaleString('en-IN')}.`);
  };

  const handleSaveSettings = (newInc: number, newExp: number, newSav: number) => {
    setIncome(newInc);
    setExpenses(newExp);
    setSavings(newSav);
    updateUserParams(newInc, newExp, newSav);

    // Recalibrate trajectory nodes
    const updated = trajectoryNodes.map((n) => ({
      ...n,
      baseline: newSav + n.monthIndex * (newInc - newExp),
    }));
    setTrajectoryNodes(updated);
    showToast('Engine parameters recalibrated with updated baseline values.');
  };

  const handleRadarItemClick = (item: CashFlowItem) => {
    showToast(`${item.title}: ${item.amount < 0 ? '-' : '+'}₹${Math.abs(item.amount).toLocaleString('en-IN')} (${item.subtitle})`);
  };

  return (
    <div className="bg-slate-50 text-slate-900 selection:bg-blue-100 selection:text-blue-900 font-sans antialiased min-h-screen flex flex-col relative bg-grid-subtle">
      {/* Toast Notification Banner */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 bg-slate-900 text-white px-4 py-2.5 rounded-xl shadow-xl border border-slate-800 text-xs font-mono flex items-center gap-2 animate-in fade-in slide-in-from-top-3">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>{toastMessage}</span>
          <button
            onClick={() => setToastMessage(null)}
            className="ml-2 text-slate-400 hover:text-white cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      {/* Top Navigation Bar */}
      <Header
        currentScreen={currentScreen}
        onNavigate={handleNavigate}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenLogs={() => setIsLogsOpen(true)}
        healthScore={healthScore}
      />

      {/* Main Container with Smooth Animated Transition */}
      <main className={`flex-1 w-full ${currentScreen === 'landing' ? 'p-0 max-w-full' : 'max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-12 py-8'}`}>
        <AnimatePresence mode="wait">
          <motion.div
            key={currentScreen}
            initial={{ opacity: 0, y: 10, scale: 0.995 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.995 }}
            transition={{ duration: 0.24, ease: [0.16, 1, 0.3, 1] }}
            className="w-full"
          >
            {currentScreen === 'landing' && (
              <LandingScreen onNavigate={handleNavigate} />
            )}

            {currentScreen === 'login' && (
              <LoginScreen onNavigate={handleNavigate} />
            )}

            {currentScreen === 'dashboard' && (
              <DashboardScreen
                trajectoryNodes={trajectoryNodes}
                onNavigate={handleNavigate}
                onSimulationChange={handleSimulationChange}
                savings={savings}
                income={income}
                expenses={expenses}
                onConfirmIncome={handleConfirmIncome}
                onKeepIncome={handleKeepIncome}
                onRadarItemClick={handleRadarItemClick}
              />
            )}

            {currentScreen === 'simulator' && (
              <SimulatorScreen
                trajectoryNodes={trajectoryNodes}
                savings={savings}
                income={income}
                expenses={expenses}
              />
            )}

            {currentScreen === 'goals' && <GoalsScreen />}

            {currentScreen === 'reverse' && (
              <ReverseScreen
                savings={savings}
                income={income}
                expenses={expenses}
              />
            )}

            {currentScreen === 'radar' && (
              <RadarScreen
                savings={savings}
                income={income}
                expenses={expenses}
              />
            )}

            {currentScreen === 'lab' && <LabScreen />}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Footer for App Screens */}
      {currentScreen !== 'landing' && (
        <Footer
          onOpenLogs={() => setIsLogsOpen(true)}
          onOpenTerms={() => setInfoModalType('terms')}
          onOpenAudit={() => setInfoModalType('audit')}
        />
      )}

      {/* Mission Control System Modals */}
      <SysLogsModal
        isOpen={isLogsOpen}
        onClose={() => setIsLogsOpen(false)}
      />

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        monthlyIncome={income}
        monthlyExpenses={expenses}
        savings={savings}
        onSave={handleSaveSettings}
      />

      <InfoModal
        type={infoModalType}
        onClose={() => setInfoModalType(null)}
      />
    </div>
  );
}

export function MoneyLensApp(props: MoneyLensAppProps) {
  return (
    <AuthProvider>
      <MoneyLensAppInner {...props} />
    </AuthProvider>
  );
}
