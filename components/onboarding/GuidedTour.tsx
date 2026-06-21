"use client";

import React, { useState, useEffect, useCallback } from "react";

const TOUR_KEY = "carboncompass_tour_done";

interface Step {
  selector: string;       // CSS selector for target element
  heading: string;
  body: string;
  placement: "below" | "above" | "left" | "right";
}

const STEPS: Step[] = [
  {
    selector: "[data-tour='compass-score']",
    heading: "Your Compass Score",
    body: "This is your CarbonCompass Score — a 0–100 rating of your carbon performance based on emissions, tracking streak, and category diversity.",
    placement: "below",
  },
  {
    selector: "[data-tour='nav-insights']",
    heading: "AI Coach",
    body: "Ask the AI for personalized recommendations based on your real data. It parses your activity log to suggest the highest-impact changes.",
    placement: "below",
  },
  {
    selector: "[data-tour='nav-insights']",
    heading: "What-If Simulations",
    body: "On the Insights page, try a What-If simulation to instantly see how switching habits (like car → bus, or beef → legumes) reduces your footprint.",
    placement: "below",
  },
];

interface TooltipPosition {
  top: number;
  left: number;
  arrowSide: "top" | "bottom" | "left" | "right";
}

function getTooltipPosition(selector: string, placement: Step["placement"]): TooltipPosition | null {
  const el = document.querySelector(selector);
  if (!el) return null;

  const rect = el.getBoundingClientRect();
  const scrollY = window.scrollY;
  const scrollX = window.scrollX;
  const tooltipW = 280;
  const tooltipH = 130; // approximate
  const gap = 12;

  let top = 0;
  let left = 0;
  let arrowSide: TooltipPosition["arrowSide"] = "top";

  switch (placement) {
    case "below":
      top = rect.bottom + scrollY + gap;
      left = Math.max(8, Math.min(
        rect.left + scrollX + rect.width / 2 - tooltipW / 2,
        window.innerWidth - tooltipW - 8
      ));
      arrowSide = "top";
      break;
    case "above":
      top = rect.top + scrollY - tooltipH - gap;
      left = Math.max(8, Math.min(
        rect.left + scrollX + rect.width / 2 - tooltipW / 2,
        window.innerWidth - tooltipW - 8
      ));
      arrowSide = "bottom";
      break;
    case "right":
      top = rect.top + scrollY + rect.height / 2 - tooltipH / 2;
      left = rect.right + scrollX + gap;
      arrowSide = "left";
      break;
    case "left":
      top = rect.top + scrollY + rect.height / 2 - tooltipH / 2;
      left = rect.left + scrollX - tooltipW - gap;
      arrowSide = "right";
      break;
  }

  return { top, left, arrowSide };
}

interface HighlightRect {
  top: number;
  left: number;
  width: number;
  height: number;
}

function getHighlightRect(selector: string): HighlightRect | null {
  const el = document.querySelector(selector);
  if (!el) return null;
  const rect = el.getBoundingClientRect();
  return {
    top: rect.top + window.scrollY - 4,
    left: rect.left + window.scrollX - 4,
    width: rect.width + 8,
    height: rect.height + 8,
  };
}

