import React, { useState, useMemo } from "react";
import QrScanner from "react-qr-scanner";
import toast from "react-hot-toast";

import { FaSignInAlt, FaSignOutAlt, FaCoffee, FaQrcode } from "react-icons/fa";

import { API_URL } from "../../config/api";
import { formatTime, minutesToLabel } from "../utils/timeUtils.js";
import { buildStaticMapUrl } from "../utils/mapUtils.js";
import { getWeekRange, getMonthRange, getYearRange } from "../utils/rangoFechasUtils.js";

import { getSucursalName } from "../utils/empleadosUtils";

export function AsistenciaEmpleado({
  user,
  token,
  estadoActual,
  resumenAsistencia,
  resumenAvanzado,
  politicas,
  descansos,
  descansoActivo,
  sucursalEmpleado,
  marcarEntrada,
  marcarSalida,
  iniciarDescanso,
  finalizarDescanso,
  getWeekRange,
  getMonthRange,
  getYearRange,
  cargarReporte,
  setShowReportModal,
}) {


  // ======================================================
  // ESTADOS LOCALES
  // ======================================================
  const [showQrScanner, setShowQrScanner] = useState(false);
  const [busyEntrada, setBusyEntrada] = useState(false);
  const [busySalida, setBusySalida] = useState(false);
  const [busyDescanso, setBusyDescanso] = useState(false);

  // ======================================================
  // SCAN QR
  // ======================================================
  const handleScan = (data) => {
    if (!data) return;
    const scanned = data.text;
    const id = isNaN(Number(scanned)) ? user.id : Number(scanned);

    setBusyEntrada(true);
    marcarEntrada(id).finally(() => setBusyEntrada(false));
    setShowQrScanner(false);
  };

  const handleError = (err) => console.error("QR error:", err);

  // ======================================================
  // RENDER
  // ======================================================
  return (
    <>
      {/* CONTENEDOR PRINCIPAL */}
      <div className="bg-white p-6 rounded-xl shadow mb-6 text-center">
        <div className="mb-3">
          {/* CHOQUE DE ESTADO */}
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

        {/* QR */}
        <div className="mt-5 flex justify-center">
          <button
            onClick={() => setShowQrScanner(!showQrScanner)}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg shadow"
          >
            <FaQrcode />
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
          {/* ENTRADA */}
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

          {/* SALIDA */}
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

            {/* Total simple */}
            {resumenAsistencia.total && (
              <p className="text-green-700 font-bold text-xl mt-3">
                Total (sin política): {resumenAsistencia.total}
              </p>
            )}

            {/* Total avanzado */}
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
                    Total ajustado por política (
                    {resumenAvanzado?.modoRedondeo || "normal"})
                  </span>{" "}
                  {minutesToLabel(resumenAvanzado.totalMinAjustado)}
                </p>
                <p>
                  <span className="font-semibold">Descansos tomados:</span>{" "}
                  {minutesToLabel(resumenAvanzado.minutosDescansoTomados)}
                </p>

                {resumenAvanzado.excesoDescansoMin > 0 && (
                  <p className="text-red-600 font-semibold">
                    Exceso de descansos:{" "}
                    {minutesToLabel(resumenAvanzado.excesoDescansoMin)}
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
            <div className="bg-white rounded-xl shadow-md p-6 text-left border border-gray-200 w-1/2 h-1/2 flex flex-col justify-start overflow-auto">
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

      {/* TABS ASISTENCIA / DESCANSOS */}
      <div className="flex justify-center mb-6 border-b border-gray-300">
        <button className="px-6 py-3 font-semibold border-b-4 border-blue-600 text-blue-600">
          🕒 Asistencia
        </button>

        <button className="px-6 py-3 font-semibold text-gray-500">
          ☕ Descansos
        </button>
      </div>

      {/* DESCANSOS */}
      <div className="space-y-6 text-center">
        <h3 className="text-lg font-semibold text-gray-700">
          Registrar Descanso
        </h3>

        {descansoActivo && (
          <div className="mx-auto max-w-md bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-left">
            <p className="font-semibold text-amber-800">Descanso en curso</p>
            <p className="text-amber-900">
              Tipo: {descansoActivo.tipo} · Inicio: {descansoActivo.hora_inicio}
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

          {/* MÁS TIPOS... */}
        </div>

        {/* LISTA DE DESCANSOS */}
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
                  descansos.slice(0, 20).map((d) => (
                    <tr key={d.id} className="border-t">
                      <td className="px-2 py-1">{d.tipo}</td>
                      <td className="px-2 py-1">{d.hora_inicio}</td>
                      <td className="px-2 py-1">{d.hora_fin || "—"}</td>
                      <td className="px-2 py-1 capitalize">{d.estado}</td>
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
    </>
  );
}
