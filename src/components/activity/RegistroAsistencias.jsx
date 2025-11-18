// ==============================================
//  REGISTRO DE ASISTENCIAS — VERSION CORPORATIVA
//  - Integra políticas laborales de la empresa
//  - Integra descansos corporativos
//  - Cálculos avanzados en el FRONT (modelo mixto)
// ==============================================

import React, {
  useState,
  useEffect,
  useMemo,
  useCallback,
} from "react";

import { useUser } from "../hooks/UserContext.jsx";
import { useAccountManagement } from "../hooks/useAccountManagement.js";
import { useAsistencias } from "../hooks/useAsistencia.js";
import { useDescansos } from "../hooks/useDescansos.js";
import { usePoliticas } from "../hooks/usePoliticas.js";

import { Header } from "../Header.jsx";
import { Footer } from "../Footer.jsx";
import { Sidebar } from "../Sidebar.jsx";
import { AppModal } from "./AppModal.jsx";

import {
  FaSignInAlt,
  FaSignOutAlt,
  FaCoffee,
  FaSearch,
  FaQrcode,
  FaSyncAlt,
  FaDownload,
  FaPrint,
} from "react-icons/fa";

import QrScanner from "react-qr-scanner";
import toast from "react-hot-toast";
import "../../index.css";

const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
const API_URL = "https://jflowsdev.duckdns.org/api";

// -----------------------------------------------------
// Helpers generales
// -----------------------------------------------------
const buildStaticMapUrl = (lat, lng, zoom = 16, size = "600x300") => {
  if (!lat || !lng || !GOOGLE_MAPS_API_KEY) return null;
  return (
    `https://maps.googleapis.com/maps/api/staticmap` +
    `?center=${lat},${lng}` +
    `&zoom=${zoom}` +
    `&size=${size}` +
    `&maptype=roadmap` +
    `&markers=color:red%7C${lat},${lng}` +
    `&key=${GOOGLE_MAPS_API_KEY}`
  );
};

const getSucursalName = (sucursales, id) => {
  if (!id) return "—";
  const s = sucursales.find((s) => s.id === id);
  return s?.nombre || `ID ${id}`;
};

const timeStrToMinutes = (t) => {
  if (!t) return null;
  const [h, m] = t.split(":").map(Number);
  if (Number.isNaN(h) || Number.isNaN(m)) return null;
  return h * 60 + m;
};

const minutesToLabel = (min) => {
  if (min == null) return "0h 0min";
  const total = Math.max(0, Math.round(min));
  const h = Math.floor(total / 60);
  const m = total % 60;
  return `${h}h ${m}min`;
};

const applyRedondeo = (minutos, modo, paso = 5) => {
  if (!modo || modo === "normal") return minutos;
  if (modo === "arriba") return Math.ceil(minutos / paso) * paso;
  if (modo === "abajo") return Math.floor(minutos / paso) * paso;
  return minutos;
};

