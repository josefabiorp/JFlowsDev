import { API_URL } from "../../config/api";

// ================================
// LISTA DE CONTACTOS
// ================================
export async function getConversaciones(token) {
  const res = await fetch(`${API_URL}/chat/conversaciones`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) {
    console.error("❌ Error al cargar conversaciones", res);
    throw new Error("Error al cargar conversaciones");
  }

  return res.json();
}

// ================================
// MENSAJES ENTRE DOS USUARIOS
// ================================
export async function getMensajes(token, usuarioId) {
  const res = await fetch(
    `${API_URL}/chat/mensajes?usuario_id=${usuarioId}`,
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );

  if (!res.ok) {
    console.error("❌ Error al cargar mensajes", res);
    throw new Error("Error al cargar mensajes");
  }

  return res.json();
}

// ================================
// ENVIAR MENSAJE
// ================================
export async function enviarMensaje(token, data) {
  // Validación previa
  if (!data?.destinatario_id || !data?.contenido) {
    throw new Error("Datos incompletos para enviar mensaje");
  }

  const res = await fetch(`${API_URL}/chat/enviar`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      destinatario_id: data.destinatario_id,
      contenido: data.contenido, // ✔️ nombre correcto
    }),
  });

  if (!res.ok) {
    const errorText = await res.text();
    console.error("❌ Error enviando mensaje", errorText);
    throw new Error("Error al enviar mensaje");
  }

  return res.json();
}

// ================================
// MARCAR COMO LEÍDO
// ================================
export async function marcarLeido(token, id) {
  const res = await fetch(`${API_URL}/chat/leido/${id}`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) {
    console.error("❌ Error al marcar leído", res);
    throw new Error("Error al marcar leído");
  }

  return res.json();
}
