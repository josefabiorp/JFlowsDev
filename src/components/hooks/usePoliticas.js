// src/components/hooks/usePoliticas.js
import { useState, useCallback } from "react";
import toast from "react-hot-toast";

export function usePoliticas(API_URL, token, user) {
  const [politicas, setPoliticas] = useState(null);
  const [loadingPoliticas, setLoadingPoliticas] = useState(false);
  const [savingPoliticas, setSavingPoliticas] = useState(false);

  // =============================================
  // Cargar políticas de la empresa del usuario
  // =============================================
  const fetchPoliticas = useCallback(async () => {
    if (!API_URL || !token || !user?.id) return;

    setLoadingPoliticas(true);

    try {
      const res = await fetch(`${API_URL}/politicas-empresa`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const data = await res.json();
      // El controlador show() devuelve directamente la política
      setPoliticas(data);
    } catch (err) {
      console.error("fetchPoliticas error:", err);
      toast.error("No se pudieron cargar las políticas");
    } finally {
      setLoadingPoliticas(false);
    }
  }, [API_URL, token, user]);

  // =============================================
  // Guardar políticas (PUT sobre la empresa)
  // =============================================
  const savePoliticas = useCallback(
    async (form) => {
      if (!API_URL || !token || !user?.id) return;

      setSavingPoliticas(true);

      try {
        const res = await fetch(`${API_URL}/politicas-empresa`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(form),
        });

        const data = await res.json();

        if (!res.ok) {
          toast.error(data.message || "No se pudieron guardar las políticas");
          return false;
        }

        toast.success("Políticas guardadas correctamente");

        // El update() devuelve: { message, politica: ... }
        if (data.politica) {
          setPoliticas(data.politica);
        }

        return true;
      } catch (err) {
        console.error("savePoliticas error:", err);
        toast.error("Error de conexión");
        return false;
      } finally {
        setSavingPoliticas(false);
      }
    },
    [API_URL, token, user]
  );

  return {
    politicas,
    loadingPoliticas,
    savingPoliticas,
    fetchPoliticas,
    savePoliticas,
    setPoliticas,
  };
}
