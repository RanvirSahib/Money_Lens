"use client";

import { useEffect, useState, useMemo } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  PolarAngleAxis,
  PolarGrid,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  ReferenceLine,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { currency, healthRadar } from "@/lib/dashboard-data";

const axisStyle = {
  fontSize: 12,
  fill: "var(--color-subtle-foreground)",
  fontWeight: 500,
};

/** Recharts measures the DOM, so only render after hydration. */
function ChartFrame({ height, children }: { height: number; children: React.ReactElement }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return <div style={{ height }} className="w-full min-w-0" />;
  return (
    <div className="w-full min-w-0" style={{ height, minHeight: height }}>
      <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
        {children}
      </ResponsiveContainer>
    </div>
  );
}

export interface ChartDataPoint {
  month: string;
  value?: number;
  income?: number;
  spending?: number;
  surplus?: number;
}

export interface RadarDataPoint {
  axis: string;
  score: number;
}

export function NetWorthChart({
  data,
  currentValue = 0,
  monthlySurplus = 0,
  monthlyInvestments = 0,
  totalDebt = 0,
}: {
  data?: ChartDataPoint[];
  currentValue?: number;
  monthlySurplus?: number;
  monthlyInvestments?: number;
  totalDebt?: number;
}) {
  const chartData = useMemo(() => {
    if (data && data.length > 1) return data;

    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const now = new Date();
    const currentMonthIdx = now.getMonth();

    const points: ChartDataPoint[] = [];
    const monthlyNetDelta = monthlySurplus; // monthly uncommitted surplus added to net worth

    for (let i = 0; i <= 12; i++) {
      const d = new Date(now.getFullYear(), currentMonthIdx + i, 1);
      const label = i === 0 ? "Now" : months[d.getMonth()];
      
      // Compounding return on monthly investment contributions (≈12% p.a. -> 1% monthly)
      const investmentGain = (monthlyInvestments * i) * 0.01;
      const val = Math.round(currentValue + (monthlyNetDelta * i) + investmentGain);

      points.push({
        month: label,
        value: val,
      });
    }
    return points;
  }, [data, currentValue, monthlySurplus, monthlyInvestments]);

  const values = chartData.map((d) => d.value ?? 0);
  const minVal = Math.min(...values);
  const maxVal = Math.max(...values);
  const range = maxVal - minVal || 10000;
  
  // Dynamic Y domain with padding
  const yMin = minVal < 0 ? Math.floor(minVal - Math.abs(minVal) * 0.1) : Math.max(0, Math.floor(minVal - 5000));
  const yMax = maxVal > 0 ? Math.ceil(maxVal + Math.abs(maxVal) * 0.1) : Math.ceil(maxVal + 50000);

  // Gradient offset calculation when trajectory spans both negative and positive
  const gradientOffset = () => {
    if (maxVal <= 0) return 0;
    if (minVal >= 0) return 1;
    return maxVal / (maxVal - minVal);
  };
  const off = gradientOffset();

  const formatYAxis = (v: number) => {
    const abs = Math.abs(v);
    const sign = v < 0 ? "−" : "";
    if (abs >= 10000000) return `${sign}₹${(abs / 10000000).toFixed(1)}Cr`;
    if (abs >= 100000) return `${sign}₹${(abs / 100000).toFixed(1)}L`;
    if (abs >= 1000) return `${sign}₹${Math.round(abs / 1000)}k`;
    return `${sign}₹${abs}`;
  };

  return (
    <ChartFrame height={240}>
      <AreaChart data={chartData} margin={{ top: 8, right: 12, bottom: 0, left: 10 }}>
        <defs>
          <linearGradient id="netWorthSplit" x1="0" y1="0" x2="0" y2="1">
            <stop offset={0} stopColor="#10b981" stopOpacity={0.3} />
            <stop offset={off} stopColor="#10b981" stopOpacity={0.05} />
            <stop offset={off} stopColor="#ef4444" stopOpacity={0.05} />
            <stop offset={1} stopColor="#ef4444" stopOpacity={0.3} />
          </linearGradient>
        </defs>
        <CartesianGrid stroke="var(--color-border)" strokeDasharray="3 3" vertical={false} />
        <XAxis dataKey="month" tickLine={false} axisLine={false} tick={axisStyle} />
        <YAxis
          tickLine={false}
          axisLine={false}
          width={64}
          domain={[yMin, yMax]}
          tick={axisStyle}
          tickFormatter={formatYAxis}
        />
        <ReferenceLine y={0} stroke="var(--color-border-strong)" strokeDasharray="2 2" />
        <Tooltip
          cursor={{ stroke: "var(--color-border-strong)" }}
          contentStyle={{
            borderRadius: 12,
            border: "1px solid var(--color-border)",
            background: "var(--color-surface)",
            fontSize: 12,
            boxShadow: "var(--shadow-card)",
          }}
          formatter={(v: any) => [currency(Number(v)), "Projected Net Worth"]}
        />
        <Area
          type="monotone"
          dataKey="value"
          stroke="var(--color-primary)"
          strokeWidth={2.5}
          fill="url(#netWorthSplit)"
          dot={{ r: 3, fill: "var(--color-primary)" }}
          activeDot={{ r: 5, strokeWidth: 2, stroke: "#fff" }}
        />
      </AreaChart>
    </ChartFrame>
  );
}