// Calcula métricas avanzadas de la jornada según políticas + descansos
const buildResumenAvanzado = ({
  resumenAsistencia,
  politicas,
  descansos,
  user,
}) => {
  if (!resumenAsistencia || !politicas) return null;
  if (!resumenAsistencia.horaEntrada || !resumenAsistencia.horaSalida) {
    // Jornada en curso: solo mostramos info de política
    return {
      totalMin: null,
      totalMinAjustado: null,
      jornadaMin: politicas.jornada_diaria_horas * 60,
      horasExtraMin: 0,
      minutosDescansoTomados: null,
      excesoDescansoMin: 0,
      tieneExtras: false,
    };
  }

  const entradaMin = timeStrToMinutes(resumenAsistencia.horaEntrada);
  const salidaMin = timeStrToMinutes(resumenAsistencia.horaSalida);
  if (entradaMin == null || salidaMin == null) return null;

  const totalMin = Math.max(0, salidaMin - entradaMin);

  const jornadaMin = (politicas.jornada_diaria_horas || 8) * 60;
  const maxHorasExtraPorDia = politicas.max_horas_extra_por_dia || 0;
  const modoRedondeo = politicas.politica_redondeo_tiempos || "normal";

  // Descansos de HOY del usuario logueado (si la API trae fecha)
  const hoyStr = new Date().toISOString().slice(0, 10);
  const descansosHoy = Array.isArray(descansos)
    ? descansos.filter(
        (d) =>
          Number(d.usuario_id) === Number(user.id) &&
          (d.fecha === hoyStr || !d.fecha) // por si no tenés fecha en la tabla
      )
    : [];

  let minutosDescansoTomados = 0;
  descansosHoy.forEach((d) => {
    const ini = timeStrToMinutes(d.hora_inicio);
    const fin = timeStrToMinutes(d.hora_fin);
    if (ini != null && fin != null && fin > ini) {
      minutosDescansoTomados += fin - ini;
    }
  });

  const minutosDescansoPermitidos =
    (politicas.minutos_descanso || 0) *
    (politicas.cantidad_descansos_permitidos || 0);

  const excesoDescansoMin = Math.max(
    0,
    minutosDescansoTomados - minutosDescansoPermitidos
  );

  // Horas extra simples: diferencia entre total y jornada
  let horasExtraMin = 0;
  if (totalMin > jornadaMin) {
    horasExtraMin = totalMin - jornadaMin;
    const maxExtraMin = maxHorasExtraPorDia * 60;
    if (maxExtraMin > 0) {
      horasExtraMin = Math.min(horasExtraMin, maxExtraMin);
    }
  }

  const totalMinAjustado = applyRedondeo(totalMin, modoRedondeo);

  return {
    totalMin,
    totalMinAjustado,
    jornadaMin,
    horasExtraMin,
    minutosDescansoTomados,
    excesoDescansoMin,
    tieneExtras: horasExtraMin > 0,
  };
};

export function RegistroAsistencias() {
  // =========================
  //  CONTEXTO
  // =========================
  const { token, user } = useUser();
  const { logout } = useAccountManagement();

  // =========================
  //  HOOKS DE NEGOCIO
  // =========================
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

  // =========================
  // ESTADOS LOCALES
  // =========================
  const [activeTab, setActiveTab] = useState("asistencia");
  const [busqueda, setBusqueda] = useState("");
  const [showQrScanner, setShowQrScanner] = useState(false);

  const [busyEntrada, setBusyEntrada] = useState(false);
  const [busySalida, setBusySalida] = useState(false);
  const [busyDescanso, setBusyDescanso] = useState(false);

  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);

  const [sucursales, setSucursales] = useState([]);
  const [sucursalFiltro, setSucursalFiltro] = useState("");

  // Modal ADMIN (detalle empleado)
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [historial, setHistorial] = useState([]);
  const [rangoFechas, setRangoFechas] = useState({ from: "", to: "" });
  const [modalLoading, setModalLoading] = useState(false);
  const [modalEstadoActual, setModalEstadoActual] = useState(null);
  const [modalAsistencia, setModalAsistencia] = useState(null);

  // Modal EMPLEADO (reporte propio)
  const [showReportModal, setShowReportModal] = useState(false);

  // Reportes empleado
  const [reporte, setReporte] = useState([]);
  const [reporteResumen, setReporteResumen] = useState(null);

  // =========================
  // UTILIDADES
  // =========================
  const updateLastUpdated = () => setLastUpdated(new Date());

  const formatTime = (t) => {
    if (!t) return "—";
    try {
      const d = new Date(`1970-01-01T${t}`);
      return new Intl.DateTimeFormat([], {
        hour: "2-digit",
        minute: "2-digit",
      }).format(d);
    } catch {
      return t;
    }
  };

  const estadoChip = (estado) => {
    const base =
      "inline-flex items-center gap-2 text-xs font-medium border px-2.5 py-1 rounded-full";

    switch (estado) {
      case "presente":
        return (
          <span
            className={`${base} bg-green-50 text-green-700 border-green-200`}
          >
            🟢 Presente
          </span>
        );

      case "fuera":
        return (
          <span
            className={`${base} bg-red-50 text-red-700 border-red-200`}
          >
            🔴 Fuera
          </span>
        );

      default:
        return (
          <span
            className={`${base} bg-gray-50 text-gray-700 border-gray-200`}
          >
            ⚪ Sin entrada
          </span>
        );
    }
  };

  // Fetch sucursales
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

  // Sucursal del empleado logueado
  const sucursalEmpleado = useMemo(() => {
    if (!user?.sucursal_id || !sucursales.length) return null;
    return sucursales.find((s) => s.id === user.sucursal_id) || null;
  }, [user, sucursales]);


