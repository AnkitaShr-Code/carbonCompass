import { EMISSION_FACTORS, DAILY_BUDGET_1_5C } from "./emissionFactors";
import { ActivityEntry, CompassScore, PotentialSaving, UserProfile } from "./types";

/**
 * @description Calculates carbon emissions in kg CO2e for a given category, subtype, and quantity.
 * @param category - The main carbon category ('transport', 'food', 'energy', 'shopping', 'waste').
 * @param subtype - The specific emission subtype coefficient identifier.
 * @param quantity - The numerical quantity logged (must be positive).
 * @returns {number} The calculated carbon emissions in kg CO2e.
 * @throws {Error} If parameters are invalid or if the category/subtype is not found.
 */
export function calculateCO2e(
  category: 'transport' | 'food' | 'energy' | 'shopping' | 'waste',
  subtype: string,
  quantity: number
): number {
  if (typeof quantity !== "number" || isNaN(quantity) || !isFinite(quantity) || quantity <= 0) {
    throw new Error("quantity must be greater than 0");
  }

  const categoryData = (EMISSION_FACTORS as any)[category];
  if (!categoryData) {
    throw new Error(`Invalid category: "${category}".`);
  }

  const factorData = categoryData[subtype];
  if (!factorData) {
    throw new Error(`Invalid subtype: "${subtype}" inside category "${category}".`);
  }

  const co2e = factorData.factor * quantity;
  return parseFloat(co2e.toFixed(3));
}

/**
 * @description Maps a UserProfile country to the exact electricity subtype key in EMISSION_FACTORS.
 * @param country - The country selected in the UserProfile.
 * @returns {'electricity_in' | 'electricity_uk' | 'electricity_us' | 'electricity_de' | 'electricity_au'} The exact key identifier from the energy emission factor config.
 */
export function getElectricitySubtype(
  country: 'india' | 'uk' | 'usa' | 'germany' | 'australia'
): 'electricity_in' | 'electricity_uk' | 'electricity_us' | 'electricity_de' | 'electricity_au' {
  switch (country) {
    case "india":
      return "electricity_in";
    case "uk":
      return "electricity_uk";
    case "usa":
      return "electricity_us";
    case "germany":
      return "electricity_de";
    case "australia":
      return "electricity_au";
    default:
      const exhaustiveCheck: never = country;
      throw new Error(`Unmapped country profile: ${exhaustiveCheck}`);
  }
}

/**
 * @description Calculates total carbon emissions for a given date range.
 * @param activities - Array of ActivityEntry logged by the user.
 * @param startDate - The starting bounds Date object (inclusive).
 * @param endDate - The ending bounds Date object (inclusive).
 * @returns {number} Total emissions in kg CO2e.
 */
export function getTotalForPeriod(
  activities: ActivityEntry[],
  startDate: Date,
  endDate: Date
): number {
  const startMs = startDate.getTime();
  const endMs = endDate.getTime();

  const total = activities
    .filter((act) => {
      const actMs = new Date(act.timestamp).getTime();
      return actMs >= startMs && actMs <= endMs;
    })
    .reduce((sum, act) => sum + (act.co2e || 0), 0);

  return parseFloat(total.toFixed(3));
}

/**
 * @description Returns emission aggregates grouped by category for a specific range.
 * @param activities - Array of logged ActivityEntry.
 * @param startDate - Start bounds Date object.
 * @param endDate - End bounds Date object.
 * @returns {Partial<Record<'transport' | 'food' | 'energy' | 'shopping' | 'waste', number>>} An object mapping each category to its total kg CO2e.
 */
export function getCategoryBreakdown(
  activities: ActivityEntry[],
  startDate: Date,
  endDate: Date
): Partial<Record<'transport' | 'food' | 'energy' | 'shopping' | 'waste', number>> {
  const startMs = startDate.getTime();
  const endMs = endDate.getTime();

  const breakdown: Record<string, number> = {};

  activities
    .filter((act) => {
      const actMs = new Date(act.timestamp).getTime();
      return actMs >= startMs && actMs <= endMs;
    })
    .forEach((act) => {
      breakdown[act.category] = (breakdown[act.category] || 0) + (act.co2e || 0);
    });

  const result: Partial<Record<'transport' | 'food' | 'energy' | 'shopping' | 'waste', number>> = {};
  Object.keys(breakdown).forEach((k) => {
    const val = parseFloat(breakdown[k]!.toFixed(3));
    if (val > 0) {
      (result as any)[k] = val;
    }
  });

  return result;
}

