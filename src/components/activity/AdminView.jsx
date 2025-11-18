import { FaSearch } from "react-icons/fa";

export function AdminView({ empleados, onDetalle }) {

  // Función para obtener estado visual
  const getEstadoColor = (estado) => {
    switch (estado) {
      case "sin_entrada":
      case null:
        return { color: "bg-red-500", label: "Fuera" };
      case "en_jornada":
        return { color: "bg-green-500", label: "En jornada" };
      case "en_descanso":
        return { color: "bg-yellow-400", label: "En descanso" };
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
          <thead className="bg-gray-100">
            <tr>
              <th>ID</th>
              <th>Nombre</th>
              <th>Rol</th>
              <th>Sucursal</th>
              <th>Estado</th>
              <th>Detalle</th>
            </tr>
          </thead>

          <tbody>
            {empleados.map((e) => {
              const estado = getEstadoColor(e.estado_actual);

              return (
                <tr key={e.id} className="hover:bg-gray-50">
                  <td>{e.id}</td>
                  <td>{e.nombre}</td>
                  <td>{e.role}</td>
                  <td>{e.sucursal_id}</td>

                  {/* 🔵 Bolita de estado */}
                  <td>
                    <div className="flex justify-center items-center gap-2">
                      <span
                        className={`w-3 h-3 rounded-full ${estado.color}`}
                      ></span>
                      <span className="text-sm text-gray-600 hidden lg:inline">
                        {estado.label}
                      </span>
                    </div>
                  </td>

                  {/* Botón de detalle */}
                  <td>
                    <button
                      onClick={() => onDetalle(e)}
                      className="text-blue-700 hover:underline"
                    >
                      Ver detalle
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>

        </table>
      </div>
    </div>
  );
}
