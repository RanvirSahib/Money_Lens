import { API_BASE_URL, USE_MOCK_DATA } from "@/config/env";

export class MoneyLensApiError extends Error {
  status?: number;

  constructor(message: string, status?: number) {
    super(message);
    this.name = "MoneyLensApiError";
    this.status = status;
  }
}

export function shouldUseMockData(): boolean {
  return USE_MOCK_DATA || API_BASE_URL.length === 0;
}

export async function apiRequest<T>(path: string, init?: RequestInit): Promise<T> {
  if (!API_BASE_URL) {
    throw new MoneyLensApiError("The backend API URL is not configured.");
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
  });

  if (!response.ok) {
    throw new MoneyLensApiError("Something went wrong while contacting Money Lens.", response.status);
  }

  return response.json() as Promise<T>;
}
