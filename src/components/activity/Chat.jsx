import React, { useState } from "react";

import { Header } from "../Header.jsx";
import { Footer } from "../Footer.jsx";
import { Sidebar } from "../Sidebar.jsx";

import ChatInbox from "../Chat/ChatInbox.jsx";
import ChatWindow from "../Chat/ChatWindow.jsx";

import { useUser } from "../hooks/UserContext.jsx";
import { useAccountManagement } from "../hooks/useAccountManagement.js";

export default function Chat() {
  const { user } = useUser();
  const { logout } = useAccountManagement();

  const [seleccionado, setSeleccionado] = useState(null);

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-600">
        Debés iniciar sesión para acceder al chat interno.
      </div>
    );
  }

  return (
    <>
      <Header />

      <div className="flex bg-gray-100 min-h-screen">
        {/* Sidebar */}
        <div className="w-1/4 lg:mr-10">
          <Sidebar logout={logout} />
        </div>

        {/* Contenido principal del chat */}
        <div className="flex-1 p-6 flex flex-col">
          <h1 className="text-3xl font-bold text-center mb-4">
            Comunicación interna
          </h1>

          <div className="flex-1 bg-white rounded-xl shadow overflow-hidden flex flex-col lg:flex-row">
            {/* Columna izquierda: Inbox (solo visible en desktop o si no hay seleccionado) */}
            <div
              className={`lg:w-1/3 h-full ${
                seleccionado ? "hidden lg:block" : "block"
              }`}
            >
              <ChatInbox onSelect={(u) => setSeleccionado(u)} />
            </div>

            {/* Columna derecha: ventana de chat */}
            <div className="lg:w-2/3 h-full border-l border-gray-200">
              <ChatWindow
                usuario={seleccionado}
                onBack={() => setSeleccionado(null)}
              />
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </>
  );
}
