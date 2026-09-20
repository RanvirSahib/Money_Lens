import { createFileRoute } from "@tanstack/react-router";
import { Sparkles } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { Badge, PageHeader, Panel, toneText } from "@/components/dashboard/ui";
import { insightFeed as mockInsightFeed } from "@/lib/dashboard-data";
import { useSpending, useProfile } from "@/hooks/use-money-lens";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/insights")({
  head: () => ({
    meta: [
      { title: "Insights & AI Observations — Money Lens" },
      {
        name: "description",
        content:
          "Plain-language observations about your money, ranked by what they are worth if you act on them.",
      },
      { property: "og:title", content: "Insights — Money Lens" },
      {
        property: "og:description",
        content: "What changed, why it matters and what it is worth — updated every week.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: InsightsPage,
});

const labels: Record<string, string> = {
  positive: "On track",
  info: "Opportunity",
  attention: "Attention",
  risk: "Risk",
};

function InsightsPage() {
  const { data: spending } = useSpending();
  const { data: profile } = useProfile();

  const displayInsights = spending?.observations && spending.observations.length > 0
    ? spending.observations.map((obs) => ({
        title: obs.title,
        body: `${obs.summary} ${obs.implication}`,
        evidence: obs.evidence,
        action: obs.possible_action,
        tone: obs.type === "positive" ? ("positive" as const) : obs.type === "recurring" ? ("info" as const) : ("attention" as const),
        impact: obs.type === "recurring" ? "Fixed Baseline" : "Surplus Driver",
        date: "Current Cycle",
      }))
    : [];

  return (
    <AppShell>
      <PageHeader
        eyebrow="Grounded Financial Intelligence"
        title="Evidence-based observations."
        description="Derived from deterministic calculations across your real cashflow and active parameters without fabricated figures."
      />

      <section className="mt-10 grid gap-4 sm:grid-cols-3">
        {[
          { label: "Active Observations", value: `${displayInsights.length}` },
          { label: "Uncommitted Monthly Surplus", value: `₹${(profile?.monthly_surplus || 0).toLocaleString('en-IN')}` },
          { label: "Runway Buffer", value: `${profile?.emergency_fund_runway_months || 0} months` },
        ].map((stat) => (
          <div key={stat.label} className="panel p-5">
            <p className="text-xs uppercase tracking-wide text-subtle-foreground">{stat.label}</p>
            <p className="numeric mt-3 text-2xl font-semibold">{stat.value}</p>
          </div>
        ))}
      </section>

      <section className="mt-6 space-y-4">
        {displayInsights.map((item) => (
          <article key={item.title} className="panel p-6 space-y-3">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="flex items-start gap-3">
                <span className="mt-0.5 rounded-lg bg-primary-soft p-2 text-primary">
                  <Sparkles className="h-4 w-4" strokeWidth={1.75} />
                </span>
                <div>
                  <h2 className="text-base font-medium">{item.title}</h2>
                  <p className="mt-1.5 max-w-2xl text-sm leading-relaxed text-muted-foreground">
                    {item.body}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Badge tone={item.tone}>{labels[item.tone]}</Badge>
                <span className={cn("numeric text-sm font-medium", toneText[item.tone])}>
                  {item.impact}
                </span>
              </div>
            </div>

            {item.evidence && (
              <div className="p-3 rounded-lg bg-surface-muted border border-border text-xs text-subtle-foreground font-mono">
                <span className="font-semibold text-foreground">Empirical Evidence: </span>
                {item.evidence}
              </div>
            )}

            {item.action && (
              <div className="text-xs text-foreground bg-primary-soft/60 border border-primary/20 p-2.5 rounded-lg leading-relaxed">
                <span className="font-semibold text-primary">Possible Approach: </span>
                {item.action}
              </div>
            )}
          </article>
        ))}
      </section>

      <Panel title="How Money Lens Observations Work" className="mt-6">
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground">
          Money Lens analyzes your reported profile parameters, spending category distributions, and bank statement records. The intelligence layer provides factual, non-judgmental explanations of your financial position and surfaces possible trade-offs.
        </p>
      </Panel>
    </AppShell>
  );
}
