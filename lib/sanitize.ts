import { EMISSION_FACTORS } from "./emissionFactors";
import { ActivityEntry } from "./types";
import { APP_CONSTANTS } from "./constants";

/**
 * Strips basic HTML tags, trims, and truncates a string to a max length.
 * 
 * @param str - The input string.
 * @param maxLen - The maximum allowed length.
 * @returns The sanitized, safe string.
 */
export function sanitizeString(str: string, maxLen: number): string {
  if (typeof str !== "string") return "";
  
  // Remove simple HTML tags
  const clean = str.replace(/<[^>]*>/g, "").trim();
  
  if (clean.length > maxLen) {
    return clean.substring(0, maxLen);
  }
  return clean;
}

/**
 * Parses and clamps a number between safe boundaries. Returns null if invalid or NaN.
 * 
 * @param val - Unknown number input.
 * @param min - Minimum bound.
 * @param max - Maximum bound.
 * @returns The clamped number value or null.
 */
export function sanitizeNumber(
  val: unknown,
  min: number,
  max: number
): number | null {
  if (val === null || val === undefined) return null;

  const num = typeof val === "number" ? val : parseFloat(String(val));
  if (isNaN(num) || !isFinite(num)) {
    return null;
  }

  return Math.min(Math.max(num, min), max);
}

/**
 * Validates structural activity entries, cross-referencing keys and coefficients inside EMISSION_FACTORS.
 * 
 * @param input - Mapped fields to validate.
 * @returns Validation state, error list, and sanitized output.
 */
export function validateActivityInput(input: unknown): {
  valid: boolean;
  errors: string[];
  sanitized?: Partial<ActivityEntry>;
} {
  const errors: string[] = [];

  if (!input || typeof input !== "object") {
    return { valid: false, errors: ["Input must be an object."] };
  }

  const data = input as any;

  // 1. Verify Timestamp format
  if (typeof data.timestamp !== "string" || isNaN(Date.parse(data.timestamp))) {
    errors.push("Invalid timestamp. Must be a valid ISO 8601 string.");
  }

  // 2. Verify Category mapping
  const validCategories = ["transport", "food", "energy", "shopping", "waste"];
  if (data.category === undefined || data.category === null || data.category === "") {
    errors.push("category is required");
  } else if (typeof data.category !== "string" || !validCategories.includes(data.category)) {
    errors.push(`Invalid category. Must be one of: ${validCategories.join(", ")}.`);
  }

  // 3. Verify Subtype mapping
  if (typeof data.subtype !== "string" || !data.subtype.trim()) {
    errors.push("Subtype is required.");
  } else if (typeof data.category === "string" && validCategories.includes(data.category)) {
    const categoryConfig = (EMISSION_FACTORS as any)[data.category];
    if (!categoryConfig || !categoryConfig[data.subtype]) {
      errors.push(`invalid subtype: "${data.subtype}"`);
    }
  }

  // 4. Verify Quantity rules
  const quantity = sanitizeNumber(data.quantity, APP_CONSTANTS.MIN_ACTIVITY_QUANTITY, APP_CONSTANTS.MAX_ACTIVITY_QUANTITY);
  if (quantity === null || quantity <= APP_CONSTANTS.MIN_ACTIVITY_QUANTITY) {
    errors.push(`quantity must be greater than ${APP_CONSTANTS.MIN_ACTIVITY_QUANTITY}`);
  }

  const valid = errors.length === 0;
  if (!valid) {
    return { valid, errors };
  }

  // Build the sanitized, type-safe output incorporating emission constants
  const cat = data.category as 'transport' | 'food' | 'energy' | 'shopping' | 'waste';
  const sub = data.subtype as string;
  const factorInfo = (EMISSION_FACTORS as any)[cat][sub];

  const sanitized: Partial<ActivityEntry> = {
    timestamp: data.timestamp,
    category: cat,
    subtype: sub,
    quantity: quantity!,
    unit: factorInfo.unit,
    co2e: parseFloat((factorInfo.factor * quantity!).toFixed(3)),
  };

  return {
    valid,
    errors,
    sanitized,
  };
}
