// src/components/activity/asistencias/DetalleEmpleadoModal.jsx
import React from "react";
import { AppModal } from "../AppModal.jsx";
import { buildStaticMapUrl, formatTime } from "./helpers.js";

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
}) {
  return (
    <AppModal
      isOpen={isOpen && !!selectedEmployee}
      onClose={onClose}
      title={`Asistencia de ${selectedEmployee?.nombre ?? ""}`}
      size="md"
    >
      <div className="space-y-5">
        {/* ESTADO */}
        {modalLoading ? (
          <div className="text-gray-500 text-sm">Cargando…</div>
        ) : (
          <>
            {/* El chip se renderiza desde el padre con EstadoChip */}
            <p className="mt-3 text-sm">
              Entrada:{" "}
              <strong>{formatTime(modalAsistencia?.hora_entrada)}</strong> — Salida:{" "}
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
  );
}
