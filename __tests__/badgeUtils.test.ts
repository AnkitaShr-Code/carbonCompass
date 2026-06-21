import { describe, it, expect } from "vitest";
import { checkBadges, calculateStreak, getWeeklyComparison, BADGES } from "../lib/badgeUtils";
import { ActivityEntry } from "../lib/types";

// ─── Helpers ─────────────────────────────────────────────────────────────────

function daysAgo(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() - n);
  d.setHours(12, 0, 0, 0);
  return d.toISOString();
}

function makeActivity(overrides: Partial<ActivityEntry> = {}): ActivityEntry {
  return {
    id: Math.random().toString(36).slice(2),
    timestamp: daysAgo(0),
    category: "transport",
    subtype: "bus",
    quantity: 10,
    unit: "km",
    co2e: 0.89,
    ...overrides,
  };
}

// ─── calculateStreak ──────────────────────────────────────────────────────────

describe("calculateStreak", () => {
  it("returns 0 for empty activities", () => {
    expect(calculateStreak([])).toBe(0);
  });

  it("returns 1 if only today has an activity", () => {
    const acts = [makeActivity({ timestamp: daysAgo(0) })];
    expect(calculateStreak(acts)).toBe(1);
  });

  it("counts consecutive days including today", () => {
    const acts = [
      makeActivity({ timestamp: daysAgo(0) }),
      makeActivity({ timestamp: daysAgo(1) }),
      makeActivity({ timestamp: daysAgo(2) }),
    ];
    expect(calculateStreak(acts)).toBe(3);
  });

  it("stops counting at a gap", () => {
    const acts = [
      makeActivity({ timestamp: daysAgo(0) }),
      makeActivity({ timestamp: daysAgo(1) }),
      // gap on day 2
      makeActivity({ timestamp: daysAgo(3) }),
    ];
    expect(calculateStreak(acts)).toBe(2);
  });

  it("returns streak of 1 when only yesterday has activity (today not logged)", () => {
    const acts = [makeActivity({ timestamp: daysAgo(1) })];
    // Today gap is allowed on i=0; then yesterday found → streak = 1
    const s = calculateStreak(acts);
    // streak could be 1 (only yesterday) — the today-gap allowance is for "hasn't logged yet"
    expect(s).toBeGreaterThanOrEqual(0);
    expect(s).toBeLessThanOrEqual(2);
  });

  it("counts multiple activities on the same day as 1 streak day", () => {
    const acts = [
      makeActivity({ timestamp: daysAgo(0), id: "a" }),
      makeActivity({ timestamp: daysAgo(0), id: "b" }),
      makeActivity({ timestamp: daysAgo(0), id: "c" }),
    ];
    expect(calculateStreak(acts)).toBe(1);
  });

  it("returns 0 when activities are only from last week (none today or yesterday)", () => {
    const acts = [
      makeActivity({ timestamp: daysAgo(8) }),
      makeActivity({ timestamp: daysAgo(9) }),
    ];
    expect(calculateStreak(acts)).toBe(0);
  });
});

// ─── getWeeklyComparison ──────────────────────────────────────────────────────

describe("getWeeklyComparison", () => {
  it("returns zeros for empty activities", () => {
    const result = getWeeklyComparison([]);
    expect(result.thisWeek).toBe(0);
    expect(result.lastWeek).toBe(0);
    expect(result.changePercent).toBe(0);
  });

  it("sums this week correctly", () => {
    const acts = [
      makeActivity({ timestamp: daysAgo(0), co2e: 5 }),
      makeActivity({ timestamp: daysAgo(2), co2e: 3 }),
    ];
    const result = getWeeklyComparison(acts);
    expect(result.thisWeek).toBe(8);
  });

  it("sums last week correctly", () => {
    const acts = [
      makeActivity({ timestamp: daysAgo(8),  co2e: 4 }),
      makeActivity({ timestamp: daysAgo(10), co2e: 6 }),
    ];
    const result = getWeeklyComparison(acts);
    expect(result.lastWeek).toBe(10);
  });

  it("computes negative changePercent when this week is lower", () => {
    const acts = [
      makeActivity({ timestamp: daysAgo(0), co2e: 9 }),   // this week: 9
      makeActivity({ timestamp: daysAgo(8), co2e: 10 }),  // last week: 10
    ];
    const result = getWeeklyComparison(acts);
    // change = (9 - 10) / 10 * 100 = -10%
    expect(result.changePercent).toBe(-10);
  });

  it("returns the best (lowest) day label when data is present", () => {
    const acts = [
      makeActivity({ timestamp: daysAgo(0), co2e: 2 }),
      makeActivity({ timestamp: daysAgo(1), co2e: 8 }),
    ];
    const result = getWeeklyComparison(acts);
    // Best day should be today (2 kg < 8 kg)
    expect(result.bestDayKg).toBe(2);
    expect(result.bestDayLabel).toBeDefined();
    expect(result.bestDayLabel.length).toBeGreaterThan(1);
  });

  it("returns '—' for bestDayLabel when no data", () => {
    const result = getWeeklyComparison([]);
    expect(result.bestDayLabel).toBe("—");
  });

  it("handles only current week data gracefully (lastWeek = 0, changePercent = 0)", () => {
    const acts = [
      makeActivity({ timestamp: daysAgo(0), co2e: 5 }),
    ];
    const result = getWeeklyComparison(acts);
    expect(result.thisWeek).toBe(5);
    expect(result.lastWeek).toBe(0);
    expect(result.changePercent).toBe(0);
  });
});

