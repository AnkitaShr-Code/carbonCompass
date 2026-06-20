"use client";

import React, { useState, useRef, useEffect } from "react";
import { ChatMessage } from "../../lib/types";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";
import { Send, Trash2, Sparkles, User, Brain } from "lucide-react";

interface ChatPanelProps {
  messages: ChatMessage[];
  isLoading: boolean;
  error: string | null;
  onSendMessage: (text: string) => Promise<void>;
  onClearChat: () => void;
}

export function ChatPanel({
  messages,
  isLoading,
  error,
  onSendMessage,
  onClearChat,
}: ChatPanelProps) {
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    onSendMessage(input);
    setInput("");
  };

  const handleQuickPrompt = (prompt: string) => {
    if (isLoading) return;
    onSendMessage(prompt);
  };

  const quickPrompts = [
    "How do I reduce my transportation emissions?",
    "Give me 3 easy home energy saving tips",
    "What is the carbon impact of a beef meal vs vegan?",
    "Explain waste composting benefits",
  ];

  return (
    <div className="flex flex-col h-[600px] rounded-lg border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3.5 border-b border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-950/20">
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-100 text-primary-800 dark:bg-primary-950/50 dark:text-primary-400">
            <Brain className="h-5 w-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-1.5">
              Eco-Coach AI Assistant
              <span className="flex h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
            </h4>
            <p className="text-[10px] text-gray-500 dark:text-gray-400">Powered by Gemini AI Engine</p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={onClearChat}
          className="text-gray-500 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400"
          title="Clear Chat History"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg) => {
          const isAI = msg.role === "assistant";
          return (
            <div
              key={msg.id}
              className={`flex gap-3 max-w-[85%] ${
                isAI ? "self-start" : "self-end flex-row-reverse ml-auto"
              }`}
            >
              <div
                className={`flex h-8 w-8 shrink-0 select-none items-center justify-center rounded-full text-xs font-semibold ${
                  isAI
                    ? "bg-primary-100 text-primary-800 dark:bg-primary-900/50 dark:text-primary-300"
                    : "bg-accent-100 text-accent-900 dark:bg-accent-900/50 dark:text-accent-300"
                }`}
              >
                {isAI ? <Brain className="h-4 w-4" /> : <User className="h-4 w-4" />}
              </div>
              <div
                className={`rounded-lg px-3.5 py-2 text-sm leading-relaxed ${
                  isAI
                    ? "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200"
                    : "bg-primary-800 text-white dark:bg-primary-500 dark:text-gray-950 font-medium"
                }`}
              >
                {msg.content}
              </div>
            </div>
          );
        })}

        {isLoading && (
          <div className="flex gap-3 max-w-[80%] self-start">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary-100 text-primary-800 dark:bg-primary-900/50 dark:text-primary-300">
              <Brain className="h-4 w-4" />
            </div>
            <div className="rounded-lg bg-gray-100 px-3.5 py-2 text-sm dark:bg-gray-800 text-gray-500 dark:text-gray-400 flex items-center gap-1.5">
              <span>Thinking</span>
              <span className="flex gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-gray-400 dark:bg-gray-600 animate-bounce" />
                <span className="w-1.5 h-1.5 rounded-full bg-gray-400 dark:bg-gray-600 animate-bounce delay-150" />
                <span className="w-1.5 h-1.5 rounded-full bg-gray-400 dark:bg-gray-600 animate-bounce delay-300" />
              </span>
            </div>
          </div>
        )}

        {error && (
          <div className="rounded-md bg-red-50 p-3 text-xs text-red-800 dark:bg-red-950/40 dark:text-red-300 self-center">
            {error}
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Quick suggestions tags */}
      {messages.length <= 1 && !isLoading && (
        <div className="px-4 py-2 bg-gray-50/50 dark:bg-gray-950/10 border-t border-gray-100 dark:border-gray-850">
          <p className="text-[10px] uppercase font-bold text-gray-400 mb-1.5">Suggested Topics</p>
          <div className="flex flex-wrap gap-1.5">
            {quickPrompts.map((p, idx) => (
              <button
                key={idx}
                onClick={() => handleQuickPrompt(p)}
                className="text-xs bg-white border border-gray-200 text-gray-700 rounded-full px-3 py-1 hover:border-primary-500 hover:text-primary-800 dark:bg-gray-900 dark:border-gray-800 dark:text-gray-300 dark:hover:border-primary-400 dark:hover:text-primary-200 transition-colors cursor-pointer select-none"
              >
                {p}
              </button>
            ))}
          </div>
        </div>
      )}

      <form
        onSubmit={handleSend}
        className="flex items-center gap-2 p-3 border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900"
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask about reducing emissions, diet comparison, energy audits..."
          disabled={isLoading}
          className="flex-1 flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 dark:placeholder:text-gray-500 dark:focus-visible:ring-primary-500"
          required
        />
        <button
          type="submit"
          disabled={isLoading || !input.trim()}
          className="h-10 w-10 p-0 shrink-0 inline-flex items-center justify-center font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 select-none cursor-pointer bg-primary-800 hover:bg-primary-900 text-white dark:bg-primary-500 dark:hover:bg-primary-200 dark:hover:text-primary-900 focus-visible:ring-primary-500 rounded-md"
        >
          <Send className="h-4 w-4" />
        </button>
      </form>
    </div>
  );
}
