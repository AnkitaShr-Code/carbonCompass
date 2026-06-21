"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import {
  getActivities,
  getProfile,
  getGoals,
  saveGoals,
  getChatHistory,
  saveChatHistory,
} from "../lib/storage";
import {
  getTotalForPeriod,
  getCategoryBreakdown,
  getCompassScore,
  getPotentialSavings,
  getEquivalences,
} from "../lib/carbonUtils";
import { sanitizeString } from "../lib/sanitize";
import { InsightResponse, GoalData, ActivityEntry } from "../lib/types";
import { DAILY_BUDGET_1_5C } from "../lib/emissionFactors";

// ─── Message types ────────────────────────────────────────────────────────────

export type MessageRole = "user" | "assistant";

export interface WhatIfResult {
  type: "whatif";
  fromSubtype: string;
  toSubtype: string;
  fromLabel: string;
  toLabel: string;
  savingKgPerWeek: number;
  hasData: boolean;
  equivalentTrees: number;
  committed: boolean;
}

export interface AssistantMessage {
  id: string;
  role: MessageRole;
  /** Plain text for user messages; InsightResponse for AI messages; WhatIfResult for simulations */
  content: string | InsightResponse | WhatIfResult;
  timestamp: number;
  /** If true, this is the hidden auto-analysis prompt — never render it */
  hidden?: boolean;
}

// ─── Context assembly ─────────────────────────────────────────────────────────

function buildContext(streak: number) {
  const activities = getActivities();
  const profile = getProfile();

  const now = new Date();
  const weekStart = new Date(now);
  weekStart.setDate(now.getDate() - 6);
  weekStart.setHours(0, 0, 0, 0);

  const recentActivities: ActivityEntry[] = activities.filter(
    (a) => new Date(a.timestamp).getTime() >= weekStart.getTime()
  );

  const weeklyTotal = getTotalForPeriod(activities, weekStart, now);
  const categoryBreakdown = getCategoryBreakdown(activities, weekStart, now);

  // Top category
  const topCategoryEntry = Object.entries(categoryBreakdown).sort((a, b) => b[1] - a[1])[0];
  const topCategory = topCategoryEntry?.[0] ?? "";

  // Top subtype
  const subtypeTotals: Record<string, number> = {};
  recentActivities.forEach((a) => {
    subtypeTotals[a.subtype] = (subtypeTotals[a.subtype] || 0) + a.co2e;
  });
  const topSubtypeEntry = Object.entries(subtypeTotals).sort((a, b) => b[1] - a[1])[0];
  const topSubtype = topSubtypeEntry?.[0] ?? "";

  const compassScore = getCompassScore(activities, streak);
  const potentialSavings = profile ? getPotentialSavings(profile, activities) : [];

  return {
    profile: profile ?? {
      name: "User",
      country: "usa" as const,
      lifestyle: "city" as const,
      commute: "car" as const,
      diet: "some_meat" as const,
      energySource: "grid" as const,
      setupComplete: false,
    },
    recentActivities,
    weeklyTotal,
    topCategory,
    topSubtype,
    categoryBreakdown: categoryBreakdown as Record<string, number>,
    streak,
    compassScore,
    potentialSavings,
  };
}

// ─── What-If simulation (deterministic, no API) ───────────────────────────────

const WHATIF_CONFIGS: {
  id: string;
  label: string;
  emoji: string;
  fromSubtype: string;
  toSubtype: string;
  fromLabel: string;
  toLabel: string;
  category: "transport" | "food" | "energy";
}[] = [
  {
    id: "bus",
    label: "What if I take the bus instead of driving?",
    emoji: "💡",
    fromSubtype: "car_petrol",
    toSubtype: "bus",
    fromLabel: "Petrol car",
    toLabel: "Bus",
    category: "transport",
  },
  {
    id: "legumes",
    label: "What if I replace beef with legumes?",
    emoji: "🥗",
    fromSubtype: "beef",
    toSubtype: "legumes",
    fromLabel: "Beef",
    toLabel: "Legumes",
    category: "food",
  },
  {
    id: "electricity",
    label: "What if I cut electricity use by 20%?",
    emoji: "⚡",
    fromSubtype: "electricity_any",
    toSubtype: "electricity_reduced",
    fromLabel: "Current electricity",
    toLabel: "20% less electricity",
    category: "energy",
  },
];

