import { useState, useEffect, useCallback, useRef } from "react";
import { AIInsightRequest, AIInsightResponse } from "@/types/ai";
import { fetchAIInsights, getLocalAIInsightFallback } from "@/lib/api/ai";

export function useAIInsights(initialPayload: AIInsightRequest) {
  const [data, setData] = useState<AIInsightResponse>(() =>
    getLocalAIInsightFallback(initialPayload)
  );
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const payloadString = JSON.stringify(initialPayload);
  const prevPayloadRef = useRef<string>("");

  const refreshInsights = useCallback(async (payload: AIInsightRequest) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetchAIInsights(payload);
      setData(response);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load AI insights");
      setData(getLocalAIInsightFallback(payload));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (prevPayloadRef.current === payloadString) return;
    prevPayloadRef.current = payloadString;

    const timer = setTimeout(() => {
      try {
        const payloadObj = JSON.parse(payloadString) as AIInsightRequest;
        refreshInsights(payloadObj);
      } catch {
        // no-op
      }
    }, 400); // 400ms debounce to avoid spamming while dragging sliders

    return () => clearTimeout(timer);
  }, [payloadString, refreshInsights]);

  return {
    insights: data,
    loading,
    error,
    refresh: () => refreshInsights(initialPayload),
  };
}
