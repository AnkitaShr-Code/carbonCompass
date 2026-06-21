import { ActivityEntry, BadgeStatus } from "./types";
import { DAILY_BUDGET_1_5C } from "./emissionFactors";

// ─── Badge definitions ────────────────────────────────────────────────────────

export interface BadgeDefinition {
  id: string;
  name: string;
  description: string;
  icon: string; // lucide-react component name
}

export const BADGES: BadgeDefinition[] = [
  {
    id: "first_log",
    name: "First Step",
    description: "Logged your first activity",
    icon: "Sprout",
  },
  {
    id: "streak_7",
    name: "7-Day Streak",
    description: "Logged every day for 7 consecutive days",
    icon: "Flame",
  },
  {
    id: "car_free_week",
    name: "Car-Free Week",
    description: "No car entries for 7 days",
    icon: "BusFront",
  },
  {
    id: "plant_week",
    name: "Plant Power",
    description: "No meat entries for 7 days",
    icon: "Leaf",
  },
  {
    id: "ten_pct_drop",
    name: "10% Drop",
    description: "Reduced weekly emissions by 10%",
    icon: "TrendingDown",
  },
  {
    id: "budget_hero",
    name: "Budget Hero",
    description: "Stayed under 1.5°C daily budget for a full week",
    icon: "Shield",
  },
];

// ─── Helper: normalise a date to midnight UTC for comparison ──────────────────

function toMidnight(d: Date): number {
  const copy = new Date(d);
  copy.setHours(0, 0, 0, 0);
  return copy.getTime();
}

/** Returns the set of midnight-timestamps (as numbers) for all days with at least 1 activity */
function daysWithActivity(activities: ActivityEntry[]): Set<number> {
  const days = new Set<number>();
  activities.forEach((a) => {
    days.add(toMidnight(new Date(a.timestamp)));
  });
  return days;
}

// ─── calculateStreak ──────────────────────────────────────────────────────────

/**
 * @description Counts consecutive days (ending today) that have at least 1 logged activity.
 * @param activities - Array of all logged ActivityEntry.
 * @returns {number} The consecutive days logged streak.
 */
export function calculateStreak(activities: ActivityEntry[]): number {
  if (activities.length === 0) return 0;

  const days = daysWithActivity(activities);
  const today = toMidnight(new Date());
  let streak = 0;

  for (let i = 0; i < 365; i++) {
    const day = today - i * 24 * 60 * 60 * 1000;
    if (days.has(day)) {
      streak++;
    } else {
      // Allow one gap for "today not logged yet" only on i=0
      if (i === 0) continue;
      break;
    }
  }

  return streak;
}

// ─── getWeeklyComparison ──────────────────────────────────────────────────────

export interface WeeklyComparison {
  thisWeek: number;
  lastWeek: number;
  changePercent: number;
  bestDayLabel: string;   // e.g. "Monday"
  bestDayKg: number;
}

/**
 * @description Compares this week's total emissions against last week's total.
 * @param activities - Array of logged ActivityEntry.
 * @returns {WeeklyComparison} The WeeklyComparison summary details.
 */
export function getWeeklyComparison(activities: ActivityEntry[]): WeeklyComparison {
  const now = new Date();
  const todayEnd = new Date(now);
  todayEnd.setHours(23, 59, 59, 999);

  const weekStart = new Date(now);
  weekStart.setDate(now.getDate() - 6);
  weekStart.setHours(0, 0, 0, 0);

  const lastWeekStart = new Date(now);
  lastWeekStart.setDate(now.getDate() - 13);
  lastWeekStart.setHours(0, 0, 0, 0);

  const lastWeekEnd = new Date(weekStart);
  lastWeekEnd.setMilliseconds(-1);

  let thisWeek = 0;
  let lastWeek = 0;

  // Per-day totals for this week (to find best day)
  const dayTotals: Record<string, number> = {};

  activities.forEach((a) => {
    const ms = new Date(a.timestamp).getTime();

    if (ms >= weekStart.getTime() && ms <= todayEnd.getTime()) {
      thisWeek += a.co2e;
      const dayKey = toMidnight(new Date(a.timestamp)).toString();
      dayTotals[dayKey] = (dayTotals[dayKey] || 0) + a.co2e;
    } else if (ms >= lastWeekStart.getTime() && ms <= lastWeekEnd.getTime()) {
      lastWeek += a.co2e;
    }
  });

  const changePercent =
    lastWeek > 0
      ? parseFloat((((thisWeek - lastWeek) / lastWeek) * 100).toFixed(1))
      : 0;

  // Best day = lowest non-zero daily total this week
  const DAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  let bestDayLabel = "—";
  let bestDayKg = 0;

  const nonZeroDays = Object.entries(dayTotals).filter(([, kg]) => kg > 0);
  if (nonZeroDays.length > 0) {
    const best = nonZeroDays.sort((a, b) => a[1] - b[1])[0]!;
    const dayDate = new Date(parseInt(best[0]));
    bestDayLabel = DAY_NAMES[dayDate.getDay()] ?? "—";
    bestDayKg = parseFloat(best[1].toFixed(2));
  }

  return {
    thisWeek: parseFloat(thisWeek.toFixed(2)),
    lastWeek: parseFloat(lastWeek.toFixed(2)),
    changePercent,
    bestDayLabel,
    bestDayKg,
  };
}

// ─── checkBadges ─────────────────────────────────────────────────────────────

/**
 * @description Evaluates each badge achievement against the full activity history.
 * @param activities - Array of all logged ActivityEntry.
 * @returns {BadgeStatus[]} The updated statuses of all badges.
 */
