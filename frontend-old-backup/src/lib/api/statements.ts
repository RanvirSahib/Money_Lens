import { apiRequest, shouldUseMockData } from "./client";
import { StatementSummary } from "@/types";

export async function uploadStatement(
  file: File,
  saveRaw: boolean,
  userId: string = "usr_demo_01"
): Promise<StatementSummary> {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("save_raw", String(saveRaw));
  formData.append("user_id", userId);

  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8000";
  const res = await fetch(`${baseUrl}/api/v1/statements/upload`, {
    method: "POST",
    body: formData,
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: "Upload failed" }));
    throw new Error(err.detail || "Failed to process statement.");
  }

  return res.json();
}

export async function getStatementHistory(userId: string = "usr_demo_01"): Promise<StatementSummary[]> {
  if (shouldUseMockData()) {
    return [];
  }
  return apiRequest<StatementSummary[]>(`/api/v1/statements/history?user_id=${encodeURIComponent(userId)}`);
}
