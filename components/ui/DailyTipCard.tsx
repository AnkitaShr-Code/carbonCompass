"use client";

import React, { useState } from "react";
import { Lightbulb, Share2, Check } from "lucide-react";
import { getDailyTip } from "../../lib/dailyTips";
import { Badge } from "./Badge";

interface DailyTipCardProps {
  variant?: "default" | "small";
}

export function DailyTipCard({ variant = "default" }: DailyTipCardProps) {
  const tip = getDailyTip();
  const [copied, setCopied] = useState(false);

  const handleShare = () => {
    const shareText = `💡 Today's Carbon Insight: ${tip.title}\n\n"${tip.fact}"\n\n👉 Action Tip: ${tip.actionTip}\n\n(Source: ${tip.source} | CarbonCompass)`;
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(shareText).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      });
    }
  };

  const categoryEmoji: Record<string, string> = {
    transport: "🚗 Transport",
    food: "🍔 Food",
    energy: "⚡ Energy",
    shopping: "🛍️ Shopping",
    waste: "🗑️ Waste",
    general: "🌍 General",
  };

  const categoryBadgeVariants: Record<string, "primary" | "secondary" | "outline" | "success" | "danger" | "warning"> = {
    transport: "primary",
    food: "warning",
    energy: "secondary",
    shopping: "outline",
    waste: "outline",
    general: "outline",
  };

  if (variant === "small") {
    return (
      <div className="rounded-xl border border-gray-200 bg-white/60 p-4 shadow-sm dark:border-gray-800 dark:bg-gray-900/60 backdrop-blur-sm space-y-3 transition-all text-left">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-bold text-xs">
            <Lightbulb className="h-4 w-4 animate-pulse text-amber-500" />
            <span>Today's Carbon Insight</span>
          </div>
          <Badge variant={categoryBadgeVariants[tip.category] || "outline"} className="text-[10px] py-0 px-1.5 font-bold uppercase tracking-wider">
            {categoryEmoji[tip.category] || tip.category}
          </Badge>
        </div>
        <div className="space-y-1">
          <h4 className="text-sm font-bold text-gray-900 dark:text-white">
            {tip.title}
          </h4>
          <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed">
            {tip.fact}
          </p>
        </div>
        <div className="bg-emerald-50/70 border-l-4 border-emerald-500 p-2.5 rounded-r-md text-[11px] text-emerald-950 dark:bg-emerald-950/20 dark:text-emerald-200">
          <strong className="font-semibold block mb-0.5 text-emerald-800 dark:text-emerald-300">Action Tip:</strong>
          {tip.actionTip}
        </div>
        <div className="flex items-center justify-between text-[10px] text-gray-400">
          <span className="italic">Source: {tip.source}</span>
          <button
            onClick={handleShare}
            className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-bold hover:underline focus:outline-none focus:ring-1 focus:ring-emerald-500 rounded px-1 py-0.5"
            aria-label="Share this insight"
          >
            {copied ? (
              <><Check className="h-3 w-3" /> Copied</>
            ) : (
              <><Share2 className="h-3 w-3" /> Share</>
            )}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900 space-y-4 transition-all text-left">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-bold text-sm">
          <Lightbulb className="h-5 w-5 animate-pulse text-amber-500" />
          <span>Today's Carbon Insight</span>
        </div>
        <Badge variant={categoryBadgeVariants[tip.category] || "outline"} className="text-xs font-bold uppercase tracking-wider">
          {categoryEmoji[tip.category] || tip.category}
        </Badge>
      </div>
      <div className="space-y-2">
        <h4 className="text-base font-bold text-gray-900 dark:text-white">
          {tip.title}
        </h4>
        <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
          {tip.fact}
        </p>
      </div>
      <div className="bg-emerald-50/70 border-l-4 border-emerald-500 p-3 rounded-r-lg text-xs text-emerald-950 dark:bg-emerald-950/20 dark:text-emerald-200">
        <strong className="font-bold block mb-1 text-emerald-800 dark:text-emerald-300">What you can do:</strong>
        {tip.actionTip}
      </div>
      <div className="flex items-center justify-between border-t border-gray-100 dark:border-gray-800 pt-3 text-xs text-gray-400">
        <span className="italic">Source: {tip.source}</span>
        <button
          onClick={handleShare}
          className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-bold hover:underline focus:outline-none focus:ring-2 focus:ring-emerald-500 rounded px-2 py-1"
          aria-label="Share this insight"
        >
          {copied ? (
            <><Check className="h-3.5 w-3.5" /> Copied!</>
          ) : (
            <><Share2 className="h-3.5 w-3.5" /> Share Insight</>
          )}
        </button>
      </div>
    </div>
  );
}
