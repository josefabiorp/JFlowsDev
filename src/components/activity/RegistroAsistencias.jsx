// ===============================================================
//  REGISTRO DE ASISTENCIAS — CONTROLADOR GENERAL (CORPORATIVO)
//  Versión limpia: sin QR ni controles de descansos aquí
// ===============================================================

import React, {
  useState,
  useEffect,
  useMemo,
  useCallback,
} from "react";

import "../../index.css";
import { API_URL } from "../../config/api.js";

// Hooks de negocio
import { useUser } from "../hooks/UserContext.jsx";
import { useAccountManagement } from "../hooks/useAccountManagement.js";
import { useAsistencias } from "../hooks/useAsistencia.js";
import { usePoliticas } from "../hooks/usePoliticas.js";

// Componentes base
import { Header } from "../Header.jsx";
import { Footer } from "../Footer.jsx";
import { Sidebar } from "../Sidebar.jsx";

// Modales reales
import { DetalleEmpleadoModal } from "./asistencias/DetalleEmpleadoModal.jsx";
import { ReporteEmpleadoModal } from "./asistencias/ReporteEmpleadoModal.jsx";

// Utils (rango de fechas para reportes)
import {
  getWeekRange,
  getMonthRange,
  getYearRange,
} from "../utils/rangoFechasUtils";

// UIs específicas
import { AsistenciaEmpleado } from "./AsistenciaEmpleado.jsx";
import { AsistenciaAdmin } from "./AsistenciaAdmin.jsx";

import toast from "react-hot-toast";

