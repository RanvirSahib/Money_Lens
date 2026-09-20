import { apiRequest, shouldUseMockData } from "./client";
import { DetailedFinancialProfile, DiscrepancyComparison } from "@/types";

export async function getProfile(userId: string = "usr_demo_01"): Promise<DetailedFinancialProfile> {
  if (shouldUseMockData()) {
    return {
      name: "Aarav Sharma",
      monthly_income: 85000,
      essential_expenses: 20000,
      discretionary_expenses: 15000,
      current_savings: 150000,
      monthly_investments: 10000,
      active_emis: 0,
      active_loans: 0,
      other_recurring_expenses: 0,
      total_monthly_expenses: 35000,
      monthly_surplus: 40000,
      savings_rate_pct: 11.8,
      dti_ratio_pct: 0,
      emergency_fund_runway_months: 4.3,
      health_score: 88,
    };
  }
  return apiRequest<DetailedFinancialProfile>(`/api/v1/profile?user_id=${encodeURIComponent(userId)}`);
}

export async function updateProfile(
  updates: Partial<DetailedFinancialProfile>,
  userId: string = "usr_demo_01"
): Promise<DetailedFinancialProfile> {
  if (shouldUseMockData()) {
    const inc = updates.monthly_income ?? 85000;
    const ess = updates.essential_expenses ?? 20000;
    const disc = updates.discretionary_expenses ?? 15000;
    const sav = updates.current_savings ?? 150000;
    const inv = updates.monthly_investments ?? 10000;
    const emi = updates.active_emis ?? 0;
    const totExp = ess + disc + emi + (updates.other_recurring_expenses ?? 0);
    return {
      name: updates.name ?? "Aarav Sharma",
      monthly_income: inc,
      essential_expenses: ess,
      discretionary_expenses: disc,
      current_savings: sav,
      monthly_investments: inv,
      active_emis: emi,
      active_loans: updates.active_loans ?? 0,
      other_recurring_expenses: updates.other_recurring_expenses ?? 0,
      total_monthly_expenses: totExp,
      monthly_surplus: inc - (totExp + inv),
      savings_rate_pct: Number(((inv / inc) * 100).toFixed(1)),
      dti_ratio_pct: Number(((emi / inc) * 100).toFixed(1)),
      emergency_fund_runway_months: Number((sav / totExp).toFixed(1)),
      health_score: 88,
    };
  }
  return apiRequest<DetailedFinancialProfile>(`/api/v1/profile?user_id=${encodeURIComponent(userId)}`, {
    method: "PUT",
    body: JSON.stringify(updates),
  });
}

export async function getProfileDiscrepancies(userId: string = "usr_demo_01"): Promise<DiscrepancyComparison[]> {
  if (shouldUseMockData()) {
    return [];
  }
  return apiRequest<DiscrepancyComparison[]>(`/api/v1/profile/discrepancies?user_id=${encodeURIComponent(userId)}`);
}
