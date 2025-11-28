import React, { useState, useEffect } from "react";
import toast from "react-hot-toast";

import { FaSignInAlt, FaSignOutAlt } from "react-icons/fa";

import { API_URL } from "../../config/api";
import { minutesToLabel } from "../utils/timeUtils.js";
import { buildStaticMapUrl } from "../utils/mapUtils.js";

import { useAsignacionTurnos } from "../hooks/useAsignacionTurnos.js";

// ======================================================
// Formateo corporativo de horas
// ======================================================
const formatHour = (value) => {
  if (!value) return "—";
  if (/^\d{2}:\d{2}/.test(value)) {
    const [h, m] = value.split(":");
    const date = new Date();
    date.setHours(h, m);
    return date.toLocaleTimeString("es-CR", {
      hour: "numeric",
      minute: "2-digit",
    });
  }
  const d = new Date(value);
  if (isNaN(d)) return value;
  return d.toLocaleTimeString("es-CR", {
    hour: "numeric",
    minute: "2-digit",
  });
};

export function AsistenciaEmpleado({
  user,
  token,
  estadoActual,
  resumenAsistencia,
  resumenAvanzado,
  politicas,
  sucursalEmpleado,
  marcarEntrada,
  marcarSalida,
  getWeekRange,
  getMonthRange,
  getYearRange,
  cargarReporte,
  setShowReportModal,
  turnoEmpleadoModal,
}) {
  // ======================================================
  // ESTADOS LOCALES
  // ======================================================
  const [busyEntrada, setBusyEntrada] = useState(false);
  const [busySalida, setBusySalida] = useState(false);

  // ======================================================
  // TURNO ASIGNADO
  // ======================================================
  const { obtenerTurnoEmpleado } = useAsignacionTurnos(API_URL, token, user);
  const [turnoEmpleado, setTurnoEmpleado] = useState(null);

  useEffect(() => {
    if (!user?.id) return;
    obtenerTurnoEmpleado(user.id)
      .then((t) => setTurnoEmpleado(t))
      .catch(() => setTurnoEmpleado(null));
  }, [user?.id]);

  // ======================================================
  // RENDER
  // ======================================================
  return (
    <>
      <div className="bg-white p-6 rounded-xl shadow mb-6 text-center">
        
        {/* ESTADO */}
        <div className="mb-3">
          <span
            className={`inline-flex items-center gap-2 text-xs font-medium border px-2.5 py-1 rounded-full ${
              estadoActual === "presente"
                ? "bg-green-50 text-green-700 border-green-200"
                : estadoActual === "fuera"
                ? "bg-red-50 text-red-700 border-red-200"
                : "bg-gray-50 text-gray-700 border-gray-200"
            }`}
          >
            {estadoActual === "presente"
              ? "🟢 Presente"
              : estadoActual === "fuera"
              ? "🔴 Fuera"
              : "⚪ Sin entrada"}
          </span>
        </div>

        {/* TURNO DEL EMPLEADO */}
        {turnoEmpleado && (
          <div className="mt-4 bg-blue-50 border border-blue-200 rounded-xl p-4 text-sm text-left mx-auto max-w-md shadow">
            <h3 className="text-blue-800 font-bold text-lg mb-2">
              📌 Tu turno asignado
            </h3>

            <p><strong>Nombre:</strong> {turnoEmpleado.nombre}</p>

            <p>
              <strong>Horario:</strong>{" "}
              {formatHour(turnoEmpleado.hora_inicio)} – {formatHour(turnoEmpleado.hora_fin)}
            </p>

            <p className="mt-2">
              <strong>Tolerancia entrada:</strong> {turnoEmpleado.tolerancia_entrada} min
            </p>
            <p>
              <strong>Tolerancia salida:</strong> {turnoEmpleado.tolerancia_salida} min
            </p>

            <p className="mt-2">
              <strong>Almuerzo:</strong> {turnoEmpleado.minutos_almuerzo} min
            </p>
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

        {/* RESUMEN ASISTENCIA */}
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

            {resumenAvanzado && resumenAvanzado.totalMin != null && (
              <div className="mt-4 text-sm text-left bg-sky-50 border border-sky-100 rounded-xl p-4">

                <p>
                  <span className="font-semibold">Total trabajado:</span>{" "}
                  {minutesToLabel(resumenAvanzado.totalMin)}
                </p>

                <p>
                  <span className="font-semibold">Jornada objetivo:</span>{" "}
                  {minutesToLabel(resumenAvanzado.jornadaMin)}
                </p>

                <p>
                  <span className="font-semibold">
                    Total ajustado por política ({resumenAvanzado?.modoRedondeo || "normal"})
                  </span>{" "}
                  {minutesToLabel(resumenAvanzado.totalMinAjustado)}
                </p>
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

        {/* BOTÓN REPORTES */}
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
            <div className="bg-white rounded-xl shadow-md p-6 text-left border border-gray-200 w-1/2 flex flex-col justify-start overflow-auto">
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
    </>
  );
}
