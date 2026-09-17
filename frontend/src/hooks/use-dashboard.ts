import { useQuery } from "@tanstack/react-query";
import { getDashboard } from "@/lib/api/dashboard";

export function useDashboard() {
  return useQuery({
    queryKey: ["money-lens", "dashboard"],
    queryFn: getDashboard,
  });
}
