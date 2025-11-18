import { FaSearch } from "react-icons/fa";

export function AdminView({ empleados, onDetalle }) {

  // Función para obtener color + etiqueta del estado
  const getEstadoColor = (estado) => {
    switch (estado) {
      case "presente":
      case "en_jornada":
        return { color: "bg-green-500", label: "En jornada" };

      case "en_descanso":
        return { color: "bg-yellow-400", label: "En descanso" };

      case "fuera":
      case "sin_entrada":
      case null:
        return { color: "bg-red-500", label: "Fuera" };

      case "finalizado":
        return { color: "bg-gray-500", label: "Finalizado" };

      default:
        return { color: "bg-gray-500", label: "Desconocido" };
    }
  };

  return (
    <div className="bg-white rounded-xl shadow p-6">
      {/* Buscador */}
      <div className="flex items-center gap-3 mb-4">
        <FaSearch className="text-gray-400" />
        <input
          type="text"
          placeholder="Buscar empleado..."
          className="border rounded-xl px-4 py-2 w-full focus:ring-2 focus:ring-sky-500"
        />
      </div>

      {/* Tabla */}
      <div className="overflow-auto">
        <table className="min-w-full text-center border border-gray-200">
          
          {/* ENCABEZADO */}
          <thead className="bg-gray-100">
            <tr>
              <th className="px-3 py-2">ID</th>
              <th className="px-3 py-2">Nombre</th>
              <th className="px-3 py-2">Rol</th>
              <th className="px-3 py-2">Sucursal</th>
              <th className="px-3 py-2">Estado</th> {/* Nueva columna */}
              <th className="px-3 py-2">Detalle</th>
            </tr>
          </thead>

          {/* CUERPO */}
          <tbody>
            {empleados.map((e) => {
              const estadoVisual = getEstadoColor(e.estado_actual);

              return (
                <tr key={e.id} className="hover:bg-gray-50 transition">
                  <td className="py-2">{e.id}</td>
                  <td className="py-2">{e.nombre}</td>
                  <td className="py-2 capitalize">{e.role || e.rol}</td>
                  <td className="py-2">{e.sucursal_id}</td>

                  {/* 🔵 Estado (bolita + etiqueta responsiva) */}
                  <td className="py-2">
                    <div className="flex justify-center items-center gap-2">
                      <span
                        className={`w-3 h-3 rounded-full ${estadoVisual.color}`}
                      ></span>

                      {/* Texto solo en pantallas grandes */}
                      <span className="text-sm text-gray-600 hidden lg:inline">
                        {estadoVisual.label}
                      </span>
                    </div>
                  </td>

                  {/* Botón Ver detalle */}
                  <td className="py-2">
                    <button
                      onClick={() => onDetalle(e)}
                      className="text-blue-700 hover:underline font-medium"
                    >
                      Ver detalle
                    </button>
                  </td>
                </tr>
              );
            })}

            {/* SIN EMPLEADOS */}
            {empleados.length === 0 && (
              <tr>
                <td
                  colSpan={6}
                  className="py-4 text-gray-500 text-sm italic"
                >
                  No hay empleados disponibles.
                </td>
              </tr>
            )}

          </tbody>

        </table>
      </div>
    </div>
  );
}
