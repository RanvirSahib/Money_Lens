'use client';

import React, { useState, useMemo } from 'react';
import { ProjectionPoint } from '@/types/financial';
import { formatCurrency } from '@/lib/formatters/currency';
import { Flag } from 'lucide-react';

interface FinancialTrajectoryChartProps {
  data: ProjectionPoint[];
  milestones?: {
    month: string;
    title: string;
    amount: number;
    type: string;
  }[];
  height?: number;
}

export function FinancialTrajectoryChart({
  data,
  milestones = [],
  height = 300,
}: FinancialTrajectoryChartProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const { minVal, maxVal, points, pathD, areaD } = useMemo(() => {
    if (!data || data.length === 0) {
      return { minVal: 0, maxVal: 0, points: [], pathD: '', areaD: '' };
    }

    const balances = data.map((d) => d.balance);
    const rawMin = Math.min(...balances);
    const rawMax = Math.max(...balances);
    const padding = (rawMax - rawMin) * 0.15 || 20000;
    const minVal = Math.max(0, Math.floor((rawMin - padding) / 10000) * 10000);
    const maxVal = Math.ceil((rawMax + padding) / 10000) * 10000;

    const width = 800; // SVG coordinate width
    const chartHeight = 230;
    const topMargin = 20;

    const range = maxVal - minVal || 1;
    const stepX = (width - 40) / (data.length - 1);

    const calculatedPoints = data.map((d, i) => {
      const x = 20 + i * stepX;
      const normalizedY = (d.balance - minVal) / range;
      const y = topMargin + chartHeight - normalizedY * chartHeight;
      return { x, y, data: d, index: i };
    });

    let pathD = '';
    if (calculatedPoints.length > 0) {
      pathD = `M ${calculatedPoints[0].x},${calculatedPoints[0].y}`;
      for (let i = 0; i < calculatedPoints.length - 1; i++) {
        const p0 = calculatedPoints[i];
        const p1 = calculatedPoints[i + 1];
        const cpX1 = p0.x + (p1.x - p0.x) / 2;
        const cpY1 = p0.y;
        const cpX2 = p0.x + (p1.x - p0.x) / 2;
        const cpY2 = p1.y;
        pathD += ` C ${cpX1},${cpY1} ${cpX2},${cpY2} ${p1.x},${p1.y}`;
      }
    }

    const lastPoint = calculatedPoints[calculatedPoints.length - 1];
    const firstPoint = calculatedPoints[0];
    const baselineY = topMargin + chartHeight;
    const areaD = calculatedPoints.length > 0
      ? `${pathD} L ${lastPoint.x},${baselineY} L ${firstPoint.x},${baselineY} Z`
      : '';

    return { minVal, maxVal, points: calculatedPoints, pathD, areaD };
  }, [data]);

  if (!data || data.length === 0) {
    return (
      <div className="h-60 flex items-center justify-center text-[#64748B] text-xs font-mono">
        NO PROJECTION TELEMETRY AVAILABLE
      </div>
    );
  }

  const activePoint = hoveredIndex !== null ? points[hoveredIndex] : points[points.length - 1];

  return (
    <div className="space-y-4">
      {/* Top Chart Metric Readout */}
      <div className="flex flex-wrap items-end justify-between gap-3 px-1">
        <div>
          <span className="text-[11px] font-mono text-[#64748B] block uppercase tracking-wider">
            PROJECTED BALANCE ({activePoint?.data.month})
          </span>
          <div className="text-2xl sm:text-3xl font-bold tracking-tight text-[#0F172A] flex items-center gap-2.5">
            {formatCurrency(activePoint?.data.balance)}
            <span className="text-[11px] px-2 py-0.5 rounded bg-[#F0FDFA] text-[#0F766E] border border-[#CCFBF1] font-mono font-medium">
              +₹{(activePoint?.data.savings || 0).toLocaleString('en-IN')}/mo net
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3 text-[11px] font-mono">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-1 bg-[#0D9488] rounded-full" />
            <span className="text-[#0F172A] font-medium">Trajectory</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#D97706]" />
            <span className="text-[#64748B]">Milestone</span>
          </div>
        </div>
      </div>

      {/* SVG Chart Panel */}
      <div className="relative w-full rounded-lg bg-[#FFFFFF] border border-[#E2E8F0] p-3 sm:p-4 overflow-hidden shadow-2xs">
        <svg
          viewBox="0 0 800 280"
          className="w-full h-auto overflow-visible select-none"
          style={{ maxHeight: height }}
        >
          <defs>
            <linearGradient id="lightArea" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#0D9488" stopOpacity="0.14" />
              <stop offset="85%" stopColor="#0D9488" stopOpacity="0.0" />
            </linearGradient>

            <filter id="subtleGlow" x="-10%" y="-10%" width="120%" height="120%">
              <feDropShadow dx="0" dy="1" stdDeviation="2" floodColor="#0D9488" floodOpacity="0.2" />
            </filter>
          </defs>

          {/* Precision Gridlines */}
          {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => {
            const y = 20 + 230 * (1 - ratio);
            const gridVal = minVal + ratio * (maxVal - minVal);
            return (
              <g key={i}>
                <line
                  x1="20"
                  y1={y}
                  x2="780"
                  y2={y}
                  stroke="#F1F5F9"
                  strokeWidth="1.5"
                />
                <text
                  x="780"
                  y={y - 3}
                  fill="#94A3B8"
                  fontSize="9"
                  textAnchor="end"
                  fontFamily="monospace"
                >
                  {formatCurrency(gridVal, { compact: true })}
                </text>
              </g>
            );
          })}

          {/* Area Fill */}
          <path d={areaD} fill="url(#lightArea)" />

          {/* Trajectory Line */}
          <path
            d={pathD}
            fill="none"
            stroke="#0D9488"
            strokeWidth="2.5"
            strokeLinecap="round"
            filter="url(#subtleGlow)"
          />

          {/* Milestones */}
          {milestones.map((milestone, idx) => {
            const pt = points.find((p) => p.data.month === milestone.month);
            if (!pt) return null;
            return (
              <g key={idx}>
                <circle
                  cx={pt.x}
                  cy={pt.y}
                  r="5"
                  fill="#FFFFFF"
                  stroke="#D97706"
                  strokeWidth="2.5"
                />
                <circle cx={pt.x} cy={pt.y} r="2" fill="#D97706" />
                <line
                  x1={pt.x}
                  y1={pt.y - 6}
                  x2={pt.x}
                  y2={25}
                  stroke="#D97706"
                  strokeWidth="1"
                  strokeDasharray="2 2"
                  strokeOpacity="0.6"
                />
              </g>
            );
          })}

          {/* Interactive Hover Vertical Line */}
          {points.map((pt, i) => {
            const isHovered = hoveredIndex === i;
            return (
              <g
                key={i}
                onMouseEnter={() => setHoveredIndex(i)}
                onMouseLeave={() => setHoveredIndex(null)}
                className="cursor-pointer"
              >
                <rect
                  x={pt.x - 20}
                  y="0"
                  width="40"
                  height="280"
                  fill="transparent"
                />

                {isHovered && (
                  <>
                    <line
                      x1={pt.x}
                      y1="20"
                      x2={pt.x}
                      y2="250"
                      stroke="#0D9488"
                      strokeWidth="1.5"
                      strokeDasharray="2 2"
                    />
                    <circle
                      cx={pt.x}
                      cy={pt.y}
                      r="5.5"
                      fill="#0D9488"
                      stroke="#FFFFFF"
                      strokeWidth="2.5"
                    />
                  </>
                )}
              </g>
            );
          })}

          {/* X Axis Month Labels */}
          {points.map((pt, i) => {
            const showLabel = points.length <= 8 || i % 2 === 0 || i === points.length - 1;
            if (!showLabel) return null;
            return (
              <text
                key={i}
                x={pt.x}
                y="270"
                fill={hoveredIndex === i ? '#0D9488' : '#64748B'}
                fontSize="9"
                fontWeight={hoveredIndex === i ? '700' : '500'}
                textAnchor="middle"
                fontFamily="monospace"
              >
                {pt.data.month.split(' ')[0]}
              </text>
            );
          })}
        </svg>

        {/* Milestone Summary Footer */}
        {milestones.length > 0 && (
          <div className="mt-3 pt-3 border-t border-[#E2E8F0] flex flex-wrap items-center gap-2 text-xs">
            <span className="text-[#64748B] font-mono text-[10px] uppercase flex items-center gap-1 font-semibold">
              <Flag className="w-3 h-3 text-[#D97706]" /> Milestones:
            </span>
            {milestones.map((m, i) => (
              <div
                key={i}
                className="px-2 py-0.5 rounded bg-[#F8FAFC] border border-[#E2E8F0] text-[#475569] flex items-center gap-1.5 text-[11px]"
              >
                <span className="text-[#0D9488] font-mono font-medium">{m.month}:</span>
                <span>{m.title}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
