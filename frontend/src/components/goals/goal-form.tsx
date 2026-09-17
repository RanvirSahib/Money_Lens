import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FieldLabel, SectionPanel } from "@/components/common/finance-ui";
import type { GoalCreateRequest } from "@/types/finance";

export function GoalForm({ onCreate, isPending }: { onCreate: (goal: GoalCreateRequest) => void; isPending: boolean }) {
  const [form, setForm] = useState({
    name: "Emergency Fund",
    targetAmount: "100000",
    currentAmount: "40000",
    targetDate: "2027-06-01",
    monthlyContribution: "7500",
  });

  function update(key: keyof typeof form, value: string) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function parseAmount(value: string): number {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
  }

  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onCreate({
      name: form.name,
      targetAmount: parseAmount(form.targetAmount),
      currentAmount: parseAmount(form.currentAmount),
      targetDate: form.targetDate,
      monthlyContribution: parseAmount(form.monthlyContribution),
    });
  }

  return (
    <SectionPanel title="Create Goal" description="Goal calculations are returned by the backend; this form only collects inputs.">
      <form className="grid gap-4 md:grid-cols-2" onSubmit={submit}>
        <div className="space-y-2 md:col-span-2">
          <FieldLabel htmlFor="goal-name">Goal name</FieldLabel>
          <Input id="goal-name" value={form.name} onChange={(event) => update("name", event.target.value)} />
        </div>
        <div className="space-y-2">
          <FieldLabel htmlFor="target-amount">Target amount</FieldLabel>
          <Input id="target-amount" inputMode="numeric" value={form.targetAmount} onChange={(event) => update("targetAmount", event.target.value)} />
        </div>
        <div className="space-y-2">
          <FieldLabel htmlFor="current-amount">Current amount</FieldLabel>
          <Input id="current-amount" inputMode="numeric" value={form.currentAmount} onChange={(event) => update("currentAmount", event.target.value)} />
        </div>
        <div className="space-y-2">
          <FieldLabel htmlFor="target-date">Target date</FieldLabel>
          <Input id="target-date" type="date" value={form.targetDate} onChange={(event) => update("targetDate", event.target.value)} />
        </div>
        <div className="space-y-2">
          <FieldLabel htmlFor="monthly-contribution">Monthly contribution</FieldLabel>
          <Input id="monthly-contribution" inputMode="numeric" value={form.monthlyContribution} onChange={(event) => update("monthlyContribution", event.target.value)} />
        </div>
        <div className="md:col-span-2">
          <Button type="submit" disabled={isPending}>
            <Plus className="size-4" aria-hidden="true" />
            {isPending ? "Creating Goal..." : "Create Goal"}
          </Button>
        </div>
      </form>
    </SectionPanel>
  );
}
