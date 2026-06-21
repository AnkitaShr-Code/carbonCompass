"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  Activity, 
  Sparkles, 
  Target, 
  Sun, 
  Moon, 
  User 
} from "lucide-react";

export function Navbar() {
  const pathname = usePathname();
  const [theme, setTheme] = useState<"light" | "dark">("dark"); // Default to dark theme for modern look

  // Sync theme with system settings or storage on mount
  useEffect(() => {
    let savedTheme: "light" | "dark" | null = null;
    try {
      savedTheme = localStorage.getItem("carboncompass_theme") as "light" | "dark" | null;
    } catch (e) {
      console.error(e);
    }
    const initialTheme = savedTheme || "dark";
    setTheme(initialTheme);
    
    if (initialTheme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === "light" ? "dark" : "light";
    setTheme(nextTheme);
    try {
      localStorage.setItem("carboncompass_theme", nextTheme);
    } catch (e) {
      console.error(e);
    }
    
    if (nextTheme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  };

  const navItems = [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: "Tracker", href: "/tracker", icon: Activity },
    { name: "Insights", href: "/insights", icon: Sparkles },
    { name: "Goals", href: "/goals", icon: Target },
  ];

  return (
    <>
      {/* Desktop Header & Mobile Top Bar */}
      <header className="sticky top-0 z-50 w-full border-b border-gray-200 bg-white/80 backdrop-blur-md dark:border-gray-800 dark:bg-gray-950/80">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          {/* Logo */}
          <Link 
            href="/" 
            className="flex items-center space-x-2 font-bold text-gray-900 dark:text-white select-none rounded focus:outline-none focus:ring-2 focus:ring-green-600 focus:ring-offset-2"
          >
            <span className="text-xl">🧭</span>
            <span className="text-lg tracking-tight font-extrabold sm:block">CarbonCompass</span>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex md:space-x-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  {...(item.name === "Insights" ? { "data-tour": "nav-insights" } : {})}
                  className={`flex items-center space-x-1.5 rounded-md px-3.5 py-2 text-sm font-semibold transition-all focus:outline-none focus:ring-2 focus:ring-green-600 focus:ring-offset-2 ${
                    isActive
                      ? "bg-primary-50 text-primary-800 dark:bg-primary-900/40 dark:text-primary-200"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-900 dark:hover:text-white"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>

          {/* Utility Buttons */}
          <div className="flex items-center space-x-2">
            <button
              onClick={toggleTheme}
              className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-900 dark:hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-green-600 focus:ring-offset-2"
              aria-label="Toggle Theme"
            >
              {theme === "light" ? (
                <Moon className="h-5 w-5" />
              ) : (
                <Sun className="h-5 w-5" />
              )}
            </button>

            <Link
              href="/profile"
              className={`rounded-lg p-2 transition-colors focus:outline-none focus:ring-2 focus:ring-green-600 focus:ring-offset-2 ${
                pathname === "/profile"
                  ? "bg-primary-50 text-primary-800 dark:bg-primary-900/40 dark:text-primary-200"
                  : "text-gray-500 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-900 dark:hover:text-white"
              }`}
              aria-label="Profile Settings"
            >
              <User className="h-5 w-5" />
            </Link>
          </div>
        </div>
      </header>

      {/* Mobile Bottom Tab Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-gray-200 bg-white/95 pb-safe dark:border-gray-800 dark:bg-gray-950/95 md:hidden">
        <div className="flex h-16 items-center justify-around px-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-col items-center justify-center w-full h-full py-1 text-xs font-medium transition-all focus:outline-none focus:ring-2 focus:ring-green-600 focus:ring-offset-2 ${
                  isActive
                    ? "text-primary-800 dark:text-primary-200 scale-105"
                    : "text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
                }`}
              >
                <Icon className={`h-5.5 w-5.5 mb-1 ${isActive ? "stroke-[2.5px]" : "stroke-[1.8px]"}`} />
                <span className="text-[10px] tracking-wide">{item.name}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}
