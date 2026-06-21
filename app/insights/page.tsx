"use client";

import React from "react";
import dynamic from "next/dynamic";

function InsightsLoadingSkeleton() {
  return (
    <div className="space-y-6 animate-pulse" role="status" aria-label="Loading insights page">
      <div>
        <div className="h-8 bg-gray-200 dark:bg-gray-800 rounded w-1/3" />
        <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-1/2 mt-2" />
      </div>
      <div className="grid grid-cols-3 gap-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-20 bg-gray-250 dark:bg-gray-800 rounded-xl" />
        ))}
      </div>
      <div className="grid gap-5 lg:grid-cols-4">
        <div className="lg:col-span-3 h-[500px] bg-gray-250 dark:bg-gray-800 rounded-xl" />
        <div className="h-[250px] bg-gray-250 dark:bg-gray-800 rounded-xl" />
      </div>
    </div>
  );
}

const InsightsContent = dynamic(() => import("./InsightsContent"), {
  loading: () => <InsightsLoadingSkeleton />,
});

export default function InsightsPage() {
  return <InsightsContent />;
}
