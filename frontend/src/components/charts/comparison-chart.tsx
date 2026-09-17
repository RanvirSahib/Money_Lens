import { CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { TooltipProps } from "recharts";
import { formatINRCompact } from "@/lib/formatters";
import type { ComparisonPoint } from "@/types/finance";
import { TooltipPanel } from "./chart-tooltip";

type TooltipValue = number | string | Array<number | string>;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function ComparisonTooltip({ active, payload, label }: any) {
  const point = payload?.[0]?.payload as ComparisonPoint | undefined;
  if (!active || !point || !label) return null;

  return (
    <TooltipPanel
      label={`${label}`}
      rows={[
        { name: "Buy Now", value: point.buyNow, tone: "text-danger" },
        { name: "EMI", value: point.emi, tone: "text-warning" },
        { name: "Save First", value: point.saveFirst, tone: "text-success" },
      ]}
    />
  );
}

export function ComparisonChart({ data, height = 320 }: { data: ComparisonPoint[]; height?: number }) {
  return (
    <div className="w-full" style={{ minHeight: height }}>
      <ResponsiveContainer width="100%" height={height}>
        <LineChart data={data} margin={{ top: 16, right: 20, left: 0, bottom: 8 }}>
          <CartesianGrid stroke="var(--color-grid)" vertical={false} />
          <XAxis dataKey="month" tickLine={false} axisLine={false} tick={{ fill: "var(--color-muted-foreground)", fontSize: 12 }} />
          <YAxis tickFormatter={formatINRCompact} tickLine={false} axisLine={false} width={70} tick={{ fill: "var(--color-muted-foreground)", fontSize: 12 }} />
          <Tooltip content={<ComparisonTooltip />} cursor={{ stroke: "var(--color-primary)", strokeOpacity: 0.22 }} />
          <Legend iconType="plainline" wrapperStyle={{ color: "var(--color-muted-foreground)", fontSize: 12 }} />
          <Line type="monotone" dataKey="buyNow" name="Buy Now" stroke="var(--color-danger)" strokeWidth={2.5} dot={false} />
          <Line type="monotone" dataKey="emi" name="EMI" stroke="var(--color-warning)" strokeWidth={2.5} dot={false} />
          <Line type="monotone" dataKey="saveFirst" name="Save First" stroke="var(--color-success)" strokeWidth={2.5} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
