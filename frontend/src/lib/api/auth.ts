import { apiRequest } from "./client";
import { UserProfile } from "@/types";

export interface RegisterPayload {
  email: string;
  username: string;
  name: string;
  password: string;
  otp_code?: string;
  monthly_income?: number;
  monthly_expenses?: number;
  current_savings?: number;
}

export interface LoginPayload {
  identifier: string; // Can be email or username
  password: string;
}

export interface SendOtpPayload {
  email: string;
  purpose?: string;
}

export interface VerifyOtpPayload {
  email: string;
  otp_code: string;
}

export interface OtpApiResponse {
  success: boolean;
  email: string;
  message: string;
  sandbox_otp?: string;
}

export interface AuthApiResponse {
  user: {
    id: string;
    email: string;
    username?: string;
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

export async function sendOtpApi(email: string, purpose: string = "auth"): Promise<OtpApiResponse> {
  return apiRequest<OtpApiResponse>("/api/v1/auth/send-otp", {
    method: "POST",
    body: JSON.stringify({ email, purpose }),
  });
}

export async function verifyOtpApi(email: string, otp_code: string): Promise<OtpApiResponse> {
  return apiRequest<OtpApiResponse>("/api/v1/auth/verify-otp", {
    method: "POST",
    body: JSON.stringify({ email, otp_code }),
  });
}

export async function registerUser(payload: RegisterPayload): Promise<UserProfile> {
  const res = await apiRequest<AuthApiResponse>("/api/v1/auth/signup", {
    method: "POST",
    body: JSON.stringify(payload),
  });

  return {
    id: res.user.id,
    name: res.user.name,
    email: res.user.email,
    username: res.user.username,
    avatar: (res.user.name[0] || "U").toUpperCase(),
    role: "Verified Investor",
    monthlyIncome: res.user.monthly_income,
    monthlyExpenses: res.user.monthly_expenses,
    currentSavings: res.user.current_savings,
    healthScore: res.user.health_score,
  };
}

export async function loginUser(payload: LoginPayload): Promise<UserProfile> {
  const res = await apiRequest<AuthApiResponse>("/api/v1/auth/login", {
    method: "POST",
    body: JSON.stringify(payload),
  });

  return {
    id: res.user.id,
    name: res.user.name,
    email: res.user.email,
    username: res.user.username,
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
  return apiRequest<any>(`/api/v1/auth/users/${userId}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}
