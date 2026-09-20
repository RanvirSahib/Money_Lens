import { SectionPanel, ToneBadge } from "@/components/common/finance-ui";
import { formatINR } from "@/lib/formatters";
import type { ScenarioSummary } from "@/types/finance";

export function ScenarioComparison({ scenarios }: { scenarios: ScenarioSummary[] }) {
  return (
    <SectionPanel title="Scenario Comparison" description="Trade-offs from backend-provided scenario outputs.">
      <div className="grid gap-4 lg:grid-cols-3">
        {scenarios.map((scenario) => (
          <article key={scenario.id} className="rounded-lg border border-border bg-panel p-4 transition-all duration-200 hover:border-primary/50">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="text-base font-semibold text-foreground">{scenario.title}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{scenario.description}</p>
              </div>
              <ToneBadge tone={scenario.tone}>Scenario</ToneBadge>
            </div>
            <dl className="mt-5 space-y-3 text-sm">
              <div className="flex justify-between gap-4">
                <dt className="text-muted-foreground">Projected balance</dt>
                <dd className="font-semibold text-foreground">{formatINR(scenario.projectedBalance)}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-muted-foreground">Lowest projected balance</dt>
                <dd className="font-semibold text-foreground">{formatINR(scenario.lowestProjectedBalance)}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-muted-foreground">Monthly impact</dt>
                <dd className="text-right font-medium text-foreground">{scenario.monthlyImpact}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-muted-foreground">Goal impact</dt>
                <dd className="text-right font-medium text-foreground">{scenario.goalImpact}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-muted-foreground">Timeline</dt>
                <dd className="text-right font-medium text-foreground">{scenario.timeline}</dd>
              </div>
            </dl>
          </article>
        ))}
      </div>
    </SectionPanel>
  );
}
