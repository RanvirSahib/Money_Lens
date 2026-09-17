import { useMutation, useQuery } from "@tanstack/react-query";
import { getSimulation, runSimulation } from "@/lib/api/simulations";

export function useDemoSimulation() {
  return useQuery({
    queryKey: ["money-lens", "simulation", "demo-phone"],
    queryFn: () => getSimulation("demo-phone"),
  });
}

export function useSimulation() {
  return useMutation({ mutationFn: runSimulation });
}
