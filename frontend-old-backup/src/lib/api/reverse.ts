import { apiRequest, shouldUseMockData } from "./client";
import { mockReverse } from "@/lib/mock/money-lens";
import type { ReverseRequest, ReverseResult } from "@/types/finance";

export function calculateReversePath(request: ReverseRequest): Promise<ReverseResult> {
  if (shouldUseMockData()) return mockReverse(request);
  return apiRequest<ReverseResult>("/api/v1/reverse", {
    method: "POST",
    body: JSON.stringify(request),
  });
}
