'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserProfile } from '../types';
import { loginUser, registerUser, updateUserProfile, sendOtpApi, verifyOtpApi, RegisterPayload, OtpApiResponse } from '../lib/api/auth';

interface AuthContextType {
  user: UserProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (identifier: string, password?: string) => Promise<UserProfile>;
  signup: (payload: RegisterPayload) => Promise<UserProfile>;
  sendOtp: (email: string, purpose?: string) => Promise<OtpApiResponse>;
  verifyOtp: (email: string, code: string) => Promise<OtpApiResponse>;
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

  const login = async (identifier: string, password: string = 'password123'): Promise<UserProfile> => {
    const profile = await loginUser({ identifier, password });
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

  const sendOtp = async (email: string, purpose: string = 'auth'): Promise<OtpApiResponse> => {
    return sendOtpApi(email, purpose);
  };

  const verifyOtp = async (email: string, code: string): Promise<OtpApiResponse> => {
    return verifyOtpApi(email, code);
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
        sendOtp,
        verifyOtp,
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
