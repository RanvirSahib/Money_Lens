import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { TooltipProps } from "recharts";
import { formatINRCompact } from "@/lib/formatters";
import type { ProjectionPoint } from "@/types/finance";
import { TooltipPanel } from "./chart-tooltip";

type TooltipValue = number | string | Array<number | string>;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function CashFlowTooltip({ active, payload, label }: any) {
  const point = payload?.[0]?.payload as ProjectionPoint | undefined;
  if (!active || !point || !label) return null;

  return (
    <TooltipPanel
      label={`${label}`}
      rows={[
        { name: "Income", value: point.income, tone: "text-success" },
        { name: "Expenses", value: point.expenses, tone: "text-warning" },
        { name: "Additional payment", value: point.additionalPayment, tone: "text-danger" },
      ]}
    />
  );
}

export function CashFlowChart({ data, height = 280 }: { data: ProjectionPoint[]; height?: number }) {
  return (
    <div className="w-full" style={{ minHeight: height }}>
      <ResponsiveContainer width="100%" height={height}>
        <BarChart data={data} margin={{ top: 16, right: 20, left: 0, bottom: 8 }}>
          <CartesianGrid stroke="var(--color-grid)" vertical={false} />
          <XAxis dataKey="month" tickLine={false} axisLine={false} tick={{ fill: "var(--color-muted-foreground)", fontSize: 12 }} />
          <YAxis tickFormatter={formatINRCompact} tickLine={false} axisLine={false} width={70} tick={{ fill: "var(--color-muted-foreground)", fontSize: 12 }} />
          <Tooltip content={<CashFlowTooltip />} cursor={{ fill: "var(--color-accent)" }} />
          <Bar dataKey="income" name="Income" fill="var(--color-success)" radius={[4, 4, 0, 0]} />
          <Bar dataKey="expenses" name="Expenses" fill="var(--color-warning)" radius={[4, 4, 0, 0]} />
          <Bar dataKey="additionalPayment" name="Additional payment" fill="var(--color-danger)" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
