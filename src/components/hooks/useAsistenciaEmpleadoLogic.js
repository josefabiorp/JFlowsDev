// ===============================================================
//  useAsistenciaEmpleadoLogic.js
//  (Lógica del EMPLEADO — sin cambiar ni 1 línea de comportamiento)
// ===============================================================

import { useState, useMemo, useCallback } from "react";
import toast from "react-hot-toast";

/**
 * Este hook contiene TODA la lógica que en tu código estaba
 * en RegistroAsistencias.jsx y que corresponde SOLO al empleado.
 *
 * NO cambia NADA de lógica.
 * Mantiene exactamente los mismos cálculos, estados y funciones.
 */
export function useAsistenciaEmpleadoLogic({
  user,
  token,
  sucursales,
  API_URL,
}) {

  // ======================================================
  // SUCURSAL DEL EMPLEADO (idéntico al original)
  // ======================================================
  const sucursalEmpleado = useMemo(() => {
    if (!user?.sucursal_id || !sucursales?.length) return null;
    return sucursales.find((s) => s.id === user.sucursal_id) || null;
  }, [user, sucursales]);

  // ======================================================
  // ESTADOS DE REPORTES
  // ======================================================
  const [reporte, setReporte] = useState([]);
  const [reporteResumen, setReporteResumen] = useState(null);

  // ======================================================
  // CARGAR REPORTE — EXACTA MISMA LÓGICA
  // ======================================================
  const cargarReporte = useCallback(
    async (from, to) => {
      try {
        const res = await fetch(
          `${API_URL}/asistencias/rango?usuario_id=${user.id}&from=${from}&to=${to}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        const data = await res.json();
        if (!res.ok) throw new Error();

        setReporte(data.data || []);

        // MISMO CÓDIGO EXACTO
        if (data.data?.length) {
          let totalMin = 0;

          data.data.forEach((a) => {
            if (a.hora_entrada && a.hora_salida) {
              const entrada = new Date(`1970-01-01T${a.hora_entrada}`);
              const salida = new Date(`1970-01-01T${a.hora_salida}`);
              totalMin += (salida - entrada) / 1000 / 60;
            }
          });

          setReporteResumen({
            totalHoras: `${Math.floor(totalMin / 60)}h ${totalMin % 60}min`,
            dias: data.data.length,
          });
        } else {
          setReporteResumen({ totalHoras: "0h", dias: 0 });
        }
      } catch {
        toast.error("No se pudo cargar el reporte");
      }
    },
    [user, token, API_URL]
  );

  // ======================================================
  // EXPORTACIÓN PARA EL CONTROLADOR PRINCIPAL
  // ======================================================
  return {
    sucursalEmpleado,
    reporte,
    reporteResumen,
    cargarReporte,
    setReporte,
    setReporteResumen,
  };
}

