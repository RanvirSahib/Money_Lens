'use client';

import { CalendarClock, AlertCircle, ArrowDownRight, ArrowUpRight } from "lucide-react";
import { ToneBadge } from "@/components/common/finance-ui";
import { formatINR, formatShortDate } from "@/lib/formatters";
import type { RadarEvent } from "@/types/finance";

export function RadarCard({ event }: { event: RadarEvent }) {
  const isIncome = event.type === "income";

  return (
    <article className="group relative overflow-hidden rounded-xl border border-border/80 bg-[#0B1422]/90 p-5 shadow-panel backdrop-blur transition-all duration-300 hover:border-primary/50 hover:bg-[#101B2D] hover:-translate-y-1">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            {isIncome ? (
              <ArrowUpRight className="size-4 text-success" />
            ) : (
              <ArrowDownRight className="size-4 text-warning" />
            )}
            <h3 className="font-display text-base font-bold text-foreground group-hover:text-primary transition-colors">
              {event.description}
            </h3>
          </div>
          <p className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
            <CalendarClock className="size-3.5 text-primary" aria-hidden="true" />
            {formatShortDate(event.date)}
            <span className="text-border">•</span>
            <span className="font-mono text-primary">Due in {event.daysAway} days</span>
          </p>
        </div>
        <ToneBadge tone={event.severity}>{event.status}</ToneBadge>
      </div>

      <div className="mt-4 flex items-end justify-between gap-4 border-t border-border/60 pt-3">
        <div>
          <span className="data-label text-[0.65rem]">{event.category}</span>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {isIncome ? "Expected inflow" : "Scheduled obligation"}
          </p>
        </div>
        <p className={isIncome ? "font-display text-xl font-bold text-success" : "font-display text-xl font-bold text-foreground"}>
          {isIncome ? "+" : "-"}{formatINR(event.amount)}
        </p>
      </div>

      <div className="absolute inset-x-0 bottom-0 h-[2px] bg-gradient-to-r from-transparent via-primary/0 to-transparent transition-all group-hover:via-primary/50" />
    </article>
  );
}

