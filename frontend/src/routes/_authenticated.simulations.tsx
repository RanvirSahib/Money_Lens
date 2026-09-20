import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Radar, Play, ArrowRight, ShieldAlert } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { HealthRadarChart } from "@/components/dashboard/charts";
import { Badge, PageHeader, Panel, toneText } from "@/components/dashboard/ui";
import { healthRadar, scenarios as mockScenarios, currency } from "@/lib/dashboard-data";
import { useProfile } from "@/hooks/use-money-lens";
import { simulatePurchase, simulateEMI } from "@/lib/api-client";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/simulations")({
  head: () => ({
    meta: [
      { title: "Simulations & What-If Sandbox — Money Lens" },
      {
        name: "description",
        content:
          "Model big decisions before you make them: buying a home, cutting hours or raising retirement contributions.",
      },
      { property: "og:title", content: "Simulations — Money Lens" },
      {
        property: "og:description",
        content: "Run what-if scenarios against your last twelve months of real cashflow.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: SimulationsPage,
});

function SimulationsPage() {
  const { data: profile } = useProfile();

  // Sandbox state
  const [purchaseAmount, setPurchaseAmount] = useState(85000);
  const [isSimulating, setIsSimulating] = useState(false);
  const [simulationResult, setSimulationResult] = useState<any>(null);

  const handleRunSimulation = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSimulating(true);
    try {
      const res = await simulatePurchase({
        monthly_income: profile?.monthly_income || 85000,
        monthly_expenses: profile?.total_monthly_expenses || 35000,
        current_savings: profile?.current_savings || 150000,
        purchase_amount: Number(purchaseAmount),
      });
      setSimulationResult(res);
    } catch (err) {
      console.error("Simulation error:", err);
    } finally {
      setIsSimulating(false);
    }
  };

  return (
    <AppShell>
      <PageHeader
        eyebrow="Deterministic What-if Modelling"
        title="Try the decision first."
        description="Every scenario runs against your real cashflow parameters, calculating cashflow delta, savings impact, and emergency runway."
      />

      {/* Interactive Sandbox Panel */}
      <section className="mt-8 panel p-6 border-primary/20 bg-surface-elevated">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-sm font-medium">Simulate a Major Purchase Decision</h2>
            <p className="text-xs text-subtle-foreground mt-0.5">Test cash reserve depletion and post-purchase emergency runway.</p>
          </div>

          <form onSubmit={handleRunSimulation} className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="text-xs text-subtle-foreground">Cost:</span>
              <input
                type="number"
                value={purchaseAmount}
                onChange={(e) => setPurchaseAmount(Number(e.target.value))}
                min={1000}
                className="w-32 rounded-lg border border-border bg-background px-3 py-1.5 text-xs font-medium numeric focus:outline-none focus:border-primary"
              />
            </div>
            <button
              type="submit"
              disabled={isSimulating}
              className="inline-flex items-center gap-1.5 rounded-lg bg-primary text-primary-foreground px-3.5 py-1.5 text-xs font-medium hover:opacity-90 transition-opacity cursor-pointer disabled:opacity-50"
            >
              <Play className="h-3 w-3" />
              <span>{isSimulating ? "Calculating..." : "Run Scenario"}</span>
            </button>
          </form>
        </div>

        {simulationResult && (
          <div className="mt-6 pt-5 border-t border-border grid gap-4 sm:grid-cols-4 animate-in fade-in">
            <div className="p-3.5 rounded-xl bg-surface-muted border border-border">
              <p className="text-[11px] text-subtle-foreground uppercase tracking-wide">Liquidity Impact</p>
              <p className="numeric text-lg font-semibold text-foreground mt-1">
                −{currency(simulationResult.cost || purchaseAmount)}
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-surface-muted border border-border">
              <p className="text-[11px] text-subtle-foreground uppercase tracking-wide">Post-Purchase Savings</p>
              <p className="numeric text-lg font-semibold text-foreground mt-1">
                {currency(simulationResult.post_purchase_savings || ((profile?.current_savings || 150000) - purchaseAmount))}
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-surface-muted border border-border">
              <p className="text-[11px] text-subtle-foreground uppercase tracking-wide">Runway Coverage</p>
              <p className="numeric text-lg font-semibold text-foreground mt-1">
                {simulationResult.post_emergency_fund_months || "3.2"} months
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-surface-muted border border-border">
              <p className="text-[11px] text-subtle-foreground uppercase tracking-wide">Risk Assessment</p>
              <p className="numeric text-sm font-semibold text-positive mt-1">
                {simulationResult.recommendation || "Affordable within buffer"}
              </p>
            </div>
          </div>
        )}
      </section>

      <section className="mt-6 grid gap-4 lg:grid-cols-3">
        <Panel
          title="Financial health"
          subtitle={`Composite score ${profile?.health_score || 76} / 100`}
          className="lg:col-span-1"
        >
          <HealthRadarChart />
        </Panel>

        <Panel title="Score breakdown" subtitle="Where the composite comes from" className="lg:col-span-2">
          <ul className="mt-5 grid gap-x-8 gap-y-4 sm:grid-cols-2">
            {healthRadar.map((row) => (
              <li key={row.axis}>
                <div className="flex items-baseline justify-between text-sm">
                  <span>{row.axis}</span>
                  <span className="numeric text-muted-foreground">{row.score}</span>
                </div>
                <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-surface-muted">
                  <div
                    className={cn(
                      "h-full rounded-full",
                      row.score >= 80 ? "bg-positive" : row.score >= 65 ? "bg-info" : "bg-attention",
                    )}
                    style={{ width: `${row.score}%` }}
                  />
                </div>
              </li>
            ))}
          </ul>
        </Panel>
      </section>

      <section className="mt-6 space-y-4">
        {mockScenarios.map((s) => (
          <div key={s.label} className="panel p-6">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="flex items-start gap-3">
                <span className="mt-0.5 rounded-lg bg-primary-soft p-2 text-primary">
                  <Radar className="h-4 w-4" strokeWidth={1.75} />
                </span>
                <div>
                  <h2 className="text-base font-medium">{s.label}</h2>
                  <p className="mt-1.5 max-w-xl text-sm leading-relaxed text-muted-foreground">
                    {s.summary}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Badge tone={s.tone}>
                  {s.tone === "positive" ? "Improves" : s.tone === "risk" ? "Strains" : "Trade-off"}
                </Badge>
                <span className={cn("numeric text-sm font-medium", toneText[s.tone])}>{s.delta}</span>
              </div>
            </div>

            <div className="mt-6 grid gap-4 border-t border-border pt-5 sm:grid-cols-3">
              {s.effects.map((e) => (
                <div key={e.label}>
                  <p className="text-xs uppercase tracking-wide text-subtle-foreground">{e.label}</p>
                  <p className="numeric mt-1.5 text-sm font-medium">{e.value}</p>
                </div>
              ))}
            </div>
          </div>
        ))}
      </section>
    </AppShell>
  );
}
