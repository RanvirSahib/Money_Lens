'use client';

import { useState } from "react";
import { Box, LineChart as LineChartIcon } from "lucide-react";
import { FinancialTrajectoryChart } from "@/components/charts/financial-trajectory-chart";
import { FinancialTrajectory3D } from "@/components/3d/FinancialTrajectory3D";
import { SectionPanel } from "@/components/common/finance-ui";
import { Button } from "@/components/ui/button";
import type { ProjectionPoint } from "@/types/finance";

export function FinancialTrajectory({ projection }: { projection: ProjectionPoint[] }) {
  const [viewMode, setViewMode] = useState<"2d" | "3d">("3d");

  const timelineMilestones = [
    { label: "NOW", desc: "Current status" },
    { label: "1 MONTH", desc: "Immediate ripple" },
    { label: "3 MONTHS", desc: "Buffer inflection" },
    { label: "6 MONTHS", desc: "Goal pacing" },
    { label: "12 MONTHS", desc: "Target horizon" },
  ];

  return (
    <SectionPanel
      title="Financial Trajectory"
      description="Interactive simulation of your balance, recurring inflows, and projected milestones."
      action={
        <div className="flex items-center gap-1 rounded-lg border border-border/80 bg-[#07101D] p-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setViewMode("2d")}
            className={`h-7 px-2.5 text-xs font-semibold ${viewMode === "2d" ? "bg-primary/15 text-primary" : "text-muted-foreground hover:text-foreground"}`}
          >
            <LineChartIcon className="mr-1.5 size-3.5" />
            2D View
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setViewMode("3d")}
            className={`h-7 px-2.5 text-xs font-semibold ${viewMode === "3d" ? "bg-primary/15 text-primary shadow-glow" : "text-muted-foreground hover:text-foreground"}`}
          >
            <Box className="mr-1.5 size-3.5" />
            3D View
          </Button>
        </div>
      }
    >
      <div className="space-y-4">
        {/* Timeline Horizon Nodes */}
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
          {timelineMilestones.map((m, idx) => (
            <div key={m.label} className="rounded-lg border border-border/60 bg-[#07101D]/80 p-2.5 text-center">
              <span className="data-label text-[0.65rem] text-primary">{m.label}</span>
              <p className="mt-0.5 text-[0.68rem] text-muted-foreground">{m.desc}</p>
            </div>
          ))}
        </div>

        {/* Chart / 3D Canvas */}
        {viewMode === "3d" ? (
          <FinancialTrajectory3D data={projection} height={320} />
        ) : (
          <FinancialTrajectoryChart data={projection} height={320} />
        )}
      </div>
    </SectionPanel>
  );
}

