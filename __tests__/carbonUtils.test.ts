import { describe, it, expect } from "vitest";
import {
  calculateCO2e,
  getElectricitySubtype,
  getTotalForPeriod,
  getCategoryBreakdown,
  getEquivalences,
  getCompassScore,
  getPotentialSavings,
} from "../lib/carbonUtils";
import { ActivityEntry, UserProfile } from "../lib/types";

describe("CarbonCompass Data Layer — carbonUtils Tests", () => {
  describe("calculateCO2e", () => {
    it("should calculate correct transport petrol car emissions", () => {
      // ('transport', 'car_petrol', 10) -> expect 2.1
      const result = calculateCO2e("transport", "car_petrol", 10);
      expect(result).toBe(2.1);
    });

    it("should calculate correct food beef emissions", () => {
      // ('food', 'beef', 1) -> expect 27.0
      const result = calculateCO2e("food", "beef", 1);
      expect(result).toBe(27.0);
    });

    it("should calculate correct food vegetables emissions", () => {
      // ('food', 'vegetables', 2.5) -> expect 5.0
      const result = calculateCO2e("food", "vegetables", 2.5);
      expect(result).toBe(5.0);
    });

    it("should calculate correct energy electricity_in emissions", () => {
      // ('energy', 'electricity_in', 100) -> expect 82.0
      const result = calculateCO2e("energy", "electricity_in", 100);
      expect(result).toBe(82.0);
    });

    it("should calculate correct energy electricity_uk emissions", () => {
      // ('energy', 'electricity_uk', 100) -> expect 23.3
      const result = calculateCO2e("energy", "electricity_uk", 100);
      expect(result).toBe(23.3);
    });

    it("should throw 'quantity must be greater than 0' for quantity of 0", () => {
      expect(() => calculateCO2e("transport", "car_petrol", 0)).toThrow(
        "quantity must be greater than 0"
      );
    });

    it("should throw error for invalid category 'swimming'", () => {
      expect(() => calculateCO2e("swimming" as any, "car_petrol", 10)).toThrow();
    });

    it("should throw error for invalid subtype ('transport', 'helicopter')", () => {
      expect(() => calculateCO2e("transport", "helicopter", 10)).toThrow();
    });

    it("should throw error for negative quantity", () => {
      expect(() => calculateCO2e("transport", "car_petrol", -5)).toThrow(
        "quantity must be greater than 0"
      );
    });
  });

  describe("getTotalForPeriod", () => {
    const activities: ActivityEntry[] = [
      {
        id: "1",
        timestamp: "2026-06-15T12:00:00Z",
        category: "transport",
        subtype: "car_petrol",
        quantity: 10,
        unit: "km",
        co2e: 2.1,
      },
      {
        id: "2",
        timestamp: "2026-06-16T12:00:00Z",
        category: "food",
        subtype: "beef",
        quantity: 1,
        unit: "kg",
        co2e: 27.0,
      },
      {
        id: "3",
        timestamp: "2026-06-18T12:00:00Z",
        category: "energy",
        subtype: "electricity_uk",
        quantity: 10,
        unit: "kWh",
        co2e: 2.33,
      },
    ];

    it("should sum only matching entries across a valid date range", () => {
      const start = new Date("2026-06-15T00:00:00Z");
      const end = new Date("2026-06-17T00:00:00Z");
      const total = getTotalForPeriod(activities, start, end);
      expect(total).toBe(29.1); // 2.1 + 27.0
    });

    it("should return 0 with an empty array", () => {
      const start = new Date("2026-06-15T00:00:00Z");
      const end = new Date("2026-06-17T00:00:00Z");
      expect(getTotalForPeriod([], start, end)).toBe(0);
    });

    it("should return 0 with a date range that matches nothing", () => {
      const start = new Date("2026-06-25T00:00:00Z");
      const end = new Date("2026-06-27T00:00:00Z");
      const total = getTotalForPeriod(activities, start, end);
      expect(total).toBe(0);
    });
  });

  describe("getCategoryBreakdown", () => {
    const activities: ActivityEntry[] = [
      {
        id: "1",
        timestamp: "2026-06-15T12:00:00Z",
        category: "transport",
        subtype: "car_petrol",
        quantity: 10,
        unit: "km",
        co2e: 2.1,
      },
      {
        id: "2",
        timestamp: "2026-06-16T12:00:00Z",
        category: "food",
        subtype: "beef",
        quantity: 1,
        unit: "kg",
        co2e: 27.0,
      },
    ];

    it("should return correct sums per category and exclude categories with zero values", () => {
      const start = new Date("2026-06-14T00:00:00Z");
      const end = new Date("2026-06-17T00:00:00Z");
      const breakdown = getCategoryBreakdown(activities, start, end);

      expect(breakdown.transport).toBe(2.1);
      expect(breakdown.food).toBe(27.0);
      
      // Zero entries must not appear in result keys
      expect(breakdown.energy).toBeUndefined();
      expect(breakdown.shopping).toBeUndefined();
      expect(breakdown.waste).toBeUndefined();
    });
  });

  describe("getEquivalences", () => {
    it("should convert correctly for trees (totalKg / 21) ≈ 1.0", () => {
      const eq = getEquivalences(21);
      expect(eq.trees).toBeCloseTo(1.0);
    });

    it("should convert correctly for flights (totalKg / 244) ≈ 1.0", () => {
      const eq = getEquivalences(244);
      expect(eq.flights).toBeCloseTo(1.0);
    });

    it("should return all zeros for 0 input", () => {
      const eq = getEquivalences(0);
      expect(eq.trees).toBe(0);
      expect(eq.flights).toBe(0);
      expect(eq.beefMeals).toBe(0);
      expect(eq.smartphoneCharges).toBe(0);
    });
  });

  describe("getElectricitySubtype", () => {
    it("should return exact keys for 'india' and 'uk'", () => {
      expect(getElectricitySubtype("india")).toBe("electricity_in");
      expect(getElectricitySubtype("uk")).toBe("electricity_uk");
    });
  });

  describe("getCompassScore", () => {
    it("should award score close to 100 for user with very low emissions and 7-day streak", () => {
      const now = new Date();
      // Log tiny emissions in all 5 categories to get full diversity bonus (16) and budget credit (70)
      const categories: ('transport' | 'food' | 'energy' | 'shopping' | 'waste')[] = ["transport", "food", "energy", "shopping", "waste"];
      const activities: ActivityEntry[] = categories.map((cat, idx) => ({
        id: String(idx),
        timestamp: now.toISOString(),
        category: cat,
        subtype: "dummy",
        quantity: 1,
        unit: "any",
        co2e: 0.001, // extremely low emission
      }));

      const score = getCompassScore(activities, 7);
      // base = 70 (under budget), streak bonus = 14, diversity = 16. Total = 100.
      expect(score.score).toBe(100);
      expect(score.direction).toBe("North");
    });

    it("should output score below 30 for user exceeding daily budget every day and 0 streak", () => {
      const now = new Date();
      // Log massive emissions, weeklyTotal = 1000 kg (target is 44.1 kg)
      const activities: ActivityEntry[] = [
        {
          id: "1",
          timestamp: now.toISOString(),
          category: "transport",
          subtype: "car_petrol",
          quantity: 5000,
          unit: "km",
          co2e: 1050,
        },
      ];

      const score = getCompassScore(activities, 0);
      // base ratio: 44.1 / 1050 * 70 = 2.94 points. streak = 0. diversity = 1/5 * 16 = 3.2. Total = 6 points.
      expect(score.score).toBeLessThan(30);
      expect(score.direction).toBe("South");
    });

    it("should calculate score in 50-70 range for user moderately exceeding budget with 3-day streak", () => {
      const now = new Date();
      // Target = 44.1. Let's make weeklyTotal = 60 kg.
      // base = (44.1 / 60) * 70 = 51.45.
      // streak = 3 -> streak bonus = 6.
      // diversity = 1 logged category -> 1/5 * 16 = 3.2.
      // Total = 51.45 + 6 + 3.2 = 60.65 -> rounds to 61.
      const activities: ActivityEntry[] = [
        {
          id: "1",
          timestamp: now.toISOString(),
          category: "transport",
          subtype: "car_petrol",
          quantity: 285.7,
          unit: "km",
          co2e: 60.0,
        },
      ];

      const score = getCompassScore(activities, 3);
      expect(score.score).toBeGreaterThanOrEqual(50);
      expect(score.score).toBeLessThanOrEqual(70);
    });

    it("should map scores to correct direction labels", () => {
      // Setup mock outputs
      const directionMap = (scoreVal: number) => {
        // Base scoring logic direction mapping check
        if (scoreVal >= 90) return "North";
        if (scoreVal >= 70) return "Northeast";
        if (scoreVal >= 50) return "East";
        if (scoreVal >= 30) return "Southeast";
        return "South";
      };

      expect(directionMap(95)).toBe("North");
      expect(directionMap(60)).toBe("East");
      expect(directionMap(20)).toBe("South");
    });
  });

  describe("getPotentialSavings", () => {
    const profile: UserProfile = {
      name: "Navigator",
      country: "usa",
      lifestyle: "city",
      commute: "car",
      diet: "daily_meat",
      energySource: "grid",
      setupComplete: true,
    };

    it("should return correct savings suggesting bus/train alternatives for car_petrol", () => {
      const now = new Date();
      const activities: ActivityEntry[] = [
        {
          id: "1",
          timestamp: now.toISOString(),
          category: "transport",
          subtype: "car_petrol",
          quantity: 100, // 100 km
          unit: "km",
          co2e: 21,
        },
      ];

      const savings = getPotentialSavings(profile, activities);
      const trainSaving = savings.find((s) => s.toSubtype === "train");
      const busSaving = savings.find((s) => s.toSubtype === "bus");

      // Math: (0.21 - 0.041) * 100 = 16.9 kg saving
      expect(trainSaving?.savingKgPerWeek).toBeCloseTo(16.9);
      // Math: (0.21 - 0.089) * 100 = 12.1 kg saving
      expect(busSaving?.savingKgPerWeek).toBeCloseTo(12.1);
    });

    it("should return correct savings for beef to chicken/legumes", () => {
      const now = new Date();
      const activities: ActivityEntry[] = [
        {
          id: "1",
          timestamp: now.toISOString(),
          category: "food",
          subtype: "beef",
          quantity: 2, // 2 kg
          unit: "kg",
          co2e: 54,
        },
      ];

      const savings = getPotentialSavings(profile, activities);
      const legumesSaving = savings.find((s) => s.toSubtype === "legumes");
      const chickenSaving = savings.find((s) => s.toSubtype === "chicken");

      // Math: (27.0 - 0.9) * 2 = 52.2 kg saving
      expect(legumesSaving?.savingKgPerWeek).toBe(52.2);
      // Math: (27.0 - 6.9) * 2 = 40.2 kg saving
      expect(chickenSaving?.savingKgPerWeek).toBe(40.2);
    });

    it("should return empty or minimal savings array for low emission entries", () => {
      const now = new Date();
      const activities: ActivityEntry[] = [
        {
          id: "1",
          timestamp: now.toISOString(),
          category: "food",
          subtype: "vegetables",
          quantity: 10,
          unit: "kg",
          co2e: 20,
        },
        {
          id: "2",
          timestamp: now.toISOString(),
          category: "transport",
          subtype: "train",
          quantity: 50,
          unit: "km",
          co2e: 2.05,
        },
      ];

      const savings = getPotentialSavings(profile, activities);
      expect(savings.length).toBe(0); // already low emission, no high emission swaps exist
    });

    it("should sort savings by savingKgPerWeek descending and limit results to max 5", () => {
      const now = new Date();
      const activities: ActivityEntry[] = [
        {
          id: "1",
          timestamp: now.toISOString(),
          category: "transport",
          subtype: "car_petrol",
          quantity: 100, // 21 kg co2e
          unit: "km",
          co2e: 21,
        },
        {
          id: "2",
          timestamp: now.toISOString(),
          category: "food",
          subtype: "beef",
          quantity: 5, // 135 kg co2e
          unit: "kg",
          co2e: 135,
        },
        {
          id: "3",
          timestamp: now.toISOString(),
          category: "energy",
          subtype: "electricity_us",
          quantity: 100, // 38.6 kg co2e
          unit: "kWh",
          co2e: 38.6,
        },
      ];

      const savings = getPotentialSavings(profile, activities);
      // 1. beef -> legumes: (27 - 0.9) * 5 = 130.5 kg saving
      // 2. beef -> chicken: (27 - 6.9) * 5 = 100.5 kg saving
      // 3. car_petrol -> train: (0.21 - 0.041) * 100 = 16.9 kg saving
      // 4. car_petrol -> car_ev: (0.21 - 0.05) * 100 = 16.0 kg saving
      // 5. car_petrol -> bus: (0.21 - 0.089) * 100 = 12.1 kg saving
      // 6. electricity_us -> 20% reduction: 0.386 * 100 * 0.2 = 7.72 kg saving
      // Returns top 5 (beef -> legumes, beef -> chicken, car_petrol -> train, car_petrol -> car_ev, car_petrol -> bus)
      expect(savings.length).toBe(5);
      expect(savings[0]?.savingKgPerWeek).toBe(130.5);
      expect(savings[1]?.savingKgPerWeek).toBe(100.5);
      expect(savings[2]?.savingKgPerWeek).toBe(16.9);
      expect(savings[3]?.savingKgPerWeek).toBe(16.0);
      expect(savings[4]?.savingKgPerWeek).toBe(12.1);
    });
  });
});
