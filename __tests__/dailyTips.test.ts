import { describe, it, expect, vi } from "vitest";
import { getDailyTip, DAILY_TIPS, DailyTip } from "../lib/dailyTips";

describe("CarbonCompass - Daily Carbon Insight System Tests", () => {
  it("should contain exactly 30 structured tips", () => {
    expect(DAILY_TIPS.length).toBe(30);
  });

  it("should have all 30 tips with non-empty title, fact, actionTip, and source", () => {
    DAILY_TIPS.forEach((tip) => {
      expect(tip.title).toBeDefined();
      expect(typeof tip.title).toBe("string");
      expect(tip.title.trim()).not.toBe("");

      expect(tip.fact).toBeDefined();
      expect(typeof tip.fact).toBe("string");
      expect(tip.fact.trim()).not.toBe("");

      expect(tip.actionTip).toBeDefined();
      expect(typeof tip.actionTip).toBe("string");
      expect(tip.actionTip.trim()).not.toBe("");

      expect(tip.source).toBeDefined();
      expect(typeof tip.source).toBe("string");
      expect(tip.source.trim()).not.toBe("");
    });
  });

  it("should have a valid category from the allowed list for all 30 tips", () => {
    const validCategories = ["transport", "food", "energy", "shopping", "waste", "general"];
    DAILY_TIPS.forEach((tip) => {
      expect(tip.category).toBeDefined();
      expect(validCategories).toContain(tip.category);
    });
  });

  it("getDailyTip() returns a valid DailyTip object with all required fields", () => {
    const tip = getDailyTip();
    expect(tip).toBeDefined();
    expect(typeof tip.id).toBe("number");
    expect(typeof tip.title).toBe("string");
    expect(typeof tip.fact).toBe("string");
    expect(typeof tip.actionTip).toBe("string");
    expect(typeof tip.category).toBe("string");
    expect(typeof tip.source).toBe("string");
  });

  it("getDailyTip() returns the same tip when called twice on the same day", () => {
    const tip1 = getDailyTip();
    const tip2 = getDailyTip();
    expect(tip1).toEqual(tip2);
  });

  it("the tip index wraps correctly (day 31 returns same as day 1)", () => {
    // Enable system time fake timers
    vi.useFakeTimers();

    // Set mock time to January 1, 2026 (day of year = 1)
    vi.setSystemTime(new Date("2026-01-01T12:00:00Z"));
    const tipDay1 = getDailyTip();

    // Set mock time to January 31, 2026 (day of year = 31)
    vi.setSystemTime(new Date("2026-01-31T12:00:00Z"));
    const tipDay31 = getDailyTip();

    // Since there are 30 tips, index is dayOfYear % 30
    // 1 % 30 = 1
    // 31 % 30 = 1
    // Therefore they must wrap and return the identical tip.
    expect(tipDay1).toEqual(tipDay31);

    // Restore real timers
    vi.useRealTimers();
  });
});
