"use client";

import React, { useState, useEffect, useRef } from "react";
import { ActivityEntry } from "../../lib/types";
import { DAILY_BUDGET_1_5C } from "../../lib/emissionFactors";

interface TrendLineChartProps {
  activities: ActivityEntry[];
}

interface DayData {
  label: string;
  dateStr: string;
  fullDate: string;
  kg: number;
  breakdown: Record<string, number>;
}

const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const CATEGORY_COLORS: Record<string, string> = {
  transport: "#10b981",
  food:      "#f59e0b",
  energy:    "#eab308",
  shopping:  "#8b5cf6",
  waste:     "#6b7280",
};

function getLast7Days(activities: ActivityEntry[]): DayData[] {
  const days: DayData[] = [];
  const now = new Date();

  for (let i = 6; i >= 0; i--) {
    const day = new Date(now);
    day.setDate(now.getDate() - i);
    day.setHours(0, 0, 0, 0);
    const dayEnd = new Date(day);
    dayEnd.setHours(23, 59, 59, 999);

    const dayActivities = activities.filter(a => {
      const ms = new Date(a.timestamp).getTime();
      return ms >= day.getTime() && ms <= dayEnd.getTime();
    });

    const breakdown: Record<string, number> = {};
    let total = 0;
    dayActivities.forEach(a => {
      breakdown[a.category] = (breakdown[a.category] || 0) + a.co2e;
      total += a.co2e;
    });

    days.push({
      label: DAY_LABELS[day.getDay()] ?? "—",
      dateStr: day.toLocaleDateString(undefined, { month: "short", day: "numeric" }),
      fullDate: day.toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" }),
      kg: parseFloat(total.toFixed(2)),
      breakdown,
    });
  }
  return days;
}

// SVG layout constants
const VW = 600;
const VH = 220;
const PL = 50;   // pad left
const PR = 20;   // pad right
const PT = 20;   // pad top
const PB = 36;   // pad bottom
const CW = VW - PL - PR;
const CH = VH - PT - PB;