export function checkBadges(activities: ActivityEntry[]): BadgeStatus[] {
  const now = new Date();

  // ── first_log ──────────────────────────────────────────────────────────────
  const firstLog: BadgeStatus = {
    id: "first_log",
    name: "First Step",
    description: "Logged your first activity",
    unlocked: activities.length > 0,
    progress: activities.length > 0 ? 100 : 0,
  };

  // ── streak_7 ───────────────────────────────────────────────────────────────
  const streak = calculateStreak(activities);
  const streak7: BadgeStatus = {
    id: "streak_7",
    name: "7-Day Streak",
    description: "Logged every day for 7 consecutive days",
    unlocked: streak >= 7,
    progress: Math.min(100, Math.round((streak / 7) * 100)),
  };

  // ── car_free_week ──────────────────────────────────────────────────────────
  // Check last 7 calendar days for any car entries
  const sevenDaysAgo = new Date(now);
  sevenDaysAgo.setDate(now.getDate() - 6);
  sevenDaysAgo.setHours(0, 0, 0, 0);

  const recentActivities = activities.filter(
    (a) => new Date(a.timestamp).getTime() >= sevenDaysAgo.getTime()
  );

  const CAR_SUBTYPES = ["car_petrol", "car_diesel", "car_ev", "motorcycle"];
  const MEAT_SUBTYPES = ["beef", "lamb", "chicken", "fish"];

  const hasCarThisWeek = recentActivities.some((a) => CAR_SUBTYPES.includes(a.subtype));
  const hasMeatThisWeek = recentActivities.some((a) => MEAT_SUBTYPES.includes(a.subtype));

  // Progress: count car-free days in last 7 with at least 1 activity logged
  const daysActive = daysWithActivity(recentActivities);
  let carFreeDays = 0;
  for (let i = 0; i < 7; i++) {
    const dayMs = toMidnight(new Date(now)) - i * 24 * 60 * 60 * 1000;
    if (daysActive.has(dayMs)) {
      const dayHasCar = recentActivities.some(
        (a) =>
          toMidnight(new Date(a.timestamp)) === dayMs &&
          CAR_SUBTYPES.includes(a.subtype)
      );
      if (!dayHasCar) carFreeDays++;
    }
  }

  const carFreeWeek: BadgeStatus = {
    id: "car_free_week",
    name: "Car-Free Week",
    description: "No car entries for 7 days",
    unlocked: daysActive.size >= 7 && !hasCarThisWeek,
    progress: daysActive.size === 0 ? 0 : Math.min(100, Math.round((carFreeDays / 7) * 100)),
  };

  // ── plant_week ─────────────────────────────────────────────────────────────
  let meatFreeDays = 0;
  for (let i = 0; i < 7; i++) {
    const dayMs = toMidnight(new Date(now)) - i * 24 * 60 * 60 * 1000;
    if (daysActive.has(dayMs)) {
      const dayHasMeat = recentActivities.some(
        (a) =>
          toMidnight(new Date(a.timestamp)) === dayMs &&
          MEAT_SUBTYPES.includes(a.subtype)
      );
      if (!dayHasMeat) meatFreeDays++;
    }
  }

  const plantWeek: BadgeStatus = {
    id: "plant_week",
    name: "Plant Power",
    description: "No meat entries for 7 days",
    unlocked: daysActive.size >= 7 && !hasMeatThisWeek,
    progress: daysActive.size === 0 ? 0 : Math.min(100, Math.round((meatFreeDays / 7) * 100)),
  };

  // ── ten_pct_drop ───────────────────────────────────────────────────────────
  const comparison = getWeeklyComparison(activities);
  const hasDrop = comparison.changePercent <= -10;
  // Progress toward -10% (if positive change, show 0; if negative, map 0→-10 to 0→100)
  const dropProgress =
    comparison.lastWeek === 0
      ? 0
      : hasDrop
      ? 100
      : comparison.changePercent < 0
      ? Math.round((-comparison.changePercent / 10) * 100)
      : 0;

  const tenPctDrop: BadgeStatus = {
    id: "ten_pct_drop",
    name: "10% Drop",
    description: "Reduced weekly emissions by 10%",
    unlocked: hasDrop,
    progress: Math.min(100, dropProgress),
  };

  // ── budget_hero ────────────────────────────────────────────────────────────
  // All 7 active days must be under DAILY_BUDGET_1_5C
  let daysUnderBudget = 0;
  for (let i = 0; i < 7; i++) {
    const dayMs = toMidnight(new Date(now)) - i * 24 * 60 * 60 * 1000;
    if (daysActive.has(dayMs)) {
      const dayTotal = recentActivities
        .filter((a) => toMidnight(new Date(a.timestamp)) === dayMs)
        .reduce((s, a) => s + a.co2e, 0);
      if (dayTotal <= DAILY_BUDGET_1_5C) daysUnderBudget++;
    }
  }

  const budgetHero: BadgeStatus = {
    id: "budget_hero",
    name: "Budget Hero",
    description: `Stayed under 1.5°C daily budget (${DAILY_BUDGET_1_5C} kg) for a full week`,
    unlocked: daysActive.size >= 7 && daysUnderBudget >= 7,
    progress:
      daysActive.size === 0
        ? 0
        : Math.min(100, Math.round((daysUnderBudget / 7) * 100)),
  };

  return [firstLog, streak7, carFreeWeek, plantWeek, tenPctDrop, budgetHero];
}

// Keep backward-compatible exports
export { checkBadges as checkAndUnlockBadges };
export const DEFAULT_BADGES: BadgeStatus[] = checkBadges([]);
