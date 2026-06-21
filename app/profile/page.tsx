"use client";

import React from "react";
import { useCarbonTracker } from "../../hooks/useCarbonTracker";
import { getCompassScore } from "../../lib/carbonUtils";
import { STORAGE_KEYS } from "../../lib/storage";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { User, Globe, Activity, Award, RefreshCw } from "lucide-react";

export default function ProfilePage() {
  const { profile, activities, isLoaded } = useCarbonTracker();

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

  const countryLabels: Record<string, string> = {
    usa: "United States",
    uk: "United Kingdom",
    india: "India",
    germany: "Germany",
    australia: "Australia",
  };

  const lifestyleLabels: Record<string, string> = {
    city: "City apartment",
    suburban: "Suburban house",
    rural: "Rural setting",
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
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

            <div className="space-y-1 bg-gray-50 dark:bg-gray-800/30 p-3 rounded-lg border border-gray-100 dark:border-gray-800">
              <span className="text-[10px] uppercase font-bold text-gray-450 flex items-center gap-1">
                <Globe className="h-3.5 w-3.5 text-blue-500" /> Country / Region
              </span>
              <p className="text-sm font-bold text-gray-900 dark:text-white capitalize">
                {countryLabels[profile.country] || profile.country}
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
