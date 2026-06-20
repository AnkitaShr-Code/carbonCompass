export interface UserProfile {
  name: string;
  country: 'india' | 'uk' | 'usa' | 'germany' | 'australia';
  lifestyle: 'city' | 'suburban' | 'rural';
  commute: 'walk_cycle' | 'public_transit' | 'car' | 'wfh';
  diet: 'daily_meat' | 'some_meat' | 'rarely_meat' | 'vegetarian';
  energySource: 'grid' | 'partly_renewable' | 'fully_renewable';
  setupComplete: boolean;
}

export interface ActivityEntry {
  id: string;                    // crypto.randomUUID() or custom safe random ID
  timestamp: string;             // ISO 8601
  category: 'transport' | 'food' | 'energy' | 'shopping' | 'waste';
  subtype: string;               // e.g., 'car_petrol', 'beef', 'electricity'
  quantity: number;              // always positive
  unit: string;                  // 'km', 'kg', 'kWh', 'item', 'hours'
  co2e: number;                  // calculated kg CO₂e
}

export interface InsightAction {
  title: string;
  description: string;
  estimatedSavingKg: number;
  effort: 'easy' | 'medium' | 'hard';
}

export interface InsightResponse {
  summary: string;
  actions: InsightAction[];
  equivalences: {
    trees: number;
    flights: number;
    beefMeals: number;
    smartphoneCharges: number;
  };
}

export interface GoalData {
  weeklyTargetKg: number;
  committedActions: string[];    // action titles the user has committed to
  badges: BadgeStatus[];
}

export interface BadgeStatus {
  id: string;
  name: string;
  description: string;
  unlocked: boolean;
  progress: number;              // 0-100
}

export interface CompassScore {
  score: number;                 // 0-100
  direction: 'North' | 'Northeast' | 'East' | 'Southeast' | 'South';
  label: string;                 // e.g., "Heading North — On Track"
}

export interface PotentialSaving {
  fromSubtype: string;           // e.g., 'car_petrol'
  toSubtype: string;             // e.g., 'bus'
  weeklyQuantity: number;        // estimated from user's recent data
  savingKgPerWeek: number;       // deterministic: (fromFactor - toFactor) * quantity
  category: string;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: number;
}
