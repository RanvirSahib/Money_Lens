'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserProfile } from '../types';
import { loginUser, registerUser, updateUserProfile, RegisterPayload } from '../lib/api/auth';

interface AuthContextType {
  user: UserProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password?: string) => Promise<UserProfile>;
  signup: (payload: RegisterPayload) => Promise<UserProfile>;
  logout: () => void;
  updateUserParams: (income: number, expenses: number, savings: number) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Restore authenticated session from localStorage on client mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem('moneylens_user_account');
      if (stored) {
        setUser(JSON.parse(stored));
      }
    } catch {
      // Ignore parse failure
    } finally {
      setIsLoading(false);
    }
  }, []);

  const login = async (email: string, password: string = 'password123'): Promise<UserProfile> => {
    const profile = await loginUser({ email, password });
    setUser(profile);
    try {
      localStorage.setItem('moneylens_user_account', JSON.stringify(profile));
    } catch {}
    return profile;
  };

  const signup = async (payload: RegisterPayload): Promise<UserProfile> => {
    const profile = await registerUser(payload);
    setUser(profile);
    try {
      localStorage.setItem('moneylens_user_account', JSON.stringify(profile));
    } catch {}
    return profile;
  };

  const logout = () => {
    setUser(null);
    try {
      localStorage.removeItem('moneylens_user_account');
    } catch {}
  };

  const updateUserParams = async (income: number, expenses: number, savings: number) => {
    if (!user) return;
    const updated: UserProfile = {
      ...user,
      monthlyIncome: income,
      monthlyExpenses: expenses,
      currentSavings: savings,
    };
    setUser(updated);
    try {
      localStorage.setItem('moneylens_user_account', JSON.stringify(updated));
    } catch {}

    try {
      await updateUserProfile(user.id, {
        monthly_income: income,
        monthly_expenses: expenses,
        current_savings: savings,
      });
    } catch (err) {
      console.error('Failed to sync profile update to PostgreSQL RDS:', err);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        signup,
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
