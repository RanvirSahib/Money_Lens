'use client';

import Link from "next/link";
import { Activity, ArrowLeftRight, ArrowRight, Beaker, Goal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const actions = [
  {
    title: "Simulate a decision",
    description: "Model purchases, EMI plans, or savings changes across 12 months.",
    to: "/simulator",
    icon: Activity,
    cta: "Open simulator",
  },
  {
    title: "Plan a goal",
    description: "Adjust targets, contribution rates, and horizon dates.",
    to: "/goals",
    icon: Goal,
    cta: "Manage goals",
  },
  {
    title: "Work backwards",
    description: "Define an end balance and let Money Lens calculate the monthly path.",
    to: "/reverse",
    icon: ArrowLeftRight,
    cta: "Reverse simulate",
  },
  {
    title: "Compare scenarios",
    description: "Contrast multiple future decisions on a single projection canvas.",
    to: "/experiments",
    icon: Beaker,
    cta: "Run experiments",
  },
] as const;

export function QuickActions() {
  return (
    <Card className="border-border bg-card/85 backdrop-blur">
      <CardHeader>
        <CardTitle className="font-display text-lg">Simulation engines</CardTitle>
        <CardDescription>Launch scenario tooling built to explore possible futures without modifying live balances.</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {actions.map((action) => {
          const Icon = action.icon;
          return (
            <div
              key={action.title}
              className="flex flex-col justify-between rounded-lg border border-border/70 bg-panel/70 p-4 transition-all duration-200 hover:border-primary/40 hover:shadow-panel"
            >
              <div>
                <span className="grid size-9 place-items-center rounded-md border border-primary/20 bg-primary/10 text-primary">
                  <Icon className="size-4" aria-hidden="true" />
                </span>
                <p className="mt-3 font-semibold text-foreground">{action.title}</p>
                <p className="mt-1 text-xs text-muted-foreground">{action.description}</p>
              </div>
              <Button variant="ghost" size="sm" asChild className="mt-4 justify-between px-0 text-primary hover:bg-transparent">
                <Link href={action.to}>
                  {action.cta}
                  <ArrowRight className="size-4" aria-hidden="true" />
                </Link>
              </Button>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