export function CashflowChart({ data, income = 0, spending = 0 }: { data?: ChartDataPoint[]; income?: number; spending?: number }) {
  const chartData = useMemo(() => {
    if (data && data.length > 1) return data;

    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const now = new Date();
    const currentMonthIdx = now.getMonth();

    const points: ChartDataPoint[] = [];
    for (let i = 0; i < 6; i++) {
      const d = new Date(now.getFullYear(), currentMonthIdx + i, 1);
      const label = i === 0 ? "Current" : months[d.getMonth()];
      points.push({
        month: label,
        income,
        spending,
        surplus: Math.max(0, income - spending),
      });
    }
    return points;
  }, [data, income, spending]);

  return (
    <ChartFrame height={200}>
      <BarChart data={chartData} margin={{ top: 8, right: 8, bottom: 0, left: 8 }} barGap={4}>
        <CartesianGrid stroke="var(--color-border)" strokeDasharray="3 3" vertical={false} />
        <XAxis dataKey="month" tickLine={false} axisLine={false} tick={axisStyle} />
        <YAxis
          tickLine={false}
          axisLine={false}
          width={52}
          tick={axisStyle}
          tickFormatter={(v: number) => {
            const abs = Math.abs(v);
            if (abs >= 100000) return `₹${(abs / 100000).toFixed(1)}L`;
            return `₹${Math.round(abs / 1000)}k`;
          }}
        />
        <Tooltip
          cursor={{ fill: "var(--color-surface-muted)" }}
          contentStyle={{
            borderRadius: 12,
            border: "1px solid var(--color-border)",
            background: "var(--color-surface)",
            fontSize: 12,
            boxShadow: "var(--shadow-card)",
          }}
          formatter={(v: any) => currency(Number(v))}
        />
        <Bar dataKey="income" fill="var(--color-chart-1)" radius={[4, 4, 0, 0]} name="Monthly Income" />
        <Bar dataKey="spending" fill="var(--color-chart-2)" radius={[4, 4, 0, 0]} opacity={0.75} name="Total Outflows" />
      </BarChart>
    </ChartFrame>
  );
}

export function HealthRadarChart({ data }: { data?: RadarDataPoint[] }) {
  const radarData = data && data.length > 0 ? data : healthRadar;

  return (
    <ChartFrame height={250}>
      <RadarChart
        data={radarData}
        outerRadius="50%"
        margin={{ top: 16, right: 38, bottom: 16, left: 38 }}
      >
        <PolarGrid stroke="var(--color-border)" strokeDasharray="3 3" />
        <PolarAngleAxis
          dataKey="axis"
          tick={{ fontSize: 11.5, fill: "var(--color-foreground)", fontWeight: 600 }}
        />
        <Radar
          dataKey="score"
          stroke="var(--color-primary)"
          strokeWidth={2.5}
          fill="var(--color-primary)"
          fillOpacity={0.18}
        />
      </RadarChart>
    </ChartFrame>
  );
}

export interface FinancialPieSlice {
  name: string;
  value: number;
  color: string;
  category: "essential" | "discretionary" | "debt" | "subscription" | "investment" | "surplus";
  description: string;
}

