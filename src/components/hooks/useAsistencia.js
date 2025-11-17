// src/hooks/useAsistencias.js
import { useState, useMemo, useCallback } from "react";
import toast from "react-hot-toast";

/**
 * Hook centralizado para asistencias.
 * - No auto-fetch: solo ejecuta cuando TÚ lo llames (evita 500 y condiciones de carrera).
 * - Tiene guardas: si no hay token o user.id, NO pega al backend.
 * - Calcula y mantiene un "resumenAsistencia" persistente desde la entrada.
 */
export function useAsistencias(API_URL, token, user) {
  const [empleados, setEmpleados] = useState([]);
  const [estadoActual, setEstadoActual] = useState("sin_entrada");
  const [asistencia, setAsistencia] = useState(null);
  const [resumenAsistencia, setResumenAsistencia] = useState(null);

  const isAdmin = useMemo(() => {
    const r = (user?.role || user?.rol || "").toLowerCase();
    return r === "admin" || r === "administrador";
  }, [user]);

  // Utilidad local para construir el resumen persistente
  const buildResumen = useCallback((asis) => {
    if (!asis?.hora_entrada) return null;
    const res = {
      horaEntrada: asis.hora_entrada,
      horaSalida: null,
      total: null,
    };

    if (asis.hora_salida) {
      const entrada = new Date(`1970-01-01T${asis.hora_entrada}`);
      const salida = new Date(`1970-01-01T${asis.hora_salida}`);
      const diffMs = salida - entrada;
      const horas = Math.floor(diffMs / (1000 * 60 * 60));
      const minutos = Math.floor((diffMs / (1000 * 60)) % 60);
      res.horaSalida = asis.hora_salida;
      res.total = `${horas}h ${minutos}min`;
    }
    return res;
  }, []);

  // =========================
  // Fetchers con GUARDAS
  // =========================
  const fetchEmpleados = useCallback(async () => {
    if (!API_URL || !token || !user?.empresa_id) return;

    try {
      const res = await fetch(`${API_URL}/usuarios/all`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();

      // ================================
      // 🔥 LÓGICA CORPORATIVA CORRECTA
      // ================================
      // ADMIN → ve todos los empleados de la empresa
      // EMPLEADO → solo su sucursal
      const filtrados = Array.isArray(data)
        ? (
            isAdmin
              ? data.filter((e) => e.empresa_id === user.empresa_id)
              : data.filter(
                  (e) =>
                    e.empresa_id === user.empresa_id &&
                    e.sucursal_id === user.sucursal_id
                )
          )
        : [];

      setEmpleados(filtrados);
    } catch (err) {
      console.warn("fetchEmpleados error:", err);
      toast.error("No se pudieron cargar empleados");
      setEmpleados([]);
    }
  }, [API_URL, token, user, isAdmin]);

  const fetchEstadoActual = useCallback(
    async (usuarioIdOverride) => {
      if (!API_URL || !token || !user?.id) return;
      const targetId = usuarioIdOverride || user.id;

      try {
        const res = await fetch(`${API_URL}/asistencias/estado/${targetId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) {
          setEstadoActual("sin_entrada");
          setAsistencia(null);
          setResumenAsistencia(null);
          return;
        }

        const data = await res.json();
        const estado = data.estado || data.estado_actual || "sin_entrada";
        const asis = data.asistencia || null;

        setEstadoActual(estado);
        setAsistencia(asis);
        setResumenAsistencia(buildResumen(asis));
      } catch (err) {
        console.warn("fetchEstadoActual error:", err);
        setEstadoActual("sin_entrada");
        setAsistencia(null);
        setResumenAsistencia(null);
      }
    },
    [API_URL, token, user, buildResumen]
  );

  // =========================
  // Acciones
  // =========================
  const marcarEntrada = useCallback(
    async (usuario_id) => {
      if (!API_URL || !token || !user?.id || !usuario_id) return;

      try {
        const res = await fetch(`${API_URL}/asistencias/entrada`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            usuario_id,
            empresa_id: user.empresa_id,
            sucursal_id: user.sucursal_id || 1,
          }),
        });

        const data = await res.json();

        if (res.ok) {
          setEstadoActual("presente");
          const asis = data.asistencia || null;
          setAsistencia(asis);

          setResumenAsistencia(
            buildResumen(asis) || {
              horaEntrada: asis?.hora_entrada ?? null,
              horaSalida: null,
              total: null,
            }
          );

          toast.success("✅ Entrada registrada correctamente");
        } else {
          toast.error(data.message || "Error al registrar entrada");
        }
      } catch {
        toast.error("Error de conexión");
      } finally {
        fetchEstadoActual();
      }
    },
    [API_URL, token, user, buildResumen, fetchEstadoActual]
  );

  const marcarSalida = useCallback(
    async (usuario_id) => {
      if (!API_URL || !token || !user?.id || !usuario_id) return;

      try {
        const res = await fetch(`${API_URL}/asistencias/salida`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            usuario_id,
            empresa_id: user.empresa_id,
            sucursal_id: user.sucursal_id || 1,
          }),
        });

        const data = await res.json();

        if (res.ok) {
          setEstadoActual("fuera");
          const asis = data.asistencia || null;
          setAsistencia(asis);
          setResumenAsistencia(buildResumen(asis));
          toast.success("👋 Salida registrada correctamente");
        } else {
          toast.error(data.message || "Error al registrar salida");
        }
      } catch {
        toast.error("Error de conexión");
      } finally {
        fetchEstadoActual();
      }
    },
    [API_URL, token, user, buildResumen, fetchEstadoActual]
  );

  const marcarDescanso = useCallback(
    async (tipo) => {
      if (!API_URL || !token || !user?.id) return;

      try {
        const res = await fetch(`${API_URL}/descanso/inicio`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            usuario_id: user.id,
            tipo,
            empresa_id: user.empresa_id,
            sucursal_id: user.sucursal_id || 1,
          }),
        });

        const data = await res.json();

        if (res.ok) toast.success(`☕ Descanso (${tipo}) iniciado`);
        else toast.error(data.message || "Error al registrar descanso");
      } catch {
        toast.error("Error de conexión");
      }
    },
    [API_URL, token, user]
  );

  return {
    // estado
    empleados,
    estadoActual,
    asistencia,
    resumenAsistencia,
    isAdmin,

    // acciones
    fetchEmpleados,
    fetchEstadoActual,
    marcarEntrada,
    marcarSalida,
    marcarDescanso,

    // permitir que el componente lea/actualice
    setEmpleados,
  };
}