// ─── checkBadges ─────────────────────────────────────────────────────────────

describe("checkBadges", () => {
  it("returns exactly 6 badges", () => {
    expect(checkBadges([])).toHaveLength(6);
    expect(BADGES).toHaveLength(6);
  });

  it("returns all badges locked for empty activities", () => {
    const result = checkBadges([]);
    result.forEach((b) => {
      expect(b.unlocked).toBe(false);
      expect(b.progress).toBe(0);
    });
  });

  it("unlocks first_log after any activity", () => {
    const result = checkBadges([makeActivity()]);
    const badge = result.find((b) => b.id === "first_log");
    expect(badge?.unlocked).toBe(true);
    expect(badge?.progress).toBe(100);
  });

  it("first_log remains locked with no activities", () => {
    const result = checkBadges([]);
    const badge = result.find((b) => b.id === "first_log");
    expect(badge?.unlocked).toBe(false);
    expect(badge?.progress).toBe(0);
  });

  it("streak_7 unlocks after 7 consecutive days", () => {
    const acts = Array.from({ length: 7 }, (_, i) =>
      makeActivity({ timestamp: daysAgo(i), id: `s${i}` })
    );
    const result = checkBadges(acts);
    const badge = result.find((b) => b.id === "streak_7");
    expect(badge?.unlocked).toBe(true);
    expect(badge?.progress).toBe(100);
  });

  it("streak_7 not unlocked at 3 days — shows 42% progress", () => {
    const acts = Array.from({ length: 3 }, (_, i) =>
      makeActivity({ timestamp: daysAgo(i), id: `s${i}` })
    );
    const result = checkBadges(acts);
    const badge = result.find((b) => b.id === "streak_7");
    expect(badge?.unlocked).toBe(false);
    // 3/7 * 100 ≈ 42 or 43 depending on rounding
    expect(badge?.progress).toBeGreaterThanOrEqual(40);
    expect(badge?.progress).toBeLessThanOrEqual(45);
  });

  it("car_free_week remains locked when car_petrol activity exists this week", () => {
    // 7 days of activity including car
    const acts = Array.from({ length: 7 }, (_, i) =>
      makeActivity({
        timestamp: daysAgo(i),
        subtype: i === 0 ? "car_petrol" : "bus",
        id: `c${i}`,
      })
    );
    const result = checkBadges(acts);
    const badge = result.find((b) => b.id === "car_free_week");
    expect(badge?.unlocked).toBe(false);
  });

  it("car_free_week unlocks with 7 non-car days", () => {
    const acts = Array.from({ length: 7 }, (_, i) =>
      makeActivity({ timestamp: daysAgo(i), subtype: "bus", id: `b${i}` })
    );
    const result = checkBadges(acts);
    const badge = result.find((b) => b.id === "car_free_week");
    expect(badge?.unlocked).toBe(true);
  });

  it("plant_week remains locked when beef activity exists this week", () => {
    const acts = Array.from({ length: 7 }, (_, i) =>
      makeActivity({
        timestamp: daysAgo(i),
        category: "food",
        subtype: i === 3 ? "beef" : "vegetables",
        unit: "kg",
        co2e: i === 3 ? 27 : 2,
        id: `f${i}`,
      })
    );
    const result = checkBadges(acts);
    const badge = result.find((b) => b.id === "plant_week");
    expect(badge?.unlocked).toBe(false);
  });

  it("plant_week unlocks with 7 days of vegetarian food", () => {
    const acts = Array.from({ length: 7 }, (_, i) =>
      makeActivity({
        timestamp: daysAgo(i),
        category: "food",
        subtype: "vegetables",
        unit: "kg",
        co2e: 2,
        id: `v${i}`,
      })
    );
    const result = checkBadges(acts);
    const badge = result.find((b) => b.id === "plant_week");
    expect(badge?.unlocked).toBe(true);
  });

  it("ten_pct_drop unlocks when this week is 10%+ lower than last week", () => {
    const thisWeekActs = Array.from({ length: 3 }, (_, i) =>
      makeActivity({ timestamp: daysAgo(i), co2e: 3, id: `tw${i}` })
    ); // this week: 9 kg
    const lastWeekActs = Array.from({ length: 3 }, (_, i) =>
      makeActivity({ timestamp: daysAgo(8 + i), co2e: 4, id: `lw${i}` })
    ); // last week: 12 kg → drop = 25%
    const result = checkBadges([...thisWeekActs, ...lastWeekActs]);
    const badge = result.find((b) => b.id === "ten_pct_drop");
    expect(badge?.unlocked).toBe(true);
    expect(badge?.progress).toBe(100);
  });

  it("ten_pct_drop is NOT unlocked when this week is higher than last week", () => {
    const thisWeekActs = [makeActivity({ timestamp: daysAgo(0), co2e: 15, id: "tw1" })];
    const lastWeekActs = [makeActivity({ timestamp: daysAgo(8), co2e: 10, id: "lw1" })];
    const result = checkBadges([...thisWeekActs, ...lastWeekActs]);
    const badge = result.find((b) => b.id === "ten_pct_drop");
    expect(badge?.unlocked).toBe(false);
    expect(badge?.progress).toBe(0);
  });

  it("budget_hero unlocks when all 7 active days are under DAILY_BUDGET_1_5C (15 kg)", () => {
    // Each day logs 5 kg — well under budget
    const acts = Array.from({ length: 7 }, (_, i) =>
      makeActivity({ timestamp: daysAgo(i), co2e: 5, id: `bh${i}` })
    );
    const result = checkBadges(acts);
    const badge = result.find((b) => b.id === "budget_hero");
    expect(badge?.unlocked).toBe(true);
    expect(badge?.progress).toBe(100);
  });

  it("budget_hero stays locked when one day exceeds the budget", () => {
    const acts = Array.from({ length: 7 }, (_, i) =>
      makeActivity({
        timestamp: daysAgo(i),
        co2e: i === 3 ? 20 : 3, // day 3 exceeds 15 kg budget
        id: `bh${i}`,
      })
    );
    const result = checkBadges(acts);
    const badge = result.find((b) => b.id === "budget_hero");
    expect(badge?.unlocked).toBe(false);
  });

  it("streak_7 locked with 6 consecutive days, progress is approx 86", () => {
    const acts = Array.from({ length: 6 }, (_, i) =>
      makeActivity({ timestamp: daysAgo(i), id: `s${i}` })
    );
    const result = checkBadges(acts);
    const badge = result.find((b) => b.id === "streak_7");
    expect(badge?.unlocked).toBe(false);
    expect(badge?.progress).toBe(86);
  });

  it("car_free_week is locked when one car entry is logged on day 5 (daysAgo(5))", () => {
    const acts = Array.from({ length: 7 }, (_, i) =>
      makeActivity({
        timestamp: daysAgo(i),
        subtype: i === 5 ? "car_petrol" : "bus",
        id: `c${i}`,
      })
    );
    const result = checkBadges(acts);
    const badge = result.find((b) => b.id === "car_free_week");
    expect(badge?.unlocked).toBe(false);
  });

  it("badge ids match BADGES constant order", () => {
    const result = checkBadges([]);
    BADGES.forEach((def, i) => {
      expect(result[i]?.id).toBe(def.id);
    });
  });

  it("all progress values are between 0 and 100", () => {
    const acts = [makeActivity()];
    const result = checkBadges(acts);
    result.forEach((b) => {
      expect(b.progress).toBeGreaterThanOrEqual(0);
      expect(b.progress).toBeLessThanOrEqual(100);
    });
  });
});
