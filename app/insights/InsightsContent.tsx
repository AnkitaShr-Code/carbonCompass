"use client";

import React, { useCallback, useRef } from "react";
import { useAssistant } from "../../hooks/useAssistant";
import { ChatPanel } from "../../components/insights/ChatPanel";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../components/ui/Card";
import {
  getTotalForPeriod,
  getCompassScore,
  getEquivalences,
} from "../../lib/carbonUtils";
import { getActivities } from "../../lib/storage";
import { DAILY_BUDGET_1_5C } from "../../lib/emissionFactors";
import {
  Sparkles,
  TrendingDown,
  TrendingUp,
  CheckCircle2,
  Award,
} from "lucide-react";
import Link from "next/link";

// ─── Committed Actions checklist ──────────────────────────────────────────────

function CommittedActionsPanel({
  committedActions,
  onUncommit,
}: {
  committedActions: string[];
  onUncommit: (title: string) => void;
}) {
  const total = 3; // target
  const done = committedActions.length;
  const allDone = done >= total;

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Award className="h-4 w-4 text-emerald-500" />
          My Committed Actions
        </CardTitle>
        <CardDescription>
          {done} of {total} actions committed this week
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Progress bar */}
        <div className="h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-emerald-500 rounded-full transition-all duration-500"
            style={{ width: `${Math.min((done / total) * 100, 100)}%` }}
          />
        </div>

        {allDone && (
          <div className="rounded-xl bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/50 p-3 text-xs text-emerald-800 dark:text-emerald-300 font-medium">
            🎉 All actions committed! Check your{" "}
            <Link href="/goals" className="underline font-bold hover:no-underline">
              Goals page
            </Link>{" "}
            for badge progress.
          </div>
        )}

        {committedActions.length === 0 ? (
          <p className="text-xs text-gray-400 dark:text-gray-500 italic">
            No actions committed yet. Click "Commit to this" on any AI recommendation.
          </p>
        ) : (
          <ul className="space-y-2" role="list" aria-label="Committed actions">
            {committedActions.map((action) => (
              <li
                key={action}
                className="flex items-start gap-2 text-xs text-gray-700 dark:text-gray-300"
              >
                <CheckCircle2
                  className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5"
                  aria-hidden="true"
                />
                <span className="flex-1 leading-relaxed">{action}</span>
                <button
                  onClick={() => onUncommit(action)}
                  className="text-[10px] text-gray-400 hover:text-red-500 dark:hover:text-red-400 transition-colors cursor-pointer focus:outline-none shrink-0"
                  aria-label={`Remove commitment: ${action}`}
                >
                  ✕
                </button>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}

// ─── Insight page ─────────────────────────────────────────────────────────────

export default function InsightsContent() {
  const {
    messages,
    isLoading,
    error,
    isLoaded,
    goals,
    sendMessage,
    runWhatIf,
    commitAction,
    uncommitAction,
    clearChat,
  } = useAssistant();

  // For retry — re-send the last user message
  const lastUserMsg = [...messages].reverse().find((m) => m.role === "user");
  const handleRetry = useCallback(() => {
    if (lastUserMsg && typeof lastUserMsg.content === "string") {
      sendMessage(lastUserMsg.content);
    }
  }, [lastUserMsg, sendMessage]);

  // ── Week-at-a-glance stats (computed client-side from localStorage) ────────
  const now = new Date();
  const weekStart = new Date(now);
  weekStart.setDate(now.getDate() - 6);
  weekStart.setHours(0, 0, 0, 0);

  const activities = isLoaded ? getActivities() : [];
  const weekKg = getTotalForPeriod(activities, weekStart, now);
  const budgetDiff = DAILY_BUDGET_1_5C - weekKg / 7;
  const budgetGood = budgetDiff >= 0;

  // Top category
  const catTotals: Record<string, number> = {};
  activities
    .filter((a) => new Date(a.timestamp).getTime() >= weekStart.getTime())
    .forEach((a) => { catTotals[a.category] = (catTotals[a.category] || 0) + a.co2e; });
  const topCat = Object.entries(catTotals).sort((a, b) => b[1] - a[1])[0];
  const topCatLabel = topCat ? `${topCat[0]} (${topCat[1].toFixed(1)} kg)` : "None yet";

  if (!isLoaded) {
    return (
      <div className="flex h-[60vh] items-center justify-center animate-pulse">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent mx-auto" />
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">Booting AI Coach…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* ── Page header ── */}
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight text-gray-900 dark:text-white sm:text-3xl">
          AI Sustainability Coach
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Personalized insights powered by Google Gemini · Pre-calculated savings via your real data
        </p>
      </div>

      {/* ── Section 1: Week at a glance ── */}
      <div className="grid grid-cols-3 gap-3">
        <Card className="border-l-4 border-l-emerald-500">
          <CardContent className="pt-4 pb-4">
            <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
              This Week
            </p>
            <p className="mt-1 text-xl font-black text-gray-900 dark:text-white">
              {weekKg.toFixed(2)}{" "}
              <span className="text-xs font-semibold text-gray-400">kg CO₂e</span>
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-amber-500">
          <CardContent className="pt-4 pb-4">
            <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
              Top Category
            </p>
            <p className="mt-1 text-sm font-bold text-gray-900 dark:text-white capitalize truncate">
              {topCatLabel}
            </p>
          </CardContent>
        </Card>

        <Card
          className={`border-l-4 ${budgetGood ? "border-l-emerald-500" : "border-l-red-500"}`}
        >
          <CardContent className="pt-4 pb-4">
            <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
              vs. Daily Budget
            </p>
            <div
              className={`mt-1 flex items-center gap-1 text-sm font-bold ${
                budgetGood
                  ? "text-emerald-600 dark:text-emerald-400"
                  : "text-red-600 dark:text-red-400"
              }`}
            >
              {budgetGood ? (
                <TrendingDown className="h-4 w-4" aria-hidden="true" />
              ) : (
                <TrendingUp className="h-4 w-4" aria-hidden="true" />
              )}
              {Math.abs(budgetDiff).toFixed(2)} kg/day{" "}
              {budgetGood ? "under ✓" : "over ⚠"}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ── Section 2: Main layout — Chat (main) + sidebar ── */}
      <div className="grid gap-5 lg:grid-cols-4">
        {/* Chat panel — 3 cols */}
        <div className="lg:col-span-3">
          <ChatPanel
            messages={messages}
            isLoading={isLoading}
            error={error}
            goals={goals}
            onSendMessage={sendMessage}
            onRunWhatIf={runWhatIf}
            onCommit={commitAction}
            onUncommit={uncommitAction}
            onClearChat={clearChat}
            onRetry={handleRetry}
          />
        </div>

        {/* Sidebar — 1 col */}
        <div className="space-y-4">
          {/* ── Section 3: Committed actions ── */}
          <CommittedActionsPanel
            committedActions={goals?.committedActions ?? []}
            onUncommit={uncommitAction}
          />

          {/* Coach highlights */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-emerald-500 animate-pulse" />
                How it works
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-xs text-gray-600 dark:text-gray-400">
              <div className="space-y-1">
                <h2 className="font-bold text-gray-800 dark:text-gray-200 text-xs">🔢 Math first, AI second</h2>
                <p className="leading-relaxed">
                  All savings numbers are calculated deterministically from your real data — Gemini only writes the personalized text.
                </p>
              </div>
              <div className="space-y-1">
                <h2 className="font-bold text-gray-800 dark:text-gray-200 text-xs">⚡ What-If simulations</h2>
                <p className="leading-relaxed">
                  Instant (no API call) — pure math based on your logged activities from the last 7 days.
                </p>
              </div>
              <div className="space-y-1">
                <h2 className="font-bold text-gray-800 dark:text-gray-200 text-xs">🔒 Privacy-first</h2>
                <p className="leading-relaxed">
                  Your data stays in your browser. Only anonymized summaries are sent to the AI.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
