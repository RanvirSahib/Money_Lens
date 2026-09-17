import { apiRequest, shouldUseMockData } from "./client";
import { mockRadar } from "@/lib/mock/money-lens";
import type { RadarResponse } from "@/types/finance";

export function getRadar(): Promise<RadarResponse> {
  if (shouldUseMockData()) return mockRadar();
  return apiRequest<RadarResponse>("/api/v1/radar");
}
