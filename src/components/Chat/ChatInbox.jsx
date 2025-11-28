import { useEffect, useState } from "react";
import { getConversaciones } from "./chatApi";
import { useUser } from "../hooks/UserContext.jsx";

export default function ChatInbox({ onSelect }) {
  const { token } = useUser();
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) return;

    const cargarUsuarios = async () => {
      try {
        const data = await getConversaciones(token);

        // Asegurar que recibimos un arreglo
        if (Array.isArray(data)) {
          setUsuarios(data);
        } else {
          setUsuarios([]);
        }
      } catch (e) {
        console.error("Error cargando conversaciones", e);
        setUsuarios([]);
      } finally {
        setLoading(false);
      }
    };

    cargarUsuarios();
  }, [token]);

  // ===========================
  // ESTADOS DE CARGA Y VACÍO
  // ===========================

  if (loading) {
    return (
      <div className="p-4 text-gray-500 text-sm">
        Cargando lista de usuarios...
      </div>
    );
  }

  if (!usuarios.length) {
    return (
      <div className="p-4 text-gray-500 text-sm">
        No hay otros usuarios disponibles para chatear en tu empresa.
      </div>
    );
  }

  // ===========================
  // LISTADO DE CONTACTOS
  // ===========================

  return (
    <div className="p-4 h-full border-r border-gray-200 bg-white">
      <h2 className="text-xl font-bold mb-4 text-slate-800">
        Comunicación interna
      </h2>

      <ul className="space-y-2">
        {usuarios.map((u) => (
          <li
            key={u.id}
            onClick={() => onSelect(u)}
            className="p-3 bg-slate-50 rounded-lg shadow-sm cursor-pointer hover:bg-blue-50 hover:shadow transition flex flex-col"
          >
            <div className="flex justify-between items-center">
              <span className="font-semibold text-slate-800">{u.nombre}</span>

              {/* Rol pequeño, discreto */}
              <span className="text-[10px] uppercase text-gray-400">
                {u.role}
              </span>
            </div>

            <span className="text-gray-600 text-xs">{u.email}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
