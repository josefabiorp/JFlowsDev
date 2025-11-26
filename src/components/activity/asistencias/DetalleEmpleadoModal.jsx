// ===============================================================
//   MODAL PROFESIONAL — DETALLE DE EMPLEADO (ADMIN)
//   Usa: turno, dia_a_dia, resumen de /asistencias/rango
// ===============================================================

import React from "react";
import { AppModal } from "../AppModal.jsx";
import { buildStaticMapUrl, formatTime } from "./helpers.js";

// Formatea minutos → "8h 30m"
const minToLabel = (min) => {
  if (min == null) return "—";
  const h = Math.floor(min / 60);
  const m = min % 60;
  return `${h}h ${m}m`;
};

export function DetalleEmpleadoModal({
  isOpen,
  onClose,
  selectedEmployee,

  // sucursal del empleado (ya resuelta afuera)
  sucursalEmpleadoModal,

  // estado del día actual
  modalLoading,
  modalEstadoActual,
  modalAsistencia,

  // filtros de rango
  rangoFechas,
  setRangoFechas,
  fetchAsistenciasRango,

  // 🔵 arreglo que viene de data.dia_a_dia
  historial,

  // 🔵 resumen que viene de data.resumen
  resumenRango,

  // 🔵 turno que viene de data.turno
  turnoEmpleadoModal,
}) {
  return (
    <AppModal
      isOpen={isOpen && !!selectedEmployee}
      onClose={onClose}
      title={`📑 Detalle de asistencia — ${selectedEmployee?.nombre || ""}`}
      size="xl"
    >
      <div className="space-y-6">
        {/* ================================
            PANEL DEL DÍA (actual)
        ================================ */}
        {modalLoading ? (
          <div className="text-gray-500 text-sm">Cargando datos…</div>
        ) : (
          <div className="bg-gray-50 border p-4 rounded-xl shadow-sm text-sm">
            <h3 className="font-bold text-lg mb-3 text-sky-800">
              📅 Jornada de hoy
            </h3>

            <p>
              <span className="font-semibold">Estado:</span>{" "}
              {modalEstadoActual || "sin_entrada"}
            </p>

            <p>
              <span className="font-semibold">Entrada:</span>{" "}
              {formatTime(modalAsistencia?.hora_entrada)}
            </p>
            <p>
              <span className="font-semibold">Salida:</span>{" "}
              {formatTime(modalAsistencia?.hora_salida)}
            </p>

            {/* =============================
                🔵 TURNO DEL EMPLEADO (global)
            ============================= */}
            {turnoEmpleadoModal && (
              <div className="mt-3 bg-blue-50 border border-blue-200 p-3 rounded-lg">
                <h4 className="text-blue-800 font-bold text-md mb-1">
                  📌 Turno asignado
                </h4>

                <p>
                  <span className="font-semibold">Turno:</span>{" "}
                  {turnoEmpleadoModal.nombre}
                </p>

                <p>
                  <span className="font-semibold">Horario:</span>{" "}
                  {turnoEmpleadoModal.hora_inicio} –{" "}
                  {turnoEmpleadoModal.hora_fin}
                </p>

                <p className="mt-2">
                  <span className="font-semibold">Tolerancias:</span>{" "}
                  {turnoEmpleadoModal.tolerancia_entrada}m entrada /{" "}
                  {turnoEmpleadoModal.tolerancia_salida}m salida
                </p>

                <p>
                  <span className="font-semibold">Almuerzo:</span>{" "}
                  {turnoEmpleadoModal.minutos_almuerzo} min
                </p>
              </div>
            )}

            {/* =============================
                📊 DIAGNÓSTICO DEL DÍA
            ============================= */}
            {modalAsistencia && (
              <div className="mt-3 bg-white border p-3 rounded-lg shadow-inner">
                <h4 className="font-bold text-md text-gray-800 mb-2">
                  📊 Diagnóstico del día
                </h4>

                <p>
                  <span className="font-semibold">Atraso:</span>{" "}
                  {modalAsistencia.minutos_atraso ?? 0} min
                </p>

                <p>
                  <span className="font-semibold">Salida anticipada:</span>{" "}
                  {modalAsistencia.minutos_salida_anticipada ?? 0} min
                </p>

                <p>
                  <span className="font-semibold">Horas extra:</span>{" "}
                  {modalAsistencia.minutos_horas_extra
                    ? minToLabel(modalAsistencia.minutos_horas_extra)
                    : "0"}
                </p>

                <p>
                  <span className="font-semibold">Trabajado real:</span>{" "}
                  {modalAsistencia.minutos_trabajados != null
                    ? minToLabel(modalAsistencia.minutos_trabajados)
                    : "—"}
                </p>

                <p className="mt-1">
                  <span className="font-semibold">Estado jornada:</span>{" "}
                  {modalAsistencia.estado_jornada || "—"}
                </p>
              </div>
            )}
          </div>
        )}

        {/* ===============================
            RESUMEN DEL RANGO
        =============================== */}
        {resumenRango && (
          <div className="bg-sky-50 border border-sky-100 p-4 rounded-xl shadow-sm text-sm">
            <h3 className="font-bold text-sky-900 text-lg mb-2">
              📈 Resumen del periodo
            </h3>

            <div className="grid sm:grid-cols-2 gap-2">
              <p>
                <span className="font-semibold">Días con registros:</span>{" "}
                {resumenRango.dias}
              </p>

              <p>
                <span className="font-semibold">Total trabajado:</span>{" "}
                {minToLabel(resumenRango.total_trabajado_min)}
              </p>

              <p>
                <span className="font-semibold">Total horas extra:</span>{" "}
                {minToLabel(resumenRango.total_extra_min)}
              </p>

              <p>
                <span className="font-semibold">Total atraso:</span>{" "}
                {minToLabel(resumenRango.total_atraso_min)}
              </p>

              <p>
                <span className="font-semibold">
                  Total salida anticipada:
                </span>{" "}
                {minToLabel(resumenRango.total_salida_anticipada_min)}
              </p>

              <p>
                <span className="font-semibold">Descansos usados:</span>{" "}
                {minToLabel(resumenRango.total_descansos_min)}
              </p>

              <p>
                <span className="font-semibold">Exceso de descansos:</span>{" "}
                {minToLabel(resumenRango.exceso_descanso_sum)}
              </p>

              <p>
                <span className="font-semibold">Cumplimiento general:</span>{" "}
                {resumenRango.cumplimiento_general}
              </p>
            </div>
          </div>
        )}

        {/* ===============================
            SUCURSAL
        =============================== */}
        {sucursalEmpleadoModal && (
          <div className="border p-3 rounded-lg shadow-sm text-sm">
            <h3 className="font-semibold mb-2">📍 Sucursal del empleado</h3>

            <p>
              <span className="font-semibold">Nombre:</span>{" "}
              {sucursalEmpleadoModal.nombre}
            </p>

            {sucursalEmpleadoModal.direccion && (
              <p>
                <span className="font-semibold">Dirección:</span>{" "}
                {sucursalEmpleadoModal.direccion}
              </p>
            )}

            {sucursalEmpleadoModal.latitud &&
              sucursalEmpleadoModal.longitud && (
                <img
                  src={buildStaticMapUrl(
                    sucursalEmpleadoModal.latitud,
                    sucursalEmpleadoModal.longitud,
                    14,
                    "500x250"
                  )}
                  alt="Mapa sucursal"
                  className="rounded-lg border shadow mt-2"
                />
              )}
          </div>
        )}

        {/* ===============================
            HISTORIAL DIA A DIA
        =============================== */}
        <div>
          <h3 className="font-semibold mb-2 text-lg">
            📚 Historial del empleado
          </h3>

          <div className="flex flex-wrap gap-2 mb-3">
            <input
              type="date"
              className="border px-3 py-2 rounded-lg text-sm"
              value={rangoFechas.from}
              onChange={(e) =>
                setRangoFechas((prev) => ({ ...prev, from: e.target.value }))
              }
            />

            <input
              type="date"
              className="border px-3 py-2 rounded-lg text-sm"
              value={rangoFechas.to}
              onChange={(e) =>
                setRangoFechas((prev) => ({ ...prev, to: e.target.value }))
              }
            />

            <button
              className="bg-sky-700 hover:bg-sky-800 text-white px-4 py-2 rounded-lg text-sm"
              onClick={() =>
                fetchAsistenciasRango(
                  selectedEmployee.id,
                  rangoFechas.from,
                  rangoFechas.to
                )
              }
            >
              Consultar
            </button>
          </div>

          <div className="max-h-[350px] overflow-auto border rounded-lg shadow-sm">
            <table className="min-w-full text-sm text-center border-collapse">
              <thead className="bg-gray-100 sticky top-0">
                <tr>
                  <th className="px-3 py-2 border">Fecha</th>
                  <th className="px-3 py-2 border">Entrada</th>
                  <th className="px-3 py-2 border">Salida</th>
                  <th className="px-3 py-2 border">Trabajado</th>
                  <th className="px-3 py-2 border">Atraso</th>
                  <th className="px-3 py-2 border">Salida ant.</th>
                  <th className="px-3 py-2 border">Extra</th>
                  <th className="px-3 py-2 border">Descansos</th>
                  <th className="px-3 py-2 border">Exceso desc.</th>
                  <th className="px-3 py-2 border">Cumplió turno</th>
                  <th className="px-3 py-2 border">Estado</th>
                </tr>
              </thead>

              <tbody>
                {historial.length > 0 ? (
                  historial.map((h, idx) => (
                    <tr key={idx} className="hover:bg-gray-50">
                      <td className="px-3 py-2 border">{h.fecha}</td>

                      <td className="px-3 py-2 border">
                        {formatTime(h.entrada)}
                      </td>

                      <td className="px-3 py-2 border">
                        {formatTime(h.salida)}
                      </td>

                      <td className="px-3 py-2 border">
                        {minToLabel(h.trabajado_min)}
                      </td>

                      <td className="px-3 py-2 border">
                        {h.atraso_min ?? 0}m
                      </td>

                      <td className="px-3 py-2 border">
                        {h.salida_anticipada_min ?? 0}m
                      </td>

                      <td className="px-3 py-2 border">
                        {minToLabel(h.horas_extra_min)}
                      </td>

                      <td className="px-3 py-2 border">
                        {minToLabel(h.descansos_usados_min)}
                      </td>

                      <td className="px-3 py-2 border">
                        {minToLabel(h.exceso_descanso_min)}
                      </td>

                      <td className="px-3 py-2 border">
                        {h.cumplio_turno ? "✅ Sí" : "❌ No"}
                      </td>

                      <td className="px-3 py-2 border">
                        {h.estado_jornada || "—"}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={11}
                      className="py-3 text-gray-500 italic text-center"
                    >
                      No hay registros para este periodo.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AppModal>
  );
}
