import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  saveActivities,
  getActivities,
  saveProfile,
  getProfile,
  saveGoals,
  getGoals,
  saveChatHistory,
  getChatHistory,
} from "../lib/storage";
import { ActivityEntry, UserProfile, GoalData } from "../lib/types";

const mockStorage: Record<string, string> = {};

beforeEach(() => {
  // Clear mock storage
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

describe("Storage utility methods", () => {
  const dummyActivities: ActivityEntry[] = [
    {
      id: "1",
      timestamp: "2026-06-20T12:00:00.000Z",
      category: "transport",
      subtype: "car_petrol",
      quantity: 10,
      unit: "km",
      co2e: 2.1,
    },
    {
      id: "2",
      timestamp: "2026-06-21T12:00:00.000Z",
      category: "food",
      subtype: "beef",
      quantity: 0.5,
      unit: "kg",
      co2e: 13.5,
    },
    {
      id: "3",
      timestamp: "2026-06-21T15:00:00.000Z",
      category: "energy",
      subtype: "electricity_grid",
      quantity: 50,
      unit: "kWh",
      co2e: 20.0,
    },
  ];

  const dummyProfile: UserProfile = {
    name: "Jane Doe",
    country: "canada",
    lifestyle: "suburban",
    commute: "car",
    diet: "vegan",
    energySource: "clean",
    setupComplete: true,
  };

  const dummyGoals: GoalData = {
    weeklyTargetKg: 30,
    committedActions: ["action_1", "action_2"],
    badges: [],
  };

  // ─── Test saveActivities + getActivities ────────────────────────────────────
  describe("saveActivities + getActivities", () => {
    it("saves 3 entries and retrieves them successfully", () => {
      saveActivities(dummyActivities);
      const retrieved = getActivities();
      expect(retrieved).toHaveLength(3);
      expect(retrieved).toEqual(dummyActivities);
    });

    it("saves an empty array and retrieves an empty array", () => {
      saveActivities([]);
      const retrieved = getActivities();
      expect(retrieved).toEqual([]);
    });

    it("returns empty array and does not throw when storage JSON is corrupted", () => {
      mockStorage["carboncompass_activities_v1"] = "{invalid-json";
      const consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
      const retrieved = getActivities();
      expect(retrieved).toEqual([]);
      expect(consoleErrorSpy).toHaveBeenCalled();
      consoleErrorSpy.mockRestore();
    });
  });

  // ─── Test saveProfile + getProfile ──────────────────────────────────────────
  describe("saveProfile + getProfile", () => {
    it("saves a valid profile and retrieves it successfully", () => {
      saveProfile(dummyProfile);
      const retrieved = getProfile();
      expect(retrieved).toEqual(dummyProfile);
    });

    it("returns null when no profile exists in storage", () => {
      const retrieved = getProfile();
      expect(retrieved).toBeNull();
    });

    it("returns null and does not throw when profile storage is corrupted JSON", () => {
      mockStorage["carboncompass_profile_v1"] = "not json";
      const consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
      const retrieved = getProfile();
      expect(retrieved).toBeNull();
      expect(consoleErrorSpy).toHaveBeenCalled();
      consoleErrorSpy.mockRestore();
    });
  });

  // ─── Test saveGoals + getGoals ──────────────────────────────────────────────
  describe("saveGoals + getGoals", () => {
    it("saves goals and retrieves them successfully", () => {
      saveGoals(dummyGoals);
      const retrieved = getGoals();
      expect(retrieved).toEqual(dummyGoals);
    });

    it("returns null when no goals exist in storage", () => {
      const retrieved = getGoals();
      expect(retrieved).toBeNull();
    });

    it("returns null and does not throw when goals storage is corrupted JSON", () => {
      mockStorage["carboncompass_goals_v1"] = "{[";
      const consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
      const retrieved = getGoals();
      expect(retrieved).toBeNull();
      expect(consoleErrorSpy).toHaveBeenCalled();
      consoleErrorSpy.mockRestore();
    });
  });

  // ─── Test saveChatHistory + getChatHistory ──────────────────────────────────
  describe("saveChatHistory + getChatHistory", () => {
    const dummyHistory = [
      { id: "msg-1", role: "user" as const, content: "Hello" },
      { id: "msg-2", role: "assistant" as const, content: "Hi there!" },
    ];
    const fallbackHistory = [
      { id: "msg-fallback", role: "assistant" as const, content: "Fallback" },
    ];

    it("saves chat history and retrieves it successfully", () => {
      saveChatHistory(dummyHistory);
      const retrieved = getChatHistory(fallbackHistory);
      expect(retrieved).toEqual(dummyHistory);
    });

    it("returns fallback history when no chat history exists in storage", () => {
      const retrieved = getChatHistory(fallbackHistory);
      expect(retrieved).toEqual(fallbackHistory);
    });

    it("returns fallback history and does not throw when chat history storage is corrupted JSON", () => {
      mockStorage["carboncompass_chat_history_v1"] = "{[chat";
      const consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
      const retrieved = getChatHistory(fallbackHistory);
      expect(retrieved).toEqual(fallbackHistory);
      expect(consoleErrorSpy).toHaveBeenCalled();
      consoleErrorSpy.mockRestore();
    });
  });
});
