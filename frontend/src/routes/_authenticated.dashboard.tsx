import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowUpRight,
  ArrowDownRight,
  Sparkles,
  Upload,
  FileText,
  AlertTriangle,
  CheckCircle2,
  ShieldAlert,
  ArrowRight,
  Activity,
  CreditCard,
  TrendingUp,
  Tv,
  Wallet,
  Landmark,
  Coins,
  PiggyBank,
  LineChart,
  PieChart,
  Plus,
  Layers,
} from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { CashflowChart, HealthRadarChart, NetWorthChart, FinancialBreakdownPieChart } from "@/components/dashboard/charts";
import { currency } from "@/lib/dashboard-data";
import {
  useProfile,
  useSpending,
  useGoals,
  useStatementTransactions,
  useRadar,
  useEMIs,
  useSubscriptions,
  useInvestments,
} from "@/hooks/use-money-lens";
import { getCurrentUser } from "@/lib/api-client";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({
    meta: [
      { title: "Financial Command Dashboard — Monexa" },
      {
        name: "description",
        content:
          "Monexa shows your net worth, real spending, goals and financial health in one calm, premium overview.",
      },
      { property: "og:title", content: "Dashboard — Monexa" },
      {
        property: "og:description",
        content:
          "Understand your finances, analyse spending and simulate decisions with AI-powered insights.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Dashboard,
});


const toneBg: Record<string, string> = {
  positive: "bg-positive-soft text-positive",
  info: "bg-info-soft text-info",
  attention: "bg-attention-soft text-attention",
  risk: "bg-risk-soft text-risk",
  critical: "bg-risk-soft text-risk",
  high: "bg-risk-soft text-risk",
  medium: "bg-attention-soft text-attention",
  low: "bg-info-soft text-info",
};

const toneBar: Record<string, string> = {
  positive: "bg-positive",
  info: "bg-info",
  attention: "bg-attention",
  risk: "bg-risk",
};

function Dashboard() {
  const { data: profile } = useProfile();
  const { data: spendingData } = useSpending();
  const { data: liveGoals = [] } = useGoals();
  const { data: liveTransactions = [] } = useStatementTransactions();
  const { data: radarData } = useRadar();
  const { data: emisList = [] } = useEMIs();
  const { data: subsList = [] } = useSubscriptions();
  const { data: invList = [] } = useInvestments();

  const localUser = getCurrentUser();
  const userName = (profile?.name && profile.name !== "User") ? profile.name : (localUser?.name || "User");
  const monthlyIncome = profile?.monthly_income || 0;
  const currentSavings = profile?.current_savings || 0;
  const activeLoans = profile?.active_loans || 0;
  const activeEmis = profile?.active_emis || 0;
  const totalMonthlyExpenses = profile?.total_monthly_expenses || 0;
  const monthlySurplus = profile?.monthly_surplus || 0;
  const runway = profile?.emergency_fund_runway_months || 0;
  const healthScore = profile?.health_score || radarData?.health_score || 50;

  // Active EMIs metrics
  const totalOutstandingDebt = emisList.length > 0
    ? emisList.reduce((acc, curr) => acc + (curr.principal_amount || 0), 0)
    : activeLoans;
  const totalEMIBurden = emisList.length > 0
    ? emisList.reduce((acc, curr) => acc + (curr.monthly_emi || 0), 0)
    : activeEmis;
  const weightedInterestRate =
    totalOutstandingDebt > 0 && emisList.length > 0
      ? (
          emisList.reduce((acc, curr) => acc + (curr.interest_rate_pct || 0) * (curr.principal_amount || 0), 0) /
          totalOutstandingDebt
        ).toFixed(1)
      : "0.0";

  // Subscriptions metrics
  const activeSubs = subsList.filter((s) => s.status?.toLowerCase() !== "cancelled");
  const totalMonthlySubs = activeSubs.reduce((acc, curr) => acc + (curr.monthly_equivalent || 0), 0);
  const totalAnnualSubs = activeSubs.reduce((acc, curr) => acc + (curr.annual_cost || 0), 0);

  // Investments metrics
  const activeInvestments = invList.filter((i) => i.status?.toLowerCase() !== "completed");
  const totalMonthlyInvestments = activeInvestments.length > 0
    ? activeInvestments.reduce((acc, curr) => acc + (curr.monthly_amount || 0), 0)
    : (profile?.monthly_investments || 0);
  const totalInvestedAssets = totalMonthlyInvestments * 12;
  const weightedExpectedReturn =
    totalMonthlyInvestments > 0 && activeInvestments.length > 0
      ? (
          activeInvestments.reduce((acc, curr) => acc + (curr.expected_return_pct || 0) * (curr.monthly_amount || 0), 0) /
          totalMonthlyInvestments
        ).toFixed(1)
      : "0.0";

  // Deterministic Balance Sheet Calculations
  const totalAssets = currentSavings + totalInvestedAssets;
  const netWorthValue = totalAssets - totalOutstandingDebt;
  const cashOnHandValue = currentSavings;
  const monthlySpendValue = spendingData?.total_spending || totalMonthlyExpenses;
  const savingsRateValue = `${profile?.savings_rate_pct || 0}%`;

  const isProfileConfigured = monthlyIncome > 0 || currentSavings > 0;

  // Real spending categories
  const spendCategories = spendingData?.categories && spendingData.categories.length > 0
    ? spendingData.categories.filter((c) => c.total_amount > 0).map((c, i) => ({
        category: c.category,
        amount: c.total_amount,
        tone: `chart-${(i % 5) + 1}`,
      }))
    : [
        ...(profile?.essential_expenses ? [{ category: "Essential Living", amount: profile.essential_expenses, tone: "chart-1" }] : []),
        ...(profile?.discretionary_expenses ? [{ category: "Discretionary Spending", amount: profile.discretionary_expenses, tone: "chart-2" }] : []),
        ...(totalEMIBurden > 0 ? [{ category: "EMIs & Debt", amount: totalEMIBurden, tone: "chart-3" }] : []),
        ...(totalMonthlySubs > 0 ? [{ category: "Recurring Subscriptions", amount: totalMonthlySubs, tone: "chart-4" }] : []),
      ];

  const spendTotal = spendCategories.reduce((sum, s) => sum + s.amount, 0);

  // Health radar chart coordinates
  const healthRadarData = [
    { axis: "Savings Rate", score: Math.min(100, Math.round((profile?.savings_rate_pct || 0) * 3.5)) || 40 },
    { axis: "Spending Control", score: monthlyIncome > 0 ? Math.min(100, Math.max(20, Math.round((1 - spendTotal / monthlyIncome) * 100))) : 50 },
    { axis: "Debt Safety", score: totalEMIBurden === 0 ? 95 : Math.max(30, 100 - (profile?.dti_ratio_pct || 0) * 2) },
    { axis: "Liquidity Buffer", score: Math.min(100, Math.round(runway * 16)) || 35 },
    { axis: "Wealth Growth", score: totalMonthlyInvestments > 0 ? 80 : 35 },
  ];

  const radarSignals = radarData?.signals || [];

  return (
    <AppShell>
      {/* Header Banner */}
      <section className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <p className="text-xs font-semibold tracking-wider uppercase text-subtle-foreground flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-positive inline-block animate-pulse" />
            Financial Intelligence Platform
          </p>
          <h1 className="mt-2 font-display text-3xl sm:text-4xl text-foreground font-semibold">
            Good day, {userName}.
          </h1>
          <p className="mt-1 text-xs text-muted-foreground">
            {isProfileConfigured
              ? `Your deterministic monthly surplus is ${currency(monthlySurplus)}, runway covers ${runway} months, and baseline health score is ${healthScore}/100.`
              : "Complete your financial baseline profile to unlock deterministic surplus projections, runway tracking, and AI radar."}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            to="/accounts"
            className="inline-flex items-center gap-2 rounded-lg bg-surface border border-border px-3.5 py-2 text-xs font-semibold text-foreground hover:bg-surface-muted transition-colors self-start sm:self-auto"
          >
            <Wallet className="h-3.5 w-3.5 text-primary" />
            <span>Manage Accounts</span>
          </Link>
          {!isProfileConfigured && (
            <Link
              to="/accounts"
              className="inline-flex items-center gap-2 rounded-lg bg-primary text-primary-foreground px-4 py-2 text-xs font-semibold hover:opacity-90 transition-opacity self-start sm:self-auto"
            >
              <span>Calibrate Profile</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          )}
        </div>
      </section>

      {/* Primary KPI Metrics */}
      <section className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          {
            label: "Net Worth",
            value: currency(netWorthValue),
            sub: `Assets (${currency(totalAssets)}) − Debt (${currency(totalOutstandingDebt)})`,
            tone: netWorthValue < 0 ? "text-risk" : "text-foreground",
            stagger: "stagger-1",
          },
          {
            label: "Monthly Surplus",
            value: currency(monthlySurplus),
            sub: `Income (${currency(monthlyIncome)}) − Outflows (${currency(totalMonthlyExpenses)})`,
            tone: "text-positive",
            stagger: "stagger-2",
          },
          {
            label: "Liquid Cash",
            value: currency(cashOnHandValue),
            sub: `${runway} mo emergency runway`,
            tone: "text-foreground",
            stagger: "stagger-3",
          },
          {
            label: "Debt-to-Income (DTI)",
            value: `${profile?.dti_ratio_pct || 0}%`,
            sub: emisList.length > 0 ? `${emisList.length} active loan${emisList.length === 1 ? '' : 's'} (${currency(totalEMIBurden)}/mo)` : "No active loans",
            tone: (profile?.dti_ratio_pct || 0) > 35 ? "text-risk" : "text-foreground",
            stagger: "stagger-4",
          },
        ].map((stat) => (
          <div
            key={stat.label}
            className={cn(
              "panel-interactive p-5 animate-fade-in-up transition-all duration-300 group cursor-default",
              stat.stagger
            )}
          >
            <p className="text-xs uppercase tracking-wider font-semibold text-subtle-foreground transition-colors group-hover:text-primary">
              {stat.label}
            </p>
            <p className={cn("numeric mt-2.5 text-2xl sm:text-3xl font-extrabold tracking-tight transition-transform duration-200 group-hover:scale-[1.02]", stat.tone)}>
              {stat.value}
            </p>
            <p className="mt-1 text-xs text-muted-foreground leading-relaxed">{stat.sub}</p>
          </div>
        ))}
      </section>

      {/* Accounts & Balance Sheet Snapshot */}
      <section className="mt-6 panel p-6 animate-fade-in-up stagger-2 transition-all duration-300 hover:border-primary/30">
        <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2 border-b border-border pb-4">
          <div>
            <div className="flex items-center gap-2">
              <Wallet className="h-4 w-4 text-primary" />
              <h2 className="text-base sm:text-lg font-bold tracking-tight text-foreground">Accounts & Balance Sheet Portfolio</h2>
            </div>
            <p className="mt-1 text-xs sm:text-sm text-subtle-foreground">
              Live loans, recurring investments, and subscription commitments configured in your financial baseline
            </p>
          </div>
          <Link
            to="/accounts"
            className="text-xs sm:text-sm text-primary font-bold hover:underline inline-flex items-center gap-1 transition-transform duration-200 hover:translate-x-0.5"
          >
            <span>View Full Balance Sheet</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="mt-5 grid gap-4 lg:grid-cols-3">
          {/* Active EMIs Card */}
          <div className="rounded-xl border border-border bg-surface-muted/30 p-4.5 flex flex-col justify-between transition-all duration-200 hover:bg-surface-muted/60 hover:border-border-strong">
            <div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CreditCard className="h-4 w-4 text-risk" />
                  <h3 className="text-sm font-bold text-foreground">Active EMIs & Loans</h3>
                </div>
                <span className="text-xs font-mono text-muted-foreground">
                  {emisList.length} active
                </span>
              </div>

              <div className="mt-3 flex items-baseline justify-between">
                <div>
                  <p className="text-[11px] uppercase tracking-wider text-subtle-foreground font-semibold">Total Monthly EMI</p>
                  <p className="text-xl font-extrabold text-foreground numeric mt-0.5">{currency(totalEMIBurden)}/mo</p>
                </div>
                <div className="text-right">
                  <p className="text-[11px] uppercase tracking-wider text-subtle-foreground font-semibold">Outstanding Debt</p>
                  <p className="text-sm font-bold text-risk numeric mt-0.5">{currency(totalOutstandingDebt)}</p>
                </div>
              </div>

              {emisList.length > 0 ? (
                <ul className="mt-3 space-y-2 divide-y divide-border/60">
                  {emisList.slice(0, 3).map((emi) => (
                    <li key={emi.id} className="pt-2 flex items-center justify-between text-xs">
                      <div>
                        <p className="font-semibold text-foreground">{emi.name}</p>
                        <p className="text-[10px] text-subtle-foreground">{emi.category} &bull; {emi.interest_rate_pct}% p.a.</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-foreground numeric">{currency(emi.monthly_emi)}/mo</p>
                        <p className="text-[10px] text-muted-foreground">{emi.remaining_months || emi.tenure_months} mos left</p>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="mt-4 py-4 text-center border border-dashed border-border rounded-lg">
                  <p className="text-[11px] text-muted-foreground">No active EMIs recorded.</p>
                </div>
              )}
            </div>

            <Link
              to="/accounts"
              className="mt-4 pt-3 border-t border-border/80 text-[11px] font-medium text-primary hover:underline inline-flex items-center gap-1"
            >
              <Plus className="h-3 w-3" />
              <span>Add or Manage Ongoing EMIs</span>
            </Link>
          </div>

          {/* Monthly Investment SIPs Card */}
          <div className="rounded-xl border border-border bg-surface-muted/30 p-4 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-positive" />
                  <h3 className="text-xs font-semibold text-foreground">Monthly Investment SIPs</h3>
                </div>
                <span className="text-[11px] font-mono text-muted-foreground">
                  {activeInvestments.length} SIP{activeInvestments.length === 1 ? '' : 's'}
                </span>
              </div>

              <div className="mt-3 flex items-baseline justify-between">
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-subtle-foreground">Monthly Contribution</p>
                  <p className="text-lg font-bold text-positive numeric mt-0.5">{currency(totalMonthlyInvestments)}/mo</p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] uppercase tracking-wider text-subtle-foreground">Annual Additions</p>
                  <p className="text-xs font-semibold text-foreground numeric mt-0.5">{currency(totalInvestedAssets)}/yr</p>
                </div>
              </div>

              {activeInvestments.length > 0 ? (
                <ul className="mt-3 space-y-2 divide-y divide-border/60">
                  {activeInvestments.slice(0, 3).map((inv) => (
                    <li key={inv.id} className="pt-2 flex items-center justify-between text-xs">
                      <div>
                        <p className="font-semibold text-foreground">{inv.name}</p>
                        <p className="text-[10px] text-subtle-foreground">{inv.asset_class || inv.category} &bull; {inv.expected_return_pct}% p.a.</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-positive numeric">+{currency(inv.monthly_amount)}/mo</p>
                        <p className="text-[10px] text-muted-foreground">{inv.sip_date ? `Day ${inv.sip_date}` : 'Active'}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="mt-4 py-4 text-center border border-dashed border-border rounded-lg">
                  <p className="text-[11px] text-muted-foreground">No monthly SIPs configured.</p>
                </div>
              )}
            </div>

            <Link
              to="/accounts"
              className="mt-4 pt-3 border-t border-border/80 text-[11px] font-medium text-primary hover:underline inline-flex items-center gap-1"
            >
              <Plus className="h-3 w-3" />
              <span>Add or Manage Monthly SIPs</span>
            </Link>
          </div>

          {/* Recurring Subscriptions Card */}
          <div className="rounded-xl border border-border bg-surface-muted/30 p-4 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Tv className="h-4 w-4 text-info" />
                  <h3 className="text-xs font-semibold text-foreground">Recurring Subscriptions</h3>
                </div>
                <span className="text-[11px] font-mono text-muted-foreground">
                  {activeSubs.length} active
                </span>
              </div>

              <div className="mt-3 flex items-baseline justify-between">
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-subtle-foreground">Monthly Outflow</p>
                  <p className="text-lg font-bold text-foreground numeric mt-0.5">{currency(totalMonthlySubs)}/mo</p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] uppercase tracking-wider text-subtle-foreground">Annual Outflow</p>
                  <p className="text-xs font-semibold text-muted-foreground numeric mt-0.5">{currency(totalAnnualSubs)}/yr</p>
                </div>
              </div>

              {activeSubs.length > 0 ? (
                <ul className="mt-3 space-y-2 divide-y divide-border/60">
                  {activeSubs.slice(0, 3).map((sub) => (
                    <li key={sub.id} className="pt-2 flex items-center justify-between text-xs">
                      <div>
                        <p className="font-semibold text-foreground">{sub.name}</p>
                        <p className="text-[10px] text-subtle-foreground">{sub.category} &bull; {sub.billing_frequency}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-foreground numeric">{currency(sub.monthly_equivalent)}/mo</p>
                        <p className="text-[10px] text-muted-foreground">{sub.auto_renew ? 'Auto-renews' : 'Manual'}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="mt-4 py-4 text-center border border-dashed border-border rounded-lg">
                  <p className="text-[11px] text-muted-foreground">No recurring subscriptions added.</p>
                </div>
              )}
            </div>

            <Link
              to="/accounts"
              className="mt-4 pt-3 border-t border-border/80 text-[11px] font-medium text-primary hover:underline inline-flex items-center gap-1"
            >
              <Plus className="h-3 w-3" />
              <span>Add or Manage Subscriptions</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Net Worth & Health Radar Charts */}
      <section className="mt-6 grid gap-4 lg:grid-cols-3">
        <div className="panel p-6 lg:col-span-2">
          <div className="flex items-baseline justify-between">
            <div>
              <h2 className="text-sm font-semibold">Net Worth Trajectory (12-Month Outlook)</h2>
              <p className="mt-1 text-xs text-subtle-foreground">
                Projected trajectory factoring monthly surplus (+{currency(monthlySurplus)}/mo), SIP growth, and loan paydown
              </p>
            </div>
            <p className={cn("numeric text-lg font-semibold", netWorthValue < 0 ? "text-risk" : "text-foreground")}>
              {currency(netWorthValue)}
            </p>
          </div>
          <div className="mt-6">
            <NetWorthChart
              currentValue={netWorthValue}
              monthlySurplus={monthlySurplus}
              monthlyInvestments={totalMonthlyInvestments}
              totalDebt={totalOutstandingDebt}
            />
          </div>
        </div>

        <div className="panel p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-foreground">Financial Radar Health</h2>
              <span className="text-xs font-bold px-2.5 py-1 rounded-md bg-primary/10 text-primary border border-primary/20">
                {healthScore} / 100
              </span>
            </div>
            <p className="mt-1 text-xs sm:text-sm text-subtle-foreground">Multidimensional financial resilience index</p>
          </div>
          <div className="my-2">
            <HealthRadarChart data={healthRadarData} />
          </div>
        </div>
      </section>

      {/* Financial Allocation & Outflows Breakdown (Pie Chart with In-Depth Explanation) */}
      <section className="mt-6 panel p-6 animate-fade-in-up stagger-3 scroll-reveal">
        <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2 border-b border-border pb-4">
          <div>
            <div className="flex items-center gap-2">
              <PieChart className="h-4 w-4 text-primary" />
              <h2 className="text-base sm:text-lg font-bold tracking-tight text-foreground">
                Income Allocation & Obligation Breakdown
              </h2>
            </div>
            <p className="mt-1 text-xs sm:text-sm text-subtle-foreground">
              Comprehensive distribution of your monthly earnings across living expenses, active debt, subscriptions, wealth creation SIPs, and free surplus
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs sm:text-sm font-medium text-subtle-foreground">Monthly Inflow:</span>
            <span className="text-sm sm:text-base font-bold text-foreground numeric bg-surface-muted px-3 py-1 rounded-md border border-border">
              {currency(monthlyIncome)}
            </span>
          </div>
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-12 items-center">
          {/* Left Column: Interactive Donut / Pie Chart */}
          <div className="lg:col-span-5 flex flex-col items-center justify-center p-5 rounded-2xl bg-surface-muted/30 border border-border/70 w-full min-w-0">
            <FinancialBreakdownPieChart
              monthlyIncome={monthlyIncome}
              essentialExpenses={profile?.essential_expenses || 0}
              discretionaryExpenses={profile?.discretionary_expenses || 0}
              monthlyEMIs={totalEMIBurden}
              monthlySubscriptions={totalMonthlySubs}
              monthlyInvestments={totalMonthlyInvestments}
              monthlySurplus={monthlySurplus}
            />
            <p className="text-xs sm:text-sm text-muted-foreground text-center mt-2.5">
              Hover over slices to inspect individual allocation shares & monthly values
            </p>
          </div>

          {/* Right Column: In-Depth Parameter Explanations */}
          <div className="lg:col-span-7 grid gap-3.5 sm:grid-cols-2">
            {/* 1. Earnings / Monthly Income */}
            <div className="p-4 rounded-xl border border-border bg-surface-muted/20 hover:border-primary/40 transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-emerald-500 shrink-0" />
                  <span className="text-sm font-bold text-foreground">Monthly Earnings</span>
                </div>
                <span className="text-sm font-extrabold text-foreground numeric">{currency(monthlyIncome)}</span>
              </div>
              <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
                Total verified net inflow. 100% of your living costs, debt obligations, and wealth building depend on this cashflow base.
              </p>
            </div>

            {/* 2. Debt & Active EMIs */}
            <div className="p-4 rounded-xl border border-border bg-surface-muted/20 hover:border-risk/40 transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-rose-500 shrink-0" />
                  <span className="text-sm font-bold text-foreground">Debt & Active EMIs</span>
                </div>
                <span className="text-sm font-extrabold text-risk numeric">{currency(totalEMIBurden)}/mo</span>
              </div>
              <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
                {emisList.length > 0
                  ? `${emisList.length} ongoing loan${emisList.length === 1 ? '' : 's'} (${currency(totalOutstandingDebt)} principal total) with ${weightedInterestRate}% avg interest rate.`
                  : "No ongoing debt commitments recorded. DTI is at a pristine 0%."}
              </p>
            </div>

            {/* 3. Recurring Subscriptions */}
            <div className="p-4 rounded-xl border border-border bg-surface-muted/20 hover:border-purple-400 transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-purple-500 shrink-0" />
                  <span className="text-sm font-bold text-foreground">Subscriptions</span>
                </div>
                <span className="text-sm font-extrabold text-foreground numeric">{currency(totalMonthlySubs)}/mo</span>
              </div>
              <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
                {activeSubs.length > 0
                  ? `${activeSubs.length} active digital services totaling ${currency(totalAnnualSubs)}/yr. Amortized monthly.`
                  : "No active subscriptions tracked. Zero silent recurring leakage."}
              </p>
            </div>

            {/* 4. Essential Living Expenses */}
            <div className="p-4 rounded-xl border border-border bg-surface-muted/20 hover:border-blue-400 transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-blue-500 shrink-0" />
                  <span className="text-sm font-bold text-foreground">Essential Expenses</span>
                </div>
                <span className="text-sm font-extrabold text-foreground numeric">{currency(profile?.essential_expenses || 0)}/mo</span>
              </div>
              <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
                Fixed non-negotiables: rent, utilities, groceries, insurance, and medical essentials powering your household.
              </p>
            </div>

            {/* 5. Discretionary Spending */}
            <div className="p-4 rounded-xl border border-border bg-surface-muted/20 hover:border-amber-400 transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-amber-500 shrink-0" />
                  <span className="text-sm font-bold text-foreground">Discretionary Spending</span>
                </div>
                <span className="text-sm font-extrabold text-foreground numeric">{currency(profile?.discretionary_expenses || 0)}/mo</span>
              </div>
              <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
                Variable lifestyle choices: dining out, shopping, entertainment, and personal recreation.
              </p>
            </div>

            {/* 6. Wealth & SIP Investments */}
            <div className="p-4 rounded-xl border border-border bg-surface-muted/20 hover:border-emerald-400 transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-emerald-600 shrink-0" />
                  <span className="text-sm font-bold text-foreground">SIP & Investments</span>
                </div>
                <span className="text-sm font-extrabold text-positive numeric">+{currency(totalMonthlyInvestments)}/mo</span>
              </div>
              <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
                Monthly capital compounding in mutual funds, stocks, PPF, and NPS ({currency(totalInvestedAssets)}/yr run-rate).
              </p>
            </div>
          </div>
        </div>

        {/* Free Surplus Callout Strip */}
        <div className="mt-5 p-4.5 rounded-xl border border-primary/25 bg-primary-soft/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="h-3.5 w-3.5 rounded-full bg-cyan-500 shrink-0 shadow-sm shadow-cyan-500/50" />
            <div>
              <p className="text-sm sm:text-base font-bold text-foreground">
                Uncommitted Monthly Surplus: <span className="text-positive font-black numeric text-base sm:text-lg">{currency(monthlySurplus)}</span>
              </p>
              <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
                Free liquidity remaining after all living expenses, EMIs, subscriptions, and investments are met.
              </p>
            </div>
          </div>
          <Link
            to="/accounts"
            className="text-xs sm:text-sm font-bold text-primary hover:underline inline-flex items-center gap-1.5 shrink-0"
          >
            <span>Adjust Parameters in Accounts</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      {/* Cashflow & Spending Breakdown */}
      <section className="mt-6 grid gap-4 lg:grid-cols-2">
        <div className="panel p-6">
          <div className="flex items-baseline justify-between">
            <h2 className="text-sm font-semibold">Cashflow Balance</h2>
            <span className="text-xs font-medium text-positive">Surplus: {currency(monthlySurplus)}</span>
          </div>
          <p className="mt-1 text-xs text-subtle-foreground">Monthly Inflows vs Total Outflows</p>
          <div className="mt-6">
            <CashflowChart income={monthlyIncome} spending={monthlySpendValue} />
          </div>
        </div>

        <div className="panel p-6">
          <div className="flex items-baseline justify-between">
            <h2 className="text-sm font-semibold">Spending Structure</h2>
            <p className="text-xs text-subtle-foreground">Total: {currency(spendTotal)}</p>
          </div>
          <p className="mt-1 text-xs text-subtle-foreground">Allocations across lifestyle and fixed categories</p>
          
          {spendCategories.length > 0 ? (
            <ul className="mt-6 space-y-4">
              {spendCategories.map((row) => (
                <li key={row.category}>
                  <div className="flex items-baseline justify-between text-xs">
                    <span className="font-medium">{row.category}</span>
                    <span className="numeric text-muted-foreground">{currency(row.amount)} ({spendTotal > 0 ? Math.round((row.amount / spendTotal) * 100) : 0}%)</span>
                  </div>
                  <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-surface-muted">
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${spendTotal > 0 ? (row.amount / spendTotal) * 100 : 0}%`,
                        backgroundColor: `var(--color-${row.tone})`,
                      }}
                    />
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="mt-8 text-center py-8 border border-dashed border-border rounded-xl">
              <Upload className="h-6 w-6 text-muted-foreground mx-auto mb-2" />
              <p className="text-xs text-muted-foreground">No spending recorded yet.</p>
              <Link to="/spending" className="mt-2 inline-block text-xs text-primary font-medium hover:underline">
                Upload a Bank Statement &rarr;
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* Financial Radar Early Warning Signals */}
      {radarSignals.length > 0 && (
        <section className="mt-6 panel p-6">
          <div className="flex items-center justify-between border-b border-border pb-3">
            <div className="flex items-center gap-2">
              <Activity className="h-4 w-4 text-primary" />
              <h2 className="text-sm font-semibold">Financial Radar Telemetry</h2>
            </div>
            <span className="text-xs text-subtle-foreground">{radarSignals.length} active signals evaluated</span>
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {radarSignals.map((signal, idx) => (
              <div key={idx} className="p-4 rounded-xl border border-border bg-surface-muted/40">
                <div className="flex items-center justify-between">
                  <span className={cn("text-[10px] font-semibold px-2 py-0.5 rounded-full uppercase tracking-wider", toneBg[signal.severity])}>
                    {signal.severity}
                  </span>
                  <span className="text-[11px] text-subtle-foreground font-mono">{signal.category}</span>
                </div>
                <h3 className="mt-2.5 text-xs font-semibold text-foreground">{signal.title}</h3>
                <p className="mt-1 text-xs text-muted-foreground leading-relaxed">{signal.description}</p>
                {signal.action_suggestion && (
                  <p className="mt-2 text-[11px] text-primary font-medium">
                    &bull; {signal.action_suggestion}
                  </p>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Goals & Decision Sandbox Grid */}
      <section className="mt-6 grid gap-4 lg:grid-cols-2">
        {/* Goals Progress */}
        <div className="panel p-6">
          <div className="flex items-baseline justify-between">
            <h2 className="text-sm font-semibold">Financial Goals</h2>
            <Link to="/goals" className="text-xs text-primary font-medium hover:underline">Manage Goals &rarr;</Link>
          </div>
          <p className="mt-1 text-xs text-subtle-foreground">Real-time target progress and required contribution</p>

          {liveGoals.length > 0 ? (
            <ul className="mt-5 space-y-5">
              {liveGoals.map((goal) => {
                const pct = goal.target_amount > 0 ? Math.min(100, Math.round((goal.current_savings_allocated / goal.target_amount) * 100)) : 0;
                return (
                  <li key={goal.id}>
                    <div className="flex items-baseline justify-between text-xs">
                      <span className="font-semibold">{goal.title}</span>
                      <span className="numeric text-muted-foreground">
                        {currency(goal.current_savings_allocated)} / {currency(goal.target_amount)} ({pct}%)
                      </span>
                    </div>
                    <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-surface-muted">
                      <div
                        className={cn("h-full rounded-full transition-all", pct >= 100 ? "bg-positive" : pct >= 50 ? "bg-info" : "bg-attention")}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </li>
                );
              })}
            </ul>
          ) : (
            <div className="mt-6 text-center py-6 border border-dashed border-border rounded-xl">
              <p className="text-xs text-muted-foreground">No financial goals added yet.</p>
              <Link to="/goals" className="mt-2 inline-block text-xs text-primary font-semibold hover:underline">
                + Create Financial Goal
              </Link>
            </div>
          )}
        </div>

        {/* What-If Decision Sandbox Callout */}
        <div className="panel p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" />
              <h2 className="text-sm font-semibold">Financial Time Machine & Sandbox</h2>
            </div>
            <p className="mt-1 text-xs text-subtle-foreground">
              Simulate cash purchases, evaluate EMI commitments, or compare multi-scenario financial trade-offs before executing decisions.
            </p>
          </div>

          <div className="my-4 p-4 rounded-xl bg-surface-muted/50 border border-border">
            <p className="text-xs font-medium text-foreground">Active Simulation Baseline:</p>
            <div className="mt-2 grid grid-cols-2 gap-2 text-xs text-muted-foreground">
              <div>Monthly Surplus: <span className="font-semibold text-foreground">{currency(monthlySurplus)}</span></div>
              <div>Liquid Runway: <span className="font-semibold text-foreground">{runway} mo</span></div>
              <div>Current Savings: <span className="font-semibold text-foreground">{currency(currentSavings)}</span></div>
              <div>DTI Burden: <span className="font-semibold text-foreground">{profile?.dti_ratio_pct || 0}%</span></div>
            </div>
          </div>

          <Link
            to="/simulations"
            className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-primary text-primary-foreground py-2 text-xs font-semibold hover:opacity-90 transition-opacity"
          >
            <span>Launch Financial Time Machine</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </section>

      {/* Statement Transactions Feed */}
      <section className="mt-6 panel p-6">
        <div className="flex items-baseline justify-between">
          <div>
            <h2 className="text-sm font-semibold">Verified Statement Activity</h2>
            <p className="text-xs text-subtle-foreground">Transactions extracted from uploaded bank statements</p>
          </div>
          <span className="text-xs text-subtle-foreground font-mono">{liveTransactions.length} ingested records</span>
        </div>

        {liveTransactions.length > 0 ? (
          <ul className="mt-4 divide-y divide-border">
            {liveTransactions.slice(0, 8).map((tx) => (
              <li key={tx.id} className="flex items-center justify-between gap-4 py-3 text-xs">
                <div>
                  <p className="font-semibold text-foreground">{tx.description}</p>
                  <p className="text-[11px] text-subtle-foreground">
                    {tx.category} &bull; {tx.date}
                  </p>
                </div>
                <span
                  className={cn(
                    "numeric text-xs font-bold",
                    tx.type === "credit" ? "text-positive" : "text-foreground",
                  )}
                >
                  {tx.type === "credit" ? "+" : "−"}
                  {currency(Math.abs(tx.amount), 2)}
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <div className="mt-4 py-8 text-center border border-dashed border-border rounded-xl">
            <FileText className="h-6 w-6 text-muted-foreground mx-auto mb-2" />
            <p className="text-xs text-muted-foreground font-medium">No bank statements uploaded yet.</p>
            <p className="text-[11px] text-subtle-foreground mt-1 max-w-sm mx-auto">
              Upload a PDF or CSV in the Spending tab to automatically extract transaction trends, category breakdowns, and AI observations.
            </p>
            <Link to="/spending" className="mt-3 inline-block text-xs font-semibold text-primary hover:underline">
              Upload Statement &rarr;
            </Link>
          </div>
        )}
      </section>
    </AppShell>
  );
}
