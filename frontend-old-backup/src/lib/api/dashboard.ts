import { apiRequest, shouldUseMockData } from "./client";
import { mockDashboard } from "@/lib/mock/money-lens";
import type { DashboardResponse, Transaction } from "@/types/finance";

export function getDashboard(): Promise<DashboardResponse> {
  if (shouldUseMockData()) return mockDashboard();
  return apiRequest<DashboardResponse>("/api/v1/dashboard");
}

export function getTransactions(): Promise<Transaction[]> {
  if (shouldUseMockData()) {
    return mockDashboard().then((dashboard) => dashboard.transactions);
  }
  return apiRequest<Transaction[]>("/api/v1/transactions");
}
