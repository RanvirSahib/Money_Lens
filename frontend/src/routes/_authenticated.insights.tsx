import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Sparkles,
  AlertTriangle,
  ShieldCheck,
  ArrowRight,
  Upload,
  SlidersHorizontal,
  TrendingUp,
  Wallet,
  CreditCard,
  PiggyBank,
  CheckCircle2,
  AlertCircle,
  Info,
  Layers,
  Activity,
  FileText,
  Lightbulb,
  ExternalLink,
} from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { Badge, PageHeader, Panel } from "@/components/dashboard/ui";
import { useSpending, useProfile, useRadar } from "@/hooks/use-money-lens";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/insights")({
  head: () => ({
    meta: [
      { title: "Financial Radar & Insights — Monexa" },
      {
        name: "description",
        content:
          "Evidence-based observations about your cash flow, emergency runway, debt leverage, and wealth compounding.",
      },
      { property: "og:title", content: "Financial Radar & Insights — Monexa" },
      {
        property: "og:description",
        content: "Grounded financial intelligence ranked by actionable wealth impact.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: InsightsPage,
});

type FilterCategory = "all" | "risks" | "surplus" | "debt" | "spending";

interface NormalizedInsight {
  id: string;
  title: string;
  summary: string;
  implication?: string;
  evidence?: string;
  action?: string;
  actionLink?: string;
  actionLabel?: string;
  severity: "critical" | "warning" | "info" | "positive";
  categoryType: "liquidity" | "surplus" | "debt" | "wealth" | "subscriptions" | "spending";
  categoryLabel: string;
  badgeText: string;
  badgeTone: "risk" | "attention" | "info" | "positive";
}

function formatINR(val: number): string {
  return `₹${Math.round(val).toLocaleString("en-IN")}`;
}

function InsightsPage() {
  const [selectedFilter, setSelectedFilter] = useState<FilterCategory>("all");
  const { data: profile } = useProfile();
  const { data: radar } = useRadar();
  const { data: spending } = useSpending();

  const monthlyIncome = profile?.monthly_income || 0;
  const monthlyExpenses = profile?.total_expenses || profile?.essential_expenses || 0;
  const currentSavings = profile?.current_savings || 0;
  const monthlySurplus = profile?.monthly_surplus || 0;
  const runwayMonths = profile?.emergency_fund_runway_months || 0;
  const dtiRatio = profile?.debt_to_income_ratio_pct || 0;
  const healthScore = radar?.health_score ?? (profile?.health_score || 75);

  // Target 3-month emergency fund
  const targetEmergencyFund = monthlyExpenses * 3;
  const emergencyShortfall = Math.max(0, targetEmergencyFund - currentSavings);

  // Normalize Radar alerts
  const radarInsights: NormalizedInsight[] = (radar?.alerts || []).map((alert) => {
    let categoryType: NormalizedInsight["categoryType"] = "liquidity";
    let categoryLabel = "Liquidity & Runway";
    let badgeTone: NormalizedInsight["badgeTone"] = "info";
    let badgeText = "Observation";
    let actionLink = "/accounts";
    let actionLabel = "Review in Accounts";

    if (alert.category === "low_balance_risk") {
      categoryType = "liquidity";
      categoryLabel = "Liquidity & Safety Buffer";
      if (alert.severity === "critical") {
        badgeTone = "risk";
        badgeText = "Critical Liquidity Risk";
        actionLink = "/accounts";
        actionLabel = "Fund Emergency Reserve";
      } else if (alert.severity === "warning") {
        badgeTone = "attention";
        badgeText = "Sub-Optimal Buffer";
        actionLink = "/accounts";
        actionLabel = "Top Up Savings";
      } else {
        badgeTone = "positive";
        badgeText = "Resilient Buffer";
        actionLink = "/accounts";
        actionLabel = "View Reserve Details";
      }
    } else if (alert.category === "cash_flow_shortage" || alert.category === "savings_surplus") {
      categoryType = "surplus";
      categoryLabel = "Cash Flow & Surplus";
      if (alert.severity === "critical") {
        badgeTone = "risk";
        badgeText = "Cash Flow Deficit";
        actionLink = "/spending";
        actionLabel = "Audit Outflows";
      } else if (alert.severity === "warning") {
        badgeTone = "attention";
        badgeText = "Narrow Cushion";
        actionLink = "/spending";
        actionLabel = "Optimize Expenses";
      } else {
        badgeTone = "positive";
        badgeText = "High Surplus Capacity";
        actionLink = "/goals";
        actionLabel = "Deploy Monthly Surplus";
      }
    } else if (alert.category === "debt_burden_risk") {
      categoryType = "debt";
      categoryLabel = "Debt & Leverage";
      if (alert.severity === "warning" || alert.severity === "critical") {
        badgeTone = "attention";
        badgeText = "Elevated DTI";
        actionLink = "/simulations";
        actionLabel = "Simulate Debt Prepayment";
      } else {
        badgeTone = "positive";
        badgeText = "Prudent Leverage";
        actionLink = "/simulations";
        actionLabel = "Explore Debt Payoff";
      }
    } else if (alert.category === "wealth_acceleration") {
      categoryType = "wealth";
      categoryLabel = "Wealth & Compounding";
      badgeTone = "positive";
      badgeText = "Active Wealth SIP";
      actionLink = "/simulations";
      actionLabel = "Simulate Wealth Growth";
    } else if (alert.category === "recurring_expense") {
      categoryType = "subscriptions";
      categoryLabel = "Recurring Obligations";
      if (alert.severity === "warning" || alert.severity === "critical") {
        badgeTone = "attention";
        badgeText = "High Fixed Overhead";
        actionLink = "/accounts";
        actionLabel = "Prune Subscriptions";
      } else {
        badgeTone = "info";
        badgeText = "Controlled Commitments";
        actionLink = "/accounts";
        actionLabel = "Manage Subscriptions";
      }
    } else if (alert.category === "high_expense_anomaly") {
      categoryType = "spending";
      categoryLabel = "Spending Anomaly";
      badgeTone = "attention";
      badgeText = "Unusual Outflow";
      actionLink = "/spending";
      actionLabel = "Review Transaction";
    }

    return {
      id: `radar_${alert.id}`,
      title: alert.title,
      summary: alert.message,
      implication: alert.implication || alert.impact,
      evidence: alert.evidence,
      action: alert.possible_action,
      actionLink: alert.action_link || actionLink,
      actionLabel: actionLabel,
      severity: alert.severity === "critical" ? "critical" : alert.severity === "warning" ? "warning" : "info",
      categoryType,
      categoryLabel,
      badgeText,
      badgeTone,
    };
  });

  // Normalize Spending observations
  const spendingInsights: NormalizedInsight[] = (spending?.observations || [])
    .filter((obs) => obs.title !== "Awaiting Bank Statement Ingestion")
    .map((obs) => {
      let badgeTone: NormalizedInsight["badgeTone"] = "info";
      let badgeText = "Spending Pattern";
      let categoryType: NormalizedInsight["categoryType"] = "spending";

      if (obs.type === "recurring") {
        categoryType = "subscriptions";
        badgeText = "Fixed Overhead";
        badgeTone = "info";
      } else if (obs.type === "frequent_small") {
        categoryType = "spending";
        badgeText = "Discretionary Drain";
        badgeTone = "attention";
      } else if (obs.type === "positive") {
        badgeText = "Healthy Trend";
        badgeTone = "positive";
      }

      return {
        id: `spend_${obs.title}`,
        title: obs.title,
        summary: obs.summary,
        implication: obs.implication,
        evidence: obs.evidence,
        action: obs.possible_action,
        actionLink: "/spending",
        actionLabel: "Analyze in Spending",
        severity: obs.type === "frequent_small" ? "warning" : "info",
        categoryType,
        categoryLabel: obs.type === "recurring" ? "Subscription Audit" : "Statement Analysis",
        badgeText,
        badgeTone,
      };
    });

  const allInsights = [...radarInsights, ...spendingInsights];

  // Filtering
  const filteredInsights = allInsights.filter((item) => {
    if (selectedFilter === "all") return true;
    if (selectedFilter === "risks") return item.severity === "critical" || item.severity === "warning";
    if (selectedFilter === "surplus") return item.categoryType === "surplus" || item.categoryType === "wealth";
    if (selectedFilter === "debt") return item.categoryType === "debt" || item.categoryType === "subscriptions";
    if (selectedFilter === "spending") return item.categoryType === "spending";
    return true;
  });

  // Counts for tabs
  const riskCount = allInsights.filter((i) => i.severity === "critical" || i.severity === "warning").length;
  const surplusCount = allInsights.filter((i) => i.categoryType === "surplus" || i.categoryType === "wealth").length;
  const debtCount = allInsights.filter((i) => i.categoryType === "debt" || i.categoryType === "subscriptions").length;
  const spendingCount = allInsights.filter((i) => i.categoryType === "spending").length;

  return (
    <AppShell>
      <PageHeader
        eyebrow="Financial Intelligence & Radar"
        title="Evidence-based financial observations."
        description="Grounded in deterministic calculations across your live cash flow, active EMIs, and liquid reserves."
      />

      {/* Top Level Summary Cards */}
      <section className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Health Score */}
        <div className="panel p-5 relative overflow-hidden flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <p className="text-xs uppercase tracking-wider font-medium text-subtle-foreground">
              Financial Health Score
            </p>
            <span
              className={cn(
                "text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full",
                healthScore >= 80
                  ? "bg-positive-soft text-positive border border-positive/30"
                  : healthScore >= 60
                  ? "bg-primary-soft text-primary border border-primary/30"
                  : "bg-risk-soft text-risk border border-risk/30"
              )}
            >
              {healthScore >= 80 ? "Excellent" : healthScore >= 60 ? "Healthy" : "Vulnerable"}
            </span>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-bold tracking-tight">{healthScore}</span>
            <span className="text-sm text-subtle-foreground font-medium">/ 100</span>
          </div>
          <div className="mt-3 w-full bg-surface-muted rounded-full h-1.5 overflow-hidden">
            <div
              className={cn(
                "h-full rounded-full transition-all duration-500",
                healthScore >= 80 ? "bg-positive" : healthScore >= 60 ? "bg-primary" : "bg-risk"
              )}
              style={{ width: `${Math.min(100, Math.max(5, healthScore))}%` }}
            />
          </div>
        </div>

        {/* Monthly Surplus */}
        <div className="panel p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <p className="text-xs uppercase tracking-wider font-medium text-subtle-foreground">
              Uncommitted Monthly Surplus
            </p>
            <PiggyBank className="h-4 w-4 text-positive" />
          </div>
          <div className="mt-4">
            <p className="text-2xl font-bold tracking-tight text-foreground">
              {formatINR(monthlySurplus)}
            </p>
            <p className="text-xs text-subtle-foreground mt-1">
              {monthlyIncome > 0
                ? `${Math.round((monthlySurplus / monthlyIncome) * 100)}% of monthly income`
                : "Active monthly free cash"}
            </p>
          </div>
        </div>

        {/* Emergency Runway */}
        <div className="panel p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <p className="text-xs uppercase tracking-wider font-medium text-subtle-foreground">
              Emergency Runway Buffer
            </p>
            {runwayMonths < 1.0 ? (
              <AlertTriangle className="h-4 w-4 text-risk animate-pulse" />
            ) : (
              <ShieldCheck className="h-4 w-4 text-primary" />
            )}
          </div>
          <div className="mt-4">
            <div className="flex items-baseline gap-2">
              <span
                className={cn(
                  "text-2xl font-bold tracking-tight",
                  runwayMonths < 1.0 ? "text-risk" : runwayMonths < 3.0 ? "text-amber-500" : "text-foreground"
                )}
              >
                {runwayMonths}
              </span>
              <span className="text-sm text-subtle-foreground">Months</span>
            </div>
            <p className="text-xs text-subtle-foreground mt-1">
              Liquid: {formatINR(currentSavings)} (Target: {formatINR(targetEmergencyFund)})
            </p>
          </div>
        </div>

        {/* Debt to Income */}
        <div className="panel p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <p className="text-xs uppercase tracking-wider font-medium text-subtle-foreground">
              Debt-to-Income (DTI)
            </p>
            <CreditCard className="h-4 w-4 text-primary" />
          </div>
          <div className="mt-4">
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold tracking-tight text-foreground">
                {dtiRatio.toFixed(1)}%
              </span>
              <span className="text-xs text-subtle-foreground">
                {dtiRatio <= 30 ? "(Prudent)" : dtiRatio <= 40 ? "(Moderate)" : "(High)"}
              </span>
            </div>
            <p className="text-xs text-subtle-foreground mt-1">
              Active EMIs: {formatINR(profile?.active_emis || 0)}/mo
            </p>
          </div>
        </div>
      </section>

      {/* Strategic Executive Health Briefing */}
      <section className="mt-6 rounded-2xl border border-border bg-gradient-to-br from-surface to-surface-muted/60 p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
          <h2 className="text-sm font-semibold tracking-wide uppercase text-subtle-foreground">
            Executive Financial Briefing
          </h2>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {/* Key Superpower */}
          <div className="p-4 rounded-xl bg-surface-elevated border border-border/80 space-y-2">
            <div className="flex items-center gap-2 text-positive">
              <TrendingUp className="h-4 w-4" />
              <span className="text-xs font-semibold uppercase tracking-wider">Primary Financial Strength</span>
            </div>
            <p className="text-sm text-foreground font-medium">
              High Cash Generation Capacity
            </p>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Your monthly income of {formatINR(monthlyIncome)} generates a net cash surplus of{" "}
              <strong className="text-foreground">{formatINR(monthlySurplus)}</strong> after accounting for essential living costs and debt obligations.
            </p>
          </div>

          {/* Core Vulnerability */}
          <div className="p-4 rounded-xl bg-surface-elevated border border-border/80 space-y-2">
            <div className="flex items-center gap-2 text-risk">
              <AlertTriangle className="h-4 w-4" />
              <span className="text-xs font-semibold uppercase tracking-wider">Primary Vulnerability</span>
            </div>
            <p className="text-sm text-foreground font-medium">
              Low Liquid Safety Buffer ({runwayMonths} Months)
            </p>
            <p className="text-xs text-muted-foreground leading-relaxed">
              With liquid cash of {formatINR(currentSavings)}, you have approximately ~{Math.round(runwayMonths * 30)} days of runway. An unexpected disruption could immediately stress cashflow.
            </p>
          </div>

          {/* Recommended 30-Day Move */}
          <div className="p-4 rounded-xl bg-primary-soft/40 border border-primary/20 space-y-2 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 text-primary">
                <Lightbulb className="h-4 w-4" />
                <span className="text-xs font-semibold uppercase tracking-wider">Recommended 30-Day Move</span>
              </div>
              <p className="text-sm text-foreground font-medium mt-2">
                Build 3-Month Safety Reserve
              </p>
              <p className="text-xs text-muted-foreground leading-relaxed mt-1">
                Channel {formatINR(emergencyShortfall > 0 ? emergencyShortfall : monthlySurplus * 0.5)} from your surplus to secure a full 3-month safety fund in under 30 days.
              </p>
            </div>
            <Link
              to="/accounts"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline pt-2"
            >
              <span>Manage liquid cash in Accounts</span>
              <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
        </div>
      </section>

      {/* Interactive Thematic Tabs */}
      <section className="mt-8">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border pb-4">
          <div className="flex flex-wrap items-center gap-2">
            {[
              { id: "all" as const, label: "All Observations", count: allInsights.length },
              { id: "risks" as const, label: "Risks & Alerts", count: riskCount },
              { id: "surplus" as const, label: "Surplus & Wealth", count: surplusCount },
              { id: "debt" as const, label: "Debt & Commitments", count: debtCount },
              { id: "spending" as const, label: "Spending Intelligence", count: spendingCount },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setSelectedFilter(tab.id)}
                className={cn(
                  "inline-flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-semibold transition-all",
                  selectedFilter === tab.id
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "bg-surface-elevated text-subtle-foreground hover:bg-secondary hover:text-foreground border border-border"
                )}
              >
                <span>{tab.label}</span>
                <span
                  className={cn(
                    "px-1.5 py-0.5 rounded-md text-[10px] font-bold",
                    selectedFilter === tab.id
                      ? "bg-primary-foreground/20 text-primary-foreground"
                      : "bg-surface-muted text-subtle-foreground"
                  )}
                >
                  {tab.count}
                </span>
              </button>
            ))}
          </div>

          <p className="text-xs text-subtle-foreground">
            Showing <strong className="text-foreground">{filteredInsights.length}</strong> verified signals
          </p>
        </div>

        {/* Insight Cards Stream */}
        <div className="mt-6 space-y-4">
          {filteredInsights.length > 0 ? (
            filteredInsights.map((item) => (
              <article
                key={item.id}
                className={cn(
                  "panel p-6 space-y-4 transition-all duration-200 hover:border-primary/40",
                  item.severity === "critical" && "border-risk/40 bg-risk-soft/10"
                )}
              >
                {/* Header Row */}
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <span
                      className={cn(
                        "mt-0.5 rounded-xl p-2.5 flex items-center justify-center shrink-0",
                        item.badgeTone === "risk"
                          ? "bg-risk-soft text-risk border border-risk/30"
                          : item.badgeTone === "attention"
                          ? "bg-amber-500/10 text-amber-500 border border-amber-500/30"
                          : item.badgeTone === "positive"
                          ? "bg-positive-soft text-positive border border-positive/30"
                          : "bg-primary-soft text-primary border border-primary/30"
                      )}
                    >
                      {item.badgeTone === "risk" ? (
                        <AlertTriangle className="h-5 w-5" strokeWidth={2} />
                      ) : item.badgeTone === "attention" ? (
                        <AlertCircle className="h-5 w-5" strokeWidth={2} />
                      ) : item.badgeTone === "positive" ? (
                        <TrendingUp className="h-5 w-5" strokeWidth={2} />
                      ) : (
                        <Sparkles className="h-5 w-5" strokeWidth={2} />
                      )}
                    </span>

                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-md bg-surface-muted text-subtle-foreground border border-border">
                          {item.categoryLabel}
                        </span>
                        <h3 className="text-base font-semibold text-foreground tracking-tight">
                          {item.title}
                        </h3>
                      </div>
                      <p className="mt-2 text-sm leading-relaxed text-foreground/90 max-w-3xl">
                        {item.summary}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-start">
                    <Badge tone={item.badgeTone}>{item.badgeText}</Badge>
                  </div>
                </div>

                {/* Empirical Evidence Grid */}
                {item.evidence && (
                  <div className="rounded-xl bg-surface-muted/90 border border-border p-3.5 text-xs text-foreground/90 flex items-start gap-2.5">
                    <Activity className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                    <div>
                      <span className="font-semibold text-foreground mr-1.5">Grounded Financial Evidence:</span>
                      <span className="text-subtle-foreground font-medium">{item.evidence}</span>
                    </div>
                  </div>
                )}

                {/* Why This Matters & Action Grid */}
                <div className="grid gap-3 pt-1 sm:grid-cols-2">
                  {item.implication && (
                    <div className="rounded-xl border border-border bg-surface-elevated/60 p-3.5 space-y-1">
                      <div className="flex items-center gap-1.5 text-xs font-semibold text-subtle-foreground">
                        <Info className="h-3.5 w-3.5 text-primary" />
                        <span>Why This Matters</span>
                      </div>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        {item.implication}
                      </p>
                    </div>
                  )}

                  {item.action && (
                    <div className="rounded-xl border border-primary/20 bg-primary-soft/30 p-3.5 flex flex-col justify-between space-y-2">
                      <div className="space-y-1">
                        <div className="flex items-center gap-1.5 text-xs font-semibold text-primary">
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          <span>Recommended Action</span>
                        </div>
                        <p className="text-xs text-foreground/90 leading-relaxed font-medium">
                          {item.action}
                        </p>
                      </div>

                      {item.actionLink && (
                        <Link
                          to={item.actionLink}
                          className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline self-start pt-1"
                        >
                          <span>{item.actionLabel || "Take Action"}</span>
                          <ArrowRight className="h-3 w-3" />
                        </Link>
                      )}
                    </div>
                  )}
                </div>
              </article>
            ))
          ) : (
            <div className="panel p-10 text-center space-y-4">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-primary-soft text-primary">
                <ShieldCheck className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-foreground">No Items in This Category</h3>
                <p className="text-xs text-muted-foreground mt-1 max-w-md mx-auto">
                  No alerts or observations match the selected filter. Your reported metrics in this domain are healthy.
                </p>
              </div>
              <button
                onClick={() => setSelectedFilter("all")}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline"
              >
                <span>View All Observations</span>
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Statement Ingestion CTA Banner */}
      <section className="mt-8 rounded-2xl border border-border bg-surface-elevated p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-sm">
        <div className="flex items-start gap-4">
          <div className="h-12 w-12 rounded-2xl bg-primary-soft flex items-center justify-center text-primary shrink-0">
            <FileText className="h-6 w-6" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-foreground">
              Unlock Granular Statement Analytics
            </h3>
            <p className="text-xs text-muted-foreground mt-1 max-w-xl leading-relaxed">
              Upload your official bank statement (PDF or CSV) to enrich your financial radar with exact merchant categorizations, weekend vs weekday spending ratios, and automated subscription detection.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0 w-full md:w-auto">
          <Link
            to="/spending"
            className="w-full md:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-primary text-primary-foreground px-4 py-2.5 text-xs font-semibold hover:opacity-90 transition-opacity"
          >
            <Upload className="h-3.5 w-3.5" />
            <span>Upload Bank Statement</span>
          </Link>
          <Link
            to="/accounts"
            className="w-full md:w-auto inline-flex items-center justify-center gap-2 rounded-xl border border-border bg-surface-muted px-4 py-2.5 text-xs font-semibold hover:bg-secondary transition-colors"
          >
            <SlidersHorizontal className="h-3.5 w-3.5" />
            <span>Calibrate Accounts</span>
          </Link>
        </div>
      </section>

      {/* Methodology Section */}
      <Panel title="How Monexa Financial Intelligence Works" className="mt-8">
        <div className="mt-3 grid gap-4 text-xs text-muted-foreground leading-relaxed sm:grid-cols-3">
          <div className="space-y-1">
            <p className="font-semibold text-foreground">1. Zero Hallucination Engine</p>
            <p>Every observation is computed deterministically from verified balance sheet figures, active loans, and cash flow formulas without fabricated numbers.</p>
          </div>
          <div className="space-y-1">
            <p className="font-semibold text-foreground">2. Proactive Anomaly Radar</p>
            <p>Continuous rule evaluations monitor emergency runway thresholds, debt servicing limits, and fixed overhead burn rates before cash crunches occur.</p>
          </div>
          <div className="space-y-1">
            <p className="font-semibold text-foreground">3. Action-Centric Prioritization</p>
            <p>Observations highlight concrete trade-offs and link directly into simulation and account tools so you can execute corrective steps immediately.</p>
          </div>
        </div>
      </Panel>
    </AppShell>
  );
}
