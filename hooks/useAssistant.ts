"use client";

import { useState, useEffect, useCallback } from "react";
import { ChatMessage } from "../lib/types";
import { getChatHistory, saveChatHistory } from "../lib/storage";
import { sanitizeString } from "../lib/sanitize";

const WELCOME_MESSAGE: ChatMessage = {
  id: "welcome",
  role: "assistant",
  content: "Hello! I am your CarbonCompass AI Coach. I can help you understand your carbon footprint and give you personalized tips to live a more sustainable lifestyle. Ask me anything, or ask for ideas on reducing transportation, food, energy, or waste emissions!",
  timestamp: Date.now(),
};

export function useAssistant() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  // Initialize messages on mount (Client Side only)
  useEffect(() => {
    const loadedHistory = getChatHistory([WELCOME_MESSAGE]);
    setMessages(loadedHistory);
    setIsLoaded(true);
  }, []);

  const saveMessages = useCallback((newMessages: ChatMessage[]) => {
    setMessages(newMessages);
    saveChatHistory(newMessages);
  }, []);

  const sendMessage = useCallback(async (content: string) => {
    const sanitized = sanitizeString(content, 2000);
    if (!sanitized) return;

    setError(null);
    setIsLoading(true);

    const userMessage: ChatMessage = {
      id: Math.random().toString(36).substring(2, 11),
      role: "user",
      content: sanitized,
      timestamp: Date.now(),
    };

    const newMessages = [...messages, userMessage];
    saveMessages(newMessages);

    try {
      const response = await fetch("/api/insights", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: newMessages.map(m => ({
            role: m.role,
            content: m.content
          })),
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to generate insights: ${response.statusText}`);
      }

      const data = await response.json();
      
      const assistantMessage: ChatMessage = {
        id: Math.random().toString(36).substring(2, 11),
        role: "assistant",
        content: data.reply || "I'm sorry, I couldn't process that request.",
        timestamp: Date.now(),
      };

      saveMessages([...newMessages, assistantMessage]);
    } catch (err: any) {
      console.error("AI Coach assistant error:", err);
      setError(err?.message || "An unexpected network error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }, [messages, saveMessages]);

  const clearChat = useCallback(() => {
    saveMessages([WELCOME_MESSAGE]);
    setError(null);
  }, [saveMessages]);

  return {
    messages,
    isLoading,
    error,
    isLoaded,
    sendMessage,
    clearChat,
  };
}
