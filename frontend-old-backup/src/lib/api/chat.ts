import { apiRequest, shouldUseMockData } from "./client";
import { ChatMessage, PendingActionPayload } from "@/types";

export interface ChatMessageApiResponse {
  message_id: string;
  session_id: string;
  reply: string;
  action_payload?: PendingActionPayload;
  evidence?: string;
  relevant_metrics?: Record<string, any>;
  suggested_followups: string[];
}

export async function sendChatMessage(
  message: string,
  sessionId?: string,
  userId: string = "usr_demo_01"
): Promise<ChatMessageApiResponse> {
  if (shouldUseMockData()) {
    const msgLower = message.toLowerCase();
    if (msgLower.includes("salary") || msgLower.includes("income")) {
      return {
        message_id: "msg_mock_01",
        session_id: sessionId || "sess_mock",
        reply: "I noticed an update to your monthly income. Would you like me to update your baseline profile?",
        action_payload: {
          action_type: "UPDATE_PROFILE",
          title: "Profile Update Detected",
          description: "Update reported monthly income to ₹95,000",
          data: { monthly_income: 95000, field: "Monthly Income" },
        },
        evidence: "Reported in chat message: ₹95,000",
        suggested_followups: ["Confirm update", "Cancel", "What will my surplus be?"],
      };
    }
    return {
      message_id: "msg_mock_02",
      session_id: sessionId || "sess_mock",
      reply: "Your current baseline surplus is ₹40,000/month with an emergency runway of 4.3 months. How can I assist with your simulations or goals today?",
      suggested_followups: ["Simulate a purchase", "View spending insights", "Create a goal"],
    };
  }

  return apiRequest<ChatMessageApiResponse>("/api/v1/chat/message", {
    method: "POST",
    body: JSON.stringify({
      message,
      session_id: sessionId,
      user_id: userId,
      include_statement_insights: true,
    }),
  });
}

export async function confirmChatAction(
  actionType: "UPDATE_PROFILE" | "CREATE_GOAL",
  data: Record<string, any>,
  userId: string = "usr_demo_01"
): Promise<{ status: string; message: string; updated_entity: any }> {
  if (shouldUseMockData()) {
    return {
      status: "success",
      message: `${actionType === "UPDATE_PROFILE" ? "Profile" : "Goal"} successfully updated.`,
      updated_entity: data,
    };
  }

  return apiRequest<{ status: string; message: string; updated_entity: any }>("/api/v1/chat/confirm-action", {
    method: "POST",
    body: JSON.stringify({
      action_type: actionType,
      data,
      user_id: userId,
    }),
  });
}
