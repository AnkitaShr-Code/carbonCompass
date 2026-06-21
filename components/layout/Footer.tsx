import React from "react";

export function Footer() {
  return (
    <footer className="w-full border-t border-gray-200 bg-white py-6 dark:border-gray-700 dark:bg-gray-950 text-center text-xs text-gray-500 dark:text-gray-300">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-2">
        <p className="font-semibold">🧭 CarbonCompass — Navigate your path to lower emissions.</p>
        <p className="mt-1 sm:mt-0 text-[11px]">Built with Next.js, Tailwind, & Gemini.</p>
      </div>
    </footer>
  );
}
