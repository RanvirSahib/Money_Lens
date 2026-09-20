'use client';

import React, { useState } from 'react';
import { TrajectoryNode } from '../types';
import { Trajectory3DCanvas } from './Trajectory3DCanvas';

interface TrajectoryVisualizerProps {
  nodes: TrajectoryNode[];
  selectedMonth?: number;
  onSelectNode?: (node: TrajectoryNode) => void;
  activeScenarioDivergence?: boolean;
}

export const TrajectoryVisualizer: React.FC<TrajectoryVisualizerProps> = ({
  nodes,
  selectedMonth = 3,
  onSelectNode,
  activeScenarioDivergence = true,
}) => {
  const [viewMode, setViewMode] = useState<'2D' | '3D'>('3D');
  const [hoveredNode, setHoveredNode] = useState<TrajectoryNode | null>(null);
  const [showDivergence, setShowDivergence] = useState<boolean>(activeScenarioDivergence);
  const [showAccelerated, setShowAccelerated] = useState<boolean>(true);

  // SVG coordinates calculations
  // Chart dimensions
  const width = 1000;
  const height = 300;
  const paddingX = 60;
  const paddingY = 40;

  const minVal = 30000;
  const maxVal = 160000;

  const getX = (month: number) => {
    // 0 to 12
    return paddingX + (month / 12) * (width - 2 * paddingX);
  };

  const getY = (val: number) => {
    const norm = (val - minVal) / (maxVal - minVal);
    return height - paddingY - norm * (height - 2 * paddingY);
  };

  // Curves generator
  const createPath = (key: 'baseline' | 'scenario' | 'accelerated') => {
    const points = nodes.map((n) => ({
      x: getX(n.monthIndex),
      y: getY(n[key] ?? n.baseline),
    }));

    if (points.length === 0) return '';
    let d = `M ${points[0].x} ${points[0].y}`;
    for (let i = 0; i < points.length - 1; i++) {
      const p0 = points[i];
      const p1 = points[i + 1];
      const cp1x = p0.x + (p1.x - p0.x) / 2;
      const cp1y = p0.y;
      const cp2x = p0.x + (p1.x - p0.x) / 2;
      const cp2y = p1.y;
      d += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p1.x} ${p1.y}`;
    }
    return d;
  };

  const baselinePath = createPath('baseline');
  const scenarioPath = createPath('scenario');
  const acceleratedPath = createPath('accelerated');

  // Closed area under baseline for subtle gradient fill
  const baselineArea = `${baselinePath} L ${getX(12)} ${height - paddingY} L ${getX(0)} ${height - paddingY} Z`;

  return (
    <section className="bg-white rounded-2xl border border-slate-200 p-6 lg:p-8 shadow-sm shadow-slate-200/50 space-y-6">
      {/* Header with Controls & Legends */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-5">
        <div>
          <div className="text-xs font-mono font-medium text-blue-600 uppercase tracking-wider">
            // PROJECTION VECTOR BAY
          </div>
          <h2 className="text-xl sm:text-2xl font-display font-bold text-slate-900 tracking-tight">
            YOUR FINANCIAL TRAJECTORY
          </h2>
        </div>

        <div className="flex flex-wrap items-center gap-4">
          {/* Legend Toggles */}
          <div className="flex items-center gap-3 text-xs font-medium">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-1.5 bg-blue-600 rounded-full inline-block" />
              <span className="text-slate-700">Baseline Vector</span>
            </div>

            <button
              onClick={() => setShowDivergence(!showDivergence)}
              className={`flex items-center gap-1.5 px-2 py-1 rounded transition-colors cursor-pointer ${
                showDivergence ? 'bg-amber-50 text-amber-900 font-semibold' : 'text-slate-400 opacity-60'
              }`}
            >
              <span className="w-3 h-1.5 bg-amber-500 rounded-full inline-block" />
              <span>Scenario Divergence (M+2)</span>
            </button>

            <button
              onClick={() => setShowAccelerated(!showAccelerated)}
              className={`flex items-center gap-1.5 px-2 py-1 rounded transition-colors cursor-pointer ${
                showAccelerated ? 'bg-emerald-50 text-emerald-900 font-semibold' : 'text-slate-400 opacity-60'
              }`}
            >
              <span className="w-3 h-1.5 bg-emerald-600 rounded-full inline-block" />
              <span>Accelerated Target</span>
            </button>
          </div>

          {/* Dimension Toggle */}
          <div className="inline-flex rounded-lg border border-slate-200 bg-slate-100 p-1 shadow-inner">
            <button
              onClick={() => setViewMode('2D')}
              className={`px-3 py-1 text-xs font-mono font-medium transition-colors rounded cursor-pointer ${
                viewMode === '2D'
                  ? 'bg-white text-blue-600 font-semibold shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              2D FLAT
            </button>
            <button
              onClick={() => setViewMode('3D')}
              className={`px-3 py-1 text-xs font-mono font-medium transition-colors rounded cursor-pointer flex items-center gap-1 ${
                viewMode === '3D'
                  ? 'bg-white text-blue-600 font-semibold shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse" />
              <span>3D VECTOR</span>
            </button>
          </div>
        </div>
      </div>

      {/* Visualizer Container */}
      <div className="relative w-full rounded-xl border border-slate-200 bg-gradient-to-b from-slate-50 to-white overflow-hidden shadow-inner flex flex-col justify-between">
        {/* Coordinates Overlay */}
        <div className="flex justify-between px-5 pt-3 pointer-events-none text-[11px] font-mono text-slate-400 uppercase z-10">
          <span className="flex items-center gap-1.5">
            <span className="inline-block w-1.5 h-1.5 bg-blue-500 rounded-full" />
            AXIS-Y: NET WORTH (INR)
          </span>
          <span className="hidden sm:inline-block">
            {viewMode === '3D' ? 'WebGL 3D VECTOR CORE // INTERACTIVE CAMERA' : 'GRID: DETERMINISTIC MONTE-CARLO 1,000 ITERATIONS'}
          </span>
        </div>

        {/* 3D WebGL Mode vs 2D Flat SVG Mode */}
        {viewMode === '3D' ? (
          <div className="p-3">
            <Trajectory3DCanvas
              nodes={nodes}
              selectedMonth={selectedMonth}
              onSelectNode={onSelectNode}
              showDivergence={showDivergence}
              showAccelerated={showAccelerated}
            />
          </div>
        ) : (
          <div className="w-full relative p-2 sm:p-4">
            <svg
              viewBox={`0 0 ${width} ${height}`}
              className="w-full h-auto overflow-visible select-none"
            >
              <defs>
                <pattern
                  id="chart-grid"
                  width="50"
                  height="30"
                  patternUnits="userSpaceOnUse"
                >
                  <path
                    d="M 50 0 L 0 0 0 30"
                    fill="none"
                    stroke="rgba(226, 232, 240, 0.7)"
                    strokeWidth="0.8"
                  />
                </pattern>

                <linearGradient id="baseline-grad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#2563EB" stopOpacity="0.18" />
                  <stop offset="100%" stopColor="#2563EB" stopOpacity="0.01" />
                </linearGradient>
              </defs>

              {/* Background Grid */}
              <rect
                x={paddingX}
                y={paddingY}
                width={width - 2 * paddingX}
                height={height - 2 * paddingY}
                fill="url(#chart-grid)"
                rx="4"
              />

              {/* Horizontal Reference Lines */}
              {[40000, 80000, 120000, 160000].map((amt) => {
                const y = getY(amt);
                return (
                  <g key={amt}>
                    <line
                      x1={paddingX}
                      y1={y}
                      x2={width - paddingX}
                      y2={y}
                      stroke="#E2E8F0"
                      strokeWidth="1"
                      strokeDasharray="4 4"
                    />
                    <text
                      x={paddingX - 10}
                      y={y + 4}
                      textAnchor="end"
                      className="text-[10px] font-mono fill-slate-400"
                    >
                      ₹{(amt / 1000).toFixed(0)}k
                    </text>
                  </g>
                );
              })}

              {/* Month X Labels */}
              {[0, 1, 3, 6, 9, 12].map((m) => {
                const x = getX(m);
                return (
                  <text
                    key={m}
                    x={x}
                    y={height - 12}
                    textAnchor="middle"
                    className="text-[10px] font-mono fill-slate-400"
                  >
                    {m === 0 ? 'NOW' : `M+${m}`}
                  </text>
                );
              })}

              {/* Area Shading */}
              <path d={baselineArea} fill="url(#baseline-grad)" />

              {/* Divergence Shaded Delta */}
              {showDivergence && (
                <path
                  d={`${scenarioPath} L ${getX(12)} ${getY(nodes[nodes.length - 1].baseline)} L ${getX(3)} ${getY(nodes[2].baseline)} Z`}
                  fill="#FEF3C7"
                  fillOpacity="0.45"
                />
              )}

              {/* Accelerated Target Path */}
              {showAccelerated && (
                <path
                  d={acceleratedPath}
                  fill="none"
                  stroke="#059669"
                  strokeWidth="2.5"
                  strokeDasharray="5 5"
                  strokeLinecap="round"
                />
              )}

              {/* Scenario Divergence Path */}
              {showDivergence && (
                <path
                  d={scenarioPath}
                  fill="none"
                  stroke="#F59E0B"
                  strokeWidth="3"
                  strokeLinecap="round"
                />
              )}

              {/* Baseline Path */}
              <path
                d={baselinePath}
                fill="none"
                stroke="#2563EB"
                strokeWidth="3.5"
                strokeLinecap="round"
              />

              {/* Nodes and Callouts */}
              {nodes.map((node) => {
                const x = getX(node.monthIndex);
                const y = getY(node.baseline);
                const isSelected = selectedMonth === node.monthIndex;

                return (
                  <g
                    key={node.label}
                    className="cursor-pointer group"
                    onClick={() => onSelectNode?.(node)}
                    onMouseEnter={() => setHoveredNode(node)}
                    onMouseLeave={() => setHoveredNode(null)}
                  >
                    {/* Vertical guideline */}
                    <line
                      x1={x}
                      y1={y}
                      x2={x}
                      y2={height - paddingY}
                      stroke={isSelected ? '#2563EB' : '#CBD5E1'}
                      strokeWidth={isSelected ? 1.5 : 1}
                      strokeDasharray={isSelected ? 'none' : '3 3'}
                    />

                    {/* Outer glow circle */}
                    {isSelected && (
                      <circle
                        cx={x}
                        cy={y}
                        r="12"
                        fill="#2563EB"
                        fillOpacity="0.2"
                        className="animate-pulse"
                      />
                    )}

                    {/* Main Node Point */}
                    <circle
                      cx={x}
                      cy={y}
                      r={isSelected ? 6 : 5}
                      fill={
                        node.isDivergence
                          ? '#F59E0B'
                          : node.isPeak
                            ? '#059669'
                            : '#2563EB'
                      }
                      stroke="#FFFFFF"
                      strokeWidth="2.5"
                      className="transition-transform duration-200 group-hover:scale-125 shadow-sm"
                    />

                    {/* Data tag on hover or selection */}
                    {(isSelected || hoveredNode?.label === node.label) && (
                      <g transform={`translate(${x}, ${y - 18})`}>
                        <rect
                          x="-38"
                          y="-18"
                          width="76"
                          height="20"
                          rx="4"
                          fill="#0F172A"
                          className="shadow-md"
                        />
                        <text
                          x="0"
                          y="-5"
                          textAnchor="middle"
                          fill="#FFFFFF"
                          className="text-[11px] font-mono font-bold"
                        >
                          ₹{node.baseline.toLocaleString('en-IN')}
                        </text>
                      </g>
                    )}
                  </g>
                );
              })}
            </svg>
          </div>
        )}

        {/* Interactive Node Timeline Anchors */}
        <div className="p-4 bg-white/90 backdrop-blur-md border-t border-slate-200 grid grid-cols-2 sm:grid-cols-5 gap-3">
          {nodes.map((node) => {
            const isSelected = selectedMonth === node.monthIndex;

            if (node.isDivergence) {
              return (
                <div
                  key={node.label}
                  onClick={() => onSelectNode?.(node)}
                  className="p-2.5 rounded-lg border-2 border-blue-600 bg-blue-50/70 shadow-sm ring-2 ring-blue-500/10 cursor-pointer hover:bg-blue-100/70 transition-all text-left"
                >
                  <div className="flex items-center justify-between text-[10px] font-mono text-blue-700 font-bold">
                    <span>{node.label}</span>
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-ping" />
                  </div>
                  <div className="text-base font-bold text-blue-700 font-display">
                    ₹{node.baseline.toLocaleString('en-IN')}
                  </div>
                  <div className="text-[11px] font-medium text-slate-600">
                    {node.subtitle}
                  </div>
                </div>
              );
            }

            if (node.isPeak) {
              return (
                <div
                  key={node.label}
                  onClick={() => onSelectNode?.(node)}
                  className="p-2.5 rounded-lg border border-emerald-500 bg-emerald-50/50 shadow-sm col-span-2 sm:col-span-1 cursor-pointer hover:bg-emerald-100/50 transition-all text-left"
                >
                  <div className="text-[10px] font-mono text-emerald-700 font-bold">
                    {node.label}
                  </div>
                  <div className="text-base font-bold text-emerald-700 font-display">
                    ₹{node.baseline.toLocaleString('en-IN')}
                  </div>
                  <div className="text-[11px] font-medium text-slate-600">
                    {node.subtitle}
                  </div>
                </div>
              );
            }

            return (
              <div
                key={node.label}
                onClick={() => onSelectNode?.(node)}
                className={`p-2.5 rounded-lg border transition-all cursor-pointer text-left ${
                  isSelected
                    ? 'border-blue-500 bg-blue-50/40 shadow-sm'
                    : 'border-slate-200 bg-white hover:border-slate-300 shadow-sm'
                }`}
              >
                <div className="text-[10px] font-mono text-slate-400">
                  {node.label}
                </div>
                <div className="text-base font-bold text-slate-900 font-display">
                  ₹{node.baseline.toLocaleString('en-IN')}
                </div>
                <div
                  className={`text-[11px] font-medium ${
                    node.monthIndex === 0 ? 'text-emerald-600' : 'text-blue-600'
                  }`}
                >
                  {node.subtitle}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
