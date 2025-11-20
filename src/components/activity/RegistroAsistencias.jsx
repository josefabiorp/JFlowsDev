// ==============================================
//  REGISTRO DE ASISTENCIAS — CONTROLADOR GENERAL
//  Esta versión NO modifica lógica, solo organiza
// ==============================================

import React, {
  useState,
  useEffect,
  useMemo,
  useCallback,
} from "react";

import "../../index.css";
import { API_URL } from "../../config/api.js";

// Hooks de negocio (sin cambiar nada)
import { useUser } from "../hooks/UserContext.jsx";
import { useAccountManagement } from "../hooks/useAccountManagement.js";
import { useAsistencias } from "../hooks/useAsistencia.js";
import { useDescansos } from "../hooks/useDescansos.js";
import { usePoliticas } from "../hooks/usePoliticas.js";

// Componentes base
import { Header } from "../Header.jsx";
import { Footer } from "../Footer.jsx";
import { Sidebar } from "../Sidebar.jsx";
import { AppModal } from "./AppModal.jsx";
import { DetalleEmpleadoModal } from "./asistencias/DetalleEmpleadoModal.jsx";

// Utils (NO cambia lógica)
import { formatTime } from "../utils/timeUtils";
import { buildStaticMapUrl } from "../utils/mapUtils";
import { getWeekRange, getMonthRange, getYearRange } from "../utils/rangoFechasUtils";

// Partes separadas (las dos UIs)
import { AsistenciaEmpleado } from "./AsistenciaEmpleado.jsx";
import { AsistenciaAdmin } from "./AsistenciaAdmin.jsx";

import toast from "react-hot-toast";

