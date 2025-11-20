import { useCallback, useEffect, useState } from "react";

export function useTurnos(API_URL, token, user) {
  const [turnos, setTurnos] = useState([]);
  const [loadingTurnos, setLoadingTurnos] = useState(false);
  const [savingTurno, setSavingTurno] = useState(false);
  const [deletingTurno, setDeletingTurno] = useState(false);

  const authHeader = token
    ? { Authorization: `Bearer ${token}` }
    : {};

  const fetchTurnos = useCallback(async () => {
    if (!API_URL || !token || !user?.id) return;

    setLoadingTurnos(true);
    try {
      const res = await fetch(`${API_URL}/turnos`, {
        headers: {
          "Content-Type": "application/json",
          ...authHeader,
        },
      });

      if (!res.ok) {
        throw new Error("Error al obtener turnos");
      }

      const data = await res.json();
      setTurnos(data || []);
    } catch (error) {
      console.error(error);
      // aquí puedes usar toast.error si lo tienes global
    } finally {
      setLoadingTurnos(false);
    }
  }, [API_URL, token, user?.id]);

  useEffect(() => {
    fetchTurnos();
  }, [fetchTurnos]);

  const crearTurno = useCallback(
    async (payload) => {
      if (!API_URL || !token || !user?.id) return;

      setSavingTurno(true);
      try {
        const res = await fetch(`${API_URL}/turnos`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...authHeader,
          },
          body: JSON.stringify(payload),
        });

        if (!res.ok) {
          throw new Error("Error al crear turno");
        }

        const nuevo = await res.json();
        setTurnos((prev) => [...prev, nuevo]);
        return nuevo;
      } catch (error) {
        console.error(error);
        throw error;
      } finally {
        setSavingTurno(false);
      }
    },
    [API_URL, token, user?.id]
  );

  const actualizarTurno = useCallback(
    async (id, payload) => {
      if (!API_URL || !token || !user?.id) return;

      setSavingTurno(true);
      try {
        const res = await fetch(`${API_URL}/turnos/${id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            ...authHeader,
          },
          body: JSON.stringify(payload),
        });

        if (!res.ok) {
          throw new Error("Error al actualizar turno");
        }

        const actualizado = await res.json();
        setTurnos((prev) =>
          prev.map((t) => (t.id === id ? actualizado : t))
        );
        return actualizado;
      } catch (error) {
        console.error(error);
        throw error;
      } finally {
        setSavingTurno(false);
      }
    },
    [API_URL, token, user?.id]
  );

  const eliminarTurno = useCallback(
    async (id) => {
      if (!API_URL || !token || !user?.id) return;

      setDeletingTurno(true);
      try {
        const res = await fetch(`${API_URL}/turnos/${id}`, {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            ...authHeader,
          },
        });

        if (!res.ok) {
          throw new Error("Error al eliminar turno");
        }

        setTurnos((prev) => prev.filter((t) => t.id !== id));
      } catch (error) {
        console.error(error);
        throw error;
      } finally {
        setDeletingTurno(false);
      }
    },
    [API_URL, token, user?.id]
  );

  return {
    turnos,
    loadingTurnos,
    savingTurno,
    deletingTurno,
    fetchTurnos,
    crearTurno,
    actualizarTurno,
    eliminarTurno,
    setTurnos,
  };
}
