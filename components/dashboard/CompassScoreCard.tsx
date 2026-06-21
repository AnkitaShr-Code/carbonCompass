import React from "react";
import Link from "next/link";
import { Sparkles } from "lucide-react";
import { Card, CardContent } from "../ui/Card";
import { useCountUp } from "../../hooks/useCountUp";

export function CompassScoreCard({
  score,
  label,
  direction,
}: {
  score: number;
  label: string;
  direction: string;
}) {
  const animated = useCountUp(score, 1000);

  const colorClass =
    score >= 70
      ? "from-emerald-500/10 to-emerald-600/5 border-emerald-200 dark:border-emerald-800/50"
      : score >= 40
      ? "from-amber-500/10 to-amber-600/5 border-amber-200 dark:border-amber-800/50"
      : "from-red-500/10 to-red-600/5 border-red-200 dark:border-red-800/50";

  const scoreColor =
    score >= 70
      ? "text-emerald-600 dark:text-emerald-400"
      : score >= 40
      ? "text-amber-600 dark:text-amber-400"
      : "text-red-600 dark:text-red-400";

  const ringColor =
    score >= 70 ? "#10b981" : score >= 40 ? "#f59e0b" : "#ef4444";

  // Needle rotation: South=0°(bad), North=180°(great)
  // Map score 0→100 to -90→90 degrees
  const needleAngle = ((score / 100) * 180) - 90;

  return (
    <Card
      data-tour="compass-score"
      id="compass-score"
      className={`w-full bg-gradient-to-br ${colorClass} border`}
    >
      <CardContent className="pt-6 pb-6">
        <div className="flex flex-col md:flex-row items-center gap-6">
          <div className="shrink-0 flex flex-col items-center gap-1">
            <svg
              width="120"
              height="120"
              viewBox="0 0 120 120"
              aria-label={`Compass needle pointing ${direction}`}
              role="img"
            >
              <circle cx="60" cy="60" r="50" fill="none" stroke="#e5e7eb" strokeWidth="8" className="dark:stroke-gray-700" />
              <circle
                cx="60"
                cy="60"
                r="50"
                fill="none"
                stroke={ringColor}
                strokeWidth="8"
                strokeDasharray={`${(score / 100) * 314} 314`}
                strokeLinecap="round"
                transform="rotate(-90 60 60)"
                style={{ transition: "stroke-dasharray 1s ease-out" }}
              />
              <circle cx="60" cy="60" r="6" fill={ringColor} />
              <line
                x1="60"
                y1="60"
                x2="60"
                y2="18"
                stroke={ringColor}
                strokeWidth="3"
                strokeLinecap="round"
                transform={`rotate(${needleAngle} 60 60)`}
                style={{ transition: "transform 1s ease-out" }}
              />
              <text
                x="60" y="67"
                textAnchor="middle"
                fontSize="18"
                fontWeight="900"
                fill={ringColor}
                fontFamily="ui-sans-serif, system-ui, sans-serif"
              >
                {Math.round(animated)}
              </text>
            </svg>
            <span className="text-[10px] font-bold text-gray-400 dark:text-gray-300 uppercase tracking-widest">out of 100</span>
          </div>

          <div className="flex-1 text-center md:text-left">
            <p className="text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-gray-300 mb-1">
              🧭 CarbonCompass Score
            </p>
            <p className={`text-5xl font-black ${scoreColor}`}>
              {Math.round(animated)}
            </p>
            <p className={`text-xl font-bold mt-2 ${scoreColor}`}>
              {label}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-300 mt-2 max-w-sm leading-relaxed">
              Based on your emissions vs. 1.5°C budget, logging streak, and tracking coverage across all 5 categories.
            </p>
            {score < 50 && (
              <Link
                href="/insights"
                className="mt-3 inline-flex items-center gap-1.5 text-xs font-bold text-amber-600 dark:text-amber-400 hover:underline focus:outline-none focus:ring-2 focus:ring-amber-500 rounded"
              >
                <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
                Score dropping? Ask the AI coach for help →
              </Link>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
