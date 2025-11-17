// -----------------------------------------------------------
// MANTENIMIENTO EMPRESAS — VERSIÓN EMPRESARIAL COMPLETA
// Con:
// ✔ Upload de logo + preview
// ✔ Provincias, Cantones y Distritos dinámicos (API Costa Rica)
// ✔ UI corporativa igual a Settings
// ✔ Placeholders limpios y accesibles
// ✔ Lógica original intacta
// -----------------------------------------------------------

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import { Header } from "../Header.jsx";
import { Footer } from "../Footer.jsx";
import { Sidebar } from "../Sidebar.jsx";
import { useAccountManagement } from "../hooks/useAccountManagement.js";
import { useUser } from "../hooks/UserContext.jsx";

import { motion } from "framer-motion";
import "../../index.css";

export function MantenimientoEmpresas() {
  const navigate = useNavigate();
  const { logout } = useAccountManagement();
  const { user } = useUser();

  // FORM STATES
  const [nombre, setNombre] = useState("");
  const [telefono, setTelefono] = useState("");
  const [correo, setCorreo] = useState("");
  const [cedula_empresa, setCedula_empresa] = useState("");
  const [codigo_actividad, setCodigo_actividad] = useState("");

  const [provincia, setProvincia] = useState("");
  const [canton, setCanton] = useState("");
  const [distrito, setDistrito] = useState("");

  const [descripcion, setDescripcion] = useState("");
  const [otrasSenas, setOtrasSenas] = useState("");

  const [empresa, setEmpresa] = useState("juridica");
  const [empresas, setEmpresas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingEmpresa, setEditingEmpresa] = useState(null);

  // HACIENDA VALIDATION
  const [cedulaEmpresaStatus, setCedulaEmpresaStatus] = useState(null);
  const [isValidatingCedula, setIsValidatingCedula] = useState(false);

  // LOGO
  const [logo, setLogo] = useState(null);
  const [logoPreview, setLogoPreview] = useState(null);

  // COSTA RICA DATA
  const [provincias, setProvincias] = useState([]);
  const [cantones, setCantones] = useState([]);
  const [distritos, setDistritos] = useState([]);

  // -----------------------------------------------------------
  // FETCH EMPRESAS
  // -----------------------------------------------------------
  const fetchEmpresas = () => {
    fetch("http://138.197.204.143/api/empresas")
      .then((res) => res.json())
      .then((data) => {
        setEmpresas(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    fetchEmpresas();
  }, []);

  // -----------------------------------------------------------
  // FETCH UBICACIONES DE COSTA RICA
  // -----------------------------------------------------------
  useEffect(() => {
    fetch("https://ubicaciones.paginasweb.cr/provincias.json")
      .then((res) => res.json())
      .then((data) => {
        const arr = Object.entries(data).map(([id, nombre]) => ({ id, nombre }));
        setProvincias(arr);
      });
  }, []);

  useEffect(() => {
    if (!provincia) return;
    fetch(`https://ubicaciones.paginasweb.cr/provincia/${provincia}/cantones.json`)
      .then((res) => res.json())
      .then((data) => {
        const arr = Object.entries(data).map(([id, nombre]) => ({ id, nombre }));
        setCantones(arr);
        setCanton("");
        setDistrito("");
      });
  }, [provincia]);

  useEffect(() => {
    if (!provincia || !canton) return;
    fetch(
      `https://ubicaciones.paginasweb.cr/provincia/${provincia}/canton/${canton}/distritos.json`
    )
      .then((res) => res.json())
      .then((data) => {
        const arr = Object.entries(data).map(([id, nombre]) => ({ id, nombre }));
        setDistritos(arr);
        setDistrito("");
      });
  }, [canton]);

  // -----------------------------------------------------------
  // VALIDACIÓN HACIENDA (CÉDULA)
  // -----------------------------------------------------------
  const verificarCedulaEmpresa = async () => {
    const esFisica = empresa === "fisica";
    const esJuridica = empresa === "juridica";

    if (
      (esFisica && cedula_empresa.length !== 9) ||
      (esJuridica && cedula_empresa.length !== 10)
    ) {
      setCedulaEmpresaStatus(null);
      return;
    }

    setIsValidatingCedula(true);

    try {
      const res = await fetch(
        `https://api.hacienda.go.cr/fe/ae?identificacion=${cedula_empresa}`
      );
      const data = await res.json();
      const estado = data.situacion.estado.toLowerCase();

      if (estado === "inscrito") setCedulaEmpresaStatus("inscrito");
      else setCedulaEmpresaStatus("no inscrito");

      const actividadPrincipal = data.actividades[0];
      setNombre(data.nombre);
      setDescripcion(actividadPrincipal.descripcion);
      setCodigo_actividad(actividadPrincipal.codigo);
    } catch {
      setCedulaEmpresaStatus(null);
    } finally {
      setIsValidatingCedula(false);
    }
  };

  // -----------------------------------------------------------
  // LOGO FILE HANDLER
  // -----------------------------------------------------------
  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setLogo(file);
    setLogoPreview(URL.createObjectURL(file));
  };

  // -----------------------------------------------------------
  // CREATE EMPRESA (POST)
  // -----------------------------------------------------------
  const handleSubmit = (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append("nombre", nombre);
    formData.append("telefono", telefono);
    formData.append("correo", correo);
    formData.append("cedula_empresa", cedula_empresa);
    formData.append("provincia", provincia);
    formData.append("canton", canton);
    formData.append("distrito", distrito);
    formData.append("descripcion", descripcion);
    formData.append("otras_senas", otrasSenas);
    formData.append("codigo_actividad", codigo_actividad);
    formData.append("empresa", empresa);

    if (logo) formData.append("logo", logo);

    fetch("http://138.197.204.143/api/empresas", {
      method: "POST",
      body: formData,
    })
      .then((res) => res.json())
      .then(() => {
        fetchEmpresas();
        resetForm();
      });
  };

  // -----------------------------------------------------------
  // EDIT LOAD
  // -----------------------------------------------------------
  const handleEdit = (emp) => {
    setNombre(emp.nombre);
    setTelefono(emp.telefono);
    setCorreo(emp.correo);
    setCedula_empresa(emp.cedula_empresa);
    setCodigo_actividad(emp.codigo_actividad);
    setProvincia(emp.provincia);
    setCanton(emp.canton);
    setDistrito(emp.distrito);
    setOtrasSenas(emp.otras_senas);
    setEmpresa(emp.tipo_empresa);
    setDescripcion(emp.descripcion);
    setEditingEmpresa(emp.id);

    // Cargar logo previo
    if (emp.logo_url) setLogoPreview(emp.logo_url);
  };

  // -----------------------------------------------------------
  // UPDATE EMPRESA (PUT)
  // -----------------------------------------------------------
  const handleUpdate = (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append("nombre", nombre);
    formData.append("telefono", telefono);
    formData.append("correo", correo);
    formData.append("cedula_empresa", cedula_empresa);
    formData.append("provincia", provincia);
    formData.append("canton", canton);
    formData.append("distrito", distrito);
    formData.append("descripcion", descripcion);
    formData.append("otras_senas", otrasSenas);
    formData.append("codigo_actividad", codigo_actividad);
    formData.append("empresa", empresa);

    if (logo) formData.append("logo", logo);

    fetch(
      `http://138.197.204.143/api/empresas/${editingEmpresa}`,
      {
        method: "POST",
        headers: {
          "X-HTTP-Method-Override": "PUT",
        },
        body: formData,
      }
    )
      .then((res) => res.json())
      .then(() => {
        fetchEmpresas();
        resetForm();
      });
  };

  // -----------------------------------------------------------
  // DELETE
  // -----------------------------------------------------------
  const handleDelete = (id) => {
    fetch(`http://138.197.204.143/api/empresas/${id}`, {
      method: "DELETE",
    }).then(fetchEmpresas);
  };

  // -----------------------------------------------------------
  // RESET FORM
  // -----------------------------------------------------------
  const resetForm = () => {
    setNombre("");
    setTelefono("");
    setCorreo("");
    setCedula_empresa("");
    setCodigo_actividad("");
    setProvincia("");
    setCanton("");
    setDistrito("");
    setDescripcion("");
    setOtrasSenas("");
    setEmpresa("juridica");
    setEditingEmpresa(null);
    setLogo(null);
    setLogoPreview(null);
  };

  // -----------------------------------------------------------
  // UI
  // -----------------------------------------------------------
  if (loading)
    return (
      <>
        <Header />
        <div className="min-h-screen bg-slate-100 grid place-items-center text-slate-600">
          Cargando empresas...
        </div>
        <Footer />
      </>
    );

  return (
    <>
      <Header />

      <div className="min-h-screen bg-slate-100 flex">
        <aside className="w-full lg:w-1/4 shrink-0">
          <Sidebar logout={logout} />
        </aside>

        <main className="flex-1 p-4 lg:p-8">
          <div className="max-w-7xl mx-auto grid gap-6 lg:grid-cols-12">
            {/* FORM */}
            <section className="lg:col-span-5">
              <Card>
                <div className="flex items-center justify-between mb-2">
                  <h1 className="text-xl lg:text-2xl font-bold text-slate-900">
                    {editingEmpresa ? "Editar empresa" : "Registrar empresa"}
                  </h1>
                </div>

                <form
                  onSubmit={editingEmpresa ? handleUpdate : handleSubmit}
                  className="mt-4 space-y-4"
                >
                  {/* LOGO PREVIEW */}
                  <Field label="Logo de la empresa (opcional)">
                    <div className="flex items-center gap-4">
                      <div className="w-24 h-24 rounded-xl bg-slate-200 overflow-hidden flex items-center justify-center">
                        {logoPreview ? (
                          <img
                            src={logoPreview}
                            alt="Logo"
                            className="object-cover w-full h-full"
                          />
                        ) : (
                          <span className="text-xs text-slate-500">
                            Sin logo
                          </span>
                        )}
                      </div>

                      <input
                        type="file"
                        accept="image/*"
                        className="input"
                        onChange={handleLogoChange}
                      />
                    </div>
                  </Field>

                  <Field label="Nombre">
                    <input
                      type="text"
                      placeholder="Ej: Smart Exteriors Costa Rica"
                      className="input"
                      value={nombre}
                      onChange={(e) => setNombre(e.target.value)}
                      required
                    />
                  </Field>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Field label="Teléfono">
                      <input
                        type="text"
                        placeholder="Ej: 8888-8888"
                        className="input"
                        value={telefono}
                        onChange={(e) => setTelefono(e.target.value)}
                        required
                      />
                    </Field>

                    <Field label="Correo">
                      <input
                        type="email"
                        placeholder="empresa@correo.com"
                        className="input"
                        value={correo}
                        onChange={(e) => setCorreo(e.target.value)}
                        required
                      />
                    </Field>
                  </div>

                  <Field label="Tipo de empresa">
                    <select
                      className="input"
                      value={empresa}
                      onChange={(e) => setEmpresa(e.target.value)}
                    >
                      <option value="fisica">Física</option>
                      <option value="juridica">Jurídica</option>
                      <option value="extranjera">Extranjera</option>
                    </select>
                  </Field>

                  {/* CEDULA + VALIDAR */}
                  <Field label="Cédula de empresa">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Ej: 3101123456"
                        className={`input ${
                          cedulaEmpresaStatus === "inscrito"
                            ? "border-cyan-600"
                            : cedulaEmpresaStatus === "no inscrito"
                            ? "border-pink-700"
                            : ""
                        }`}
                        value={cedula_empresa}
                        onChange={(e) => setCedula_empresa(e.target.value)}
                        required
                      />

                      <button
                        type="button"
                        onClick={verificarCedulaEmpresa}
                        className="btn-ghost text-xs px-3 py-1.5"
                        disabled={isValidatingCedula}
                      >
                        {isValidatingCedula ? "..." : "Validar"}
                      </button>
                    </div>

                    {cedulaEmpresaStatus === "inscrito" && (
                      <span className="text-xs text-cyan-700">✔ Valida</span>
                    )}
                    {cedulaEmpresaStatus === "no inscrito" && (
                      <span className="text-xs text-pink-700">
                        ❌ No inscrita en Hacienda
                      </span>
                    )}
                  </Field>

                  <Field label="Código de actividad">
                    <input
                      type="text"
                      placeholder="Ej: 62010"
                      className="input"
                      value={codigo_actividad}
                      onChange={(e) => setCodigo_actividad(e.target.value)}
                      required
                    />
                  </Field>

                  {/* UBICACIÓN COSTA RICA */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Field label="Provincia">
                      <select
                        className="input"
                        value={provincia}
                        onChange={(e) => setProvincia(e.target.value)}
                        required
                      >
                        <option value="">Seleccione</option>
                        {provincias.map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.nombre}
                          </option>
                        ))}
                      </select>
                    </Field>

                    <Field label="Cantón">
                      <select
                        className="input"
                        value={canton}
                        onChange={(e) => setCanton(e.target.value)}
                        required
                      >
                        <option value="">Seleccione</option>
                        {cantones.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.nombre}
                          </option>
                        ))}
                      </select>
                    </Field>

                    <Field label="Distrito">
                      <select
                        className="input"
                        value={distrito}
                        onChange={(e) => setDistrito(e.target.value)}
                        required
                      >
                        <option value="">Seleccione</option>
                        {distritos.map((d) => (
                          <option key={d.id} value={d.id}>
                            {d.nombre}
                          </option>
                        ))}
                      </select>
                    </Field>
                  </div>

                  <Field label="Descripción">
                    <textarea
                      placeholder="Descripción general de la empresa"
                      className="input min-h-[70px]"
                      value={descripcion}
                      onChange={(e) => setDescripcion(e.target.value)}
                    />
                  </Field>

                  <Field label="Otras señas">
                    <textarea
                      placeholder="Dirección adicional, puntos de referencia"
                      className="input min-h-[70px]"
                      value={otrasSenas}
                      onChange={(e) => setOtrasSenas(e.target.value)}
                    />
                  </Field>

                  <div className="flex flex-col sm:flex-row gap-3 pt-2">
                    <button type="submit" className="btn-primary flex-1">
                      {editingEmpresa ? "Actualizar empresa" : "Registrar empresa"}
                    </button>

                    <button
                      type="button"
                      onClick={() => navigate("/Registro")}
                      className="btn-ghost flex-1"
                    >
                      Volver
                    </button>
                  </div>
                </form>
              </Card>
            </section>

            {/* TABLA */}
            <section className="lg:col-span-7">
              <Card>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-slate-900">
                    Empresas registradas
                  </h2>
                  <span className="text-xs text-slate-500">
                    Total: {empresas.length}
                  </span>
                </div>

                <div className="border border-slate-200 rounded-2xl overflow-hidden">
                  <div className="max-h-[420px] overflow-auto">
                    <table className="min-w-full text-sm text-center">
                      <thead className="bg-slate-50 text-slate-600">
                        <tr>
                          <th className="px-4 py-2 border-b">Nombre</th>
                          <th className="px-4 py-2 border-b">Cédula</th>
                          <th className="px-4 py-2 border-b">Acciones</th>
                        </tr>
                      </thead>

                      <tbody>
                        {empresas.map((emp) => (
                          <tr key={emp.id} className="hover:bg-slate-50">
                            <td className="border-b px-4 py-2 text-left">
                              {emp.nombre}
                            </td>
                            <td className="border-b px-4 py-2">{emp.cedula_empresa}</td>
                            <td className="border-b px-4 py-2">
                              <button
                                className="text-sky-700 hover:text-sky-900 text-xs mr-3"
                                onClick={() => handleEdit(emp)}
                              >
                                Editar
                              </button>

                              <button
                                className="text-pink-700 hover:text-pink-900 text-xs"
                                onClick={() => handleDelete(emp.id)}
                              >
                                Eliminar
                              </button>
                            </td>
                          </tr>
                        ))}

                        {empresas.length === 0 && (
                          <tr>
                            <td colSpan={3} className="px-4 py-6 text-slate-500">
                              No hay empresas registradas.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </Card>
            </section>
          </div>
        </main>
      </div>

      <Footer />
    </>
  );
}

