export function ResumenJornada({ resumen, user }) {
  if (!resumen) return null;

  return (
    <div className="mt-6 bg-white rounded-xl shadow-md p-6 text-center border border-gray-200">
      <h2 className="text-2xl font-bold text-sky-800 mb-3">Resumen de tu jornada</h2>
      <p className="text-gray-700 text-lg">
        Trabajaste de <strong>{resumen.e}</strong> a <strong>{resumen.s}</strong>.
      </p>
      <p className="text-green-700 font-bold text-xl mt-3">Total: {resumen.total}</p>
      <p className="text-gray-500 mt-2 text-sm">
        ¡Buen trabajo hoy, {user?.nombre || "empleado"}! 👏
      </p>
    </div>
  );
}
