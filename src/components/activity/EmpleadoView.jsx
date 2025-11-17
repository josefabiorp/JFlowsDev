import { FaSignInAlt, FaSignOutAlt, FaQrcode } from "react-icons/fa";
import { ResumenJornada } from "./ResumenJornada";

export function EmpleadoView({
  estado,
  resumen,
  onEntrada,
  onSalida,
  showQrScanner,
  toggleQr,
  user,
}) {
  return (
    <div className="bg-white p-6 rounded-xl shadow mb-6 text-center">
      <div className="mb-3">
        <span className="text-sm text-gray-600 capitalize">
          Estado actual: {estado}
        </span>
      </div>

      <div className="flex justify-center gap-4 flex-wrap">
        <button
          onClick={onEntrada}
          disabled={estado !== "sin_entrada"}
          className={`${
            estado !== "sin_entrada"
              ? "bg-gray-300 cursor-not-allowed"
              : "bg-green-600 hover:bg-green-700"
          } text-white px-5 py-3 rounded-xl flex items-center gap-2`}
        >
          <FaSignInAlt /> Entrada
        </button>

        <button
          onClick={onSalida}
          disabled={estado !== "presente"}
          className={`${
            estado !== "presente"
              ? "bg-gray-300 cursor-not-allowed"
              : "bg-red-600 hover:bg-red-700"
          } text-white px-5 py-3 rounded-xl flex items-center gap-2`}
        >
          <FaSignOutAlt /> Salida
        </button>
      </div>

      {resumen && <ResumenJornada resumen={resumen} user={user} />}

      <div className="mt-5 flex justify-center">
        <button
          onClick={toggleQr}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg shadow"
        >
          <FaQrcode /> {showQrScanner ? "Cerrar QR" : "Marcar con QR"}
        </button>
      </div>
    </div>
  );
}
