import { useCallback } from "react";

export function useAsignacionTurnos(API_URL, token, user) {
  const authHeader = token
    ? { Authorization: `Bearer ${token}` }
    : {};

  const asignarTurno = useCallback(
    async (usuarioId, turnoId) => {
      if (!API_URL || !token || !user?.id) return;

      const res = await fetch(`${API_URL}/usuarios/${usuarioId}/turno`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...authHeader,
        },
        body: JSON.stringify({ turno_id: turnoId }),
      });

      if (!res.ok) {
        const errorText = await res.text().catch(() => "");
        throw new Error(
          errorText || "Error al asignar turno al empleado"
        );
      }

      return res.json();
    },
    [API_URL, token, user?.id]
  );

  const obtenerTurnoEmpleado = useCallback(
    async (usuarioId) => {
      if (!API_URL || !token || !user?.id) return null;

      const res = await fetch(`${API_URL}/usuarios/${usuarioId}/turno`, {
        headers: {
          "Content-Type": "application/json",
          ...authHeader,
        },
      });

      if (!res.ok) {
        throw new Error("Error al obtener turno del empleado");
      }

      const data = await res.json();
      return data.turno || null;
    },
    [API_URL, token, user?.id]
  );

  return {
    asignarTurno,
    obtenerTurnoEmpleado,
  };
}
