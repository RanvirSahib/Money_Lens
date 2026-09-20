import { Banknote, PiggyBank, ReceiptText, Target } from "lucide-react";
import { MetricCard } from "@/components/common/finance-ui";
import { formatINR } from "@/lib/formatters";
import type { FinancialSummary as Summary } from "@/types/finance";

export function FinancialSummary({ summary }: { summary: Summary }) {
  return (
    <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4" aria-label="Financial summary">
      <MetricCard label="Current savings" value={formatINR(summary.currentSavings)} helper={summary.sampleDataLabel} tone="positive" icon={<PiggyBank className="size-5" aria-hidden="true" />} />
      <MetricCard label="Monthly income" value={formatINR(summary.monthlyIncome)} helper="Expected monthly inflow" tone="positive" icon={<Banknote className="size-5" aria-hidden="true" />} />
      <MetricCard label="Monthly expenses" value={formatINR(summary.monthlyExpenses)} helper="Estimated recurring outflow" tone="warning" icon={<ReceiptText className="size-5" aria-hidden="true" />} />
      <MetricCard label="Active goals" value={`${summary.activeGoals}`} helper="Plans being tracked" tone="neutral" icon={<Target className="size-5" aria-hidden="true" />} />
    </section>
  );
}
