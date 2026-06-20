import React from "react";

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "primary" | "secondary" | "outline" | "success" | "danger" | "warning";
}

export function Badge({ className = "", variant = "primary", ...props }: BadgeProps) {
  const baseStyles = "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors select-none";
  
  const variants = {
    primary: "bg-primary-100 text-primary-800 dark:bg-primary-900/55 dark:text-primary-200",
    secondary: "bg-accent-100 text-accent-900 dark:bg-accent-900/55 dark:text-accent-200",
    outline: "text-gray-700 border border-gray-300 dark:text-gray-300 dark:border-gray-700",
    success: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-200",
    danger: "bg-red-100 text-red-800 dark:bg-red-950/40 dark:text-red-200",
    warning: "bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-200",
  };

  return (
    <div
      className={`${baseStyles} ${variants[variant]} ${className}`}
      {...props}
    />
  );
}
