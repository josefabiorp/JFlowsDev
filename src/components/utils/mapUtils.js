// src/utils/mapUtils.js
const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

/**
 * Construye la URL del mapa estático de Google Maps
 */
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
