"use client";

import React, { useState, useRef, useEffect } from "react";
import { useCarbonTracker } from "../../hooks/useCarbonTracker";
import { getCompassScore, getElectricitySubtype, calculateCO2e } from "../../lib/carbonUtils";
import { EMISSION_FACTORS } from "../../lib/emissionFactors";
import { sanitizeString } from "../../lib/sanitize";
import { STORAGE_KEYS } from "../../lib/storage";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { User, Globe, Activity, Award, RefreshCw, CheckCircle } from "lucide-react";

export default function ProfilePage() {
  const { profile, activities, isLoaded, updateProfile, updateActivities } = useCarbonTracker();
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const toastTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      if (toastTimeoutRef.current) {
        clearTimeout(toastTimeoutRef.current);
      }
    };
  }, []);

  if (!isLoaded) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-500 border-t-transparent mx-auto" />
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-300">Loading profile data...</p>
        </div>
      </div>
    );
  }

  // Calculate lifetime emissions
  const totalLifetimeCo2 = activities.reduce((sum, act) => sum + (act.co2e || 0), 0);

  // Calculate consecutive logging streak days
  const calculateStreak = () => {
    if (activities.length === 0) return 0;
    const dates = Array.from(
      new Set(
        activities.map((a) => new Date(a.timestamp).toISOString().split("T")[0])
      )
    ).sort((a, b) => {
      const valA = a || "";
      const valB = b || "";
      return valB.localeCompare(valA);
    });

    const todayStr = new Date().toISOString().split("T")[0];
    const yesterdayStr = new Date(Date.now() - 86400000).toISOString().split("T")[0];

    const firstDate = dates[0];
    if (!firstDate || (firstDate !== todayStr && firstDate !== yesterdayStr)) {
      return 0;
    }

    let streak = 0;
    const currentDate = new Date(firstDate);

    for (let i = 0; i < dates.length; i++) {
      const dStr = dates[i] || "";
      const expectedStr = currentDate.toISOString().split("T")[0];
      if (dStr === expectedStr) {
        streak++;
        currentDate.setDate(currentDate.getDate() - 1);
      } else {
        break;
      }
    }
    return streak;
  };

  const streak = calculateStreak();
  const compassScore = getCompassScore(activities, streak);

  const handleReset = () => {
    if (
      window.confirm(
        "Are you sure you want to reset all your data? This will permanently delete all activities, profile settings, and chat history. This action cannot be undone."
      )
    ) {
      Object.values(STORAGE_KEYS).forEach((key) => {
        localStorage.removeItem(key);
      });
      localStorage.removeItem("carboncompass_tour_done");
      localStorage.removeItem("carboncompass_chat_history_v1");
      
      // Force reload to trigger onboarding wizard
      window.location.reload();
    }
  };

  const handleCountryChange = (newCountry: string) => {
    // 1. Sanitize input before saving
    const sanitized = sanitizeString(newCountry, 30).toLowerCase();
    const validCountries = ["india", "uk", "usa", "germany", "australia"];
    if (!validCountries.includes(sanitized)) {
      return;
    }

    const countryVal = sanitized as "india" | "uk" | "usa" | "germany" | "australia";

    // 2. Remap electricity activities strictly by subtype prefix "electricity_" and recalculate CO2e
    const updatedActivities = activities.map((act) => {
      if (act.category === "energy" && act.subtype.startsWith("electricity_")) {
        const newSubtype = getElectricitySubtype(countryVal);
        try {
          const recalculatedCo2e = calculateCO2e("energy", newSubtype, act.quantity);
          const factorInfo = EMISSION_FACTORS.energy[newSubtype];
          return {
            ...act,
            subtype: newSubtype,
            unit: factorInfo.unit,
            co2e: recalculatedCo2e,
          };
        } catch (err) {
          console.error("Recalculation failed for activity:", act.id, err);
        }
      }
      return act;
    });

    // 3. Save profile and activities
    const updatedProfile = {
      ...profile,
      country: countryVal,
    };
    updateProfile(updatedProfile);
    updateActivities(updatedActivities);

    // 4. Show confirmation toast
    const countryLabelsMap: Record<string, string> = {
      usa: "United States",
      uk: "United Kingdom",
      india: "India",
      germany: "Germany",
      australia: "Australia",
    };
    const displayCountry = countryLabelsMap[countryVal] || countryVal;
    setToastMsg(`Location updated to ${displayCountry}`);

    if (toastTimeoutRef.current) {
      clearTimeout(toastTimeoutRef.current);
    }
    toastTimeoutRef.current = setTimeout(() => {
      setToastMsg(null);
    }, 4000);
  };

  const lifestyleLabels: Record<string, string> = {
    city: "City apartment",
    suburban: "Suburban house",
    rural: "Rural setting",
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fade-in relative">
      {/* Confirmation Toast Notification */}
      {toastMsg && (
        <div 
          role="status"
          aria-live="polite"
          className="fixed bottom-5 right-5 z-50 flex items-center gap-2.5 bg-emerald-600 dark:bg-emerald-500 text-white px-4 py-3 rounded-lg shadow-xl animate-slide-up-fade-in text-sm font-semibold border border-emerald-500/10"
        >
          <CheckCircle className="h-5 w-5 text-emerald-100" />
          <span>{toastMsg}</span>
        </div>
      )}

      <div>
        <h2 className="text-2xl font-extrabold tracking-tight text-gray-900 dark:text-white sm:text-3xl">
          User Settings & Profile
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-300">
          View your environmental profile and overall CarbonCompass score.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-1.5 text-primary-800 dark:text-primary-400">
            <User className="h-5 w-5" />
            Profile Information
          </CardTitle>
          <CardDescription>Initial settings completed during onboarding.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1 bg-gray-50 dark:bg-gray-800/30 p-3 rounded-lg border border-gray-100 dark:border-gray-800">
              <span className="text-[10px] uppercase font-bold text-gray-450">Name</span>
              <p className="text-sm font-bold text-gray-900 dark:text-white">{profile.name}</p>
            </div>

            <div className="space-y-1.5 bg-gray-50 dark:bg-gray-800/30 p-3 rounded-lg border border-gray-100 dark:border-gray-800 flex flex-col justify-center">
              <label 
                htmlFor="profile-country" 
                className="text-[10px] uppercase font-bold text-gray-455 flex items-center gap-1 cursor-pointer"
              >
                <Globe className="h-3.5 w-3.5 text-blue-500" /> Country / Region
              </label>
              <select
                id="profile-country"
                value={profile.country}
                onChange={(e) => handleCountryChange(e.target.value)}
                className="mt-1 block w-full rounded-md border border-gray-300 bg-white dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100 px-2 py-1.5 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-gray-900 cursor-pointer"
              >
                <option value="india">🇮🇳 India</option>
                <option value="uk">🇬🇧 United Kingdom</option>
                <option value="usa">🇺🇸 United States</option>
                <option value="germany">🇩🇪 Germany</option>
                <option value="australia">🇦🇺 Australia</option>
              </select>
              <p className="text-[10px] text-gray-500 dark:text-gray-400 leading-normal mt-1">
                Changing your location updates electricity emission factors and adjusts AI recommendations to your region.
              </p>
            </div>

            <div className="space-y-1 bg-gray-50 dark:bg-gray-800/30 p-3 rounded-lg border border-gray-100 dark:border-gray-800 sm:col-span-2">
              <span className="text-[10px] uppercase font-bold text-gray-450">Lifestyle Setting</span>
              <p className="text-sm font-bold text-gray-900 dark:text-white">
                {lifestyleLabels[profile.lifestyle] || profile.lifestyle}
              </p>
            </div>
          </div>

          <div className="border-t border-gray-100 dark:border-gray-850 pt-6 grid gap-4 sm:grid-cols-2">
            {/* Lifetime emissions card */}
            <div className="flex items-center gap-3 bg-gray-50 dark:bg-gray-800/30 p-4 rounded-xl border border-gray-100 dark:border-gray-800">
              <div className="p-2.5 rounded-lg bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400">
                <Activity className="h-5 w-5" />
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-gray-450 block">Lifetime CO₂e Logged</span>
                <span className="text-lg font-black text-gray-950 dark:text-white">
                  {totalLifetimeCo2.toFixed(1)} kg
                </span>
              </div>
            </div>

            {/* Compass score card */}
            <div className="flex items-center gap-3 bg-gray-50 dark:bg-gray-800/30 p-4 rounded-xl border border-gray-100 dark:border-gray-800">
              <div className="p-2.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400">
                <Award className="h-5 w-5" />
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-gray-455 block">Compass Score Rating</span>
                <span className="text-lg font-black text-gray-950 dark:text-white flex items-center gap-1.5">
                  {compassScore.score}
                  <span className="text-xs font-semibold text-gray-500 dark:text-gray-300">
                    ({compassScore.direction})
                  </span>
                </span>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-100 dark:border-gray-855 pt-6">
            <Button
              onClick={handleReset}
              variant="danger"
              className="w-full sm:w-auto flex items-center justify-center gap-1.5"
            >
              <RefreshCw className="h-4 w-4" /> Reset All Application Data
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
