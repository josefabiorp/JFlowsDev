// src/components/activity/PoliticasEmpresa.jsx
import React, { useEffect, useState, useMemo } from "react";
import { Header } from "../Header.jsx";
import { Footer } from "../Footer.jsx";
import { Sidebar } from "../Sidebar.jsx";

import { useUser } from "../hooks/UserContext.jsx";
import { useAccountManagement } from "../hooks/useAccountManagement.js";
import { usePoliticas } from "../hooks/usePoliticas.js";
import { useAsistencias } from "../hooks/useAsistencia.js";

import { API_URL } from "../../config/api";
import toast from "react-hot-toast";

export function PoliticasEmpresa() {
  const { user, token } = useUser();
  const { logout } = useAccountManagement();

  // ============================
  //  POLÍTICAS GENERALES (BACKEND)
  // ============================
  const {
    politicas,
    loadingPoliticas,
    savingPoliticas,
    fetchPoliticas,
    savePoliticas,
  } = usePoliticas(API_URL, token, user);

  const [form, setForm] = useState(null);

  // 1) Cargar políticas al montar
  useEffect(() => {
    if (token && user?.id) {
      fetchPoliticas();
    }
  }, [token, user, fetchPoliticas]);

  // 2) Sincronizar form cuando lleguen las políticas
  useEffect(() => {
    if (!form && politicas) {
      setForm({
        jornada_diaria_horas: politicas.jornada_diaria_horas ?? 8,
        minutos_tolerancia_atraso: politicas.minutos_tolerancia_atraso ?? 10,
        minutos_tolerancia_salida: politicas.minutos_tolerancia_salida ?? 5,
        minutos_almuerzo: politicas.minutos_almuerzo ?? 60,
        minutos_descanso: politicas.minutos_descanso ?? 10,
        cantidad_descansos_permitidos:
          politicas.cantidad_descansos_permitidos ?? 2,
        permite_acumular_descansos:
          politicas.permite_acumular_descansos ?? false,
        descuenta_permiso_sin_goce:
          politicas.descuenta_permiso_sin_goce ?? true,
        max_horas_extra_por_dia: politicas.max_horas_extra_por_dia ?? 4,
        politica_redondeo_tiempos:
          politicas.politica_redondeo_tiempos ?? "normal",
      });
    }
  }, [politicas, form]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form) return;

    await savePoliticas({
      ...form,
      jornada_diaria_horas: Number(form.jornada_diaria_horas),
      minutos_tolerancia_atraso: Number(form.minutos_tolerancia_atraso),
      minutos_tolerancia_salida: Number(form.minutos_tolerancia_salida),
      minutos_almuerzo: Number(form.minutos_almuerzo),
      minutos_descanso: Number(form.minutos_descanso),
      cantidad_descansos_permitidos: Number(
        form.cantidad_descansos_permitidos
      ),
      max_horas_extra_por_dia: Number(form.max_horas_extra_por_dia),
      permite_acumular_descansos: !!form.permite_acumular_descansos,
      descuenta_permiso_sin_goce: !!form.descuenta_permiso_sin_goce,
    });
  };

  // ============================
  //  EMPLEADOS (para asignar turnos)
  // ============================
  const { empleados, isAdmin } = useAsistencias(API_URL, token, user);

  // ============================
  //  TURNOS LOCALES (SOLO FRONTEND)
  // ============================
  const empresaKey = user?.empresa_id || "global";
  const STORAGE_TURNOS = `turnos_${empresaKey}`;
  const STORAGE_ASIGNACIONES = `asignaciones_turnos_${empresaKey}`;

  const [turnos, setTurnos] = useState([]);
  const [asignaciones, setAsignaciones] = useState({}); // { empleadoId: turnoId }

  const [nuevoTurno, setNuevoTurno] = useState({
    nombre: "",
    hora_inicio: "08:00",
    hora_fin: "16:00",
    tolerancia_atraso: 10,
    tolerancia_salida: 5,
    jornada_horas: 8,
    minutos_almuerzo: 60,
  });

  // Cargar desde localStorage
  useEffect(() => {
    if (!user) return;
    try {
      if (typeof window !== "undefined") {
        const t = window.localStorage.getItem(STORAGE_TURNOS);
        const a = window.localStorage.getItem(STORAGE_ASIGNACIONES);
        if (t) setTurnos(JSON.parse(t));
        if (a) setAsignaciones(JSON.parse(a));
      }
    } catch (err) {
      console.warn("Error cargando turnos locales:", err);
    }
  }, [STORAGE_TURNOS, STORAGE_ASIGNACIONES, user]);

  // Guardar en localStorage cuando cambian
  useEffect(() => {
    try {
      if (typeof window !== "undefined") {
        window.localStorage.setItem(STORAGE_TURNOS, JSON.stringify(turnos));
        window.localStorage.setItem(
          STORAGE_ASIGNACIONES,
          JSON.stringify(asignaciones)
        );
      }
    } catch (err) {
      console.warn("Error guardando turnos locales:", err);
    }
  }, [turnos, asignaciones, STORAGE_TURNOS, STORAGE_ASIGNACIONES]);

  const handleNuevoTurnoChange = (e) => {
    const { name, value } = e.target;
    setNuevoTurno((prev) => ({
      ...prev,
      [name]:
        name === "tolerancia_atraso" ||
        name === "tolerancia_salida" ||
        name === "jornada_horas" ||
        name === "minutos_almuerzo"
          ? Number(value)
          : value,
    }));
  };

  const handleAgregarTurno = (e) => {
    e.preventDefault();
    if (!nuevoTurno.nombre?.trim()) {
      toast.error("El turno necesita un nombre.");
      return;
    }
    const id = Date.now().toString(); // id local
    const turnoNuevo = { ...nuevoTurno, id };
    setTurnos((prev) => [...prev, turnoNuevo]);
    setNuevoTurno((prev) => ({
      ...prev,
      nombre: "",
    }));
    toast.success("Turno agregado (configuración local).");
  };

  const handleEliminarTurno = (id) => {
    setTurnos((prev) => prev.filter((t) => t.id !== id));
    setAsignaciones((prev) => {
      const copia = { ...prev };
      Object.keys(copia).forEach((empId) => {
        if (copia[empId] === id) delete copia[empId];
      });
      return copia;
    });
  };

  const handleAsignacionEmpleado = (empleadoId, turnoId) => {
    setAsignaciones((prev) => ({
      ...prev,
      [empleadoId]: turnoId || null,
    }));
  };

  const empleadosOrdenados = useMemo(() => {
    if (!Array.isArray(empleados)) return [];
    return [...empleados].sort((a, b) =>
      (a.nombre || "").localeCompare(b.nombre || "")
    );
  }, [empleados]);

  if (!user || !token) {
    return <div className="p-8 text-center">Iniciá sesión para continuar.</div>;
  }

  if (!form || loadingPoliticas) {
    return (
      <>
        <Header />
        <div className="flex bg-gray-100 min-h-screen">
          <div className="w-1/4 lg:mr-10">
            <Sidebar logout={logout} />
          </div>
          <div className="flex-1 flex items-center justify-center">
            <p className="text-gray-500">Cargando políticas...</p>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />

      <div className="flex bg-gray-100 min-h-screen">
        {/* SIDEBAR */}
        <div className="w-1/4 lg:mr-10">
          <Sidebar logout={logout} />
        </div>

        {/* CONTENIDO */}
        <div className="flex-1 p-6 lg:p-10 space-y-10">
          {/* ===========================
              BLOQUE: POLÍTICAS GENERALES
              =========================== */}
          <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-lg p-6 lg:p-8">
            <h1 className="text-2xl lg:text-3xl font-bold text-sky-900 mb-4">
              Políticas laborales de la empresa
            </h1>
            <p className="text-gray-500 text-sm mb-6">
              Configurá cómo se calculan las jornadas, descansos, almuerzos,
              permisos y horas extra. Estas políticas se aplican como valor
              <strong> por defecto</strong> para todos los colaboradores.
            </p>

            <form onSubmit={handleSave} className="space-y-6">
              {/* Jornada */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Jornada diaria (horas)
                  </label>
                  <input
                    type="number"
                    name="jornada_diaria_horas"
                    value={form.jornada_diaria_horas}
                    onChange={handleChange}
                    className="mt-1 w-full rounded-lg border-gray-300 shadow-sm px-3 py-2"
                    min="4"
                    max="12"
                  />
                  <p className="text-xs text-gray-400 mt-1">
                    Usado para calcular la jornada objetivo del día.
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Horas extra máximas por día
                  </label>
                  <input
                    type="number"
                    name="max_horas_extra_por_dia"
                    value={form.max_horas_extra_por_dia}
                    onChange={handleChange}
                    className="mt-1 w-full rounded-lg border-gray-300 shadow-sm px-3 py-2"
                    min="0"
                    max="8"
                  />
                  <p className="text-xs text-gray-400 mt-1">
                    Límite de horas extra que se tomarán en cuenta en los
                    reportes.
                  </p>
                </div>
              </div>

              {/* Tolerancias */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Tolerancia de atraso (minutos)
                  </label>
                  <input
                    type="number"
                    name="minutos_tolerancia_atraso"
                    value={form.minutos_tolerancia_atraso}
                    onChange={handleChange}
                    className="mt-1 w-full rounded-lg border-gray-300 shadow-sm px-3 py-2"
                    min="0"
                    max="60"
                  />
                  <p className="text-xs text-gray-400 mt-1">
                    Minutos que se permiten de atraso antes de marcar penalidad.
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Tolerancia al salir (minutos)
                  </label>
                  <input
                    type="number"
                    name="minutos_tolerancia_salida"
                    value={form.minutos_tolerancia_salida}
                    onChange={handleChange}
                    className="mt-1 w-full rounded-lg border-gray-300 shadow-sm px-3 py-2"
                    min="0"
                    max="60"
                  />
                  <p className="text-xs text-gray-400 mt-1">
                    Margen para salidas anticipadas antes de considerarse
                    ausencias parciales.
                  </p>
                </div>
              </div>

              {/* Pausas */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Minutos de almuerzo
                  </label>
                  <input
                    type="number"
                    name="minutos_almuerzo"
                    value={form.minutos_almuerzo}
                    onChange={handleChange}
                    className="mt-1 w-full rounded-lg border-gray-300 shadow-sm px-3 py-2"
                    min="0"
                    max="180"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Minutos por descanso
                  </label>
                  <input
                    type="number"
                    name="minutos_descanso"
                    value={form.minutos_descanso}
                    onChange={handleChange}
                    className="mt-1 w-full rounded-lg border-gray-300 shadow-sm px-3 py-2"
                    min="0"
                    max="60"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Descansos permitidos
                  </label>
                  <input
                    type="number"
                    name="cantidad_descansos_permitidos"
                    value={form.cantidad_descansos_permitidos}
                    onChange={handleChange}
                    className="mt-1 w-full rounded-lg border-gray-300 shadow-sm px-3 py-2"
                    min="0"
                    max="10"
                  />
                </div>
              </div>

              {/* Checkboxes */}
              <div className="space-y-3">
                <label className="inline-flex items-center gap-2">
                  <input
                    type="checkbox"
                    name="permite_acumular_descansos"
                    checked={!!form.permite_acumular_descansos}
                    onChange={handleChange}
                    className="rounded border-gray-300"
                  />
                  <span className="text-sm text-gray-700">
                    Permitir acumular descansos
                  </span>
                </label>

                <label className="inline-flex items-center gap-2">
                  <input
                    type="checkbox"
                    name="descuenta_permiso_sin_goce"
                    checked={!!form.descuenta_permiso_sin_goce}
                    onChange={handleChange}
                    className="rounded border-gray-300"
                  />
                  <span className="text-sm text-gray-700">
                    Descontar tiempo por permisos sin goce
                  </span>
                </label>
              </div>

              {/* Redondeo */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Política de redondeo de tiempos
                </label>
                <select
                  name="politica_redondeo_tiempos"
                  value={form.politica_redondeo_tiempos}
                  onChange={handleChange}
                  className="mt-1 w-full sm:w-1/2 rounded-lg border-gray-300 shadow-sm px-3 py-2"
                >
                  <option value="normal">Normal</option>
                  <option value="arriba">Siempre hacia arriba</option>
                  <option value="abajo">Siempre hacia abajo</option>
                </select>
                <p className="text-xs text-gray-400 mt-1">
                  Esto se aplica cuando se calculan minutos finales trabajados.
                </p>
              </div>

              <div className="pt-4 flex justify-end">
                <button
                  type="submit"
                  disabled={savingPoliticas}
                  className="bg-sky-700 hover:bg-sky-800 text-white px-5 py-2 rounded-xl shadow disabled:opacity-60"
                >
                  {savingPoliticas ? "Guardando..." : "Guardar políticas"}
                </button>
              </div>
            </form>
          </div>

          {/* ===========================
              BLOQUE: TURNOS POR EMPLEADO (LOCAL)
              =========================== */}
          <div className="max-w-5xl mx-auto bg-white rounded-2xl shadow-lg p-6 lg:p-8">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-4">
              <div>
                <h2 className="text-xl lg:text-2xl font-bold text-sky-900">
                  Turnos y horarios por empleado
                </h2>
                <p className="text-gray-500 text-xs mt-1">
                  Aquí podés definir turnos con hora de entrada/salida y
                  asignarlos a cada empleado. Esta configuración es{" "}
                  <strong>local (frontend)</strong> y no modifica todavía tu
                  API, pero podés usarla para ordenar y controlar mejor.
                </p>
              </div>

              {isAdmin === false && (
                <span className="text-xs text-red-500">
                  Solo administradores deberían modificar estos valores.
                </span>
              )}
            </div>

            {/* Crear turno */}
            <div className="border border-gray-200 rounded-xl p-4 mb-6">
              <h3 className="font-semibold text-sm text-gray-800 mb-3">
                Crear nuevo turno
              </h3>

              <form
                className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-4 gap-3"
                onSubmit={handleAgregarTurno}
              >
                <div className="sm:col-span-2">
                  <label className="block text-xs font-medium text-gray-700">
                    Nombre del turno
                  </label>
                  <input
                    type="text"
                    name="nombre"
                    value={nuevoTurno.nombre}
                    onChange={handleNuevoTurnoChange}
                    placeholder="Ej: Mañana 6am, Noche, Oficina 8am"
                    className="mt-1 w-full rounded-lg border-gray-300 shadow-sm px-3 py-2 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700">
                    Hora inicio
                  </label>
                  <input
                    type="time"
                    name="hora_inicio"
                    value={nuevoTurno.hora_inicio}
                    onChange={handleNuevoTurnoChange}
                    className="mt-1 w-full rounded-lg border-gray-300 shadow-sm px-3 py-2 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700">
                    Hora fin
                  </label>
                  <input
                    type="time"
                    name="hora_fin"
                    value={nuevoTurno.hora_fin}
                    onChange={handleNuevoTurnoChange}
                    className="mt-1 w-full rounded-lg border-gray-300 shadow-sm px-3 py-2 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700">
                    Tol. atraso (min)
                  </label>
                  <input
                    type="number"
                    name="tolerancia_atraso"
                    value={nuevoTurno.tolerancia_atraso}
                    onChange={handleNuevoTurnoChange}
                    className="mt-1 w-full rounded-lg border-gray-300 shadow-sm px-3 py-2 text-sm"
                    min="0"
                    max="60"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700">
                    Tol. salida (min)
                  </label>
                  <input
                    type="number"
                    name="tolerancia_salida"
                    value={nuevoTurno.tolerancia_salida}
                    onChange={handleNuevoTurnoChange}
                    className="mt-1 w-full rounded-lg border-gray-300 shadow-sm px-3 py-2 text-sm"
                    min="0"
                    max="60"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700">
                    Jornada (h)
                  </label>
                  <input
                    type="number"
                    name="jornada_horas"
                    value={nuevoTurno.jornada_horas}
                    onChange={handleNuevoTurnoChange}
                    className="mt-1 w-full rounded-lg border-gray-300 shadow-sm px-3 py-2 text-sm"
                    min="4"
                    max="12"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700">
                    Almuerzo (min)
                  </label>
                  <input
                    type="number"
                    name="minutos_almuerzo"
                    value={nuevoTurno.minutos_almuerzo}
                    onChange={handleNuevoTurnoChange}
                    className="mt-1 w-full rounded-lg border-gray-300 shadow-sm px-3 py-2 text-sm"
                    min="0"
                    max="180"
                  />
                </div>

                <div className="sm:col-span-3 md:col-span-1 flex items-end">
                  <button
                    type="submit"
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold px-4 py-2 rounded-xl shadow"
                  >
                    Agregar turno
                  </button>
                </div>
              </form>
            </div>

            {/* Lista de turnos */}
            <div className="mb-6">
              <h3 className="font-semibold text-sm text-gray-800 mb-2">
                Turnos definidos
              </h3>

              {turnos.length === 0 ? (
                <p className="text-xs text-gray-500">
                  Todavía no hay turnos configurados. Creá al menos uno para
                  asignarlo a los empleados.
                </p>
              ) : (
                <div className="border rounded-xl overflow-hidden">
                  <table className="w-full text-xs">
                    <thead className="bg-gray-100">
                      <tr>
                        <th className="px-3 py-2 text-left">Nombre</th>
                        <th className="px-3 py-2 text-left">Horario</th>
                        <th className="px-3 py-2 text-left">Tolerancias</th>
                        <th className="px-3 py-2 text-left">Jornada / Almuerzo</th>
                        <th className="px-3 py-2 text-right">Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {turnos.map((t) => (
                        <tr key={t.id} className="border-t">
                          <td className="px-3 py-2 font-semibold">{t.nombre}</td>
                          <td className="px-3 py-2">
                            {t.hora_inicio} – {t.hora_fin}
                          </td>
                          <td className="px-3 py-2">
                            Atraso: {t.tolerancia_atraso} min <br />
                            Salida: {t.tolerancia_salida} min
                          </td>
                          <td className="px-3 py-2">
                            Jornada: {t.jornada_horas}h <br />
                            Almuerzo: {t.minutos_almuerzo} min
                          </td>
                          <td className="px-3 py-2 text-right">
                            <button
                              onClick={() => handleEliminarTurno(t.id)}
                              className="text-xs text-red-600 hover:text-red-800"
                            >
                              Eliminar
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Asignación por empleado */}
            <div>
              <h3 className="font-semibold text-sm text-gray-800 mb-2">
                Asignar turno a empleados
              </h3>

              {empleadosOrdenados.length === 0 ? (
                <p className="text-xs text-gray-500">
                  No se encontraron empleados para esta empresa.
                </p>
              ) : turnos.length === 0 ? (
                <p className="text-xs text-gray-500">
                  Primero creá uno o más turnos para poder asignarlos.
                </p>
              ) : (
                <div className="border rounded-xl max-h-[380px] overflow-auto">
                  <table className="w-full text-xs">
                    <thead className="bg-gray-100">
                      <tr>
                        <th className="px-3 py-2 text-left">Empleado</th>
                        <th className="px-3 py-2 text-left">Email</th>
                        <th className="px-3 py-2 text-left">Turno asignado</th>
                      </tr>
                    </thead>
                    <tbody>
                      {empleadosOrdenados.map((emp) => (
                        <tr key={emp.id} className="border-t">
                          <td className="px-3 py-2">
                            {emp.nombre}
                            {emp.role && (
                              <span className="ml-1 text-[10px] text-gray-400 uppercase">
                                ({emp.role})
                              </span>
                            )}
                          </td>
                          <td className="px-3 py-2">{emp.email}</td>
                          <td className="px-3 py-2">
                            <select
                              value={asignaciones[emp.id] || ""}
                              onChange={(e) =>
                                handleAsignacionEmpleado(emp.id, e.target.value)
                              }
                              className="w-full rounded-lg border-gray-300 shadow-sm px-2 py-1 text-xs"
                            >
                              <option value="">Usar política general</option>
                              {turnos.map((t) => (
                                <option key={t.id} value={t.id}>
                                  {t.nombre} ({t.hora_inicio}–{t.hora_fin})
                                </option>
                              ))}
                            </select>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              <p className="text-[11px] text-gray-400 mt-2">
                Nota: Por ahora esta asignación se usa solo para organización y
                futuras reglas de asistencia. Se guarda localmente en tu
                navegador (no en la API).
              </p>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </>
  );
}
