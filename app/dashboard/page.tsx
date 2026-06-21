"use client";

import React, { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { useCarbonTracker } from "../../hooks/useCarbonTracker";
import { CategoryBarChart } from "../../components/dashboard/CategoryBarChart";
import { TrendLineChart } from "../../components/dashboard/TrendLineChart";
import { EquivalenceCards } from "../../components/dashboard/EquivalenceCards";
import { GuidedTour } from "../../components/onboarding/GuidedTour";
import {
  getTotalForPeriod,
  getCategoryBreakdown,
  getCompassScore,
} from "../../lib/carbonUtils";
import { DAILY_BUDGET_1_5C, EMISSION_FACTORS } from "../../lib/emissionFactors";
import { saveActivities, saveProfile, saveGoals, getActivities } from "../../lib/storage";
import { MOCK_ACTIVITIES, MOCK_PROFILE, MOCK_GOALS } from "../../lib/mockData";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "../../components/ui/Card";
import { Badge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import {
  Trash2,
  Calendar,
  Car,
  UtensilsCrossed,
  Zap,
  ShoppingBag,
  Recycle,
  TrendingDown,
  TrendingUp,
  Minus,
  ChevronDown,
  BarChart3,
  Leaf,
  Info,
  Sparkles,
} from "lucide-react";
import Link from "next/link";

// ─── Helpers ────────────────────────────────────────────────────────────────

type Category = "transport" | "food" | "energy" | "shopping" | "waste";

const CATEGORY_ICONS: Record<Category, React.ElementType> = {
  transport: Car,
  food: UtensilsCrossed,
  energy: Zap,
  shopping: ShoppingBag,
  waste: Recycle,
};

const CATEGORY_COLORS: Record<Category, string> = {
  transport: "text-emerald-600 dark:text-emerald-400",
  food: "text-amber-600 dark:text-amber-400",
  energy: "text-yellow-600 dark:text-yellow-400",
  shopping: "text-purple-600 dark:text-purple-400",
  waste: "text-gray-500 dark:text-gray-300",
};

const CATEGORY_BG: Record<Category, string> = {
  transport: "bg-emerald-50 dark:bg-emerald-900/20",
  food: "bg-amber-50 dark:bg-amber-900/20",
  energy: "bg-yellow-50 dark:bg-yellow-900/20",
  shopping: "bg-purple-50 dark:bg-purple-900/20",
  waste: "bg-gray-100 dark:bg-gray-800/40",
};

function relativeTime(isoStr: string): string {
  const diff = Date.now() - new Date(isoStr).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 60) return minutes <= 1 ? "Just now" : `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days}d ago`;
  return new Date(isoStr).toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

function getSubtypeLabel(category: string, subtype: string): string {
  return (EMISSION_FACTORS as any)[category]?.[subtype]?.label ?? subtype.replace(/_/g, " ");
}

// ─── Count-up hook ───────────────────────────────────────────────────────────

function useCountUp(target: number, durationMs = 800): number {
  const [value, setValue] = useState(0);
  const valueRef = useRef(0);
  const rafRef = useRef<number>(0);
  const startRef = useRef<number | null>(null);

  useEffect(() => {
    valueRef.current = value;
  }, [value]);

  useEffect(() => {
    if (target === valueRef.current) return;
    const from = valueRef.current;
    startRef.current = null;

    const animate = (ts: number) => {
      if (!startRef.current) startRef.current = ts;
      const elapsed = ts - startRef.current;
      const prog = Math.min(elapsed / durationMs, 1);
      const eased = 1 - Math.pow(1 - prog, 3);
      const nextVal = parseFloat((from + (target - from) * eased).toFixed(3));
      setValue(nextVal);
      if (prog < 1) {
        rafRef.current = requestAnimationFrame(animate);
      } else {
        setValue(target);
      }
    };

    cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafRef.current);
  }, [target, durationMs]);

  return value;
}

// ─── Sub-components ──────────────────────────────────────────────────────────

function StatCard({
  label,
  value,
  unit,
  sub,
  accent,
}: {
  label: string;
  value: number;
  unit: string;
  sub?: React.ReactNode;
  accent?: string;
}) {
  const animated = useCountUp(value);
  return (
    <Card className={`border-l-4 ${accent ?? "border-l-primary-500"}`}>
      <CardContent className="pt-5 pb-5">
        <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 dark:text-gray-300">{label}</p>
        <p className="mt-1.5 text-2xl font-black text-gray-900 dark:text-white">
          {animated.toFixed(2)}
          <span className="text-sm font-semibold text-gray-400 dark:text-gray-300 ml-1">{unit}</span>
        </p>
        {sub && <div className="mt-1">{sub}</div>}
      </CardContent>
    </Card>
  );
}

// ─── Compass Score Card ──────────────────────────────────────────────────────

function CompassScoreCard({
  score,
  label,
  direction,
}: {
  score: number;
  label: string;
  direction: string;
}) {
  const animated = useCountUp(score, 1000);

  const colorClass =
    score >= 70
      ? "from-emerald-500/10 to-emerald-600/5 border-emerald-200 dark:border-emerald-800/50"
      : score >= 40
      ? "from-amber-500/10 to-amber-600/5 border-amber-200 dark:border-amber-800/50"
      : "from-red-500/10 to-red-600/5 border-red-200 dark:border-red-800/50";

  const scoreColor =
    score >= 70
      ? "text-emerald-600 dark:text-emerald-400"
      : score >= 40
      ? "text-amber-600 dark:text-amber-400"
      : "text-red-600 dark:text-red-400";

  const ringColor =
    score >= 70 ? "#10b981" : score >= 40 ? "#f59e0b" : "#ef4444";

  // Needle rotation: South=0°(bad), North=180°(great)
  // Map score 0→100 to -90→90 degrees (needle rotates from pointing down to pointing up)
  const needleAngle = ((score / 100) * 180) - 90;

  return (
    <Card
      data-tour="compass-score"
      id="compass-score"
      className={`w-full bg-gradient-to-br ${colorClass} border`}
    >
      <CardContent className="pt-6 pb-6">
        <div className="flex flex-col md:flex-row items-center gap-6">
          {/* Compass SVG needle gauge */}
          <div className="shrink-0 flex flex-col items-center gap-1">
            <svg
              width="120"
              height="120"
              viewBox="0 0 120 120"
              aria-label={`Compass needle pointing ${direction}`}
              role="img"
            >
              {/* Background arc */}
              <circle cx="60" cy="60" r="50" fill="none" stroke="#e5e7eb" strokeWidth="8" className="dark:stroke-gray-700" />
              {/* Score arc */}
              <circle
                cx="60"
                cy="60"
                r="50"
                fill="none"
                stroke={ringColor}
                strokeWidth="8"
                strokeDasharray={`${(score / 100) * 314} 314`}
                strokeLinecap="round"
                transform="rotate(-90 60 60)"
                style={{ transition: "stroke-dasharray 1s ease-out" }}
              />
              {/* Center dot */}
              <circle cx="60" cy="60" r="6" fill={ringColor} />
              {/* Needle */}
              <line
                x1="60"
                y1="60"
                x2="60"
                y2="18"
                stroke={ringColor}
                strokeWidth="3"
                strokeLinecap="round"
                transform={`rotate(${needleAngle} 60 60)`}
                style={{ transition: "transform 1s ease-out" }}
              />
              {/* Score label inside */}
              <text
                x="60" y="67"
                textAnchor="middle"
                fontSize="18"
                fontWeight="900"
                fill={ringColor}
                fontFamily="ui-sans-serif, system-ui, sans-serif"
              >
                {Math.round(animated)}
              </text>
            </svg>
            <span className="text-[10px] font-bold text-gray-400 dark:text-gray-300 uppercase tracking-widest">out of 100</span>
          </div>

          {/* Text content */}
          <div className="flex-1 text-center md:text-left">
            <p className="text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-gray-300 mb-1">
              🧭 CarbonCompass Score
            </p>
            <p className={`text-5xl font-black ${scoreColor}`}>
              {Math.round(animated)}
            </p>
            {/* DIRECTION LABEL — prominent */}
            <p className={`text-xl font-bold mt-2 ${scoreColor}`}>
              {label}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-300 mt-2 max-w-sm leading-relaxed">
              Based on your emissions vs. 1.5°C budget, logging streak, and tracking coverage across all 5 categories.
            </p>
            {/* AI coach nudge when score is low */}
            {score < 50 && (
              <Link
                href="/insights"
                className="mt-3 inline-flex items-center gap-1.5 text-xs font-bold text-amber-600 dark:text-amber-400 hover:underline focus:outline-none focus:ring-2 focus:ring-amber-500 rounded"
              >
                <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
                Score dropping? Ask the AI coach for help →
              </Link>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// ─── Demo Banner ─────────────────────────────────────────────────────────────

function DemoBanner({
  showBanner,
  demoLoaded,
  onLoadDemo,
}: {
  showBanner: boolean;
  demoLoaded: boolean;
  onLoadDemo: () => void;
}) {
  if (!showBanner) return null;

  if (demoLoaded) {
    return (
      <div className="rounded-xl border border-emerald-200 dark:border-emerald-800/50 bg-emerald-50 dark:bg-emerald-950/20 px-5 py-3 flex items-center gap-3 text-sm">
        <span className="text-lg">📊</span>
        <p className="text-emerald-800 dark:text-emerald-300 font-medium flex-1">
          Viewing demo data. Reset anytime from your{" "}
          <Link href="/profile" className="font-bold underline underline-offset-2 hover:no-underline">
            Profile page
          </Link>
          .
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border-2 border-dashed border-emerald-300 dark:border-emerald-700 bg-emerald-50/50 dark:bg-emerald-950/10 p-5">
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xl">👋</span>
            <h3 className="font-bold text-gray-900 dark:text-white text-sm">
              Welcome to CarbonCompass!
            </h3>
          </div>
          <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed">
            Click below to load a demo environment with{" "}
            <strong>14 days of realistic activity data</strong>, a simulated 5-day tracking streak,
            and pre-seeded goals — so you can experience the full platform instantly.
          </p>
        </div>
        <button
          onClick={onLoadDemo}
          id="load-demo-btn"
          className="shrink-0 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-bold px-5 py-2.5 text-sm transition-all shadow-md shadow-emerald-600/20 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 flex items-center gap-2"
        >
          <Leaf className="h-4 w-4" />
          Load Demo Data
        </button>
      </div>
    </div>
  );
}

// ─── Main Dashboard Page ─────────────────────────────────────────────────────

export default function DashboardPage() {
  const {
    activities,
    profile,
    goals,
    isLoaded,
    deleteActivity,
  } = useCarbonTracker();

  // Activity filter
  const [filterCategory, setFilterCategory] = useState<Category | "all">("all");
  // Delete confirm
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  // Demo state
  const [demoLoaded, setDemoLoaded] = useState(false);
  const [showTour, setShowTour] = useState(false);

  // Show banner when no activities OR no profile setup
  const showBanner = isLoaded && (activities.length === 0 || !profile.setupComplete);

  const now = new Date();
  const todayStart = new Date(now); todayStart.setHours(0, 0, 0, 0);
  const todayEnd = new Date(now); todayEnd.setHours(23, 59, 59, 999);
  const weekStart = new Date(now); weekStart.setDate(now.getDate() - 6); weekStart.setHours(0, 0, 0, 0);
  const monthStart = new Date(now); monthStart.setDate(1); monthStart.setHours(0, 0, 0, 0);
  const farFuture = new Date(now.getTime() + 5 * 365 * 24 * 3600 * 1000);

  // Memoized stats calculations
  const { todayKg, weekKg, monthKg, weekCatBreakdown, biggestCatName, biggestCatVal, streak, compassScore, budgetDiff, budgetIsGood } = useMemo(() => {
    const today = getTotalForPeriod(activities, todayStart, todayEnd);
    const week = getTotalForPeriod(activities, weekStart, farFuture);
    const month = getTotalForPeriod(activities, monthStart, farFuture);
    const breakdown = getCategoryBreakdown(activities, weekStart, farFuture);

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
    };
  }, [activities, demoLoaded]);

  // Activity list (last 15, filtered)
  const filteredActivities = activities
    .filter(a => filterCategory === "all" || a.category === filterCategory)
    .slice(0, 15);

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
    if (typeof window === "undefined") return;
    // If we just reloaded after demo seed and activities are present, flag showTour
    const hasData = getActivities().length > 0;
    let tourDone: string | null = null;
    try {
      tourDone = localStorage.getItem("carboncompass_tour_done");
    } catch (e) {
      console.error(e);
    }
    if (hasData && !tourDone) {
      setShowTour(true);
    }
  }, [isLoaded]);

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

      {/* ── Row 2: Category Bar Chart + Summary Card ── */}
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
                  <p className="text-xs text-gray-700 dark:text-gray-300 leading-relaxed">
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

      {/* ── Row 4: Equivalence Cards ── */}
      <div>
        <h2 className="text-sm font-bold text-gray-500 dark:text-gray-300 uppercase tracking-wider mb-3">
          This Week's Emissions Equivalent To…
        </h2>
        <EquivalenceCards weeklyKg={weekKg} />
      </div>

      {/* ── Row 5: Recent Activity List ── */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between flex-wrap gap-2">
          <div>
            <CardTitle>Recent Activity Log</CardTitle>
            <CardDescription>Last 15 entries — click the trash icon to delete</CardDescription>
          </div>
          <div className="flex items-center gap-2">
            {/* Category filter */}
            <div className="relative">
              <select
                value={filterCategory}
                onChange={e => setFilterCategory(e.target.value as Category | "all")}
                className="text-xs font-semibold rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 pl-3 pr-8 py-1.5 appearance-none focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
                aria-label="Filter by category"
              >
                <option value="all">All categories</option>
                <option value="transport">Transport</option>
                <option value="food">Food</option>
                <option value="energy">Energy</option>
                <option value="shopping">Shopping</option>
                <option value="waste">Waste</option>
              </select>
              <ChevronDown className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400 dark:text-gray-300" />
            </div>
            <Badge variant="outline" className="flex items-center gap-1 shrink-0">
              <Calendar className="h-3 w-3" />
              {activities.length} total
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          {filteredActivities.length === 0 ? (
            <div className="text-center py-12 text-gray-400 dark:text-gray-300">
              <Info className="h-8 w-8 mx-auto stroke-[1.5] mb-2" />
              <p className="text-sm">
                {activities.length === 0
                  ? "No activities logged yet."
                  : "No activities in this category."}
              </p>
              {activities.length === 0 && (
                <Link href="/tracker" className="text-xs text-emerald-500 hover:underline mt-1 inline-block">
                  Add your first activity →
                </Link>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto -mx-1">
              <table className="w-full text-left text-sm min-w-[500px]">
                <thead>
                  <tr className="border-b border-gray-100 dark:border-gray-700 text-[10px] text-gray-400 dark:text-gray-300 uppercase tracking-wider font-bold">
                    <th className="pb-3 pl-2 pr-2 w-8">Cat.</th>
                    <th className="pb-3 pr-2">Activity</th>
                    <th className="pb-3 pr-2 w-28">Amount</th>
                    <th className="pb-3 pr-2 w-24">When</th>
                    <th className="pb-3 text-right pr-2 w-20">CO₂e</th>
                    <th className="pb-3 text-center w-10"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 dark:divide-gray-850">
                  {filteredActivities.map(act => {
                    const Icon = CATEGORY_ICONS[act.category as Category] ?? Minus;
                    const isConfirming = confirmDeleteId === act.id;
                    return (
                      <tr
                        key={act.id}
                        className="hover:bg-gray-50/60 dark:hover:bg-gray-900/30 transition-colors"
                      >
                        {/* Icon */}
                        <td className="py-3 pl-2 pr-2">
                          <span className={`inline-flex p-1.5 rounded-lg ${CATEGORY_BG[act.category as Category]}`}>
                            <Icon
                              className={`h-3.5 w-3.5 ${CATEGORY_COLORS[act.category as Category]}`}
                              strokeWidth={1.8}
                              aria-hidden="true"
                            />
                          </span>
                        </td>
                        {/* Activity label */}
                        <td className="py-3 pr-2">
                          <p className="font-semibold text-gray-800 dark:text-gray-200 text-xs leading-tight">
                            {getSubtypeLabel(act.category, act.subtype)}
                          </p>
                          <p className="text-[10px] text-gray-400 dark:text-gray-300 capitalize">{act.category}</p>
                        </td>
                        {/* Amount */}
                        <td className="py-3 pr-2 text-xs text-gray-600 dark:text-gray-300 font-semibold">
                          {act.quantity} {act.unit}
                        </td>
                        {/* Time */}
                        <td className="py-3 pr-2 text-[11px] text-gray-500 dark:text-gray-300 font-semibold">
                          {relativeTime(act.timestamp)}
                        </td>
                        {/* CO₂e */}
                        <td className="py-3 pr-2 text-right font-black text-gray-900 dark:text-white text-xs">
                          {act.co2e.toFixed(2)} kg
                        </td>
                        {/* Delete */}
                        <td className="py-3 text-center">
                          {isConfirming ? (
                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => { deleteActivity(act.id); setConfirmDeleteId(null); }}
                                className="text-[10px] font-bold text-red-600 dark:text-red-400 hover:underline cursor-pointer focus:outline-none"
                                aria-label={`Confirm delete ${getSubtypeLabel(act.category, act.subtype)}`}
                              >
                                Yes
                              </button>
                              <span className="text-gray-300 dark:text-gray-600">/</span>
                              <button
                                onClick={() => setConfirmDeleteId(null)}
                               className="text-[10px] text-gray-500 dark:text-gray-300 hover:text-gray-800 dark:hover:text-gray-200 cursor-pointer focus:outline-none"
                              >
                                No
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => setConfirmDeleteId(act.id)}
                              className="rounded p-1.5 text-gray-300 hover:text-red-500 dark:hover:text-red-400 transition-colors cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-red-400"
                              aria-label={`Delete ${getSubtypeLabel(act.category, act.subtype)} entry`}
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* ── Guided Tour (only after demo load, once) ── */}
      {showTour && <GuidedTour />}
    </div>
  );
}
