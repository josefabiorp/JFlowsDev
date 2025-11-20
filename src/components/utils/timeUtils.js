// src/utils/timeUtils.js

/**
 * Convierte "HH:MM" a minutos (número)
 */
export const timeStrToMinutes = (t) => {
  if (!t) return null;
  const [h, m] = t.split(":").map(Number);
  if (Number.isNaN(h) || Number.isNaN(m)) return null;
  return h * 60 + m;
};

/**
 * Convierte minutos a etiqueta "Xh Ymin"
 */
export const minutesToLabel = (min) => {
  if (min == null) return "0h 0min";
  const total = Math.max(0, Math.round(min));
  const h = Math.floor(total / 60);
  const m = total % 60;
  return `${h}h ${m}min`;
};

/**
 * Formatea una hora tipo "HH:MM:SS" a formato local "HH:MM"
 */
export const formatTime = (t) => {
  if (!t) return "—";
  try {
    const d = new Date(`1970-01-01T${t}`);
    return new Intl.DateTimeFormat([], {
      hour: "2-digit",
      minute: "2-digit",
    }).format(d);
  } catch {
    return t;
  }
};
