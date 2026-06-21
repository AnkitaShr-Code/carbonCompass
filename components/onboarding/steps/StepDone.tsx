import React from "react";
import { CheckCircle2 } from "lucide-react";
import { Button } from "../../ui/Button";

interface StepDoneProps {
  handleComplete: () => void;
  getTabIndex: (step: number) => number;
  stepIndex: number;
}

export function StepDone({ handleComplete, getTabIndex, stepIndex }: StepDoneProps) {
  return (
    <div className="w-1/5 shrink-0 px-2 flex flex-col justify-between h-full text-center space-y-6">
      <div className="space-y-4 py-4 flex flex-col items-center">
        <CheckCircle2 className="h-16 w-16 text-emerald-500 dark:text-emerald-400 animate-bounce mb-2" />
        <h3 className="text-xl font-black text-gray-900 dark:text-white">You're all set!</h3>
        <p className="text-sm text-gray-500 dark:text-gray-300 max-w-sm">
          Your profile and baseline are saved. Get ready to log your first carbon activity and start making improvements.
        </p>
      </div>

      <div className="flex justify-center pt-2">
        <Button tabIndex={getTabIndex(stepIndex)} onClick={handleComplete} className="w-full px-8 py-3 text-base">
          Start Logging Activities
        </Button>
      </div>
    </div>
  );
}
