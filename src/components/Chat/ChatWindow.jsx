import { useEffect, useState, useRef } from "react";
import { getMensajes, enviarMensaje } from "./chatApi";
import { useUser } from "../hooks/UserContext.jsx";

export default function ChatWindow({ usuario, onBack }) {
  const { token, user } = useUser();
  const [mensajes, setMensajes] = useState([]);
  const [texto, setTexto] = useState("");
  const [loading, setLoading] = useState(true);

  const bottomRef = useRef(null);

  // ===============================
  // Cargar mensajes
  // ===============================
  const cargar = async () => {
    if (!usuario || !token) return;

    try {
      const data = await getMensajes(token, usuario.id);
      setMensajes(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error("No se pudieron cargar los mensajes", e);
    } finally {
      setLoading(false);
    }
  };

  // ===============================
  // Recargar cuando cambia usuario
  // ===============================
  useEffect(() => {
    setLoading(true);
    setMensajes([]);
    cargar();

    const interval = setInterval(cargar, 3000);
    return () => clearInterval(interval);
  }, [usuario?.id, token]);

  // ===============================
  // Scroll al final
  // ===============================
  useEffect(() => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [mensajes]);

  // ===============================
  // Enviar mensaje
  // ===============================
  const enviar = async () => {
    if (!texto.trim() || !usuario) return;

    try {
      await enviarMensaje(token, {
        destinatario_id: usuario.id,
        contenido: texto.trim(), // ← ✔ CORRECTO
      });

      setTexto("");
      await cargar();
    } catch (e) {
      console.error("Error enviando mensaje", e);
    }
  };

  // ===============================
  // Vista sin usuario seleccionado
  // ===============================
  if (!usuario) {
    return (
      <div className="flex items-center justify-center h-full text-gray-500">
        Selecciona un usuario para conversar
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-slate-50">
      {/* HEADER */}
      <div className="flex items-center p-3 bg-white shadow-sm border-b">
        <button
          onClick={onBack}
          className="mr-3 text-sm text-gray-500 hover:text-gray-700 lg:hidden"
        >
          ⬅
        </button>
        <div>
          <h2 className="text-lg font-bold text-slate-800">
            {usuario.nombre}
          </h2>
          <p className="text-xs text-gray-500">{usuario.email}</p>
        </div>
      </div>

      {/* MENSAJES */}
      <div className="flex-1 overflow-auto p-4 space-y-3">
        {loading && (
          <p className="text-sm text-gray-500">Cargando conversación…</p>
        )}

        {!loading && mensajes.length === 0 && (
          <p className="text-sm text-gray-500">
            Aún no hay mensajes. ¡Escribe el primero!
          </p>
        )}

        {mensajes.map((m) => (
          <div
            key={m.id}
            className={`p-3 rounded-xl max-w-[70%] text-sm break-words ${
              m.remitente_id === user.id
                ? "bg-blue-600 text-white ml-auto"
                : "bg-white text-gray-900 shadow"
            }`}
          >
            {m.contenido /* ← ✔ CAMPO REAL */}
          </div>
        ))}

        <div ref={bottomRef} />
      </div>

      {/* INPUT */}
      <div className="p-3 bg-white border-t flex gap-2">
        <input
          value={texto}
          onChange={(e) => setTexto(e.target.value)}
          className="flex-1 border rounded-lg px-3 py-2 text-sm"
          placeholder="Escribe un mensaje..."
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              enviar();
            }
          }}
        />
        <button
          onClick={enviar}
          className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg px-4 text-sm font-semibold transition"
        >
          Enviar
        </button>
      </div>
    </div>
  );
}