export const GuidedTour = React.memo(function GuidedTour() {
  const [step, setStep] = useState(0);
  const [visible, setVisible] = useState(false);
  const [pos, setPos] = useState<TooltipPosition | null>(null);
  const [highlight, setHighlight] = useState<HighlightRect | null>(null);

  const currentStep = STEPS[step];

  const updatePosition = useCallback(() => {
    if (!currentStep) return;
    const p = getTooltipPosition(currentStep.selector, currentStep.placement);
    const h = getHighlightRect(currentStep.selector);
    setPos(p);
    setHighlight(h);
  }, [currentStep]);

  const dismiss = useCallback(() => {
    try {
      localStorage.setItem(TOUR_KEY, "1");
    } catch (e) {
      console.error(e);
    }
    setVisible(false);
  }, []);

  const next = useCallback(() => {
    if (step >= STEPS.length - 1) {
      dismiss();
    } else {
      setStep(s => s + 1);
    }
  }, [step, dismiss]);

  useEffect(() => {
    // Only show if tour hasn't been done
    if (typeof window === "undefined") return;
    try {
      if (localStorage.getItem(TOUR_KEY)) return;
    } catch (e) {
      console.error(e);
      return;
    }
    // Small delay to let DOM paint
    const t = setTimeout(() => {
      setVisible(true);
      updatePosition();
    }, 600);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (!visible) return;
    updatePosition();
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        dismiss();
      }
    };
    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition, { passive: true });
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [visible, step, updatePosition, dismiss]);

  if (!visible || !currentStep) return null;

  const arrowClasses: Record<TooltipPosition["arrowSide"], string> = {
    top:    "absolute -top-2 left-1/2 -translate-x-1/2 border-l-8 border-r-8 border-b-8 border-l-transparent border-r-transparent border-b-gray-900",
    bottom: "absolute -bottom-2 left-1/2 -translate-x-1/2 border-l-8 border-r-8 border-t-8 border-l-transparent border-r-transparent border-t-gray-900",
    left:   "absolute -left-2 top-1/2 -translate-y-1/2 border-t-8 border-b-8 border-r-8 border-t-transparent border-b-transparent border-r-gray-900",
    right:  "absolute -right-2 top-1/2 -translate-y-1/2 border-t-8 border-b-8 border-l-8 border-t-transparent border-b-transparent border-l-gray-900",
  };

  return (
    <>
      {/* Semi-transparent overlay */}
      <div
        className="fixed inset-0 z-[900] pointer-events-none"
        style={{ background: "rgba(0,0,0,0.35)" }}
        aria-hidden="true"
      />

      {/* Pulsing highlight ring around target */}
      {highlight && (
        <div
          aria-hidden="true"
          className="fixed z-[901] pointer-events-none rounded-xl"
          style={{
            top: highlight.top,
            left: highlight.left,
            width: highlight.width,
            height: highlight.height,
            boxShadow: "0 0 0 3px #10b981, 0 0 0 6px rgba(16,185,129,0.3)",
            animation: "pulse 1.8s ease-in-out infinite",
          }}
        />
      )}

      {/* Tooltip card */}
      {pos && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={`Guided tour step ${step + 1} of ${STEPS.length}: ${currentStep.heading}`}
          className="fixed z-[902] w-72 bg-gray-900 text-white rounded-xl p-4 shadow-2xl border border-gray-700"
          style={{ top: pos.top, left: pos.left }}
        >
          {/* Arrow */}
          <div className={arrowClasses[pos.arrowSide]} aria-hidden="true" />

          {/* Step counter */}
          <div className="flex items-center justify-between mb-2">
            <div className="flex gap-1">
              {STEPS.map((_, i) => (
                <div
                  key={i}
                  className={`h-1.5 rounded-full transition-all ${
                    i === step
                      ? "w-5 bg-emerald-400"
                      : i < step
                      ? "w-2 bg-emerald-700"
                      : "w-2 bg-gray-600"
                  }`}
                />
              ))}
            </div>
            <span className="text-[10px] text-gray-400 font-semibold">
              {step + 1} / {STEPS.length}
            </span>
          </div>

          {/* Content */}
          <h4 className="text-sm font-bold text-white mb-1">{currentStep.heading}</h4>
          <p className="text-xs text-gray-300 leading-relaxed">{currentStep.body}</p>

          {/* Actions */}
          <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-700">
            <button
              onClick={dismiss}
              className="text-xs text-gray-400 hover:text-gray-200 transition-colors cursor-pointer focus:outline-none focus-visible:underline"
            >
              Skip tour
            </button>
            <button
              onClick={next}
              className="text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white px-3 py-1.5 rounded-lg transition-colors cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400"
            >
              {step >= STEPS.length - 1 ? "Finish ✓" : "Next →"}
            </button>
          </div>
        </div>
      )}

      {/* CSS pulse keyframe via style tag */}
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.6; }
        }
      `}</style>
    </>
  );
});
