import { useState, useCallback, useMemo, useEffect } from "react";
import toast from "react-hot-toast";

export function usePermisos(API_URL, token, user) {
  const [permisos, setPermisos] = useState([]);
  const [loadingPermisos, setLoadingPermisos] = useState(false);
  const [meta, setMeta] = useState(null);
  const [pendientes, setPendientes] = useState(0);

  // =======================================
  //        VERIFICACIÓN DE ADMIN
  // =======================================
  const isAdmin = useMemo(() => {
    const r = (user?.role || user?.rol || "").toLowerCase();
    return r === "admin" || r === "administrador";
  }, [user]);

  // =======================================
  //       FETCH CONTADOR PENDIENTES
  // =======================================
  const fetchPendientes = useCallback(async () => {
    if (!token) return;

    try {
      const res = await fetch(`${API_URL}/permisos/pendientes-count`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const data = await res.json();
      setPendientes(data.count ?? 0);
    } catch (err) {
      console.error("Error obteniendo pendientes:", err);
      setPendientes(0);
    }
  }, [API_URL, token]);

  // Cargar pendientes automáticamente
  useEffect(() => {
    if (isAdmin && user?.id && token) {
      fetchPendientes();
    }
  }, [isAdmin, token, user?.id, fetchPendientes]);

  // =======================================
  //       FETCH PERMISOS (ADMIN/USER)
  // =======================================
  const fetchPermisos = useCallback(
    async (params = {}) => {
      if (!API_URL || !token || !user?.id) return;

      setLoadingPermisos(true);

      const query = new URLSearchParams();
      if (params.sucursal_id) query.append("sucursal_id", params.sucursal_id);
      if (params.estado) query.append("estado", params.estado);
      if (params.search) query.append("search", params.search);

      try {
        const res = await fetch(
          `${API_URL}/permisos${query.toString() ? "?" + query.toString() : ""}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              Accept: "application/json",
            },
          }
        );

        if (!res.ok) throw new Error(`HTTP ${res.status}`);

        const data = await res.json();

        if (Array.isArray(data.data)) {
          // paginado Laravel
          setPermisos(data.data);
          setMeta({
            current_page: data.current_page,
            last_page: data.last_page,
            total: data.total,
          });
        } else if (Array.isArray(data)) {
          // respuesta array simple
          setPermisos(data);
          setMeta(null);
        }
      } catch (err) {
        console.error("fetchPermisos error:", err);
        toast.error("No se pudieron cargar los permisos");
        setPermisos([]);
      } finally {
        setLoadingPermisos(false);
      }
    },
    [API_URL, token, user]
  );

  // =======================================
  //       CREAR PERMISO (EMPLEADO)
  // =======================================
  const crearPermiso = useCallback(
    async (payload) => {
      if (!token) return;

      try {
        const res = await fetch(`${API_URL}/permisos`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        });

        const data = await res.json();

        if (!res.ok) {
          toast.error(data.message || "No se pudo enviar la solicitud");
          return;
        }

        toast.success("Permiso solicitado");

        if (data.permiso) {
          setPermisos((prev) => [data.permiso, ...prev]);
        } else {
          fetchPermisos();
        }

        fetchPendientes();
      } catch (err) {
        console.error(err);
        toast.error("Error de conexión");
      }
    },
    [API_URL, token, fetchPermisos, fetchPendientes]
  );

  // =======================================
  //      ACTUALIZAR ESTADO (ADMIN)
  // =======================================
  const cambiarEstadoPermiso = useCallback(
    async (id, estado, respuesta_admin = "") => {
      try {
        const res = await fetch(`${API_URL}/permisos/${id}/estado`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ estado, respuesta_admin }),
        });

        const data = await res.json();

        if (!res.ok) {
          toast.error(data.message || "No se pudo actualizar el estado");
          return;
        }

        toast.success("Estado actualizado");

        if (data.permiso) {
          setPermisos((prev) =>
            prev.map((p) => (p.id === data.permiso.id ? data.permiso : p))
          );
        } else {
          fetchPermisos();
        }

        fetchPendientes();
      } catch (err) {
        console.error(err);
        toast.error("Error de conexión");
      }
    },
    [API_URL, token, fetchPermisos, fetchPendientes]
  );

  // =======================================
  //     CANCELAR PERMISO (EMPLEADO)
  // =======================================
  const cancelarPermiso = useCallback(
    async (id) => {
      try {
        const res = await fetch(`${API_URL}/permisos/${id}/cancelar`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await res.json();

        if (!res.ok) {
          toast.error(data.message || "No se pudo cancelar el permiso");
          return;
        }

        toast.success("Permiso cancelado");

        if (data.permiso) {
          setPermisos((prev) =>
            prev.map((p) => (p.id === data.permiso.id ? data.permiso : p))
          );
        } else {
          fetchPermisos();
        }

        fetchPendientes();
      } catch (err) {
        console.error(err);
        toast.error("Error de conexión");
      }
    },
    [API_URL, token, fetchPermisos, fetchPendientes]
  );

  // =======================================
  //              RETORNO
  // =======================================
  return {
    permisos,
    pendientes,
    loadingPermisos,
    meta,
    isAdmin,

    // Métodos públicos
    fetchPermisos,
    fetchPendientes,
    crearPermiso,
    cambiarEstadoPermiso,
    cancelarPermiso,

    // Estado manual
    setPermisos,
  };
}
