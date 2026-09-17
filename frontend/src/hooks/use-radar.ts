import { useQuery } from "@tanstack/react-query";
import { getRadar } from "@/lib/api/radar";

export function useRadar() {
  return useQuery({
    queryKey: ["money-lens", "radar"],
    queryFn: getRadar,
  });
}
