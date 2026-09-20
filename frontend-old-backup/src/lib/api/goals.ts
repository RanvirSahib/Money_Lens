import { apiRequest, shouldUseMockData } from "./client";

export interface GoalCalculationPayload {
  title: string;
  target_amount: number;
  current_savings_allocated?: number;
  target_months?: number;
  target_deadline_months?: number;
  monthly_income?: number;
  monthly_expenses?: number;
  monthly_surplus?: number;
  existing_emi?: number;
  expected_annual_return_pct?: number;
  context_note?: string;
}

export interface GoalSavePayload {
  title: string;
  target_amount: number;
  current_savings_allocated?: number;
  current_amount?: number;
  target_months?: number;
  deadline_months?: number;
  category?: string;
  priority?: string;
  notes?: string;
}

export async function calculateGoal(payload: GoalCalculationPayload) {
  const targetMonths = payload.target_months ?? payload.target_deadline_months ?? 12;
  const currentAllocated = payload.current_savings_allocated ?? 0;
  const income = payload.monthly_income ?? (payload.monthly_surplus ? payload.monthly_surplus + 35000 : 85000);
  const expenses = payload.monthly_expenses ?? 35000;

  if (shouldUseMockData()) {
    const remaining = Math.max(0, payload.target_amount - currentAllocated);
    const reqMonthly = targetMonths > 0 ? Math.round(remaining / targetMonths) : remaining;
    const surplus = income - expenses;
    return {
      title: payload.title,
      target_amount: payload.target_amount,
      current_savings_allocated: currentAllocated,
      remaining_amount_needed: remaining,
      required_monthly_saving: reqMonthly,
      current_disposable_surplus: surplus,
      is_reachable: reqMonthly <= surplus,
      feasibility_status: reqMonthly <= surplus ? "reachable" : "stretch_goal",
    };
  }

  const backendBody = {
    title: payload.title,
    target_amount: payload.target_amount,
    current_savings_allocated: currentAllocated,
    target_months: targetMonths,
    monthly_income: income,
    monthly_expenses: expenses,
    existing_emi: payload.existing_emi ?? 0,
    expected_annual_return_pct: payload.expected_annual_return_pct ?? 0,
    context_note: payload.context_note,
  };

  return apiRequest<any>("/api/v1/goals", {
    method: "POST",
    body: JSON.stringify(backendBody),
  });
}

export async function getSavedGoals() {
  if (shouldUseMockData()) {
    return [];
  }
  return apiRequest<any[]>("/api/v1/goals/saved");
}

export async function saveGoal(payload: GoalSavePayload) {
  const currentAllocated = payload.current_savings_allocated ?? payload.current_amount ?? 0;
  const targetMonths = payload.target_months ?? payload.deadline_months ?? 12;

  if (shouldUseMockData()) {
    return { 
      id: "goal-" + Date.now(), 
      title: payload.title,
      target_amount: payload.target_amount,
      current_savings_allocated: currentAllocated,
      target_months: targetMonths,
      category: payload.category ?? "Savings",
      priority: payload.priority ?? "medium",
    };
  }

  const backendBody = {
    title: payload.title,
    target_amount: payload.target_amount,
    current_savings_allocated: currentAllocated,
    target_months: targetMonths,
    category: payload.category ?? "Savings",
    priority: payload.priority ?? "medium",
  };

  return apiRequest<any>("/api/v1/goals/save", {
    method: "POST",
    body: JSON.stringify(backendBody),
  });
}

export async function deleteSavedGoal(goalId: string) {
  if (shouldUseMockData() || !goalId || goalId.startsWith("default-")) {
    return { success: true };
  }
  try {
    return await apiRequest<any>(`/api/v1/goals/saved/${goalId}`, {
      method: "DELETE",
    });
  } catch (err) {
    console.warn(`Note on deleting goal ${goalId}:`, err);
    return { success: true, warning: "Removed locally" };
  }
}

export async function reverseGoal(payload: {
  goal_title?: string;
  target_amount: number;
  target_months?: number;
  deadline_months?: number;
  current_savings_allocated?: number;
  monthly_income: number;
  monthly_expenses: number;
  existing_emi?: number;
  expected_annual_return_pct?: number;
  context_note?: string;
}) {
  const targetMonths = payload.target_months ?? payload.deadline_months ?? 12;

  if (shouldUseMockData()) {
    const remaining = payload.target_amount - (payload.current_savings_allocated || 0);
    const reqMonthly = Math.round(remaining / targetMonths);
    const currentSurplus = payload.monthly_income - payload.monthly_expenses;
    return {
      goal_title: payload.goal_title || "Target Goal",
      target_amount: payload.target_amount,
      target_months: targetMonths,
      required_monthly_saving: reqMonthly,
      monthly_shortfall: Math.max(0, reqMonthly - currentSurplus),
      trade_off_levers: [
        `Reduce discretionary dining and entertainment by ₹${Math.round(reqMonthly * 0.4).toLocaleString('en-IN')}/mo`,
        `Reallocate monthly surplus fully towards goal sinking fund`,
      ],
    };
  }

  const backendBody = {
    target_amount: payload.target_amount,
    target_months: targetMonths,
    current_monthly_income: payload.monthly_income,
    current_monthly_expenses: payload.monthly_expenses,
    existing_emi: payload.existing_emi ?? 0,
    expected_annual_return_pct: payload.expected_annual_return_pct ?? 0,
    context_note: payload.context_note,
  };

  return apiRequest<any>("/api/v1/goals/reverse", {
    method: "POST",
    body: JSON.stringify(backendBody),
  });
}

export const getGoals = getSavedGoals;
export const createGoal = saveGoal;
