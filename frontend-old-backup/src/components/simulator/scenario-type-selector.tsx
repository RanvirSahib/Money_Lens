import { CreditCard, Gauge, HandCoins, SlidersHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ScenarioType } from "@/types/finance";

const scenarioOptions = [
  { type: "buy_now", label: "Buy Now", description: "Immediate purchase", icon: HandCoins },
  { type: "emi", label: "EMI", description: "Spread payments", icon: CreditCard },
  { type: "save_first", label: "Save First", description: "Delay until ready", icon: Gauge },
  { type: "custom", label: "Custom", description: "Adjust variables", icon: SlidersHorizontal },
] as const;

export function ScenarioTypeSelector({ value, onChange }: { value: ScenarioType; onChange: (value: ScenarioType) => void }) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4" role="radiogroup" aria-label="Scenario type">
      {scenarioOptions.map((option) => {
        const Icon = option.icon;
        const isSelected = value === option.type;
        return (
          <button
            key={option.type}
            type="button"
            role="radio"
            aria-checked={isSelected}
            onClick={() => onChange(option.type)}
            className={cn(
              "rounded-lg border bg-panel p-4 text-left transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
              isSelected ? "border-primary bg-accent text-foreground shadow-panel" : "border-border text-muted-foreground hover:border-primary/60 hover:text-foreground",
            )}
          >
            <Icon className={cn("size-5", isSelected ? "text-primary" : "text-muted-foreground")} aria-hidden="true" />
            <p className="mt-3 text-sm font-semibold">{option.label}</p>
            <p className="mt-1 text-xs">{option.description}</p>
          </button>
        );
      })}
    </div>
  );
}
