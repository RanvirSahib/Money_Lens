'use client';

import { Lightbulb, TrendingUp, AlertTriangle } from "lucide-react";
import { SectionPanel } from "@/components/common/finance-ui";

export function FinancialIntelligencePanel() {
  const observations = [
    {
      id: "1",
      type: "warning",
      title: "Discretionary Spending Inflection",
      observation: "Discretionary spending increased 18% over the last 3 consecutive months.",
      evidence: "Average discretionary spend shifted from ₹7,200/mo to ₹8,500/mo, primarily in dining and subscriptions.",
      simulation: "Under current spending pacing, Emergency Fund goal target completion extends by 1.8 months.",
      possibleAction: "Consider reviewing recurring subscription renewals or setting a discretionary cap of ₹7,500/mo.",
    },
    {
      id: "2",
      type: "positive",
      title: "Surplus Capital Efficiency",
      observation: "Unallocated liquid cash buffer is accumulating in low-yield savings.",
      evidence: "Monthly net surplus of ₹30,000 exceeds immediate 2-month emergency reserve requirements.",
      simulation: "Allocating ₹10,000/mo into a targeted recurring deposit yields an estimated +₹8,200 additional compounding over 24 months.",
      possibleAction: "Test diverting part of monthly surplus toward Goal Engine milestones.",
    },
  ];

  return (
    <SectionPanel
      title="Financial Intelligence"
      description="System observations structured by empirical data, trajectory simulation, and actionable levers."
    >
      <div className="grid gap-4 lg:grid-cols-2">
        {observations.map((item) => (
          <div
            key={item.id}
            className="rounded-xl border border-border/70 bg-[#07101D]/80 p-4 transition-all hover:border-primary/40 hover:bg-[#101B2D]"
          >
            <div className="flex items-center gap-2 mb-3">
              {item.type === "warning" ? (
                <div className="flex size-6 items-center justify-center rounded-md border border-warning/30 bg-warning/10 text-warning">
                  <AlertTriangle className="size-3.5" />
                </div>
              ) : (
                <div className="flex size-6 items-center justify-center rounded-md border border-primary/30 bg-primary/10 text-primary">
                  <Lightbulb className="size-3.5" />
                </div>
              )}
              <h4 className="font-display text-sm font-bold text-foreground">{item.title}</h4>
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="rounded-lg border border-border/60 bg-[#0B1422] p-2.5">
                <span className="data-label text-[0.65rem] text-primary">Observation</span>
                <p className="mt-0.5 text-foreground leading-relaxed">{item.observation}</p>
              </div>

              <div className="rounded-lg border border-border/60 bg-[#0B1422] p-2.5">
                <span className="data-label text-[0.65rem] text-muted-foreground">Evidence</span>
                <p className="mt-0.5 text-muted-foreground leading-relaxed">{item.evidence}</p>
              </div>

              <div className="rounded-lg border border-border/60 bg-[#0B1422] p-2.5">
                <span className="data-label text-[0.65rem] text-warning">Simulation</span>
                <p className="mt-0.5 text-muted-foreground leading-relaxed">{item.simulation}</p>
              </div>

              <div className="rounded-lg border border-success/30 bg-success/10 p-2.5">
                <span className="data-label text-[0.65rem] text-success">Possible Action</span>
                <p className="mt-0.5 text-success font-medium leading-relaxed">{item.possibleAction}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </SectionPanel>
  );
}