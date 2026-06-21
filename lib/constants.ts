/**
 * Global constants and configuration for CarbonCompass.
 */

export const APP_CONSTANTS = {
  // Animation & UI Delays
  DEBOUNCE_DELAY_MS: 300,
  ANIMATION_DURATION_MS: 800,
  TOOLTIP_DELAY_MS: 600,
  SCORE_ANIMATION_MS: 1000,
  
  // Validation Limits
  MAX_ACTIVITY_QUANTITY: 10000,
  MIN_ACTIVITY_QUANTITY: 0,
  MAX_WEEKLY_TARGET_KG: 500,
  MIN_WEEKLY_TARGET_KG: 1,

  // Display & Pagination Limits
  MAX_RECENT_ACTIVITIES: 15,
  MAX_POTENTIAL_SAVINGS: 5,
  DAYS_IN_WEEK: 7,
  DAYS_IN_MONTH: 30,

  // API Limits
  MAX_PAYLOAD_SIZE_BYTES: 10240, // 10KB
};
