'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserProfile } from '../types';

export const DEMO_PROFILES: UserProfile[] = [
  {
    id: 'tech_pro',
    name: 'Arjun Sharma',
    email: 'arjun.sharma@moneylens.ai',
    avatar: 'AS',
    role: 'Tech Lead (Base ₹55K)',
    monthlyIncome: 55000,
    monthlyExpenses: 25000,
    currentSavings: 40000,
    healthScore: 84,
  },
  {
    id: 'high_earner',
    name: 'Priya Patel',
    email: 'priya.patel@moneylens.ai',
    avatar: 'PP',
    role: 'Product Director (Base ₹1.5L)',
    monthlyIncome: 150000,
    monthlyExpenses: 60000,
    currentSavings: 250000,
    healthScore: 92,
  },
  {
    id: 'early_career',
    name: 'Rohan Mehta',
    email: 'rohan.mehta@moneylens.ai',
    avatar: 'RM',
    role: 'Product Designer (Base ₹30K)',
    monthlyIncome: 30000,
    monthlyExpenses: 18000,
    currentSavings: 15000,
    healthScore: 76,
  },
];

interface AuthContextType {
  user: UserProfile | null;
  isAuthenticated: boolean;
  login: (email: string, pass?: string) => boolean;
  loginWithProfile: (profileId: string) => void;
  logout: () => void;
  updateUserParams: (income: number, expenses: number, savings: number) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(() => DEMO_PROFILES[0]);

  useEffect(() => {
    try {
      const stored = localStorage.getItem('moneylens_user');
      if (stored) {
        setUser(JSON.parse(stored));
      }
    } catch {
      // fallback
    }
  }, []);

  const login = (email: string): boolean => {
    const matched = DEMO_PROFILES.find((p) => p.email.toLowerCase() === email.toLowerCase()) || {
      id: 'custom_user',
      name: email.split('@')[0] || 'Investor',
      email,
      avatar: (email[0] || 'U').toUpperCase(),
      role: 'Private Portfolio',
      monthlyIncome: 55000,
      monthlyExpenses: 25000,
      currentSavings: 40000,
      healthScore: 82,
    };
    setUser(matched);
    try {
      localStorage.setItem('moneylens_user', JSON.stringify(matched));
    } catch {}
    return true;
  };

  const loginWithProfile = (profileId: string) => {
    const found = DEMO_PROFILES.find((p) => p.id === profileId) || DEMO_PROFILES[0];
    setUser(found);
    try {
      localStorage.setItem('moneylens_user', JSON.stringify(found));
    } catch {}
  };

  const logout = () => {
    setUser(null);
    try {
      localStorage.removeItem('moneylens_user');
    } catch {}
  };

  const updateUserParams = (income: number, expenses: number, savings: number) => {
    if (!user) return;
    const updated: UserProfile = {
      ...user,
      monthlyIncome: income,
      monthlyExpenses: expenses,
      currentSavings: savings,
    };
    setUser(updated);
    try {
      localStorage.setItem('moneylens_user', JSON.stringify(updated));
    } catch {}
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        login,
        loginWithProfile,
        logout,
        updateUserParams,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
