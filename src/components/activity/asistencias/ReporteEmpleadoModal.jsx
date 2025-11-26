// ===============================================================
//   MODAL PROFESIONAL — REPORTE EMPLEADO (CONTROL DE TURNO)
// ===============================================================

import React, { useState } from "react";
import { AppModal } from "../AppModal.jsx";
import { formatTime } from "./helpers.js";

// Helper: minutos → "Xh Ymin"
const minutesToLabel = (min) => {
  if (min == null || isNaN(min)) return "—";
  const h = Math.floor(min / 60);
  const m = Math.abs(min % 60);
  return `${h}h ${m}min`;
};

const calcWorkedMinutesFallback = (entrada, salida) => {
  if (!entrada || !salida) return null;
  const start = new Date(`1970-01-01T${entrada}`);
  const end = new Date(`1970-01-01T${salida}`);
  return (end - start) / 1000 / 60;
};

export function ReporteEmpleadoModal({
  isOpen,
  onClose,
  user,
  reporte,
  reporteResumen,
  getWeekRange,
  getMonthRange,
  getYearRange,
  cargarReporte,
  turnoEmpleado, // viene del backend
}) {
  const [filtro, setFiltro] = useState("semana");
  const [customFrom, setCustomFrom] = useState("");
  const [customTo, setCustomTo] = useState("");

  const aplicarFiltro = () => {
    if (filtro === "semana") {
      const r = getWeekRange();
      return cargarReporte(r.from, r.to);
    }
    if (filtro === "mes") {
      const r = getMonthRange();
      return cargarReporte(r.from, r.to);
    }
    if (filtro === "anio") {
      const r = getYearRange();
      return cargarReporte(r.from, r.to);
    }
    if (filtro === "custom") {
      if (!customFrom || !customTo) return alert("Seleccioná un rango válido");
      return cargarReporte(customFrom, customTo);
    }
  };

  // ================================================
  // SIEMPRE usaremos turnoEmpleado para mostrar turno
  // ================================================
  const turnoStr = turnoEmpleado
    ? `${turnoEmpleado.hora_inicio} – ${turnoEmpleado.hora_fin}`
    : "Sin turno asignado";

  return (
    <AppModal
      isOpen={isOpen}
      onClose={onClose}
      title={`📊 Reporte de asistencias — ${user.nombre}`}
      size="xl"
    >
      {/* BLOQUE: INFORMACIÓN DEL TURNO */}
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

          <div className="mt-2 grid grid-cols-1 sm:grid-cols-3 gap-2 text-sm">
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
              {turnoEmpleado.minutos_almuerzo} min
            </p>
          </div>
        </div>
      )}

      {/* FILTROS */}
      <div className="p-4 bg-gray-100 rounded-lg mb-4">
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
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition
                ${
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

      {/* RESUMEN GENERAL */}
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

      {/* TABLA DETALLADA */}
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
              <th className="px-3 py-2 border">Estado</th>
              <th className="px-3 py-2 border">Cumplió turno</th>
            </tr>
          </thead>

          <tbody>
            {reporte?.length ? (
              reporte.map((r) => {
                const trabajadosMin =
                  r.minutos_trabajados ??
                  calcWorkedMinutesFallback(r.hora_entrada, r.hora_salida);

                const atraso = r.minutos_atraso ?? 0;
                const salidaAnt = r.minutos_salida_anticipada ?? 0;
                const extra = r.minutos_horas_extra ?? 0;

                const estado = r.estado_jornada || "—";

                const cumplioTurno =
                  atraso === 0 &&
                  salidaAnt === 0 &&
                  trabajadosMin != null;

                return (
                  <tr key={r.id} className="hover:bg-gray-50">
                    <td className="px-3 py-2 border">{r.fecha}</td>
                    <td className="px-3 py-2 border text-xs">{turnoStr}</td>
                    <td className="px-3 py-2 border">
                      {formatTime(r.hora_entrada)}
                    </td>
                    <td className="px-3 py-2 border">
                      {formatTime(r.hora_salida)}
                    </td>
                    <td className="px-3 py-2 border">
                      {minutesToLabel(trabajadosMin)}
                    </td>
                    <td className="px-3 py-2 border">
                      {atraso ? `${atraso} min` : "—"}
                    </td>
                    <td className="px-3 py-2 border">
                      {salidaAnt ? `${salidaAnt} min` : "—"}
                    </td>
                    <td className="px-3 py-2 border">
                      {extra ? minutesToLabel(extra) : "—"}
                    </td>
                    <td className="px-3 py-2 border">{estado}</td>
                    <td className="px-3 py-2 border font-semibold">
                      <span
                        className={
                          cumplioTurno ? "text-green-700" : "text-red-600"
                        }
                      >
                        {cumplioTurno ? "Sí" : "No"}
                      </span>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td
                  colSpan={10}
                  className="px-3 py-4 text-gray-500 italic"
                >
                  No hay registros para este periodo.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </AppModal>
  );
}
