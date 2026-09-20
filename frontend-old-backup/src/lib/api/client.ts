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
  return false;
}

export async function apiRequest<T>(path: string, init?: RequestInit): Promise<T> {
  if (!API_BASE_URL) {
    throw new MoneyLensApiError("The backend API URL is not configured.");
  }

  try {
    const response = await fetch(`${API_BASE_URL}${path}`, {
      ...init,
      headers: {
        "Content-Type": "application/json",
        ...(init?.headers ?? {}),
      },
    });

    if (!response.ok) {
      let errorMsg = `Server error (${response.status})`;
      try {
        const errorData = await response.json();
        if (errorData.detail) {
          if (Array.isArray(errorData.detail)) {
            errorMsg = errorData.detail.map((e: any) => `${e.loc ? e.loc.join('.') + ': ' : ''}${e.msg}`).join('; ');
          } else if (typeof errorData.detail === 'string') {
            errorMsg = errorData.detail;
          }
        }
      } catch {
        // Fallback to generic message
      }
      throw new MoneyLensApiError(errorMsg, response.status);
    }

    return (await response.json()) as T;
  } catch (err: any) {
    if (err instanceof MoneyLensApiError) {
      throw err;
    }
    throw new MoneyLensApiError(
      err?.message?.includes("fetch")
        ? `MoneyLens backend connection issue at ${API_BASE_URL}. Ensure the service is active.`
        : err?.message || "An unexpected network error occurred."
    );
  }
}
