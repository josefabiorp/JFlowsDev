// src/components/activity/EstadoChip.jsx
import React from "react";

export function EstadoChip({ estado }) {
  const base =
    "inline-flex items-center gap-2 text-xs font-medium border px-2.5 py-1 rounded-full";

  if (estado === "presente") {
    return (
      <span className={`${base} bg-green-50 text-green-700 border-green-200`}>
        🟢 Presente
      </span>
    );
  }

  if (estado === "fuera") {
    return (
      <span className={`${base} bg-red-50 text-red-700 border-red-200`}>
        🔴 Fuera
      </span>
    );
  }

  return (
    <span className={`${base} bg-gray-50 text-gray-700 border-gray-200`}>
      ⚪ Sin entrada
    </span>
  );
}
