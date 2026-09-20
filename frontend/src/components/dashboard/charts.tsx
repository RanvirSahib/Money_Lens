"use client";

import { useEffect, useState } from "react";
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
} from "recharts";
import { cashflowSeries, currency, healthRadar, netWorthSeries } from "@/lib/dashboard-data";

const axisStyle = {
  fontSize: 11,
  fill: "var(--color-subtle-foreground)",
};

/** Recharts measures the DOM, so only render after hydration. */
function ChartFrame({ height, children }: { height: number; children: React.ReactElement }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return <div style={{ height }} />;
  return (
    <ResponsiveContainer width="100%" height={height}>
      {children}
    </ResponsiveContainer>
  );
}

export interface ChartDataPoint {
  month: string;
  value?: number;
  income?: number;
  spending?: number;
}

export interface RadarDataPoint {
  axis: string;
  score: number;
}

export function NetWorthChart({ data, currentValue }: { data?: ChartDataPoint[]; currentValue?: number }) {
  const chartData = data && data.length > 0
    ? data
    : [
        { month: "Mar", value: currentValue || 0 },
      ];

  const minVal = Math.min(...chartData.map((d) => d.value || 0));
  const maxVal = Math.max(...chartData.map((d) => d.value || 0));

  return (
    <ChartFrame height={240}>
      <AreaChart data={chartData} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
        <defs>
          <linearGradient id="netWorthFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--color-primary)" stopOpacity={0.22} />
            <stop offset="100%" stopColor="var(--color-primary)" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid stroke="var(--color-border)" vertical={false} />
        <XAxis dataKey="month" tickLine={false} axisLine={false} tick={axisStyle} />
        <YAxis
          tickLine={false}
          axisLine={false}
          width={56}
          domain={[Math.max(0, minVal - 5000), maxVal + 10000 || 50000]}
          tick={axisStyle}
          tickFormatter={(v: number) => `₹${Math.round(v / 1000)}k`}
        />
        <Tooltip
          cursor={{ stroke: "var(--color-border-strong)" }}
          contentStyle={{
            borderRadius: 12,
            border: "1px solid var(--color-border)",
            background: "var(--color-surface)",
            fontSize: 12,
            boxShadow: "var(--shadow-card)",
          }}
          formatter={(v: number) => [currency(v), "Net worth"]}
        />
        <Area
          type="monotone"
          dataKey="value"
          stroke="var(--color-primary)"
          strokeWidth={2}
          fill="url(#netWorthFill)"
        />
      </AreaChart>
    </ChartFrame>
  );
}

export function CashflowChart({ data, income, spending }: { data?: ChartDataPoint[]; income?: number; spending?: number }) {
  const chartData = data && data.length > 0
    ? data
    : [
        { month: "Current", income: income || 0, spending: spending || 0 },
      ];

  return (
    <ChartFrame height={200}>
      <BarChart data={chartData} margin={{ top: 8, right: 8, bottom: 0, left: 0 }} barGap={4}>
        <CartesianGrid stroke="var(--color-border)" vertical={false} />
        <XAxis dataKey="month" tickLine={false} axisLine={false} tick={axisStyle} />
        <YAxis
          tickLine={false}
          axisLine={false}
          width={48}
          tick={axisStyle}
          tickFormatter={(v: number) => `₹${Math.round(v / 1000)}k`}
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
          formatter={(v: number) => currency(v)}
        />
        <Bar dataKey="income" fill="var(--color-chart-1)" radius={[4, 4, 0, 0]} name="Income" />
        <Bar dataKey="spending" fill="var(--color-chart-2)" radius={[4, 4, 0, 0]} opacity={0.7} name="Spending" />
      </BarChart>
    </ChartFrame>
  );
}

export function HealthRadarChart({ data }: { data?: RadarDataPoint[] }) {
  const radarData = data && data.length > 0 ? data : healthRadar;

  return (
    <ChartFrame height={240}>
      <RadarChart data={radarData} outerRadius="72%">
        <PolarGrid stroke="var(--color-border)" />
        <PolarAngleAxis dataKey="axis" tick={axisStyle} />
        <Radar
          dataKey="score"
          stroke="var(--color-primary)"
          strokeWidth={2}
          fill="var(--color-primary)"
          fillOpacity={0.14}
        />
      </RadarChart>
    </ChartFrame>
  );
}
