import { ActivityEntry, ChatMessage, GoalData, UserProfile } from "./types";

/**
 * Storage key constants matching spec version namespace v1.
 */
export const STORAGE_KEYS = {
  ACTIVITIES: "carboncompass_activities_v1",
  PROFILE: "carboncompass_profile_v1",
  GOALS: "carboncompass_goals_v1",
} as const;

/**
 * Verifies if window local storage is available in the current context.
 */
function isStorageAvailable(): boolean {
  if (typeof window === "undefined") return false;
  try {
    const testKey = "__storage_check__";
    window.localStorage.setItem(testKey, testKey);
    window.localStorage.removeItem(testKey);
    return true;
  } catch {
    return false;
  }
}

/**
 * @description Safely saves the user's activity entries array.
 * @param entries - Array of logged ActivityEntry.
 * @returns {void}
 */
export function saveActivities(entries: ActivityEntry[]): void {
  if (!isStorageAvailable()) return;
  try {
    window.localStorage.setItem(STORAGE_KEYS.ACTIVITIES, JSON.stringify(entries));
  } catch (error) {
    console.error("Failed to save activities:", error);
  }
}

/**
 * @description Safely retrieves activity entries from local storage.
 * @returns {ActivityEntry[]} Array of saved ActivityEntry items, or empty array.
 */
export function getActivities(): ActivityEntry[] {
  if (!isStorageAvailable()) return [];
  try {
    const item = window.localStorage.getItem(STORAGE_KEYS.ACTIVITIES);
    if (!item) return [];
    return JSON.parse(item) as ActivityEntry[];
  } catch (error) {
    console.error("Failed to load or parse activities:", error);
    return [];
  }
}

/**
 * @description Safely saves the user's profile information.
 * @param profile - UserProfile config structure.
 * @returns {void}
 */
export function saveProfile(profile: UserProfile): void {
  if (!isStorageAvailable()) return;
  try {
    window.localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(profile));
  } catch (error) {
    console.error("Failed to save profile:", error);
  }
}

/**
 * @description Safely retrieves the user's profile.
 * @returns {UserProfile | null} Saved UserProfile object or null.
 */
export function getProfile(): UserProfile | null {
  if (!isStorageAvailable()) return null;
  try {
    const item = window.localStorage.getItem(STORAGE_KEYS.PROFILE);
    if (!item) return null;
    return JSON.parse(item) as UserProfile;
  } catch (error) {
    console.error("Failed to load or parse profile:", error);
    return null;
  }
}

/**
 * @description Safely saves the user's goals structure.
 * @param goals - Target GoalData metrics.
 * @returns {void}
 */
export function saveGoals(goals: GoalData): void {
  if (!isStorageAvailable()) return;
  try {
    window.localStorage.setItem(STORAGE_KEYS.GOALS, JSON.stringify(goals));
  } catch (error) {
    console.error("Failed to save goals:", error);
  }
}

/**
 * @description Safely retrieves goals data.
 * @returns {GoalData | null} GoalData or null if not created.
 */
export function getGoals(): GoalData | null {
  if (!isStorageAvailable()) return null;
  try {
    const item = window.localStorage.getItem(STORAGE_KEYS.GOALS);
    if (!item) return null;
    return JSON.parse(item) as GoalData;
  } catch (error) {
    console.error("Failed to load or parse goals:", error);
    return null;
  }
}/**
 * @description Safely saves the user's AI coach chat message history.
 * @param history - Array of ChatMessage items.
 * @returns {void}
 */
export function saveChatHistory(history: ChatMessage[]): void {
  if (!isStorageAvailable()) return;
  try {
    window.localStorage.setItem("carboncompass_chat_history_v1", JSON.stringify(history));
  } catch (error) {
    console.error("Failed to save chat history:", error);
  }
}

/**
 * @description Safely retrieves chat history.
 * @param fallback - The default fallback chat history.
 * @returns {ChatMessage[]} Array of saved ChatMessage items, or fallback.
 */
export function getChatHistory(fallback: ChatMessage[]): ChatMessage[] {
  if (!isStorageAvailable()) return fallback;
  try {
    const item = window.localStorage.getItem("carboncompass_chat_history_v1");
    if (!item) return fallback;
    return JSON.parse(item) as ChatMessage[];
  } catch (error) {
    console.error("Failed to load or parse chat history:", error);
    return fallback;
  }
}
