import { FaSyncAlt, FaDownload, FaPrint } from "react-icons/fa";

export const ToolbarAsistencias = ({ lastUpdated, isAdmin, onRefresh, onExport, onPrint }) => (
  <div className="flex flex-col sm:flex-row justify-between items-center mb-5 gap-3">
    <span className="text-sm text-gray-500">
      Última actualización: <strong>{lastUpdated ? lastUpdated.toLocaleTimeString() : "—"}</strong>
    </span>
    <div className="flex gap-2">
      <button onClick={onRefresh} className="bg-sky-700 hover:bg-sky-800 text-white px-4 py-2 rounded-lg flex items-center gap-2 shadow">
        <FaSyncAlt /> Actualizar
      </button>
      {isAdmin && (
        <>
          <button onClick={onExport} className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg flex items-center gap-2">
            <FaDownload /> CSV
          </button>
          <button onClick={onPrint} className="bg-gray-700 hover:bg-gray-800 text-white px-4 py-2 rounded-lg flex items-center gap-2">
            <FaPrint /> Imprimir
          </button>
        </>
      )}
    </div>
  </div>
);
