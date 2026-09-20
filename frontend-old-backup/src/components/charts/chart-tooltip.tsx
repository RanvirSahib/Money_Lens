import { formatINR } from "@/lib/formatters";

export function TooltipPanel({ label, rows }: { label: string; rows: Array<{ name: string; value: number | string; tone?: string }> }) {
  return (
    <div className="min-w-48 rounded-md border border-border bg-popover p-3 shadow-panel">
      <p className="text-xs font-semibold text-foreground">{label}</p>
      <div className="mt-2 space-y-1.5">
        {rows.map((row) => (
          <div key={row.name} className="flex items-center justify-between gap-4 text-xs">
            <span className="text-muted-foreground">{row.name}</span>
            <span className={row.tone ?? "text-foreground"}>
              {typeof row.value === "number" ? formatINR(row.value) : row.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
