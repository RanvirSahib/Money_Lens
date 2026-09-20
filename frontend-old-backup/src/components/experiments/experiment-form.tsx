'use client';

import { useState } from "react";
import { FlaskConical, Plus, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FieldLabel, SectionPanel } from "@/components/common/finance-ui";
import type { ExperimentRequest, ExperimentScenario, ScenarioType } from "@/types/finance";

const initialScenarios: ExperimentScenario[] = [
  { id: "a", name: "Scenario A (Buy Now)", scenarioType: "buy_now", summary: "Immediate upfront ₹80,000 purchase", inputs: ["Immediate cash outflow", "Zero recurring interest"] },
  { id: "b", name: "Scenario B (12M EMI)", scenarioType: "emi", summary: "₹6,667 / month installment plan", inputs: ["12 monthly payments", "Preserves initial liquidity buffer"] },
  { id: "c", name: "Scenario C (Save First)", scenarioType: "save_first", summary: "Save ₹10,000 / month for 8 months", inputs: ["Zero debt", "Goal pacing unhindered"] },
  { id: "d", name: "Scenario D (Wait 3M)", scenarioType: "custom", summary: "Wait for December bonus before purchase", inputs: ["Absorbed by windfall", "Minimizes monthly impact"] },
];

export function ExperimentForm({ onRun, isPending }: { onRun: (request: ExperimentRequest) => void; isPending: boolean }) {
  const [scenarios, setScenarios] = useState<ExperimentScenario[]>(initialScenarios);

  function updateScenario(id: string, key: "name" | "summary", value: string) {
    setScenarios((current) => current.map((scenario) => (scenario.id === id ? { ...scenario, [key]: value } : scenario)));
  }

  function addScenario() {
    const nextNumber = scenarios.length + 1;
    setScenarios((current) => [
      ...current,
      { id: `scenario-${nextNumber}`, name: `Scenario ${String.fromCharCode(64 + nextNumber)}`, scenarioType: "custom" as ScenarioType, summary: "Custom Hypothesis", inputs: ["Custom parameter set"] },
    ]);
  }

  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onRun({ scenarios });
  }

  return (
    <SectionPanel
      title="Experiment Setup Laboratory"
      description="Configure multiple financial hypotheses to simulate side-by-side trade-offs without ranking bias."
    >
      <form className="space-y-5" onSubmit={submit}>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {scenarios.map((scenario) => (
            <div
              key={scenario.id}
              className="rounded-xl border border-border/80 bg-[#07101D]/80 p-4 transition-all hover:border-primary/40 hover:bg-[#101B2D]"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="data-label text-[0.65rem] text-primary">{scenario.name}</span>
              </div>
              <div className="space-y-3">
                <div className="space-y-1">
                  <FieldLabel htmlFor={`${scenario.id}-name`}>Label</FieldLabel>
                  <Input
                    id={`${scenario.id}-name`}
                    value={scenario.name}
                    className="h-8 text-xs border-border bg-[#0B1422]"
                    onChange={(event) => updateScenario(scenario.id, "name", event.target.value)}
                  />
                </div>
                <div className="space-y-1">
                  <FieldLabel htmlFor={`${scenario.id}-summary`}>Hypothesis</FieldLabel>
                  <Input
                    id={`${scenario.id}-summary`}
                    value={scenario.summary}
                    className="h-8 text-xs border-border bg-[#0B1422]"
                    onChange={(event) => updateScenario(scenario.id, "summary", event.target.value)}
                  />
                </div>
                <ul className="space-y-1 text-[0.68rem] text-muted-foreground pt-1 border-t border-border/50">
                  {scenario.inputs.map((input) => <li key={input}>• {input}</li>)}
                </ul>
              </div>
            </div>
          ))}
        </div>

        <div className="flex flex-wrap gap-3 pt-2">
          <Button type="button" variant="outline" size="sm" onClick={addScenario} className="border-border bg-[#0B1422]">
            <Plus className="mr-1.5 size-3.5" aria-hidden="true" />
            Add Scenario Branch
          </Button>
          <Button
            type="submit"
            size="sm"
            disabled={isPending}
            className="bg-gradient-to-r from-primary to-secondary font-semibold text-[#050B14] shadow-glow"
          >
            <FlaskConical className="mr-1.5 size-3.5" aria-hidden="true" />
            {isPending ? "Running Laboratory Simulation..." : "Run Experiment Matrix"}
          </Button>
        </div>
      </form>
    </SectionPanel>
  );
}

