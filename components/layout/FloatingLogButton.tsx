"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Plus } from "lucide-react";

export function FloatingLogButton() {
  const pathname = usePathname();

  // Do not show on the tracker page itself
  if (pathname === "/tracker") return null;

  return (
    <Link
      href="/tracker"
      className="fixed bottom-6 right-6 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg transition-all hover:scale-110 active:scale-95 focus:outline-none focus:ring-2 focus:ring-green-600 focus:ring-offset-2 dark:bg-emerald-500 dark:hover:bg-emerald-400 select-none cursor-pointer"
      aria-label="Log new activity"
    >
      <Plus className="h-6 w-6 stroke-[2.5]" />
    </Link>
  );
}