/**
 * @description Translates kg CO2e emissions into standard environmental equivalents.
 * @param totalKg - Carbon footprint weight in kg CO2e.
 * @returns {{ trees: number; flights: number; beefMeals: number; smartphoneCharges: number }} An object containing calculated equivalences.
 */
export function getEquivalences(totalKg: number) {
  if (totalKg < 0 || isNaN(totalKg)) {
    return { trees: 0, flights: 0, beefMeals: 0, smartphoneCharges: 0 };
  }

  return {
    trees: parseFloat((totalKg / 21).toFixed(2)),
    flights: parseFloat((totalKg / 244).toFixed(2)),
    beefMeals: parseFloat((totalKg / 3.4).toFixed(2)),
    smartphoneCharges: Math.round(totalKg / 0.007),
  };
}

/**
 * @description Computes a streak-adjusted 0-100 scoring rating for the user based on their last 7 days of activities.
 * @param activities - Array of all logged ActivityEntry.
 * @param streak - Current consecutive logging streak days.
 * @returns {CompassScore} A CompassScore object containing rating, direction, and localized label.
 */
export function getCompassScore(
  activities: ActivityEntry[],
  streak: number
): CompassScore {
  const now = Date.now();
  const sevenDaysAgoMs = now - 7 * 24 * 60 * 60 * 1000;

  // Filter activities in the last 7 days
  const weeklyActivities = activities.filter(
    (act) => new Date(act.timestamp).getTime() >= sevenDaysAgoMs
  );

  const weeklyTotal = weeklyActivities.reduce((sum, act) => sum + (act.co2e || 0), 0);

  // 1. Calculate Base Budget score (up to 70 points)
  let base = 70;
  if (weeklyTotal > 0) {
    const budgetTarget = DAILY_BUDGET_1_5C * 7;
    const ratio = budgetTarget / weeklyTotal;
    base = parseFloat((Math.max(0, Math.min(ratio, 1)) * 70).toFixed(3));
  }

  // 2. Streak bonus (up to 14 points)
  const streakBonus = Math.min(Math.max(0, streak), 7) * 2;

  // 3. Category diversity bonus (up to 16 points)
  const uniqueCategories = new Set(weeklyActivities.map((act) => act.category));
  const categoriesLogged = uniqueCategories.size;
  const diversityBonus = (categoriesLogged / 5) * 16;

  // Compile total rating score
  const score = Math.max(0, Math.min(100, Math.round(base + streakBonus + diversityBonus)));

  // Map score to direction zones
  let direction: 'North' | 'Northeast' | 'East' | 'Southeast' | 'South';
  let desc: string;

  if (score >= 90) {
    direction = "North";
    desc = "On Track";
  } else if (score >= 70) {
    direction = "Northeast";
    desc = "Almost There";
  } else if (score >= 50) {
    direction = "East";
    desc = "Room to Improve";
  } else if (score >= 30) {
    direction = "Southeast";
    desc = "Needs Attention";
  } else {
    direction = "South";
    desc = "Off Course";
  }

  return {
    score,
    direction,
    label: `Heading ${direction} — ${desc}`,
  };
}

/**
 * @description Scans the last 7 days of activities and returns up to 5 potential swaps for carbon reduction.
 * @param profile - User profile config.
 * @param activities - Array of logged ActivityEntry.
 * @returns {PotentialSaving[]} Array of sorted PotentialSaving details.
 */
