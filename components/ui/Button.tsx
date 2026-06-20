import React from "react";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className = "", variant = "primary", size = "md", children, ...props }, ref) => {
    const baseStyles = "inline-flex items-center justify-center font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 select-none cursor-pointer";
    
    const variants = {
      primary: "bg-primary-800 hover:bg-primary-900 text-white dark:bg-primary-500 dark:hover:bg-primary-200 dark:hover:text-primary-900 focus-visible:ring-primary-500",
      secondary: "bg-accent-600 hover:bg-accent-900 text-white dark:bg-accent-400 dark:hover:bg-accent-100 dark:hover:text-accent-900 focus-visible:ring-accent-400",
      outline: "border border-gray-300 bg-transparent text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-800 focus-visible:ring-primary-500",
      ghost: "text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-white focus-visible:ring-primary-500",
      danger: "bg-red-600 hover:bg-red-700 text-white focus-visible:ring-red-500",
    };

    const sizes = {
      sm: "h-9 px-3 text-xs rounded-sm",
      md: "h-10 px-4 py-2 text-sm rounded-md",
      lg: "h-11 px-6 text-base rounded-lg",
    };

    const combinedClassName = `${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`.trim();

    return (
      <button ref={ref} className={combinedClassName} {...props}>
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";
