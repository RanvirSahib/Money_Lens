import { useMutation, useQuery } from "@tanstack/react-query";
import { runExperiment } from "@/lib/api/experiments";
import type { ExperimentRequest } from "@/types/finance";

export const demoExperimentRequest: ExperimentRequest = {
  scenarios: [
    { id: "a", name: "Scenario A", scenarioType: "buy_now", summary: "Buy the phone now", inputs: ["₹80,000 purchase", "Immediate outflow"] },
    { id: "b", name: "Scenario B", scenarioType: "emi", summary: "Use EMI", inputs: ["12-month repayment", "Recurring monthly impact"] },
    { id: "c", name: "Scenario C", scenarioType: "save_first", summary: "Wait and save", inputs: ["Delay purchase", "Preserve buffer"] },
  ],
};

export function useDemoExperiment() {
  return useQuery({
    queryKey: ["money-lens", "experiment", "demo-phone"],
    queryFn: () => runExperiment(demoExperimentRequest),
  });
}

export function useExperiment() {
  return useMutation({ mutationFn: runExperiment });
}
