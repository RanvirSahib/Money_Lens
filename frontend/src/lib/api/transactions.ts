import { apiRequest, shouldUseMockData } from "./client";

export interface TransactionPayload {
  title: string;
  amount: number;
  category: string;
  transaction_type: "income" | "expense";
  date?: string;
  is_recurring?: boolean;
  notes?: string;
}

export async function getTransactions(params?: {
  transaction_type?: string;
  category?: string;
  is_recurring?: boolean;
}) {
  if (shouldUseMockData()) {
    return [];
  }
  const query = new URLSearchParams();
  if (params?.transaction_type) query.append("transaction_type", params.transaction_type);
  if (params?.category) query.append("category", params.category);
  if (params?.is_recurring !== undefined) query.append("is_recurring", String(params.is_recurring));

  const qs = query.toString();
  return apiRequest<any[]>(`/api/v1/transactions${qs ? '?' + qs : ''}`);
}

export async function createTransaction(payload: TransactionPayload) {
  if (shouldUseMockData()) {
    return { id: "txn-" + Date.now(), ...payload };
  }
  return apiRequest<any>("/api/v1/transactions", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function getTransactionSummary() {
  if (shouldUseMockData()) {
    return {
      total_income: 85000,
      total_expenses: 35000,
      net_savings: 50000,
      savings_rate_pct: 58.8,
      transaction_count: 0,
    };
  }
  return apiRequest<any>("/api/v1/transactions/summary");
}
