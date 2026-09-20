'use client';

import Link from "next/link";
import { ArrowRight, Crosshair } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency, formatShortDate } from "@/lib/formatters/currency";
import type { RadarEvent } from "@/types/finance";

export function RadarPreview({ events }: { events: RadarEvent[] }) {
  return (
    <Card className="h-full border-border bg-card/85 backdrop-blur">
      <CardHeader className="flex flex-row items-center justify-between gap-4">
        <div>
          <CardTitle className="flex items-center gap-2 font-display text-lg">
            <Crosshair className="size-4 text-primary" aria-hidden="true" />
            Financial Radar
          </CardTitle>
          <CardDescription>Upcoming liquidity events and potential pressure points.</CardDescription>
        </div>
        <Button variant="ghost" size="sm" asChild>
          <Link href="/radar" className="gap-1.5 text-primary">
            Open radar
            <ArrowRight className="size-4" aria-hidden="true" />
          </Link>
        </Button>
      </CardHeader>
      <CardContent className="space-y-3">
        {events.map((event) => (
          <div key={event.id} className="flex items-center justify-between rounded-lg border border-border/70 bg-panel/70 p-3 shadow-panel">
            <div>
              <p className="font-semibold text-foreground">{event.description}</p>
              <p className="text-xs text-muted-foreground">{formatShortDate(event.date)} · in {event.daysAway} days</p>
            </div>
            <div className="text-right">
              <p className={event.type === "income" ? "font-semibold text-success" : "font-semibold text-foreground"}>
                {event.type === "income" ? "+" : "-"}{formatCurrency(event.amount)}
              </p>
              <Badge variant={event.severity === "warning" ? "secondary" : "outline"} className="mt-1">
                {event.status}
              </Badge>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
