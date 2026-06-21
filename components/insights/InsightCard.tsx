"use client";

import React from "react";
import { InsightResponse } from "../../lib/types";
import { WhatIfResult } from "../../hooks/useAssistant";
import {
  TreePine,
  Plane,
  UtensilsCrossed,
  Smartphone,
  CheckCircle2,
  ArrowRight,
  AlertCircle,
} from "lucide-react";

// ─── Effort pill ──────────────────────────────────────────────────────────────

function EffortPill({ effort }: { effort: "easy" | "medium" | "hard" }) {
  const styles = {
    easy:   "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300",
    medium: "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300",
    hard:   "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300",
  };
  const labels = { easy: "Easy", medium: "Medium effort", hard: "High effort" };
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-bold ${styles[effort]}`}>
      {labels[effort]}
    </span>
  );
}

// ─── Equivalence row ──────────────────────────────────────────────────────────

function EquivRow({ equiv }: { equiv: InsightResponse["equivalences"] }) {
  const items = [
    { icon: TreePine,        value: equiv.trees,                    label: "trees/yr" },
    { icon: Plane,           value: equiv.flights,                  label: "flights" },
    { icon: UtensilsCrossed, value: equiv.beefMeals,               label: "burgers" },
    { icon: Smartphone,      value: equiv.smartphoneCharges,        label: "charges" },
  ];
  return (
    <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
      {items.map(({ icon: Icon, value, label }) => (
        <div key={label} className="flex items-center gap-1 rounded-full bg-gray-100 dark:bg-gray-700 px-2.5 py-1 text-[10px] font-semibold text-gray-600 dark:text-gray-300">
          <Icon className="h-3 w-3" aria-hidden="true" />
          <span>≈ {typeof value === "number" && value > 999 ? value.toLocaleString() : value} {label}</span>
        </div>
      ))}
    </div>
  );
}

// ─── Insight Response Card ────────────────────────────────────────────────────

interface InsightCardProps {
  response: InsightResponse;
  committedActions: string[];
  onCommit: (title: string) => void;
  onUncommit: (title: string) => void;
}

export function InsightCard({ response, committedActions, onCommit, onUncommit }: InsightCardProps) {
  return (
    <div className="space-y-3 w-full max-w-xl">
      {/* Summary */}
      <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
        {response.summary}
      </p>

      {/* Action cards */}
      <div className="space-y-2.5">
        {response.actions.map((action, i) => {
          const isCommitted = committedActions.includes(action.title);
          return (
            <div
              key={i}
              className={`rounded-xl border p-3.5 transition-all ${
                isCommitted
                  ? "border-emerald-300 bg-emerald-50/60 dark:border-emerald-700 dark:bg-emerald-950/20"
                  : "border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800"
              }`}
            >
              <div className="flex items-start justify-between gap-2 mb-1.5">
                <p className="text-sm font-bold text-gray-900 dark:text-white leading-tight">
                  {action.title}
                </p>
                {isCommitted && (
                  <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" aria-label="Committed" />
                )}
              </div>

              <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed mb-2.5">
                {action.description}
              </p>

              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-1.5 flex-wrap">
                  {action.estimatedSavingKg > 0 && (
                    <span className="inline-flex items-center rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300 px-2.5 py-0.5 text-[10px] font-bold">
                      Saves ~{action.estimatedSavingKg.toFixed(1)} kg/week
                    </span>
                  )}
                  <EffortPill effort={action.effort} />
                </div>

                <button
                  onClick={() => isCommitted ? onUncommit(action.title) : onCommit(action.title)}
                  className={`text-[10px] font-bold px-2.5 py-1 rounded-lg transition-all cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 ${
                    isCommitted
                      ? "bg-emerald-600 text-white hover:bg-emerald-700"
                      : "border border-emerald-500 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/30"
                  }`}
                  aria-label={isCommitted ? `Uncommit from ${action.title}` : `Commit to ${action.title}`}
                >
                  {isCommitted ? "✓ Committed" : "Commit to this"}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Equivalences */}
      <EquivRow equiv={response.equivalences} />
    </div>
  );
}

// ─── What-If Result Card ──────────────────────────────────────────────────────

interface WhatIfCardProps {
  result: WhatIfResult;
  onCommit: (title: string) => void;
  committedActions: string[];
}

export function WhatIfCard({ result, onCommit, committedActions }: WhatIfCardProps) {
  const commitTitle = `Switch ${result.fromLabel} → ${result.toLabel}`;
  const isCommitted = committedActions.includes(commitTitle);

  if (!result.hasData) {
    return (
      <div className="rounded-xl border border-amber-200 dark:border-amber-800/50 bg-amber-50 dark:bg-amber-950/20 p-4 max-w-xl">
        <div className="flex items-start gap-2">
          <AlertCircle className="h-4 w-4 text-amber-600 dark:text-amber-400 mt-0.5 shrink-0" />
          <div>
            <p className="text-sm font-bold text-amber-800 dark:text-amber-300">No recent data found</p>
            <p className="text-xs text-amber-700 dark:text-amber-400 mt-1 leading-relaxed">
              No <strong>{result.fromLabel.toLowerCase()}</strong> activity found in your last 7 days.
              Keep tracking to unlock this simulation!
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-blue-200 dark:border-blue-800/50 bg-blue-50/50 dark:bg-blue-950/10 p-4 max-w-xl space-y-3">
      <div>
        <p className="text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider mb-1">
          ⚡ What-If Simulation
        </p>
        <div className="flex items-center gap-2 text-sm font-bold text-gray-900 dark:text-white">
          <span className="text-gray-500 dark:text-gray-300">{result.fromLabel}</span>
          <ArrowRight className="h-4 w-4 text-blue-500 shrink-0" />
          <span className="text-blue-700 dark:text-blue-300">{result.toLabel}</span>
        </div>
      </div>

      <div className="rounded-lg bg-white dark:bg-gray-800 border border-blue-100 dark:border-blue-900/50 p-3 space-y-1.5">
        <p className="text-xs text-gray-600 dark:text-gray-350">
          Based on your last 7 days of tracked activity:
        </p>
        <p className="text-xl font-black text-emerald-600 dark:text-emerald-400">
          Save {result.savingKgPerWeek.toFixed(2)} kg CO₂e/week
        </p>
        {result.equivalentTrees > 0 && (
          <p className="text-xs text-gray-500 dark:text-gray-300 flex items-center gap-1">
            <TreePine className="h-3.5 w-3.5 text-emerald-500" aria-hidden="true" />
            ≈ {result.equivalentTrees} tree{result.equivalentTrees !== 1 ? "s" : ""} absorbing CO₂ for a year
          </p>
        )}
      </div>

      <button
        onClick={() => onCommit(commitTitle)}
        disabled={isCommitted}
        className={`text-xs font-bold px-3 py-1.5 rounded-lg transition-all cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 ${
          isCommitted
            ? "bg-emerald-600 text-white cursor-default"
            : "border border-emerald-500 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/30"
        }`}
        aria-label={`Commit to switching ${result.fromLabel} to ${result.toLabel}`}
      >
        {isCommitted ? "✓ Committed to this change" : "Commit to this change"}
      </button>
    </div>
  );
}
