import { useState, useRef, useEffect, useCallback } from "react";
import { Bot, Send, X, Check, AlertCircle, Sparkles, RotateCcw, RefreshCw } from "lucide-react";
import { useChatbot } from "@/hooks/use-money-lens";
import { getCurrentUserId } from "@/lib/api-client";
import { currency } from "@/lib/dashboard-data";
import { cn } from "@/lib/utils";

interface ChatMessage {
  id: string;
  sender: "user" | "assistant" | "system";
  text: string;
  timestamp: string;
  action_payload?: {
    action_type: "UPDATE_PROFILE" | "CREATE_GOAL" | "CREATE_EMI" | "CREATE_SUBSCRIPTION" | "CREATE_INVESTMENT" | "NONE";
    title: string;
    description: string;
    data: Record<string, any>;
    confirmed?: boolean;
  };
  evidence?: string;
  suggested_followups?: string[];
}

const DEFAULT_WELCOME_MESSAGE: ChatMessage = {
  id: "welcome",
  sender: "assistant",
  text: "Hello. I am the Monexa Assistant. Ask me about your surplus, simulate a purchase, explore spending trends, or update your profile via natural language.",
  timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
  suggested_followups: [
    "My salary increased to ₹95,000",
    "Update the liquid cash to 10000",
    "What is my monthly surplus?",
    "Break down my spending",
  ],
};

function getMsgStorageKey(uid: string) {
  return `monexa_chat_messages_${uid}`;
}

function getSessStorageKey(uid: string) {
  return `monexa_chat_session_${uid}`;
}

function getStoredMessages(uid: string): ChatMessage[] {
  if (typeof window !== "undefined") {
    try {
      const key = getMsgStorageKey(uid);
      const stored = sessionStorage.getItem(key) || localStorage.getItem(key);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn("Failed to retrieve stored chat messages:", e);
    }
  }
  return [DEFAULT_WELCOME_MESSAGE];
}

function getStoredSessionId(uid: string): string {
  if (typeof window !== "undefined") {
    try {
      const key = getSessStorageKey(uid);
      const stored = sessionStorage.getItem(key) || localStorage.getItem(key);
      if (stored) return stored;
    } catch (e) {
      // ignore
    }
  }
  return `sess_${Math.random().toString(36).substring(2, 10)}`;
}

