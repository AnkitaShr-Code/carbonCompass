"use client";

import React from "react";
import { useCarbonTracker } from "../../hooks/useCarbonTracker";
import { getTotalForPeriod } from "../../lib/carbonUtils";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "../../components/ui/Card";
import { Badge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import { Trophy, Target, Award, ShieldAlert, Sparkles, CheckCircle2 } from "lucide-react";
import Link from "next/link";

export default function GoalsPage() {
  const { goals, activities, isLoaded, profile } = useCarbonTracker();

  if (!isLoaded) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-500 border-t-transparent mx-auto" />
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">Loading goals & achievements...</p>
        </div>
      </div>
    );
  }

  // Calculate weekly total
  const now = new Date();
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const weeklyTotal = getTotalForPeriod(activities, sevenDaysAgo, now);

  // Carbon budget challenge progress calculation
  const target = goals.weeklyTargetKg;
  let budgetPct = weeklyTotal <= target 
    ? 100 
    : Math.max(0, Math.round(((target - (weeklyTotal - target)) / target) * 100));
  budgetPct = Math.min(100, Math.max(0, budgetPct));

  // Dynamically map goals.badges to display format
  const displayBadges = (goals.badges || []).map((b) => {
    let icon = Trophy;
    let color = "text-amber-600 bg-amber-100 dark:text-amber-400 dark:bg-amber-950/30";
    if (b.id === "badge-2") {
      icon = Award;
      color = "text-emerald-600 bg-emerald-100 dark:text-emerald-400 dark:bg-emerald-950/30";
    }
    return {
      ...b,
      icon,
      color: b.unlocked ? color : `${color} opacity-60`,
    };
  });

  const mockExtraBadges = [
    {
      id: "badge-3",
      name: "Transit Hero",
      description: "Avoided vehicle emissions by walking or cycling.",
      unlocked: false,
      icon: Sparkles,
      color: "text-blue-600 bg-blue-100 dark:text-blue-400 dark:bg-blue-950/30 opacity-60",
    },
    {
      id: "badge-4",
      name: "Low Waste Legend",
      description: "Log less than 2 kg of mixed landfill waste in a single day.",
      unlocked: false,
      icon: Trophy,
      color: "text-purple-600 bg-purple-100 dark:text-purple-400 dark:bg-purple-950/30 opacity-60",
    },
  ];

  const allBadges = [...displayBadges, ...mockExtraBadges];

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h2 className="text-2xl font-extrabold tracking-tight text-gray-900 dark:text-white sm:text-3xl">
          Goals & Achievements
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Monitor your carbon reduction targets and see unlocked sustainability badges.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Main Goals Section (Colspan 2) */}
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-1.5 text-primary-800 dark:text-primary-400">
                <Target className="h-5 w-5" />
                Active Challenges
              </CardTitle>
              <CardDescription>Track target milestones to reduce emissions.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Challenge 1: Weekly Carbon Budget */}
              <div className="space-y-2 border-b border-gray-100 dark:border-gray-800 pb-6 last:border-0 last:pb-0">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="text-sm font-bold text-gray-900 dark:text-white">Weekly Carbon Budget</h4>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                      Keep your total weekly emissions below your target budget of {target.toFixed(1)} kg.
                    </p>
                  </div>
                  <Badge variant={budgetPct === 100 && weeklyTotal <= target ? "success" : "primary"}>
                    {budgetPct === 100 && weeklyTotal <= target ? "Completed" : `${budgetPct}% Progress`}
                  </Badge>
                </div>

                <div className="space-y-1">
                  <div className="h-2 w-full rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden">
                    <div
                      className="h-full bg-primary-800 dark:bg-primary-500 transition-all duration-500"
                      style={{ width: `${budgetPct}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-[10px] text-gray-400 font-bold uppercase">
                    <span>Current: {weeklyTotal.toFixed(1)} kg</span>
                    <span>Target: &lt; {target.toFixed(1)} kg</span>
                  </div>
                </div>
              </div>

              {/* Challenge 2: Committed Actions */}
              <div className="space-y-3">
                <h4 className="text-sm font-bold text-gray-900 dark:text-white">Committed Climate Actions</h4>
                {goals.committedActions && goals.committedActions.length > 0 ? (
                  <div className="space-y-2">
                    {goals.committedActions.map((actionTitle, index) => (
                      <div
                        key={index}
                        className="flex items-start gap-2.5 p-3 rounded-lg border border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/30"
                      >
                        <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0 mt-0.5" />
                        <div>
                          <p className="text-xs font-semibold text-gray-900 dark:text-white">{actionTitle}</p>
                          <p className="text-[10px] text-gray-400">Committed to implementation</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center p-6 border border-dashed border-gray-200 dark:border-gray-800 rounded-lg">
                    <ShieldAlert className="h-6 w-6 mx-auto text-gray-400 mb-1" />
                    <p className="text-xs text-gray-500 dark:text-gray-400">No actions committed yet.</p>
                    <p className="text-[10px] text-gray-400 mb-3">
                      Chat with the AI Assistant in the Insights tab to get recommendations and commit to them!
                    </p>
                    <Link href="/insights">
                      <Button size="sm" variant="outline">
                        Get AI Recommendations
                      </Button>
                    </Link>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Badges sidebar showcase */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-1.5 text-accent-900 dark:text-accent-400">
                <Award className="h-5 w-5" />
                Sustain Badges
              </CardTitle>
              <CardDescription>Badges unlocked via activity milestones:</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {allBadges.map((badge) => {
                const IconComponent = badge.icon;
                return (
                  <div key={badge.id} className="flex gap-3 items-center">
                    <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${badge.color}`}>
                      <IconComponent className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <h4 className="text-xs font-bold text-gray-900 dark:text-white">{badge.name}</h4>
                        {badge.unlocked && (
                          <Badge variant="success" className="text-[8px] px-1 py-0 select-none">Unlocked</Badge>
                        )}
                      </div>
                      <p className="text-[10px] text-gray-500 dark:text-gray-400 mt-0.5 leading-normal">{badge.description}</p>
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
