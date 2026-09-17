const publicApiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";
const mockFlag = process.env.NEXT_PUBLIC_USE_MOCK_DATA;

export const API_BASE_URL = publicApiUrl.replace(/\/$/, "");
export const USE_MOCK_DATA = mockFlag === undefined ? true : mockFlag !== "false";

export const ENV = {
  API_URL: API_BASE_URL,
  USE_MOCK_DATA: USE_MOCK_DATA,
};
