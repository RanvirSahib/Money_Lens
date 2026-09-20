import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export const toneText: Record<string, string> = {
  positive: "text-positive",
  info: "text-info",
  attention: "text-attention",
  risk: "text-risk",
};

export const toneBg: Record<string, string> = {
  positive: "bg-positive-soft text-positive border border-positive/20",
  info: "bg-info-soft text-info border border-info/20",
  attention: "bg-attention-soft text-attention border border-attention/20",
  risk: "bg-risk-soft text-risk border border-risk/20",
};

export const toneBar: Record<string, string> = {
  positive: "bg-positive",
  info: "bg-info",
  attention: "bg-attention",
  risk: "bg-risk",
};

export function PageHeader({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <section className="animate-fade-in-up">
      <p className="text-xs uppercase tracking-wider font-semibold text-subtle-foreground">{eyebrow}</p>
      <h1 className="mt-2.5 font-display text-4xl md:text-5xl tracking-tight text-foreground">{title}</h1>
      <p className="mt-2.5 max-w-2xl text-sm leading-relaxed text-muted-foreground">{description}</p>
    </section>
  );
}

export function Panel({
  title,
  subtitle,
  children,
  className,
  action,
  interactive = false,
}: {
  title?: string;
  subtitle?: string;
  children: ReactNode;
  className?: string;
  action?: ReactNode;
  interactive?: boolean;
}) {
  return (
    <div
      className={cn(
        "p-6 transition-all duration-300",
        interactive ? "panel-interactive" : "panel",
        className
      )}
    >
      {title || action ? (
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-4">
          <div>
            {title ? <h2 className="text-sm font-semibold tracking-tight text-foreground">{title}</h2> : null}
            {subtitle ? <p className="mt-1 text-xs text-subtle-foreground leading-relaxed">{subtitle}</p> : null}
          </div>
          {action ? <div className="shrink-0 transition-transform duration-200">{action}</div> : null}
        </div>
      ) : null}
      {children}
    </div>
  );
}

export function Badge({ tone, children, className }: { tone: string; children: ReactNode; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-semibold transition-all duration-200 hover:scale-105",
        toneBg[tone] ?? toneBg["info"],
        className
      )}
    >
      {children}
    </span>
  );
}

export function Progress({ value, tone }: { value: number; tone: string }) {
  return (
    <div className="h-2 w-full overflow-hidden rounded-full bg-surface-muted p-0.5 border border-border/40">
      <div
        className={cn(
          "h-full rounded-full transition-all duration-700 ease-out shadow-xs",
          toneBar[tone] ?? toneBar["info"]
        )}
        style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
      />
    </div>
  );
}

