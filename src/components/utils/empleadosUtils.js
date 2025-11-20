// src/utils/empleadosUtils.js

/**
 * Devuelve el nombre de sucursal por ID, o "—"/"ID X" si no se encuentra
 */
export const getSucursalName = (sucursales, id) => {
  if (!id) return "—";
  const s = sucursales.find((s) => s.id === id);
  return s?.nombre || `ID ${id}`;
};
