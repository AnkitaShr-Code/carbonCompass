import { ActivityEntry, UserProfile, GoalData } from "./types";

/**
 * Generates a deterministic ISO timestamp for N days ago at a given hour.
 */
function daysAgo(days: number, hour = 9, minute = 0): string {
  const d = new Date();
  d.setDate(d.getDate() - days);
  d.setHours(hour, minute, 0, 0);
  return d.toISOString();
}

let _idCounter = 1;
function mockId(): string {
  return `mock-${String(_idCounter++).padStart(4, "0")}`;
}

/**
 * 14 days of realistic sample data covering all 5 categories with varied subtypes.
 * Used for the hackathon demo mode on the Dashboard.
 */
export const MOCK_ACTIVITIES: ActivityEntry[] = [
  // Day 0 (today)
  { id: mockId(), timestamp: daysAgo(0, 8), category: "transport", subtype: "car_petrol", quantity: 22, unit: "km", co2e: parseFloat((0.21 * 22).toFixed(3)) },
  { id: mockId(), timestamp: daysAgo(0, 13), category: "food", subtype: "chicken", quantity: 0.3, unit: "kg", co2e: parseFloat((6.9 * 0.3).toFixed(3)) },
  { id: mockId(), timestamp: daysAgo(0, 19), category: "energy", subtype: "electricity_in", quantity: 8, unit: "kWh", co2e: parseFloat((0.82 * 8).toFixed(3)) },

  // Day 1
  { id: mockId(), timestamp: daysAgo(1, 8), category: "transport", subtype: "car_petrol", quantity: 22, unit: "km", co2e: parseFloat((0.21 * 22).toFixed(3)) },
  { id: mockId(), timestamp: daysAgo(1, 12), category: "food", subtype: "beef", quantity: 0.25, unit: "kg", co2e: parseFloat((27.0 * 0.25).toFixed(3)) },
  { id: mockId(), timestamp: daysAgo(1, 18), category: "waste", subtype: "landfill", quantity: 3, unit: "kg", co2e: parseFloat((0.58 * 3).toFixed(3)) },

  // Day 2
  { id: mockId(), timestamp: daysAgo(2, 8), category: "transport", subtype: "bus", quantity: 18, unit: "km", co2e: parseFloat((0.089 * 18).toFixed(3)) },
  { id: mockId(), timestamp: daysAgo(2, 12), category: "food", subtype: "vegetables", quantity: 0.5, unit: "kg", co2e: parseFloat((2.0 * 0.5).toFixed(3)) },
  { id: mockId(), timestamp: daysAgo(2, 20), category: "energy", subtype: "electricity_in", quantity: 10, unit: "kWh", co2e: parseFloat((0.82 * 10).toFixed(3)) },
  { id: mockId(), timestamp: daysAgo(2, 16), category: "shopping", subtype: "delivery", quantity: 2, unit: "item", co2e: parseFloat((0.5 * 2).toFixed(3)) },

  // Day 3
  { id: mockId(), timestamp: daysAgo(3, 9), category: "transport", subtype: "car_petrol", quantity: 30, unit: "km", co2e: parseFloat((0.21 * 30).toFixed(3)) },
  { id: mockId(), timestamp: daysAgo(3, 13), category: "food", subtype: "dairy", quantity: 0.5, unit: "kg", co2e: parseFloat((3.2 * 0.5).toFixed(3)) },
  { id: mockId(), timestamp: daysAgo(3, 19), category: "energy", subtype: "electricity_in", quantity: 12, unit: "kWh", co2e: parseFloat((0.82 * 12).toFixed(3)) },

  // Day 4
  { id: mockId(), timestamp: daysAgo(4, 8), category: "transport", subtype: "car_petrol", quantity: 22, unit: "km", co2e: parseFloat((0.21 * 22).toFixed(3)) },
  { id: mockId(), timestamp: daysAgo(4, 12), category: "food", subtype: "beef", quantity: 0.3, unit: "kg", co2e: parseFloat((27.0 * 0.3).toFixed(3)) },
  { id: mockId(), timestamp: daysAgo(4, 15), category: "shopping", subtype: "clothing", quantity: 1, unit: "item", co2e: parseFloat((10.0 * 1).toFixed(3)) },
  { id: mockId(), timestamp: daysAgo(4, 19), category: "waste", subtype: "recycled", quantity: 2, unit: "kg", co2e: parseFloat((0.02 * 2).toFixed(3)) },

  // Day 5
  { id: mockId(), timestamp: daysAgo(5, 8), category: "transport", subtype: "train", quantity: 45, unit: "km", co2e: parseFloat((0.041 * 45).toFixed(3)) },
  { id: mockId(), timestamp: daysAgo(5, 12), category: "food", subtype: "chicken", quantity: 0.25, unit: "kg", co2e: parseFloat((6.9 * 0.25).toFixed(3)) },
  { id: mockId(), timestamp: daysAgo(5, 18), category: "energy", subtype: "electricity_in", quantity: 7, unit: "kWh", co2e: parseFloat((0.82 * 7).toFixed(3)) },

  // Day 6
  { id: mockId(), timestamp: daysAgo(6, 10), category: "transport", subtype: "bus", quantity: 20, unit: "km", co2e: parseFloat((0.089 * 20).toFixed(3)) },
  { id: mockId(), timestamp: daysAgo(6, 13), category: "food", subtype: "legumes", quantity: 0.4, unit: "kg", co2e: parseFloat((0.9 * 0.4).toFixed(3)) },
  { id: mockId(), timestamp: daysAgo(6, 20), category: "energy", subtype: "electricity_in", quantity: 11, unit: "kWh", co2e: parseFloat((0.82 * 11).toFixed(3)) },
  { id: mockId(), timestamp: daysAgo(6, 16), category: "waste", subtype: "composted", quantity: 1.5, unit: "kg", co2e: parseFloat((0.01 * 1.5).toFixed(3)) },

  // Day 7
  { id: mockId(), timestamp: daysAgo(7, 8), category: "transport", subtype: "car_petrol", quantity: 22, unit: "km", co2e: parseFloat((0.21 * 22).toFixed(3)) },
  { id: mockId(), timestamp: daysAgo(7, 12), category: "food", subtype: "beef", quantity: 0.2, unit: "kg", co2e: parseFloat((27.0 * 0.2).toFixed(3)) },
  { id: mockId(), timestamp: daysAgo(7, 19), category: "energy", subtype: "electricity_in", quantity: 9, unit: "kWh", co2e: parseFloat((0.82 * 9).toFixed(3)) },

  // Day 8 — short flight day
  { id: mockId(), timestamp: daysAgo(8, 6), category: "transport", subtype: "flight_short", quantity: 800, unit: "km", co2e: parseFloat((0.255 * 800).toFixed(3)) },
  { id: mockId(), timestamp: daysAgo(8, 14), category: "food", subtype: "chicken", quantity: 0.3, unit: "kg", co2e: parseFloat((6.9 * 0.3).toFixed(3)) },
  { id: mockId(), timestamp: daysAgo(8, 20), category: "waste", subtype: "landfill", quantity: 2, unit: "kg", co2e: parseFloat((0.58 * 2).toFixed(3)) },

  // Day 9
  { id: mockId(), timestamp: daysAgo(9, 9), category: "transport", subtype: "car_petrol", quantity: 22, unit: "km", co2e: parseFloat((0.21 * 22).toFixed(3)) },
  { id: mockId(), timestamp: daysAgo(9, 13), category: "food", subtype: "fish", quantity: 0.2, unit: "kg", co2e: parseFloat((3.5 * 0.2).toFixed(3)) },
  { id: mockId(), timestamp: daysAgo(9, 19), category: "energy", subtype: "electricity_in", quantity: 10, unit: "kWh", co2e: parseFloat((0.82 * 10).toFixed(3)) },
  { id: mockId(), timestamp: daysAgo(9, 15), category: "shopping", subtype: "delivery", quantity: 1, unit: "item", co2e: parseFloat((0.5 * 1).toFixed(3)) },

  // Day 10
  { id: mockId(), timestamp: daysAgo(10, 8), category: "transport", subtype: "bus", quantity: 15, unit: "km", co2e: parseFloat((0.089 * 15).toFixed(3)) },
  { id: mockId(), timestamp: daysAgo(10, 12), category: "food", subtype: "vegetables", quantity: 0.6, unit: "kg", co2e: parseFloat((2.0 * 0.6).toFixed(3)) },
  { id: mockId(), timestamp: daysAgo(10, 18), category: "energy", subtype: "electricity_in", quantity: 8, unit: "kWh", co2e: parseFloat((0.82 * 8).toFixed(3)) },

  // Day 11
  { id: mockId(), timestamp: daysAgo(11, 9), category: "transport", subtype: "car_petrol", quantity: 25, unit: "km", co2e: parseFloat((0.21 * 25).toFixed(3)) },
  { id: mockId(), timestamp: daysAgo(11, 13), category: "food", subtype: "beef", quantity: 0.25, unit: "kg", co2e: parseFloat((27.0 * 0.25).toFixed(3)) },
  { id: mockId(), timestamp: daysAgo(11, 19), category: "energy", subtype: "electricity_in", quantity: 9, unit: "kWh", co2e: parseFloat((0.82 * 9).toFixed(3)) },
  { id: mockId(), timestamp: daysAgo(11, 16), category: "shopping", subtype: "electronics", quantity: 1, unit: "item", co2e: parseFloat((70.0 * 1).toFixed(3)) },

  // Day 12
  { id: mockId(), timestamp: daysAgo(12, 8), category: "transport", subtype: "car_petrol", quantity: 22, unit: "km", co2e: parseFloat((0.21 * 22).toFixed(3)) },
  { id: mockId(), timestamp: daysAgo(12, 12), category: "food", subtype: "eggs", quantity: 0.3, unit: "kg", co2e: parseFloat((4.8 * 0.3).toFixed(3)) },
  { id: mockId(), timestamp: daysAgo(12, 20), category: "energy", subtype: "electricity_in", quantity: 11, unit: "kWh", co2e: parseFloat((0.82 * 11).toFixed(3)) },
  { id: mockId(), timestamp: daysAgo(12, 15), category: "waste", subtype: "landfill", quantity: 2.5, unit: "kg", co2e: parseFloat((0.58 * 2.5).toFixed(3)) },

  // Day 13
  { id: mockId(), timestamp: daysAgo(13, 8), category: "transport", subtype: "train", quantity: 40, unit: "km", co2e: parseFloat((0.041 * 40).toFixed(3)) },
  { id: mockId(), timestamp: daysAgo(13, 12), category: "food", subtype: "chicken", quantity: 0.25, unit: "kg", co2e: parseFloat((6.9 * 0.25).toFixed(3)) },
  { id: mockId(), timestamp: daysAgo(13, 18), category: "energy", subtype: "electricity_in", quantity: 8, unit: "kWh", co2e: parseFloat((0.82 * 8).toFixed(3)) },
  { id: mockId(), timestamp: daysAgo(13, 16), category: "shopping", subtype: "delivery", quantity: 1, unit: "item", co2e: parseFloat((0.5 * 1).toFixed(3)) },
];

/**
 * Demo user profile — India, city lifestyle.
 */
export const MOCK_PROFILE: UserProfile = {
  name: "Demo User",
  country: "india",
  lifestyle: "city",
  commute: "car",
  diet: "some_meat",
  energySource: "grid",
  setupComplete: true,
};

/**
 * Demo goal data with 2 committed actions.
 */
export const MOCK_GOALS: GoalData = {
  weeklyTargetKg: 44.1,
  committedActions: ["Switch car_petrol → bus for 3 days/week", "Reduce electricity usage by 20%"],
  badges: [
    {
      id: "badge-1",
      name: "Carbon Rookie",
      description: "First emission activity recorded on CarbonCompass.",
      unlocked: true,
      progress: 100,
    },
    {
      id: "badge-2",
      name: "Plant Powered",
      description: "Log plant-based legumes meal items.",
      unlocked: true,
      progress: 100,
    },
  ],
};
