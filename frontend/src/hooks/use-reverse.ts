import { useMutation, useQuery } from "@tanstack/react-query";
import { calculateReversePath } from "@/lib/api/reverse";
import type { ReverseRequest } from "@/types/finance";

const demoReverseRequest: ReverseRequest = {
  targetAmount: 100000,
  currentSavings: 40000,
  targetDate: "2027-03-01",
};

export function useDemoReversePath() {
  return useQuery({
    queryKey: ["money-lens", "reverse", "demo"],
    queryFn: () => calculateReversePath(demoReverseRequest),
  });
}

export function useReversePath() {
  return useMutation({ mutationFn: calculateReversePath });
}
