// src/components/activity/asistencias/helpers.js
export const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

// Construye imagen del mapa estático de Google
export const buildStaticMapUrl = (lat, lng, zoom = 16, size = "600x300") => {
  if (!lat || !lng || !GOOGLE_MAPS_API_KEY) return null;
  return (
    `https://maps.googleapis.com/maps/api/staticmap` +
    `?center=${lat},${lng}` +
    `&zoom=${zoom}` +
    `&size=${size}` +
    `&maptype=roadmap` +
    `&markers=color:red%7C${lat},${lng}` +
    `&key=${GOOGLE_MAPS_API_KEY}`
  );
};

export const getSucursalName = (sucursales, id) => {
  if (!id) return "—";
  const s = sucursales.find((s) => s.id === id);
  return s?.nombre || `ID ${id}`;
};

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

// Rangos de fechas para reportes
export const getWeekRange = () => {
  const now = new Date();
  const day = now.getDay();
  const monday = new Date(now);
  monday.setDate(now.getDate() - day + (day === 0 ? -6 : 1));
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);

  return {
    from: monday.toISOString().slice(0, 10),
    to: sunday.toISOString().slice(0, 10),
  };
};

export const getMonthRange = () => {
  const now = new Date();
  return {
    from: new Date(now.getFullYear(), now.getMonth(), 1)
      .toISOString()
      .slice(0, 10),
    to: new Date(now.getFullYear(), now.getMonth() + 1, 0)
      .toISOString()
      .slice(0, 10),
  };
};

export const getYearRange = () => {
  const now = new Date();
  return {
    from: `${now.getFullYear()}-01-01`,
    to: `${now.getFullYear()}-12-31`,
  };
};
