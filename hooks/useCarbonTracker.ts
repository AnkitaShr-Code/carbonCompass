"use client";

import { useState, useEffect, useCallback } from "react";
import { ActivityEntry, UserProfile, GoalData, BadgeStatus } from "../lib/types";
import { 
  getActivities, 
  saveActivities, 
  getProfile, 
  saveProfile, 
  getGoals, 
  saveGoals 
} from "../lib/storage";
import { 
  calculateCO2e, 
  getElectricitySubtype 
} from "../lib/carbonUtils";
import { validateActivityInput } from "../lib/sanitize";

const DEFAULT_PROFILE: UserProfile = {
  name: "Eco Navigator",
  country: "usa",
  lifestyle: "city",
  commute: "public_transit",
  diet: "some_meat",
  energySource: "grid",
  setupComplete: false,
};

const DEFAULT_GOALS: GoalData = {
  weeklyTargetKg: 44.1, // 6.3 * 7
  committedActions: [],
  badges: [
    {
      id: "badge-1",
      name: "Carbon Rookie",
      description: "First emission activity recorded on CarbonCompass.",
      unlocked: false,
      progress: 0,
    },
    {
      id: "badge-2",
      name: "Plant Powered",
      description: "Log plant-based legumes meal items.",
      unlocked: false,
      progress: 0,
    },
  ],
};

export function useCarbonTracker() {
  const [activities, setActivities] = useState<ActivityEntry[]>([]);
  const [profile, setProfile] = useState<UserProfile>(DEFAULT_PROFILE);
  const [goals, setGoals] = useState<GoalData>(DEFAULT_GOALS);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load storage states on client mount
  useEffect(() => {
    const loadedActs = getActivities();
    const loadedProf = getProfile() || DEFAULT_PROFILE;
    const loadedGoals = getGoals() || DEFAULT_GOALS;

    setActivities(loadedActs);
    setProfile(loadedProf);
    setGoals(loadedGoals);
    setIsLoaded(true);
  }, []);

  const addActivity = useCallback((
    activityInput: Omit<ActivityEntry, "id" | "timestamp" | "co2e" | "unit">
  ): { success: boolean; errors: string[]; entry?: ActivityEntry } => {
    
    // Prepare validation object
    const rawInput = {
      timestamp: new Date().toISOString(),
      category: activityInput.category,
      subtype: activityInput.subtype,
      quantity: activityInput.quantity,
    };

    const validation = validateActivityInput(rawInput);
    if (!validation.valid || !validation.sanitized) {
      return { success: false, errors: validation.errors };
    }

    const sanitized = validation.sanitized;
    const newEntry: ActivityEntry = {
      id: typeof crypto !== "undefined" && typeof crypto.randomUUID === "function" 
          ? crypto.randomUUID() 
          : Math.random().toString(36).substring(2, 11),
      timestamp: sanitized.timestamp!,
      category: sanitized.category!,
      subtype: sanitized.subtype!,
      quantity: sanitized.quantity!,
      unit: sanitized.unit!,
      co2e: sanitized.co2e!,
    };

    const updated = [newEntry, ...activities];
    setActivities(updated);
    saveActivities(updated);

    return { success: true, errors: [], entry: newEntry };
  }, [activities]);

  const deleteActivity = useCallback((id: string) => {
    const updated = activities.filter((act) => act.id !== id);
    setActivities(updated);
    saveActivities(updated);
  }, [activities]);

  const clearAllActivities = useCallback(() => {
    setActivities([]);
    saveActivities([]);
  }, []);

  const updateProfile = useCallback((newProfile: UserProfile) => {
    setProfile(newProfile);
    saveProfile(newProfile);
  }, []);

  const updateGoals = useCallback((newGoals: GoalData) => {
    setGoals(newGoals);
    saveGoals(newGoals);
  }, []);

  return {
    activities,
    profile,
    goals,
    isLoaded,
    addActivity,
    deleteActivity,
    clearAllActivities,
    updateProfile,
    updateGoals,
  };
}
