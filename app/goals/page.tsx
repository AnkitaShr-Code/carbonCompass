"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  BusFront,
  CheckCircle2,
  Clock,
  Flame,
  Leaf,
  Shield,
  ShieldAlert,
  Sparkles,
  Sprout,
  Target,
  TrendingDown,
  TrendingUp,
  Trophy,
} from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../components/ui/Card";
import { DAILY_BUDGET_1_5C } from "../../lib/emissionFactors";
import {
  BADGES,
  calculateStreak,
  checkBadges,
  getWeeklyComparison,
} from "../../lib/badgeUtils";
import { getTotalForPeriod } from "../../lib/carbonUtils";
import { sanitizeNumber } from "../../lib/sanitize";
import { getActivities, getGoals, saveGoals } from "../../lib/storage";
import { BadgeStatus, GoalData } from "../../lib/types";

// ─── Badge icon map ───────────────────────────────────────────────────────────

const BADGE_ICON_MAP: Record<string, React.ElementType> = {
  Sprout,
  Flame,
  BusFront,
  Leaf,
  TrendingDown,
  Shield,
};

const BADGE_COLOR_MAP: Record<string, { icon: string; bg: string; border: string; ring: string }> = {
  first_log:    { icon: "text-emerald-700 dark:text-emerald-300", bg: "bg-emerald-100 dark:bg-emerald-900/40",   border: "border-emerald-300 dark:border-emerald-700",   ring: "shadow-emerald-300/50" },
  streak_7:     { icon: "text-orange-700 dark:text-orange-300",   bg: "bg-orange-100 dark:bg-orange-900/40",     border: "border-orange-300 dark:border-orange-700",     ring: "shadow-orange-300/50"  },
  car_free_week:{ icon: "text-blue-700 dark:text-blue-300",       bg: "bg-blue-100 dark:bg-blue-900/40",         border: "border-blue-300 dark:border-blue-700",         ring: "shadow-blue-300/50"    },
  plant_week:   { icon: "text-green-700 dark:text-green-300",     bg: "bg-green-100 dark:bg-green-900/40",       border: "border-green-300 dark:border-green-700",       ring: "shadow-green-300/50"   },
  ten_pct_drop: { icon: "text-teal-700 dark:text-teal-300",       bg: "bg-teal-100 dark:bg-teal-900/40",         border: "border-teal-300 dark:border-teal-700",         ring: "shadow-teal-300/50"    },
  budget_hero:  { icon: "text-purple-700 dark:text-purple-300",   bg: "bg-purple-100 dark:bg-purple-900/40",     border: "border-purple-300 dark:border-purple-700",     ring: "shadow-purple-300/50"  },
};

// ─── BadgeCard ────────────────────────────────────────────────────────────────

