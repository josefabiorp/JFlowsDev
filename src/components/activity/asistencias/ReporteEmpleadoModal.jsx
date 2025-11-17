// src/components/activity/asistencias/ReporteEmpleadoModal.jsx
import React from "react";
import { AppModal } from "../AppModal.jsx";
import { formatTime } from "./helpers.js";

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
}) {
  return (
    <AppModal
      isOpen={isOpen}
      onClose={onClose}
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
            Total horas: {reporteResumen.totalHoras}
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
  );
}
