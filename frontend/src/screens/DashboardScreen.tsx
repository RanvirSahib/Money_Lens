'use client';

import React from 'react';
import { TrajectoryNode, SimulationResult, CashFlowItem, ScreenId } from '../types';
import { CommandCenterHero } from '../components/CommandCenterHero';
import { TrajectoryVisualizer } from '../components/TrajectoryVisualizer';
import { FinancialTimeMachine } from '../components/FinancialTimeMachine';
import { ReverseTimeMachine } from '../components/ReverseTimeMachine';
import { FinancialRadar } from '../components/FinancialRadar';
import { EvidenceIntelligence } from '../components/EvidenceIntelligence';
import { IncomeNotification } from '../components/IncomeNotification';
import { HealthVitals } from '../components/HealthVitals';

interface DashboardScreenProps {
  trajectoryNodes: TrajectoryNode[];
  onNavigate: (screen: ScreenId) => void;
  onSimulationChange?: (res: SimulationResult) => void;
  savings: number;
  income: number;
  expenses: number;
  onConfirmIncome: (amt: number) => void;
  onKeepIncome: (amt: number) => void;
  onRadarItemClick?: (item: CashFlowItem) => void;
}

export const DashboardScreen: React.FC<DashboardScreenProps> = ({
  trajectoryNodes,
  onNavigate,
  onSimulationChange,
  savings,
  income,
  expenses,
  onConfirmIncome,
  onKeepIncome,
  onRadarItemClick,
}) => {
  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* 1. HERO & COMMAND CENTER TELEMETRY */}
      <CommandCenterHero
        onSimulateClick={() => onNavigate('simulator')}
        onExploreClick={() => onNavigate('lab')}
        currentSavings={savings}
        monthlyIncome={income}
        monthlyExpenses={expenses}
        activeGoalsCount={3}
        goalProgress={68}
      />

      {/* 2. INTERACTIVE 3D FINANCIAL FUTURE TRAJECTORY */}
      <TrajectoryVisualizer
        nodes={trajectoryNodes}
        selectedMonth={3}
        onSelectNode={(node) => {
          console.log('Selected trajectory node:', node);
        }}
      />

      {/* 3. FINANCIAL TIME MACHINE (SIMULATOR) */}
      <FinancialTimeMachine onSimulationChange={onSimulationChange} />

      {/* 4. TWO-COLUMN STRATEGIC SECTION */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <ReverseTimeMachine
          targetAmount={100000}
          currentAmount={savings}
          deadline="MARCH 2027"
        />
        <FinancialRadar onItemClick={onRadarItemClick} />
      </div>

      {/* 5. BOTTOM TELEMETRY PANELS */}
      <div className="space-y-8">
        <EvidenceIntelligence
          onEngageCeiling={() => {
            console.log('Discretionary ceiling engaged');
          }}
        />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <IncomeNotification
            onConfirmIncome={onConfirmIncome}
            onKeepIncome={onKeepIncome}
          />
          <HealthVitals aggregateScore={84} />
        </div>
      </div>
    </div>
  );
};