function BadgeCard({ status, def }: { status: BadgeStatus; def: typeof BADGES[0] }) {
  const Icon = BADGE_ICON_MAP[def.icon] ?? Trophy;
  const colors = BADGE_COLOR_MAP[status.id] ?? BADGE_COLOR_MAP["first_log"]!;

  return (
    <div
      className={`relative rounded-2xl border p-5 flex flex-col gap-3 transition-all duration-300 ${
        status.unlocked
          ? `${colors.border} bg-white dark:bg-gray-800 scale-[1.02] shadow-lg ${colors.ring}`
          : "border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 grayscale opacity-55 dark:opacity-40"
      }`}
      style={
        status.unlocked
          ? {
              boxShadow: `0 0 0 2px var(--tw-shadow-color, #d1fae5), 0 8px 24px -4px rgba(0,0,0,0.12)`,
            }
          : undefined
      }
      aria-label={`${status.name}: ${status.unlocked ? "Unlocked" : "Locked"}`}
    >
      {/* Unlocked glow ring */}
      {status.unlocked && (
        <div
          className="absolute inset-0 rounded-2xl pointer-events-none"
          style={{
            background: "linear-gradient(135deg, rgba(255,255,255,0.08) 0%, transparent 60%)",
            border: "2px solid rgba(255,255,255,0.15)",
          }}
          aria-hidden="true"
        />
      )}

      {/* Icon */}
      <div className="flex items-center justify-between">
        <div className={`rounded-xl p-3 ${colors.bg}`}>
          <Icon
            className={`h-6 w-6 ${status.unlocked ? colors.icon : "text-gray-400"}`}
            strokeWidth={1.8}
            aria-hidden="true"
          />
        </div>
        {status.unlocked ? (
          <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 px-2 py-0.5 rounded-full">
            ✓ Unlocked
          </span>
        ) : (
          <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400 bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded-full">
            Locked
          </span>
        )}
      </div>

      {/* Name & description */}
      <div>
        <p className={`text-sm font-bold ${status.unlocked ? "text-gray-900 dark:text-white" : "text-gray-500 dark:text-gray-300"}`}>
          {status.name}
        </p>
        <p className="text-[11px] text-gray-500 dark:text-gray-300 mt-0.5 leading-snug">
          {status.description}
        </p>
      </div>

      {/* Progress bar (locked only) */}
      {!status.unlocked && (
        <div>
          <div className="h-1.5 w-full bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-gray-400 dark:bg-gray-500 rounded-full transition-all duration-500"
              style={{ width: `${status.progress}%` }}
            />
          </div>
          <p className="text-[10px] text-gray-400 dark:text-gray-300 mt-1">{status.progress}% complete</p>
        </div>
      )}
    </div>
  );
}

// ─── WeeklyGoalSection ────────────────────────────────────────────────────────

