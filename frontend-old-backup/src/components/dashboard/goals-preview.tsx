'use client';

import Link from "next/link";
import { ArrowRight, Goal } from "lucide-react";
import { GoalProgressChart } from "@/components/charts/goal-progress-chart";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency, formatShortDate } from "@/lib/formatters/currency";
import type { Goal as GoalType } from "@/types/finance";

export function GoalsPreview({ goals }: { goals: GoalType[] }) {
  return (
    <Card className="h-full border-border bg-card/85 backdrop-blur">
      <CardHeader className="flex flex-row items-center justify-between gap-4">
        <div>
          <CardTitle className="flex items-center gap-2 font-display text-lg">
            <Goal className="size-4 text-primary" aria-hidden="true" />
            Active Goals
          </CardTitle>
          <CardDescription>Track target milestones and projected completion timelines.</CardDescription>
        </div>
        <Button variant="ghost" size="sm" asChild>
          <Link href="/goals" className="gap-1.5 text-primary">
            Manage goals
            <ArrowRight className="size-4" aria-hidden="true" />
          </Link>
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        {goals.map((goal) => (
          <div key={goal.id} className="rounded-lg border border-border/70 bg-panel/70 p-4 shadow-panel">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-semibold text-foreground">{goal.name}</p>
                <p className="text-xs text-muted-foreground">Target {formatShortDate(goal.targetDate)}</p>
              </div>
              <Badge variant={goal.status === "on_track" ? "outline" : "secondary"}>
                {goal.status === "on_track" ? "On track" : "Needs attention"}
              </Badge>
            </div>
            <div className="mt-3">
              <GoalProgressChart current={goal.currentAmount} target={goal.targetAmount} />
            </div>
            <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
              <span>{formatCurrency(goal.currentAmount)} saved</span>
              <span>Target: {formatCurrency(goal.targetAmount)}</span>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
