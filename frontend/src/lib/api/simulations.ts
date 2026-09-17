import { apiRequest, shouldUseMockData } from "./client";
import { mockSimulation } from "@/lib/mock/money-lens";
import type { SimulationRequest, SimulationResult } from "@/types/finance";

export function runSimulation(request: SimulationRequest): Promise<SimulationResult> {
  if (shouldUseMockData()) return mockSimulation(request);
  return apiRequest<SimulationResult>("/api/v1/simulations", {
    method: "POST",
    body: JSON.stringify(request),
  });
}

export function getSimulation(id: string): Promise<SimulationResult> {
  if (shouldUseMockData()) return mockSimulation();
  return apiRequest<SimulationResult>(`/api/v1/simulations/${id}`);
}
