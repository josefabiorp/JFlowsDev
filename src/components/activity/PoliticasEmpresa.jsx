// src/components/activity/PoliticasEmpresa.jsx
import React, { useEffect, useState } from "react";
import { Header } from "../Header.jsx";
import { Footer } from "../Footer.jsx";
import { Sidebar } from "../Sidebar.jsx";
import { useUser } from "../hooks/UserContext.jsx";
import { useAccountManagement } from "../hooks/useAccountManagement.js";
import { usePoliticas } from "../hooks/usePoliticas.js";

const API_URL = "http://138.197.204.143/api";

export function PoliticasEmpresa() {
  const { user, token } = useUser();
  const { logout } = useAccountManagement();

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
        politica_redondeo_tiempos: politicas.politica_redondeo_tiempos ?? "normal",
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
      // nos aseguramos que números vayan como número
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
        <div className="flex-1 p-6 lg:p-10">
          <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-lg p-6 lg:p-8">
            <h1 className="text-2xl lg:text-3xl font-bold text-sky-900 mb-4">
              Políticas laborales de la empresa
            </h1>
            <p className="text-gray-500 text-sm mb-6">
              Configurá cómo se calculan las jornadas, descansos, almuerzos,
              permisos y horas extra.
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
        </div>
      </div>

      <Footer />
    </>
  );
}