export function LovableChatDrawer({
  isOpen,
  onClose,
  initialPrompt,
}: {
  isOpen: boolean;
  onClose: () => void;
  initialPrompt?: string;
}) {
  const { sendMessage, confirmAction } = useChatbot();
  const currentUserId = getCurrentUserId();
  const [sessionId, setSessionId] = useState<string>(() => getStoredSessionId(currentUserId));
  const [messages, setMessages] = useState<ChatMessage[]>(() => getStoredMessages(currentUserId));
  const [input, setInput] = useState(initialPrompt || "");
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // Re-initialize chat messages and session when user changes (e.g. login/logout)
  const refreshUserChat = useCallback(() => {
    const uid = getCurrentUserId();
    const freshMessages = getStoredMessages(uid);
    const freshSession = getStoredSessionId(uid);
    setMessages(freshMessages);
    setSessionId(freshSession);
  }, []);

  useEffect(() => {
    refreshUserChat();
  }, [currentUserId, refreshUserChat]);

  // Listen to custom auth change events to immediately refresh chat
  useEffect(() => {
    const handleAuthChange = () => {
      refreshUserChat();
    };
    window.addEventListener("monexa_auth_change", handleAuthChange);
    window.addEventListener("storage", handleAuthChange);
    return () => {
      window.removeEventListener("monexa_auth_change", handleAuthChange);
      window.removeEventListener("storage", handleAuthChange);
    };
  }, [refreshUserChat]);

  // Sync messages to persistent browser storage whenever they update
  useEffect(() => {
    if (typeof window !== "undefined" && messages.length > 0 && currentUserId) {
      try {
        const key = getMsgStorageKey(currentUserId);
        sessionStorage.setItem(key, JSON.stringify(messages));
        localStorage.setItem(key, JSON.stringify(messages));
      } catch (e) {
        console.warn("Failed to persist chat messages:", e);
      }
    }
  }, [messages, currentUserId]);

  // Sync sessionId to storage
  useEffect(() => {
    if (typeof window !== "undefined" && sessionId && currentUserId) {
      try {
        const key = getSessStorageKey(currentUserId);
        sessionStorage.setItem(key, sessionId);
        localStorage.setItem(key, sessionId);
      } catch (e) {
        // ignore
      }
    }
  }, [sessionId, currentUserId]);

  useEffect(() => {
    if (initialPrompt) {
      setInput(initialPrompt);
    }
  }, [initialPrompt]);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isOpen]);

  const handleClearChat = () => {
    const uid = getCurrentUserId();
    const newSessionId = `sess_${Math.random().toString(36).substring(2, 10)}`;
    setSessionId(newSessionId);
    const initial = [
      {
        ...DEFAULT_WELCOME_MESSAGE,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      },
    ];
    setMessages(initial);
    if (typeof window !== "undefined") {
      try {
        const msgKey = getMsgStorageKey(uid);
        const sessKey = getSessStorageKey(uid);
        sessionStorage.setItem(msgKey, JSON.stringify(initial));
        sessionStorage.setItem(sessKey, newSessionId);
        localStorage.setItem(msgKey, JSON.stringify(initial));
        localStorage.setItem(sessKey, newSessionId);
      } catch (e) {
        // ignore
      }
    }
  };

  const handleSend = async (textToSend?: string) => {
    const text = (textToSend || input).trim();
    if (!text || sendMessage.isPending) return;

    const userMsg: ChatMessage = {
      id: `usr_${Date.now()}`,
      sender: "user",
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");

    try {
      const res = await sendMessage.mutateAsync({ message: text, sessionId });
      
      // If action was confirmed via natural language, mark all previous pending actions as confirmed
      if (res.action_payload?.confirmed || res.relevant_metrics?.confirmed) {
        setMessages((prev) =>
          prev.map((m) =>
            m.action_payload && !m.action_payload.confirmed
              ? { ...m, action_payload: { ...m.action_payload, confirmed: true } }
              : m
          )
        );
      }

      const asstMsg: ChatMessage = {
        id: res.message_id || `asst_${Date.now()}`,
        sender: "assistant",
        text: res.reply,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        action_payload: res.action_payload,
        evidence: res.evidence,
        suggested_followups: res.suggested_followups,
      };
      setMessages((prev) => [...prev, asstMsg]);
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        {
          id: `err_${Date.now()}`,
          sender: "system",
          text: err.message || "Failed to reach intelligence layer.",
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        },
      ]);
    }
  };

  const handleConfirm = async (msgId: string, action: any) => {
    try {
      await confirmAction.mutateAsync({
        actionType: action.action_type,
        data: action.data,
      });
      setMessages((prev) =>
        prev.map((m) =>
          m.id === msgId && m.action_payload
            ? { ...m, action_payload: { ...m.action_payload, confirmed: true } }
            : m
        )
      );
    } catch (err) {
      console.error(err);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-foreground/20 backdrop-blur-xs transition-opacity duration-300">
      <div className="w-full max-w-md bg-surface-elevated border-l border-border h-full flex flex-col shadow-2xl animate-scale-in duration-300">
        {/* Header */}
        <div className="px-5 py-4 border-b border-border flex items-center justify-between bg-surface-muted/50">
          <div className="flex items-center gap-2.5">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-xs animate-float">
              <Sparkles className="h-4 w-4" />
            </span>
            <div>
              <h2 className="text-sm font-semibold tracking-tight text-foreground">Monexa Assistant</h2>
              <p className="text-[11px] text-subtle-foreground font-mono">Grounded Financial Reasoning</p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={handleClearChat}
              title="Start New Chat (Clear History)"
              className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-surface border border-transparent hover:border-border cursor-pointer transition-all duration-200 active:scale-90"
            >
              <RotateCcw className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={onClose}
              title="Close Assistant"
              className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-surface border border-transparent hover:border-border cursor-pointer transition-all duration-200 active:scale-90"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Message Thread */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={cn(
                "flex flex-col space-y-1.5 animate-fade-in-up",
                msg.sender === "user" ? "items-end" : "items-start"
              )}
            >
              <div
                className={cn(
                  "max-w-[85%] rounded-2xl px-4 py-3 text-xs leading-relaxed transition-all duration-200",
                  msg.sender === "user"
                    ? "bg-primary text-primary-foreground font-medium shadow-xs"
                    : msg.sender === "system"
                    ? "bg-risk-soft text-risk border border-border"
                    : "bg-surface-muted text-foreground border border-border/80 shadow-xs"
                )}
              >
                <p className="whitespace-pre-wrap">{msg.text}</p>
                {msg.evidence && (
                  <div className="mt-2 pt-2 border-t border-border/60 text-[11px] text-subtle-foreground font-mono">
                    <span className="font-semibold text-foreground">Evidence: </span>
                    {msg.evidence}
                  </div>
                )}
              </div>

              {/* Action Confirmation Card */}
              {msg.action_payload && !msg.action_payload.confirmed && (
                <div className="w-full max-w-[90%] rounded-xl border border-primary/40 bg-primary-soft/90 p-3.5 space-y-2.5 shadow-sm animate-scale-in">
                  <span className="text-[10px] font-bold uppercase tracking-wider bg-primary text-primary-foreground px-2 py-0.5 rounded-md shadow-xs">
                    {msg.action_payload.title || "Action Detected"}
                  </span>
                  <p className="text-xs text-foreground font-medium">{msg.action_payload.description}</p>
                  <div className="flex gap-2 pt-1">
                    <button
                      onClick={() => handleConfirm(msg.id, msg.action_payload)}
                      disabled={confirmAction.isPending}
                      className="inline-flex items-center gap-1.5 rounded-lg bg-primary text-primary-foreground px-3 py-1.5 text-xs font-semibold cursor-pointer shadow-xs hover:opacity-90 active:scale-95 transition-all duration-150"
                    >
                      <Check className="h-3 w-3" />
                      <span>{confirmAction.isPending ? "Applying..." : "Confirm Update"}</span>
                    </button>
                    <button
                      onClick={() =>
                        setMessages((prev) =>
                          prev.map((m) => (m.id === msg.id ? { ...m, action_payload: undefined } : m))
                        )
                      }
                      className="rounded-lg border border-border bg-surface px-3 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground cursor-pointer active:scale-95 transition-all duration-150"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              {msg.action_payload?.confirmed && (
                <div className="flex items-center gap-1.5 text-[11px] text-positive font-semibold px-1 animate-fade-in-up">
                  <Check className="h-3.5 w-3.5" />
                  <span>Action executed and engine recalibrated</span>
                </div>
              )}

              {msg.suggested_followups && msg.suggested_followups.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-1.5">
                  {msg.suggested_followups.map((chip, i) => (
                    <button
                      key={i}
                      onClick={() => handleSend(chip)}
                      className="px-2.5 py-1 text-[11px] font-medium rounded-lg bg-surface border border-border text-muted-foreground hover:text-foreground hover:border-primary/40 hover:bg-primary-soft/40 cursor-pointer text-left transition-all duration-150 hover:scale-[1.02] active:scale-95 shadow-2xs"
                    >
                      {chip}
                    </button>
                  ))}
                </div>
              )}

              <span className="text-[10px] text-subtle-foreground font-mono">{msg.timestamp}</span>
            </div>
          ))}

          {sendMessage.isPending && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground font-mono animate-fade-in-up">
              <div className="w-2 h-2 rounded-full bg-primary animate-ping" />
              <span>Synthesizing calculation telemetry...</span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Footer */}
        <div className="p-4 border-t border-border bg-surface-elevated">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask anything or update financial parameters..."
              className="flex-1 rounded-xl border border-border bg-background px-3.5 py-2.5 text-xs font-medium focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-200"
            />
            <button
              type="submit"
              disabled={sendMessage.isPending || !input.trim()}
              className="p-2.5 rounded-xl bg-primary text-primary-foreground hover:opacity-90 disabled:opacity-40 cursor-pointer shadow-xs active:scale-95 transition-all duration-150"
            >
              <Send className="h-4 w-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

