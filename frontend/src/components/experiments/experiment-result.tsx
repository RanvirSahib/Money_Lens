'use client';

import { FlaskConical, CheckCircle2, Split, Info } from "lucide-react";
import { ComparisonChart } from "@/components/charts/comparison-chart";
import { SectionPanel } from "@/components/common/finance-ui";
import { ScenarioComparison } from "@/components/simulator/scenario-comparison";
import type { ExperimentResult as ExperimentResultType } from "@/types/finance";

export function ExperimentResult({ result }: { result: ExperimentResultType }) {
  return (
    <div className="space-y-6">
      {/* Laboratory Simulation Header */}
      <section className="rounded-xl border border-primary/40 bg-gradient-to-br from-[#101B2D] via-[#0B1422] to-[#050B14] p-6 shadow-glow backdrop-blur">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <span className="flex size-8 items-center justify-center rounded-lg border border-primary/30 bg-primary/10 text-primary">
              <FlaskConical className="size-4" />
            </span>
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-primary">
                Multi-Branch Simulation Active
              </span>
              <h2 className="font-display text-lg font-bold text-foreground mt-0.5">
                Side-by-Side Scenario Matrix
              </h2>
            </div>
          </div>
          <span className="rounded-full border border-primary/30 bg-[#07101D] px-3.5 py-1 text-xs font-semibold text-primary">
            {result.scenarios.length} Scenarios Compared
          </span>
        </div>
      </section>

      {/* Multi-Scenario Overlay Trajectory Chart */}
      <SectionPanel
        title="Multi-Trajectory Overlay"
        description="Visualizing all simulated scenario paths against each other across the 12-month horizon."
      >
        <ComparisonChart data={result.comparison} height={340} />
      </SectionPanel>

      {/* Side-by-Side Trade-off Cards */}
      <ScenarioComparison scenarios={result.scenarios} />

      {/* Concrete Scenario Differences */}
      <SectionPanel
        title="Key Trade-off Differentiators"
        description="Objective differences calculated across all compared scenario branches."
      >
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {result.differences.map((difference, idx) => (
            <div
              key={idx}
              className="rounded-xl border border-border/70 bg-[#07101D]/90 p-4 transition-all hover:border-primary/40"
            >
              <div className="flex items-center gap-2 text-xs font-bold text-primary mb-2">
                <Split className="size-3.5" />
                <span>Trade-off Insight #{idx + 1}</span>
              </div>
              <p className="text-xs leading-relaxed text-muted-foreground">{difference}</p>
            </div>
          ))}
        </div>

        {result.note && (
          <div className="mt-4 flex items-center gap-2 rounded-lg border border-border/60 bg-[#0B1422] p-3 text-xs text-muted-foreground">
            <Info className="size-4 text-primary shrink-0" />
            <span>{result.note}</span>
          </div>
        )}
      </SectionPanel>
    </div>
  );
}

