'use client';

import { CalendarDays, CheckCircle2, AlertTriangle, TrendingUp, Sparkles } from "lucide-react";
import { GoalProgressChart } from "@/components/charts/goal-progress-chart";
import { ToneBadge } from "@/components/common/finance-ui";
import { formatINR, formatMonthYear } from "@/lib/formatters";
import type { Goal } from "@/types/finance";

export function GoalCard({ goal }: { goal: Goal }) {
  const tone = goal.status === "on_track" ? "positive" : goal.status === "attention" ? "warning" : "danger";
  const isComplete = goal.progressPercent >= 100;

  return (
    <article className="group relative overflow-hidden rounded-xl border border-border/80 bg-[#0B1422]/90 p-5 shadow-panel backdrop-blur transition-all duration-300 hover:border-primary/50 hover:bg-[#101B2D] hover:-translate-y-1">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="font-display text-base font-bold text-foreground group-hover:text-primary transition-colors">
              {goal.name}
            </h2>
            {isComplete && <Sparkles className="size-4 text-warning animate-pulse" />}
          </div>
          <p className="mt-1 font-mono text-xs text-muted-foreground">
            {formatINR(goal.currentAmount)} of {formatINR(goal.targetAmount)}
          </p>
        </div>
        <ToneBadge tone={tone}>{goal.status === "on_track" ? "On Track" : "Needs Pacing"}</ToneBadge>
      </div>

      <div className="mt-4">
        <GoalProgressChart value={goal.progressPercent} label={`${goal.name} progress`} />
      </div>

      <div className="mt-4 grid gap-2.5 text-xs sm:grid-cols-2">
        <div className="rounded-lg border border-border/60 bg-[#07101D] p-2.5">
          <p className="data-label text-[0.65rem]">Target Horizon</p>
          <p className="mt-1 flex items-center gap-1.5 font-medium text-foreground">
            <CalendarDays className="size-3.5 text-primary" aria-hidden="true" />
            {formatMonthYear(goal.targetDate)}
          </p>
        </div>
        <div className="rounded-lg border border-border/60 bg-[#07101D] p-2.5">
          <p className="data-label text-[0.65rem]">Required Pacing</p>
          <p className="mt-1 font-medium text-foreground">
            {formatINR(goal.requiredMonthlyContribution)} / mo
          </p>
        </div>
      </div>

      {goal.possibleImpact ? (
        <p className="mt-3.5 border-t border-border/60 pt-2.5 text-[0.68rem] leading-relaxed text-muted-foreground">
          {goal.possibleImpact}
        </p>
      ) : null}

      <div className="absolute inset-x-0 bottom-0 h-[2px] bg-gradient-to-r from-transparent via-primary/0 to-transparent transition-all group-hover:via-primary/50" />
    </article>
  );
}

