import { apiRequest, shouldUseMockData } from "./client";
import { mockExperiment } from "@/lib/mock/money-lens";
import type { ExperimentRequest, ExperimentResult } from "@/types/finance";

export function runExperiment(request: ExperimentRequest): Promise<ExperimentResult> {
  if (shouldUseMockData()) return mockExperiment(request);
  return apiRequest<ExperimentResult>("/api/v1/experiments", {
    method: "POST",
    body: JSON.stringify(request),
  });
}
