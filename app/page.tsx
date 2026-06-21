import React from "react";
import Link from "next/link";
import { ArrowRight, Activity, Sparkles, Target, Compass } from "lucide-react";
import { DailyTipCard } from "../components/ui/DailyTipCard";

export default function HomePage() {
  return (
    <div className="relative isolate overflow-hidden min-h-[75vh] flex flex-col justify-center py-6 sm:py-12">
      {/* Background ambient light effects */}
      <div
        className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80"
        aria-hidden="true"
      >
        <div
          className="relative left-[calc(50%-11rem)] aspect-1155/678 w-[36rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-primary-200 to-accent-400 opacity-20 dark:from-primary-900 dark:to-accent-900 dark:opacity-40 sm:left-[calc(50%-30rem)] sm:w-[72rem]"
          style={{
            clipPath:
              "polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)",
          }}
        />
      </div>

      <div className="mx-auto max-w-4xl text-center space-y-8 px-4">
        {/* Animated Badge */}
        <div className="inline-flex items-center gap-1.5 rounded-full bg-primary-100/80 px-3.5 py-1.5 text-xs font-semibold text-primary-800 dark:bg-primary-950/50 dark:text-primary-300 backdrop-blur-sm ring-1 ring-primary-900/10 dark:ring-primary-500/20 select-none animate-fade-in">
          <span className="flex h-2 w-2 rounded-full bg-primary-500" />
        </div>

        {/* Hero Headline */}
        <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 dark:text-white sm:text-6xl font-sans leading-tight">
          Navigate your path to{" "}
          <span className="bg-gradient-to-r from-primary-800 to-primary-500 bg-clip-text text-transparent dark:from-primary-200 dark:to-primary-400">
            lower emissions
          </span>
          .
        </h1>

        {/* Hero Description */}
        <p className="mx-auto max-w-2xl text-lg sm:text-xl leading-relaxed text-gray-600 dark:text-gray-300">
          CarbonCompass is an AI-powered sustainability coach that helps you understand, track, and reduce your carbon footprint through personalized recommendations and actionable insights.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
          <Link
            href="/tracker"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-lg bg-primary-800 px-6 py-3.5 text-base font-bold text-white hover:bg-primary-900 dark:bg-primary-500 dark:text-gray-950 dark:hover:bg-primary-200 transition-all shadow-md dark:shadow-primary-950/20"
          >
            Start Tracking
            <ArrowRight className="h-4.5 w-4.5" />
          </Link>
          <Link
            href="/dashboard"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white/50 backdrop-blur-sm px-6 py-3.5 text-base font-bold text-gray-700 hover:bg-gray-100 dark:border-gray-800 dark:bg-gray-900/50 dark:text-gray-200 dark:hover:bg-gray-800 transition-all shadow-sm"
          >
            View Dashboard
          </Link>
        </div>

        {/* Daily Carbon Insight preview/teaser */}
        <div className="max-w-md mx-auto pt-4">
          <DailyTipCard variant="small" />
        </div>
      </div>

      {/* Feature grid showcase */}
      <div className="mx-auto mt-20 max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <div className="rounded-xl border border-gray-200 bg-white/60 p-6 shadow-sm dark:border-gray-850 dark:bg-gray-900/60 backdrop-blur-sm">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 mb-4">
              <Activity className="h-5 w-5" />
            </div>
            <h3 className="text-base font-bold text-gray-900 dark:text-white">Smart Carbon Tracker</h3>
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              Easily log commutes, electricity usage, food selection, and waste to estimate footprint.
            </p>
          </div>

          <div className="rounded-xl border border-gray-200 bg-white/60 p-6 shadow-sm dark:border-gray-850 dark:bg-gray-900/60 backdrop-blur-sm">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 mb-4">
              <Sparkles className="h-5 w-5" />
            </div>
            <h3 className="text-base font-bold text-gray-900 dark:text-white">Gemini Coach Insights</h3>
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              Chat with our AI coach to review consumption trends and receive hyper-personalized reduction ideas.
            </p>
          </div>

          <div className="rounded-xl border border-gray-200 bg-white/60 p-6 shadow-sm dark:border-gray-850 dark:bg-gray-900/60 backdrop-blur-sm sm:col-span-2 lg:col-span-1">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 mb-4">
              <Target className="h-5 w-5" />
            </div>
            <h3 className="text-base font-bold text-gray-900 dark:text-white">Eco Achievement Goals</h3>
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              Unlock unique carbon reduction badges and challenge yourself to live carbon neutral.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
