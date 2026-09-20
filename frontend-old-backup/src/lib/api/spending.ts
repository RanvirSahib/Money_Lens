import { apiRequest, shouldUseMockData } from "./client";
import { SpendingInsightsData } from "@/types";

export async function getSpendingInsights(userId: string = "usr_demo_01"): Promise<SpendingInsightsData> {
  if (shouldUseMockData()) {
    return {
      total_spending: 35000,
      essential_total: 21500,
      discretionary_total: 13500,
      essential_pct: 61.4,
      discretionary_pct: 38.6,
      recurring_total: 4679,
      weekend_spending: 9800,
      weekday_spending: 25200,
      weekend_pct: 28.0,
      frequent_small_purchases_total: 3200,
      frequent_small_purchases_count: 8,
      categories: [
        { category: "Food", total_amount: 8500, percentage_of_total: 24.3, transaction_count: 5, is_essential: true, is_recurring: false },
        { category: "Restaurants", total_amount: 3200, percentage_of_total: 9.1, transaction_count: 3, is_essential: false, is_recurring: false },
        { category: "Food Delivery", total_amount: 4500, percentage_of_total: 12.9, transaction_count: 6, is_essential: false, is_recurring: false },
        { category: "Shopping", total_amount: 4200, percentage_of_total: 12.0, transaction_count: 2, is_essential: false, is_recurring: false },
        { category: "Transport", total_amount: 3800, percentage_of_total: 10.9, transaction_count: 8, is_essential: true, is_recurring: false },
        { category: "Entertainment", total_amount: 1600, percentage_of_total: 4.6, transaction_count: 2, is_essential: false, is_recurring: false },
        { category: "Subscriptions", total_amount: 1829, percentage_of_total: 5.2, transaction_count: 3, is_essential: false, is_recurring: true },
        { category: "Utilities", total_amount: 2850, percentage_of_total: 8.1, transaction_count: 2, is_essential: true, is_recurring: true },
        { category: "Healthcare", total_amount: 2250, percentage_of_total: 6.4, transaction_count: 2, is_essential: true, is_recurring: false },
        { category: "Education", total_amount: 1500, percentage_of_total: 4.3, transaction_count: 1, is_essential: true, is_recurring: false },
        { category: "Travel", total_amount: 0, percentage_of_total: 0.0, transaction_count: 0, is_essential: false, is_recurring: false },
        { category: "Other", total_amount: 771, percentage_of_total: 2.2, transaction_count: 2, is_essential: false, is_recurring: false },
      ],
      observations: [
        {
          type: "spending_trend",
          title: "Essential Outflows Foundation",
          summary: "Essential obligations account for 61.4% of total tracked monthly activity.",
          evidence: "Essential category total: ₹21,500 across Food, Utilities, Healthcare, and Transport.",
          relevant_metrics: { essential_total: 21500 },
          implication: "A solid essential floor allows predictability when planning additional savings goals.",
          possible_action: "One possible approach is maintaining a minimum 3-month essential buffer.",
        },
        {
          type: "recurring",
          title: "Automated Recurring Baseline",
          summary: "Monthly recurring commitments amount to ₹4,679.",
          evidence: "Active across Utilities (₹2,850) and Digital Subscriptions (₹1,829).",
          relevant_metrics: { recurring_total: 4679 },
          implication: "Recurring commitments are fixed monthly outflows that reduce baseline discretionary flexibility.",
          possible_action: "Periodically reviewing subscription utility preserves monthly surplus.",
        },
      ],
    };
  }
  return apiRequest<SpendingInsightsData>(`/api/v1/spending/insights?user_id=${encodeURIComponent(userId)}`);
}
