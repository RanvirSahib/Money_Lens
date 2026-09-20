'use client';

import { ShieldCheck, TrendingUp, AlertCircle, CheckCircle, Percent } from "lucide-react";
import { SectionPanel } from "@/components/common/finance-ui";

export function FinancialHealthTelemetry() {
  const dimensions = [
    {
      label: "Savings Buffer",
      status: "Strong",
      statusColor: "text-success",
      badgeColor: "border-success/30 bg-success/15 text-success",
      evidence: "Current savings of ₹40,000 covers ~1.6 months of average expenses (₹25,000/mo).",
      icon: ShieldCheck,
      score: 85,
    },
    {
      label: "Cash Flow Stability",
      status: "Moderate",
      statusColor: "text-warning",
      badgeColor: "border-warning/30 bg-warning/15 text-warning",
      evidence: "Net positive monthly surplus of ₹30,000; discretionary variance is +18% over last quarter.",
      icon: TrendingUp,
      score: 72,
    },
    {
      label: "Goal Progress",
      status: "Strong",
      statusColor: "text-success",
      badgeColor: "border-success/30 bg-success/15 text-success",
      evidence: "68% pacing across 3 active goals; on track for Emergency Fund milestone by June 2027.",
      icon: CheckCircle,
      score: 88,
    },
    {
      label: "Recurring Expense Load",
      status: "Moderate",
      statusColor: "text-warning",
      badgeColor: "border-warning/30 bg-warning/15 text-warning",
      evidence: "Fixed obligations represent 45.4% of monthly net income (recommended < 50%).",
      icon: Percent,
      score: 70,
    },
    {
      label: "Income Stability",
      status: "Strong",
      statusColor: "text-success",
      badgeColor: "border-success/30 bg-success/15 text-success",
      evidence: "Consistent salary deposits with detected upward trend to ₹55,000/mo.",
      icon: AlertCircle,
      score: 92,
    },
  ];

  return (
    <SectionPanel
      title="Financial Health Telemetry"
      description="Multi-dimensional diagnostic metrics backed by empirical transaction data."
    >
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {dimensions.map((dim) => {
          const Icon = dim.icon;
          return (
            <div
              key={dim.label}
              className="rounded-xl border border-border/70 bg-[#07101D]/80 p-4 transition-all duration-200 hover:border-primary/40 hover:bg-[#101B2D]"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="flex size-7 items-center justify-center rounded-lg border border-border bg-[#0B1422] text-primary">
                    <Icon className="size-3.5" />
                  </div>
                  <h4 className="font-display text-xs font-bold text-foreground">{dim.label}</h4>
                </div>
                <span className={`rounded px-2 py-0.5 text-[0.65rem] font-bold border ${dim.badgeColor}`}>
                  {dim.status}
                </span>
              </div>

              <div className="mt-3">
                <div className="flex items-center justify-between text-[0.65rem] text-muted-foreground">
                  <span>Stability index</span>
                  <span className="font-bold text-foreground">{dim.score}%</span>
                </div>
                <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-[#0B1422]">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-primary to-success"
                    style={{ width: `${dim.score}%` }}
                  />
                </div>
              </div>

              <p className="mt-3 text-[0.68rem] leading-relaxed text-muted-foreground border-t border-border/50 pt-2">
                {dim.evidence}
              </p>
            </div>
          );
        })}
      </div>
    </SectionPanel>
  );
}