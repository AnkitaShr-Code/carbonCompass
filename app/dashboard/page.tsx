"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import Link from "next/link";
import {
  BarChart3,
  Leaf,
  Info,
  Sparkles,
  TrendingDown,
  TrendingUp,
} from "lucide-react";

import { useCarbonTracker } from "../../hooks/useCarbonTracker";
import { CategoryBarChart } from "../../components/dashboard/CategoryBarChart";
import { TrendLineChart } from "../../components/dashboard/TrendLineChart";
import { EquivalenceCards } from "../../components/dashboard/EquivalenceCards";
import { StatCard } from "../../components/dashboard/StatCard";
import { CompassScoreCard } from "../../components/dashboard/CompassScoreCard";
import { DemoBanner } from "../../components/dashboard/DemoBanner";
import { GuidedTour } from "../../components/onboarding/GuidedTour";
import { DailyTipCard } from "../../components/ui/DailyTipCard";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import {
  getTotalForPeriod,
  getCategoryBreakdown,
  getCompassScore,
} from "../../lib/carbonUtils";
import { DAILY_BUDGET_1_5C } from "../../lib/emissionFactors";
import { saveActivities, saveProfile, saveGoals } from "../../lib/storage";
import { MOCK_ACTIVITIES, MOCK_PROFILE, MOCK_GOALS } from "../../lib/mockData";
import {
  Category,
  CATEGORY_ICONS,
  CATEGORY_COLORS,
  CATEGORY_BG,
  RecentActivityLog
} from "../../components/dashboard/RecentActivityLog";

// ─── Main Dashboard Page ─────────────────────────────────────────────────────

