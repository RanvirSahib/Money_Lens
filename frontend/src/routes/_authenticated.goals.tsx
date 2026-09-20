import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/app-shell";
import { PageHeader, Panel } from "@/components/dashboard/ui";
import { currency } from "@/lib/dashboard-data";
import { useGoals, useCreateGoal, useDeleteGoal, useProfile } from "@/hooks/use-money-lens";
import { Plus, Trash2, X, Check, Target, Sparkles, AlertCircle, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/goals")({
  head: () => ({
    meta: [
      { title: "Financial Goals & Target Planning — Monexa" },
      {
        name: "description",
        content:
          "Track and analyze every savings goal: deterministic contribution timelines, required sinking funds, and reachability.",
      },
      { property: "og:title", content: "Financial Goals — Monexa" },
      {
        property: "og:description",
        content: "Track target dates, monthly allocations, and reachability across personal financial goals.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: GoalsPage,
});


function maxVal(a: number, b: number) {
  return a > b ? a : b;
}

function GoalsPage() {
  const { data: liveGoals = [] } = useGoals();
  const { data: profile } = useProfile();
  const createGoalMutation = useCreateGoal();
  const deleteGoalMutation = useDeleteGoal();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [targetAmount, setTargetAmount] = useState<number>(300000);
  const [targetMonths, setTargetMonths] = useState<number>(12);
  const [initialSavings, setInitialSavings] = useState<number>(0);
  const [category, setCategory] = useState("purchase");

  const monthlySurplus = profile?.monthly_surplus || 0;

  const displayGoals = liveGoals.map((g) => {
    const curr = g.current_savings_allocated || 0;
    const tgt = g.target_amount || 100000;
    const mos = g.target_months || 12;
    const remaining = maxVal(0, tgt - curr);
    const requiredMonthly = Math.round(remaining / maxVal(1, mos));
    const pct = tgt > 0 ? Math.min(100, Math.round((curr / tgt) * 100)) : 0;
    const isReachableWithSurplus = monthlySurplus >= requiredMonthly;

    return {
      id: g.id,
      title: g.title,
      current: curr,
      target: tgt,
      requiredMonthly,
      monthsLeft: mos,
      pct,
      isReachableWithSurplus,
      category: g.category || "custom",
    };
  });

  const totalSaved = displayGoals.reduce((s, g) => s + g.current, 0);
  const totalTarget = displayGoals.reduce((s, g) => s + g.target, 0);
  const totalMonthlyRequired = displayGoals.reduce((s, g) => s + g.requiredMonthly, 0);

  const handleCreateGoal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    await createGoalMutation.mutateAsync({
      title: title.trim(),
      target_amount: Number(targetAmount),
      target_months: Number(targetMonths),
      current_savings_allocated: Number(initialSavings),
      category,
    });
    setTitle("");
    setInitialSavings(0);
    setIsModalOpen(false);
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to remove this financial goal?")) {
      await deleteGoalMutation.mutateAsync(id);
    }
  };

  return (
    <AppShell>
      <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-4">
        <PageHeader
          eyebrow={`${displayGoals.length} Configured Goals`}
          title="Financial Goal Planning"
          description={
            displayGoals.length > 0
              ? `You have allocated ${currency(totalSaved)} toward ${currency(totalTarget)} in target goals, requiring ${currency(totalMonthlyRequired)} / month.`
              : "Set target amounts and timelines. Money Lens calculates the exact required monthly savings pace."
          }
        />
        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center gap-2 self-start sm:self-auto rounded-lg bg-primary text-primary-foreground px-4 py-2 text-xs font-semibold hover:opacity-90 transition-opacity cursor-pointer shadow-xs"
        >
          <Plus className="h-4 w-4" />
          <span>Add Financial Goal</span>
        </button>
      </div>

      {/* KPI Overview */}
      <section className="mt-8 grid gap-4 sm:grid-cols-3">
        <div className="panel p-5">
          <p className="text-xs uppercase tracking-wide text-subtle-foreground">Total Goal Reserves</p>
          <p className="numeric mt-2.5 text-2xl font-bold text-foreground">{currency(totalSaved)}</p>
          <p className="text-[11px] text-muted-foreground mt-1">
            {totalTarget > 0 ? `${Math.round((totalSaved / totalTarget) * 100)}% of total targets` : "No targets set"}
          </p>
        </div>

        <div className="panel p-5">
          <p className="text-xs uppercase tracking-wide text-subtle-foreground">Combined Target Capital</p>
          <p className="numeric mt-2.5 text-2xl font-bold text-foreground">{currency(totalTarget)}</p>
          <p className="text-[11px] text-muted-foreground mt-1">Across {displayGoals.length} active goals</p>
        </div>

        <div className="panel p-5">
          <p className="text-xs uppercase tracking-wide text-subtle-foreground">Monthly Required Sinking Fund</p>
          <p className={cn("numeric mt-2.5 text-2xl font-bold", monthlySurplus >= totalMonthlyRequired ? "text-positive" : "text-attention")}>
            {currency(totalMonthlyRequired)} / mo
          </p>
          <p className="text-[11px] text-muted-foreground mt-1">
            {monthlySurplus >= totalMonthlyRequired
              ? `🟢 Covered by surplus (${currency(monthlySurplus)}/mo)`
              : `⚠️ Exceeds surplus by ${currency(totalMonthlyRequired - monthlySurplus)}/mo`}
          </p>
        </div>
      </section>

      {/* Create Goal Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-foreground/20 backdrop-blur-xs">
          <div className="bg-surface-elevated rounded-2xl border border-border p-6 max-w-md w-full shadow-2xl space-y-5 animate-in fade-in">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div className="flex items-center gap-2">
                <Target className="h-5 w-5 text-primary" />
                <h3 className="font-display text-lg">Create New Goal</h3>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="text-muted-foreground hover:text-foreground">
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleCreateGoal} className="space-y-4">
              <div>
                <label className="text-xs text-subtle-foreground uppercase tracking-wide">Goal Name</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. New Electric Vehicle, Emergency Fund, Home Downpayment"
                  required
                  className="mt-1.5 w-full rounded-lg border border-border bg-background px-3 py-2 text-xs font-semibold focus:outline-none focus:border-primary"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-subtle-foreground uppercase tracking-wide">Target Amount (₹)</label>
                  <input
                    type="number"
                    value={targetAmount}
                    onChange={(e) => setTargetAmount(Number(e.target.value))}
                    min={1000}
                    required
                    className="mt-1.5 w-full rounded-lg border border-border bg-background px-3 py-2 text-xs font-semibold numeric focus:outline-none focus:border-primary"
                  />
                </div>

                <div>
                  <label className="text-xs text-subtle-foreground uppercase tracking-wide">Timeline (Months)</label>
                  <input
                    type="number"
                    value={targetMonths}
                    onChange={(e) => setTargetMonths(Number(e.target.value))}
                    min={1}
                    max={240}
                    required
                    className="mt-1.5 w-full rounded-lg border border-border bg-background px-3 py-2 text-xs font-semibold numeric focus:outline-none focus:border-primary"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs text-subtle-foreground uppercase tracking-wide">Initial Allocated Savings (₹)</label>
                <input
                  type="number"
                  value={initialSavings}
                  onChange={(e) => setInitialSavings(Number(e.target.value))}
                  min={0}
                  className="mt-1.5 w-full rounded-lg border border-border bg-background px-3 py-2 text-xs font-semibold numeric focus:outline-none focus:border-primary"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-medium rounded-lg border border-border hover:bg-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createGoalMutation.isPending}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-primary text-primary-foreground px-4 py-2 text-xs font-semibold hover:opacity-90 transition-opacity cursor-pointer disabled:opacity-50"
                >
                  <Check className="h-3.5 w-3.5" />
                  <span>{createGoalMutation.isPending ? "Creating..." : "Save Goal"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Goals List */}
      <section className="mt-8 space-y-4">
        {displayGoals.length > 0 ? (
          displayGoals.map((goal) => (
            <div key={goal.id} className="panel p-6 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-semibold text-foreground">{goal.title}</h3>
                    <span className={cn("text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider", goal.isReachableWithSurplus ? "bg-positive-soft text-positive" : "bg-attention-soft text-attention")}>
                      {goal.isReachableWithSurplus ? "Reachable Pace" : "Surplus Stretch"}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Required allocation: <span className="font-semibold text-foreground">{currency(goal.requiredMonthly)} / month</span> over {goal.monthsLeft} months
                  </p>
                </div>

                <div className="flex items-center gap-4 self-end sm:self-auto">
                  <div className="text-right">
                    <p className="numeric text-lg font-bold text-foreground">
                      {currency(goal.current)} <span className="text-xs font-normal text-subtle-foreground">/ {currency(goal.target)}</span>
                    </p>
                    <span className="text-xs text-subtle-foreground font-mono">{goal.pct}% achieved</span>
                  </div>

                  <button
                    onClick={() => handleDelete(goal.id)}
                    className="p-2 rounded-lg text-muted-foreground hover:text-risk hover:bg-risk-soft transition-colors cursor-pointer"
                    title="Delete Goal"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Progress bar */}
              <div className="h-2 w-full overflow-hidden rounded-full bg-surface-muted">
                <div
                  className={cn("h-full rounded-full transition-all", goal.pct >= 100 ? "bg-positive" : goal.pct >= 50 ? "bg-info" : "bg-attention")}
                  style={{ width: `${goal.pct}%` }}
                />
              </div>
            </div>
          ))
        ) : (
          <div className="panel p-12 text-center border-dashed border-border">
            <Target className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
            <h3 className="text-sm font-semibold text-foreground">No Financial Goals Configured</h3>
            <p className="text-xs text-muted-foreground mt-1 max-w-md mx-auto">
              Start by creating your first milestone (e.g. 6-Month Emergency Fund, Vehicle, House Downpayment, or Education).
            </p>
            <button
              onClick={() => setIsModalOpen(true)}
              className="mt-4 inline-flex items-center gap-2 rounded-lg bg-primary text-primary-foreground px-4 py-2 text-xs font-semibold hover:opacity-90 transition-opacity"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Create First Goal</span>
            </button>
          </div>
        )}
      </section>
    </AppShell>
  );
}
