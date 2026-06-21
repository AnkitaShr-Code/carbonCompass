"use client";

import React, { useState, useEffect, useRef } from "react";
import { getProfile, saveProfile } from "../../lib/storage";
import { sanitizeString } from "../../lib/sanitize";
import { COUNTRY_AVERAGES } from "../../lib/emissionFactors";
import { StepWelcome } from "./steps/StepWelcome";
import { StepProfile } from "./steps/StepProfile";
import { StepBaseline } from "./steps/StepBaseline";
import { StepEstimation } from "./steps/StepEstimation";
import { StepDone } from "./steps/StepDone";

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

      const allFocusable = Array.from(
        modalRef.current.querySelectorAll(
          'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]'
        )
      ).filter((el) => {
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
    
    window.location.href = "/tracker";
  };

  const getTabIndex = (step: number) => (currentStep === step ? 0 : -1);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-gray-950/80 p-4 backdrop-blur-sm animate-fade-in">
      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="wizard-title"
        className="relative w-full max-w-lg overflow-hidden rounded-2xl border border-gray-200 bg-white p-6 shadow-xl dark:border-gray-800 dark:bg-gray-900"
      >
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

        <div className="overflow-hidden relative w-full min-h-[380px]">
          <div
            className="flex transition-transform duration-500 ease-out h-full"
            style={{
              transform: `translateX(-${currentStep * 20}%)`,
              width: "500%",
            }}
          >
            <StepWelcome handleNext={handleNext} getTabIndex={getTabIndex} stepIndex={0} />
            <StepProfile
              name={name} setName={setName}
              country={country} setCountry={setCountry}
              lifestyle={lifestyle} setLifestyle={setLifestyle}
              handleNext={handleNext} handleBack={handleBack}
              getTabIndex={getTabIndex} stepIndex={1}
            />
            <StepBaseline
              commute={commute} setCommute={setCommute}
              diet={diet} setDiet={setDiet}
              energySource={energySource} setEnergySource={setEnergySource}
              handleNext={handleNext} handleBack={handleBack}
              getTabIndex={getTabIndex} stepIndex={2}
            />
            <StepEstimation
              estimate={estimate} country={country} countryAvg={countryAvg} target15C={target15C}
              estimateColorClass={estimateColorClass} estimatePct={estimatePct}
              countryAvgPct={countryAvgPct} targetPct={targetPct}
              handleNext={handleNext} handleBack={handleBack}
              getTabIndex={getTabIndex} stepIndex={3}
            />
            <StepDone handleComplete={handleComplete} getTabIndex={getTabIndex} stepIndex={4} />
          </div>
        </div>
      </div>
    </div>
  );
}