// -----------------------------------------------------------
// COMPONENTES UI — Mismos de Settings
// -----------------------------------------------------------

function Card({ children, className = "" }) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      className={
        "bg-white rounded-2xl shadow-sm border border-slate-200 p-5 " + className
      }
    >
      {children}
    </motion.section>
  );
}

function Field({ label, children }) {
  return (
    <label className="grid gap-1.5">
      <span className="text-sm font-medium text-slate-700">{label}</span>
      {children}
    </label>
  );
}

// -----------------------------------------------------------
// Tailwind Utilities (corporativo)
// -----------------------------------------------------------
const styles = `
.btn-primary { @apply inline-flex items-center justify-center rounded-lg bg-sky-700 hover:bg-sky-800 text-white px-4 py-2 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-700 w-full; }
.btn-ghost   { @apply inline-flex items-center justify-center rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 px-4 py-2 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-300 w-full; }
.input       { @apply block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 shadow-sm focus:border-sky-600 focus:ring-2 focus:ring-sky-200 placeholder-slate-400; }
`;

// Inject utilities
(function injectInlineUtilities() {
  if (typeof document === "undefined") return;
  const id = "mantenimiento-empresas-styles-inline";
  if (document.getElementById(id)) return;
  const s = document.createElement("style");
  s.id = id;
  s.innerHTML = styles;
  document.head.appendChild(s);
})();
