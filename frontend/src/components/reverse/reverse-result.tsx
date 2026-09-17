'use client';

import { ArrowLeft, ArrowDown, Route as RouteIcon, Target, Sparkles, CheckCircle2, ChevronRight } from "lucide-react";
import { FinancialTrajectory } from "@/components/dashboard/financial-trajectory";
import { MetricCard, SectionPanel, ToneBadge } from "@/components/common/finance-ui";
import { formatINR } from "@/lib/formatters";
import type { ReverseResult as ReverseResultType } from "@/types/finance";

export function ReverseResult({ result }: { result: ReverseResultType }) {
  return (
    <div className="space-y-6">
      {/* Backward Milestone Pathfinder Ribbon */}
      <section className="rounded-xl border border-primary/40 bg-gradient-to-br from-[#101B2D] via-[#0B1422] to-[#050B14] p-6 shadow-glow backdrop-blur">
        <div className="flex items-center gap-2 mb-4">
          <span className="flex size-7 items-center justify-center rounded-lg border border-primary/30 bg-primary/10 text-primary">
            <Target className="size-4" />
          </span>
          <div>
            <h3 className="font-display text-sm font-bold text-foreground">Backward Path Telemetry</h3>
            <p className="text-xs text-muted-foreground">Path calculated backward from target horizon to current position.</p>
          </div>
        </div>

        {/* Backward flow steps */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="rounded-lg border border-primary/40 bg-[#07101D] p-4 text-center">
            <span className="data-label text-[0.65rem] text-primary">Future Destination</span>
            <p className="mt-1 font-display text-base font-bold text-foreground">{result.targetLabel}</p>
            <span className="text-[0.65rem] text-muted-foreground">Desired horizon</span>
          </div>

          <div className="rounded-lg border border-warning/40 bg-[#07101D] p-4 text-center">
            <span className="data-label text-[0.65rem] text-warning">Pacing Rate</span>
            <p className="mt-1 font-display text-base font-bold text-warning">{result.timeline}</p>
            <span className="text-[0.65rem] text-muted-foreground">Required velocity</span>
          </div>

          <div className="rounded-lg border border-success/40 bg-[#07101D] p-4 text-center">
            <span className="data-label text-[0.65rem] text-success">Current Position</span>
            <p className="mt-1 font-display text-base font-bold text-success">₹40,000</p>
            <span className="text-[0.65rem] text-muted-foreground">Baseline balance</span>
          </div>
        </div>
      </section>

      <div className="grid gap-4 md:grid-cols-2">
        <MetricCard
          label="Total Capital Gap"
          value={formatINR(result.remainingAmount)}
          helper="Net savings needed to achieve horizon milestone"
          tone="warning"
          icon={<RouteIcon className="size-5" aria-hidden="true" />}
        />
        <MetricCard
          label="Required Monthly Pacing"
          value={formatINR(result.requiredMonthlySaving)}
          helper="Calculated contribution required each month"
          tone="positive"
          icon={<Sparkles className="size-5 text-primary" aria-hidden="true" />}
        />
      </div>

      {/* Possible Financial Levers & Trade-offs */}
      <SectionPanel
        title="Actionable Trade-off Levers"
        description="Non-judgmental options to adjust pacing or accelerate completion."
      >
        <div className="grid gap-4 md:grid-cols-3">
          {result.levers.map((lever) => (
            <article
              key={lever.id}
              className="rounded-xl border border-border/70 bg-[#07101D]/80 p-4 transition-all duration-200 hover:border-primary/40 hover:bg-[#101B2D]"
            >
              <div className="flex items-start justify-between gap-3">
                <h4 className="font-display text-sm font-bold text-foreground">{lever.title}</h4>
                <ToneBadge tone={lever.tone}>{lever.monthlyEffect}</ToneBadge>
              </div>
              <p className="mt-3 text-xs leading-relaxed text-muted-foreground">{lever.description}</p>
            </article>
          ))}
        </div>
      </SectionPanel>

      {/* Trajectory Visualizer with 2D / 3D Toggle */}
      <FinancialTrajectory projection={result.projection} />
    </div>
  );
}

