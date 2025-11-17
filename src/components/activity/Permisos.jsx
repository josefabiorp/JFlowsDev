import React, { useEffect, useState } from "react";
import { Header } from "../Header.jsx";
import { Footer } from "../Footer.jsx";
import { Sidebar } from "../Sidebar.jsx";
import { useUser } from "../hooks/UserContext.jsx";
import { useAccountManagement } from "../hooks/useAccountManagement.js";
import { usePermisos } from "../hooks/usePermisos.js";
import { AppModal } from "./AppModal.jsx";

const API_URL = "https://jflowsdev.duckdns.org/";

export function Permisos() {
  const { token, user, isAdmin } = useUser();
  const { logout } = useAccountManagement();

  const {
    permisos,
    loadingPermisos,
    fetchPermisos,
    crearPermiso,
    cambiarEstadoPermiso,
    cancelarPermiso,
    fetchPendientes,
  } = usePermisos(API_URL, token, user);

  const [showFormModal, setShowFormModal] = useState(false);

  const [filtroEstado, setFiltroEstado] = useState("");
  const [filtroSearch, setFiltroSearch] = useState("");

  // ============================================
  //   CARGA INICIAL DE PERMISOS
  // ============================================
  useEffect(() => {
    if (!token || !user?.id) return;

    if (isAdmin) {
      fetchPermisos({
        estado: filtroEstado || undefined,
        search: filtroSearch || undefined,
      });
      fetchPendientes();
    } else {
      fetchPermisos();
    }
  }, [
    token,
    user,
    isAdmin,
    filtroEstado,
    filtroSearch,
    fetchPermisos,
    fetchPendientes,
  ]);

  if (!user || !token) {
    return <div className="p-8 text-center">Iniciá sesión para continuar.</div>;
  }

  return (
    <>
      <Header />

      <div className="flex bg-gray-100 min-h-screen">
        <div className="w-1/4 lg:mr-10">
          <Sidebar logout={logout} />
        </div>

        <div className="flex-1 p-6 lg:p-10">
          <div className="max-w-6xl mx-auto bg-white rounded-2xl shadow-lg p-6 lg:p-8">

            {/* ENCABEZADO */}
            <div className="flex flex-col sm:flex-row justify-between gap-4 mb-6">
              <div>
                <h1 className="text-2xl lg:text-3xl font-bold text-sky-900">
                  {isAdmin ? "Gestión de permisos" : "Mis permisos"}
                </h1>
                <p className="text-gray-500 text-sm mt-1">
                  Módulo corporativo para gestionar permisos laborales.
                </p>
              </div>

              {!isAdmin && (
                <button
                  onClick={() => setShowFormModal(true)}
                  className="self-start bg-sky-700 hover:bg-sky-800 text-white px-5 py-2.5 rounded-xl font-semibold text-sm shadow flex items-center gap-2"
                >
                  + Solicitar permiso
                </button>
              )}
            </div>

            {/* FILTROS ADMIN */}
            {isAdmin && (
              <div className="flex flex-col sm:flex-row gap-3 mb-5 items-center">
                <div className="w-full sm:w-56">
                  <label className="block text-xs font-semibold text-gray-600 mb-1">
                    Estado
                  </label>
                  <select
                    value={filtroEstado}
                    onChange={(e) => setFiltroEstado(e.target.value)}
                    className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-sky-500"
                  >
                    <option value="">Todos</option>
                    <option value="pendiente">Pendiente</option>
                    <option value="aprobado">Aprobado</option>
                    <option value="rechazado">Rechazado</option>
                    <option value="cancelado">Cancelado</option>
                  </select>
                </div>

                <div className="flex-1 w-full">
                  <label className="block text-xs font-semibold text-gray-600 mb-1">
                    Buscar empleado
                  </label>
                  <input
                    type="text"
                    value={filtroSearch}
                    onChange={(e) => setFiltroSearch(e.target.value)}
                    placeholder="Nombre o correo…"
                    className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-sky-500"
                  />
                </div>
              </div>
            )}

            {/* TABLA PRINCIPAL */}
            {loadingPermisos ? (
              <p className="text-center text-gray-500">Cargando permisos…</p>
            ) : permisos.length === 0 ? (
              <div className="text-center py-10 text-gray-500 text-sm">
                {isAdmin
                  ? "Aún no hay solicitudes de permisos."
                  : "Todavía no has solicitado ningún permiso."}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full border border-gray-200 text-sm rounded-lg overflow-hidden">
                  <thead className="bg-gray-100 text-gray-700 uppercase">
                    <tr>
                      {isAdmin && <th className="px-3 py-2 border">Empleado</th>}
                      <th className="px-3 py-2 border">Tipo</th>
                      <th className="px-3 py-2 border">Desde</th>
                      <th className="px-3 py-2 border">Hasta</th>
                      <th className="px-3 py-2 border">Estado</th>
                      <th className="px-3 py-2 border">Acciones</th>
                    </tr>
                  </thead>

                  <tbody>
                    {permisos.map((p) => (
                      <tr key={p.id} className="hover:bg-gray-50">

                        {isAdmin && (
                          <td className="px-3 py-2 border">
                            {p.usuario?.nombre}
                            <div className="text-xs text-gray-400">{p.usuario?.email}</div>
                          </td>
                        )}

                        <td className="px-3 py-2 border">{p.tipo}</td>
                        <td className="px-3 py-2 border">{p.fecha_inicio}</td>
                        <td className="px-3 py-2 border">{p.fecha_fin}</td>

                        <td className="px-3 py-2 border">
                          <EstadoBadge estado={p.estado} />
                        </td>

                        {/* ACCIONES EMPLEADO */}
                        {!isAdmin && (
                          <td className="px-3 py-2 border">
                            {p.estado === "pendiente" && (
                              <button
                                onClick={() => cancelarPermiso(p.id)}
                                className="px-3 py-1 text-xs rounded-full bg-red-100 text-red-700 hover:bg-red-200"
                              >
                                Cancelar
                              </button>
                            )}
                          </td>
                        )}

                        {/* ACCIONES ADMIN */}
                        {isAdmin && (
                          <td className="px-3 py-2 border">
                            <div className="flex flex-wrap gap-1">
                            <button
  disabled={["aprobado", "rechazado", "cancelado"].includes(p.estado)}
  onClick={() => cambiarEstadoPermiso(p.id, "aprobado")}
  className={`px-3 py-1 text-xs rounded-full
    ${["aprobado","rechazado","cancelado"].includes(p.estado)
      ? "bg-gray-200 text-gray-400 cursor-not-allowed"
      : "bg-emerald-100 text-emerald-700 hover:bg-emerald-200"}`}
>
  Aprobar
</button>


                              <button
                                onClick={() => cambiarEstadoPermiso(p.id, "rechazado")}
                                className="px-3 py-1 text-xs rounded-full bg-red-100 text-red-700 hover:bg-red-200"
                              >
                                Rechazar
                              </button>

                              <button
                                onClick={() => cambiarEstadoPermiso(p.id, "cancelado")}
                                className="px-3 py-1 text-xs rounded-full bg-gray-100 text-gray-700 hover:bg-gray-200"
                              >
                                Cancelar
                              </button>
                            </div>
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal */}
      <AppModal
        isOpen={showFormModal}
        onClose={() => setShowFormModal(false)}
        title="📄 Solicitar permiso"
        size="md"
      >
        <PermisoForm
          onSubmit={async (values) => {
            await crearPermiso(values);
            fetchPendientes();
            setShowFormModal(false);
          }}
        />
      </AppModal>

      <Footer />
    </>
  );
}

function EstadoBadge({ estado }) {
  const base =
    "inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold";

  switch (estado) {
    case "aprobado":
      return <span className={`${base} bg-emerald-50 text-emerald-700`}>✅ Aprobado</span>;
    case "rechazado":
      return <span className={`${base} bg-red-50 text-red-700`}>❌ Rechazado</span>;
    case "cancelado":
      return <span className={`${base} bg-gray-100 text-gray-600`}>⏹ Cancelado</span>;
    default:
      return <span className={`${base} bg-amber-50 text-amber-700`}>⏳ Pendiente</span>;
  }
}

function PermisoForm({ onSubmit }) {
  const [tipo, setTipo] = useState("Permiso personal");
  const [fechaInicio, setFechaInicio] = useState("");
  const [fechaFin, setFechaFin] = useState("");
  const [horaInicio, setHoraInicio] = useState("");
  const [horaFin, setHoraFin] = useState("");
  const [motivo, setMotivo] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      tipo,
      fecha_inicio: fechaInicio,
      fecha_fin: fechaFin || fechaInicio,
      hora_inicio: horaInicio || null,
      hora_fin: horaFin || null,
      motivo,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 text-sm">

      <div>
        <label className="block font-semibold text-gray-700 mb-1">
          Tipo de permiso
        </label>
        <select
          value={tipo}
          onChange={(e) => setTipo(e.target.value)}
          className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-sky-700"
        >
          <option>Permiso personal</option>
          <option>Vacaciones</option>
          <option>Cita médica</option>
          <option>Enfermedad</option>
          <option>Otro</option>
        </select>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="block font-semibold text-gray-700 mb-1">Desde</label>
          <input
            type="date"
            value={fechaInicio}
            onChange={(e) => setFechaInicio(e.target.value)}
            className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-sky-700"
            required
          />
        </div>

        <div>
          <label className="block font-semibold text-gray-700 mb-1">Hasta</label>
          <input
            type="date"
            value={fechaFin}
            onChange={(e) => setFechaFin(e.target.value)}
            className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-sky-700"
          />
          <p className="text-xs text-gray-400 mt-1">Si se deja vacío, se usa la misma fecha.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="block font-semibold text-gray-700 mb-1">Hora inicio (opcional)</label>
          <input
            type="time"
            value={horaInicio}
            onChange={(e) => setHoraInicio(e.target.value)}
            className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-sky-700"
          />
        </div>

        <div>
          <label className="block font-semibold text-gray-700 mb-1">Hora fin (opcional)</label>
          <input
            type="time"
            value={horaFin}
            onChange={(e) => setHoraFin(e.target.value)}
            className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-sky-700"
          />
        </div>
      </div>

      <div>
        <label className="block font-semibold text-gray-700 mb-1">Motivo (opcional)</label>
        <textarea
          value={motivo}
          onChange={(e) => setMotivo(e.target.value)}
          className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-sky-700 min-h-[80px]"
          placeholder="Ejemplo: permiso por cita médica, asuntos personales, etc."
        />
      </div>

      <div className="flex justify-end gap-3 pt-3">
        <button
          type="submit"
          className="bg-sky-700 hover:bg-sky-800 text-white px-5 py-2 rounded-xl font-semibold text-sm"
        >
          Enviar solicitud
        </button>
      </div>
    </form>
  );
}