function WeeklyGoalSection({
  weeklyKg,
  target,
  onTargetChange,
}: {
  weeklyKg: number;
  target: number;
  onTargetChange: (v: number) => void;
}) {
  const pctUsed = target > 0 ? (weeklyKg / target) * 100 : 0;
  const exceeded = weeklyKg > target;
  const overBy = weeklyKg - target;

  const barColor = exceeded
    ? "bg-red-500"
    : pctUsed >= 80
    ? "bg-amber-500"
    : "bg-emerald-500";

  const barWidth = Math.min(pctUsed, 100);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Target className="h-4 w-4 text-emerald-500" />
          Weekly Emissions Goal
        </CardTitle>
        <CardDescription>
          Set your weekly CO₂e target and track progress
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        {/* Target input */}
        <div className="flex items-center gap-3 flex-wrap">
          <label
            htmlFor="weekly-target-input"
            className="text-xs font-bold text-gray-600 dark:text-gray-300 shrink-0"
          >
            Weekly target (kg CO₂e):
          </label>
          <input
            id="weekly-target-input"
            type="number"
            min={1}
            max={500}
            value={target}
            onChange={(e) => {
              const v = parseFloat(e.target.value);
              if (!isNaN(v) && v >= 1 && v <= 500) onTargetChange(v);
            }}
            className="w-24 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-1.5 text-sm font-bold text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 text-center"
            aria-label="Weekly target in kg CO₂e"
            required
            aria-required="true"
          />
          <span className="text-[10px] text-gray-400 dark:text-gray-300">
            (1.5°C budget = {(DAILY_BUDGET_1_5C * 7).toFixed(0)} kg/week)
          </span>
        </div>

        {/* Progress bar */}
        <div className="space-y-2">
          <div className="h-4 w-full bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-700 ${barColor}`}
              style={{ width: `${barWidth}%` }}
            />
          </div>

          {/* Status text */}
          {exceeded ? (
            <div className="flex items-center gap-1.5 text-red-600 dark:text-red-400 font-bold text-sm">
              <AlertTriangle className="h-4 w-4" aria-hidden="true" />
              Exceeded by {overBy.toFixed(2)} kg ⚠
            </div>
          ) : (
            <p className={`text-sm font-bold ${pctUsed >= 80 ? "text-amber-600 dark:text-amber-400" : "text-emerald-600 dark:text-emerald-400"}`}>
              {weeklyKg.toFixed(2)} kg of {target.toFixed(1)} kg goal — {pctUsed.toFixed(0)}% used
              {pctUsed >= 80 && !exceeded && " ⚠ Almost at limit"}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// ─── StreakSection ────────────────────────────────────────────────────────────

function StreakSection({ streak, loggedToday }: { streak: number; loggedToday: boolean }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Flame
            className={`h-4 w-4 text-orange-500 ${streak > 0 ? "animate-pulse" : ""}`}
          />
          Activity Streak
        </CardTitle>
        <CardDescription>Consecutive days with at least one activity logged</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col items-center gap-4 py-4">
        {/* Big streak number */}
        <div className="flex items-center gap-3">
          <div
            className={`text-7xl font-black tabular-nums tracking-tight ${
              streak > 0 ? "text-orange-500 dark:text-orange-400" : "text-gray-300 dark:text-gray-600"
            }`}
            aria-label={`${streak} day streak`}
          >
            {streak}
          </div>
          <div className="text-left">
            <p className="text-lg font-bold text-gray-700 dark:text-gray-300">
              {streak === 1 ? "day" : "days"}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-300">current streak</p>
          </div>
        </div>

        {/* Flame row */}
        {streak > 0 && (
          <div className="flex items-center gap-1">
            {Array.from({ length: Math.min(streak, 7) }).map((_, i) => (
              <Flame
                key={i}
                className={`h-5 w-5 ${i < streak ? "text-orange-500" : "text-gray-300"}`}
                aria-hidden="true"
              />
            ))}
            {streak > 7 && (
              <span className="text-xs font-bold text-orange-500 ml-1">+{streak - 7}</span>
            )}
          </div>
        )}

        {/* Warning if streak > 0 and not logged today */}
        {streak > 0 && !loggedToday && (
          <div className="flex items-center gap-2 rounded-xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/50 px-4 py-2.5 text-xs text-amber-800 dark:text-amber-300 font-semibold">
            <Clock className="h-4 w-4 shrink-0" aria-hidden="true" />
            Log today to keep your streak!
          </div>
        )}

        {streak === 0 && (
          <p className="text-xs text-gray-500 dark:text-gray-300 text-center">
            Log an activity today to start your streak 🌱
          </p>
        )}
      </CardContent>
    </Card>
  );
}

// ─── WeeklySummaryCard ────────────────────────────────────────────────────────

function WeeklySummaryCard({
  thisWeek,
  lastWeek,
  changePercent,
  bestDayLabel,
  bestDayKg,
}: {
  thisWeek: number;
  lastWeek: number;
  changePercent: number;
  bestDayLabel: string;
  bestDayKg: number;
}) {
  const improved = changePercent < 0;
  const noData = lastWeek === 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          {improved ? (
            <TrendingDown className="h-4 w-4 text-emerald-500" />
          ) : (
            <TrendingUp className="h-4 w-4 text-amber-500" />
          )}
          Weekly Summary
        </CardTitle>
        <CardDescription>How this week compares to last</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Summary text */}
        <div className="rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700 p-4 text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
          {noData ? (
            <p>
              This week you emitted{" "}
              <strong className="text-gray-900 dark:text-white">{thisWeek.toFixed(2)} kg</strong> CO₂e.
              No data from last week to compare yet.{" "}
              {bestDayLabel !== "—" && (
                <>
                  Your best day so far was{" "}
                  <strong className="text-emerald-700 dark:text-emerald-400">{bestDayLabel}</strong>{" "}
                  at {bestDayKg} kg.
                </>
              )}
            </p>
          ) : (
            <p>
              This week you emitted{" "}
              <strong className="text-gray-900 dark:text-white">{thisWeek.toFixed(2)} kg</strong> CO₂e.
              That&rsquo;s{" "}
              <strong
                className={improved ? "text-emerald-700 dark:text-emerald-400" : "text-amber-700 dark:text-amber-400"}
              >
                {Math.abs(changePercent)}% {improved ? "less" : "more"}
              </strong>{" "}
              than last week ({lastWeek.toFixed(2)} kg).
              {bestDayLabel !== "—" && (
                <>
                  {" "}Your best day was{" "}
                  <strong className="text-emerald-700 dark:text-emerald-400">{bestDayLabel}</strong>{" "}
                  at {bestDayKg} kg.
                </>
              )}
            </p>
          )}
        </div>

        {/* Stat pills */}
        <div className="flex gap-3 flex-wrap">
          <div className="rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 px-3 py-2">
            <p className="text-[10px] font-bold uppercase text-gray-400 tracking-wider">This week</p>
            <p className="text-lg font-black text-gray-900 dark:text-white">{thisWeek.toFixed(2)} kg</p>
          </div>
          <div className="rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 px-3 py-2">
            <p className="text-[10px] font-bold uppercase text-gray-400 tracking-wider">Last week</p>
            <p className="text-lg font-black text-gray-900 dark:text-white">
              {lastWeek > 0 ? `${lastWeek.toFixed(2)} kg` : "—"}
            </p>
          </div>
          {!noData && (
            <div className={`rounded-lg border px-3 py-2 ${improved ? "bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800/50" : "bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800/50"}`}>
              <p className="text-[10px] font-bold uppercase text-gray-400 tracking-wider">Change</p>
              <p className={`text-lg font-black ${improved ? "text-emerald-700 dark:text-emerald-400" : "text-amber-700 dark:text-amber-400"}`}>
                {improved ? "" : "+"}{changePercent}%
              </p>
            </div>
          )}
        </div>

        {/* CTA */}
        <Link
          href="/insights"
          className="inline-flex items-center gap-2 w-full justify-center rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-bold px-4 py-2.5 text-sm transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
          aria-label="Get AI suggestions for this week"
        >
          <Sparkles className="h-4 w-4" aria-hidden="true" />
          Get AI suggestions for this week
        </Link>
      </CardContent>
    </Card>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function GoalsPage() {
  const [isLoaded, setIsLoaded] = useState(false);
  const [activities, setActivities] = useState<ReturnType<typeof getActivities>>([]);
  const [goals, setGoals] = useState<GoalData | null>(null);
  const [weeklyTarget, setWeeklyTarget] = useState<number>(DAILY_BUDGET_1_5C * 7);

  useEffect(() => {
    const acts = getActivities();
    const savedGoals = getGoals();
    setActivities(acts);
    setGoals(savedGoals);

    // Default target: 10% below 4-week rolling average, min 5 kg
    if (savedGoals?.weeklyTargetKg) {
      setWeeklyTarget(savedGoals.weeklyTargetKg);
    } else {
      const fourWeeksAgo = new Date();
      fourWeeksAgo.setDate(fourWeeksAgo.getDate() - 28);
      const fourWeekTotal = getTotalForPeriod(acts, fourWeeksAgo, new Date());
      const rollingAvg = fourWeekTotal / 4;
      const suggested = Math.max(5, parseFloat((rollingAvg * 0.9).toFixed(1)));
      setWeeklyTarget(suggested > 0 ? suggested : DAILY_BUDGET_1_5C * 7);
    }

    setIsLoaded(true);
  }, []);

  const handleTargetChange = useCallback(
    (newTarget: number) => {
      // Clamp to valid range before persisting
      const safe = sanitizeNumber(newTarget, 1, 500);
      if (safe === null) return;
      setWeeklyTarget(safe);
      const current = goals ?? {
        weeklyTargetKg: safe,
        committedActions: [],
        badges: [],
      };
      const updated: GoalData = { ...current, weeklyTargetKg: safe };
      saveGoals(updated);
      setGoals(updated);
    },
    [goals]
  );

  // Derived state
  const now = useMemo(() => new Date(), [activities]); // force dependency if needed, but normally just new Date()
  const weekStart = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() - 6);
    d.setHours(0, 0, 0, 0);
    return d;
  }, [activities]); // simple way to not break dependencies

  const weeklyKg = useMemo(() => getTotalForPeriod(activities, weekStart, new Date()), [activities, weekStart]);
  const streak = useMemo(() => calculateStreak(activities), [activities]);
  const comparison = useMemo(() => getWeeklyComparison(activities), [activities]);
  const badgeStatuses = useMemo(() => checkBadges(activities), [activities]);

  if (!isLoaded) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent mx-auto" />
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-300">
            Loading goals & achievements…
          </p>
        </div>
      </div>
    );
  }

  // Did user log anything today?
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const loggedToday = activities.some(
    (a) => new Date(a.timestamp).getTime() >= todayStart.getTime()
  );

  const committedActions = goals?.committedActions ?? [];

  return (
    <div className="space-y-8 animate-fade-in">
      {/* ── Page header ── */}
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight text-gray-900 dark:text-white sm:text-3xl">
          Goals & Achievements
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-300 mt-1">
          Track your weekly target, streak, and badge progress
        </p>
      </div>

      {/* Visually hidden status region for screen reader badge unlock announcements */}
      <div role="status" aria-live="polite" className="sr-only">
        {badgeStatuses
          .filter((b) => b.unlocked)
          .map((b) => `Badge unlocked: ${b.name}`)
          .join(". ")}
      </div>

      {/* ── Row 1: Weekly goal + Streak side by side ── */}
      <div className="grid gap-5 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <WeeklyGoalSection
            weeklyKg={weeklyKg}
            target={weeklyTarget}
            onTargetChange={handleTargetChange}
          />
        </div>
        <StreakSection streak={streak} loggedToday={loggedToday} />
      </div>

      {/* ── Row 2: Badge grid (2×3) ── */}
      <div>
        <h2 className="text-base font-bold text-gray-800 dark:text-gray-200 mb-4 flex items-center gap-2">
          <Trophy className="h-4 w-4 text-amber-500" />
          Sustainability Badges
          <span className="text-xs font-semibold text-gray-400 ml-1">
            ({badgeStatuses.filter((b) => b.unlocked).length}/{badgeStatuses.length} unlocked)
          </span>
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {BADGES.map((def, i) => {
            const status = badgeStatuses[i] ?? {
              id: def.id,
              name: def.name,
              description: def.description,
              unlocked: false,
              progress: 0,
            };
            return <BadgeCard key={def.id} status={status} def={def} />;
          })}
        </div>
      </div>

      {/* ── Row 3: Weekly summary + committed actions ── */}
      <div className="grid gap-5 lg:grid-cols-2">
        <WeeklySummaryCard
          thisWeek={comparison.thisWeek}
          lastWeek={comparison.lastWeek}
          changePercent={comparison.changePercent}
          bestDayLabel={comparison.bestDayLabel}
          bestDayKg={comparison.bestDayKg}
        />

        {/* Committed actions from insights page */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <CheckCircle2 className="h-4 w-4 text-emerald-500" />
              Committed Climate Actions
            </CardTitle>
            <CardDescription>
              Actions committed from AI recommendations
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {committedActions.length > 0 ? (
              <>
                <div className="space-y-2">
                  {committedActions.map((title, i) => (
                    <div
                      key={i}
                      className="flex items-start gap-2.5 rounded-xl border border-emerald-100 dark:border-emerald-900/50 bg-emerald-50/60 dark:bg-emerald-950/10 p-3"
                    >
                      <CheckCircle2
                        className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5"
                        aria-hidden="true"
                      />
                      <p className="text-xs font-semibold text-gray-800 dark:text-gray-200 leading-relaxed">
                        {title}
                      </p>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-300">
                  {committedActions.length} of 3 recommended actions committed
                </p>
                {committedActions.length >= 3 && (
                  <div className="rounded-xl bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/50 p-3 text-xs text-emerald-800 dark:text-emerald-300 font-medium">
                    🎉 All actions committed! Keep tracking your progress.
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-8 border border-dashed border-gray-200 dark:border-gray-700 rounded-xl">
                <ShieldAlert
                  className="h-7 w-7 mx-auto text-gray-300 dark:text-gray-600 mb-2"
                  aria-hidden="true"
                />
                <p className="text-xs text-gray-500 dark:text-gray-300 mb-3">
                  No actions committed yet.
                </p>
                <Link
                  href="/insights"
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline"
                >
                  <Sparkles className="h-3.5 w-3.5" />
                  Get AI recommendations →
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
