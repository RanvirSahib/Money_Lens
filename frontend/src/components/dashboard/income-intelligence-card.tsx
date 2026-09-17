'use client';

import { useState } from "react";
import { ArrowUpRight, Check, Sparkles, Gift } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";

export function IncomeIntelligenceCard() {
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [isBonusAdded, setIsBonusAdded] = useState(false);

  const handleConfirmIncome = () => {
    setIsConfirmed(true);
    toast.success("Income updated to ₹55,000/mo. Simulation trajectory recalculated.");
  };

  const handleAddBonus = () => {
    setIsBonusAdded(true);
    toast.success("₹50,000 December bonus added to simulation horizon.");
  };

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {/* Income Shift Detection */}
      <Card className="border-primary/40 bg-[#0B1422]/90 p-5 shadow-panel backdrop-blur relative overflow-hidden">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="flex size-2 rounded-full bg-primary animate-ping" />
            <span className="text-[0.68rem] font-bold uppercase tracking-wider text-primary">
              Income Intelligence Detected
            </span>
          </div>
          <span className="rounded border border-primary/30 bg-primary/10 px-2 py-0.5 text-[0.65rem] font-bold text-primary">
            Pattern Shift
          </span>
        </div>

        <h3 className="mt-3 font-display text-sm font-bold text-foreground">
          Possible permanent income increase detected
        </h3>

        {/* Pattern pills */}
        <div className="mt-3 flex items-center gap-2 text-xs">
          <span className="text-muted-foreground text-[0.7rem]">Recent cycle:</span>
          <div className="flex items-center gap-1.5 font-mono text-[0.7rem] font-medium">
            <span className="rounded bg-[#101B2D] px-2 py-0.5 text-muted-foreground">₹45K</span>
            <span>→</span>
            <span className="rounded bg-[#101B2D] px-2 py-0.5 text-muted-foreground">₹45K</span>
            <span>→</span>
            <span className="rounded border border-success/30 bg-success/15 px-2 py-0.5 text-success font-bold">₹55K</span>
            <span>→</span>
            <span className="rounded border border-success/30 bg-success/15 px-2 py-0.5 text-success font-bold">₹55K</span>
          </div>
        </div>

        <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
          Your last two payroll deposits suggest a +₹10,000/mo raise. Confirming this will adjust your future trajectory.
        </p>

        <div className="mt-4 pt-3 border-t border-border/70 flex items-center justify-between">
          {isConfirmed ? (
            <span className="flex items-center gap-1.5 text-xs font-bold text-success">
              <Check className="size-4" />
              Confirmed as ₹55,000 / month
            </span>
          ) : (
            <Button
              size="sm"
              onClick={handleConfirmIncome}
              className="bg-primary text-[#050B14] hover:bg-primary/90 font-semibold text-xs shadow-glow"
            >
              <Sparkles className="mr-1.5 size-3.5" />
              Confirm ₹55,000 as new income
            </Button>
          )}
        </div>
      </Card>

      {/* Bonus / Windfall Event Simulation */}
      <Card className="border-border/80 bg-[#0B1422]/90 p-5 shadow-panel backdrop-blur relative overflow-hidden">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Gift className="size-4 text-warning" />
            <span className="text-[0.68rem] font-bold uppercase tracking-wider text-warning">
              Future Inflow Event
            </span>
          </div>
          <span className="rounded border border-warning/30 bg-warning/10 px-2 py-0.5 text-[0.65rem] font-bold text-warning">
            December 2026
          </span>
        </div>

        <h3 className="mt-3 font-display text-sm font-bold text-foreground">
          Anticipated Annual Bonus: ₹50,000
        </h3>

        <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
          Injecting a single-event bonus in month 4 accelerates your Emergency Fund milestone by 2.4 months.
        </p>

        <div className="mt-4 pt-3 border-t border-border/70 flex items-center justify-between">
          {isBonusAdded ? (
            <span className="flex items-center gap-1.5 text-xs font-bold text-success">
              <Check className="size-4" />
              Bonus added to active simulation
            </span>
          ) : (
            <Button
              variant="outline"
              size="sm"
              onClick={handleAddBonus}
              className="border-warning/40 bg-warning/10 text-warning hover:bg-warning/20 font-semibold text-xs"
            >
              <ArrowUpRight className="mr-1.5 size-3.5" />
              Include ₹50,000 Bonus in Model
            </Button>
          )}
        </div>
      </Card>
    </div>
  );
}