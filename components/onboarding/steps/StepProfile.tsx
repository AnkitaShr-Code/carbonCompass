import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "../../ui/Button";

interface StepProfileProps {
  name: string;
  setName: (n: string) => void;
  country: string;
  setCountry: (c: any) => void;
  lifestyle: string;
  setLifestyle: (l: any) => void;
  handleNext: () => void;
  handleBack: () => void;
  getTabIndex: (step: number) => number;
  stepIndex: number;
}

export function StepProfile({
  name, setName,
  country, setCountry,
  lifestyle, setLifestyle,
  handleNext, handleBack, getTabIndex, stepIndex
}: StepProfileProps) {
  return (
    <div className="w-1/5 shrink-0 px-2 flex flex-col justify-between h-full space-y-4">
      <div className="space-y-4">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white">About You</h3>
        <div className="space-y-1.5">
          <label htmlFor="onboard-name" className="text-sm font-semibold text-gray-700 dark:text-gray-300">Your Name (optional)</label>
          <input
            id="onboard-name"
            type="text"
            maxLength={50}
            tabIndex={getTabIndex(stepIndex)}
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter name or nickname"
            className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:ring-offset-2 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
          />
        </div>
        <div className="space-y-1.5">
          <label htmlFor="onboard-country" className="text-sm font-semibold text-gray-700 dark:text-gray-300">Country / Region</label>
          <select
            id="onboard-country"
            tabIndex={getTabIndex(stepIndex)}
            value={country}
            onChange={(e) => setCountry(e.target.value)}
            className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:ring-offset-2 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
            required
            aria-required="true"
          >
            <option value="usa">🇺🇸 United States</option>
            <option value="uk">🇬🇧 United Kingdom</option>
            <option value="india">🇮🇳 India</option>
            <option value="germany">🇩🇪 Germany</option>
            <option value="australia">🇦🇺 Australia</option>
          </select>
        </div>
        <fieldset className="space-y-2">
          <legend className="text-sm font-semibold text-gray-700 dark:text-gray-300 block">Lifestyle Area</legend>
          <div className="grid grid-cols-3 gap-2">
            {(["city", "suburban", "rural"] as const).map((opt) => (
              <div key={opt} className="relative">
                <input
                  type="radio"
                  id={`life-${opt}`}
                  name="lifestyle"
                  value={opt}
                  checked={lifestyle === opt}
                  tabIndex={getTabIndex(stepIndex)}
                  onChange={() => setLifestyle(opt)}
                  className="peer sr-only"
                />
                <label
                  htmlFor={`life-${opt}`}
                  className="flex flex-col items-center justify-center p-3 text-xs font-semibold rounded-lg border border-gray-200 bg-white cursor-pointer hover:bg-gray-50 peer-checked:border-emerald-500 peer-checked:bg-emerald-50 peer-checked:text-emerald-900 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-100 dark:hover:bg-gray-700 dark:peer-checked:border-emerald-500 dark:peer-checked:bg-emerald-900/50 dark:peer-checked:text-emerald-300 transition-all text-center peer-focus-visible:ring-2 peer-focus-visible:ring-emerald-500 peer-focus-visible:ring-offset-2"
                >
                  <span className="capitalize">{opt}</span>
                </label>
              </div>
            ))}
          </div>
        </fieldset>
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
