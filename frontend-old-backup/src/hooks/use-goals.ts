import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createGoal, getGoals } from "@/lib/api/goals";

export function useGoals() {
  return useQuery({
    queryKey: ["money-lens", "goals"],
    queryFn: getGoals,
  });
}

export function useCreateGoal() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createGoal,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["money-lens", "goals"] });
    },
  });
}
