"use client";

import React, { useTransition } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  ArrowRight,
  Car,
  CheckCircle2,
  ChevronLeft,
  Compass,
  Info,
  Recycle,
  ShoppingBag,
  Sparkles,
  UtensilsCrossed,
  Zap,
} from "lucide-react";

import { Button } from "../../components/ui/Button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "../../components/ui/Card";
import { useCarbonTracker } from "../../hooks/useCarbonTracker";
import { getEquivalences } from "../../lib/carbonUtils";
import { APP_CONSTANTS } from "../../lib/constants";
import { EMISSION_FACTORS } from "../../lib/emissionFactors";

export default function TrackerPage() {
  const {
    currentStep,
    selectedCategory,
    selectedSubtype,
    quantity,
    formErrors,
    co2ePreview,
    lastLogged,
    isLoaded,
    setQuantity,
    setFormCategory,
    setFormSubtype,
    goBack,
    submitActivity,
    resetForm,
  } = useCarbonTracker();

  const [, startTransition] = useTransition();

  // Equivalences live mapping
  const previewEquiv = React.useMemo(() => getEquivalences(co2ePreview), [co2ePreview]);

  if (!isLoaded) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-500 border-t-transparent mx-auto" />
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-300">Loading tracker...</p>
        </div>
      </div>
    );
  }

  // Categories helper configuration
  const categoriesList = [
    { key: "transport" as const, label: "Transport", icon: Car, desc: "Commutes, flights & travel" },
    { key: "food" as const, label: "Food", icon: UtensilsCrossed, desc: "Meat, dairy & meals" },
    { key: "energy" as const, label: "Energy", icon: Zap, desc: "Electricity & heating" },
    { key: "shopping" as const, label: "Shopping", icon: ShoppingBag, desc: "Clothes, tech & deliveries" },
    { key: "waste" as const, label: "Waste", icon: Recycle, desc: "Landfill, compost & recycling" },
  ];

  // Fetch unit for current selection
  const currentUnit = selectedCategory && selectedSubtype
    ? (EMISSION_FACTORS[selectedCategory] as any)[selectedSubtype]?.unit || ""
    : "";

  const currentLabel = selectedCategory && selectedSubtype
    ? (EMISSION_FACTORS[selectedCategory] as any)[selectedSubtype]?.label || ""
    : "";

  // Perform validation checks for display
  const qtyNum = parseFloat(quantity);
  const isInputInvalid = quantity !== "" && (isNaN(qtyNum) || qtyNum <= APP_CONSTANTS.MIN_ACTIVITY_QUANTITY || qtyNum > APP_CONSTANTS.MAX_ACTIVITY_QUANTITY);

  const handleCategoryCardClick = (key: 'transport' | 'food' | 'energy' | 'shopping' | 'waste') => {
    startTransition(() => {
      setFormCategory(key);
    });
  };

  const handleSubtypeCardClick = (key: string) => {
    startTransition(() => {
      setFormSubtype(key);
    });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight text-gray-900 dark:text-white sm:text-3xl">
          Carbon Activity Tracker
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-300">
          Log daily activities to estimate and review carbon impact.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Step-by-Step interactive form area (Colspan 2) */}
        <div className="lg:col-span-2 space-y-4">
          
          {/* Back button (Only visible on Step 2 & 3) */}
          {currentStep > 1 && currentStep < 4 && (
            <button
              onClick={goBack}
              className="flex items-center gap-1 text-xs font-bold text-gray-500 dark:text-gray-300 hover:text-gray-950 dark:hover:text-white transition-colors focus:outline-none"
            >
              <ChevronLeft className="h-4 w-4" /> Back to Step {currentStep - 1}
            </button>
          )}

          <Card className="w-full relative overflow-hidden">
            {/* Step Progress visual bar */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gray-100 dark:bg-gray-800">
              <div 
                className="h-full bg-emerald-500 dark:bg-emerald-400 transition-all duration-300"
                style={{ width: `${(currentStep / 4) * 100}%` }}
              />
            </div>

            <CardHeader className="pt-6">
              <div className="flex justify-between items-center">
                <CardTitle className="text-lg text-primary-800 dark:text-primary-200">
                  {currentStep === 1 && "Step 1: Pick a Category"}
                  {currentStep === 2 && "Step 2: Pick a Subtype"}
                  {currentStep === 3 && `Step 3: Enter Quantity for ${currentLabel}`}
                  {currentStep === 4 && "Logged Successfully"}
                </CardTitle>
                <span className="text-xs font-bold text-gray-450 uppercase">Step {currentStep} of 4</span>
              </div>
              <CardDescription>
                {currentStep === 1 && "Choose which carbon sector your activity fits into."}
                {currentStep === 2 && "Select the specific type of consumption."}
                {currentStep === 3 && `Input the amount in ${currentUnit} to estimate footprint.`}
                {currentStep === 4 && "Your entry has been recorded in your local browser profile."}
              </CardDescription>
            </CardHeader>

            <CardContent>
              {/* Step 1: Category Picker */}
              {currentStep === 1 && (
                <div className="grid grid-cols-2 md:grid-cols-5 gap-3.5 pt-2">
                  {categoriesList.map((cat) => {
                    const IconComponent = cat.icon;
                    const isSelected = selectedCategory === cat.key;
                    return (
                      <div
                        key={cat.key}
                        onClick={() => handleCategoryCardClick(cat.key)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            e.preventDefault();
                            handleCategoryCardClick(cat.key);
                          }
                        }}
                        tabIndex={0}
                        role="button"
                        aria-pressed={isSelected}
                        className={`flex flex-col items-center justify-center p-4 rounded-xl border cursor-pointer select-none text-center transition-all focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 ${
                          isSelected
                            ? "border-emerald-500 bg-emerald-50/50 text-emerald-900 dark:border-green-500 dark:bg-green-900/50 dark:text-green-300 border-2"
                            : "border-gray-200 hover:border-gray-300 bg-white hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-100"
                        }`}
                      >
                        <div className={`p-2.5 rounded-lg mb-3 ${
                          isSelected ? "bg-emerald-100 dark:bg-emerald-900/40" : "bg-gray-50 dark:bg-gray-900/50"
                        }`}>
                          <IconComponent className="h-6 w-6 stroke-[1.8]" />
                        </div>
                        <span className="text-xs font-bold tracking-tight block">{cat.label}</span>
                        <span className="text-[10px] text-gray-450 leading-tight mt-1 hidden md:block">{cat.desc}</span>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Step 2: Subtype Picker */}
              {currentStep === 2 && selectedCategory && (
                <div className="grid gap-2.5 pt-2 sm:grid-cols-2">
                  {Object.keys(EMISSION_FACTORS[selectedCategory]).map((key) => {
                    const info = (EMISSION_FACTORS[selectedCategory] as any)[key];
                    const isSelected = selectedSubtype === key;
                    return (
                      <button
                        key={key}
                        onClick={() => handleSubtypeCardClick(key)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            e.preventDefault();
                            handleSubtypeCardClick(key);
                          }
                        }}
                        role="button"
                        tabIndex={0}
                        className={`flex items-center justify-between p-3.5 text-left text-xs font-semibold rounded-lg border transition-all focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                          isSelected
                            ? "border-emerald-500 bg-emerald-50/50 text-emerald-900 dark:border-green-500 dark:bg-green-900/50 dark:text-green-300 border-2"
                            : "border-gray-200 hover:border-gray-300 bg-white hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-100"
                        }`}
                      >
                        <div>
                          <p className="font-bold text-sm text-gray-900 dark:text-white">{info.label}</p>
                          <p className="text-[10px] text-gray-400 mt-0.5">Coefficient: {info.factor} kg / {info.unit}</p>
                        </div>
                        <span className="text-[10px] bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-300 px-2 py-0.5 rounded font-bold uppercase shrink-0">
                          per {info.unit}
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Step 3: Quantity & Estimation */}
              {currentStep === 3 && selectedCategory && selectedSubtype && (
                <div className="space-y-4 pt-2">
                  <div className="space-y-1.5">
                    <label 
                      htmlFor="tracker-qty-input" 
                      className="text-sm font-semibold text-gray-700 dark:text-gray-300 block"
                    >
                      Usage Quantity ({currentUnit})
                    </label>
                    <div className="relative flex items-center">
                      <input
                        id="tracker-qty-input"
                        type="number"
                        step="any"
                        value={quantity}
                        onChange={(e) => setQuantity(e.target.value)}
                        placeholder={`e.g., Number of ${currentUnit}`}
                        className={`flex h-11 w-full rounded-md border bg-white pl-3 pr-16 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 dark:bg-gray-800 dark:text-gray-100 ${
                          isInputInvalid ? "border-red-500 dark:border-red-400" : "border-gray-300 dark:border-gray-700"
                        }`}
                        required
                        aria-required="true"
                      />
                      <span className="absolute right-3 text-xs font-bold text-gray-450 select-none uppercase">
                        {currentUnit}
                      </span>
                    </div>

                    {/* Inline Error Message */}
                    {isInputInvalid && (
                      <div role="alert" aria-live="assertive" className="flex items-center gap-1 text-xs text-red-650 dark:text-red-400 mt-1.5 font-bold">
                        <AlertTriangle className="h-4 w-4 shrink-0" />
                        <span>Quantity must be greater than {APP_CONSTANTS.MIN_ACTIVITY_QUANTITY} and at most {APP_CONSTANTS.MAX_ACTIVITY_QUANTITY.toLocaleString()}.</span>
                      </div>
                    )}
                  </div>

                  {/* Debounced live preview footprint card */}
                  {co2ePreview > 0 && (
                    <div className="p-4 rounded-xl border border-emerald-100 dark:border-emerald-950 bg-emerald-50/20 dark:bg-emerald-950/10 space-y-2.5 animate-fade-in">
                      <div>
                        <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wide block">
                          Footprint Preview
                        </span>
                        <p className="text-sm text-gray-700 dark:text-gray-300 mt-0.5">
                          This adds <strong className="text-emerald-700 dark:text-emerald-400 font-extrabold">{co2ePreview.toFixed(2)} kg CO₂e</strong> to your footprint.
                        </p>
                      </div>

                      {/* Equivalences summary */}
                      <div className="border-t border-emerald-100/50 dark:border-emerald-900/30 pt-2 text-[10px] text-gray-500 dark:text-gray-300 leading-relaxed font-semibold">
                        <span>
                          ≈ {previewEquiv.beefMeals} beef burgers or ≈ {previewEquiv.smartphoneCharges.toLocaleString()} smartphone charges.
                        </span>
                      </div>
                    </div>
                  )}

                  {/* General submission errors list */}
                  {formErrors.length > 0 && (
                    <div role="alert" aria-live="assertive" className="rounded-lg bg-red-50 p-3 text-xs text-red-800 dark:bg-red-950/40 dark:text-red-300 space-y-1">
                      <div className="flex items-center gap-1 font-bold">
                        <AlertTriangle className="h-4 w-4 shrink-0" />
                        <span>Please correct the errors below:</span>
                      </div>
                      <ul className="list-disc pl-5">
                        {formErrors.map((err, i) => (
                          <li key={i}>{err}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <Button
                    onClick={submitActivity}
                    disabled={isInputInvalid || !quantity}
                    className="w-full h-11 bg-emerald-600 hover:bg-emerald-750 text-white font-bold select-none cursor-pointer"
                  >
                    Log Activity
                  </Button>
                </div>
              )}

              {/* Step 4: Success confirmation screen */}
              {currentStep === 4 && lastLogged && (
                <div className="text-center py-6 space-y-6 flex flex-col items-center">
                  <div role="status" aria-live="polite" className="sr-only">
                    Activity logged: {lastLogged.co2e.toFixed(2)} kg CO₂e
                  </div>
                  <div className="flex flex-col items-center space-y-2">
                    <CheckCircle2 className="h-14 w-14 text-emerald-500 dark:text-emerald-400 animate-bounce" />
                    <h3 className="text-lg font-black text-gray-900 dark:text-white pt-2">
                      Activity Logged Successfully!
                    </h3>
                  </div>

                  <div className="bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-150 dark:border-emerald-900/30 px-5 py-4 rounded-xl max-w-sm w-full">
                    <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider block">
                      Footprint Impact
                    </span>
                    <span className="text-2xl font-black text-gray-900 dark:text-white block mt-1">
                      +{lastLogged.co2e.toFixed(2)} kg CO₂e
                    </span>
                    <span className="text-xs text-gray-500 dark:text-gray-300 mt-1 block">
                      Logged from {lastLogged.subtypeLabel}
                    </span>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3 justify-center w-full max-w-sm pt-2">
                    <Button 
                      variant="outline" 
                      onClick={resetForm} 
                      className="w-full sm:flex-1 h-10 select-none cursor-pointer"
                    >
                      Log Another
                    </Button>
                    <Link href="/dashboard" className="w-full sm:flex-1 select-none">
                      <Button className="w-full h-10 select-none cursor-pointer">
                        View Dashboard
                      </Button>
                    </Link>
                  </div>
                  {/* Third CTA — route user to AI insights */}
                  <Link
                    href="/insights"
                    className="inline-flex items-center gap-1.5 text-sm font-bold text-emerald-600 dark:text-emerald-400 hover:underline focus:outline-none focus:ring-2 focus:ring-emerald-500 rounded mt-1"
                  >
                    <Sparkles className="h-4 w-4" aria-hidden="true" />
                    Get insights on this →
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar Tips/Benchmarks (Colspan 1) */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-1.5 text-accent-900 dark:text-accent-400">
                <Compass className="h-4.5 w-4.5" />
                Footprint Benchmarks
              </CardTitle>
              <CardDescription>Average carbon weights to keep in mind:</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3.5 text-xs text-gray-600 dark:text-gray-400">
              <div className="flex justify-between border-b border-gray-100 dark:border-gray-800 pb-1.5">
                <span>🚗 10km Petrol Car Commute</span>
                <span className="font-bold text-gray-900 dark:text-white">1.7 kg CO₂e</span>
              </div>
              <div className="flex justify-between border-b border-gray-100 dark:border-gray-800 pb-1.5">
                <span>✈️ Short Flight (under 1500km)</span>
                <span className="font-bold text-gray-900 dark:text-white">~245 kg CO₂e / hr</span>
              </div>
              <div className="flex justify-between border-b border-gray-100 dark:border-gray-800 pb-1.5">
                <span>⚡ Average Home electricity (10 kWh)</span>
                <span className="font-bold text-gray-900 dark:text-white">3.7 kg CO₂e</span>
              </div>
              <div className="flex justify-between border-b border-gray-100 dark:border-gray-800 pb-1.5">
                <span>🥩 1 Beef steak meal (omnivore)</span>
                <span className="font-bold text-gray-900 dark:text-white">4.8 kg CO₂e</span>
              </div>
              <div className="flex justify-between border-b border-gray-100 dark:border-gray-800 pb-1.5">
                <span>🥗 1 Plant-based vegan meal</span>
                <span className="font-bold text-gray-900 dark:text-white">0.45 kg CO₂e</span>
              </div>
              <div className="flex justify-between pb-1">
                <span>🗑️ 10 kg Landfilled trash</span>
                <span className="font-bold text-gray-900 dark:text-white">6.1 kg CO₂e</span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-primary-50/50 dark:bg-primary-950/10 border-primary-100 dark:border-primary-900/30">
            <CardContent className="pt-6 space-y-3">
              <div className="flex gap-2">
                <Info className="h-5 w-5 text-primary-800 dark:text-primary-400 shrink-0" />
                <h4 className="text-sm font-bold text-primary-800 dark:text-primary-300">Need reduction tips?</h4>
              </div>
              <p className="text-xs leading-relaxed text-gray-650 dark:text-gray-400">
                Log some activities first, then visit our AI coach. The assistant parses your real-time log details to create tailored advice.
              </p>
              <Link 
                href="/insights" 
                className="text-xs font-bold text-primary-800 hover:text-primary-900 dark:text-primary-400 dark:hover:text-primary-200 flex items-center gap-1 mt-1"
              >
                Go to AI Coach
                <ArrowRight className="h-3 w-3" />
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
