'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Bot, 
  Send, 
  X, 
  Sparkles, 
  CheckCircle2, 
  XCircle, 
  AlertCircle, 
  TrendingUp, 
  Target, 
  User, 
  HelpCircle,
  ArrowRight
} from 'lucide-react';
import { ChatMessage, PendingActionPayload } from '@/types';
import { sendChatMessage, confirmChatAction } from '@/lib/api/chat';
import { formatINR } from '@/lib/utils/currency';

interface FinancialChatbotDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onProfileUpdated?: () => void;
  onGoalCreated?: () => void;
}

export const FinancialChatbotDrawer: React.FC<FinancialChatbotDrawerProps> = ({
  isOpen,
  onClose,
  onProfileUpdated,
  onGoalCreated,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      sender: 'assistant',
      text: 'Hello! I am Money Lens Assistant. I can help explore your financial profile, simulate purchase decisions, analyze spending patterns, or update your parameters via natural language.',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      suggested_followups: [
        'My salary increased to ₹95,000',
        'I want to save for a ₹5 lakh car',
        'What is my monthly surplus?',
        'Break down my spending',
      ],
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [actionProcessingId, setActionProcessingId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  const handleSend = async (textToSend?: string) => {
    const text = (textToSend || inputValue).trim();
    if (!text || isSending) return;

    const userMsg: ChatMessage = {
      id: `user_${Date.now()}`,
      sender: 'user',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputValue('');
    setIsSending(true);

    try {
      const res = await sendChatMessage(text);
      const assistantMsg: ChatMessage = {
        id: res.message_id || `asst_${Date.now()}`,
        sender: 'assistant',
        text: res.reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        action_payload: res.action_payload,
        evidence: res.evidence,
        relevant_metrics: res.relevant_metrics,
        suggested_followups: res.suggested_followups,
      };
      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err: any) {
      const errorMsg: ChatMessage = {
        id: `err_${Date.now()}`,
        sender: 'system',
        text: err.message || 'Failed to reach financial reasoning engine.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsSending(false);
    }
  };

  const handleConfirmAction = async (msgId: string, action: PendingActionPayload) => {
    setActionProcessingId(msgId);
    try {
      if (action.action_type === 'UPDATE_PROFILE') {
        await confirmChatAction('UPDATE_PROFILE', action.data);
        if (onProfileUpdated) onProfileUpdated();
      } else if (action.action_type === 'CREATE_GOAL') {
        await confirmChatAction('CREATE_GOAL', action.data);
        if (onGoalCreated) onGoalCreated();
      }

      // Mark message action as confirmed
      setMessages((prev) =>
        prev.map((m) => {
          if (m.id === msgId && m.action_payload) {
            return {
              ...m,
              action_payload: { ...m.action_payload, confirmed: true },
            };
          }
          return m;
        })
      );
    } catch (err: any) {
      console.error('Failed to confirm action:', err);
    } finally {
      setActionProcessingId(null);
    }
  };

  const handleCancelAction = (msgId: string) => {
    setMessages((prev) =>
      prev.map((m) => {
        if (m.id === msgId) {
          return { ...m, action_payload: undefined };
        }
        return m;
      })
    );
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden flex justify-end bg-slate-900/30 backdrop-blur-xs">
      <motion.div
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'spring', damping: 28, stiffness: 280 }}
        className="w-full max-w-lg bg-white h-full shadow-2xl flex flex-col border-l border-slate-200"
      >
        {/* Chat Drawer Header */}
        <div className="px-6 py-4 border-b border-slate-200/80 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-xs">
              <Bot className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900">
                Money Lens Assistant
              </h2>
              <p className="text-[11px] text-slate-500 font-mono">
                Context-Grounded Financial Reasoning
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Message Thread Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'} space-y-1.5`}
            >
              <div
                className={`max-w-[85%] rounded-2xl p-4 text-xs leading-relaxed ${
                  msg.sender === 'user'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : msg.sender === 'system'
                    ? 'bg-rose-50 border border-rose-200 text-rose-800'
                    : 'bg-slate-50 border border-slate-200/80 text-slate-800'
                }`}
              >
                <p className="whitespace-pre-wrap">{msg.text}</p>

                {/* Evidence snippet */}
                {msg.evidence && (
                  <div className="mt-2.5 pt-2 border-t border-slate-200/60 text-[11px] text-slate-500 font-mono">
                    <span className="font-semibold text-slate-700">Evidence: </span>
                    {msg.evidence}
                  </div>
                )}
              </div>

              {/* Natural Language Confirmation Action Card */}
              {msg.action_payload && !msg.action_payload.confirmed && (
                <div className="w-full max-w-[90%] bg-emerald-50/80 border border-emerald-200 rounded-2xl p-4 shadow-xs space-y-3 mt-1">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-emerald-600 text-white rounded">
                      {msg.action_payload.title || 'Action Detected'}
                    </span>
                  </div>

                  <p className="text-xs text-emerald-950 font-medium leading-relaxed">
                    {msg.action_payload.description}
                  </p>

                  <div className="flex items-center gap-2 pt-1">
                    <button
                      onClick={() => handleConfirmAction(msg.id, msg.action_payload!)}
                      disabled={actionProcessingId === msg.id}
                      className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl shadow-xs transition-colors cursor-pointer disabled:opacity-50"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>{actionProcessingId === msg.id ? 'Applying...' : 'Confirm Update'}</span>
                    </button>

                    <button
                      onClick={() => handleCancelAction(msg.id)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-700 text-xs font-medium rounded-xl border border-slate-200 transition-colors cursor-pointer"
                    >
                      <XCircle className="w-3.5 h-3.5 text-slate-400" />
                      <span>Cancel</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Confirmed Indicator */}
              {msg.action_payload?.confirmed && (
                <div className="flex items-center gap-1.5 text-[11px] text-emerald-600 font-medium px-2">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Action executed and engine recalibrated</span>
                </div>
              )}

              {/* Suggested Followups Chips */}
              {msg.suggested_followups && msg.suggested_followups.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-2 pt-1">
                  {msg.suggested_followups.map((chip, i) => (
                    <button
                      key={i}
                      onClick={() => handleSend(chip)}
                      className="px-2.5 py-1 text-[11px] font-medium bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors cursor-pointer text-left"
                    >
                      {chip}
                    </button>
                  ))}
                </div>
              )}

              <span className="text-[10px] text-slate-400 px-1 font-mono">
                {msg.timestamp}
              </span>
            </div>
          ))}

          {isSending && (
            <div className="flex items-center gap-2 text-xs text-slate-400 p-2">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="font-mono">Synthesizing deterministic calculations...</span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <div className="p-4 border-t border-slate-200/80 bg-white">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Ask about spending, update salary, or plan a goal..."
              className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:border-emerald-500 focus:bg-white transition-all"
            />
            <button
              type="submit"
              disabled={isSending || !inputValue.trim()}
              className="p-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl transition-colors cursor-pointer disabled:opacity-40"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </motion.div>
    </div>
  );
};
