"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  AssistantMessage,
  WhatIfResult,
  WHATIF_CONFIGS,
} from "../../hooks/useAssistant";
import { InsightResponse, GoalData } from "../../lib/types";
import { InsightCard, WhatIfCard } from "./InsightCard";
import { Send, Trash2, Brain, User, AlertTriangle, RefreshCw } from "lucide-react";

interface ChatPanelProps {
  messages: AssistantMessage[];
  isLoading: boolean;
  error: string | null;
  goals: GoalData | null;
  onSendMessage: (text: string) => void;
  onRunWhatIf: (configId: string) => void;
  onCommit: (title: string) => void;
  onUncommit: (title: string) => void;
  onClearChat: () => void;
  onRetry: () => void;
}

const AI_CHIPS = [
  "How can I reduce food emissions?",
  "Compare me to the average",
  "What was my best day this week?",
];

function isInsightResponse(val: unknown): val is InsightResponse {
  return (
    typeof val === "object" &&
    val !== null &&
    "summary" in val &&
    "actions" in val
  );
}

function isWhatIfResult(val: unknown): val is WhatIfResult {
  return (
    typeof val === "object" &&
    val !== null &&
    (val as WhatIfResult).type === "whatif"
  );
}

export function ChatPanel({
  messages,
  isLoading,
  error,
  goals,
  onSendMessage,
  onRunWhatIf,
  onCommit,
  onUncommit,
  onClearChat,
  onRetry,
}: ChatPanelProps) {
  const [input, setInput] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  const committedActions = goals?.committedActions ?? [];

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading, error]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = input.trim();
    if (!trimmed || isLoading) return;
    onSendMessage(trimmed);
    setInput("");
  };

  const handleChipSend = (text: string) => {
    if (isLoading) return;
    onSendMessage(text);
  };

  const lastMsg = messages[messages.length - 1];
  const showChips =
    !isLoading &&
    !error &&
    lastMsg?.role === "assistant" &&
    messages.length > 0;

  return (
    <div className="flex flex-col h-[680px] rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm overflow-hidden">
      {/* ── Header ── */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-800 bg-gray-50/60 dark:bg-gray-950/30 shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-400 to-emerald-600 text-white">
            <Brain className="h-4.5 w-4.5" aria-hidden="true" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2">
              CarbonCompass AI
              <span
                className="flex h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"
                aria-hidden="true"
              />
            </h4>
            <p className="text-[10px] text-gray-500 dark:text-gray-400">
              Powered by Google Gemini · Data stays on your device
            </p>
          </div>
        </div>
        <button
          onClick={onClearChat}
          title="Clear chat"
          aria-label="Clear chat history"
          className="rounded-lg p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-red-400"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>

      {/* ── Messages ── */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 scroll-smooth">
        {messages.length === 0 && !isLoading && (
          <div className="flex flex-col items-center justify-center h-full text-center text-gray-400 gap-3 py-10">
            <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center text-white">
              <Brain className="h-7 w-7" />
            </div>
            <p className="text-sm font-medium">Your AI coach is warming up…</p>
          </div>
        )}

        {messages.map((msg) => {
          const isAI = msg.role === "assistant";
          const content = msg.content;

          return (
            <div
              key={msg.id}
              className={`flex gap-2.5 ${isAI ? "items-start" : "items-start flex-row-reverse ml-auto max-w-[80%]"}`}
            >
              {/* Avatar */}
              <div
                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${
                  isAI
                    ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-300"
                    : "bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300"
                }`}
                aria-hidden="true"
              >
                {isAI ? <Brain className="h-4 w-4" /> : <User className="h-4 w-4" />}
              </div>

              {/* Bubble */}
              <div className={`max-w-xl ${isAI ? "w-full" : ""}`}>
                {isAI ? (
                  <>
                    {isInsightResponse(content) ? (
                      <InsightCard
                        response={content}
                        committedActions={committedActions}
                        onCommit={onCommit}
                        onUncommit={onUncommit}
                      />
                    ) : isWhatIfResult(content) ? (
                      <WhatIfCard
                        result={content}
                        onCommit={onCommit}
                        committedActions={committedActions}
                      />
                    ) : (
                      <div className="rounded-xl rounded-tl-sm bg-gray-100 dark:bg-gray-800 px-3.5 py-2.5 text-sm text-gray-800 dark:text-gray-200 leading-relaxed">
                        {String(content)}
                      </div>
                    )}
                  </>
                ) : (
                  <div className="rounded-xl rounded-tr-sm bg-emerald-600 text-white px-3.5 py-2.5 text-sm leading-relaxed font-medium">
                    {String(content)}
                  </div>
                )}
                <p className="text-[9px] text-gray-400 mt-1 px-1">
                  {new Date(msg.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </p>
              </div>
            </div>
          );
        })}

        {/* Loading indicator */}
        {isLoading && (
          <div className="flex gap-2.5 items-start">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-300">
              <Brain className="h-4 w-4" aria-hidden="true" />
            </div>
            <div className="rounded-xl rounded-tl-sm bg-gray-100 dark:bg-gray-800 px-4 py-3 flex items-center gap-2">
              <span className="text-xs text-gray-500 dark:text-gray-400">
                CarbonCompass AI is analyzing your data
              </span>
              <span className="flex gap-1" aria-label="Loading">
                {[0, 1, 2].map((i) => (
                  <span
                    key={i}
                    className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-bounce"
                    style={{ animationDelay: `${i * 150}ms` }}
                  />
                ))}
              </span>
            </div>
          </div>
        )}

        {/* Error state */}
        {error && (
          <div className="rounded-xl border border-amber-200 dark:border-amber-800/50 bg-amber-50 dark:bg-amber-950/20 p-3.5 text-xs text-amber-800 dark:text-amber-300 flex items-start justify-between gap-3">
            <div className="flex gap-2 items-start">
              <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" aria-hidden="true" />
              <p className="leading-relaxed">{error}</p>
            </div>
            <button
              onClick={onRetry}
              className="flex items-center gap-1 shrink-0 text-[10px] font-bold text-amber-700 dark:text-amber-400 hover:underline cursor-pointer focus:outline-none"
              aria-label="Retry last message"
            >
              <RefreshCw className="h-3 w-3" />
              Try Again
            </button>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* ── Suggestion chips (shown after last AI message) ── */}
      {showChips && (
        <div className="px-4 py-3 border-t border-gray-100 dark:border-gray-800 bg-gray-50/40 dark:bg-gray-950/20 space-y-2 shrink-0">
          {/* Group 1: AI queries */}
          <div>
            <p className="text-[9px] uppercase font-bold text-gray-400 mb-1.5 tracking-wider">
              Ask CarbonCompass AI
            </p>
            <div className="flex flex-wrap gap-1.5">
              {AI_CHIPS.map((chip) => (
                <button
                  key={chip}
                  onClick={() => handleChipSend(chip)}
                  disabled={isLoading}
                  className="text-[11px] font-medium bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 rounded-full px-3 py-1 hover:border-emerald-400 hover:text-emerald-700 dark:hover:border-emerald-600 dark:hover:text-emerald-400 transition-colors cursor-pointer select-none focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 disabled:opacity-50"
                >
                  {chip}
                </button>
              ))}
            </div>
          </div>

          {/* Group 2: What-If simulations */}
          <div>
            <p className="text-[9px] uppercase font-bold text-gray-400 mb-1.5 tracking-wider">
              What-If Simulations (instant)
            </p>
            <div className="flex flex-wrap gap-1.5">
              {WHATIF_CONFIGS.map((cfg) => (
                <button
                  key={cfg.id}
                  onClick={() => onRunWhatIf(cfg.id)}
                  disabled={isLoading}
                  className="text-[11px] font-medium bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800/60 text-blue-700 dark:text-blue-400 rounded-full px-3 py-1 hover:bg-blue-100 dark:hover:bg-blue-950/40 hover:border-blue-400 transition-colors cursor-pointer select-none focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 disabled:opacity-50"
                >
                  {cfg.emoji} {cfg.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── Input bar ── */}
      <form
        onSubmit={handleSend}
        className="flex items-center gap-2 p-3 border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shrink-0"
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask about your data, request simulations…"
          disabled={isLoading}
          maxLength={500}
          aria-label="Message input"
          className="flex-1 h-10 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 px-3 py-2 text-sm text-gray-900 dark:text-gray-100 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        />
        <button
          type="submit"
          disabled={isLoading || !input.trim()}
          aria-label="Send message"
          className="h-10 w-10 shrink-0 flex items-center justify-center rounded-lg bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2"
        >
          <Send className="h-4 w-4" />
        </button>
      </form>
    </div>
  );
}
