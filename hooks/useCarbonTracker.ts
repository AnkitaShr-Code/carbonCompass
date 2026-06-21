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
import { validateActivityInput, sanitizeNumber } from "../lib/sanitize";
import { EMISSION_FACTORS } from "../lib/emissionFactors";
import { APP_CONSTANTS } from "../lib/constants";

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

/**
 * Hook to manage the global state of the CarbonTracker, including activities,
 * goals, and profile data. Also handles activity validation and persistence.
 *
 * @returns CarbonTracker state and mutation methods.
 */
export function useCarbonTracker() {
  const [activities, setActivities] = useState<ActivityEntry[]>([]);
  const [profile, setProfile] = useState<UserProfile>(DEFAULT_PROFILE);
  const [goals, setGoals] = useState<GoalData>(DEFAULT_GOALS);
  const [isLoaded, setIsLoaded] = useState(false);

  // Form logging states
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedCategory, setSelectedCategory] = useState<'transport' | 'food' | 'energy' | 'shopping' | 'waste' | null>(null);
  const [selectedSubtype, setSelectedSubtype] = useState<string | null>(null);
  const [quantity, setQuantity] = useState<string>("");
  const [formErrors, setFormErrors] = useState<string[]>([]);
  const [co2ePreview, setCo2ePreview] = useState<number>(0);
  const [lastLogged, setLastLogged] = useState<{ co2e: number; subtypeLabel: string } | null>(null);

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

  // Memoized function to calculate CO2e preview
  const calculatePreview = useCallback((cat: 'transport' | 'food' | 'energy' | 'shopping' | 'waste' | null, sub: string | null, qty: string) => {
    if (!cat || !sub || !qty) {
      setCo2ePreview(0);
      return;
    }
    const sanitized = sanitizeNumber(qty, APP_CONSTANTS.MIN_ACTIVITY_QUANTITY, APP_CONSTANTS.MAX_ACTIVITY_QUANTITY);
    if (sanitized === null || sanitized <= 0) {
      setCo2ePreview(0);
      return;
    }
    try {
      const preview = calculateCO2e(cat, sub, sanitized);
      setCo2ePreview(preview);
    } catch (err) {
      setCo2ePreview(0);
    }
  }, []);

  // Debounced live calculation of co2ePreview
  useEffect(() => {
    if (!selectedCategory || !selectedSubtype || !quantity) {
      setCo2ePreview(0);
      return;
    }

    const timer = setTimeout(() => {
      calculatePreview(selectedCategory, selectedSubtype, quantity);
    }, APP_CONSTANTS.DEBOUNCE_DELAY_MS);

    return () => clearTimeout(timer);
  }, [quantity, selectedCategory, selectedSubtype, calculatePreview]);

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

  const updateActivities = useCallback((newActivities: ActivityEntry[]) => {
    setActivities(newActivities);
    saveActivities(newActivities);
  }, []);

  const updateGoals = useCallback((newGoals: GoalData) => {
    setGoals(newGoals);
    saveGoals(newGoals);
  }, []);

  // Form Step Handlers
  const goNext = useCallback(() => {
    setFormErrors([]);
    if (currentStep === 1) {
      if (!selectedCategory) {
        setFormErrors(["Please select a category to proceed."]);
        return;
      }
      setCurrentStep(2);
    } else if (currentStep === 2) {
      if (!selectedSubtype) {
        setFormErrors(["Please select a subtype to proceed."]);
        return;
      }
      setCurrentStep(3);
    }
  }, [currentStep, selectedCategory, selectedSubtype]);

  const goBack = useCallback(() => {
    setFormErrors([]);
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
    }
  }, [currentStep]);

  const setFormCategory = useCallback((cat: 'transport' | 'food' | 'energy' | 'shopping' | 'waste' | null) => {
    setSelectedCategory(cat);
    setSelectedSubtype(null);
    setQuantity("");
    setFormErrors([]);
    if (cat) {
      setCurrentStep(2);
    }
  }, []);

  const setFormSubtype = useCallback((sub: string | null) => {
    setSelectedSubtype(sub);
    setQuantity("");
    setFormErrors([]);
    if (sub) {
      setCurrentStep(3);
    }
  }, []);

  const submitActivity = useCallback(() => {
    setFormErrors([]);
    if (!selectedCategory || !selectedSubtype) {
      setFormErrors(["Form is incomplete."]);
      return false;
    }

    const sanitizedQty = sanitizeNumber(quantity, APP_CONSTANTS.MIN_ACTIVITY_QUANTITY, APP_CONSTANTS.MAX_ACTIVITY_QUANTITY);
    if (sanitizedQty === null || sanitizedQty <= 0) {
      setFormErrors([`Quantity must be greater than ${APP_CONSTANTS.MIN_ACTIVITY_QUANTITY} and at most ${APP_CONSTANTS.MAX_ACTIVITY_QUANTITY}.`]);
      return false;
    }

    const rawInput = {
      timestamp: new Date().toISOString(),
      category: selectedCategory,
      subtype: selectedSubtype,
      quantity: sanitizedQty,
    };

    const validation = validateActivityInput(rawInput);
    if (!validation.valid || !validation.sanitized) {
      setFormErrors(validation.errors);
      return false;
    }

    const newEntry: ActivityEntry = {
      id: typeof crypto !== "undefined" && typeof crypto.randomUUID === "function" 
          ? crypto.randomUUID() 
          : Math.random().toString(36).substring(2, 11),
      timestamp: validation.sanitized.timestamp!,
      category: validation.sanitized.category!,
      subtype: validation.sanitized.subtype!,
      quantity: validation.sanitized.quantity!,
      unit: validation.sanitized.unit!,
      co2e: validation.sanitized.co2e!,
    };

    const factorInfo = (EMISSION_FACTORS as any)[selectedCategory][selectedSubtype];
    setLastLogged({
      co2e: newEntry.co2e,
      subtypeLabel: factorInfo?.label || selectedSubtype,
    });

    const updated = [newEntry, ...activities];
    setActivities(updated);
    saveActivities(updated);

    setSelectedCategory(null);
    setSelectedSubtype(null);
    setQuantity("");
    setCo2ePreview(0);
    setFormErrors([]);
    setCurrentStep(4);
    return true;
  }, [activities, selectedCategory, selectedSubtype, quantity]);

  const resetForm = useCallback(() => {
    setSelectedCategory(null);
    setSelectedSubtype(null);
    setQuantity("");
    setFormErrors([]);
    setCo2ePreview(0);
    setLastLogged(null);
    setCurrentStep(1);
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
    updateActivities,
    updateGoals,

    // Form settings
    currentStep,
    selectedCategory,
    selectedSubtype,
    quantity,
    formErrors,
    co2ePreview,
    lastLogged,
    setQuantity,
    setFormCategory,
    setFormSubtype,
    goNext,
    goBack,
    submitActivity,
    resetForm,
  };
}
