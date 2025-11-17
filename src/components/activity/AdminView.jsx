import { FaSearch } from "react-icons/fa";

export function AdminView({ empleados, onDetalle }) {
  return (
    <div className="bg-white rounded-xl shadow p-6">
      <div className="flex items-center gap-3 mb-4">
        <FaSearch className="text-gray-400" />
        <input
          type="text"
          placeholder="Buscar empleado..."
          className="border rounded-xl px-4 py-2 w-full focus:ring-2 focus:ring-sky-500"
        />
      </div>
      <div className="overflow-auto">
        <table className="min-w-full text-center border border-gray-200">
          <thead className="bg-gray-100">
            <tr>
              <th>ID</th><th>Nombre</th><th>Rol</th><th>Sucursal</th><th>Detalle</th>
            </tr>
          </thead>
          <tbody>
            {empleados.map((e) => (
              <tr key={e.id} className="hover:bg-gray-50">
                <td>{e.id}</td>
                <td>{e.nombre}</td>
                <td>{e.role}</td>
                <td>{e.sucursal_id}</td>
                <td>
                  <button onClick={() => onDetalle(e)} className="text-blue-700 hover:underline">
                    Ver detalle
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