// ===============================================================
//  COMPONENTE PRINCIPAL
// ===============================================================
export function RegistroAsistencias() {
  // CONTEXTO
  const { token, user } = useUser();
  const { logout } = useAccountManagement();

  // HOOKS DE NEGOCIO
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
    politicas,
    loadingPoliticas,
    fetchPoliticas,
  } = usePoliticas(API_URL, token, user);

  // ESTADOS GENERALES
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

  // ===============================================================
  //  ADMIN: ESTADOS DEL MODAL + RESUMEN CORPORATIVO
  // ===============================================================
  const [estadoEmpleados, setEstadoEmpleados] = useState({});
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);

  // estado del día actual
  const [modalLoading, setModalLoading] = useState(false);
  const [modalEstadoActual, setModalEstadoActual] = useState(null);
  const [modalAsistencia, setModalAsistencia] = useState(null);

  // rango + dia a dia
  const [historial, setHistorial] = useState([]);
  const [rangoFechas, setRangoFechas] = useState({ from: "", to: "" });

  // 🔵 RESUMEN corporativo completo
  const [detalleResumenRango, setDetalleResumenRango] = useState(null);

  // 🔵 turno del empleado (para admin)
  const [turnoEmpleadoModal, setTurnoEmpleadoModal] = useState(null);

  // ===============================================================
  //  EMPLEADO: reporte general
  // ===============================================================
  const [showReportModal, setShowReportModal] = useState(false);
  const [reporte, setReporte] = useState([]);
  const [reporteResumen, setReporteResumen] = useState(null);
  const [turnoReporte, setTurnoReporte] = useState(null);

  // BUSQUEDA ADMIN
  const [busqueda, setBusqueda] = useState("");

  // FILTRADOS
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

  // ===============================================================
  //  INICIALIZACIÓN
  // ===============================================================
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

  // AUTOREFRESH
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

  // ===============================================================
  //  ADMIN: cargar estado de todos
  // ===============================================================
  const cargarEstadosEmpleados = useCallback(async () => {
    if (!isAdmin || empleados.length === 0) return;

    const resultado = {};

    for (const emp of empleados) {
      try {
        const res = await fetch(`${API_URL}/asistencias/estado/${emp.id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const data = await res.json();
        resultado[emp.id] =
          data.estado || data.estado_actual || "sin_entrada";
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

  // ===============================================================
  //  ADMIN: estado actual del empleado (para el modal)
  // ===============================================================
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
      } catch {
        setModalEstadoActual("sin_entrada");
        setModalAsistencia(null);
      } finally {
        setModalLoading(false);
      }
    },
    [token]
  );

  // ===============================================================
  //  ADMIN: obtener rango COMPLETO + corporativo
  // ===============================================================
  const fetchAsistenciasRango = async (usuario_id, from, to) => {
    if (!from || !to) return toast.error("Seleccioná un rango válido");

    try {
      const res = await fetch(
        `${API_URL}/asistencias/rango?usuario_id=${usuario_id}&from=${from}&to=${to}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const data = await res.json();
      if (!res.ok) throw new Error();

      // 🔵 Arreglo corporativo por día
      setHistorial(data.dia_a_dia || []);

      // 🔵 Resumen del periodo
      setDetalleResumenRango(data.resumen || null);

      // 🔵 Turno asignado
      setTurnoEmpleadoModal(data.turno || null);
    } catch {
      toast.error("No se pudo cargar el historial");
    }
  };

  // ===============================================================
  //  ADMIN: abrir modal del empleado
  // ===============================================================
  const abrirDetalleEmpleado = async (emp) => {
    setSelectedEmployee(emp);

    setModalEstadoActual(null);
    setModalAsistencia(null);

    // Limpia historial previo
    setHistorial([]);

    // Rango por defecto: HOY
    const hoy = new Date().toISOString().slice(0, 10);
    setRangoFechas({ from: hoy, to: hoy });

    // reset corporativo
    setDetalleResumenRango(null);
    setTurnoEmpleadoModal(null);

    setShowDetailModal(true);

    // 1) Estado actual (entrada/salida)
    await fetchEstadoActualEmpleado(emp.id);

    // 2) Datos calculados del día (servicio AsistenciaCalculator vía /rango)
    await fetchAsistenciasRango(emp.id, hoy, hoy);
  };

  // ===============================================================
  //  Exportar / Imprimir / Refresh
  // ===============================================================
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

  const exportarCSV = () => {
    const headers = ["ID", "Nombre", "Email", "Rol", "Sucursal"];
    const rows = empleados.map((e) => [
      e.id,
      e.nombre,
      e.email,
      e.role || e.rol,
      sucursales.find((s) => s.id === e.sucursal_id)?.nombre || "—",
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
        <td>${sucursales.find((s) => s.id === e.sucursal_id)?.nombre || "—"}</td>
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

  // ===============================================================
  //  EMPLEADO: reporte personal
  // ===============================================================
  const cargarReporte = async (from, to) => {
    try {
      const res = await fetch(
        `${API_URL}/asistencias/rango?usuario_id=${user.id}&from=${from}&to=${to}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const data = await res.json();
      if (!res.ok) throw new Error();

      // Preferimos usar la estructura corporativa "dia_a_dia"
      setReporte(data.dia_a_dia || data.data || []);

      setTurnoReporte(data.turno || null);

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

  // ===============================================================
  //  RENDER PRINCIPAL
  // ===============================================================
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
            </div>
          </div>

          {/* ADMIN o EMPLEADO */}
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
              fetchEstadoActualEmpleado={fetchEstadoActualEmpleado}
              estadoEmpleados={estadoEmpleados}
            />
          ) : (
            <AsistenciaEmpleado
              user={user}
              token={token}
              estadoActual={estadoActual}
              resumenAsistencia={resumenAsistencia}
              politicas={politicas}
              sucursalEmpleado={sucursalEmpleado}
              marcarEntrada={marcarEntrada}
              marcarSalida={marcarSalida}
              getWeekRange={getWeekRange}
              getMonthRange={getMonthRange}
              getYearRange={getYearRange}
              cargarReporte={cargarReporte}
              setShowReportModal={setShowReportModal}
              turnoEmpleadoModal={turnoReporte}
            />
          )}
        </div>
      </div>

      {/* ===========================================================
          MODAL DETALLE EMPLEADO (ADMIN) – CORPORATIVO
      ============================================================ */}
      <DetalleEmpleadoModal
        isOpen={showDetailModal}
        onClose={() => setShowDetailModal(false)}
        selectedEmployee={selectedEmployee}
        sucursalEmpleadoModal={
          selectedEmployee
            ? sucursales.find((s) => s.id === selectedEmployee.sucursal_id)
            : null
        }
        modalLoading={modalLoading}
        modalEstadoActual={modalEstadoActual}
        modalAsistencia={modalAsistencia}
        rangoFechas={rangoFechas}
        setRangoFechas={setRangoFechas}
        fetchAsistenciasRango={fetchAsistenciasRango}
        historial={historial}               // dia a dia
        resumenRango={detalleResumenRango}  // resumen general
        turnoEmpleadoModal={turnoEmpleadoModal} // turno corporativo
      />

      {/* ===========================================================
          MODAL REPORTE EMPLEADO (USER)
      ============================================================ */}
      <ReporteEmpleadoModal
        isOpen={showReportModal}
        onClose={() => setShowReportModal(false)}
        user={user}
        reporte={reporte}
        reporteResumen={reporteResumen}
        getWeekRange={getWeekRange}
        getMonthRange={getMonthRange}
        getYearRange={getYearRange}
        cargarReporte={cargarReporte}
        turnoEmpleado={turnoReporte}
      />

      <Footer />
    </>
  );
}
