import { apiRequest, shouldUseMockData } from "./client";
import { UserProfile } from "@/types";

export interface RegisterPayload {
  email: string;
  name: string;
  password: string;
  monthly_income?: number;
  monthly_expenses?: number;
  current_savings?: number;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface AuthApiResponse {
  user: {
    id: string;
    email: string;
    name: string;
    monthly_income: number;
    monthly_expenses: number;
    current_savings: number;
    health_score: number;
    created_at?: string;
  };
  token: string;
  message: string;
}

export async function registerUser(payload: RegisterPayload): Promise<UserProfile> {
  if (shouldUseMockData()) {
    return {
      id: "usr_" + Date.now(),
      name: payload.name,
      email: payload.email,
      avatar: (payload.name[0] || "U").toUpperCase(),
      role: "Verified Investor",
      monthlyIncome: payload.monthly_income ?? 85000,
      monthlyExpenses: payload.monthly_expenses ?? 35000,
      currentSavings: payload.current_savings ?? 150000,
      healthScore: 88,
    };
  }

  const res = await apiRequest<AuthApiResponse>("/api/v1/auth/signup", {
    method: "POST",
    body: JSON.stringify(payload),
  });

  return {
    id: res.user.id,
    name: res.user.name,
    email: res.user.email,
    avatar: (res.user.name[0] || "U").toUpperCase(),
    role: "Verified Investor",
    monthlyIncome: res.user.monthly_income,
    monthlyExpenses: res.user.monthly_expenses,
    currentSavings: res.user.current_savings,
    healthScore: res.user.health_score,
  };
}

export async function loginUser(payload: LoginPayload): Promise<UserProfile> {
  if (shouldUseMockData()) {
    const name = payload.email.split("@")[0].replace(".", " ").replace(/^\w/, (c) => c.toUpperCase());
    return {
      id: "usr_" + Date.now(),
      name: name || "Verified User",
      email: payload.email,
      avatar: (name[0] || "U").toUpperCase(),
      role: "Verified Investor",
      monthlyIncome: 85000,
      monthlyExpenses: 35000,
      currentSavings: 150000,
      healthScore: 88,
    };
  }

  const res = await apiRequest<AuthApiResponse>("/api/v1/auth/login", {
    method: "POST",
    body: JSON.stringify(payload),
  });

  return {
    id: res.user.id,
    name: res.user.name,
    email: res.user.email,
    avatar: (res.user.name[0] || "U").toUpperCase(),
    role: "Verified Investor",
    monthlyIncome: res.user.monthly_income,
    monthlyExpenses: res.user.monthly_expenses,
    currentSavings: res.user.current_savings,
    healthScore: res.user.health_score,
  };
}

export async function updateUserProfile(userId: string, payload: {
  name?: string;
  monthly_income?: number;
  monthly_expenses?: number;
  current_savings?: number;
}) {
  if (shouldUseMockData()) {
    return { success: true };
  }
  return apiRequest<any>(`/api/v1/auth/users/${userId}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}
