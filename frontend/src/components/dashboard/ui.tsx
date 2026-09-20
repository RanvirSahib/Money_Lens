import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export const toneText: Record<string, string> = {
  positive: "text-positive",
  info: "text-info",
  attention: "text-attention",
  risk: "text-risk",
};

export const toneBg: Record<string, string> = {
  positive: "bg-positive-soft text-positive",
  info: "bg-info-soft text-info",
  attention: "bg-attention-soft text-attention",
  risk: "bg-risk-soft text-risk",
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
    <section>
      <p className="text-xs uppercase tracking-wide text-subtle-foreground">{eyebrow}</p>
      <h1 className="mt-3 font-display text-4xl md:text-5xl">{title}</h1>
      <p className="mt-3 max-w-xl text-sm leading-relaxed text-muted-foreground">{description}</p>
    </section>
  );
}

export function Panel({
  title,
  subtitle,
  children,
  className,
}: {
  title?: string;
  subtitle?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("panel p-6", className)}>
      {title ? <h2 className="text-sm font-medium">{title}</h2> : null}
      {subtitle ? <p className="mt-1 text-xs text-subtle-foreground">{subtitle}</p> : null}
      {children}
    </div>
  );
}

export function Badge({ tone, children }: { tone: string; children: ReactNode }) {
  return (
    <span
      className={cn(
        "inline-flex rounded-full px-2.5 py-1 text-[11px] font-medium",
        toneBg[tone] ?? toneBg['info'],
      )}
    >
      {children}
    </span>
  );
}

export function Progress({ value, tone }: { value: number; tone: string }) {
  return (
    <div className="h-2 w-full overflow-hidden rounded-full bg-surface-muted">
      <div
        className={cn("h-full rounded-full", toneBar[tone] ?? toneBar['info'])}
        style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
      />
    </div>
  );
}
