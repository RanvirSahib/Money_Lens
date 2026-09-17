import {
  CartesianGrid,
  Line,
  LineChart,
  ReferenceDot,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { TooltipProps } from "recharts";
import { formatINRCompact } from "@/lib/formatters";
import type { ProjectionPoint } from "@/types/finance";
import { TooltipPanel } from "./chart-tooltip";

type TooltipValue = number | string | Array<number | string>;

interface FinancialTrajectoryChartProps {
  data: ProjectionPoint[];
  height?: number;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function TrajectoryTooltip({ active, payload, label }: any) {
  const point = payload?.[0]?.payload as ProjectionPoint | undefined;
  if (!active || !point || !label) return null;

  return (
    <TooltipPanel
      label={`${label}`}
      rows={[
        { name: "Projected balance", value: point.balance, tone: "text-primary" },
        { name: "Income", value: point.income, tone: "text-success" },
        { name: "Expenses", value: point.expenses, tone: "text-warning" },
        { name: "Status", value: point.cashFlowStatus },
      ]}
    />
  );
}

export function FinancialTrajectoryChart({ data, height = 330 }: FinancialTrajectoryChartProps) {
  return (
    <div className="h-full w-full" style={{ minHeight: height }}>
      <ResponsiveContainer width="100%" height={height}>
        <LineChart data={data} margin={{ top: 18, right: 20, left: 0, bottom: 8 }}>
          <CartesianGrid stroke="var(--color-grid)" vertical={false} />
          <XAxis dataKey="month" tickLine={false} axisLine={false} tick={{ fill: "var(--color-muted-foreground)", fontSize: 12 }} />
          <YAxis tickFormatter={formatINRCompact} tickLine={false} axisLine={false} width={70} tick={{ fill: "var(--color-muted-foreground)", fontSize: 12 }} />
          <Tooltip content={<TrajectoryTooltip />} cursor={{ stroke: "var(--color-primary)", strokeOpacity: 0.28 }} />
          <Line type="monotone" dataKey="balance" name="Projected balance" stroke="var(--color-primary)" strokeWidth={3} dot={{ r: 3, fill: "var(--color-primary)", strokeWidth: 0 }} activeDot={{ r: 5, fill: "var(--color-secondary)", stroke: "var(--color-background)", strokeWidth: 2 }} />
          {data
            .filter((point) => point.milestone)
            .map((point) => (
              <ReferenceDot key={`${point.month}-${point.milestone}`} x={point.month} y={point.balance} r={5} fill="var(--color-warning)" stroke="var(--color-background)" strokeWidth={2} />
            ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
