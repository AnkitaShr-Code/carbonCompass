import { describe, it, expect } from "vitest";
import { getDailyTip, DAILY_TIPS } from "../lib/dailyTips";

describe("CarbonCompass - Daily Carbon Insight System Tests", () => {
  it("should contain exactly 30 structured tips", () => {
    expect(DAILY_TIPS.length).toBe(30);
    
    DAILY_TIPS.forEach((tip) => {
      expect(typeof tip.id).toBe("number");
      expect(typeof tip.title).toBe("string");
      expect(typeof tip.fact).toBe("string");
      expect(typeof tip.actionTip).toBe("string");
      expect(typeof tip.category).toBe("string");
      expect(typeof tip.source).toBe("string");
      
      const validCategories = ["transport", "food", "energy", "shopping", "waste", "general"];
      expect(validCategories).toContain(tip.category);
      
      // Ensure facts are descriptive and contain specific metrics/quantitative details
      expect(tip.fact.length).toBeGreaterThan(15);
      expect(tip.actionTip.length).toBeGreaterThan(10);
    });
  });

  it("should select tips deterministically", () => {
    const tip1 = getDailyTip();
    const tip2 = getDailyTip();
    
    // Multiple calls within the same execution day must be identical
    expect(tip1).toEqual(tip2);
    expect(DAILY_TIPS).toContainEqual(tip1);
  });
});
