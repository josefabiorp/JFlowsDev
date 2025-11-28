// ===============================================================
//   MODAL PROFESIONAL — REPORTE EMPLEADO (CONTROL DE TURNO)
//   Versión corporativa completa + datos extendidos del día
//   Usa los datos de `dia_a_dia` del endpoint /asistencias/rango
// ===============================================================

import React, { useState } from "react";
import { AppModal } from "../AppModal.jsx";
import { FaPrint } from "react-icons/fa";

// ------------------------
// HELPERS CORPORATIVOS
// ------------------------

// minutos (number) → "8h 30m"
const minutesToLabel = (min) => {
  if (min == null || isNaN(min)) return "—";
  const h = Math.floor(min / 60);
  const m = Math.abs(min % 60);
  return `${h}h ${m}m`;
};

const formatHour = (value) => {
  if (!value) return "—";
  // value puede venir como "HH:MM:SS" o ISO
  const base = value.length <= 8 ? `1970-01-01T${value}` : value;
  const date = new Date(base);
  if (isNaN(date)) return value;
  return date.toLocaleTimeString("es-CR", {
    hour: "numeric",
    minute: "2-digit",
  });
};

const formatFechaCorta = (fechaISO) => {
  if (!fechaISO) return "—";
  const d = new Date(fechaISO);
  if (isNaN(d)) return fechaISO;
  return d.toLocaleDateString("es-CR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

// ------------------------
// IMPRIMIR REPORTE
// ------------------------
const imprimirReporte = () => {
  const contenedor = document.getElementById("reporte-empleado-print");
  if (!contenedor) return;

  const contenido = contenedor.innerHTML;
  const ventana = window.open("", "_blank", "width=1200,height=800");

  ventana.document.write(`
    <html>
      <head>
        <title>Reporte de asistencias</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 20px; }
          h1,h2,h3 { margin-bottom: 0; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; }
          th, td { border: 1px solid #ccc; padding: 8px; font-size: 12px; }
          th { background: #f2f2f2; }
        </style>
      </head>
      <body>${contenido}</body>
    </html>
  `);

  ventana.document.close();
  ventana.print();
};

export function ReporteEmpleadoModal({
  isOpen,
  onClose,
  user,
  reporte,          // ⚠️ Debe venir de data.dia_a_dia
  reporteResumen,
  getWeekRange,
  getMonthRange,
  getYearRange,
  cargarReporte,
  turnoEmpleado,    // viene de data.turno
}) {
  const [filtro, setFiltro] = useState("semana");
  const [customFrom, setCustomFrom] = useState("");
  const [customTo, setCustomTo] = useState("");

  const turnoStr = turnoEmpleado
    ? `${formatHour(turnoEmpleado.hora_inicio)} – ${formatHour(
        turnoEmpleado.hora_fin
      )}`
    : "Sin turno asignado";

  // --------------------------
  // APLICAR FILTROS DE RANGO
  // --------------------------
  const aplicarFiltro = () => {
    if (filtro === "semana") {
      const { from, to } = getWeekRange();
      return cargarReporte(from, to);
    }
    if (filtro === "mes") {
      const { from, to } = getMonthRange();
      return cargarReporte(from, to);
    }
    if (filtro === "anio") {
      const { from, to } = getYearRange();
      return cargarReporte(from, to);
    }
    if (filtro === "custom") {
      if (!customFrom || !customTo)
        return alert("Seleccioná un rango válido");
      return cargarReporte(customFrom, customTo);
    }
  };

  // ----------------------
  // BUSCAR EL DÍA DE HOY (USANDO dia_a_dia)
  // ----------------------
  const hoy = new Date().toISOString().slice(0, 10); // "YYYY-MM-DD"
  const registroHoy = (reporte || []).find((r) => r.fecha === hoy);

  const dataHoy =
    registroHoy && {
      trabajado: minutesToLabel(registroHoy.trabajado_min ?? 0),
      atraso: minutesToLabel(registroHoy.atraso_min ?? 0),
      salidaAnt: minutesToLabel(registroHoy.salida_anticipada_min ?? 0),
      extra: minutesToLabel(registroHoy.horas_extra_min ?? 0),
      descansos: minutesToLabel(registroHoy.descansos_usados_min ?? 0),
      excesoDescanso: minutesToLabel(registroHoy.exceso_descanso_min ?? 0),
      estado: registroHoy.estado_jornada ?? "—",
      cumplio: registroHoy.cumplio_turno ? "🟢 Sí" : "🔴 No",
    };

  return (
    <AppModal
      isOpen={isOpen}
      onClose={onClose}
      title={`📊 Reporte de asistencias — ${user.nombre}`}
      size="xl"
    >
      {/* BOTÓN IMPRIMIR */}
      <div className="flex justify-end mb-4">
        <button
          onClick={imprimirReporte}
          className="bg-gray-700 hover:bg-gray-800 text-white px-4 py-2 rounded-lg flex items-center gap-2 text-sm shadow"
        >
          <FaPrint /> Imprimir reporte
        </button>
      </div>

      <div id="reporte-empleado-print">
        {/* --------------------------
            TURNO DEL EMPLEADO
        --------------------------- */}
        {turnoEmpleado && (
          <div className="mb-4 bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm">
            <h3 className="text-blue-900 font-bold text-base mb-2">
              📌 Turno asignado
            </h3>

            <p>
              <span className="font-semibold">Nombre:</span>{" "}
              {turnoEmpleado.nombre}
            </p>

            <p>
              <span className="font-semibold">Horario:</span> {turnoStr}
            </p>

            <div className="mt-2 grid grid-cols-1 sm:grid-cols-3 gap-2">
              <p>
                <span className="font-semibold">Tolerancia entrada:</span>{" "}
                {turnoEmpleado.tolerancia_entrada} min
              </p>
              <p>
                <span className="font-semibold">Tolerancia salida:</span>{" "}
                {turnoEmpleado.tolerancia_salida} min
              </p>
              <p>
                <span className="font-semibold">Almuerzo:</span>{" "}
                {minutesToLabel(turnoEmpleado.minutos_almuerzo)}
              </p>
            </div>
          </div>
        )}

        {/* --------------------------
            RESULTADO DEL DÍA (como admin / dia_a_dia)
        --------------------------- */}
        {dataHoy && (
          <div className="mb-5 bg-white border p-4 rounded-xl shadow-sm text-sm">
            <h3 className="font-bold text-lg text-gray-800 mb-3">
              ⭐ Resultado de tu jornada de hoy
            </h3>

            <div className="grid sm:grid-cols-3 gap-y-2">
              <p>
                <span className="font-semibold">Trabajado:</span>{" "}
                {dataHoy.trabajado}
              </p>
              <p>
                <span className="font-semibold">Atraso:</span>{" "}
                {dataHoy.atraso}
              </p>
              <p>
                <span className="font-semibold">Salida anticipada:</span>{" "}
                {dataHoy.salidaAnt}
              </p>
              <p>
                <span className="font-semibold">Horas extra:</span>{" "}
                {dataHoy.extra}
              </p>
              <p>
                <span className="font-semibold">Descansos usados:</span>{" "}
                {dataHoy.descansos}
              </p>
              <p>
                <span className="font-semibold">Exceso descanso:</span>{" "}
                {dataHoy.excesoDescanso}
              </p>
              <p className="col-span-3">
                <span className="font-semibold">Estado de la jornada:</span>{" "}
                {dataHoy.estado}
              </p>
              <p className="col-span-3">
                <span className="font-semibold">Cumpliste turno:</span>{" "}
                {dataHoy.cumplio}
              </p>
            </div>
          </div>
        )}

        {/* --------------------------
            RESUMEN GENERAL
        --------------------------- */}
        {reporteResumen && (
          <div className="text-center bg-blue-50 border border-blue-100 p-4 rounded-lg mb-4">
            <p className="text-lg font-bold text-blue-800">
              Total horas trabajadas: {reporteResumen.totalHoras}
            </p>
            <p className="text-gray-700 text-sm">
              Días registrados: {reporteResumen.dias}
            </p>
          </div>
        )}

        {/* --------------------------
            TABLA DETALLADA PREMIUM (usa dia_a_dia)
        --------------------------- */}
        <div className="max-h-[450px] overflow-auto border rounded-lg shadow-sm">
          <table className="min-w-full border-collapse text-sm text-center">
            <thead className="bg-gray-100 text-gray-700 sticky top-0 z-10">
              <tr>
                <th className="px-3 py-2 border">Fecha</th>
                <th className="px-3 py-2 border">Turno</th>
                <th className="px-3 py-2 border">Entrada</th>
                <th className="px-3 py-2 border">Salida</th>
                <th className="px-3 py-2 border">Trabajado</th>
                <th className="px-3 py-2 border">Atraso</th>
                <th className="px-3 py-2 border">Salida ant.</th>
                <th className="px-3 py-2 border">Horas extra</th>
                <th className="px-3 py-2 border">Descansos</th>
                <th className="px-3 py-2 border">Exceso desc.</th>
                <th className="px-3 py-2 border">Estado</th>
                <th className="px-3 py-2 border">Cumplió</th>
              </tr>
            </thead>

            <tbody>
              {reporte?.length ? (
                reporte.map((r, idx) => (
                  <tr key={idx} className="hover:bg-gray-50">
                    <td className="px-3 py-2 border">
                      {formatFechaCorta(r.fecha)}
                    </td>
                    <td className="px-3 py-2 border text-xs">{turnoStr}</td>
                    <td className="px-3 py-2 border">
                      {formatHour(r.entrada)}
                    </td>
                    <td className="px-3 py-2 border">
                      {formatHour(r.salida)}
                    </td>
                    <td className="px-3 py-2 border">
                      {minutesToLabel(r.trabajado_min)}
                    </td>
                    <td className="px-3 py-2 border">
                      {minutesToLabel(r.atraso_min)}
                    </td>
                    <td className="px-3 py-2 border">
                      {minutesToLabel(r.salida_anticipada_min)}
                    </td>
                    <td className="px-3 py-2 border">
                      {minutesToLabel(r.horas_extra_min)}
                    </td>
                    <td className="px-3 py-2 border">
                      {minutesToLabel(r.descansos_usados_min)}
                    </td>
                    <td className="px-3 py-2 border">
                      {minutesToLabel(r.exceso_descanso_min)}
                    </td>
                    <td className="px-3 py-2 border">
                      {r.estado_jornada || "—"}
                    </td>
                    <td className="px-3 py-2 border font-semibold">
                      {r.cumplio_turno ? "🟢 Sí" : "🔴 No"}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={12} className="px-3 py-4 text-gray-500 italic">
                    No hay registros para este periodo.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* --------------------------
          FILTROS
      --------------------------- */}
      <div className="p-4 bg-gray-100 rounded-lg mt-4">
        <div className="flex flex-wrap justify-center gap-3 mb-3">
          {[
            { value: "semana", label: "Semana actual" },
            { value: "mes", label: "Mes actual" },
            { value: "anio", label: "Año actual" },
            { value: "custom", label: "Personalizado" },
          ].map((b) => (
            <button
              key={b.value}
              onClick={() => setFiltro(b.value)}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition ${
                filtro === b.value
                  ? "bg-blue-600 text-white shadow"
                  : "bg-white text-gray-700 border"
              }`}
            >
              {b.label}
            </button>
          ))}
        </div>

        {filtro === "custom" && (
          <div className="flex flex-wrap justify-center gap-3 mt-3">
            <input
              type="date"
              className="border rounded-lg px-3 py-2 text-sm"
              value={customFrom}
              onChange={(e) => setCustomFrom(e.target.value)}
            />
            <input
              type="date"
              className="border rounded-lg px-3 py-2 text-sm"
              value={customTo}
              onChange={(e) => setCustomTo(e.target.value)}
            />

            <button
              onClick={aplicarFiltro}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm shadow"
            >
              Aplicar
            </button>
          </div>
        )}

        {filtro !== "custom" && (
          <div className="flex justify-center mt-2">
            <button
              onClick={aplicarFiltro}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm shadow"
            >
              Aplicar filtro
            </button>
          </div>
        )}
      </div>
    </AppModal>
  );
}
