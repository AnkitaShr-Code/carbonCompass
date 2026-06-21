import { describe, test, expect, beforeEach, vi } from "vitest";
import { validateActivityInput } from "../lib/sanitize";
import { calculateCO2e, getEquivalences, getCompassScore } from "../lib/carbonUtils";
import { saveActivities, getActivities } from "../lib/storage";
import { ActivityEntry } from "../lib/types";

const mockStorage: Record<string, string> = {};

beforeEach(() => {
  Object.keys(mockStorage).forEach((k) => delete mockStorage[k]);
  vi.stubGlobal("localStorage", {
    getItem: (key: string) => mockStorage[key] ?? null,
    setItem: (key: string, val: string) => {
      mockStorage[key] = val;
    },
    removeItem: (key: string) => {
      delete mockStorage[key];
    },
  });
});

describe("Integration Tests", () => {
  test("full activity logging flow", () => {
    // 1. Create a valid activity input (with timestamp to pass validation)
    const timestamp = new Date().toISOString();
    const input = {
      timestamp,
      category: "transport",
      subtype: "car_petrol",
      quantity: 50,
      unit: "km",
    };

    // 2. Validate it
    const validation = validateActivityInput(input);
    expect(validation.valid).toBe(true);

    // 3. Calculate CO2e
    const co2e = calculateCO2e("transport", "car_petrol", 50);
    expect(co2e).toBe(10.5);

    // 4. Save as activity
    const entry: ActivityEntry = {
      id: "test-1",
      timestamp,
      category: "transport",
      subtype: "car_petrol",
      quantity: 50,
      unit: "km",
      co2e,
    };
    saveActivities([entry]);

    // 5. Retrieve and verify
    const activities = getActivities();
    expect(activities).toHaveLength(1);
    expect(activities[0].co2e).toBe(10.5);

    // 6. Check equivalences
    const equiv = getEquivalences(10.5);
    expect(equiv.beefMeals).toBeCloseTo(3.09, 1);

    // 7. Check compass score doesn't crash
    const score = getCompassScore(activities, 1);
    expect(score.score).toBeGreaterThanOrEqual(0);
    expect(score.score).toBeLessThanOrEqual(100);
  });
});
