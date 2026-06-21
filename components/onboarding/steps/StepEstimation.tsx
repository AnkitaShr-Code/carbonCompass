import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "../../ui/Button";

interface StepEstimationProps {
  estimate: number;
  country: string;
  countryAvg: number;
  target15C: number;
  estimateColorClass: string;
  estimatePct: number;
  countryAvgPct: number;
  targetPct: number;
  handleNext: () => void;
  handleBack: () => void;
  getTabIndex: (step: number) => number;
  stepIndex: number;
}

export function StepEstimation({
  estimate, country, countryAvg, target15C, estimateColorClass,
  estimatePct, countryAvgPct, targetPct,
  handleNext, handleBack, getTabIndex, stepIndex
}: StepEstimationProps) {
  return (
    <div className="w-1/5 shrink-0 px-2 flex flex-col justify-between h-full space-y-4">
      <div className="space-y-4">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white">Estimated Baseline</h3>
        <p className="text-sm text-gray-650 dark:text-gray-300">
          Based on your answers, we estimate your footprint at{" "}
          <strong className="text-base text-primary-800 dark:text-primary-400 font-extrabold">
            ~{estimate.toFixed(1)} tonnes
          </strong>{" "}
          CO₂e/year.
        </p>

        <div className="space-y-3.5 bg-gray-50 dark:bg-gray-900/40 p-4 rounded-xl border border-gray-100 dark:border-gray-800">
          <div className="space-y-1">
            <div className="flex justify-between text-[11px] font-bold text-gray-600 dark:text-gray-300 uppercase">
              <span>Your Estimate</span>
              <span className="font-extrabold text-gray-900 dark:text-white">{estimate.toFixed(1)}t</span>
            </div>
            <div className="h-3 w-full bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden">
              <div className={`h-full rounded-full transition-all duration-700 ${estimateColorClass}`} style={{ width: `${estimatePct}%` }} />
            </div>
          </div>
          <div className="space-y-1">
            <div className="flex justify-between text-[11px] font-bold text-gray-600 dark:text-gray-300 uppercase">
              <span>Country Avg ({country.toUpperCase()})</span>
              <span className="font-extrabold text-gray-950 dark:text-white">{countryAvg.toFixed(1)}t</span>
            </div>
            <div className="h-3 w-full bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden">
              <div className="h-full rounded-full bg-gray-400 dark:bg-gray-500 transition-all duration-700" style={{ width: `${countryAvgPct}%` }} />
            </div>
          </div>
          <div className="space-y-1">
            <div className="flex justify-between text-[11px] font-bold text-gray-600 dark:text-gray-300 uppercase">
              <span>1.5°C Global Target</span>
              <span className="font-extrabold text-emerald-600 dark:text-emerald-400">{target15C.toFixed(1)}t</span>
            </div>
            <div className="h-3 w-full bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden">
              <div className="h-full rounded-full bg-emerald-500 dark:bg-emerald-400 transition-all duration-700" style={{ width: `${targetPct}%` }} />
            </div>
          </div>
        </div>
      </div>
      <div className="flex justify-between items-center pt-4">
        <Button variant="ghost" tabIndex={getTabIndex(stepIndex)} onClick={handleBack} className="flex items-center gap-1">
          <ChevronLeft className="h-4 w-4" /> Back
        </Button>
        <Button tabIndex={getTabIndex(stepIndex)} onClick={handleNext} className="flex items-center gap-1">
          Next <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