// Estados individuales de cada empleado (ADMIN)
const [estadoEmpleados, setEstadoEmpleados] = useState({});

  
  // Sucursal del empleado del modal (admin)
  const sucursalEmpleadoModal = useMemo(() => {
    if (!selectedEmployee?.sucursal_id || !sucursales.length) return null;
    return (
      sucursales.find((s) => s.id === selectedEmployee.sucursal_id) || null
    );
  }, [selectedEmployee, sucursales]);

  // Resumen avanzado según políticas + descansos
  const resumenAvanzado = useMemo(
    () =>
      buildResumenAvanzado({
        resumenAsistencia,
        politicas,
        descansos,
        user,
      }),
    [resumenAsistencia, politicas, descansos, user]
  );

  // =========================================
  // INIT
  // =========================================
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
      } catch {
        // silencio
      }
    }, 30000);

    return () => clearInterval(id);
  }, [user, token, isAdmin, fetchEmpleados, fetchEstadoActual]);

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







  

  // =========================================
  // QR
  // =========================================
  const handleScan = (data) => {
    if (!data) return;
    const scanned = data.text;
    const id = isNaN(Number(scanned)) ? user.id : Number(scanned);

    setBusyEntrada(true);
    marcarEntrada(id).finally(() => setBusyEntrada(false));
    setShowQrScanner(false);
  };

  const handleError = (err) => console.error("QR error:", err);

  // =========================================
  // EXPORTAR CSV
  // =========================================
  const exportarCSV = () => {
    const headers = ["ID", "Nombre", "Email", "Rol", "Sucursal"];
    const rows = empleados.map((e) => [
      e.id,
      e.nombre,
      e.email,
      e.role || e.rol,
      getSucursalName(sucursales, e.sucursal_id),
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

  // =========================================
  // IMPRIMIR
  // =========================================
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
        <td>${getSucursalName(sucursales, e.sucursal_id)}</td>
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

  // =========================================
  // REPORTES (SEMANA / MES / AÑO)
  // =========================================
  const getWeekRange = () => {
    const now = new Date();
    const day = now.getDay();
    const monday = new Date(now);
    monday.setDate(now.getDate() - day + (day === 0 ? -6 : 1));
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);

    return {
      from: monday.toISOString().slice(0, 10),
      to: sunday.toISOString().slice(0, 10),
    };
  };

  const getMonthRange = () => {
    const now = new Date();
    return {
      from: new Date(now.getFullYear(), now.getMonth(), 1)
        .toISOString()
        .slice(0, 10),
      to: new Date(now.getFullYear(), now.getMonth() + 1, 0)
        .toISOString()
        .slice(0, 10),
    };
  };

  const getYearRange = () => {
    const now = new Date();
    return {
      from: `${now.getFullYear()}-01-01`,
      to: `${now.getFullYear()}-12-31`,
    };
  };

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

        const totalMinAjustado = politicas
          ? applyRedondeo(
              totalMin,
              politicas.politica_redondeo_tiempos || "normal"
            )
          : totalMin;

        setReporteResumen({
          totalHoras: minutesToLabel(totalMinAjustado),
          dias: data.data.length,
        });
      } else {
        setReporteResumen({ totalHoras: "0h 0min", dias: 0 });
      }
    } catch {
      toast.error("No se pudo cargar el reporte");
    }
  };

  // =========================================
  // FUNCIONES MODAL ADMIN
  // =========================================
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
// Cargar estado de TODOS los empleados (ADMIN)
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


  // Cuando cambian empleados → cargar estado de cada uno
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

  const closeModal = useCallback(() => {
    setShowDetailModal(false);
    setSelectedEmployee(null);
    setModalEstadoActual(null);
    setModalAsistencia(null);
    setHistorial([]);
    setRangoFechas({ from: "", to: "" });
  }, []);

  const closeReportModal = () => {
    setShowReportModal(false);
  };

  // =========================================
  // EMPLEADOS FILTRADOS (ADMIN)
  // =========================================
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

  // =========================================
  // RENDER PRINCIPAL
  // =========================================
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
          <h1 className="text-3xl font-bold text-center mb-4">
            {isAdmin ? "Panel de Asistencias" : "Registro de Asistencia"}
          </h1>

          {/* TOOLBAR */}
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

            <div className="flex gap-2">
              <button
                onClick={refreshManualmente}
                className="bg-sky-700 hover:bg-sky-800 text-white px-4 py-2 rounded-lg flex items-center gap-2 shadow"
              >
                <FaSyncAlt /> Actualizar
              </button>

              {isAdmin && (
                <>
                  <button
                    onClick={exportarCSV}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
                  >
                    <FaDownload /> CSV
                  </button>

                    <button
                      onClick={imprimirTabla}
                      className="bg-gray-700 hover:bg-gray-800 text-white px-4 py-2 rounded-lg flex items-center gap-2"
                    >
                      <FaPrint /> Imprimir
                    </button>
                </>
              )}
            </div>
          </div>

          {/* ========================================= */}
          {/*     EMPLEADO - REGISTRO                   */}
          {/* ========================================= */}
          {!isAdmin && (
            <>
              {/* CONTENEDOR PRINCIPAL */}
              <div className="bg-white p-6 rounded-xl shadow mb-6 text-center">
                <div className="mb-3">{estadoChip(estadoActual)}</div>
                {/* QR */}
                <div className="mt-5 flex justify-center">
                  <button
                    onClick={() => setShowQrScanner(!showQrScanner)}
                    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg shadow"
                  >
                    <FaQrcode />{" "}
                    {showQrScanner ? "Cerrar QR" : "Marcar con QR"}
                  </button>
                </div>

                {showQrScanner && (
                  <div className="mt-5 border rounded-xl p-5 bg-gray-50 shadow-inner flex flex-col justify-center items-center gap-2">
                    <QrScanner
                      delay={300}
                      style={{ height: 240, width: 320 }}
                      onError={handleError}
                      onScan={handleScan}
                    />
                  </div>
                )}

                {/* BOTONES ENTRADA / SALIDA */}
                <div className="flex justify-center pt-6 gap-4 flex-wrap mb-4">




                  
                  <button
                    onClick={async () => {
                      setBusyEntrada(true);
                      await marcarEntrada(user.id);
                      setBusyEntrada(false);
                    }}
                    disabled={estadoActual !== "sin_entrada" || busyEntrada}
                    className={`${
                      estadoActual !== "sin_entrada" || busyEntrada
                        ? "bg-gray-300 cursor-not-allowed"
                        : "bg-green-600 hover:bg-green-700"
                    } text-white px-5 py-3 rounded-xl flex items-center gap-2`}
                  >
                    <FaSignInAlt /> Entrada
                  </button>

                  <button
                    onClick={async () => {
                      setBusySalida(true);
                      await marcarSalida(user.id);
                      setBusySalida(false);
                    }}
                    disabled={estadoActual !== "presente" || busySalida}
                    className={`${
                      estadoActual !== "presente" || busySalida
                        ? "bg-gray-300 cursor-not-allowed"
                        : "bg-red-600 hover:bg-red-700"
                    } text-white px-5 py-3 rounded-xl flex items-center gap-2`}
                  >
                    <FaSignOutAlt /> Salida
                  </button>
                </div>

                {/* RESUMEN CON POLÍTICAS */}
                {resumenAsistencia && (
                  <div className="mt-4 bg-white rounded-xl shadow-md p-6 text-center border border-gray-200">
                    <h2 className="text-2xl font-bold text-sky-800 mb-3">
                      Resumen de tu jornada
                    </h2>

                    <p className="text-gray-700 text-lg">
                      Trabajaste de{" "}
                      <span className="font-semibold">
                        {resumenAsistencia.horaEntrada || "—"}
                      </span>{" "}
                      a{" "}
                      <span className="font-semibold">
                        {resumenAsistencia.horaSalida || "—"}
                      </span>
                      .
                    </p>

                    {/* Total simple (como estaba) */}
                    {resumenAsistencia.total && (
                      <p className="text-green-700 font-bold text-xl mt-3">
                        Total (sin política): {resumenAsistencia.total}
                      </p>
                    )}

                    {/* Total ajustado + extras + descansos */}
                    {resumenAvanzado && resumenAvanzado.totalMin != null && (
                      <div className="mt-4 text-sm text-left bg-sky-50 border border-sky-100 rounded-xl p-4">
                        <p>
                          <span className="font-semibold">
                            Total trabajado:
                          </span>{" "}
                          {minutesToLabel(resumenAvanzado.totalMin)}
                        </p>
                        <p>
                          <span className="font-semibold">
                            Jornada objetivo:
                          </span>{" "}
                          {minutesToLabel(resumenAvanzado.jornadaMin)}
                        </p>
                        <p>
                          <span className="font-semibold">
                            Total ajustado por política (
                            {politicas?.politica_redondeo_tiempos || "normal"}
                            ):
                          </span>{" "}
                          {minutesToLabel(
                            resumenAvanzado.totalMinAjustado
                          )}
                        </p>
                        <p>
                          <span className="font-semibold">
                            Descansos tomados:
                          </span>{" "}
                          {minutesToLabel(
                            resumenAvanzado.minutosDescansoTomados
                          )}
                        </p>
                        <p>
                          <span className="font-semibold">
                            Descanso permitido:
                          </span>{" "}
                          {minutesToLabel(
                            (politicas?.minutos_descanso || 0) *
                              (politicas?.cantidad_descansos_permitidos ||
                                0)
                          )}
                        </p>
                        {resumenAvanzado.excesoDescansoMin > 0 && (
                          <p className="text-red-600 font-semibold">
                            Exceso de descansos:{" "}
                            {minutesToLabel(
                              resumenAvanzado.excesoDescansoMin
                            )}
                          </p>
                        )}
                        {resumenAvanzado.horasExtraMin > 0 && (
                          <p className="text-amber-600 font-semibold mt-1">
                            Horas extra (limitadas por política):{" "}
                            {minutesToLabel(resumenAvanzado.horasExtraMin)}
                          </p>
                        )}
                      </div>
                    )}

                    {!resumenAsistencia.horaSalida && (
                      <p className="text-sky-700 font-medium text-base mt-3">
                        Jornada en curso…
                      </p>
                    )}

                    <p className="text-gray-500 mt-2 text-sm">
                      ¡Buen trabajo hoy, {user.nombre}! 👏
                    </p>
                  </div>
                )}

                {/* BOTÓN REPORTES → abre MODAL */}
                <div className="mt-4">
                  <button
                    className="px-6 py-3 font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow flex items-center gap-2 mx-auto"
                    onClick={() => {
                      const r = getWeekRange();
                      cargarReporte(r.from, r.to);
                      setShowReportModal(true);
                    }}
                  >
                    📊 Ver reportes
                  </button>
                </div>

               {/* INFO SUCURSAL */}
{sucursalEmpleado && (
  <div className="mt-6 flex justify-center items-center">
    <div className="bg-white rounded-xl shadow-md p-6 text-left border border-gray-200 
                    w-1/2 h-1/2 flex flex-col justify-start overflow-auto">
      
      <h2 className="text-xl font-bold text-sky-800 mb-2">
        📍 Tu sucursal
      </h2>

      <p className="text-gray-700">
        <span className="font-semibold">Nombre:</span>{" "}
        {sucursalEmpleado.nombre}
      </p>

      {sucursalEmpleado.direccion && (
        <p className="text-gray-700">
          <span className="font-semibold">Dirección:</span>{" "}
          {sucursalEmpleado.direccion}
        </p>
      )}

      {sucursalEmpleado.latitud && sucursalEmpleado.longitud && (
        <div className="mt-3">
          <img
            src={buildStaticMapUrl(
              sucursalEmpleado.latitud,
              sucursalEmpleado.longitud
            )}
            alt="Mapa sucursal"
            className="w-full rounded-xl shadow-md border"
          />

          {sucursalEmpleado.mapa_url && (
            <a
              href={sucursalEmpleado.mapa_url}
              target="_blank"
              rel="noreferrer"
              className="text-sm text-sky-700 hover:underline mt-2 inline-block"
            >
              Ver en Google Maps
            </a>
          )}
        </div>
      )}
    </div>
  </div>
)}

                
              </div>

              {/* TABS SOLO PARA ASISTENCIA / DESCANSOS */}
              <div className="flex justify-center mb-6 border-b border-gray-300">
                <button
                  className={`px-6 py-3 font-semibold transition-all ${
                    activeTab === "asistencia"
                      ? "border-b-4 border-blue-600 text-blue-600"
                      : "text-gray-500 hover:text-blue-600"
                  }`}
                  onClick={() => setActiveTab("asistencia")}
                >
                  🕒 Asistencia
                </button>

                <button
                  className={`px-6 py-3 font-semibold transition-all ${
                    activeTab === "descansos"
                      ? "border-b-4 border-blue-600 text-blue-600"
                      : "text-gray-500 hover:text-blue-600"
                  }`}
                  onClick={() => setActiveTab("descansos")}
                >
                  ☕ Descansos
                </button>
              </div>

              {/* DESCANSOS (con useDescansos) */}
              {activeTab === "descansos" && (
                <div className="space-y-6 text-center">
                  <h3 className="text-lg font-semibold text-gray-700">
                    Registrar Descanso
                  </h3>

                  {descansoActivo && (
                    <div className="mx-auto max-w-md bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-left">
                      <p className="font-semibold text-amber-800">
                        Descanso en curso
                      </p>
                      <p className="text-amber-900">
                        Tipo: {descansoActivo.tipo} · Inicio:{" "}
                        {descansoActivo.hora_inicio}
                      </p>
                      <button
                        onClick={finalizarDescanso}
                        className="mt-3 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs"
                      >
                        Finalizar descanso
                      </button>
                    </div>
                  )}

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 justify-center mt-4">
                    {/* CAFÉ */}
                    <button
                      onClick={async () => {
                        setBusyDescanso(true);
                        await iniciarDescanso("Café");
                        setBusyDescanso(false);
                      }}
                      disabled={busyDescanso}
                      className="bg-yellow-500 text-white px-4 py-3 rounded-xl font-semibold hover:bg-yellow-600 transition flex items-center justify-center gap-2 disabled:opacity-60"
                    >
                      <FaCoffee /> Café
                    </button>

                    {/* ALMUERZO */}
                    <button
                      onClick={async () => {
                        setBusyDescanso(true);
                        await iniciarDescanso("Almuerzo");
                        setBusyDescanso(false);
                      }}
                      disabled={busyDescanso}
                      className="bg-orange-500 text-white px-4 py-3 rounded-xl font-semibold hover:bg-orange-600 transition flex items-center justify-center gap-2 disabled:opacity-60"
                    >
                      🍽️ Almuerzo
                    </button>

                    {/* MERIENDA */}
                    <button
                      onClick={async () => {
                        setBusyDescanso(true);
                        await iniciarDescanso("Merienda");
                        setBusyDescanso(false);
                      }}
                      disabled={busyDescanso}
                      className="bg-pink-500 text-white px-4 py-3 rounded-xl font-semibold hover:bg-pink-600 transition flex items-center justify-center gap-2 disabled:opacity-60"
                    >
                      🍎 Merienda
                    </button>

                    {/* BAÑO */}
                    <button
                      onClick={async () => {
                        setBusyDescanso(true);
                        await iniciarDescanso("Baño");
                        setBusyDescanso(false);
                      }}
                      disabled={busyDescanso}
                      className="bg-indigo-500 text-white px-4 py-3 rounded-xl font-semibold hover:bg-indigo-600 transition flex items-center justify-center gap-2 disabled:opacity-60"
                    >
                      🚻 Baño
                    </button>
                  </div>

                  {/* LISTA SIMPLE DE DESCANSOS RECIENTES */}
                  <div className="mt-6 max-w-xl mx-auto text-left">
                    <h4 className="text-sm font-semibold text-gray-700 mb-2">
                      Tus últimos descansos
                    </h4>
                    <div className="border rounded-xl max-h-60 overflow-auto">
                      <table className="w-full text-xs">
                        <thead className="bg-gray-100">
                          <tr>
                            <th className="px-2 py-1 text-left">Tipo</th>
                            <th className="px-2 py-1 text-left">Inicio</th>
                            <th className="px-2 py-1 text-left">Fin</th>
                            <th className="px-2 py-1 text-left">Estado</th>
                          </tr>
                        </thead>
                        <tbody>
                          {descansos.length > 0 ? (
                            descansos
                              .slice(0, 20)
                              .map((d) => (
                                <tr key={d.id} className="border-t">
                                  <td className="px-2 py-1">{d.tipo}</td>
                                  <td className="px-2 py-1">
                                    {d.hora_inicio}
                                  </td>
                                  <td className="px-2 py-1">
                                    {d.hora_fin || "—"}
                                  </td>
                                  <td className="px-2 py-1 capitalize">
                                    {d.estado}
                                  </td>
                                </tr>
                              ))
                          ) : (
                            <tr>
                              <td
                                colSpan={4}
                                className="px-2 py-3 text-center text-gray-500 italic"
                              >
                                No tenés descansos registrados.
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}

          {/* ========================================= */}
          {/*                  ADMIN                     */}
          {/* ========================================= */}
          {isAdmin && (
            <div className="bg-white rounded-xl shadow p-6">
              {/* BUSCADOR + FILTRO SUCURSAL */}
              <div className="flex flex-col md:flex-row items-center gap-3 mb-4">
                <div className="flex items-center gap-3 w-full md:flex-1">
                  <FaSearch className="text-gray-400" />
                  <input
                    type="text"
                    placeholder="Buscar empleado..."
                    className="border rounded-xl px-4 py-2 w-full focus:ring-2 focus:ring-sky-500"
                    value={busqueda}
                    onChange={(e) => setBusqueda(e.target.value)}
                  />
                </div>

                <div className="w-full md:w-64">
                  <label className="block text-xs font-semibold text-gray-600 mb-1">
                    Filtrar por sucursal
                  </label>
                  <select
                    value={sucursalFiltro}
                    onChange={(e) => setSucursalFiltro(e.target.value)}
                    className="w-full border rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-sky-500"
                  >
                    <option value="">Todas las sucursales</option>

                    {sucursales.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.nombre}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* TABLA EMPLEADOS */}
              <div className="overflow-auto">
                <table className="min-w-full text-center border border-gray-200">
         <thead className="bg-gray-100">
  <tr>
    <th className="px-3 py-2">ID</th>
    <th className="px-3 py-2">Nombre</th>
    <th className="px-3 py-2">Rol</th>
    <th className="px-3 py-2">Sucursal</th>
    <th className="px-3 py-2">Estado</th>
    <th className="px-3 py-2">Detalle</th>
  </tr>
</thead>



                 <tbody>
  {empleadosFiltrados.map((e) => (
    <tr
      key={e.id}
      className="hover:bg-gray-50 transition cursor-pointer"
    ><td className="py-2">{e.id}</td>
<td className="py-2">{e.nombre}</td>
<td className="py-2 capitalize">{e.role || e.rol}</td>

<td className="py-2">{getSucursalName(sucursales, e.sucursal_id)}</td>

<td className="py-2"> ... bolita estado ... </td>

<td className="py-2">
  <button onClick={() => onDetalle(e)}>Ver detalle</button>
</td>


    </tr>
  ))}

  {empleadosFiltrados.length === 0 && (
    <tr>
      <td
        colSpan={6}
        className="py-4 text-gray-500 text-sm italic"
      >
        No hay empleados para los filtros seleccionados.
      </td>
    </tr>
  )}
</tbody>

                </table>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ========================================= */}
      {/*           MODAL ADMIN DETALLE             */}
      {/* ========================================= */}
      <AppModal
        isOpen={showDetailModal && selectedEmployee}
        onClose={closeModal}
        title={`Asistencia de ${selectedEmployee?.nombre}`}
        size="md"
      >
        <div className="space-y-5">
          {/* ESTADO */}
          {modalLoading ? (
            <div className="text-gray-500 text-sm">Cargando…</div>
          ) : (
            <>
              {estadoChip(modalEstadoActual)}

              <p className="mt-3 text-sm">
                Entrada:{" "}
                <strong>{formatTime(modalAsistencia?.hora_entrada)}</strong>{" "}
                — Salida:{" "}
                <strong>{formatTime(modalAsistencia?.hora_salida)}</strong>
              </p>
            </>
          )}

          {/* SUCURSAL / MAPA */}
          {sucursalEmpleadoModal && (
            <div className="border border-gray-200 rounded-lg p-3">
              <h3 className="font-semibold text-sm mb-1">
                📍 Sucursal del empleado
              </h3>

              <p className="text-sm text-gray-700">
                <span className="font-semibold">Nombre:</span>{" "}
                {sucursalEmpleadoModal.nombre}
              </p>

              {sucursalEmpleadoModal.direccion && (
                <p className="text-sm text-gray-700">
                  <span className="font-semibold">Dirección:</span>{" "}
                  {sucursalEmpleadoModal.direccion}
                </p>
              )}

              {sucursalEmpleadoModal.latitud &&
                sucursalEmpleadoModal.longitud && (
                  <div className="mt-2">
                    <img
                      src={buildStaticMapUrl(
                        sucursalEmpleadoModal.latitud,
                        sucursalEmpleadoModal.longitud,
                        15,
                        "500x250"
                      )}
                      alt="Mapa sucursal"
                      className="w-full rounded-lg border shadow-sm"
                    />

                    {sucursalEmpleadoModal.mapa_url && (
                      <a
                        href={sucursalEmpleadoModal.mapa_url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs text-sky-700 hover:underline mt-1 inline-block"
                      >
                        Ver en Google Maps
                      </a>
                    )}
                  </div>
                )}
            </div>
          )}

          {/* HISTORIAL */}
          <div>
            <h3 className="font-semibold mb-2">Histórico</h3>

            {/* RANGO FECHAS */}
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

            {/* TABLA HISTORIAL */}
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

      {/* ========================================= */}
      {/*         MODAL EMPLEADO – REPORTES         */}
      {/* ========================================= */}
      <AppModal
        isOpen={showReportModal}
        onClose={closeReportModal}
        title={`📊 Reporte de asistencias de ${user.nombre}`}
        size="lg"
      >
        {/* BOTONES RANGO */}
        <div className="flex justify-center gap-4 mb-4">
          <button
            onClick={() => {
              const r = getWeekRange();
              cargarReporte(r.from, r.to);
            }}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
          >
            Semana actual
          </button>

          <button
            onClick={() => {
              const r = getMonthRange();
              cargarReporte(r.from, r.to);
            }}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm"
          >
            Mes actual
          </button>

          <button
            onClick={() => {
              const r = getYearRange();
              cargarReporte(r.from, r.to);
            }}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 text-sm"
          >
            Año actual
          </button>
        </div>

        {/* RESUMEN */}
        {reporteResumen && (
          <div className="bg-sky-50 p-4 rounded-lg mb-4 text-center border">
            <p className="text-lg font-semibold text-sky-900">
              Total horas (ajustado por política si aplica):{" "}
              {reporteResumen.totalHoras}
            </p>
            <p className="text-gray-700">
              Días trabajados: {reporteResumen.dias}
            </p>
          </div>
        )}

        {/* TABLA */}
        <div className="max-h-[400px] overflow-auto border rounded-lg">
          <table className="min-w-full text-center border-collapse">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-3 py-2 border">Fecha</th>
                <th className="px-3 py-2 border">Entrada</th>
                <th className="px-3 py-2 border">Salida</th>
              </tr>
            </thead>

            <tbody>
              {reporte.map((r) => (
                <tr key={r.id} className="hover:bg-gray-50">
                  <td className="px-3 py-2 border">{r.fecha}</td>
                  <td className="px-3 py-2 border">
                    {formatTime(r.hora_entrada)}
                  </td>
                  <td className="px-3 py-2 border">
                    {formatTime(r.hora_salida)}
                  </td>
                </tr>
              ))}

              {reporte.length === 0 && (
                <tr>
                  <td
                    colSpan={3}
                    className="px-3 py-4 text-gray-500 text-sm italic"
                  >
                    No hay registros para el rango seleccionado.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </AppModal>

      <Footer />
    </>
  );
}
