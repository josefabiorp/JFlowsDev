// src/components/ui/Button.jsx
import React from "react";

export function Button({
  variant = "primary",
  className = "",
  children,
  ...props
}) {
  const base =
    "inline-flex items-center justify-center rounded-lg font-medium px-4 py-2 focus:outline-none focus:ring-2 focus:ring-offset-1 disabled:opacity-60 disabled:cursor-not-allowed";

  const variants = {
    primary: "bg-sky-700 hover:bg-sky-800 text-white shadow",
    secondary: "bg-gray-700 hover:bg-gray-800 text-white shadow",
    success: "bg-emerald-600 hover:bg-emerald-700 text-white shadow",
    danger: "bg-red-600 hover:bg-red-700 text-white shadow",
    outline: "border border-gray-300 text-gray-700 bg-white hover:bg-gray-50",
  };

  const variantClasses = variants[variant] || variants.primary;

  return (
    <button
      className={`${base} ${variantClasses} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
