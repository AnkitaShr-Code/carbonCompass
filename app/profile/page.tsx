"use client";

import React, { useState, useEffect } from "react";
import { useCarbonTracker } from "../../hooks/useCarbonTracker";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "../../components/ui/Card";
import { Input } from "../../components/ui/Input";
import { Button } from "../../components/ui/Button";
import { Select } from "../../components/ui/Select";
import { Settings, Info, Check } from "lucide-react";

export default function ProfilePage() {
  const { profile, updateProfile, goals, updateGoals, isLoaded } = useCarbonTracker();
  const [name, setName] = useState("");
  const [country, setCountry] = useState("usa");
  const [lifestyle, setLifestyle] = useState("city");
  const [commute, setCommute] = useState("public_transit");
  const [diet, setDiet] = useState("some_meat");
  const [energySource, setEnergySource] = useState("grid");
  const [weeklyTarget, setWeeklyTarget] = useState("44.1");
  const [showSaved, setShowSaved] = useState(false);

  // Sync state when profile loads
  useEffect(() => {
    if (isLoaded) {
      setName(profile.name);
      setCountry(profile.country);
      setLifestyle(profile.lifestyle);
      setCommute(profile.commute);
      setDiet(profile.diet);
      setEnergySource(profile.energySource);
      setWeeklyTarget(goals.weeklyTargetKg.toString());
    }
  }, [isLoaded, profile, goals]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile({
      name,
      country: country as any,
      lifestyle: lifestyle as any,
      commute: commute as any,
      diet: diet as any,
      energySource: energySource as any,
      setupComplete: true,
    });
    updateGoals({
      ...goals,
      weeklyTargetKg: parseFloat(weeklyTarget) || 44.1,
    });
    setShowSaved(true);
    setTimeout(() => {
      setShowSaved(false);
    }, 3000);
  };

  const countries = [
    { value: "usa", label: "🇺🇸 United States" },
    { value: "uk", label: "🇬🇧 United Kingdom" },
    { value: "india", label: "🇮🇳 India" },
    { value: "germany", label: "🇩🇪 Germany" },
    { value: "australia", label: "🇦🇺 Australia" },
  ];

  const lifestyles = [
    { value: "city", label: "🌆 City Dweller" },
    { value: "suburban", label: "🏡 Suburban Area" },
    { value: "rural", label: "🌳 Rural / Countryside" },
  ];

  const commutes = [
    { value: "walk_cycle", label: "🚶 Walking / Cycling" },
    { value: "public_transit", label: "🚌 Public Transit (Bus/Train)" },
    { value: "car", label: "🚗 Personal Automobile" },
    { value: "wfh", label: "💻 Work from Home" },
  ];

  const diets = [
    { value: "daily_meat", label: "🥩 Daily Meat" },
    { value: "some_meat", label: "🍗 Moderate Meat" },
    { value: "rarely_meat", label: "🥗 Rarely Meat (Flexitarian)" },
    { value: "vegetarian", label: "🌱 Vegetarian / Vegan" },
  ];

  const energySources = [
    { value: "grid", label: "🔌 Utility Grid Power" },
    { value: "partly_renewable", label: "🌤️ Mixed / Solar Panels" },
    { value: "fully_renewable", label: "☀️ 100% Green / Off-grid" },
  ];

  if (!isLoaded) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-500 border-t-transparent mx-auto" />
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">Loading profile settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
      <div>
        <h2 className="text-2xl font-extrabold tracking-tight text-gray-900 dark:text-white sm:text-3xl">
          User Settings Profile
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Manage your lifestyle profiles, geographic constants, and weekly budget cap targets.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-1.5 text-primary-800 dark:text-primary-400">
            <Settings className="h-5 w-5" />
            Account Configuration
          </CardTitle>
          <CardDescription>All fields are persisted locally in your browser.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5 sm:col-span-2">
                <label className="text-xs font-bold uppercase tracking-wider text-gray-505 dark:text-gray-400">Display Name</label>
                <Input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter name"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-gray-505 dark:text-gray-400">Country/Region</label>
                <Select
                  options={countries}
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-gray-505 dark:text-gray-400">Lifestyle Setting</label>
                <Select
                  options={lifestyles}
                  value={lifestyle}
                  onChange={(e) => setLifestyle(e.target.value)}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-gray-505 dark:text-gray-400">Primary Commute</label>
                <Select
                  options={commutes}
                  value={commute}
                  onChange={(e) => setCommute(e.target.value)}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-gray-505 dark:text-gray-400">Diet Habit</label>
                <Select
                  options={diets}
                  value={diet}
                  onChange={(e) => setDiet(e.target.value)}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-gray-505 dark:text-gray-400">Household Energy</label>
                <Select
                  options={energySources}
                  value={energySource}
                  onChange={(e) => setEnergySource(e.target.value)}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-gray-550 dark:text-gray-400">
                  Weekly Carbon Target (kg CO₂e)
                </label>
                <Input
                  type="number"
                  step="0.1"
                  value={weeklyTarget}
                  onChange={(e) => setWeeklyTarget(e.target.value)}
                  placeholder="Weekly target cap"
                  required
                />
              </div>
            </div>

            <div className="text-[10px] text-gray-450 leading-normal flex items-start gap-1.5 mt-2 bg-gray-50 dark:bg-gray-800/40 p-2.5 rounded-md border border-gray-100 dark:border-gray-800">
              <Info className="h-3.5 w-3.5 mt-0.5 shrink-0 text-primary-500" />
              <span>
                Your geographic country adjusts the electricity carbon coefficient dynamically. 
                Setting a lower weekly cap challenges you to reduce emissions in line with climate goals (e.g. 1.5°C threshold).
              </span>
            </div>

            {showSaved && (
              <div className="rounded-md bg-emerald-50 dark:bg-emerald-950/40 p-3 text-xs text-emerald-800 dark:text-emerald-300 flex items-center gap-1.5">
                <Check className="h-4 w-4" />
                Profile and goals updated successfully.
              </div>
            )}

            <Button type="submit" className="w-full">
              Save Configuration
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
