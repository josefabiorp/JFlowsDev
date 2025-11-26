// =============================================================
//  useAsistenciaAdminLogic.js
//  (Lógica del panel ADMIN — versión final PRO)
// =============================================================

import { useState, useCallback, useEffect } from "react";
import toast from "react-hot-toast";

export function useAsistenciaAdminLogic({
  API_URL,
  token,
  empleados,
  sucursales,
  fetchSucursales,
  fetchEmpleados,
  fetchEstadoActual,
  fetchPoliticas,
  isAdmin
}) {

  // ===============================
  //  ESTADOS CORE
  // ===============================
  const [estadoEmpleados, setEstadoEmpleados] = useState({});
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);

  const [modalLoading, setModalLoading] = useState(false);
  const [modalEstadoActual, setModalEstadoActual] = useState(null);
  const [modalAsistencia, setModalAsistencia] = useState(null);

  // 🔵 Dia a dia del rango
  const [historial, setHistorial] = useState([]);

  // 🔵 Resumen del periodo (backend)
  const [resumenRangoAdmin, setResumenRangoAdmin] = useState(null);

  const [rangoFechas, setRangoFechas] = useState({ from: "", to: "" });

  // ⭐ Turno obtenido desde /asistencias/rango
  const [turnoReporteAdmin, setTurnoReporteAdmin] = useState(null);



  // ===============================
  //  FILTROS
  // ===============================
  const [busqueda, setBusqueda] = useState("");
  const [sucursalFiltro, setSucursalFiltro] = useState("");

  const empleadosFiltrados = empleados.filter((e) => {
    const matchesName = e.nombre?.toLowerCase().includes(busqueda.toLowerCase());
    const matchesSucursal =
      !sucursalFiltro || String(e.sucursal_id) === String(sucursalFiltro);

    return matchesName && matchesSucursal;
  });


  // ===============================
  //  ESTADOS DE EMPLEADOS (circulitos)
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
  }, [isAdmin, empleados, token, API_URL]);


  // Autocargar cuando cambian empleados
  useEffect(() => {
    if (isAdmin && empleados.length > 0) cargarEstadosEmpleados();
  }, [isAdmin, empleados, cargarEstadosEmpleados]);


  // Auto-refresh cada 20 s
  useEffect(() => {
    if (!isAdmin) return;

    const interval = setInterval(() => {
      if (empleados.length > 0) cargarEstadosEmpleados();
    }, 20000);

    return () => clearInterval(interval);
  }, [isAdmin, empleados, cargarEstadosEmpleados]);


  // ===============================
  //  ABRIR MODAL ADMIN
  // ===============================
  const abrirDetalleEmpleado = async (emp, fetchEstadoActualEmpleado) => {
    setSelectedEmployee(emp);

    // limpiar estados
    setModalEstadoActual(null);
    setModalAsistencia(null);
    setHistorial([]);
    setResumenRangoAdmin(null);
    setTurnoReporteAdmin(null);
    setRangoFechas({ from: "", to: "" });

    setShowDetailModal(true);

    await fetchEstadoActualEmpleado(emp.id);
  };


  // ===============================
  //  ESTADO ACTUAL PARA EL MODAL
  // ===============================
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
    [token, API_URL]
  );


  // ===============================
  //  HISTORIAL + RESUMEN + TURNO
  //  (desde /asistencias/rango)
  // ===============================
  const fetchAsistenciasRango = async (usuario_id, from, to) => {
    if (!from || !to) return toast.error("Seleccioná un rango válido");

    try {
      const res = await fetch(
        `${API_URL}/asistencias/rango?usuario_id=${usuario_id}&from=${from}&to=${to}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const data = await res.json();

      if (!res.ok) throw new Error();

      // 🔵 Datos ya procesados por el backend
      setHistorial(data.dia_a_dia || []);
      setResumenRangoAdmin(data.resumen || null);
      setTurnoReporteAdmin(data.turno || null);

    } catch {
      toast.error("No se pudo cargar el historial");
    }
  };


  // ===============================
  //  REFRESH
  // ===============================
  const refreshManualmente = async () => {
    try {
      await Promise.all([
        fetchSucursales(),
        isAdmin ? fetchEmpleados() : Promise.resolve(),
        fetchEstadoActual(),
        fetchPoliticas(),
      ]);

      toast.success("Datos actualizados");

    } catch {
      toast.error("Error al actualizar");
    }
  };


  // ===============================
  //  CSV
  // ===============================
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


  // ===============================
  //  IMPRIMIR
  // ===============================
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


  // ===============================
  //  RETORNO
  // ===============================
  return {
    estadoEmpleados,
    cargarEstadosEmpleados,

    showDetailModal,
    setShowDetailModal,

    selectedEmployee,
    abrirDetalleEmpleado,

    modalLoading,
    modalEstadoActual,
    modalAsistencia,

    historial,
    resumenRangoAdmin,
    rangoFechas,
    setRangoFechas,
    fetchAsistenciasRango,

    turnoReporteAdmin,

    busqueda,
    setBusqueda,
    sucursalFiltro,
    setSucursalFiltro,
    empleadosFiltrados,

    refreshManualmente,
    exportarCSV,
    imprimirTabla,

    fetchEstadoActualEmpleado,
  };
}
