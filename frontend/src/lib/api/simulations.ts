import { apiRequest, shouldUseMockData } from "./client";
import { mockSimulation } from "@/lib/mock/money-lens";

export interface FinancialPositionPayload {
  monthly_income: number;
  monthly_expenses: number;
  current_savings: number;
  existing_emi?: number;
}

export interface PurchaseSimulationPayload {
  monthly_income: number;
  monthly_expenses: number;
  current_savings: number;
  existing_emi?: number;
  purchase_amount: number;
}

export interface EMISimulationPayload {
  monthly_income: number;
  monthly_expenses: number;
  current_savings: number;
  existing_emi?: number;
  loan_amount: number;
  annual_interest_rate: number;
  tenure_months: number;
}

export async function simulatePosition(payload: FinancialPositionPayload) {
  if (shouldUseMockData()) {
    const surplus = payload.monthly_income - (payload.monthly_expenses + (payload.existing_emi || 0));
    return {
      monthly_surplus: surplus,
      savings_rate_pct: Number(((surplus / payload.monthly_income) * 100).toFixed(1)),
      emergency_fund_months: Number((payload.current_savings / payload.monthly_expenses).toFixed(1)),
      projected_balance_3_months: payload.current_savings + 3 * surplus,
      projected_balance_6_months: payload.current_savings + 6 * surplus,
      projected_balance_12_months: payload.current_savings + 12 * surplus,
    };
  }
  return apiRequest<any>("/api/v1/simulate/position", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function simulatePurchase(payload: PurchaseSimulationPayload) {
  if (shouldUseMockData()) {
    const surplus = payload.monthly_income - payload.monthly_expenses;
    const postSavings = payload.current_savings - payload.purchase_amount;
    return {
      purchase_amount: payload.purchase_amount,
      savings_before: payload.current_savings,
      savings_after: postSavings,
      emergency_fund_months_after: Number((postSavings / payload.monthly_expenses).toFixed(1)),
      recovery_months: Math.ceil(payload.purchase_amount / Math.max(1, surplus)),
    };
  }
  return apiRequest<any>("/api/v1/simulate/purchase", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function simulateEMI(payload: EMISimulationPayload) {
  if (shouldUseMockData()) {
    const r = (payload.annual_interest_rate / 12) / 100;
    const n = payload.tenure_months;
    const emi = r === 0 ? payload.loan_amount / n : (payload.loan_amount * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
    return {
      monthly_emi: Math.round(emi),
      total_interest: Math.round(emi * n - payload.loan_amount),
      total_payment: Math.round(emi * n),
      dti_ratio_after_pct: Number((((payload.monthly_expenses + emi) / payload.monthly_income) * 100).toFixed(1)),
    };
  }
  return apiRequest<any>("/api/v1/simulate/emi", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}