export default function DashboardPage() {
  const {
    activities,
    profile,
    goals,
    isLoaded,
    deleteActivity,
  } = useCarbonTracker();

  // Demo state
  const [demoLoaded, setDemoLoaded] = useState(false);
  const [showTour, setShowTour] = useState(false);

  // Show banner when no activities OR no profile setup
  const showBanner = isLoaded && (activities.length === 0 || !profile.setupComplete);
  // Memoized stats calculations
  const {
    todayKg,
    weekKg,
    monthKg,
    weekCatBreakdown,
    biggestCatName,
    biggestCatVal,
    streak,
    compassScore,
    budgetDiff,
    budgetIsGood,
    weekStart,
    farFuture,
    now,
  } = useMemo(() => {
    const currentNow = new Date();
    const todayStart = new Date(currentNow); todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date(currentNow); todayEnd.setHours(23, 59, 59, 999);
    const wStart = new Date(currentNow); wStart.setDate(currentNow.getDate() - 6); wStart.setHours(0, 0, 0, 0);
    const mStart = new Date(currentNow); mStart.setDate(1); mStart.setHours(0, 0, 0, 0);
    const fFuture = new Date(currentNow.getTime() + 5 * 365 * 24 * 3600 * 1000);

    const today = getTotalForPeriod(activities, todayStart, todayEnd);
    const week = getTotalForPeriod(activities, wStart, fFuture);
    const month = getTotalForPeriod(activities, mStart, fFuture);
    const breakdown = getCategoryBreakdown(activities, wStart, fFuture);

    const biggest = Object.entries(breakdown).sort((a, b) => b[1] - a[1])[0];
    const biggestName = biggest ? biggest[0] : null;
    const biggestVal = biggest ? biggest[1] : 0;

    const computedStreak = demoLoaded ? 5 : Math.min(activities.length > 0 ? 3 : 0, 7);
    const score = getCompassScore(activities, computedStreak);

    const diff = DAILY_BUDGET_1_5C - today;
    const isGood = diff >= 0;

    return {
      todayKg: today,
      weekKg: week,
      monthKg: month,
      weekCatBreakdown: breakdown,
      biggestCatName: biggestName,
      biggestCatVal: biggestVal,
      streak: computedStreak,
      compassScore: score,
      budgetDiff: diff,
      budgetIsGood: isGood,
      weekStart: wStart,
      farFuture: fFuture,
      now: currentNow,
    };
  }, [activities, demoLoaded]);

  const handleLoadDemo = useCallback(() => {
    saveActivities(MOCK_ACTIVITIES);
    saveProfile(MOCK_PROFILE);
    saveGoals(MOCK_GOALS);
    setDemoLoaded(true);
    // Small delay then reload to get fresh state in the hook
    setTimeout(() => window.location.reload(), 100);
  }, []);

  // After demo data loads, trigger tour on next render
  useEffect(() => {
    if (typeof window === "undefined" || !isLoaded) return;
    // If we just reloaded after demo seed and activities are present, flag showTour
    const hasData = activities.length > 0;
    let tourDone: string | null = null;
    try {
      tourDone = localStorage.getItem("carboncompass_tour_done");
    } catch (e) {
      console.error(e);
    }
    if (hasData && !tourDone) {
      setShowTour(true);
    }
  }, [isLoaded, activities]);

  if (!isLoaded) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent mx-auto" />
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-300">Loading dashboard…</p>
        </div>
      </div>
    );
  }

  const suggestMap: Record<string, string> = {
    transport: "Try switching to public transit 2 days a week to cut emissions significantly.",
    food: "Swapping beef for chicken or legumes just twice a week makes a big difference.",
    energy: "Reducing electricity usage by 20% is often achievable with smart scheduling.",
    shopping: "Choosing second-hand or repairing instead of buying new saves a lot of carbon.",
    waste: "Composting organic waste instead of landfilling reduces methane emissions.",
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* ── Page header ── */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-gray-900 dark:text-white sm:text-3xl">
            {profile.name ? `Welcome back, ${profile.name}` : "Your Dashboard"}
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-300">
            {now.toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" })}
          </p>
        </div>
        <Link href="/tracker">
          <Button size="sm" className="shrink-0">Log Activity</Button>
        </Link>
      </div>

      {/* ── Row 0: Demo Banner ── */}
      <DemoBanner
        showBanner={showBanner || demoLoaded}
        demoLoaded={demoLoaded}
        onLoadDemo={handleLoadDemo}
      />

      {/* ── Row 0b: Compass Score Hero ── */}
      <CompassScoreCard
        score={compassScore.score}
        label={compassScore.label}
        direction={compassScore.direction}
      />

      {/* ── Row 1: 4 Stat Cards ── */}
      <section aria-labelledby="stats-heading" className="space-y-3">
        <h2 id="stats-heading" className="sr-only">Dashboard statistics summary</h2>
        <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
          <StatCard
            label="Today's Total"
            value={todayKg}
            unit="kg CO₂e"
            accent="border-l-emerald-500"
          />
          <StatCard
            label="This Week"
            value={weekKg}
            unit="kg CO₂e"
            accent="border-l-blue-500"
          />
          <StatCard
            label="This Month"
            value={monthKg}
            unit="kg CO₂e"
            accent="border-l-purple-500"
          />
          <StatCard
            label="vs Daily Budget"
            value={Math.abs(budgetDiff)}
            unit="kg"
            accent={budgetIsGood ? "border-l-emerald-500" : "border-l-red-500"}
            sub={
              <div className={`flex items-center gap-1 text-xs font-bold ${
                budgetIsGood ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400"
              }`}>
                {budgetIsGood ? (
                  <><TrendingDown className="h-3.5 w-3.5" /> {budgetDiff.toFixed(2)} kg under ✓</>
                ) : (
                  <><TrendingUp className="h-3.5 w-3.5" /> {Math.abs(budgetDiff).toFixed(2)} kg over ⚠</>
                )}
              </div>
            }
          />
        </div>
      </section>

      {/* ── Rows 2 & 3: Chart Area ── */}
      <section aria-labelledby="charts-heading" className="space-y-6">
        <h2 id="charts-heading" className="sr-only">Carbon emissions breakdown and historical trends</h2>
        <div className="grid gap-4 lg:grid-cols-5">
          {/* Bar Chart — 3 cols */}
          <Card className="lg:col-span-3">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <BarChart3 className="h-4 w-4 text-emerald-500" />
                Emissions by Category
              </CardTitle>
              <CardDescription>Breakdown of your carbon footprint this week</CardDescription>
            </CardHeader>
            <CardContent>
              <CategoryBarChart
                activities={activities}
                startDate={weekStart}
                endDate={farFuture}
              />
            </CardContent>
          </Card>

          {/* Quick summary — 2 cols */}
          <Card className="lg:col-span-2 flex flex-col justify-between">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Leaf className="h-4 w-4 text-emerald-500" />
                Weekly Snapshot
              </CardTitle>
              <CardDescription>Your biggest emission source and next step</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {biggestCatName ? (
                <>
                  <div className={`rounded-xl p-4 ${CATEGORY_BG[biggestCatName as Category]}`}>
                    <div className="flex items-center gap-2 mb-1">
                      {React.createElement(CATEGORY_ICONS[biggestCatName as Category], {
                        className: `h-5 w-5 ${CATEGORY_COLORS[biggestCatName as Category]}`,
                        strokeWidth: 1.8,
                      })}
                      <span className={`text-sm font-bold capitalize ${CATEGORY_COLORS[biggestCatName as Category]}`}>
                        {biggestCatName}
                      </span>
                    </div>
                    <p className="text-xs text-gray-750 dark:text-gray-300 leading-relaxed">
                      Your biggest source this week is{" "}
                      <strong className="capitalize">{biggestCatName}</strong> at{" "}
                      <strong>{biggestCatVal.toFixed(2)} kg CO₂e</strong>.{" "}
                      {suggestMap[biggestCatName]}
                    </p>
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-300 space-y-1.5">
                    {Object.entries(weekCatBreakdown)
                      .sort((a, b) => b[1] - a[1])
                      .map(([cat, kg]) => (
                        <div key={cat} className="flex justify-between items-center">
                          <span className="capitalize font-medium">{cat}</span>
                          <span className="font-bold text-gray-700 dark:text-gray-300">
                            {kg.toFixed(2)} kg
                          </span>
                        </div>
                      ))}
                  </div>
                {/* AI CTA at bottom of the card when data exists */}
                <Link
                  href="/insights"
                  className="mt-1 inline-flex items-center gap-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline focus:outline-none focus:ring-2 focus:ring-emerald-500 rounded"
                >
                  <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
                  Get AI recommendations →
                </Link>
              </>
              ) : (
                <div className="flex flex-col items-center justify-center py-8 text-center text-gray-400 dark:text-gray-300 gap-2">
                  <Info className="h-6 w-6 opacity-50" />
                  <p className="text-xs">No activities logged this week.</p>
                  <Link href="/tracker" className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline">
                    Start tracking →
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* ── Row 3: 7-day Trend Line ── */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <TrendingDown className="h-4 w-4 text-emerald-500" />
              7-Day Trend
            </CardTitle>
            <CardDescription>
              Daily CO₂e over the last 7 days vs the 1.5°C daily budget ({DAILY_BUDGET_1_5C} kg)
            </CardDescription>
          </CardHeader>
          <CardContent className="pb-2">
            <TrendLineChart activities={activities} />
          </CardContent>
        </Card>
      </section>

      {/* ── Row 4: Equivalence Cards ── */}
      <div>
        <h2 className="text-sm font-bold text-gray-500 dark:text-gray-300 uppercase tracking-wider mb-3">
          This Week's Emissions Equivalent To…
        </h2>
        <EquivalenceCards weeklyKg={weekKg} />
      </div>

      {/* ── Row 4b: Daily Carbon Insight ── */}
      <DailyTipCard />

      {/* ── Row 5: Recent Activity List ── */}
      <section aria-labelledby="activity-log-heading">
        <h2 id="activity-log-heading" className="sr-only">Recent activities log</h2>
        <RecentActivityLog
          activities={activities}
          deleteActivity={deleteActivity}
        />
      </section>

      {/* ── Guided Tour (only after demo load, once) ── */}
      {showTour && <GuidedTour />}
    </div>
  );
}
