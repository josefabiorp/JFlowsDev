import { useState, useCallback, useEffect, useMemo } from "react";
import toast from "react-hot-toast";

export function useDescansos(API_URL, token, user) {
  const [descansos, setDescansos] = useState([]);
  const [loadingDescansos, setLoadingDescansos] = useState(false);
  const [descansoActivo, setDescansoActivo] = useState(null);

  const isAdmin = useMemo(() => {
    const r = (user?.role || user?.rol || "").toLowerCase();
    return r === "admin" || r === "administrador";
  }, [user]);

  // --------------------------------------
  // FETCH LISTA DE DESCANSOS
  // --------------------------------------
  const fetchDescansos = useCallback(async () => {
    if (!API_URL || !token || !user?.id) return;

    setLoadingDescansos(true);

    try {
      const res = await fetch(`${API_URL}/descansos`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const data = await res.json();

      // La lista REAL está en data.data
      const lista = Array.isArray(data.data) ? data.data : [];

      setDescansos(lista);

      // detectar descanso activo
      const activo = lista.find((d) => d.hora_fin === null);
      setDescansoActivo(activo ?? null);

    } catch (err) {
      console.error("fetchDescansos error:", err);
      toast.error("No se pudieron cargar los descansos");
    } finally {
      setLoadingDescansos(false);
    }
  }, [API_URL, token, user]);

  // --------------------------------------
  // INICIAR DESCANSO
  // --------------------------------------
  const iniciarDescanso = useCallback(
    async (tipo) => {
      if (!API_URL || !token || !user?.id) return;

      if (descansoActivo) {
        toast("Ya hay un descanso activo", { icon: "⏳" });
        return;
      }

      try {
        const res = await fetch(`${API_URL}/descansos/iniciar`, {  // ruta correcta
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            tipo,
            hora_inicio: new Date().toTimeString().slice(0, 5),
          }),
        });

        const data = await res.json();

        if (!res.ok) {
          toast.error(data.message || "No se pudo iniciar el descanso");
          return;
        }

        toast.success("Descanso iniciado");

        const nuevo = data.descanso;
        setDescansoActivo(nuevo);
        setDescansos((prev) => [nuevo, ...prev]);

      } catch (err) {
        console.error("iniciarDescanso error:", err);
        toast.error("Error de conexión");
      }
    },
    [API_URL, token, user, descansoActivo]
  );

  // --------------------------------------
  // FINALIZAR DESCANSO
  // --------------------------------------
  const finalizarDescanso = useCallback(async () => {
    if (!API_URL || !token || !user?.id) return;

    if (!descansoActivo) {
      toast("No tenés un descanso en curso", { icon: "⚠️" });
      return;
    }

    try {
      const res = await fetch(
        `${API_URL}/descansos/${descansoActivo.id}/finalizar`, // ruta correcta
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            hora_fin: new Date().toTimeString().slice(0, 5),
          }),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.message || "No se pudo finalizar el descanso");
        return;
      }

      toast.success("Descanso finalizado");

      const actualizado = data.descanso;

      setDescansos((prev) =>
        prev.map((d) => (d.id === actualizado.id ? actualizado : d))
      );

      setDescansoActivo(null);

    } catch (err) {
      console.error("finalizarDescanso error:", err);
      toast.error("Error de conexión");
    }
  }, [API_URL, token, user, descansoActivo]);

  // --------------------------------------
  // CARGAR AL MONTAR
  // --------------------------------------
  useEffect(() => {
    if (token && user?.id) {
      fetchDescansos();
    }
  }, [token, user, fetchDescansos]);

  return {
    descansos,
    descansoActivo,
    loadingDescansos,
    fetchDescansos,
    iniciarDescanso,
    finalizarDescanso,
    isAdmin,
  };
}
