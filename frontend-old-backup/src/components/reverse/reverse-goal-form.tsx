import { useState } from "react";
import { Calculator } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FieldLabel, SectionPanel } from "@/components/common/finance-ui";
import type { ReverseRequest } from "@/types/finance";

export function ReverseGoalForm({ onCalculate, isPending }: { onCalculate: (request: ReverseRequest) => void; isPending: boolean }) {
  const [form, setForm] = useState({ targetAmount: "100000", currentSavings: "40000", targetDate: "2027-03-01" });

  function update(key: keyof typeof form, value: string) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function parseAmount(value: string): number {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
  }

  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onCalculate({
      targetAmount: parseAmount(form.targetAmount),
      currentSavings: parseAmount(form.currentSavings),
      targetDate: form.targetDate,
    });
  }

  return (
    <SectionPanel title="Start with the future" description="Set a target and let the backend return possible paths.">
      <form className="grid gap-4 md:grid-cols-3" onSubmit={submit}>
        <div className="space-y-2">
          <FieldLabel htmlFor="reverse-target">Target</FieldLabel>
          <Input id="reverse-target" inputMode="numeric" value={form.targetAmount} onChange={(event) => update("targetAmount", event.target.value)} />
        </div>
        <div className="space-y-2">
          <FieldLabel htmlFor="reverse-savings">Current savings</FieldLabel>
          <Input id="reverse-savings" inputMode="numeric" value={form.currentSavings} onChange={(event) => update("currentSavings", event.target.value)} />
        </div>
        <div className="space-y-2">
          <FieldLabel htmlFor="reverse-date">By</FieldLabel>
          <Input id="reverse-date" type="date" value={form.targetDate} onChange={(event) => update("targetDate", event.target.value)} />
        </div>
        <div className="md:col-span-3">
          <Button type="submit" disabled={isPending}>
            <Calculator className="size-4" aria-hidden="true" />
            {isPending ? "Calculating Path..." : "Calculate Path"}
          </Button>
        </div>
      </form>
    </SectionPanel>
  );
}
