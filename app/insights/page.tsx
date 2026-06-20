"use client";

import React from "react";
import { useAssistant } from "../../hooks/useAssistant";
import { ChatPanel } from "../../components/insights/ChatPanel";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "../../components/ui/Card";
import { Sparkles, Brain, Leaf, Award } from "lucide-react";

export default function InsightsPage() {
  const {
    messages,
    isLoading,
    error,
    isLoaded,
    sendMessage,
    clearChat,
  } = useAssistant();

  if (!isLoaded) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-500 border-t-transparent mx-auto" />
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">Booting AI Coach...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h2 className="text-2xl font-extrabold tracking-tight text-gray-900 dark:text-white sm:text-3xl">
          AI Sustainability Coach
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Get real-time feedback, comparisons, and custom hacks from our Google Gemini-backed assistant.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-4">
        {/* Chat Interface (Colspan 3) */}
        <div className="lg:col-span-3">
          <ChatPanel
            messages={messages}
            isLoading={isLoading}
            error={error}
            onSendMessage={sendMessage}
            onClearChat={clearChat}
          />
        </div>

        {/* Informational Sidebar */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-1.5 text-primary-800 dark:text-primary-400">
                <Sparkles className="h-4.5 w-4.5 animate-pulse" />
                Coach Highlights
              </CardTitle>
              <CardDescription>How the AI assistant guides your carbon journey:</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 text-xs text-gray-600 dark:text-gray-400">
              <div className="flex gap-2.5">
                <div className="flex h-6 w-6 items-center justify-center rounded bg-primary-100 text-primary-800 dark:bg-primary-950/50 dark:text-primary-400 shrink-0">
                  <Leaf className="h-3.5 w-3.5" />
                </div>
                <div>
                  <h5 className="font-bold text-gray-900 dark:text-white">Active Recommendations</h5>
                  <p className="mt-0.5 leading-relaxed">Asks and recommends customized alternatives depending on your transport and heating fuel parameters.</p>
                </div>
              </div>

              <div className="flex gap-2.5">
                <div className="flex h-6 w-6 items-center justify-center rounded bg-accent-100 text-accent-900 dark:bg-accent-950/50 dark:text-accent-400 shrink-0">
                  <Brain className="h-3.5 w-3.5" />
                </div>
                <div>
                  <h5 className="font-bold text-gray-900 dark:text-white">Carbon Science</h5>
                  <p className="mt-0.5 leading-relaxed">Answers complex queries on emission math, greenhouse gas types, and global offsetting benchmarks.</p>
                </div>
              </div>

              <div className="flex gap-2.5">
                <div className="flex h-6 w-6 items-center justify-center rounded bg-purple-100 text-purple-900 dark:bg-purple-950/30 dark:text-purple-400 shrink-0">
                  <Award className="h-3.5 w-3.5" />
                </div>
                <div>
                  <h5 className="font-bold text-gray-900 dark:text-white">Challenge Generation</h5>
                  <p className="mt-0.5 leading-relaxed">Request structured checklists for a zero-waste month, carpooling options, or vegetarian food planning.</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