export function getPotentialSavings(
  profile: UserProfile,
  activities: ActivityEntry[]
): PotentialSaving[] {
  const now = Date.now();
  const sevenDaysAgoMs = now - 7 * 24 * 60 * 60 * 1000;

  // Filter activities to only the last 7 days
  const weeklyActivities = activities.filter(
    (act) => new Date(act.timestamp).getTime() >= sevenDaysAgoMs
  );

  // Group logged quantities by subtype
  const subtypeQuantities: Record<string, number> = {};
  weeklyActivities.forEach((act) => {
    subtypeQuantities[act.subtype] = (subtypeQuantities[act.subtype] || 0) + act.quantity;
  });

  const savings: PotentialSaving[] = [];

  // 1. Check car_petrol swaps
  const carPetrolQty = subtypeQuantities["car_petrol"] || 0;
  if (carPetrolQty > 0) {
    const factorFrom = EMISSION_FACTORS.transport.car_petrol.factor;

    // car_petrol -> bus
    const factorBus = EMISSION_FACTORS.transport.bus.factor;
    savings.push({
      fromSubtype: "car_petrol",
      toSubtype: "bus",
      weeklyQuantity: carPetrolQty,
      savingKgPerWeek: parseFloat(((factorFrom - factorBus) * carPetrolQty).toFixed(3)),
      category: "transport",
    });

    // car_petrol -> train
    const factorTrain = EMISSION_FACTORS.transport.train.factor;
    savings.push({
      fromSubtype: "car_petrol",
      toSubtype: "train",
      weeklyQuantity: carPetrolQty,
      savingKgPerWeek: parseFloat(((factorFrom - factorTrain) * carPetrolQty).toFixed(3)),
      category: "transport",
    });

    // car_petrol -> car_ev
    const factorEv = EMISSION_FACTORS.transport.car_ev.factor;
    savings.push({
      fromSubtype: "car_petrol",
      toSubtype: "car_ev",
      weeklyQuantity: carPetrolQty,
      savingKgPerWeek: parseFloat(((factorFrom - factorEv) * carPetrolQty).toFixed(3)),
      category: "transport",
    });
  }

  // 2. Check beef swaps
  const beefQty = subtypeQuantities["beef"] || 0;
  if (beefQty > 0) {
    const factorBeef = EMISSION_FACTORS.food.beef.factor;

    // beef -> chicken
    const factorChicken = EMISSION_FACTORS.food.chicken.factor;
    savings.push({
      fromSubtype: "beef",
      toSubtype: "chicken",
      weeklyQuantity: beefQty,
      savingKgPerWeek: parseFloat(((factorBeef - factorChicken) * beefQty).toFixed(3)),
      category: "food",
    });

    // beef -> legumes
    const factorLegumes = EMISSION_FACTORS.food.legumes.factor;
    savings.push({
      fromSubtype: "beef",
      toSubtype: "legumes",
      weeklyQuantity: beefQty,
      savingKgPerWeek: parseFloat(((factorBeef - factorLegumes) * beefQty).toFixed(3)),
      category: "food",
    });
  }

  // 3. Check waste swaps
  const landfillQty = subtypeQuantities["landfill"] || 0;
  if (landfillQty > 0) {
    const factorLandfill = EMISSION_FACTORS.waste.landfill.factor;
    const factorCompost = EMISSION_FACTORS.waste.composted.factor;

    savings.push({
      fromSubtype: "landfill",
      toSubtype: "composted",
      weeklyQuantity: landfillQty,
      savingKgPerWeek: parseFloat(((factorLandfill - factorCompost) * landfillQty).toFixed(3)),
      category: "waste",
    });
  }

  // 4. Check electricity (any region) swaps - reduce 20%
  const elecSubtypes = ["electricity_in", "electricity_uk", "electricity_us", "electricity_de", "electricity_au"];
  elecSubtypes.forEach((elecSubtype) => {
    const elecQty = subtypeQuantities[elecSubtype] || 0;
    if (elecQty > 0) {
      const factorElec = (EMISSION_FACTORS.energy as any)[elecSubtype].factor;
      savings.push({
        fromSubtype: elecSubtype,
        toSubtype: "electricity_reduced",
        weeklyQuantity: elecQty,
        savingKgPerWeek: parseFloat((factorElec * elecQty * 0.2).toFixed(3)),
        category: "energy",
      });
    }
  });

  // Filter out any zero saving cases, sort descending, slice top 5
  return savings
    .filter((s) => s.savingKgPerWeek > 0)
    .sort((a, b) => b.savingKgPerWeek - a.savingKgPerWeek)
    .slice(0, 5);
}
