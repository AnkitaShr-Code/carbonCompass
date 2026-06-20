"use client";

import React from "react";
import { useCarbonTracker } from "../../hooks/useCarbonTracker";
import { ActivityForm } from "../../components/tracker/ActivityForm";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "../../components/ui/Card";
import { ArrowRight, Info, Compass, HelpCircle } from "lucide-react";
import Link from "next/link";

export default function TrackerPage() {
  const { addActivity, isLoaded } = useCarbonTracker();

  if (!isLoaded) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-500 border-t-transparent mx-auto" />
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">Loading tracker...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h2 className="text-2xl font-extrabold tracking-tight text-gray-900 dark:text-white sm:text-3xl">
          Carbon Activity Tracker
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Log daily activities to estimate and review carbon impact.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Form (Colspan 2) */}
        <div className="lg:col-span-2">
          <ActivityForm onAddActivity={addActivity} />
        </div>

        {/* Sidebar Info/Tips */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-1.5 text-accent-900 dark:text-accent-400">
                <Compass className="h-4.5 w-4.5" />
                Footprint Benchmarks
              </CardTitle>
              <CardDescription>Average carbon weights to keep in mind:</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3.5 text-xs text-gray-600 dark:text-gray-400">
              <div className="flex justify-between border-b border-gray-100 dark:border-gray-800 pb-1.5">
                <span>🚗 10km Petrol Car Commute</span>
                <span className="font-bold text-gray-900 dark:text-white">1.7 kg CO₂e</span>
              </div>
              <div className="flex justify-between border-b border-gray-100 dark:border-gray-800 pb-1.5">
                <span>✈️ Short Flight (under 1500km)</span>
                <span className="font-bold text-gray-900 dark:text-white">~245 kg CO₂e / hr</span>
              </div>
              <div className="flex justify-between border-b border-gray-100 dark:border-gray-800 pb-1.5">
                <span>⚡ Average Home electricity (10 kWh)</span>
                <span className="font-bold text-gray-900 dark:text-white">3.7 kg CO₂e</span>
              </div>
              <div className="flex justify-between border-b border-gray-100 dark:border-gray-800 pb-1.5">
                <span>🥩 1 Beef steak meal (omnivore)</span>
                <span className="font-bold text-gray-900 dark:text-white">4.8 kg CO₂e</span>
              </div>
              <div className="flex justify-between border-b border-gray-100 dark:border-gray-800 pb-1.5">
                <span>🥗 1 Plant-based vegan meal</span>
                <span className="font-bold text-gray-900 dark:text-white">0.45 kg CO₂e</span>
              </div>
              <div className="flex justify-between pb-1">
                <span>🗑️ 10 kg Landfilled trash</span>
                <span className="font-bold text-gray-900 dark:text-white">6.1 kg CO₂e</span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-primary-50/50 dark:bg-primary-950/10 border-primary-100 dark:border-primary-900/30">
            <CardContent className="pt-6 space-y-3">
              <div className="flex gap-2">
                <Info className="h-5 w-5 text-primary-800 dark:text-primary-400 shrink-0" />
                <h4 className="text-sm font-bold text-primary-800 dark:text-primary-300">Need reduction tips?</h4>
              </div>
              <p className="text-xs leading-relaxed text-gray-600 dark:text-gray-400">
                Log some activities first, then visit our AI coach. The assistant parses your real-time log details to create tailored advice.
              </p>
              <Link 
                href="/insights" 
                className="text-xs font-bold text-primary-800 hover:text-primary-900 dark:text-primary-400 dark:hover:text-primary-200 flex items-center gap-1 mt-1"
              >
                Go to AI Coach
                <ArrowRight className="h-3 w-3" />
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
