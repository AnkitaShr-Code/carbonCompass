import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "../../ui/Button";

interface StepBaselineProps {
  commute: string;
  setCommute: (c: any) => void;
  diet: string;
  setDiet: (d: any) => void;
  energySource: string;
  setEnergySource: (e: any) => void;
  handleNext: () => void;
  handleBack: () => void;
  getTabIndex: (step: number) => number;
  stepIndex: number;
}

export function StepBaseline({
  commute, setCommute,
  diet, setDiet,
  energySource, setEnergySource,
  handleNext, handleBack, getTabIndex, stepIndex
}: StepBaselineProps) {
  return (
    <div className="w-1/5 shrink-0 px-2 flex flex-col justify-between h-full space-y-4">
      <div className="space-y-4">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white">Lifestyle Baseline</h3>
        
        <div className="space-y-1.5">
          <span className="text-xs font-bold uppercase tracking-wider text-gray-400">How do you usually commute?</span>
          <div className="grid grid-cols-2 gap-1.5">
            {[
              { key: "walk_cycle", label: "🚶 Walk / Cycle" },
              { key: "public_transit", label: "🚌 Public Transit" },
              { key: "car", label: "🚗 Drive Car" },
              { key: "wfh", label: "💻 Remote / WFH" },
            ].map((opt) => (
              <div key={opt.key} className="relative">
                <input
                  type="radio"
                  id={`commute-${opt.key}`}
                  name="commute"
                  value={opt.key}
                  checked={commute === opt.key}
                  tabIndex={getTabIndex(stepIndex)}
                  onChange={() => setCommute(opt.key)}
                  className="peer sr-only"
                />
                <label
                  htmlFor={`commute-${opt.key}`}
                  className="flex items-center justify-center px-2 py-2 text-xs font-semibold rounded-lg border border-gray-200 bg-white cursor-pointer hover:bg-gray-50 peer-checked:border-emerald-500 peer-checked:bg-emerald-50 peer-checked:text-emerald-900 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-100 dark:hover:bg-gray-700 dark:peer-checked:border-emerald-500 dark:peer-checked:bg-emerald-900/50 dark:peer-checked:text-emerald-300 transition-all"
                >
                  {opt.label}
                </label>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-1.5">
          <span className="text-xs font-bold uppercase tracking-wider text-gray-400">How often do you eat meat?</span>
          <div className="grid grid-cols-2 gap-1.5">
            {[
              { key: "daily_meat", label: "🥩 Daily" },
              { key: "some_meat", label: "🍗 Few times/wk" },
              { key: "rarely_meat", label: "🥗 Rarely" },
              { key: "vegetarian", label: "🌱 Never / Veg" },
            ].map((opt) => (
              <div key={opt.key} className="relative">
                <input
                  type="radio"
                  id={`diet-${opt.key}`}
                  name="diet"
                  value={opt.key}
                  checked={diet === opt.key}
                  tabIndex={getTabIndex(stepIndex)}
                  onChange={() => setDiet(opt.key)}
                  className="peer sr-only"
                />
                <label
                  htmlFor={`diet-${opt.key}`}
                  className="flex items-center justify-center px-2 py-2 text-xs font-semibold rounded-lg border border-gray-200 bg-white cursor-pointer hover:bg-gray-50 peer-checked:border-emerald-500 peer-checked:bg-emerald-50 peer-checked:text-emerald-900 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-100 dark:hover:bg-gray-700 dark:peer-checked:border-emerald-500 dark:peer-checked:bg-emerald-900/50 dark:peer-checked:text-emerald-300 transition-all"
                >
                  {opt.label}
                </label>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-1.5">
          <span className="text-xs font-bold uppercase tracking-wider text-gray-400">What is your home energy source?</span>
          <div className="grid grid-cols-3 gap-1.5">
            {[
              { key: "grid", label: "🔌 Grid" },
              { key: "partly_renewable", label: "🌤️ Mixed" },
              { key: "fully_renewable", label: "☀️ Solar" },
            ].map((opt) => (
              <div key={opt.key} className="relative">
                <input
                  type="radio"
                  id={`energy-${opt.key}`}
                  name="energy"
                  value={opt.key}
                  checked={energySource === opt.key}
                  tabIndex={getTabIndex(stepIndex)}
                  onChange={() => setEnergySource(opt.key)}
                  className="peer sr-only"
                />
                <label
                  htmlFor={`energy-${opt.key}`}
                  className="flex flex-col items-center justify-center p-2 text-[10px] font-bold rounded-lg border border-gray-200 bg-white cursor-pointer hover:bg-gray-50 peer-checked:border-emerald-500 peer-checked:bg-emerald-50 peer-checked:text-emerald-900 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-100 dark:hover:bg-gray-700 dark:peer-checked:border-emerald-500 dark:peer-checked:bg-emerald-900/50 dark:peer-checked:text-emerald-300 transition-all text-center"
                >
                  {opt.label}
                </label>
              </div>
            ))}
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