export function TrendLineChart({ activities }: TrendLineChartProps) {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);
  const [animated, setAnimated] = useState(false);
  const pathRef = useRef<SVGPathElement>(null);
  const [pathLength, setPathLength] = useState(2000);

  const days = getLast7Days(activities);
  const hasData = days.some(d => d.kg > 0);
  const maxKg = Math.max(...days.map(d => d.kg), DAILY_BUDGET_1_5C + 2, 1);

  const toY = (kg: number) => PT + CH - (kg / maxKg) * CH;
  const toX = (idx: number) => PL + (idx / 6) * CW;

  const points = days.map((d, i) => ({ x: toX(i), y: toY(d.kg) }));
  const pathD = points
    .map((p, i) => `${i === 0 ? "M" : "L"} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`)
    .join(" ");

  // Gridlines: 4 intervals
  const gridCount = 4;
  const gridVals = Array.from({ length: gridCount + 1 }, (_, i) =>
    parseFloat(((maxKg / gridCount) * i).toFixed(1))
  );

  const budgetY = toY(DAILY_BUDGET_1_5C);

  useEffect(() => {
    setAnimated(false);
    if (pathRef.current) {
      const len = pathRef.current.getTotalLength();
      if (len > 0) setPathLength(len);
    }
    const t = setTimeout(() => setAnimated(true), 120);
    return () => clearTimeout(t);
  }, [activities]);

  return (
    <div className="relative w-full select-none">
      <svg
        viewBox={`0 0 ${VW} ${VH}`}
        className="w-full h-auto overflow-visible"
        role="img"
        aria-label="7-day carbon emissions trend chart"
      >
        {/* Gridlines */}
        {gridVals.map((v, i) => {
          const y = toY(v);
          return (
            <g key={i}>
              <line
                x1={PL} y1={y} x2={PL + CW} y2={y}
                stroke="#e5e7eb"
                strokeWidth={i === 0 ? 1.5 : 1}
                strokeDasharray={i === 0 ? "0" : "4 4"}
                className="dark:stroke-gray-700"
              />
              <text
                x={PL - 6} y={y + 4}
                textAnchor="end"
                fontSize="10"
                fill="#9ca3af"
                fontFamily="ui-sans-serif, system-ui, sans-serif"
              >
                {v}
              </text>
            </g>
          );
        })}

        {/* 1.5°C daily budget dashed line */}
        <line
          x1={PL} y1={budgetY} x2={PL + CW} y2={budgetY}
          stroke="#10b981" strokeWidth="1.5" strokeDasharray="7 4" opacity="0.65"
        />
        <text
          x={PL + CW - 4} y={budgetY - 5}
          textAnchor="end"
          fontSize="9"
          fill="#10b981"
          fontFamily="ui-sans-serif, system-ui, sans-serif"
          fontWeight="600"
        >
          1.5°C budget ({DAILY_BUDGET_1_5C} kg/day)
        </text>

        {/* Area fill */}
        {hasData && (
          <path
            d={`${pathD} L ${toX(6).toFixed(1)} ${PT + CH} L ${toX(0).toFixed(1)} ${PT + CH} Z`}
            fill="#10b981"
            fillOpacity="0.06"
          />
        )}

        {/* Main line — animated draw */}
        {hasData && (
          <path
            ref={pathRef}
            d={pathD}
            fill="none"
            stroke="#10b981"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{
              strokeDasharray: pathLength,
              strokeDashoffset: animated ? 0 : pathLength,
              transition: "stroke-dashoffset 1s ease-in-out",
            }}
          />
        )}

        {/* Y-axis border */}
        <line
          x1={PL} y1={PT} x2={PL} y2={PT + CH}
          stroke="#e5e7eb" strokeWidth="1"
          className="dark:stroke-gray-700"
        />

        {/* Data point circles — full accessibility */}
        {days.map((day, i) => {
          const cx = toX(i);
          const cy = toY(day.kg);
          const isHovered = hoveredIdx === i;
          const budgetStatus = day.kg <= DAILY_BUDGET_1_5C
            ? `${(DAILY_BUDGET_1_5C - day.kg).toFixed(2)} kg under budget`
            : `${(day.kg - DAILY_BUDGET_1_5C).toFixed(2)} kg over budget`;

          return (
            <g 
              key={i}
              tabIndex={0}
              role="button"
              aria-label={`${day.fullDate}: ${day.kg} kg CO₂e — ${budgetStatus}`}
              className="cursor-pointer focus:outline-none focus:ring-2 focus:ring-green-600 focus:ring-offset-2 rounded"
              onMouseEnter={() => setHoveredIdx(i)}
              onMouseLeave={() => setHoveredIdx(null)}
              onFocus={() => setHoveredIdx(i)}
              onBlur={() => setHoveredIdx(null)}
              onKeyDown={e => {
                if (e.key === "Enter" || e.key === " ") {
                  setHoveredIdx(hoveredIdx === i ? null : i);
                }
              }}
            >
              {/* Invisible large hit area */}
              <circle
                cx={cx}
                cy={cy}
                r={14}
                fill="transparent"
                pointerEvents="all"
              />
              {/* Visible circle */}
              <circle
                cx={cx}
                cy={cy}
                r={isHovered ? 7 : (day.kg > 0 ? 5 : 3)}
                fill={day.kg > 0 ? (day.kg > DAILY_BUDGET_1_5C ? "#f59e0b" : "#10b981") : "#d1d5db"}
                stroke="white"
                strokeWidth="2"
                style={{ transition: "r 150ms ease, fill 200ms ease" }}
                aria-hidden="true"
                pointerEvents="none"
              />
            </g>
          );
        })}

        {/* X-axis day labels */}
        {days.map((day, i) => (
          <text
            key={i}
            x={toX(i)}
            y={VH - 6}
            textAnchor="middle"
            fontSize="11"
            fill="#9ca3af"
            fontFamily="ui-sans-serif, system-ui, sans-serif"
            aria-hidden="true"
          >
            {day.label}
          </text>
        ))}
      </svg>

      {/* HTML tooltip overlay */}
      {hoveredIdx !== null && (() => {
        const day = days[hoveredIdx];
        if (!day) return null;
        const xFrac = hoveredIdx / 6;
        const isRight = xFrac > 0.6;
        const leftPct = (PL + (xFrac * CW)) / VW * 100;

        return (
          <div
            role="tooltip"
            className="pointer-events-none absolute top-0 z-30"
            style={{
              left: isRight ? "auto" : `calc(${leftPct}% + 14px)`,
              right: isRight ? `calc(${100 - leftPct}% + 14px)` : "auto",
              top: "10px",
            }}
          >
            <div className="bg-gray-900 text-white text-sm rounded-lg px-3 py-2.5 shadow-xl w-48">
              <p className="font-bold text-sm">{day.dateStr}</p>
              <p className="text-xs text-gray-300 mt-0.5">
                {day.kg > 0 ? `${day.kg} kg CO₂e` : "No data logged"}
              </p>
              {day.kg > 0 && (
                <p className={`text-[10px] font-semibold mt-0.5 ${
                  day.kg <= DAILY_BUDGET_1_5C ? "text-emerald-400" : "text-amber-400"
                }`}>
                  {day.kg <= DAILY_BUDGET_1_5C
                    ? `✓ ${(DAILY_BUDGET_1_5C - day.kg).toFixed(2)} kg under budget`
                    : `⚠ ${(day.kg - DAILY_BUDGET_1_5C).toFixed(2)} kg over budget`
                  }
                </p>
              )}
              {Object.keys(day.breakdown).length > 0 && (
                <div className="mt-1.5 space-y-0.5 border-t border-gray-700 pt-1.5">
                  {Object.entries(day.breakdown)
                    .sort((a, b) => b[1] - a[1])
                    .map(([cat, kg]) => (
                      <div key={cat} className="flex justify-between text-[10px]">
                        <span
                          className="capitalize font-semibold"
                          style={{ color: CATEGORY_COLORS[cat] ?? "#9ca3af" }}
                        >
                          {cat}
                        </span>
                        <span className="text-gray-400">{parseFloat(kg.toFixed(2))} kg</span>
                      </div>
                    ))}
                </div>
              )}
            </div>
          </div>
        );
      })()}
    </div>
  );
}