// ===============================================
// COMIENZO DEL COMPONENTE PRINCIPAL
// ===============================================
export function RegistroAsistencias() {
  // CONTEXTO
  const { token, user } = useUser();
  const { logout } = useAccountManagement();

  // HOOKS DE NEGOCIO (todo igual)
  const {
    empleados,
    estadoActual,
    resumenAsistencia,
    isAdmin,
    fetchEmpleados,
    fetchEstadoActual,
    marcarEntrada,
    marcarSalida,
  } = useAsistencias(API_URL, token, user);

  const {
    descansos,
    descansoActivo,
    loadingDescansos,
    iniciarDescanso,
    finalizarDescanso,
  } = useDescansos(API_URL, token, user);

  const {
    politicas,
    loadingPoliticas,
    fetchPoliticas,
  } = usePoliticas(API_URL, token, user);

  // ESTADOS MANTENIDOS IGUAL
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);

  const updateLastUpdated = () => setLastUpdated(new Date());

  // SUCURSALES
  const [sucursales, setSucursales] = useState([]);
  const [sucursalFiltro, setSucursalFiltro] = useState("");

  const fetchSucursales = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/sucursales`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error();
      const data = await res.json();

      setSucursales(
        Array.isArray(data)
          ? data.filter((s) => s.empresa_id === user.empresa_id)
          : []
      );
    } catch {
      toast.error("No se pudieron cargar las sucursales");
      setSucursales([]);
    }
  }, [token, user]);

  // ESTADOS ADMIN (historial, modales)
  const [estadoEmpleados, setEstadoEmpleados] = useState({});
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [historial, setHistorial] = useState([]);
  const [rangoFechas, setRangoFechas] = useState({ from: "", to: "" });
  const [modalLoading, setModalLoading] = useState(false);
  const [modalEstadoActual, setModalEstadoActual] = useState(null);
  const [modalAsistencia, setModalAsistencia] = useState(null);

  // MODAL EMPLEADO (reportes)
  const [showReportModal, setShowReportModal] = useState(false);
  const [reporte, setReporte] = useState([]);
  const [reporteResumen, setReporteResumen] = useState(null);

  // FILTRO BÚSQUEDA (admin)
  const [busqueda, setBusqueda] = useState("");

  // EMPLEADOS FILTRADOS (misma lógica)
  const empleadosFiltrados = useMemo(
    () =>
      empleados.filter((e) => {
        const matchesName = e.nombre
          ?.toLowerCase()
          .includes(busqueda.toLowerCase());

        const matchesSucursal =
          !sucursalFiltro ||
          String(e.sucursal_id) === String(sucursalFiltro);

        return matchesName && matchesSucursal;
      }),
    [empleados, busqueda, sucursalFiltro]
  );

  // Sucursal del empleado logueado
  const sucursalEmpleado = useMemo(() => {
    if (!user?.sucursal_id || !sucursales.length) return null;
    return sucursales.find((s) => s.id === user.sucursal_id) || null;
  }, [user, sucursales]);

  // INICIALIZACIÓN (NO se toca nada)
  useEffect(() => {
    if (!user?.id || !token) return;

    setLoading(true);
    const init = async () => {
      try {
        await Promise.all([
          fetchSucursales(),
          isAdmin ? fetchEmpleados() : Promise.resolve(),
          fetchEstadoActual(),
          fetchPoliticas(),
        ]);

        updateLastUpdated();
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };

    init();
  }, [
    user,
    token,
    isAdmin,
    fetchSucursales,
    fetchEmpleados,
    fetchEstadoActual,
    fetchPoliticas,
  ]);

  // AUTOREFRESH (igual)
  useEffect(() => {
    if (!user?.id || !token) return;

    const id = setInterval(async () => {
      try {
        if (isAdmin) await fetchEmpleados();
        await fetchEstadoActual();
        updateLastUpdated();
      } catch {}
    }, 30000);

    return () => clearInterval(id);
  }, [user, token, isAdmin, fetchEmpleados, fetchEstadoActual]);

  // ===============================
  //  ACCIONES ADMIN
  // ===============================
  const cargarEstadosEmpleados = useCallback(async () => {
    if (!isAdmin || empleados.length === 0) return;

    const resultado = {};

    for (const emp of empleados) {
      try {
        const res = await fetch(`${API_URL}/asistencias/estado/${emp.id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const data = await res.json();
        resultado[emp.id] = data.estado || data.estado_actual || "sin_entrada";
      } catch {
        resultado[emp.id] = "sin_entrada";
      }
    }

    setEstadoEmpleados(resultado);
  }, [isAdmin, empleados, token]);

  useEffect(() => {
    if (isAdmin && empleados.length > 0) {
      cargarEstadosEmpleados();
    }
  }, [isAdmin, empleados, cargarEstadosEmpleados]);

  const abrirDetalleEmpleado = async (emp) => {
    setSelectedEmployee(emp);
    setModalEstadoActual(null);
    setModalAsistencia(null);
    setHistorial([]);
    setRangoFechas({ from: "", to: "" });
    setShowDetailModal(true);

    await fetchEstadoActualEmpleado(emp.id);
  };

  const fetchEstadoActualEmpleado = useCallback(
    async (empId) => {
      if (!empId || !token) return;
      setModalLoading(true);
      try {
        const res = await fetch(`${API_URL}/asistencias/estado/${empId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error(`Error ${res.status}`);
        const data = await res.json();

        const est = data.estado || data.estado_actual || "sin_entrada";
        setModalEstadoActual(est);
        setModalAsistencia(data.asistencia || null);
      } catch (err) {
        console.warn("Modal estado error:", err);
        setModalEstadoActual("sin_entrada");
        setModalAsistencia(null);
      } finally {
        setModalLoading(false);
      }
    },
    [token]
  );

  const fetchAsistenciasRango = async (usuario_id, from, to) => {
    if (!from || !to) return toast.error("Seleccioná un rango válido");

    try {
      const res = await fetch(
        `${API_URL}/asistencias/rango?usuario_id=${usuario_id}&from=${from}&to=${to}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const data = await res.json();
      if (res.ok) setHistorial(data.data || []);
      else throw new Error();
    } catch {
      toast.error("No se pudo cargar el historial");
    }
  };

  const refreshManualmente = async () => {
    try {
      await Promise.all([
        fetchSucursales(),
        isAdmin ? fetchEmpleados() : Promise.resolve(),
        fetchEstadoActual(),
        fetchPoliticas(),
      ]);
      updateLastUpdated();
      toast.success("Datos actualizados");
    } catch {
      toast.error("Error al actualizar");
    }
  };

  // ========================================
  // EXPORTAR CSV
  // ========================================
  const exportarCSV = () => {
    const headers = ["ID", "Nombre", "Email", "Rol", "Sucursal"];
    const rows = empleados.map((e) => [
      e.id,
      e.nombre,
      e.email,
      e.role || e.rol,
      (sucursales.find((s) => s.id === e.sucursal_id)?.nombre || "—"),
    ]);

    const csv = [headers, ...rows].map((r) => r.join(",")).join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");

    a.href = url;
    a.download = `empleados_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // ========================================
  // IMPRIMIR
  // ========================================
  const imprimirTabla = () => {
    const w = window.open("", "_blank");
    if (!w) return;

    const rows = empleados
      .map(
        (e) => `
      <tr>
        <td>${e.id}</td>
        <td>${e.nombre}</td>
        <td>${e.email}</td>
        <td>${e.role || e.rol}</td>
        <td>${
          sucursales.find((s) => s.id === e.sucursal_id)?.nombre || "—"
        }</td>
      </tr>`
      )
      .join("");

    w.document.write(`
      <html><body>
        <h2>Empleados</h2>
        <table border="1" cellpadding="8">${rows}</table>
      </body></html>
    `);

    w.document.close();
    w.print();
  };

  // ========================================
  // CARGAR REPORTE EMPLEADO
  // ========================================
  const cargarReporte = async (from, to) => {
    try {
      const res = await fetch(
        `${API_URL}/asistencias/rango?usuario_id=${user.id}&from=${from}&to=${to}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const data = await res.json();
      if (!res.ok) throw new Error();

      setReporte(data.data || []);

      if (data.data?.length) {
        let totalMin = 0;
        data.data.forEach((a) => {
          if (a.hora_entrada && a.hora_salida) {
            const entrada = new Date(`1970-01-01T${a.hora_entrada}`);
            const salida = new Date(`1970-01-01T${a.hora_salida}`);
            totalMin += (salida - entrada) / 1000 / 60;
          }
        });

        setReporteResumen({
          totalHoras: `${Math.floor(totalMin / 60)}h ${totalMin % 60}min`,
          dias: data.data.length,
        });
      } else {
        setReporteResumen({ totalHoras: "0h", dias: 0 });
      }
    } catch {
      toast.error("No se pudo cargar el reporte");
    }
  };

  // ========================================
  // RENDER PRINCIPAL
  // ========================================
  if (!user || !token) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-600">
        Debés iniciar sesión para ver tus asistencias.
      </div>
    );
  }

  if (loading) {
    return (
      <div className="text-center mt-20 text-gray-600 font-semibold">
        Cargando...
      </div>
    );
  }

  return (
    <>
      <Header />

      <div className="flex bg-gray-100 min-h-screen">
        <div className="w-1/4 lg:mr-10">
          <Sidebar logout={logout} />
        </div>

        <div className="flex-1 p-6">
          {/* Título */}
          <h1 className="text-3xl font-bold text-center mb-4">
            {isAdmin ? "Panel de Asistencias" : "Registro de Asistencia"}
          </h1>

          {/* FECHA / POLITICAS */}
          <div className="flex flex-col sm:flex-row justify-between items-center mb-5 gap-3">
            <div className="flex flex-col text-xs text-gray-500">
              <span>
                Última actualización:{" "}
                <strong>
                  {lastUpdated ? lastUpdated.toLocaleTimeString() : "—"}
                </strong>
              </span>
              <span>
                Políticas:{" "}
                {loadingPoliticas
                  ? "cargando…"
                  : politicas
                  ? "aplicando políticas de la empresa"
                  : "usando valores por defecto"}
              </span>
              <span>
                Descansos:{" "}
                {loadingDescansos ? "cargando…" : "sincronizados"}
              </span>
            </div>
          </div>

          {/* Aquí decide ADMIN o EMPLEADO */}
          {isAdmin ? (
            <AsistenciaAdmin
              empleados={empleados}
              empleadosFiltrados={empleadosFiltrados}
              sucursales={sucursales}
              busqueda={busqueda}
              sucursalFiltro={sucursalFiltro}
              setBusqueda={setBusqueda}
              setSucursalFiltro={setSucursalFiltro}
              refreshManualmente={refreshManualmente}
              exportarCSV={exportarCSV}
              imprimirTabla={imprimirTabla}
              abrirDetalleEmpleado={abrirDetalleEmpleado}
              estadoEmpleados={estadoEmpleados}
            />
          ) : (
         <AsistenciaEmpleado
    user={user}
    token={token}
    estadoActual={estadoActual}
    resumenAsistencia={resumenAsistencia}
    politicas={politicas}
    descansos={descansos}
    descansoActivo={descansoActivo}
    sucursalEmpleado={sucursalEmpleado}
    marcarEntrada={marcarEntrada}
    marcarSalida={marcarSalida}
    iniciarDescanso={iniciarDescanso}
    finalizarDescanso={finalizarDescanso}
    getWeekRange={getWeekRange}
    getMonthRange={getMonthRange}
    getYearRange={getYearRange}
    cargarReporte={cargarReporte}
    setShowReportModal={setShowReportModal}
/>

          )}
        </div>
      </div>

      {/* MODALES ADMIN */}
      <AppModal
        isOpen={showDetailModal && selectedEmployee}
        onClose={() => setShowDetailModal(false)}
        title={`Asistencia de ${selectedEmployee?.nombre}`}
        size="md"
      >
        <div className="space-y-5">
          {modalLoading ? (
            <div className="text-gray-500 text-sm">Cargando…</div>
          ) : (
            <>
              <div className="text-sm">{modalEstadoActual}</div>
              <p className="mt-3 text-sm">
                Entrada:{" "}
                <strong>
                  {formatTime(modalAsistencia?.hora_entrada)}
                </strong>{" "}
                — Salida:{" "}
                <strong>
                  {formatTime(modalAsistencia?.hora_salida)}
                </strong>
              </p>
            </>
          )}

          {/* Mapa sucursal */}
          {selectedEmployee?.sucursal_id && (
            <div className="border border-gray-200 rounded-lg p-3">
              <h3 className="font-semibold text-sm mb-1">
                📍 Sucursal del empleado
              </h3>

              {sucursales
                .filter(
                  (s) => s.id === selectedEmployee.sucursal_id
                )
                .map((s) => (
                  <div key={s.id}>
                    <p className="text-sm text-gray-700">
                      <span className="font-semibold">Nombre:</span>{" "}
                      {s.nombre}
                    </p>
                    {s.latitud && s.longitud && (
                      <img
                        src={buildStaticMapUrl(s.latitud, s.longitud)}
                        alt="Mapa sucursal"
                        className="w-full rounded-lg border shadow-sm mt-2"
                      />
                    )}
                  </div>
                ))}
            </div>
          )}

          {/* HISTORIAL */}
          <div>
            <h3 className="font-semibold mb-2">Histórico</h3>

            <div className="flex flex-wrap gap-2 mb-3">
              <input
                type="date"
                className="border px-3 py-2 rounded-lg text-sm"
                value={rangoFechas.from}
                onChange={(e) =>
                  setRangoFechas((prev) => ({
                    ...prev,
                    from: e.target.value,
                  }))
                }
              />

              <input
                type="date"
                className="border px-3 py-2 rounded-lg text-sm"
                value={rangoFechas.to}
                onChange={(e) =>
                  setRangoFechas((prev) => ({
                    ...prev,
                    to: e.target.value,
                  }))
                }
              />

              <button
                onClick={() =>
                  fetchAsistenciasRango(
                    selectedEmployee.id,
                    rangoFechas.from,
                    rangoFechas.to
                  )
                }
                className="bg-sky-700 hover:bg-sky-800 text-white px-4 py-2 rounded-lg text-sm"
              >
                Consultar
              </button>
            </div>

            {historial.length > 0 ? (
              <table className="min-w-full text-sm border">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-3 py-1">Fecha</th>
                    <th className="px-3 py-1">Entrada</th>
                    <th className="px-3 py-1">Salida</th>
                  </tr>
                </thead>

                <tbody>
                  {historial.map((h) => (
                    <tr key={h.id}>
                      <td className="px-3 py-1">{h.fecha}</td>
                      <td className="px-3 py-1">
                        {formatTime(h.hora_entrada)}
                      </td>
                      <td className="px-3 py-1">
                        {formatTime(h.hora_salida)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p className="text-gray-500 text-sm">
                No hay registros en el rango.
              </p>
            )}
          </div>
        </div>
      </AppModal>
{/* MODAL REPORTE EMPLEADO */}
<DetalleEmpleadoModal
  isOpen={showReportModal}
  onClose={() => setShowReportModal(false)}
  selectedEmployee={user} // 👈 El empleado es el mismo user
  sucursalEmpleadoModal={sucursalEmpleado}
  modalLoading={false}
  modalEstadoActual={estadoActual}
  modalAsistencia={{
    hora_entrada: resumenAsistencia?.horaEntrada,
    hora_salida: resumenAsistencia?.horaSalida
  }}
  rangoFechas={rangoFechas}
  setRangoFechas={setRangoFechas}
  fetchAsistenciasRango={(id, from, to) => cargarReporte(from, to)}
  historial={reporte}
/>


      <Footer />
    </>
  );
}
