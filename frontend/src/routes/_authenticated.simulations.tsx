import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import {
  ShoppingBag,
  CreditCard,
  TrendingUp,
  RotateCcw,
  Layers,
  Play,
  Sparkles,
  ShieldCheck,
  AlertTriangle,
  ArrowRight,
  TrendingDown,
  Percent,
  Calendar,
  CheckCircle2,
  AlertCircle,
  Clock,
  RefreshCw,
} from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { PageHeader, Panel } from "@/components/dashboard/ui";
import { currency } from "@/lib/dashboard-data";
import { useProfile } from "@/hooks/use-money-lens";
import {
  simulatePurchase,
  analyzePurchase,
  simulateEMI,
  analyzeEMI,
  simulateSavings,
  analyzeSavings,
  reverseGoal,
  analyzeReverseGoal,
  compareExperiments,
  analyzeExperiments,
} from "@/lib/api-client";
import { cn } from "@/lib/utils";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from "recharts";

export const Route = createFileRoute("/_authenticated/simulations")({
  head: () => ({
    meta: [
      { title: "Financial Time Machine & Experiment Lab — Monexa" },
      {
        name: "description",
        content:
          "Simulate major purchases, test EMI commitments, solve reverse timelines with missed-month catch-up, and compare multi-scenario trade-offs.",
      },
      { property: "og:title", content: "Time Machine & Experiment Lab — Monexa" },
      {
        property: "og:description",
        content: "Deterministic financial simulations and multi-scenario trade-off analysis.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: SimulationsPage,
});


type TabType = "purchase" | "emi" | "savings" | "reverse" | "experiments";

function SimulationsPage() {
  const { data: profile } = useProfile();
  const [activeTab, setActiveTab] = useState<TabType>("purchase");
  const [includeAI, setIncludeAI] = useState<boolean>(true);

  const monthlyIncome = profile?.monthly_income || 85000;
  const monthlyExpenses = profile?.total_monthly_expenses || 35000;
  const currentSavings = profile?.current_savings || 150000;
  const existingEmi = profile?.active_emis || 0;
  const currentSurplus = profile?.monthly_surplus || (monthlyIncome - monthlyExpenses);

  // 1. Purchase State
  const [purchaseAmount, setPurchaseAmount] = useState<number>(75000);
  const [purchaseResult, setPurchaseResult] = useState<any>(null);
  const [purchaseAIInsight, setPurchaseAIInsight] = useState<any>(null);
  const [isPurchaseLoading, setIsPurchaseLoading] = useState(false);

  // 2. EMI State
  const [purchaseCostForEmi, setPurchaseCostForEmi] = useState<number>(400000);
  const [downPayment, setDownPayment] = useState<number>(50000);
  const [interestRate, setInterestRate] = useState<number>(10.5);
  const [tenureMonths, setTenureMonths] = useState<number>(36);
  const [emiResult, setEmiResult] = useState<any>(null);
  const [emiAIInsight, setEmiAIInsight] = useState<any>(null);
  const [isEmiLoading, setIsEmiLoading] = useState(false);

  // 3. Savings Projection State
  const [annualReturn, setAnnualReturn] = useState<number>(12);
  const [projectionMonths, setProjectionMonths] = useState<number>(36);
  const [savingsResult, setSavingsResult] = useState<any>(null);
  const [savingsAIInsight, setSavingsAIInsight] = useState<any>(null);
  const [isSavingsLoading, setIsSavingsLoading] = useState(false);

  // 4. Reverse Goal State & Missed Month Recovery
  const [targetAmount, setTargetAmount] = useState<number>(600000);
  const [targetMonths, setTargetMonths] = useState<number>(18);
  const [currentAllocated, setCurrentAllocated] = useState<number>(50000);
  const [missedMonths, setMissedMonths] = useState<number>(0);
  const [reverseResult, setReverseResult] = useState<any>(null);
  const [reverseAIInsight, setReverseAIInsight] = useState<any>(null);
  const [isReverseLoading, setIsReverseLoading] = useState(false);

  // 5. Experiment Lab State
  const [expCost, setExpCost] = useState<number>(200000);
  const [expTenure, setExpTenure] = useState<number>(24);
  const [expSipBoost, setExpSipBoost] = useState<number>(10000);
  const [expResult, setExpResult] = useState<any>(null);
  const [expAIInsight, setExpAIInsight] = useState<any>(null);
  const [isExpLoading, setIsExpLoading] = useState(false);

  // Handlers
  const handleSimulatePurchase = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsPurchaseLoading(true);
    setPurchaseAIInsight(null);
    try {
      if (includeAI) {
        try {
          const res = await analyzePurchase({
            monthly_income: monthlyIncome,
            monthly_expenses: monthlyExpenses,
            current_savings: currentSavings,
            existing_emi: existingEmi,
            purchase_amount: Number(purchaseAmount),
          });
          setPurchaseResult(res.calculation || res);
          setPurchaseAIInsight(res.ai_insight);
        } catch (aiErr) {
          console.warn("AI purchase insight unavailable, using deterministic engine:", aiErr);
          const res = await simulatePurchase({
            monthly_income: monthlyIncome,
            monthly_expenses: monthlyExpenses,
            current_savings: currentSavings,
            existing_emi: existingEmi,
            purchase_amount: Number(purchaseAmount),
          });
          setPurchaseResult(res);
        }
      } else {
        const res = await simulatePurchase({
          monthly_income: monthlyIncome,
          monthly_expenses: monthlyExpenses,
          current_savings: currentSavings,
          existing_emi: existingEmi,
          purchase_amount: Number(purchaseAmount),
        });
        setPurchaseResult(res);
      }
    } catch (err: any) {
      console.error("Purchase simulation error:", err);
      alert(err?.message || "Failed to simulate purchase. Please check input parameters.");
    } finally {
      setIsPurchaseLoading(false);
    }
  };

  const handleSimulateEMI = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsEmiLoading(true);
    setEmiAIInsight(null);
    try {
      const payload = {
        monthly_income: monthlyIncome,
        monthly_expenses: monthlyExpenses,
        current_savings: currentSavings,
        existing_emi: existingEmi,
        purchase_amount: Number(purchaseCostForEmi),
        down_payment: Number(downPayment),
        annual_interest_rate_pct: Number(interestRate),
        tenure_months: Number(tenureMonths),
      };

      if (includeAI) {
        try {
          const res = await analyzeEMI(payload);
          setEmiResult(res.calculation || res);
          setEmiAIInsight(res.ai_insight);
        } catch (aiErr) {
          console.warn("AI EMI insight unavailable, using deterministic engine:", aiErr);
          const res = await simulateEMI(payload);
          setEmiResult(res);
        }
      } else {
        const res = await simulateEMI(payload);
        setEmiResult(res);
      }
    } catch (err: any) {
      console.error("EMI simulation error:", err);
      alert(err?.message || "Failed to simulate EMI. Please check input parameters.");
    } finally {
      setIsEmiLoading(false);
    }
  };

  const handleSimulateSavings = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingsLoading(true);
    setSavingsAIInsight(null);
    try {
      const payload = {
        monthly_income: monthlyIncome,
        monthly_expenses: monthlyExpenses,
        current_savings: currentSavings,
        existing_emi: existingEmi,
        annual_return_pct: Number(annualReturn),
        duration_months: Number(projectionMonths),
      };

      if (includeAI) {
        try {
          const res = await analyzeSavings(payload);
          setSavingsResult(res.calculation || res);
          setSavingsAIInsight(res.ai_insight);
        } catch (aiErr) {
          console.warn("AI savings insight unavailable, using deterministic engine:", aiErr);
          const res = await simulateSavings(payload);
          setSavingsResult(res);
        }
      } else {
        const res = await simulateSavings(payload);
        setSavingsResult(res);
      }
    } catch (err: any) {
      console.error("Savings simulation error:", err);
      alert(err?.message || "Failed to simulate savings growth. Please check input parameters.");
    } finally {
      setIsSavingsLoading(false);
    }
  };

  const handleReverseGoal = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsReverseLoading(true);
    setReverseAIInsight(null);
    try {
      const payload = {
        target_amount: Number(targetAmount),
        current_savings_allocated: Number(currentAllocated),
        current_monthly_surplus: Number(currentSurplus),
        current_monthly_income: Number(monthlyIncome),
        current_monthly_expenses: Number(monthlyExpenses),
        existing_emi: Number(existingEmi),
        target_months: Number(targetMonths),
        title: "Reverse Goal Target",
      };

      if (includeAI) {
        try {
          const res = await analyzeReverseGoal(payload);
          setReverseResult(res.calculation || res);
          setReverseAIInsight(res.ai_insight);
        } catch (aiErr) {
          console.warn("AI reverse goal insight unavailable, using deterministic engine:", aiErr);
          const res = await reverseGoal(payload);
          setReverseResult(res);
        }
      } else {
        const res = await reverseGoal(payload);
        setReverseResult(res);
      }
    } catch (err: any) {
      console.error("Reverse goal error:", err);
      alert(err?.message || "Failed to calculate reverse goal timeline. Please check input parameters.");
    } finally {
      setIsReverseLoading(false);
    }
  };

  const handleRunExperiments = async () => {
    setIsExpLoading(true);
    setExpAIInsight(null);
    try {
      const payload = {
        monthly_income: monthlyIncome,
        monthly_expenses: monthlyExpenses,
        current_savings: currentSavings,
        existing_emi: existingEmi,
        scenarios: [
          {
            scenario_id: "sc_cash",
            scenario_name: "Scenario A: Outright Cash",
            scenario_type: "cash_purchase" as const,
            purchase_amount: Number(expCost),
            down_payment: 0,
          },
          {
            scenario_id: "sc_emi",
            scenario_name: `Scenario B: ${expTenure}-Mo EMI`,
            scenario_type: "emi_purchase" as const,
            purchase_amount: Number(expCost),
            down_payment: 0,
            annual_interest_rate_pct: 11.0,
            tenure_months: Number(expTenure),
          },
          {
            scenario_id: "sc_delay",
            scenario_name: "Scenario C: Delay & Boost SIP",
            scenario_type: "custom" as const,
            purchase_amount: 0,
            monthly_saving_boost: Number(expSipBoost),
          },
        ],
      };

      if (includeAI) {
        try {
          const res = await analyzeExperiments(payload);
          setExpResult(res.calculation || res);
          setExpAIInsight(res.ai_insight);
        } catch (aiErr) {
          console.warn("AI experiment insight unavailable, using deterministic engine:", aiErr);
          const res = await compareExperiments(payload);
          setExpResult(res);
        }
      } else {
        const res = await compareExperiments(payload);
        setExpResult(res);
      }
    } catch (err: any) {
      console.error("Experiment comparison error:", err);
      alert(err?.message || "Failed to evaluate experiment scenarios. Please check input parameters.");
    } finally {
      setIsExpLoading(false);
    }
  };


  // Trajectory Chart Data Builders
  const purchaseChartData = purchaseResult?.timeline_projection
    ? [
        { month: "Current", with_purchase: currentSavings - purchaseAmount, without_purchase: currentSavings },
        { month: "+3 Mo", with_purchase: purchaseResult.timeline_projection.with_purchase?.["3_months"] || 0, without_purchase: purchaseResult.timeline_projection.without_purchase?.["3_months"] || 0 },
        { month: "+6 Mo", with_purchase: purchaseResult.timeline_projection.with_purchase?.["6_months"] || 0, without_purchase: purchaseResult.timeline_projection.without_purchase?.["6_months"] || 0 },
        { month: "+12 Mo", with_purchase: purchaseResult.timeline_projection.with_purchase?.["12_months"] || 0, without_purchase: purchaseResult.timeline_projection.without_purchase?.["12_months"] || 0 },
      ]
    : [];

  const savingsTrajectoryData = savingsResult?.monthly_trajectory
    ? savingsResult.monthly_trajectory
        .filter((_: any, i: number) => i === 0 || (i + 1) % 6 === 0 || i === savingsResult.monthly_trajectory.length - 1)
        .map((pt: any) => ({
          month: `Mo ${pt.month}`,
          balance: Math.round(pt.closing_balance),
          interest: Math.round(pt.interest_earned),
        }))
    : [];

  const experimentMatrix = expResult?.comparison_matrix || expResult?.scenarios || [];
  const experimentChartData = experimentMatrix.map((sc: any) => ({
    name: sc.scenario_name || sc.name,
    surplus: sc.monthly_surplus ?? sc.monthly_disposable_surplus ?? 0,
    savings_12mo: sc.projected_savings_12_months ?? 0,
    interest: sc.total_interest_or_cost_paid ?? sc.total_interest_paid ?? 0,
  }));

  // Reverse Goal Missed Month Calculations
  const remainingTargetAmount = Math.max(0, targetAmount - currentAllocated);
  const isTimelineElapsed = missedMonths >= targetMonths;
  const remainingMonthsInSchedule = Math.max(0, targetMonths - missedMonths);
  const regularMonthlyRequired = reverseResult?.required_monthly_saving || Math.round(remainingTargetAmount / Math.max(1, targetMonths));
  const catchUpMonthlyRequired = remainingMonthsInSchedule > 0 ? Math.round(remainingTargetAmount / remainingMonthsInSchedule) : 0;
  const catchUpExtraEffort = Math.max(0, catchUpMonthlyRequired - regularMonthlyRequired);
  const isCatchUpFeasible = remainingMonthsInSchedule > 0 && currentSurplus >= catchUpMonthlyRequired;
  const extendedMonthsAtSurplus = currentSurplus > 0 ? Math.ceil(remainingTargetAmount / currentSurplus) : 0;
  const timelineExtensionNeeded = Math.max(0, extendedMonthsAtSurplus - targetMonths);

  return (
    <AppShell>
      <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-4">
        <PageHeader
          eyebrow="Deterministic Intelligence Sandbox"
          title="Financial Time Machine & Experiment Lab"
          description="Explore consequences before committing capital. Authoritative mathematical models + grounded AI explanations."
        />

        {/* AI Insight Switch */}
        <label className="inline-flex items-center gap-2 self-start sm:self-auto px-3.5 py-1.5 rounded-lg border border-border bg-surface-elevated text-xs font-semibold cursor-pointer shadow-xs">
          <Sparkles className={cn("h-4 w-4", includeAI ? "text-primary" : "text-muted-foreground")} />
          <span>Groq AI Explanations</span>
          <input
            type="checkbox"
            checked={includeAI}
            onChange={(e) => setIncludeAI(e.target.checked)}
            className="accent-primary ml-1 cursor-pointer"
          />
        </label>
      </div>

      {/* Navigation Tabs */}
      <div className="mt-8 flex flex-wrap gap-2 border-b border-border pb-3">
        {[
          { id: "purchase", label: "Cash Purchase Simulation", icon: ShoppingBag },
          { id: "emi", label: "Loan & EMI Commitment", icon: CreditCard },
          { id: "savings", label: "SIP & Growth Projections", icon: TrendingUp },
          { id: "reverse", label: "Reverse Time Machine", icon: RotateCcw },
          { id: "experiments", label: "Experiment Comparison Lab", icon: Layers },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as TabType)}
              className={cn(
                "inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer",
                isActive
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "bg-surface-elevated text-subtle-foreground hover:text-foreground hover:bg-secondary border border-border",
              )}
            >
              <Icon className="h-3.5 w-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: CASH PURCHASE SIMULATION */}
      {activeTab === "purchase" && (
        <section className="mt-6 panel p-6 border-primary/20 space-y-6 animate-in fade-in">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-sm font-semibold">Simulate Cash Outflow Decision</h2>
              <p className="text-xs text-subtle-foreground mt-0.5">
                Evaluates reserve buffer drain, runway safety, and replenishment timeline at current monthly surplus.
              </p>
            </div>
            <form onSubmit={handleSimulatePurchase} className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <span className="text-xs text-subtle-foreground font-medium">Purchase Amount:</span>
                <input
                  type="number"
                  value={purchaseAmount}
                  onChange={(e) => setPurchaseAmount(Number(e.target.value))}
                  min={1000}
                  className="w-36 rounded-lg border border-border bg-background px-3 py-1.5 text-xs font-semibold numeric focus:outline-none focus:border-primary"
                />
              </div>
              <button
                type="submit"
                disabled={isPurchaseLoading}
                className="inline-flex items-center gap-1.5 rounded-lg bg-primary text-primary-foreground px-4 py-1.5 text-xs font-semibold hover:opacity-90 transition-opacity cursor-pointer disabled:opacity-50"
              >
                <Play className="h-3.5 w-3.5" />
                <span>{isPurchaseLoading ? "Simulating..." : "Run Time Machine"}</span>
              </button>
            </form>
          </div>

          {purchaseResult && (
            <div className="pt-5 border-t border-border space-y-6">
              {/* Metrics Grid */}
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <div className="p-4 rounded-xl bg-surface-muted/60 border border-border">
                  <p className="text-[11px] text-subtle-foreground uppercase tracking-wide">Liquidity Impact</p>
                  <p className="numeric text-xl font-bold text-foreground mt-1">−{currency(purchaseAmount)}</p>
                  <p className="text-[11px] text-muted-foreground mt-1">Immediate cash reduction</p>
                </div>

                <div className="p-4 rounded-xl bg-surface-muted/60 border border-border">
                  <p className="text-[11px] text-subtle-foreground uppercase tracking-wide">Post-Purchase Savings</p>
                  <p className="numeric text-xl font-bold text-foreground mt-1">
                    {currency(purchaseResult.post_purchase_savings ?? (currentSavings - purchaseAmount))}
                  </p>
                  <p className="text-[11px] text-muted-foreground mt-1">From baseline {currency(currentSavings)}</p>
                </div>

                <div className="p-4 rounded-xl bg-surface-muted/60 border border-border">
                  <p className="text-[11px] text-subtle-foreground uppercase tracking-wide">Runway Coverage</p>
                  <p className="numeric text-xl font-bold text-foreground mt-1">
                    {purchaseResult.emergency_fund_runway_months ?? purchaseResult.post_emergency_fund_months ?? 0} <span className="text-xs font-normal">months</span>
                  </p>
                  <p className="text-[11px] text-muted-foreground mt-1">
                    Baseline was {profile?.emergency_fund_runway_months || 0} months
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-surface-muted/60 border border-border">
                  <p className="text-[11px] text-subtle-foreground uppercase tracking-wide">Recovery Timeline</p>
                  <p className="numeric text-xl font-bold text-primary mt-1">
                    {purchaseResult.months_to_recover_cost ?? purchaseResult.months_to_recover ?? (currentSurplus > 0 ? Math.ceil(purchaseAmount / currentSurplus) : "N/A")} <span className="text-xs font-normal">months</span>
                  </p>
                  <p className="text-[11px] text-muted-foreground mt-1">To fully restore reserves from surplus</p>
                </div>
              </div>

              {/* Trajectory Area Chart */}
              {purchaseChartData.length > 0 && (
                <div className="p-5 rounded-xl border border-border bg-surface-elevated">
                  <h3 className="text-xs font-bold text-foreground uppercase tracking-wider mb-2">
                    12-Month Liquidity Trajectory
                  </h3>
                  <p className="text-[11px] text-subtle-foreground mb-4">Comparing forward cash balance with vs without purchase</p>
                  <div className="h-60 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={purchaseChartData} margin={{ top: 10, right: 20, left: 20, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                        <XAxis dataKey="month" stroke="var(--color-subtle-foreground)" fontSize={11} />
                        <YAxis stroke="var(--color-subtle-foreground)" fontSize={11} tickFormatter={(v) => `₹${v / 1000}k`} />
                        <Tooltip formatter={(value: any) => [currency(Number(value)), ""]} />
                        <Legend />
                        <Area type="monotone" dataKey="without_purchase" name="Baseline (Without Purchase)" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.15} />
                        <Area type="monotone" dataKey="with_purchase" name="Simulated (With Purchase)" stroke="#10b981" fill="#10b981" fillOpacity={0.25} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              )}

              {/* AI Explanation Card */}
              {purchaseAIInsight && (
                <div className="p-5 rounded-xl border border-primary/40 bg-primary-soft/30 space-y-3">
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-primary" />
                    <h3 className="text-xs font-bold uppercase tracking-wider text-foreground">
                      AI Time Machine Analysis
                    </h3>
                  </div>
                  <p className="text-xs text-foreground font-medium leading-relaxed">
                    {purchaseAIInsight.summary || purchaseAIInsight.observations?.[0]?.summary}
                  </p>
                  {purchaseAIInsight.observations?.[0]?.implication && (
                    <p className="text-[11px] text-muted-foreground">
                      <span className="font-semibold text-foreground">Financial Implication:</span> {purchaseAIInsight.observations[0].implication}
                    </p>
                  )}
                  {purchaseAIInsight.observations?.[0]?.possible_action && (
                    <p className="text-[11px] text-primary font-medium">
                      &bull; Action Suggestion: {purchaseAIInsight.observations[0].possible_action}
                    </p>
                  )}
                </div>
              )}
            </div>
          )}
        </section>
      )}

      {/* TAB 2: EMI & LOAN SIMULATION */}
      {activeTab === "emi" && (
        <section className="mt-6 panel p-6 border-primary/20 space-y-6 animate-in fade-in">
          <div>
            <h2 className="text-sm font-semibold">Simulate EMI & Debt Commitment</h2>
            <p className="text-xs text-subtle-foreground mt-0.5">
              Tests recurring installment drag, total interest expense, and post-loan surplus reduction.
            </p>
          </div>

          <form onSubmit={handleSimulateEMI} className="grid gap-4 sm:grid-cols-5 items-end">
            <div>
              <label className="text-xs text-subtle-foreground uppercase tracking-wide">Purchase Amount (₹)</label>
              <input
                type="number"
                value={purchaseCostForEmi}
                onChange={(e) => setPurchaseCostForEmi(Number(e.target.value))}
                min={10000}
                required
                className="mt-1.5 w-full rounded-lg border border-border bg-background px-3 py-2 text-xs font-semibold numeric focus:outline-none focus:border-primary"
              />
            </div>

            <div>
              <label className="text-xs text-subtle-foreground uppercase tracking-wide">Down Payment (₹)</label>
              <input
                type="number"
                value={downPayment}
                onChange={(e) => setDownPayment(Number(e.target.value))}
                min={0}
                className="mt-1.5 w-full rounded-lg border border-border bg-background px-3 py-2 text-xs font-semibold numeric focus:outline-none focus:border-primary"
              />
            </div>

            <div>
              <label className="text-xs text-subtle-foreground uppercase tracking-wide">Interest Rate (% p.a.)</label>
              <input
                type="number"
                value={interestRate}
                onChange={(e) => setInterestRate(Number(e.target.value))}
                step={0.1}
                min={1}
                max={40}
                required
                className="mt-1.5 w-full rounded-lg border border-border bg-background px-3 py-2 text-xs font-semibold numeric focus:outline-none focus:border-primary"
              />
            </div>

            <div>
              <label className="text-xs text-subtle-foreground uppercase tracking-wide">Tenure (Months)</label>
              <input
                type="number"
                value={tenureMonths}
                onChange={(e) => setTenureMonths(Number(e.target.value))}
                min={3}
                max={360}
                required
                className="mt-1.5 w-full rounded-lg border border-border bg-background px-3 py-2 text-xs font-semibold numeric focus:outline-none focus:border-primary"
              />
            </div>

            <button
              type="submit"
              disabled={isEmiLoading}
              className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-primary text-primary-foreground px-4 py-2 text-xs font-semibold hover:opacity-90 transition-opacity cursor-pointer disabled:opacity-50"
            >
              <Play className="h-3.5 w-3.5" />
              <span>{isEmiLoading ? "Calculating..." : "Simulate EMI"}</span>
            </button>
          </form>

          {emiResult && (
            <div className="pt-5 border-t border-border space-y-6">
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <div className="p-4 rounded-xl bg-surface-muted/60 border border-border">
                  <p className="text-[11px] text-subtle-foreground uppercase tracking-wide">Monthly Installment (EMI)</p>
                  <p className="numeric text-xl font-bold text-foreground mt-1">{currency(emiResult.monthly_emi || 0)} / mo</p>
                  <p className="text-[11px] text-muted-foreground mt-1">Loan: {currency(emiResult.loan_amount || (purchaseCostForEmi - downPayment))} for {tenureMonths} mo</p>
                </div>

                <div className="p-4 rounded-xl bg-surface-muted/60 border border-border">
                  <p className="text-[11px] text-subtle-foreground uppercase tracking-wide">Total Interest Cost</p>
                  <p className="numeric text-xl font-bold text-risk mt-1">{currency(emiResult.total_interest || 0)}</p>
                  <p className="text-[11px] text-muted-foreground mt-1">
                    Total repayable: {currency(emiResult.total_repayment || ((emiResult.monthly_emi || 0) * tenureMonths))}
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-surface-muted/60 border border-border">
                  <p className="text-[11px] text-subtle-foreground uppercase tracking-wide">New Monthly Surplus</p>
                  <p className="numeric text-xl font-bold text-foreground mt-1">
                    {currency(emiResult.new_monthly_surplus_during_tenure ?? (currentSurplus - (emiResult.monthly_emi || 0)))}
                  </p>
                  <p className="text-[11px] text-muted-foreground mt-1">Reduced by {currency(emiResult.monthly_emi || 0)} / mo</p>
                </div>

                <div className="p-4 rounded-xl bg-surface-muted/60 border border-border">
                  <p className="text-[11px] text-subtle-foreground uppercase tracking-wide">Post-Action Liquid Reserve</p>
                  <p className="numeric text-xl font-bold text-foreground mt-1">
                    {currency(emiResult.savings_at_purchase ?? (currentSavings - downPayment))}
                  </p>
                  <p className="text-[11px] text-muted-foreground mt-1">After down payment of {currency(downPayment)}</p>
                </div>
              </div>

              {/* AI Explanation Card */}
              {emiAIInsight && (
                <div className="p-5 rounded-xl border border-primary/40 bg-primary-soft/30 space-y-3">
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-primary" />
                    <h3 className="text-xs font-bold uppercase tracking-wider text-foreground">
                      AI EMI & Debt Analysis
                    </h3>
                  </div>
                  <p className="text-xs text-foreground font-medium leading-relaxed">
                    {emiAIInsight.summary || emiAIInsight.observations?.[0]?.summary}
                  </p>
                  {emiAIInsight.observations?.[0]?.implication && (
                    <p className="text-[11px] text-muted-foreground">
                      <span className="font-semibold text-foreground">Implication:</span> {emiAIInsight.observations[0].implication}
                    </p>
                  )}
                  {emiAIInsight.observations?.[0]?.possible_action && (
                    <p className="text-[11px] text-primary font-medium">
                      &bull; Action: {emiAIInsight.observations[0].possible_action}
                    </p>
                  )}
                </div>
              )}
            </div>
          )}
        </section>
      )}

      {/* TAB 3: SAVINGS & COMPOUND PROJECTION */}
      {activeTab === "savings" && (
        <section className="mt-6 panel p-6 border-primary/20 space-y-6 animate-in fade-in">
          <div>
            <h2 className="text-sm font-semibold">SIP & Compound Growth Simulator</h2>
            <p className="text-xs text-subtle-foreground mt-0.5">
              Forecast wealth accumulation based on monthly surplus reinvestment ({currency(currentSurplus)} / mo) and compounding market returns.
            </p>
          </div>

          <form onSubmit={handleSimulateSavings} className="grid gap-4 sm:grid-cols-3 items-end">
            <div>
              <label className="text-xs text-subtle-foreground uppercase tracking-wide">Expected Annual Return (% p.a.)</label>
              <input
                type="number"
                value={annualReturn}
                onChange={(e) => setAnnualReturn(Number(e.target.value))}
                step={0.5}
                min={1}
                max={30}
                className="mt-1.5 w-full rounded-lg border border-border bg-background px-3 py-2 text-xs font-semibold numeric focus:outline-none focus:border-primary"
              />
            </div>

            <div>
              <label className="text-xs text-subtle-foreground uppercase tracking-wide">Horizon (Months)</label>
              <input
                type="number"
                value={projectionMonths}
                onChange={(e) => setProjectionMonths(Number(e.target.value))}
                min={6}
                max={120}
                className="mt-1.5 w-full rounded-lg border border-border bg-background px-3 py-2 text-xs font-semibold numeric focus:outline-none focus:border-primary"
              />
            </div>

            <button
              type="submit"
              disabled={isSavingsLoading}
              className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-primary text-primary-foreground px-4 py-2 text-xs font-semibold hover:opacity-90 transition-opacity cursor-pointer disabled:opacity-50"
            >
              <Play className="h-3.5 w-3.5" />
              <span>{isSavingsLoading ? "Calculating..." : "Project Growth"}</span>
            </button>
          </form>

          {savingsResult && (
            <div className="pt-5 border-t border-border space-y-6">
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="p-4 rounded-xl bg-surface-muted/60 border border-border">
                  <p className="text-[11px] text-subtle-foreground uppercase tracking-wide">Projected Total Corpus</p>
                  <p className="numeric text-2xl font-bold text-positive mt-1">
                    {currency(savingsResult.final_projected_savings || savingsResult.projected_corpus || 0)}
                  </p>
                  <p className="text-[11px] text-muted-foreground mt-1">At month {projectionMonths}</p>
                </div>

                <div className="p-4 rounded-xl bg-surface-muted/60 border border-border">
                  <p className="text-[11px] text-subtle-foreground uppercase tracking-wide">Total Principal Added</p>
                  <p className="numeric text-2xl font-bold text-foreground mt-1">
                    {currency(savingsResult.total_net_contributions ?? (currentSavings + currentSurplus * projectionMonths))}
                  </p>
                  <p className="text-[11px] text-muted-foreground mt-1">Initial capital ({currency(currentSavings)}) + surplus additions</p>
                </div>

                <div className="p-4 rounded-xl bg-surface-muted/60 border border-border">
                  <p className="text-[11px] text-subtle-foreground uppercase tracking-wide">Compound Wealth Generated</p>
                  <p className="numeric text-2xl font-bold text-primary mt-1">
                    {currency(savingsResult.total_interest_earned ?? ((savingsResult.final_projected_savings || 0) - (savingsResult.total_net_contributions || 0)))}
                  </p>
                  <p className="text-[11px] text-muted-foreground mt-1">Compounded gains at {annualReturn}% annualized</p>
                </div>
              </div>

              {/* Trajectory Area Chart */}
              {savingsTrajectoryData.length > 0 && (
                <div className="p-5 rounded-xl border border-border bg-surface-elevated">
                  <h3 className="text-xs font-bold text-foreground uppercase tracking-wider mb-2">
                    Compound Corpus Accumulation Curve
                  </h3>
                  <p className="text-[11px] text-subtle-foreground mb-4">Projected total balance vs compound interest generated</p>
                  <div className="h-60 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={savingsTrajectoryData} margin={{ top: 10, right: 20, left: 20, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                        <XAxis dataKey="month" stroke="var(--color-subtle-foreground)" fontSize={11} />
                        <YAxis stroke="var(--color-subtle-foreground)" fontSize={11} tickFormatter={(v) => `₹${v / 1000}k`} />
                        <Tooltip formatter={(value: any) => [currency(Number(value)), ""]} />
                        <Legend />
                        <Area type="monotone" dataKey="balance" name="Total Closing Corpus" stroke="#10b981" fill="#10b981" fillOpacity={0.2} />
                        <Area type="monotone" dataKey="interest" name="Compound Interest" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.3} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              )}

              {/* AI Explanation Card */}
              {savingsAIInsight && (
                <div className="p-5 rounded-xl border border-primary/40 bg-primary-soft/30 space-y-3">
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-primary" />
                    <h3 className="text-xs font-bold uppercase tracking-wider text-foreground">
                      AI Growth & Wealth Observation
                    </h3>
                  </div>
                  <p className="text-xs text-foreground font-medium leading-relaxed">
                    {savingsAIInsight.summary || savingsAIInsight.observations?.[0]?.summary}
                  </p>
                </div>
              )}
            </div>
          )}
        </section>
      )}

      {/* TAB 4: REVERSE TIME MACHINE WITH MISSED-MONTH RECOVERY */}
      {activeTab === "reverse" && (
        <section className="mt-6 panel p-6 border-primary/20 space-y-6 animate-in fade-in">
          <div>
            <div className="flex items-center gap-2">
              <RotateCcw className="h-4 w-4 text-primary" />
              <h2 className="text-sm font-semibold">Reverse Time Machine (Backwards Goal & Catch-Up Solver)</h2>
            </div>
            <p className="text-xs text-subtle-foreground mt-0.5">
              Start with your target outcome. Money Lens solves backwards to calculate required monthly savings pace, shortfall vs surplus, and dynamic catch-up adjustments if a month is missed.
            </p>
          </div>

          <form onSubmit={handleReverseGoal} className="grid gap-4 sm:grid-cols-4 items-end">
            <div>
              <label className="text-xs text-subtle-foreground uppercase tracking-wide">Target Amount (₹)</label>
              <input
                type="number"
                value={targetAmount}
                onChange={(e) => setTargetAmount(Number(e.target.value))}
                min={10000}
                className="mt-1.5 w-full rounded-lg border border-border bg-background px-3 py-2 text-xs font-semibold numeric focus:outline-none focus:border-primary"
              />
            </div>

            <div>
              <label className="text-xs text-subtle-foreground uppercase tracking-wide">Target Timeline (Months)</label>
              <input
                type="number"
                value={targetMonths}
                onChange={(e) => setTargetMonths(Number(e.target.value))}
                min={1}
                max={120}
                className="mt-1.5 w-full rounded-lg border border-border bg-background px-3 py-2 text-xs font-semibold numeric focus:outline-none focus:border-primary"
              />
            </div>

            <div>
              <label className="text-xs text-subtle-foreground uppercase tracking-wide">Current Saved (₹)</label>
              <input
                type="number"
                value={currentAllocated}
                onChange={(e) => setCurrentAllocated(Number(e.target.value))}
                min={0}
                className="mt-1.5 w-full rounded-lg border border-border bg-background px-3 py-2 text-xs font-semibold numeric focus:outline-none focus:border-primary"
              />
            </div>

            <button
              type="submit"
              disabled={isReverseLoading}
              className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-primary text-primary-foreground px-4 py-2 text-xs font-semibold hover:opacity-90 transition-opacity cursor-pointer disabled:opacity-50"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>{isReverseLoading ? "Solving..." : "Solve Backwards"}</span>
            </button>
          </form>

          {/* Missed Month / Pause Recovery Section */}
          <div className="p-4 rounded-xl border border-border bg-surface-muted/50 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-xs font-bold text-foreground flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5 text-attention" />
                  <span>Missed a Savings Month? Catch-Up Recovery Engine</span>
                </h3>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  If unforeseen expenses prevent saving this month, simulate how much extra you need to save in the remaining months to stay on target.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs text-subtle-foreground font-medium">Missed Months:</span>
                <select
                  value={missedMonths}
                  onChange={(e) => setMissedMonths(Number(e.target.value))}
                  className="rounded-lg border border-border bg-background px-3 py-1 text-xs font-semibold focus:outline-none focus:border-primary cursor-pointer"
                >
                  <option value={0}>0 (On Schedule)</option>
                  <option value={1}>1 Month Missed</option>
                  <option value={2}>2 Months Missed</option>
                  <option value={3}>3 Months Missed</option>
                </select>
              </div>
            </div>

            {missedMonths > 0 && (
              isTimelineElapsed ? (
                <div className="pt-3 border-t border-border/80 p-3.5 rounded-lg bg-risk/10 border border-risk/30 text-xs space-y-1">
                  <p className="font-bold text-risk flex items-center gap-1.5">
                    <AlertTriangle className="h-4 w-4 shrink-0" />
                    <span>Original Timeline Exhausted ({missedMonths} of {targetMonths} Months Missed)</span>
                  </p>
                  <p className="text-foreground leading-relaxed">
                    You have 0 remaining months in your initial {targetMonths}-month window. To accumulate the remaining target of <span className="font-semibold">{currency(remainingTargetAmount)}</span>, you must extend your timeline by at least <span className="font-bold text-primary">{timelineExtensionNeeded || extendedMonthsAtSurplus} months</span> (Total: <span className="font-bold">{extendedMonthsAtSurplus} months</span> at your current ₹{currentSurplus.toLocaleString('en-IN')}/mo surplus pace) or boost monthly income.
                  </p>
                </div>
              ) : (
                <div className="pt-3 border-t border-border/80 grid gap-3 sm:grid-cols-3 text-xs">
                  <div className="p-3 rounded-lg bg-surface border border-border">
                    <span className="text-subtle-foreground">Regular Pace:</span>
                    <p className="numeric font-semibold text-foreground mt-0.5">{currency(regularMonthlyRequired)} / mo</p>
                    <span className="text-[10px] text-muted-foreground">Original {targetMonths} months</span>
                  </div>

                  <div className="p-3 rounded-lg bg-surface border border-border">
                    <span className="text-subtle-foreground">Adjusted Catch-Up Pace:</span>
                    <p className="numeric font-bold text-primary mt-0.5">{currency(catchUpMonthlyRequired)} / mo</p>
                    <span className="text-[10px] text-muted-foreground">Over remaining {remainingMonthsInSchedule} months</span>
                  </div>

                  <div className="p-3 rounded-lg bg-surface border border-border">
                    <span className="text-subtle-foreground">Catch-Up Feasibility:</span>
                    <p className={cn("font-bold mt-0.5", isCatchUpFeasible ? "text-positive" : "text-risk")}>
                      {isCatchUpFeasible ? "🟢 Feasible with Surplus" : `⚠️ Shortfall of ${currency(catchUpMonthlyRequired - currentSurplus)}/mo`}
                    </p>
                    <span className="text-[10px] text-muted-foreground">
                      Extra +{currency(catchUpExtraEffort)}/mo required
                    </span>
                  </div>
                </div>
              )
            )}
          </div>

          {reverseResult && (
            <div className="pt-2 space-y-6">
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <div className="p-4 rounded-xl bg-surface-muted/60 border border-border">
                  <p className="text-[11px] text-subtle-foreground uppercase tracking-wide">Required Monthly Saving</p>
                  <p className="numeric text-xl font-bold text-foreground mt-1">
                    {currency(reverseResult.required_monthly_saving || 0)} / mo
                  </p>
                  <p className="text-[11px] text-muted-foreground mt-1">To achieve in {targetMonths} months</p>
                </div>

                <div className="p-4 rounded-xl bg-surface-muted/60 border border-border">
                  <p className="text-[11px] text-subtle-foreground uppercase tracking-wide">Current Monthly Surplus</p>
                  <p className="numeric text-xl font-bold text-foreground mt-1">{currency(currentSurplus)} / mo</p>
                  <p className="text-[11px] text-muted-foreground mt-1">From active profile cashflow</p>
                </div>

                <div className="p-4 rounded-xl bg-surface-muted/60 border border-border">
                  <p className="text-[11px] text-subtle-foreground uppercase tracking-wide">Monthly Gap / Surplus</p>
                  <p className={cn("numeric text-xl font-bold mt-1", (reverseResult.surplus_gap ?? (currentSurplus - (reverseResult.required_monthly_saving || 0))) >= 0 ? "text-positive" : "text-risk")}>
                    {(reverseResult.surplus_gap ?? (currentSurplus - (reverseResult.required_monthly_saving || 0))) >= 0
                      ? `+${currency(reverseResult.surplus_gap ?? (currentSurplus - (reverseResult.required_monthly_saving || 0)))}`
                      : `−${currency(Math.abs(reverseResult.surplus_gap ?? (currentSurplus - (reverseResult.required_monthly_saving || 0))))}`}
                  </p>
                  <p className="text-[11px] text-muted-foreground mt-1">
                    {(reverseResult.surplus_gap ?? (currentSurplus - (reverseResult.required_monthly_saving || 0))) >= 0 ? "Fully covered by surplus" : "Monthly shortfall needed"}
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-surface-muted/60 border border-border">
                  <p className="text-[11px] text-subtle-foreground uppercase tracking-wide">Feasibility Status</p>
                  <p className="numeric text-sm font-bold text-foreground mt-1 uppercase tracking-wider">
                    {reverseResult.is_currently_sufficient || reverseResult.is_feasible ? "🟢 Feasible" : "🟡 Adjustment Required"}
                  </p>
                  <p className="text-[11px] text-muted-foreground mt-1">
                    {(reverseResult.is_currently_sufficient || reverseResult.is_feasible)
                      ? "On track at current surplus"
                      : `Alternative timeline: ${reverseResult.alternative_timeline_at_current_surplus_months ?? reverseResult.alternative_months_at_current_surplus ?? extendedMonthsAtSurplus ?? "N/A"} months`}
                  </p>
                </div>
              </div>

              {/* AI Explanation Card */}
              {reverseAIInsight && (
                <div className="p-5 rounded-xl border border-primary/40 bg-primary-soft/30 space-y-3">
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-primary" />
                    <h3 className="text-xs font-bold uppercase tracking-wider text-foreground">
                      AI Reverse Timeline Explanation
                    </h3>
                  </div>
                  <p className="text-xs text-foreground font-medium leading-relaxed">
                    {reverseAIInsight.summary || reverseAIInsight.observations?.[0]?.summary}
                  </p>
                  {reverseAIInsight.observations?.[0]?.possible_action && (
                    <p className="text-[11px] text-primary font-medium">
                      &bull; Action: {reverseAIInsight.observations[0].possible_action}
                    </p>
                  )}
                </div>
              )}
            </div>
          )}
        </section>
      )}

      {/* TAB 5: EXPERIMENT COMPARISON LAB */}
      {activeTab === "experiments" && (
        <section className="mt-6 panel p-6 border-primary/20 space-y-6 animate-in fade-in">
          <div>
            <div className="flex items-center gap-2">
              <Layers className="h-4 w-4 text-primary" />
              <h2 className="text-sm font-semibold">Experiment Lab — Multi-Scenario Trade-Off Matrix</h2>
            </div>
            <p className="text-xs text-subtle-foreground mt-0.5">
              Customize multiple financial paths side-by-side (Lump-sum Cash vs EMI vs Delay & Boost SIP) without declaring a universally best choice.
            </p>
          </div>

          {/* Scenario Customizer Controls */}
          <div className="grid gap-4 sm:grid-cols-3 p-4 rounded-xl bg-surface-muted/40 border border-border">
            <div>
              <label className="text-xs text-subtle-foreground uppercase tracking-wide">Purchase Amount (₹)</label>
              <input
                type="number"
                value={expCost}
                onChange={(e) => setExpCost(Number(e.target.value))}
                min={10000}
                className="mt-1.5 w-full rounded-lg border border-border bg-background px-3 py-1.5 text-xs font-semibold numeric focus:outline-none focus:border-primary"
              />
            </div>

            <div>
              <label className="text-xs text-subtle-foreground uppercase tracking-wide">Scenario B Tenure (Months)</label>
              <input
                type="number"
                value={expTenure}
                onChange={(e) => setExpTenure(Number(e.target.value))}
                min={6}
                max={60}
                className="mt-1.5 w-full rounded-lg border border-border bg-background px-3 py-1.5 text-xs font-semibold numeric focus:outline-none focus:border-primary"
              />
            </div>

            <div>
              <label className="text-xs text-subtle-foreground uppercase tracking-wide">Scenario C Monthly SIP Boost (₹)</label>
              <input
                type="number"
                value={expSipBoost}
                onChange={(e) => setExpSipBoost(Number(e.target.value))}
                min={1000}
                className="mt-1.5 w-full rounded-lg border border-border bg-background px-3 py-1.5 text-xs font-semibold numeric focus:outline-none focus:border-primary"
              />
            </div>
          </div>

          <div className="flex justify-end">
            <button
              onClick={handleRunExperiments}
              disabled={isExpLoading}
              className="inline-flex items-center gap-1.5 rounded-lg bg-primary text-primary-foreground px-5 py-2 text-xs font-semibold hover:opacity-90 transition-opacity cursor-pointer disabled:opacity-50 shadow-xs"
            >
              <Play className="h-3.5 w-3.5" />
              <span>{isExpLoading ? "Evaluating Comparison..." : "Run 3-Way Scenario Matrix"}</span>
            </button>
          </div>

          {expResult && (
            <div className="pt-5 border-t border-border space-y-6">
              {/* Comparative Side-by-Side Cards */}
              <div className="grid gap-4 md:grid-cols-3">
                {experimentMatrix.map((sc: any, idx: number) => (
                  <div key={idx} className="p-5 rounded-xl border border-border bg-surface-muted/50 flex flex-col justify-between space-y-4 shadow-xs">
                    <div>
                      <div className="flex items-center justify-between">
                        <h3 className="text-xs font-bold text-foreground">{sc.scenario_name || `Scenario ${idx + 1}`}</h3>
                        <span
                          className={cn(
                            "text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider",
                            sc.risk_level?.toLowerCase().includes("low")
                              ? "bg-positive-soft text-positive"
                              : sc.risk_level?.toLowerCase().includes("high") || sc.risk_level?.toLowerCase().includes("critical")
                              ? "bg-risk-soft text-risk"
                              : "bg-attention-soft text-attention",
                          )}
                        >
                          {sc.risk_level || "Moderate Risk"}
                        </span>

                      </div>
                      <p className="text-[11px] text-subtle-foreground mt-1 leading-relaxed">
                        {sc.trade_off_summary || sc.summary_text || "Deterministic scenario outcome"}
                      </p>
                    </div>

                    <div className="space-y-2.5 border-t border-border/80 pt-3 text-xs">
                      <div className="flex justify-between">
                        <span className="text-subtle-foreground">Monthly Surplus:</span>
                        <span className="font-semibold text-foreground">{currency(sc.monthly_surplus ?? sc.monthly_disposable_surplus ?? 0)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-subtle-foreground">Liquid Runway:</span>
                        <span className="font-semibold text-foreground">{sc.emergency_fund_coverage_months ?? sc.emergency_fund_months ?? 0} mo</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-subtle-foreground">Immediate Reserve:</span>
                        <span className="font-semibold text-foreground">{currency(sc.immediate_savings_after_action ?? sc.immediate_liquid_savings ?? 0)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-subtle-foreground">12-Mo Projected:</span>
                        <span className="font-semibold text-foreground">{currency(sc.projected_savings_12_months ?? 0)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-subtle-foreground">Total Interest/Cost:</span>
                        <span className="font-semibold text-risk">{currency(sc.total_interest_or_cost_paid ?? sc.total_interest_paid ?? 0)}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Comparative Bar Chart */}
              {experimentChartData.length > 0 && (
                <div className="p-5 rounded-xl border border-border bg-surface-elevated">
                  <h3 className="text-xs font-bold text-foreground uppercase tracking-wider mb-4">
                    12-Month Capital Comparison Matrix
                  </h3>
                  <div className="h-64 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={experimentChartData} margin={{ top: 10, right: 20, left: 20, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                        <XAxis dataKey="name" stroke="var(--color-subtle-foreground)" fontSize={11} />
                        <YAxis stroke="var(--color-subtle-foreground)" fontSize={11} tickFormatter={(v) => `₹${v / 1000}k`} />
                        <Tooltip formatter={(value: any) => [currency(Number(value)), ""]} />
                        <Legend />
                        <Bar dataKey="surplus" name="Monthly Surplus" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="savings_12mo" name="12-Mo Projected Savings" fill="#10b981" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="interest" name="Total Interest Expense" fill="#ef4444" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              )}

              {/* AI Trade-Off Analysis Card */}
              {expAIInsight && (
                <div className="p-5 rounded-xl border border-primary/40 bg-primary-soft/30 space-y-3">
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-primary" />
                    <h3 className="text-xs font-bold uppercase tracking-wider text-foreground">
                      AI Multi-Scenario Trade-Off Synthesis
                    </h3>
                  </div>
                  <p className="text-xs text-foreground font-medium leading-relaxed">
                    {expAIInsight.summary || expAIInsight.observations?.[0]?.summary}
                  </p>
                  {expAIInsight.observations?.[0]?.implication && (
                    <p className="text-[11px] text-muted-foreground">
                      <span className="font-semibold text-foreground">Key Trade-offs:</span> {expAIInsight.observations[0].implication}
                    </p>
                  )}
                </div>
              )}
            </div>
          )}
        </section>
      )}
    </AppShell>
  );
}
