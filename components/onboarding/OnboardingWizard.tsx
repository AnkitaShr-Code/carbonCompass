"use client";

import React, { useState, useEffect, useRef } from "react";
import { getProfile, saveProfile } from "../../lib/storage";
import { sanitizeString } from "../../lib/sanitize";
import { COUNTRY_AVERAGES } from "../../lib/emissionFactors";
import { Button } from "../ui/Button";
import { ChevronLeft, ChevronRight, CheckCircle2 } from "lucide-react";

export function OnboardingWizard() {
  const [show, setShow] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  // Step 2 state
  const [name, setName] = useState("");
  const [country, setCountry] = useState<'india' | 'uk' | 'usa' | 'germany' | 'australia'>("usa");
  const [lifestyle, setLifestyle] = useState<'city' | 'suburban' | 'rural'>("city");

  // Step 3 state
  const [commute, setCommute] = useState<'walk_cycle' | 'public_transit' | 'car' | 'wfh'>("public_transit");
  const [diet, setDiet] = useState<'daily_meat' | 'some_meat' | 'rarely_meat' | 'vegetarian'>("some_meat");
  const [energySource, setEnergySource] = useState<'grid' | 'partly_renewable' | 'fully_renewable'>("grid");

  const modalRef = useRef<HTMLDivElement>(null);

  // Check if profile exists on client mount
  useEffect(() => {
    const profile = getProfile();
    if (!profile) {
      setShow(true);
    }
  }, []);

  // Native Focus Trapping & Initial Focus
  useEffect(() => {
    if (!show) return;

    // Focus first element on mount
    if (modalRef.current) {
      const focusable = modalRef.current.querySelectorAll(
        'button:not([disabled]):not([tabindex="-1"]), input:not([disabled]):not([tabindex="-1"]), select:not([disabled]):not([tabindex="-1"])'
      );
      if (focusable[0]) {
        (focusable[0] as HTMLElement).focus();
      }
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key !== "Tab") return;
      if (!modalRef.current) return;

      // Find all elements that can be focused in the current view
      const allFocusable = Array.from(
        modalRef.current.querySelectorAll(
          'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]'
        )
      ).filter((el) => {
        // Exclude elements that have tabIndex={-1}
        if (el.getAttribute("tabindex") === "-1") return false;
        const rect = el.getBoundingClientRect();
        return rect.width > 0 && rect.height > 0;
      });

      if (allFocusable.length === 0) return;

      const first = allFocusable[0] as HTMLElement;
      const last = allFocusable[allFocusable.length - 1] as HTMLElement;

      if (e.shiftKey) {
        if (document.activeElement === first) {
          last.focus();
          e.preventDefault();
        }
      } else {
        if (document.activeElement === last) {
          first.focus();
          e.preventDefault();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [show, currentStep]);

  if (!show) return null;

  // Estimated annual footprint calculation (tonnes CO2e/year)
  const getFootprintEstimate = (): number => {
    const commuteVal = {
      car: 2.4,
      public_transit: 0.8,
      walk_cycle: 0.1,
      wfh: 0.3,
    }[commute];

    const dietVal = {
      daily_meat: 2.5,
      some_meat: 1.5,
      rarely_meat: 0.8,
      vegetarian: 0.4,
    }[diet];

    const countryAvg = COUNTRY_AVERAGES[country] || 5.5;

    let energyVal = 0.05;
    if (energySource === "grid") {
      energyVal = countryAvg * 0.3;
    } else if (energySource === "partly_renewable") {
      energyVal = countryAvg * 0.15;
    }

    return parseFloat((commuteVal + dietVal + energyVal).toFixed(1));
  };

  const estimate = getFootprintEstimate();
  const countryAvg = COUNTRY_AVERAGES[country] || 5.5;
  const target15C = 2.3;

  const maxVal = Math.max(estimate, countryAvg, target15C);
  const estimatePct = (estimate / maxVal) * 100;
  const countryAvgPct = (countryAvg / maxVal) * 100;
  const targetPct = (target15C / maxVal) * 100;

  // Determine estimate color based on baseline comparisons
  let estimateColorClass = "bg-emerald-500 dark:bg-emerald-400";
  if (estimate > countryAvg) {
    estimateColorClass = "bg-rose-500 dark:bg-rose-400";
  } else if (estimate > target15C) {
    estimateColorClass = "bg-amber-500 dark:bg-amber-400";
  }

  const handleNext = () => {
    if (currentStep < 4) {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const handleComplete = () => {
    const sanitizedName = sanitizeString(name, 50) || "Eco Navigator";
    const profileData = {
      name: sanitizedName,
      country,
      lifestyle,
      commute,
      diet,
      energySource,
      setupComplete: true,
    };

    saveProfile(profileData);
    setShow(false);
    
    // Redirect/force reload to tracker to ensure state updates
    window.location.href = "/tracker";
  };

  const getTabIndex = (step: number) => (currentStep === step ? 0 : -1);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-gray-950/80 p-4 backdrop-blur-sm animate-fade-in">
      {/* Styles for Earth Animation */}
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes spin-earth {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-spin-earth {
          animation: spin-earth 30s linear infinite;
        }
      `}} />

      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="wizard-title"
        className="relative w-full max-w-lg overflow-hidden rounded-2xl border border-gray-200 bg-white p-6 shadow-xl dark:border-gray-800 dark:bg-gray-900"
      >
        {/* Step Indicator dots at top */}
        <div className="flex justify-center space-x-2 mb-6">
          {[0, 1, 2, 3, 4].map((idx) => (
            <div
              key={idx}
              className={`h-2 rounded-full transition-all duration-300 ${
                idx === currentStep
                  ? "w-6 bg-primary-800 dark:bg-primary-500"
                  : "w-2 bg-gray-200 dark:bg-gray-800"
              }`}
            />
          ))}
        </div>

        {/* Multi-step Slider Area */}
        <div className="overflow-hidden relative w-full min-h-[380px]">
          <div
            className="flex transition-transform duration-500 ease-out h-full"
            style={{
              transform: `translateX(-${currentStep * 20}%)`,
              width: "500%",
            }}
          >
            {/* Step 1: Welcome */}
            <div className="w-1/5 shrink-0 px-2 flex flex-col justify-between h-full space-y-6">
              <div className="text-center space-y-4">
                <h3
                  id="wizard-title"
                  className="text-xl font-extrabold tracking-tight text-gray-900 dark:text-white sm:text-2xl"
                >
                  Track your carbon footprint in 60 seconds a day
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  CarbonCompass helps you navigate your path to lower emissions with AI insights and simple daily logs.
                </p>
              </div>

              {/* Animated Rotating SVG Earth */}
              <div className="py-2 flex items-center justify-center">
                <svg
                  className="w-32 h-32 animate-spin-earth select-none pointer-events-none"
                  viewBox="0 0 100 100"
                >
                  <circle
                    cx="50"
                    cy="50"
                    r="46"
                    className="fill-blue-500/10 stroke-blue-500/30"
                    strokeWidth="1"
                  />
                  <path
                    d="M 25,40 C 20,35 15,35 12,38 C 15,48 20,52 28,48 C 30,46 32,38 25,40 Z
                       M 55,25 C 57,20 62,18 66,20 C 70,22 68,28 64,30 C 60,32 57,30 55,25 Z
                       M 40,60 C 43,58 46,59 48,62 C 50,65 47,68 44,68 C 41,68 39,63 40,60 Z
                       M 65,55 C 69,50 74,52 73,58 C 71,64 66,65 64,61 C 62,57 63,55 65,55 Z"
                    className="fill-emerald-500/50 dark:fill-emerald-400/50 stroke-emerald-600/20"
                    strokeWidth="0.5"
                  />
                  <circle
                    cx="50"
                    cy="50"
                    r="32"
                    className="fill-none stroke-blue-400/10"
                    strokeWidth="1"
                  />
                  <line
                    x1="4"
                    y1="50"
                    x2="96"
                    y2="50"
                    className="stroke-blue-400/10"
                    strokeWidth="0.5"
                  />
                  <line
                    x1="50"
                    y1="4"
                    x2="50"
                    y2="96"
                    className="stroke-blue-400/10"
                    strokeWidth="0.5"
                  />
                </svg>
              </div>

              <div className="flex justify-center pt-2">
                <Button
                  tabIndex={getTabIndex(0)}
                  onClick={handleNext}
                  className="w-full sm:w-auto px-8"
                >
                  Get Started
                </Button>
              </div>
            </div>

            {/* Step 2: Profile Settings */}
            <div className="w-1/5 shrink-0 px-2 flex flex-col justify-between h-full space-y-4">
              <div className="space-y-4">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                  About You
                </h3>
                
                <div className="space-y-1.5">
                  <label
                    htmlFor="onboard-name"
                    className="text-sm font-semibold text-gray-700 dark:text-gray-300"
                  >
                    Your Name (optional)
                  </label>
                  <input
                    id="onboard-name"
                    type="text"
                    maxLength={50}
                    tabIndex={getTabIndex(1)}
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter name or nickname"
                    className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
                  />
                </div>

                <div className="space-y-1.5">
                  <label
                    htmlFor="onboard-country"
                    className="text-sm font-semibold text-gray-700 dark:text-gray-300"
                  >
                    Country / Region
                  </label>
                  <select
                    id="onboard-country"
                    tabIndex={getTabIndex(1)}
                    value={country}
                    onChange={(e) => setCountry(e.target.value as any)}
                    className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
                  >
                    <option value="usa">🇺🇸 United States</option>
                    <option value="uk">🇬🇧 United Kingdom</option>
                    <option value="india">🇮🇳 India</option>
                    <option value="germany">🇩🇪 Germany</option>
                    <option value="australia">🇦🇺 Australia</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <span className="text-sm font-semibold text-gray-700 dark:text-gray-300 block">
                    Lifestyle Area
                  </span>
                  <div className="grid grid-cols-3 gap-2">
                    {(["city", "suburban", "rural"] as const).map((opt) => (
                      <div key={opt} className="relative">
                        <input
                          type="radio"
                          id={`life-${opt}`}
                          name="lifestyle"
                          value={opt}
                          checked={lifestyle === opt}
                          tabIndex={getTabIndex(1)}
                          onChange={() => setLifestyle(opt)}
                          className="peer sr-only"
                        />
                        <label
                          htmlFor={`life-${opt}`}
                          className="flex flex-col items-center justify-center p-3 text-xs font-semibold rounded-lg border border-gray-200 bg-white cursor-pointer hover:bg-gray-50 peer-checked:border-primary-500 peer-checked:bg-primary-50 peer-checked:text-primary-850 dark:border-gray-800 dark:bg-gray-850 dark:hover:bg-gray-800 dark:peer-checked:border-primary-500 dark:peer-checked:bg-primary-950/40 dark:peer-checked:text-primary-200 transition-all text-center"
                        >
                          <span className="capitalize">{opt}</span>
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Step Navigation controls */}
              <div className="flex justify-between items-center pt-4">
                <Button
                  variant="ghost"
                  tabIndex={getTabIndex(1)}
                  onClick={handleBack}
                  className="flex items-center gap-1"
                >
                  <ChevronLeft className="h-4 w-4" /> Back
                </Button>
                <Button
                  tabIndex={getTabIndex(1)}
                  onClick={handleNext}
                  className="flex items-center gap-1"
                >
                  Next <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Step 3: Quick Baseline */}
            <div className="w-1/5 shrink-0 px-2 flex flex-col justify-between h-full space-y-4">
              <div className="space-y-4">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                  Lifestyle Baseline
                </h3>

                {/* Commute radio group */}
                <div className="space-y-1.5">
                  <span className="text-xs font-bold uppercase tracking-wider text-gray-400">
                    How do you usually commute?
                  </span>
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
                          tabIndex={getTabIndex(2)}
                          onChange={() => setCommute(opt.key as any)}
                          className="peer sr-only"
                        />
                        <label
                          htmlFor={`commute-${opt.key}`}
                          className="flex items-center justify-center px-2 py-2 text-xs font-semibold rounded-lg border border-gray-200 bg-white cursor-pointer hover:bg-gray-50 peer-checked:border-primary-500 peer-checked:bg-primary-50 peer-checked:text-primary-850 dark:border-gray-800 dark:bg-gray-850 dark:hover:bg-gray-800 dark:peer-checked:border-primary-500 dark:peer-checked:bg-primary-950/40 dark:peer-checked:text-primary-200 transition-all"
                        >
                          {opt.label}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Diet radio group */}
                <div className="space-y-1.5">
                  <span className="text-xs font-bold uppercase tracking-wider text-gray-400">
                    How often do you eat meat?
                  </span>
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
                          tabIndex={getTabIndex(2)}
                          onChange={() => setDiet(opt.key as any)}
                          className="peer sr-only"
                        />
                        <label
                          htmlFor={`diet-${opt.key}`}
                          className="flex items-center justify-center px-2 py-2 text-xs font-semibold rounded-lg border border-gray-200 bg-white cursor-pointer hover:bg-gray-50 peer-checked:border-primary-500 peer-checked:bg-primary-50 peer-checked:text-primary-850 dark:border-gray-800 dark:bg-gray-850 dark:hover:bg-gray-800 dark:peer-checked:border-primary-500 dark:peer-checked:bg-primary-950/40 dark:peer-checked:text-primary-200 transition-all"
                        >
                          {opt.label}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Energy radio group */}
                <div className="space-y-1.5">
                  <span className="text-xs font-bold uppercase tracking-wider text-gray-400">
                    What is your home energy source?
                  </span>
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
                          tabIndex={getTabIndex(2)}
                          onChange={() => setEnergySource(opt.key as any)}
                          className="peer sr-only"
                        />
                        <label
                          htmlFor={`energy-${opt.key}`}
                          className="flex flex-col items-center justify-center p-2 text-[10px] font-bold rounded-lg border border-gray-200 bg-white cursor-pointer hover:bg-gray-50 peer-checked:border-primary-500 peer-checked:bg-primary-50 peer-checked:text-primary-850 dark:border-gray-800 dark:bg-gray-850 dark:hover:bg-gray-800 dark:peer-checked:border-primary-500 dark:peer-checked:bg-primary-950/40 dark:peer-checked:text-primary-200 transition-all text-center"
                        >
                          {opt.label}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Step Navigation controls */}
              <div className="flex justify-between items-center pt-4">
                <Button
                  variant="ghost"
                  tabIndex={getTabIndex(2)}
                  onClick={handleBack}
                  className="flex items-center gap-1"
                >
                  <ChevronLeft className="h-4 w-4" /> Back
                </Button>
                <Button
                  tabIndex={getTabIndex(2)}
                  onClick={handleNext}
                  className="flex items-center gap-1"
                >
                  Next <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Step 4: Estimation */}
            <div className="w-1/5 shrink-0 px-2 flex flex-col justify-between h-full space-y-4">
              <div className="space-y-4">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                  Estimated Baseline
                </h3>

                <p className="text-sm text-gray-650 dark:text-gray-300">
                  Based on your answers, we estimate your footprint at{" "}
                  <strong className="text-base text-primary-800 dark:text-primary-400 font-extrabold">
                    ~{estimate.toFixed(1)} tonnes
                  </strong>{" "}
                  CO₂e/year.
                </p>

                {/* Horizontal progress comparison bars */}
                <div className="space-y-3.5 bg-gray-50 dark:bg-gray-900/40 p-4 rounded-xl border border-gray-100 dark:border-gray-800">
                  {/* Your estimate bar */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-[11px] font-bold text-gray-600 dark:text-gray-300 uppercase">
                      <span>Your Estimate</span>
                      <span className="font-extrabold text-gray-900 dark:text-white">{estimate.toFixed(1)}t</span>
                    </div>
                    <div className="h-3 w-full bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-700 ${estimateColorClass}`}
                        style={{ width: `${estimatePct}%` }}
                      />
                    </div>
                  </div>

                  {/* Country average bar */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-[11px] font-bold text-gray-600 dark:text-gray-300 uppercase">
                      <span>Country Avg ({country.toUpperCase()})</span>
                      <span className="font-extrabold text-gray-950 dark:text-white">{countryAvg.toFixed(1)}t</span>
                    </div>
                    <div className="h-3 w-full bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full bg-gray-400 dark:bg-gray-500 transition-all duration-700"
                        style={{ width: `${countryAvgPct}%` }}
                      />
                    </div>
                  </div>

                  {/* 1.5C global target */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-[11px] font-bold text-gray-600 dark:text-gray-300 uppercase">
                      <span>1.5°C Global Target</span>
                      <span className="font-extrabold text-emerald-600 dark:text-emerald-400">{target15C.toFixed(1)}t</span>
                    </div>
                    <div className="h-3 w-full bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full bg-emerald-500 dark:bg-emerald-400 transition-all duration-700"
                        style={{ width: `${targetPct}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Step Navigation controls */}
              <div className="flex justify-between items-center pt-4">
                <Button
                  variant="ghost"
                  tabIndex={getTabIndex(3)}
                  onClick={handleBack}
                  className="flex items-center gap-1"
                >
                  <ChevronLeft className="h-4 w-4" /> Back
                </Button>
                <Button
                  tabIndex={getTabIndex(3)}
                  onClick={handleNext}
                  className="flex items-center gap-1"
                >
                  Next <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Step 5: Done */}
            <div className="w-1/5 shrink-0 px-2 flex flex-col justify-between h-full text-center space-y-6">
              <div className="space-y-4 py-4 flex flex-col items-center">
                <CheckCircle2 className="h-16 w-16 text-emerald-500 dark:text-emerald-400 animate-bounce mb-2" />
                
                <h3 className="text-xl font-black text-gray-900 dark:text-white">
                  You're all set!
                </h3>
                
                <p className="text-sm text-gray-500 dark:text-gray-400 max-w-sm">
                  Your profile and baseline are saved. Get ready to log your first carbon activity and start making improvements.
                </p>
              </div>

              <div className="flex justify-center pt-2">
                <Button
                  tabIndex={getTabIndex(4)}
                  onClick={handleComplete}
                  className="w-full px-8 py-3 text-base"
                >
                  Start Logging Activities
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
