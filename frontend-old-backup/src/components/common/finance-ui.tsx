import type { ReactNode } from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { ImpactTone } from "@/types/finance";

export function SectionPanel({
  title,
  description,
  children,
  action,
  className,
}: {
  title: string;
  description?: string;
  children: ReactNode;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <Card className={cn("border-border/80 bg-[#0B1422]/90 backdrop-blur shadow-panel", className)}>
      <CardHeader className="flex flex-row items-start justify-between gap-4 p-5 pb-3">
        <div>
          <CardTitle className="font-display text-base font-bold text-foreground">{title}</CardTitle>
          {description ? <p className="mt-1 text-xs text-muted-foreground">{description}</p> : null}
        </div>
        {action ? <div className="shrink-0">{action}</div> : null}
      </CardHeader>
      <CardContent className="p-5 pt-2">{children}</CardContent>
    </Card>
  );
}

export function MetricCard({
  label,
  value,
  helper,
  tone = "neutral",
  icon,
}: {
  label: string;
  value: string;
  helper: string;
  tone?: ImpactTone;
  icon?: ReactNode;
}) {
  const toneClass = {
    positive: "text-success",
    warning: "text-warning",
    danger: "text-danger",
    neutral: "text-primary",
  }[tone];

  return (
    <Card className="group relative overflow-hidden border-border/80 bg-[#0B1422]/90 p-5 backdrop-blur transition-all duration-300 hover:border-primary/50 hover:bg-[#101B2D] hover:-translate-y-0.5 hover:shadow-panel">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="data-label">{label}</p>
          <p className={cn("mt-2.5 font-display text-2xl sm:text-3xl font-bold tracking-tight", toneClass)}>{value}</p>
        </div>
        {icon ? (
          <div className="flex size-10 items-center justify-center rounded-lg border border-border bg-[#07101D] text-primary transition-colors group-hover:border-primary/40 group-hover:text-primary">
            {icon}
          </div>
        ) : null}
      </div>
      <p className="mt-3 text-xs text-muted-foreground">{helper}</p>
      <div className="absolute inset-x-0 bottom-0 h-[2px] bg-gradient-to-r from-transparent via-primary/0 to-transparent transition-all group-hover:via-primary/50" />
    </Card>
  );
}

export function ToneBadge({ tone, children }: { tone: ImpactTone; children: ReactNode }) {
  if (tone === "positive") {
    return <Badge className="border-success/30 bg-success/15 text-success font-medium hover:bg-success/20">{children}</Badge>;
  }
  if (tone === "warning") {
    return <Badge className="border-warning/30 bg-warning/15 text-warning font-medium hover:bg-warning/20">{children}</Badge>;
  }
  if (tone === "danger") {
    return <Badge className="border-danger/30 bg-danger/15 text-danger font-medium hover:bg-danger/20">{children}</Badge>;
  }
  return <Badge variant="outline" className="border-primary/30 bg-primary/10 text-primary font-medium">{children}</Badge>;
}

export function FieldLabel({ htmlFor, children }: { htmlFor: string; children: ReactNode }) {
  return (
    <label htmlFor={htmlFor} className="data-label block mb-1">
      {children}
    </label>
  );
}