export { WHATIF_CONFIGS };

// ─── Storage key for messages ─────────────────────────────────────────────────

const MESSAGES_KEY = "carboncompass_insights_messages_v2";

function loadMessages(): AssistantMessage[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(MESSAGES_KEY);
    return raw ? (JSON.parse(raw) as AssistantMessage[]) : [];
  } catch {
    return [];
  }
}

function persistMessages(msgs: AssistantMessage[]) {
  if (typeof window === "undefined") return;
  try {
    // Only persist last 40 messages to avoid bloat
    localStorage.setItem(MESSAGES_KEY, JSON.stringify(msgs.slice(-40)));
  } catch {}
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

/**
 * Hook to manage AI assistant state and interactions, including chat history,
 * context building, and API calls to the Insights endpoint.
 *
 * @returns State and functions to interact with the AI assistant.
 */
export function useAssistant() {
  const [messages, setMessages] = useState<AssistantMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [goals, setGoals] = useState<GoalData | null>(null);
  const didAutoAnalyze = useRef(false);

  // Streak derived from consecutive logged days
  const [streak] = useState<number>(() => {
    if (typeof window === "undefined") return 0;
    const activities = getActivities();
    // Simple streak: count consecutive days backward from today
    let s = 0;
    const now = new Date();
    for (let i = 0; i < 30; i++) {
      const day = new Date(now);
      day.setDate(now.getDate() - i);
      day.setHours(0, 0, 0, 0);
      const dayEnd = new Date(day);
      dayEnd.setHours(23, 59, 59, 999);
      const hasEntry = activities.some((a) => {
        const ms = new Date(a.timestamp).getTime();
        return ms >= day.getTime() && ms <= dayEnd.getTime();
      });
      if (hasEntry) s++;
      else if (i > 0) break;
    }
    return s;
  });

  // Load messages + goals on mount
  useEffect(() => {
    const stored = loadMessages();
    setMessages(stored);
    setGoals(getGoals());
    setIsLoaded(true);
  }, []);

  // Auto-analyze on first mount if no messages yet
  useEffect(() => {
    if (!isLoaded || didAutoAnalyze.current) return;
    const stored = loadMessages();
    if (stored.length === 0) {
      didAutoAnalyze.current = true;
      sendMessage(
        "Analyze my carbon footprint data and give me my top 3 personalized recommendations for this week",
        true // hidden = don't show user bubble
      );
    } else {
      didAutoAnalyze.current = true;
    }
  }, [isLoaded]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Send a regular AI message ──────────────────────────────────────────────
  const sendMessage = useCallback(
    async (text: string, hidden = false) => {
      const sanitized = sanitizeString(text, 500);
      if (!sanitized) return;

      setError(null);
      setIsLoading(true);

      const userMsg: AssistantMessage = {
        id: crypto.randomUUID?.() ?? Math.random().toString(36).slice(2),
        role: "user",
        content: sanitized,
        timestamp: Date.now(),
        hidden,
      };

      setMessages((prev) => {
        const next = hidden ? prev : [...prev, userMsg];
        persistMessages(next);
        return next;
      });

      try {
        const context = buildContext(streak);

        const res = await fetch("/api/insights", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ message: sanitized, context }),
        });

        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          throw new Error(
            (errData as { error?: string }).error ||
              `Server error: ${res.status}`
          );
        }

        const data: InsightResponse = await res.json();

        const aiMsg: AssistantMessage = {
          id: crypto.randomUUID?.() ?? Math.random().toString(36).slice(2),
          role: "assistant",
          content: data,
          timestamp: Date.now(),
        };

        setMessages((prev) => {
          const next = [...prev, aiMsg];
          persistMessages(next);
          return next;
        });
      } catch (err: unknown) {
        console.error("Insights fetch error:", err);
        setError(
          err instanceof Error
            ? err.message
            : "Network error — please check your connection and try again."
        );
      } finally {
        setIsLoading(false);
      }
    },
    [streak]
  );

  // ── Run a What-If simulation (pure math, no API) ───────────────────────────
  const runWhatIf = useCallback(
    (configId: string) => {
      const config = WHATIF_CONFIGS.find((c) => c.id === configId);
      if (!config) return;

      const activities = getActivities();
      const now = new Date();
      const weekStart = new Date(now);
      weekStart.setDate(now.getDate() - 6);
      weekStart.setHours(0, 0, 0, 0);

      const recentActivities = activities.filter(
        (a) => new Date(a.timestamp).getTime() >= weekStart.getTime()
      );

      let savingKgPerWeek = 0;
      let hasData = false;

      if (config.id === "bus") {
        const carKm = recentActivities
          .filter((a) => a.subtype === "car_petrol")
          .reduce((s, a) => s + a.quantity, 0);
        hasData = carKm > 0;
        if (hasData) {
          savingKgPerWeek = parseFloat(((0.21 - 0.089) * carKm).toFixed(2));
        }
      } else if (config.id === "legumes") {
        const beefKg = recentActivities
          .filter((a) => a.subtype === "beef")
          .reduce((s, a) => s + a.quantity, 0);
        hasData = beefKg > 0;
        if (hasData) {
          savingKgPerWeek = parseFloat(((27.0 - 0.9) * beefKg).toFixed(2));
        }
      } else if (config.id === "electricity") {
        const elecSubtypes = [
          "electricity_in",
          "electricity_uk",
          "electricity_us",
          "electricity_de",
          "electricity_au",
        ];
        const elecEntries = recentActivities.filter((a) =>
          elecSubtypes.includes(a.subtype)
        );
        hasData = elecEntries.length > 0;
        if (hasData) {
          savingKgPerWeek = parseFloat(
            (elecEntries.reduce((s, a) => s + a.co2e * 0.2, 0)).toFixed(2)
          );
        }
      }

      const equiv = getEquivalences(savingKgPerWeek);

      const result: WhatIfResult = {
        type: "whatif",
        fromSubtype: config.fromSubtype,
        toSubtype: config.toSubtype,
        fromLabel: config.fromLabel,
        toLabel: config.toLabel,
        savingKgPerWeek,
        hasData,
        equivalentTrees: equiv.trees,
        committed: false,
      };

      // Inject as assistant message (no user bubble for What-If)
      const aiMsg: AssistantMessage = {
        id: crypto.randomUUID?.() ?? Math.random().toString(36).slice(2),
        role: "assistant",
        content: result,
        timestamp: Date.now(),
      };

      setMessages((prev) => {
        const next = [...prev, aiMsg];
        persistMessages(next);
        return next;
      });
    },
    []
  );

  // ── Commit an action to GoalData ──────────────────────────────────────────
  const commitAction = useCallback((actionTitle: string) => {
    setGoals((prev) => {
      const current = prev ?? {
        weeklyTargetKg: DAILY_BUDGET_1_5C * 7,
        committedActions: [],
        badges: [],
      };
      if (current.committedActions.includes(actionTitle)) return current;
      const updated: GoalData = {
        ...current,
        committedActions: [...current.committedActions, actionTitle],
      };
      saveGoals(updated);
      return updated;
    });
  }, []);

  // ── Uncommit an action ────────────────────────────────────────────────────
  const uncommitAction = useCallback((actionTitle: string) => {
    setGoals((prev) => {
      if (!prev) return prev;
      const updated: GoalData = {
        ...prev,
        committedActions: prev.committedActions.filter((a) => a !== actionTitle),
      };
      saveGoals(updated);
      return updated;
    });
  }, []);

  // ── Clear chat ────────────────────────────────────────────────────────────
  const clearChat = useCallback(() => {
    setMessages([]);
    persistMessages([]);
    setError(null);
    didAutoAnalyze.current = false;
    // Re-trigger auto-analysis
    setTimeout(() => {
      sendMessage(
        "Analyze my carbon footprint data and give me my top 3 personalized recommendations for this week",
        true
      );
    }, 100);
  }, [sendMessage]);

  return {
    messages: messages.filter((m) => !m.hidden),
    isLoading,
    error,
    isLoaded,
    goals,
    sendMessage: (text: string) => sendMessage(text, false),
    runWhatIf,
    commitAction,
    uncommitAction,
    clearChat,
  };
}
