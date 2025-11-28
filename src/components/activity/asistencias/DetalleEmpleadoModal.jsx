// ===============================================================
//   MODAL PROFESIONAL — DETALLE DE EMPLEADO (ADMIN)
//   Con impresión corporativa + fecha elegante
// ===============================================================

import React from "react";
import { AppModal } from "../AppModal.jsx";
import { buildStaticMapUrl } from "./helpers.js";
import { FaPrint } from "react-icons/fa";

// -------------------------------
// FORMATOS CORPORATIVOS
// -------------------------------

const minToLabel = (min) => {
  if (min == null || isNaN(min)) return "—";
  const h = Math.floor(min / 60);
  const m = min % 60;
  return `${h}h ${m}m`;
};

const formatHourReadable = (value) => {
  if (!value) return "—";
  const date = new Date(value);
  if (isNaN(date.getTime())) {
    const [h, m] = value.split(":");
    return new Date(`1970-01-01T${h}:${m}`).toLocaleTimeString("es-CR", {
      hour: "numeric",
      minute: "2-digit",
    });
  }
  return date.toLocaleTimeString("es-CR", {
    hour: "numeric",
    minute: "2-digit",
  });
};

// **📌 NUEVO: fecha corporativa**
const formatFechaCorta = (fechaISO) => {
  if (!fechaISO) return "—";
  const d = new Date(fechaISO);
  return d.toLocaleDateString("es-CR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

// -------------------------------
// IMPRIMIR DETALLE
// -------------------------------
const imprimirDetalle = () => {
  const contenido = document.getElementById("detalle-empleado-print").innerHTML;
  const ventana = window.open("", "_blank", "width=1200,height=800");
  ventana.document.write(`
      <html>
        <head>
          <title>Detalle de empleado</title>
          <style>
            body { font-family: Arial; padding:20px; }
            h1, h2, h3 { font-family: Arial; }
            table { width:100%; border-collapse:collapse; margin-top:20px; }
            th, td { border:1px solid #ccc; padding:8px; }
            th { background:#f2f2f2; }
          </style>
        </head>
        <body>${contenido}</body>
      </html>
  `);
  ventana.document.close();
  ventana.focus();
  ventana.print();
};

export function DetalleEmpleadoModal({
  isOpen,
  onClose,
  selectedEmployee,

  sucursalEmpleadoModal,

  modalLoading,
  modalEstadoActual,
  modalAsistencia,

  rangoFechas,
  setRangoFechas,
  fetchAsistenciasRango,

  historial,
  resumenRango,

  turnoEmpleadoModal,
}) {
  // ============================================================
  // CÁLCULO DEL DÍA — elegir el más preciso
  // ============================================================
  const calculoDelDia = historial?.find(
    (h) => h.fecha === modalAsistencia?.fecha
  );

  const datos =
    calculoDelDia ||
    (modalAsistencia && {
      fecha: modalAsistencia.fecha,
      trabajado_min: modalAsistencia.minutos_trabajados,
      atraso_min: modalAsistencia.minutos_atraso ?? 0,
      salida_anticipada_min: modalAsistencia.minutos_salida_anticipada ?? 0,
      horas_extra_min: modalAsistencia.minutos_horas_extra ?? 0,
      descansos_usados_min: modalAsistencia.minutos_descansos ?? 0,
      exceso_descanso_min: modalAsistencia.minutos_exceso_descanso ?? 0,
      estado_jornada: modalAsistencia.estado_jornada ?? "—",
      cumplio_turno: modalAsistencia.cumplio_turno ?? false,
    });

  return (
    <AppModal
      isOpen={isOpen}
      onClose={onClose}
      title={`📑 Detalle de asistencia — ${selectedEmployee?.nombre || ""}`}
      size="xl"
    >

      {/* ----------------- BOTÓN IMPRIMIR ----------------- */}
      <div className="flex justify-end mb-3">
        <button
          onClick={imprimirDetalle}
          className="bg-gray-700 hover:bg-gray-800 text-white px-4 py-2 rounded-lg flex items-center gap-2 text-sm shadow"
        >
          <FaPrint /> Imprimir detalle
        </button>
      </div>

      {/* TODO LO QUE SE IMPRIME VA AQUÍ */}
      <div id="detalle-empleado-print">
        <div className="space-y-6">

          {/* ====================================================
              PANEL DEL DÍA
          ==================================================== */}
          {modalLoading ? (
            <div className="text-gray-500 text-sm">Cargando datos…</div>
          ) : (
            <div className="bg-gray-50 border p-4 rounded-xl shadow-sm text-sm">
              <h3 className="font-bold text-lg mb-3 text-sky-800">
                📅 Jornada de hoy
              </h3>

              <div className="grid sm:grid-cols-3 gap-y-1">
                <p>
                  <span className="font-semibold">Estado:</span>{" "}
                  {modalEstadoActual}
                </p>

                <p>
                  <span className="font-semibold">Entrada:</span>{" "}
                  {formatHourReadable(modalAsistencia?.hora_entrada)}
                </p>

                <p>
                  <span className="font-semibold">Salida:</span>{" "}
                  {formatHourReadable(modalAsistencia?.hora_salida)}
                </p>
              </div>

              {/* TURNO */}
              {turnoEmpleadoModal && (
                <div className="mt-3 bg-blue-50 border border-blue-200 p-3 rounded-lg">
                  <h4 className="text-blue-800 font-bold text-md mb-2">
                    📌 Turno asignado
                  </h4>

                  <div className="grid sm:grid-cols-2 gap-y-1">
                    <p>
                      <span className="font-semibold">Turno:</span>{" "}
                      {turnoEmpleadoModal.nombre}
                    </p>

                    <p>
                      <span className="font-semibold">Horario:</span>{" "}
                      {formatHourReadable(turnoEmpleadoModal.hora_inicio)} –{" "}
                      {formatHourReadable(turnoEmpleadoModal.hora_fin)}
                    </p>

                    <p>
                      <span className="font-semibold">Tolerancias:</span>{" "}
                      {turnoEmpleadoModal.tolerancia_entrada}m entrada /{" "}
                      {turnoEmpleadoModal.tolerancia_salida}m salida
                    </p>

                    <p>
                      <span className="font-semibold">Almuerzo:</span>{" "}
                      {minToLabel(turnoEmpleadoModal.minutos_almuerzo)}
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ====================================================
              RESULTADO DE LA JORNADA
          ==================================================== */}
          {datos && (
            <div className="bg-white border p-4 rounded-xl shadow-sm text-sm">
              <h3 className="font-bold text-lg text-gray-800 mb-3">
                ⭐ Resultado de la jornada
              </h3>

              <div className="grid sm:grid-cols-3 gap-y-1">
                <p>
                  <span className="font-semibold">Trabajado:</span>{" "}
                  {minToLabel(datos.trabajado_min)}
                </p>

                <p>
                  <span className="font-semibold">Atraso:</span>{" "}
                  {minToLabel(datos.atraso_min)}
                </p>

                <p>
                  <span className="font-semibold">Salida anticipada:</span>{" "}
                  {minToLabel(datos.salida_anticipada_min)}
                </p>

                <p>
                  <span className="font-semibold">Horas extra:</span>{" "}
                  {minToLabel(datos.horas_extra_min)}
                </p>

                <p>
                  <span className="font-semibold">Descansos usados:</span>{" "}
                  {minToLabel(datos.descansos_usados_min)}
                </p>

                <p>
                  <span className="font-semibold">Exceso descanso:</span>{" "}
                  {minToLabel(datos.exceso_descanso_min)}
                </p>

                <p className="col-span-3 mt-2">
                  <span className="font-semibold">Estado jornada:</span>{" "}
                  {datos.estado_jornada}
                </p>

                <p className="col-span-3 flex items-center gap-2 mt-1">
                  <span className="font-semibold">Cumplió turno:</span>
                  {datos.cumplio_turno ? "🟢 Sí" : "🔴 No"}
                </p>
              </div>
            </div>
          )}

          {/* ====================================================
              SUCURSAL
          ==================================================== */}
          {sucursalEmpleadoModal && (
            <div className="border p-3 rounded-xl shadow-sm text-sm">
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
                    className="rounded-lg border shadow mt-2"
                    alt="Mapa sucursal"
                  />
                )}
            </div>
          )}

          {/* ====================================================
              HISTORIAL
          ==================================================== */}
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
                    <th className="px-3 py-2 border">Cumplió</th>
                    <th className="px-3 py-2 border">Estado</th>
                  </tr>
                </thead>

                <tbody>
                  {historial.length ? (
                    historial.map((h, idx) => (
                      <tr key={idx} className="hover:bg-gray-50">
                        <td className="px-3 py-2 border">
                          {formatFechaCorta(h.fecha)}
                        </td>

                        <td className="px-3 py-2 border">
                          {formatHourReadable(h.entrada)}
                        </td>

                        <td className="px-3 py-2 border">
                          {formatHourReadable(h.salida)}
                        </td>

                        <td className="px-3 py-2 border">
                          {minToLabel(h.trabajado_min)}
                        </td>

                        <td className="px-3 py-2 border">
                          {minToLabel(h.atraso_min)}
                        </td>

                        <td className="px-3 py-2 border">
                          {minToLabel(h.salida_anticipada_min)}
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
                          {h.cumplio_turno ? "🟢 Sí" : "🔴 No"}
                        </td>

                        <td className="px-3 py-2 border">{h.estado_jornada}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={11} className="py-3 text-gray-500 italic">
                        No hay registros para este periodo.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      </div>
    </AppModal>
  );
}
