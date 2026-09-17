import { Activity, AlertTriangle, PiggyBank, Target } from "lucide-react";
import { MetricCard } from "@/components/common/finance-ui";
import type { SimulationResult } from "@/types/finance";

const icons = [Activity, AlertTriangle, PiggyBank, Target];

export function SimulationSummary({ result }: { result: SimulationResult }) {
  return (
    <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4" aria-label="Simulation metrics">
      {result.metrics.map((metric, index) => {
        const Icon = icons[index] ?? Activity;
        return <MetricCard key={metric.label} label={metric.label} value={metric.value} helper={metric.helper} tone={metric.tone} icon={<Icon className="size-5" aria-hidden="true" />} />;
      })}
    </section>
  );
}
