"use client";

import React, { useState, useMemo } from "react";
import { Trash2, Calendar, ChevronDown, Info, Minus, Car, UtensilsCrossed, Zap, ShoppingBag, Recycle } from "lucide-react";
import Link from "next/link";

import { ActivityEntry } from "../../lib/types";
import { EMISSION_FACTORS } from "../../lib/emissionFactors";
import { APP_CONSTANTS } from "../../lib/constants";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "../ui/Card";
import { Badge } from "../ui/Badge";

export type Category = "transport" | "food" | "energy" | "shopping" | "waste";

export const CATEGORY_ICONS: Record<Category, React.ElementType> = {
  transport: Car,
  food: UtensilsCrossed,
  energy: Zap,
  shopping: ShoppingBag,
  waste: Recycle,
};

export const CATEGORY_COLORS: Record<Category, string> = {
  transport: "text-emerald-600 dark:text-emerald-400",
  food: "text-amber-600 dark:text-amber-400",
  energy: "text-yellow-600 dark:text-yellow-400",
  shopping: "text-purple-600 dark:text-purple-400",
  waste: "text-gray-500 dark:text-gray-300",
};

export const CATEGORY_BG: Record<Category, string> = {
  transport: "bg-emerald-50 dark:bg-emerald-900/20",
  food: "bg-amber-50 dark:bg-amber-900/20",
  energy: "bg-yellow-50 dark:bg-yellow-900/20",
  shopping: "bg-purple-50 dark:bg-purple-900/20",
  waste: "bg-gray-100 dark:bg-gray-800/40",
};

function relativeTime(isoStr: string): string {
  const diff = Date.now() - new Date(isoStr).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 60) return minutes <= 1 ? "Just now" : `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days}d ago`;
  return new Date(isoStr).toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

function getSubtypeLabel(category: string, subtype: string): string {
  return (EMISSION_FACTORS as any)[category]?.[subtype]?.label ?? subtype.replace(/_/g, " ");
}

interface RecentActivityLogProps {
  activities: ActivityEntry[];
  deleteActivity: (id: string) => void;
}

export const RecentActivityLog = React.memo(function RecentActivityLog({
  activities,
  deleteActivity,
}: RecentActivityLogProps) {
  const [filterCategory, setFilterCategory] = useState<Category | "all">("all");
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const filteredActivities = useMemo(() => {
    return activities
      .filter((a) => filterCategory === "all" || a.category === filterCategory)
      .slice(0, APP_CONSTANTS.MAX_RECENT_ACTIVITIES);
  }, [activities, filterCategory]);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between flex-wrap gap-2">
        <div>
          <CardTitle>Recent Activity Log</CardTitle>
          <CardDescription>Last {APP_CONSTANTS.MAX_RECENT_ACTIVITIES} entries — click the trash icon to delete</CardDescription>
        </div>
        <div className="flex items-center gap-2">
          {/* Category filter */}
          <div className="relative">
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value as Category | "all")}
              className="text-xs font-semibold rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 pl-3 pr-8 py-1.5 appearance-none focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
              aria-label="Filter by category"
            >
              <option value="all">All categories</option>
              <option value="transport">Transport</option>
              <option value="food">Food</option>
              <option value="energy">Energy</option>
              <option value="shopping">Shopping</option>
              <option value="waste">Waste</option>
            </select>
            <ChevronDown className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400 dark:text-gray-300" />
          </div>
          <Badge variant="outline" className="flex items-center gap-1 shrink-0">
            <Calendar className="h-3 w-3" />
            {activities.length} total
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        {filteredActivities.length === 0 ? (
          <div className="text-center py-12 text-gray-400 dark:text-gray-300">
            <Info className="h-8 w-8 mx-auto stroke-[1.5] mb-2" />
            <p className="text-sm">
              {activities.length === 0
                ? "No activities logged yet."
                : "No activities in this category."}
            </p>
            {activities.length === 0 && (
              <Link href="/tracker" className="text-xs text-emerald-500 hover:underline mt-1 inline-block">
                Add your first activity →
              </Link>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto -mx-1">
            <table className="w-full text-left text-sm min-w-[500px]">
              <thead>
                <tr className="border-b border-gray-100 dark:border-gray-700 text-[10px] text-gray-400 dark:text-gray-300 uppercase tracking-wider font-bold">
                  <th className="pb-3 pl-2 pr-2 w-8">Cat.</th>
                  <th className="pb-3 pr-2">Activity</th>
                  <th className="pb-3 pr-2 w-28">Amount</th>
                  <th className="pb-3 pr-2 w-24">When</th>
                  <th className="pb-3 text-right pr-2 w-20">CO₂e</th>
                  <th className="pb-3 text-center w-10"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-gray-850">
                {filteredActivities.map((act) => {
                  const Icon = CATEGORY_ICONS[act.category as Category] ?? Minus;
                  const isConfirming = confirmDeleteId === act.id;
                  return (
                    <tr
                      key={act.id}
                      className="hover:bg-gray-50/60 dark:hover:bg-gray-900/30 transition-colors"
                    >
                      {/* Icon */}
                      <td className="py-3 pl-2 pr-2">
                        <span className={`inline-flex p-1.5 rounded-lg ${CATEGORY_BG[act.category as Category]}`}>
                          <Icon
                            className={`h-3.5 w-3.5 ${CATEGORY_COLORS[act.category as Category]}`}
                            strokeWidth={1.8}
                            aria-hidden="true"
                          />
                        </span>
                      </td>
                      {/* Activity label */}
                      <td className="py-3 pr-2">
                        <p className="font-semibold text-gray-800 dark:text-gray-200 text-xs leading-tight">
                          {getSubtypeLabel(act.category, act.subtype)}
                        </p>
                        <p className="text-[10px] text-gray-400 dark:text-gray-300 capitalize">{act.category}</p>
                      </td>
                      {/* Amount */}
                      <td className="py-3 pr-2 text-xs text-gray-600 dark:text-gray-300 font-semibold">
                        {act.quantity} {act.unit}
                      </td>
                      {/* Time */}
                      <td className="py-3 pr-2 text-[11px] text-gray-500 dark:text-gray-300 font-semibold">
                        {relativeTime(act.timestamp)}
                      </td>
                      {/* CO₂e */}
                      <td className="py-3 pr-2 text-right font-black text-gray-900 dark:text-white text-xs">
                        {act.co2e.toFixed(2)} kg
                      </td>
                      {/* Delete */}
                      <td className="py-3 text-center">
                        {isConfirming ? (
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => {
                                deleteActivity(act.id);
                                setConfirmDeleteId(null);
                              }}
                              className="text-[10px] font-bold text-red-600 dark:text-red-400 hover:underline cursor-pointer focus:outline-none"
                              aria-label={`Confirm delete ${getSubtypeLabel(act.category, act.subtype)}`}
                            >
                              Yes
                            </button>
                            <span className="text-gray-300 dark:text-gray-600">/</span>
                            <button
                              onClick={() => setConfirmDeleteId(null)}
                              className="text-[10px] text-gray-500 dark:text-gray-300 hover:text-gray-800 dark:hover:text-gray-200 cursor-pointer focus:outline-none"
                            >
                              No
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setConfirmDeleteId(act.id)}
                            className="rounded p-1.5 text-gray-300 hover:text-red-500 dark:hover:text-red-400 transition-colors cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-red-400"
                            aria-label={`Delete ${getSubtypeLabel(act.category, act.subtype)} entry`}
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
});
