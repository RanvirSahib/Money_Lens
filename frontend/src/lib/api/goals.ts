import { apiRequest, shouldUseMockData } from "./client";
import { mockCreateGoal, mockGoals } from "@/lib/mock/money-lens";
import type { Goal, GoalCreateRequest, GoalUpdateRequest } from "@/types/finance";

export function getGoals(): Promise<Goal[]> {
  if (shouldUseMockData()) return mockGoals();
  return apiRequest<Goal[]>("/api/v1/goals");
}

export function createGoal(request: GoalCreateRequest): Promise<Goal> {
  if (shouldUseMockData()) return mockCreateGoal(request);
  return apiRequest<Goal>("/api/v1/goals", {
    method: "POST",
    body: JSON.stringify(request),
  });
}

export function updateGoal(request: GoalUpdateRequest): Promise<Goal> {
  if (shouldUseMockData()) {
    return mockCreateGoal({
      name: request.name ?? "Updated goal",
      targetAmount: request.targetAmount ?? 100000,
      currentAmount: request.currentAmount ?? 40000,
      targetDate: request.targetDate ?? "2027-06-01",
      monthlyContribution: request.monthlyContribution,
    });
  }
  return apiRequest<Goal>(`/api/v1/goals/${request.id}`, {
    method: "PATCH",
    body: JSON.stringify(request),
  });
}

export function deleteGoal(id: string): Promise<{ success: boolean }> {
  if (shouldUseMockData()) return Promise.resolve({ success: true });
  return apiRequest<{ success: boolean }>(`/api/v1/goals/${id}`, { method: "DELETE" });
}
