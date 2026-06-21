import React from "react";
import Link from "next/link";
import { Leaf } from "lucide-react";

export function DemoBanner({
  showBanner,
  demoLoaded,
  onLoadDemo,
}: {
  showBanner: boolean;
  demoLoaded: boolean;
  onLoadDemo: () => void;
}) {
  if (!showBanner) return null;

  if (demoLoaded) {
    return (
      <div className="rounded-xl border border-emerald-200 dark:border-emerald-800/50 bg-emerald-50 dark:bg-emerald-950/20 px-5 py-3 flex items-center gap-3 text-sm">
        <span className="text-lg">📊</span>
        <p className="text-emerald-800 dark:text-emerald-300 font-medium flex-1">
          Viewing demo data. Reset anytime from your{" "}
          <Link href="/profile" className="font-bold underline underline-offset-2 hover:no-underline">
            Profile page
          </Link>
          .
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border-2 border-dashed border-emerald-300 dark:border-emerald-700 bg-emerald-50/50 dark:bg-emerald-950/10 p-5">
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xl">👋</span>
            <h3 className="font-bold text-gray-900 dark:text-white text-sm">
              Welcome to CarbonCompass!
            </h3>
          </div>
          <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed">
            Click below to load a demo environment with{" "}
            <strong>14 days of realistic activity data</strong>, a simulated 5-day tracking streak,
            and pre-seeded goals — so you can experience the full platform instantly.
          </p>
        </div>
        <button
          onClick={onLoadDemo}
          id="load-demo-btn"
          className="shrink-0 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-bold px-5 py-2.5 text-sm transition-all shadow-md shadow-emerald-600/20 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 flex items-center gap-2"
        >
          <Leaf className="h-4 w-4" />
          Load Demo Data
        </button>
      </div>
    </div>
  );
}
