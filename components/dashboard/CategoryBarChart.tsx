"use client";

import React, { useState, useEffect, useRef } from "react";
import { EMISSION_FACTORS } from "../../lib/emissionFactors";
import { ActivityEntry } from "../../lib/types";

interface CategoryBarChartProps {
  activities: ActivityEntry[];
  startDate: Date;
  endDate: Date;
}

const CATEGORY_CONFIG = {
  transport: { label: "Transport", color: "#10b981", bg: "rgba(16,185,129,0.12)" },
  food:      { label: "Food",      color: "#f59e0b", bg: "rgba(245,158,11,0.12)" },
  energy:    { label: "Energy",    color: "#eab308", bg: "rgba(234,179,8,0.12)" },
  shopping:  { label: "Shopping",  color: "#8b5cf6", bg: "rgba(139,92,246,0.12)" },
  waste:     { label: "Waste",     color: "#6b7280", bg: "rgba(107,114,128,0.12)" },
} as const;

type Category = keyof typeof CATEGORY_CONFIG;
const CATEGORY_ORDER: Category[] = ["transport", "food", "energy", "shopping", "waste"];

function getTopSubtype(
  activities: ActivityEntry[],
  category: Category,
  startMs: number,
  endMs: number
): string {
  const totals: Record<string, number> = {};
  activities
    .filter(a => {
      const ms = new Date(a.timestamp).getTime();
      return a.category === category && ms >= startMs && ms <= endMs;
    })
    .forEach(a => {
      totals[a.subtype] = (totals[a.subtype] || 0) + a.co2e;
    });
  const top = Object.entries(totals).sort((a, b) => b[1] - a[1])[0];
  if (!top) return "—";
  const factorInfo = (EMISSION_FACTORS as any)[category]?.[top[0]];
  return factorInfo?.label ?? top[0];
}

export function CategoryBarChart({ activities, startDate, endDate }: CategoryBarChartProps) {
  const [hoveredBar, setHoveredBar] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(false);
    const t = setTimeout(() => setMounted(true), 60);
    return () => clearTimeout(t);
  }, [activities]);

  const startMs = startDate.getTime();
  const endMs = endDate.getTime();

  // Build per-category totals
  const totals: Partial<Record<Category, number>> = {};
  activities
    .filter(a => {
      const ms = new Date(a.timestamp).getTime();
      return ms >= startMs && ms <= endMs;
    })
    .forEach(a => {
      const cat = a.category as Category;
      totals[cat] = (totals[cat] || 0) + a.co2e;
    });

  const rows = CATEGORY_ORDER
    .map(cat => ({
      cat,
      kg: parseFloat((totals[cat] ?? 0).toFixed(2)),
      config: CATEGORY_CONFIG[cat],
    }))
    .filter(r => r.kg > 0);

  const maxKg = Math.max(...rows.map(r => r.kg), 0.1);
  const grandTotal = rows.reduce((s, r) => s + r.kg, 0);

  if (rows.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-gray-400 text-sm text-center gap-2">
        <svg width="40" height="40" viewBox="0 0 40 40" aria-hidden="true" className="opacity-30">
          <rect x="4"  y="24" width="6" height="12" rx="2" fill="currentColor" />
          <rect x="14" y="16" width="6" height="20" rx="2" fill="currentColor" />
          <rect x="24" y="8"  width="6" height="28" rx="2" fill="currentColor" />
        </svg>
        <p>No activities in this period. Start tracking to see your breakdown.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3 relative" role="list" aria-label="Category emissions breakdown">
      {rows.map((row, idx) => {
        const pct = grandTotal > 0 ? ((row.kg / grandTotal) * 100).toFixed(1) : "0.0";
        const barWidth = mounted ? (row.kg / maxKg) * 100 : 0;
        const topSub = getTopSubtype(activities, row.cat, startMs, endMs);
        const isHovered = hoveredBar === row.cat;
        const tooltipAbove = idx >= rows.length / 2;

        return (
          <div key={row.cat} className="relative" role="listitem">
            <div
              tabIndex={0}
              role="button"
              aria-label={`${row.config.label}: ${row.kg} kg CO₂e, ${pct}% of total`}
              onMouseEnter={() => setHoveredBar(row.cat)}
              onMouseLeave={() => setHoveredBar(null)}
              onFocus={() => setHoveredBar(row.cat)}
              onBlur={() => setHoveredBar(null)}
              className="flex items-center gap-3 focus:outline-none focus:ring-2 focus:ring-green-600 focus:ring-offset-2 rounded cursor-default"
            >
              {/* Category label */}
              <span className="w-20 shrink-0 text-xs font-bold text-gray-600 dark:text-gray-300 text-right select-none">
                {row.config.label}
              </span>

              {/* Bar track */}
              <div className="flex-1 h-8 bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden">
                <div
                  className="h-full rounded-lg flex items-center justify-end pr-2"
                  style={{
                    width: `${barWidth}%`,
                    backgroundColor: row.config.color,
                    opacity: isHovered ? 1 : 0.82,
                    minWidth: barWidth > 0 ? "1.5rem" : "0",
                    transition: "width 600ms ease-out, opacity 150ms ease",
                  }}
                >
                  {barWidth > 28 && (
                    <span className="text-[10px] font-bold text-white/90 select-none">
                      {row.kg} kg
                    </span>
                  )}
                </div>
              </div>

              {/* Right value label */}
              <span className="w-16 shrink-0 text-xs font-bold text-gray-700 dark:text-gray-300 select-none">
                {row.kg} kg
              </span>
            </div>

            {/* Tooltip */}
            {isHovered && (
              <div
                role="tooltip"
                className={`absolute z-50 pointer-events-none bg-gray-900 text-white text-sm rounded-lg px-3 py-2.5 shadow-xl w-52 ${
                  tooltipAbove ? "bottom-10" : "top-10"
                } left-[5.5rem]`}
              >
                {/* Triangle arrow */}
                <div
                  className={`absolute left-6 w-3 h-3 bg-gray-900 rotate-45 ${
                    tooltipAbove ? "-bottom-1.5" : "-top-1.5"
                  }`}
                />
                <p className="font-bold text-sm">{row.config.label}</p>
                <p className="text-xs text-gray-300 mt-0.5">
                  {row.kg} kg CO₂e this period
                </p>
                <p className="text-xs text-gray-400 mt-0.5">
                  {pct}% of total emissions
                </p>
                <p className="text-[11px] text-emerald-400 mt-1.5 border-t border-gray-700 pt-1.5">
                  Top source: {topSub}
                </p>
              </div>
            )}
          </div>
        );
      })}

      {/* X-axis scale labels */}
      <div className="flex items-center gap-1 pt-1 pl-[5.5rem] pr-16 text-[10px] text-gray-400 select-none">
        <span>0</span>
        <div className="flex-1 flex justify-around">
          {[0.25, 0.5, 0.75, 1].map(f => (
            <span key={f}>{(maxKg * f).toFixed(1)} kg</span>
          ))}
        </div>
      </div>
    </div>
  );
}
