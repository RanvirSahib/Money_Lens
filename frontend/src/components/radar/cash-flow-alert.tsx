import { AlertTriangle, Info } from "lucide-react";
import { ToneBadge } from "@/components/common/finance-ui";
import type { RadarAlert } from "@/types/finance";

export function CashFlowAlert({ alert }: { alert: RadarAlert }) {
  const Icon = alert.severity === "warning" || alert.severity === "danger" ? AlertTriangle : Info;
  return (
    <div className="rounded-lg border border-border bg-panel p-4">
      <div className="flex items-start gap-3">
        <Icon className="mt-0.5 size-5 text-primary" aria-hidden="true" />
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-sm font-semibold text-foreground">{alert.title}</h2>
            <ToneBadge tone={alert.severity}>{alert.severity}</ToneBadge>
          </div>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">{alert.description}</p>
        </div>
      </div>
    </div>
  );
}
