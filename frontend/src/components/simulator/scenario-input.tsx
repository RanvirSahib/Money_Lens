import { useState } from "react";
import { Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { FieldLabel, SectionPanel } from "@/components/common/finance-ui";
import type { ScenarioParameters, ScenarioType, SimulationRequest } from "@/types/finance";
import { ScenarioTypeSelector } from "./scenario-type-selector";

interface ScenarioInputProps {
  onSimulate: (request: SimulationRequest) => void;
  isPending: boolean;
}

export function ScenarioInput({ onSimulate, isPending }: ScenarioInputProps) {
  const [prompt, setPrompt] = useState("I want to buy an ₹80,000 phone.");
  const [scenarioType, setScenarioType] = useState<ScenarioType>("buy_now");
  const [parameters, setParameters] = useState({
    purchaseAmount: "80000",
    durationMonths: "12",
    interestRate: "",
    additionalIncome: "",
    additionalExpense: "",
    optionalEvent: "",
  });

  function updateParameter(key: keyof typeof parameters, value: string) {
    setParameters((current) => ({ ...current, [key]: value }));
  }

  function toNumber(value: string): number | undefined {
    const parsed = Number(value);
    return Number.isFinite(parsed) && value.trim().length > 0 ? parsed : undefined;
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const structuredParameters: ScenarioParameters = {
      purchaseAmount: toNumber(parameters.purchaseAmount),
      durationMonths: toNumber(parameters.durationMonths),
      interestRate: toNumber(parameters.interestRate),
      additionalIncome: toNumber(parameters.additionalIncome),
      additionalExpense: toNumber(parameters.additionalExpense),
      optionalEvent: parameters.optionalEvent.trim() || undefined,
    };
    onSimulate({ prompt, scenarioType, parameters: structuredParameters });
  }

  return (
    <SectionPanel title="What are you considering?" description="The backend receives this input and returns structured projections.">
      <form className="space-y-5" onSubmit={handleSubmit}>
        <div className="space-y-2">
          <FieldLabel htmlFor="decision-prompt">Decision</FieldLabel>
          <Textarea id="decision-prompt" value={prompt} onChange={(event) => setPrompt(event.target.value)} placeholder="I want to buy an ₹80,000 phone." />
        </div>
        <ScenarioTypeSelector value={scenarioType} onChange={setScenarioType} />
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          <div className="space-y-2">
            <FieldLabel htmlFor="purchase-amount">Purchase amount</FieldLabel>
            <Input id="purchase-amount" inputMode="numeric" value={parameters.purchaseAmount} onChange={(event) => updateParameter("purchaseAmount", event.target.value)} />
          </div>
          <div className="space-y-2">
            <FieldLabel htmlFor="duration-months">Duration</FieldLabel>
            <Input id="duration-months" inputMode="numeric" value={parameters.durationMonths} onChange={(event) => updateParameter("durationMonths", event.target.value)} placeholder="Months" />
          </div>
          <div className="space-y-2">
            <FieldLabel htmlFor="interest-rate">Interest rate</FieldLabel>
            <Input id="interest-rate" inputMode="decimal" value={parameters.interestRate} onChange={(event) => updateParameter("interestRate", event.target.value)} placeholder="If provided" />
          </div>
          <div className="space-y-2">
            <FieldLabel htmlFor="additional-income">Additional income</FieldLabel>
            <Input id="additional-income" inputMode="numeric" value={parameters.additionalIncome} onChange={(event) => updateParameter("additionalIncome", event.target.value)} placeholder="Bonus or raise" />
          </div>
          <div className="space-y-2">
            <FieldLabel htmlFor="additional-expense">Additional expense</FieldLabel>
            <Input id="additional-expense" inputMode="numeric" value={parameters.additionalExpense} onChange={(event) => updateParameter("additionalExpense", event.target.value)} placeholder="Recurring change" />
          </div>
          <div className="space-y-2">
            <FieldLabel htmlFor="optional-event">Optional event</FieldLabel>
            <Input id="optional-event" value={parameters.optionalEvent} onChange={(event) => updateParameter("optionalEvent", event.target.value)} placeholder="Festival travel, bonus, rent hike" />
          </div>
        </div>
        <Button type="submit" size="lg" disabled={isPending}>
          <Send className="size-4" aria-hidden="true" />
          {isPending ? "Simulating Future..." : "Simulate Future"}
        </Button>
      </form>
    </SectionPanel>
  );
}
