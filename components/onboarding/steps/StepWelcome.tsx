import React from "react";
import { Button } from "../../ui/Button";

interface StepWelcomeProps {
  handleNext: () => void;
  getTabIndex: (step: number) => number;
  stepIndex: number;
}

export function StepWelcome({ handleNext, getTabIndex, stepIndex }: StepWelcomeProps) {
  return (
    <div className="w-1/5 shrink-0 px-2 flex flex-col justify-between h-full space-y-6">
      <div className="text-center space-y-4">
        <h3 className="text-xl font-extrabold tracking-tight text-gray-900 dark:text-white sm:text-2xl">
          Track your carbon footprint in 60 seconds a day
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-300">
          CarbonCompass helps you navigate your path to lower emissions with AI insights and simple daily logs.
        </p>
      </div>

      <div className="py-2 flex items-center justify-center">
        <svg className="w-32 h-32 animate-spin-earth select-none pointer-events-none" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r="46" className="fill-blue-500/10 stroke-blue-500/30" strokeWidth="1" />
          <path
            d="M 25,40 C 20,35 15,35 12,38 C 15,48 20,52 28,48 C 30,46 32,38 25,40 Z
               M 55,25 C 57,20 62,18 66,20 C 70,22 68,28 64,30 C 60,32 57,30 55,25 Z
               M 40,60 C 43,58 46,59 48,62 C 50,65 47,68 44,68 C 41,68 39,63 40,60 Z
               M 65,55 C 69,50 74,52 73,58 C 71,64 66,65 64,61 C 62,57 63,55 65,55 Z"
            className="fill-emerald-500/50 dark:fill-emerald-400/50 stroke-emerald-600/20"
            strokeWidth="0.5"
          />
          <circle cx="50" cy="50" r="32" className="fill-none stroke-blue-400/10" strokeWidth="1" />
          <line x1="4" y1="50" x2="96" y2="50" className="stroke-blue-400/10" strokeWidth="0.5" />
          <line x1="50" y1="4" x2="50" y2="96" className="stroke-blue-400/10" strokeWidth="0.5" />
        </svg>
      </div>

      <div className="flex justify-center pt-2">
        <Button tabIndex={getTabIndex(stepIndex)} onClick={handleNext} className="w-full sm:w-auto px-8">
          Get Started
        </Button>
      </div>
    </div>
  );
}
