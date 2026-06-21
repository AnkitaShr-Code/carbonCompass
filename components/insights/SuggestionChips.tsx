"use client";

import React from "react";
import { WHATIF_CONFIGS } from "../../hooks/useAssistant";

interface SuggestionChipsProps {
  isLoading: boolean;
  onChipSend: (text: string) => void;
  onRunWhatIf: (configId: string) => void;
}

const AI_CHIPS = [
  "How can I reduce food emissions?",
  "Compare me to the average",
  "What was my best day this week?",
];

export function SuggestionChips({
  isLoading,
  onChipSend,
  onRunWhatIf,
}: SuggestionChipsProps) {
  return (
    <div className="px-4 py-3 border-t border-gray-100 dark:border-gray-800 bg-gray-50/40 dark:bg-gray-950/20 space-y-2 shrink-0">
      {/* Group 1: AI queries */}
      <div>
        <p className="text-[9px] uppercase font-bold text-gray-400 mb-1.5 tracking-wider">
          Ask CarbonCompass AI
        </p>
        <div className="flex flex-wrap gap-1.5">
          {AI_CHIPS.map((chip) => (
            <button
              key={chip}
              onClick={() => onChipSend(chip)}
              disabled={isLoading}
              className="text-[11px] font-medium bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-200 rounded-full px-3 py-1 hover:border-emerald-400 hover:text-emerald-700 dark:hover:border-emerald-600 dark:hover:text-emerald-400 transition-colors cursor-pointer select-none focus:outline-none focus:ring-2 focus:ring-green-600 focus:ring-offset-2 disabled:opacity-50"
            >
              {chip}
            </button>
          ))}
        </div>
      </div>

      {/* Group 2: What-If simulations */}
      <div>
        <p className="text-[9px] uppercase font-bold text-gray-400 mb-1.5 tracking-wider">
          What-If Simulations (instant)
        </p>
        <div className="flex flex-wrap gap-1.5">
          {WHATIF_CONFIGS.map((cfg) => (
            <button
              key={cfg.id}
              onClick={() => onRunWhatIf(cfg.id)}
              disabled={isLoading}
              className="text-[11px] font-medium bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800/60 text-blue-700 dark:text-blue-400 rounded-full px-3 py-1 hover:bg-blue-100 dark:hover:bg-blue-950/40 hover:border-blue-400 transition-colors cursor-pointer select-none focus:outline-none focus:ring-2 focus:ring-green-600 focus:ring-offset-2 disabled:opacity-50"
            >
              {cfg.emoji} {cfg.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
