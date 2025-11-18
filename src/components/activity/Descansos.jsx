import React, { useEffect } from "react";
import { Header } from "../Header.jsx";
import { Footer } from "../Footer.jsx";
import { Sidebar } from "../Sidebar.jsx";

import { useUser } from "../hooks/UserContext.jsx";
import { useAccountManagement } from "../hooks/useAccountManagement.js";
import { useDescansos } from "../hooks/useDescansos.js";

const API_URL = "https://jflowsdev.duckdns.org/api";

export function Descansos() {
  const { token, user, isAdmin } = useUser();
  const { logout } = useAccountManagement();

  const {
    descansos,
    loadingDescansos,
    fetchDescansos,
    iniciarDescanso,
    finalizarDescanso,
  } = useDescansos(API_URL, token, user);

  /** Cargar descansos al entrar */
  useEffect(() => {
    if (token && user?.id) {
      fetchDescansos();
    }
  }, [token, user, fetchDescansos]);

  if (!user || !token) {
    return <div className="p-8 text-center">Iniciá sesión para continuar.</div>;
  }

  return (
    <>
      <Header />

      <div className="flex bg-gray-100 min-h-screen">

        {/* SIDEBAR */}
        <div className="w-1/4 lg:mr-10">
          <Sidebar logout={logout} />
        </div>

        {/* CONTENIDO */}
        <div className="flex-1 p-6 lg:p-10">
          <div className="max-w-6xl mx-auto bg-white rounded-2xl shadow-lg p-6 lg:p-8">

            {/* TITULO */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
              <div>
                <h1 className="text-2xl lg:text-3xl font-bold text-sky-900">
                  Registro de descansos
                </h1>
                <p className="text-gray-500 text-sm mt-1">
                  Control de tiempos de descanso: café, almuerzo, merienda, etc.
                </p>
              </div>
            </div>

            {/* BOTONES */}
            <div className="flex flex-wrap gap-3 mb-6">
              <button
                onClick={() => iniciarDescanso("café")}
                className="bg-amber-600 hover:bg-amber-700 text-white px-5 py-2 rounded-xl shadow"
              >
                ☕ Café
              </button>

              <button
                onClick={() => iniciarDescanso("almuerzo")}
                className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2 rounded-xl shadow"
              >
                🍽 Almuerzo
              </button>

              <button
                onClick={() => iniciarDescanso("merienda")}
                className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-xl shadow"
              >
                🍪 Merienda
              </button>

              <button
                onClick={() => iniciarDescanso("otro")}
                className="bg-slate-600 hover:bg-slate-700 text-white px-5 py-2 rounded-xl shadow"
              >
                🌙 Otro descanso
              </button>
            </div>

            {/* TABLA */}
            {loadingDescansos ? (
              <p className="text-center text-gray-500">Cargando descansos…</p>
            ) : descansos.length === 0 ? (
              <div className="text-center py-10 text-gray-500 text-sm">
                No hay descansos registrados.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full border border-gray-200 text-sm rounded-lg overflow-hidden">
                  <thead className="bg-gray-100 text-gray-700 uppercase text-xs">
                    <tr>
                      {isAdmin && <th className="px-3 py-2 border">Empleado</th>}
                      <th className="px-3 py-2 border">Tipo</th>
                      <th className="px-3 py-2 border">Inicio</th>
                      <th className="px-3 py-2 border">Fin</th>
                      <th className="px-3 py-2 border">Acción</th>
                    </tr>
                  </thead>

                  <tbody>
                    {descansos.map((d) => (
                      <tr key={d.id} className="hover:bg-gray-50">

                        {/* ADMIN VE NOMBRE */}
                        {isAdmin && (
                          <td className="px-3 py-2 border">
                            {d.usuario?.nombre}
                            <div className="text-xs text-gray-400">
                              {d.usuario?.email}
                            </div>
                          </td>
                        )}

                        <td className="px-3 py-2 border capitalize">{d.tipo}</td>
                        <td className="px-3 py-2 border">{d.hora_inicio}</td>

                        <td className="px-3 py-2 border">
                          {d.hora_fin ? (
                            d.hora_fin
                          ) : (
                            <span className="text-amber-600 font-semibold">
                              En curso…
                            </span>
                          )}
                        </td>

                        <td className="px-3 py-2 border">
                          {!d.hora_fin && (
                            <button
                              onClick={() => finalizarDescanso(d.id)}
                              className="px-3 py-1 text-xs rounded-full bg-rose-600 text-white hover:bg-rose-700"
                            >
                              Finalizar
                            </button>
                          )}
                        </td>

                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

          </div>
        </div>
      </div>

      <Footer />
    </>
  );
}
