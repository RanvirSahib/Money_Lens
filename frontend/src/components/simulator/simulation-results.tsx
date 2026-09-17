'use client';

import { CheckCircle2, AlertCircle, Info, Sparkles, TrendingDown, Clock, ShieldAlert, ArrowRight } from "lucide-react";
import { ComparisonChart } from "@/components/charts/comparison-chart";
import { FinancialTrajectory } from "@/components/dashboard/financial-trajectory";
import { SectionPanel, ToneBadge } from "@/components/common/finance-ui";
import { SimulationSummary } from "./simulation-summary";
import { ScenarioComparison } from "./scenario-comparison";
import type { SimulationResult } from "@/types/finance";

export function SimulationResults({ result }: { result: SimulationResult }) {
  return (
    <div className="space-y-6">
      {/* Simulation Complete Header Banner */}
      <section className="relative overflow-hidden rounded-xl border border-primary/40 bg-gradient-to-br from-[#101B2D] via-[#0B1422] to-[#050B14] p-6 shadow-glow backdrop-blur">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <span className="flex size-8 items-center justify-center rounded-lg border border-primary/30 bg-primary/10 text-primary">
              <CheckCircle2 className="size-5" />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-primary">Simulation Complete</span>
                <span className="text-xs text-muted-subtle">• 12-Month Horizon Model</span>
              </div>
              <h2 className="font-display text-xl font-bold text-foreground mt-0.5">{result.inputSummary}</h2>
            </div>
          </div>
          <span className="rounded-full border border-primary/30 bg-[#07101D] px-3.5 py-1 text-xs font-semibold text-primary">
            Hypothetical Scenario
          </span>
        </div>

        {/* Projected Impact Quick Grid */}
        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4 border-t border-border/60 pt-5">
          <div className="rounded-lg border border-border/70 bg-[#07101D]/80 p-3">
            <p className="data-label text-[0.65rem]">Projected 12M Savings</p>
            <p className="mt-1 font-display text-lg font-bold text-foreground">₹32,400</p>
            <span className="text-[0.65rem] text-muted-foreground">Estimated balance</span>
          </div>

          <div className="rounded-lg border border-border/70 bg-[#07101D]/80 p-3">
            <p className="data-label text-[0.65rem]">Goal Impact</p>
            <p className="mt-1 font-display text-lg font-bold text-warning">+2 months</p>
            <span className="text-[0.65rem] text-muted-foreground">Pacing delay</span>
          </div>

          <div className="rounded-lg border border-border/70 bg-[#07101D]/80 p-3">
            <p className="data-label text-[0.65rem]">Monthly Cash Flow</p>
            <p className="mt-1 font-display text-lg font-bold text-danger">-₹6,667 / mo</p>
            <span className="text-[0.65rem] text-muted-foreground">Recurring effect</span>
          </div>

          <div className="rounded-lg border border-border/70 bg-[#07101D]/80 p-3">
            <p className="data-label text-[0.65rem]">Liquidity Pressure</p>
            <p className="mt-1 font-display text-lg font-bold text-warning">Moderate</p>
            <span className="text-[0.65rem] text-muted-foreground">Months 2–4</span>
          </div>
        </div>
      </section>

      {/* Structured Metrics */}
      <SimulationSummary result={result} />

      {/* "Here's What Changed" Evidence Section */}
      <SectionPanel
        title="Here's What Changed"
        description="Evidence-backed observations comparing your current baseline against this simulated path."
      >
        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-xl border border-warning/30 bg-[#07101D]/90 p-4">
            <div className="flex items-center gap-2 text-xs font-bold text-warning">
              <ShieldAlert className="size-4" />
              <span>Buffer Compression Window</span>
            </div>
            <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
              Your savings buffer falls below your target 2-month expense level during months 2–4. Full buffer recovery is projected by Month 7.
            </p>
          </div>

          <div className="rounded-xl border border-primary/30 bg-[#07101D]/90 p-4">
            <div className="flex items-center gap-2 text-xs font-bold text-primary">
              <Clock className="size-4" />
              <span>Goal Pacing Ripple</span>
            </div>
            <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
              Under current assumptions, your Emergency Fund target completion shifts from June 2027 to August 2027 (+2 months).
            </p>
          </div>
        </div>

        <div className="mt-4 rounded-lg border border-border/60 bg-[#0B1422] p-3 text-[0.7rem] text-muted-foreground flex items-center gap-2">
          <Info className="size-4 text-primary shrink-0" />
          <span>Projections represent simulated estimates based on current baseline data and are not guaranteed outcomes.</span>
        </div>
      </SectionPanel>

      {/* Trajectory Visualizer with 2D / 3D Toggle */}
      <FinancialTrajectory projection={result.projection} />

      {/* Multi-Scenario Trajectory Overlay */}
      <SectionPanel
        title="Combined Multi-Scenario Comparison"
        description="Comparing Buy Now, EMI, and Save First trajectories side-by-side across the 12-month horizon."
      >
        <ComparisonChart data={result.comparison} height={320} />
      </SectionPanel>

      {/* Scenario Trade-off Cards */}
      <ScenarioComparison scenarios={result.scenarios} />
    </div>
  );
}