export function FinancialBreakdownPieChart({
  monthlyIncome = 0,
  essentialExpenses = 0,
  discretionaryExpenses = 0,
  monthlyEMIs = 0,
  monthlySubscriptions = 0,
  monthlyInvestments = 0,
  monthlySurplus = 0,
}: {
  monthlyIncome?: number;
  essentialExpenses?: number;
  discretionaryExpenses?: number;
  monthlyEMIs?: number;
  monthlySubscriptions?: number;
  monthlyInvestments?: number;
  monthlySurplus?: number;
}) {
  const pieData = useMemo(() => {
    const rawSlices: FinancialPieSlice[] = [
      {
        name: "Essential Expenses",
        value: Math.max(0, essentialExpenses),
        color: "#3b82f6", // Blue
        category: "essential",
        description: "Housing, groceries, utilities & healthcare",
      },
      {
        name: "Discretionary Spending",
        value: Math.max(0, discretionaryExpenses),
        color: "#f59e0b", // Amber
        category: "discretionary",
        description: "Dining, shopping, leisure & lifestyle",
      },
      {
        name: "Debt & Active EMIs",
        value: Math.max(0, monthlyEMIs),
        color: "#ef4444", // Rose / Red
        category: "debt",
        description: "Home, auto, education & personal loan installments",
      },
      {
        name: "Recurring Subscriptions",
        value: Math.max(0, monthlySubscriptions),
        color: "#8b5cf6", // Purple
        category: "subscription",
        description: "Streaming, tech cloud, gym & recurring memberships",
      },
      {
        name: "SIP & Investments",
        value: Math.max(0, monthlyInvestments),
        color: "#10b981", // Emerald
        category: "investment",
        description: "Mutual funds, equities, NPS, PPF & compounding assets",
      },
      {
        name: "Uncommitted Surplus",
        value: Math.max(0, monthlySurplus),
        color: "#06b6d4", // Cyan
        category: "surplus",
        description: "Free monthly cashflow for goals & emergency buffer",
      },
    ];

    const activeSlices = rawSlices.filter((s) => s.value > 0);
    if (activeSlices.length === 0) {
      return [
        {
          name: "Unconfigured Baseline",
          value: 1,
          color: "var(--color-border-strong)",
          category: "surplus" as const,
          description: "Setup financial baseline in Accounts to view exact distribution",
        },
      ];
    }
    return activeSlices;
  }, [
    essentialExpenses,
    discretionaryExpenses,
    monthlyEMIs,
    monthlySubscriptions,
    monthlyInvestments,
    monthlySurplus,
  ]);

  const totalAllocated = pieData.reduce((acc, curr) => acc + (curr.name === "Unconfigured Baseline" ? 0 : curr.value), 0);

  return (
    <div className="relative w-full h-[260px] flex items-center justify-center">
      <ChartFrame height={260}>
        <PieChart margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
          <Tooltip
            contentStyle={{
              borderRadius: 12,
              border: "1px solid var(--color-border)",
              background: "var(--color-surface)",
              fontSize: 13,
              fontWeight: 500,
              boxShadow: "var(--shadow-card)",
            }}
            formatter={(val: any, name: any, item: any) => {
              const numVal = Number(val);
              if (item?.payload?.name === "Unconfigured Baseline") return ["₹0", "Unconfigured"];
              const pct = totalAllocated > 0 ? ((numVal / totalAllocated) * 100).toFixed(1) : "0";
              return [`${currency(numVal)} (${pct}%)`, String(name)];
            }}
          />
          <Pie
            data={pieData}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            innerRadius={72}
            outerRadius={104}
            paddingAngle={pieData.length > 1 ? 3 : 0}
            stroke="var(--color-surface)"
            strokeWidth={2.5}
            isAnimationActive={true}
          >
            {pieData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
        </PieChart>
      </ChartFrame>

      {/* Center Donut Label - Perfectly centered with generous inner clearance */}
      <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center p-2">
        <span className="text-[11px] uppercase font-semibold tracking-wider text-muted-foreground leading-none">
          Monthly Inflow
        </span>
        <span className="mt-1 text-lg font-extrabold text-foreground numeric leading-tight">
          {currency(monthlyIncome || totalAllocated)}
        </span>
      </div>
    </div>
  );
}
