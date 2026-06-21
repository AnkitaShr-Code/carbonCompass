"use client";

import React from "react";

interface CarbonChartProps {
  emissionsByCategory: Partial<Record<'transport' | 'food' | 'energy' | 'shopping' | 'waste', number>>;
  totalEmissions: number;
  dailyBudget: number;
}

export const CarbonChart = React.memo(function CarbonChart({
  emissionsByCategory,
  totalEmissions,
  dailyBudget,
}: CarbonChartProps) {
  // Define custom styles for categories
  const categories: { key: 'transport' | 'food' | 'energy' | 'shopping' | 'waste'; label: string; color: string; bg: string; icon: string }[] = [
    { key: "transport", label: "Transportation", color: "bg-blue-600 dark:bg-blue-400", bg: "bg-blue-100 dark:bg-blue-900/30", icon: "🚗" },
    { key: "energy", label: "Energy Consumption", color: "bg-amber-600 dark:bg-accent-400", bg: "bg-amber-100 dark:bg-accent-950/20", icon: "⚡" },
    { key: "food", label: "Food & Diet", color: "bg-green-600 dark:bg-primary-500", bg: "bg-green-100 dark:bg-primary-950/20", icon: "🍔" },
    { key: "shopping", label: "Shopping", color: "bg-pink-600 dark:bg-pink-400", bg: "bg-pink-100 dark:bg-pink-900/30", icon: "🛍️" },
    { key: "waste", label: "Waste Disposal", color: "bg-purple-600 dark:bg-purple-400", bg: "bg-purple-100 dark:bg-purple-900/30", icon: "🗑️" },
  ];

  // Calculate percentages
  const details = categories.map((cat) => {
    const val = emissionsByCategory[cat.key] || 0;
    const pct = totalEmissions > 0 ? (val / totalEmissions) * 100 : 0;
    return {
      ...cat,
      value: val,
      percentage: Math.round(pct),
    };
  });

  // Budget gauge math
  const budgetRatio = dailyBudget > 0 ? Math.min(totalEmissions / dailyBudget, 1.2) : 0;
  const budgetPct = Math.round(budgetRatio * 100);
  
  // SVG gauge constants
  const radius = 50;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - Math.min(budgetRatio, 1.0) * circumference;

  // Determine budget color status
  let budgetColor = "text-green-500 dark:text-primary-500";
  let budgetStroke = "stroke-primary-500";
  if (budgetRatio > 0.8 && budgetRatio <= 1.0) {
    budgetColor = "text-amber-500 dark:text-accent-400";
    budgetStroke = "stroke-accent-400";
  } else if (budgetRatio > 1.0) {
    budgetColor = "text-red-500";
    budgetStroke = "stroke-red-500";
  }

  return (
    <div className="grid gap-6 md:grid-cols-2">
      {/* Category Breakdown list */}
      <div className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-800">
        <h4 className="text-base font-bold text-gray-900 dark:text-white mb-4">Emissions by Category</h4>
        <div className="space-y-4">
          {details.map((item) => (
            <div key={item.key} className="space-y-1">
              <div className="flex items-center justify-between text-xs sm:text-sm">
                <span className="flex items-center gap-1.5 font-medium text-gray-700 dark:text-gray-300">
                  <span className="text-base">{item.icon}</span>
                  {item.label}
                </span>
                <span className="font-bold text-gray-900 dark:text-white">
                  {item.value.toFixed(1)} kg ({item.percentage}%)
                </span>
              </div>
              <div className="h-2.5 w-full rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${item.color}`}
                  style={{ width: `${item.percentage}%` }}
                />
              </div>
            </div>
          ))}
          {totalEmissions === 0 && (
            <p className="text-center text-xs text-gray-400 py-6">No activity logged yet. Use the Tracker page to get started!</p>
          )}
        </div>
      </div>

      {/* SVG Budget Radial Gauge */}
      <div className="flex flex-col items-center justify-center rounded-lg border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-800">
        <h4 className="text-base font-bold text-gray-900 dark:text-white self-start mb-4">Daily Budget Utilization</h4>
        <div className="relative flex items-center justify-center">
          <svg viewBox="0 0 144 144" role="img" aria-label="Daily carbon budget utilization gauge" className="w-full max-w-[144px] h-auto transform -rotate-90">
            {/* Background circle */}
            <circle
              cx="72"
              cy="72"
              r={radius}
              className="stroke-gray-100 dark:stroke-gray-800 fill-transparent"
              strokeWidth="10"
            />
            {/* Foreground progress circle */}
            <circle
              cx="72"
              cy="72"
              r={radius}
              className={`fill-transparent transition-all duration-500 ${budgetStroke}`}
              strokeWidth="10"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
            />
          </svg>
          {/* Inner content */}
          <div className="absolute text-center">
            <span className={`text-2xl font-black ${budgetColor}`}>
              {budgetPct}%
            </span>
            <p className="text-[10px] uppercase font-bold text-gray-400 dark:text-gray-300">of daily cap</p>
          </div>
        </div>

        <div className="mt-4 text-center">
          <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">
            Total: <span className="font-bold">{totalEmissions.toFixed(1)} kg</span> CO₂e
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-300 mt-0.5">
            Budget limit is {dailyBudget.toFixed(1)} kg CO₂e per day
          </p>
        </div>
      </div>
    </div>
  );
});
