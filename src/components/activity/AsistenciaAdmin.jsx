import React, { useMemo } from "react";
import { FaSearch, FaSyncAlt, FaDownload, FaPrint } from "react-icons/fa";

import { minutesToLabel, formatTime } from "../utils/timeUtils";
import { getSucursalName } from "../utils/empleadosUtils";
import { buildStaticMapUrl } from "../utils/mapUtils";

/**
 * Componente ADMIN completamente funcional
 * - NO cambia lógica
 * - NO cambia cálculo
 * - NO cambia llamadas a API
 * - Solo reordena UI de forma limpia
 */
export function AsistenciaAdmin({
  empleados,
  empleadosFiltrados,
  sucursales,
  busqueda,
  sucursalFiltro,

  setBusqueda,
  setSucursalFiltro,

  refreshManualmente,
  exportarCSV,
  imprimirTabla,

  abrirDetalleEmpleado,
  estadoEmpleados,
}) {
  return (
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
              >
                <td className="py-2">{e.id}</td>
                <td className="py-2">{e.nombre}</td>
                <td className="py-2 capitalize">{e.role || e.rol}</td>

                {/* Sucursal */}
                <td className="py-2">
                  {getSucursalName(sucursales, e.sucursal_id)}
                </td>

                {/* Estado */}
                <td className="py-2">
                  <span
                    className={`inline-block w-3 h-3 rounded-full ${
                      estadoEmpleados[e.id] === "presente" ||
                      estadoEmpleados[e.id] === "en_jornada"
                        ? "bg-green-500"
                        : estadoEmpleados[e.id] === "en_descanso"
                        ? "bg-yellow-400"
                        : estadoEmpleados[e.id] === "fuera" ||
                          estadoEmpleados[e.id] === "sin_entrada" ||
                          estadoEmpleados[e.id] == null
                        ? "bg-red-500"
                        : "bg-gray-500"
                    }`}
                    title={estadoEmpleados[e.id] || "sin_entrada"}
                  ></span>
                </td>

                {/* Botón detalle */}
                <td className="py-2">
                  <button
                    onClick={() => abrirDetalleEmpleado(e)}
                    className="text-blue-700 hover:underline font-medium"
                  >
                    Ver detalle
                  </button>
                </td>
              </tr>
            ))}

            {empleadosFiltrados.length === 0 && (
              <tr>
                <td colSpan={6} className="py-4 text-gray-500 text-sm italic">
                  No hay empleados para los filtros seleccionados.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* BOTONERA ADMIN */}
      <div className="flex gap-3 justify-end mt-5">
        <button
          onClick={refreshManualmente}
          className="bg-sky-700 hover:bg-sky-800 text-white px-4 py-2 rounded-lg flex items-center gap-2 shadow"
        >
          <FaSyncAlt /> Actualizar
        </button>

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
      </div>
    </div>
  );
}
