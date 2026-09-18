'use client';

import React from 'react';
import { ScreenId } from '../types';
import { LandingHero } from '../components/landing/LandingHero';
import { LandingTimeMachineTeaser } from '../components/landing/LandingTimeMachineTeaser';
import { LandingTrajectory3D } from '../components/landing/LandingTrajectory3D';
import { LandingRadarSection } from '../components/landing/LandingRadarSection';
import { LandingMetricsGrid } from '../components/landing/LandingMetricsGrid';
import { LandingCTA } from '../components/landing/LandingCTA';
import { LandingFooter } from '../components/landing/LandingFooter';

interface LandingScreenProps {
  onNavigate: (screen: ScreenId) => void;
}

export const LandingScreen: React.FC<LandingScreenProps> = ({ onNavigate }) => {
  return (
    <div className="w-full flex flex-col -mx-4 sm:-mx-6 lg:-mx-12 -my-8 overflow-hidden">
      <LandingHero onNavigate={onNavigate} />
      <LandingTimeMachineTeaser onNavigate={onNavigate} />
      <LandingTrajectory3D onNavigate={onNavigate} />
      <LandingRadarSection onNavigate={onNavigate} />
      <LandingMetricsGrid />
      <LandingCTA onNavigate={onNavigate} />
      <LandingFooter onNavigate={onNavigate} />
    </div>
  );
};
