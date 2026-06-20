"use client";

import React from "react";
import { useCarbonTracker } from "../../hooks/useCarbonTracker";
import { CarbonChart } from "../../components/dashboard/CarbonChart";
import { getTotalForPeriod, getCategoryBreakdown, getEquivalences } from "../../lib/carbonUtils";
import { DAILY_BUDGET_1_5C } from "../../lib/emissionFactors";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "../../components/ui/Card";
import { Badge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import { Trash2, Info, Calendar } from "lucide-react";
import Link from "next/link";

export default function DashboardPage() {
  const {
    activities,
    profile,
    isLoaded,
    deleteActivity,
    clearAllActivities,
  } = useCarbonTracker();

  // Compute stats locally using the logic engine
  const startOfTime = new Date(0);
  const endOfTime = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000 * 5); // 5 years future
  
  const totalEmissions = getTotalForPeriod(activities, startOfTime, endOfTime);
  const emissionsByCategory = getCategoryBreakdown(activities, startOfTime, endOfTime);
  const comparison = getEquivalences(totalEmissions);

  if (!isLoaded) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-500 border-t-transparent mx-auto" />
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">Loading dashboard data...</p>
        </div>
      </div>
    );
  }

  const getCategoryBadgeVariant = (type: string) => {
    switch (type) {
      case "transport":
        return "primary";
      case "energy":
        return "warning";
      case "food":
        return "success";
      case "shopping":
        return "secondary";
      case "waste":
        return "outline";
      default:
        return "outline";
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Upper header summary */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold tracking-tight text-gray-900 dark:text-white sm:text-3xl">
            Welcome back, {profile.name}
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Track your sustainability efforts and monitor emission targets.
          </p>
        </div>
        <div className="flex gap-2">
          {activities.length > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={clearAllActivities}
              className="text-red-600 hover:bg-red-50 border-red-200 dark:border-red-900/50 dark:hover:bg-red-950/20"
            >
              Clear All Logs
            </Button>
          )}
          <Link href="/tracker">
            <Button size="sm">Log Activity</Button>
          </Link>
        </div>
      </div>

      {/* Comparisons / Benchmark Grid */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-4">
        <Card className="border-l-4 border-l-blue-500">
          <CardContent className="pt-6">
            <p className="text-xs font-bold uppercase tracking-wider text-gray-400 font-sans">Tree Absorption</p>
            <p className="mt-2 text-3xl font-black text-gray-900 dark:text-white">{comparison.trees}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 font-medium">
              Annual trees needed to offset emissions.
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-purple-500">
          <CardContent className="pt-6">
            <p className="text-xs font-bold uppercase tracking-wider text-gray-400 font-sans">London-Paris Flights</p>
            <p className="mt-2 text-3xl font-black text-gray-900 dark:text-white">{comparison.flights}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 font-medium">
              Equivalent flight counts.
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-amber-500">
          <CardContent className="pt-6">
            <p className="text-xs font-bold uppercase tracking-wider text-gray-400 font-sans">Beef Burgers</p>
            <p className="mt-2 text-3xl font-black text-gray-900 dark:text-white">{comparison.beefMeals}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 font-medium">
              Burger meals matching emissions.
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-primary-500">
          <CardContent className="pt-6">
            <p className="text-xs font-bold uppercase tracking-wider text-gray-400 font-sans">Smartphone Charges</p>
            <p className="mt-2 text-3xl font-black text-gray-900 dark:text-white">
              {comparison.smartphoneCharges.toLocaleString()}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 font-medium">
              Charges of smartphone battery.
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts section */}
      <CarbonChart
        emissionsByCategory={emissionsByCategory}
        totalEmissions={totalEmissions}
        dailyBudget={DAILY_BUDGET_1_5C}
      />

      {/* Log list section */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Recent Footprint Logs</CardTitle>
            <CardDescription>Review your recent emission activities recorded locally.</CardDescription>
          </div>
          <Badge variant="outline" className="flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            {activities.length} Entries
          </Badge>
        </CardHeader>
        <CardContent>
          {activities.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <Info className="h-8 w-8 mx-auto stroke-[1.5]" />
              <p className="mt-2 text-sm">No activity recorded yet.</p>
              <Link href="/tracker" className="text-xs text-primary-500 hover:underline mt-1 inline-block">
                Add your first activity log now.
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-gray-100 dark:border-gray-800 text-gray-450 uppercase font-bold text-[10px] tracking-wider">
                    <th className="pb-3 pl-2">Category</th>
                    <th className="pb-3">Details</th>
                    <th className="pb-3">Logged Date</th>
                    <th className="pb-3 text-right">Emissions</th>
                    <th className="pb-3 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 dark:divide-gray-850">
                  {activities.map((act) => (
                    <tr key={act.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-900/30 transition-colors">
                      <td className="py-3.5 pl-2">
                        <Badge variant={getCategoryBadgeVariant(act.category)} className="capitalize">
                          {act.category}
                        </Badge>
                      </td>
                      <td className="py-3.5 font-medium text-gray-800 dark:text-gray-200">
                        {act.quantity} {act.unit} of {act.subtype.replace("_", " ")}
                      </td>
                      <td className="py-3.5 text-xs text-gray-500 font-semibold">
                        {new Date(act.timestamp).toLocaleDateString(undefined, {
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </td>
                      <td className="py-3.5 text-right font-bold text-gray-900 dark:text-white">
                        {act.co2e.toFixed(2)} kg
                      </td>
                      <td className="py-3.5 text-center">
                        <button
                          onClick={() => deleteActivity(act.id)}
                          className="rounded p-1.5 text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors cursor-pointer"
                          title="Delete entry"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
