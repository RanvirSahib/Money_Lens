import { Progress } from "@/components/ui/progress";

interface GoalProgressChartProps {
  value?: number;
  label?: string;
  current?: number;
  target?: number;
}

export function GoalProgressChart({ value, label = "Goal Progress", current, target }: GoalProgressChartProps) {
  const percent = value !== undefined 
    ? value 
    : (current !== undefined && target !== undefined && target > 0)
      ? Math.min(100, Math.round((current / target) * 100))
      : 0;

  return (
    <div aria-label={label} className="space-y-2">
      <Progress value={percent} />
      <div className="flex justify-between text-xs text-muted-foreground">
        <span>Progress</span>
        <span>{percent}%</span>
      </div>
    </div>
  );
}

