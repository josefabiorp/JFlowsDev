// src/components/common/AppModal.jsx
import React from "react";
import { FaTimes } from "react-icons/fa";

export function AppModal({
  isOpen,
  onClose,
  title,
  children,
  size = "md", // "sm" | "md" | "lg" | "legacy"
}) {
  if (!isOpen) return null;

  // 🔥 Tamaños corporativos + tamaño legacy EXACTO como tu modal anterior
  const widthClasses = {
    sm: "max-w-md",
    md: "max-w-3xl",   // modal moderno intermedio
    lg: "max-w-5xl",   // modal grande
    legacy: "max-w-2xl", // 👈 EXACTO como tu modal original
  };

  // 🔥 Bordes y padding legacy para clones exactos
  const paddingClass = size === "legacy" ? "p-5" : "p-6";
  const roundedClass = size === "legacy" ? "rounded-xl" : "rounded-2xl";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Fondo oscuro */}
      <div
        className="absolute inset-0 bg-black/40"
        onClick={onClose}
      />

      {/* Contenido */}
      <div
        className={`
          relative bg-white shadow-2xl w-[95%] 
          ${widthClasses[size] || widthClasses.md}
          ${roundedClass}
          border border-slate-200
        `}
      >
        {/* HEADER */}
        <div className="flex justify-between items-center px-5 py-3 border-b">
          {title && (
            <h2 className="font-semibold text-lg text-slate-900">
              {title}
            </h2>
          )}
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-black transition"
            aria-label="Cerrar modal"
          >
            <FaTimes />
          </button>
        </div>

        {/* BODY */}
        <div className={`${paddingClass} max-h-[75vh] overflow-auto`}>
          {children}
        </div>
      </div>
    </div>
  );
}
