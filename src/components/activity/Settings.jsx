import React, { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";

import { useUser } from "../hooks/UserContext";
import { useProfileForm } from "../hooks/useProfileForm";
import { useUpdateProfile } from "../hooks/useUpdateProfile";
import { useAccountManagement } from "../hooks/useAccountManagement";

import { Header } from "../Header.jsx";
import { Footer } from "../Footer.jsx";
import { Sidebar } from "../Sidebar.jsx";

import "../../index.css";

/* ============================================================
   SETTINGS — 100% responsive + full corporate UI
   (SIN tocar tu lógica)
============================================================ */

export function Settings() {
  const { user, setUser, token, setToken } = useUser();
  const { formData, handleChange, reset: resetFormFromHook } = useProfileForm(user);
  const { error, success, updateProfile, isLoading: isSaving } =
    useUpdateProfile(token, setUser, setToken);
  const { deleteAccount, logout } = useAccountManagement(setUser, setToken);

  const [editMode, setEditMode] = useState(false);
  const [profileImage, setProfileImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);

  const fileInputRef = useRef(null);

  /* Helpers */

  const roleLabel = useMemo(
    () =>
      (
        {
          admin: "Administrador",
          contador: "Contador",
          empleado: "Empleado",
        }[String(user?.role || "").toLowerCase()] || user?.role || "—"
      ),
    [user]
  );

  const validateImage = (file) => {
    if (!file) return true;
    const isValidType = /image\/(jpeg|jpg|png|gif|webp)/i.test(file.type);
    const isValidSize = file.size <= 2 * 1024 * 1024;

    if (!isValidType) {
      toast.error("Formato no permitido. Usa JPEG, PNG, GIF o WebP.");
      return false;
    }
    if (!isValidSize) {
      toast.error("La imagen supera 2MB.");
      return false;
    }
    return true;
  };

  const onPickImage = () => fileInputRef.current?.click();

  const onImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file || !validateImage(file)) return;

    setProfileImage(file);
    const url = URL.createObjectURL(file);
    setImagePreview(url);
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    const tId = toast.loading("Guardando cambios…");
    await updateProfile(formData, profileImage);
    toast.dismiss(tId);
    setEditMode(false);
  };

  const handleCancelEdit = () => {
    if (typeof resetFormFromHook === "function") resetFormFromHook(user);

    setProfileImage(null);
    if (imagePreview) URL.revokeObjectURL(imagePreview);
    setImagePreview(null);
    setEditMode(false);
  };

  useEffect(() => {
    if (success) toast.success(success);
  }, [success]);

  useEffect(() => {
    if (error) toast.error(error);
  }, [error]);

  if (!user) {
    return (
      <div className="min-h-screen grid place-items-center bg-slate-100 text-slate-700">
        No hay usuario autenticado.
      </div>
    );
  }

  /* ============================================================
     RENDER – Sidebar EXACTO a RegistroAsistencias
  ============================================================ */

  return (
    <>
      <Header />

      <div className="flex bg-gray-100 min-h-screen">
        
        {/* === SIDEBAR EXACTO === */}
        <div className="w-1/4 lg:mr-10">
          <Sidebar logout={logout} />
        </div>

        {/* === CONTENIDO PRINCIPAL === */}
        <div className="flex-1 p-4 md:p-8">
          <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6">

            {/* PANEL IZQUIERDO */}
            <section className="lg:col-span-4">
              
              {/* PERFIL */}
              <Card className="w-full">
                <div className="flex items-start gap-4">

                  {/* Avatar */}
                  <div className="relative">
                    <div className="w-24 h-24 md:w-28 md:h-28 rounded-full bg-slate-200 overflow-hidden ring-4 ring-white shadow">
                      {imagePreview || user?.profile_image ? (
                        <img
                          src={imagePreview || user.profile_image}
                          alt="Avatar"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <svg
                          className="w-full h-full text-slate-400"
                          viewBox="0 0 24 24"
                          fill="currentColor"
                        >
                          <path
                            fillRule="evenodd"
                            d="M12 12a5 5 0 100-10 5 5 0 000 10zm7 9a7 7 0 10-14 0h14z"
                            clipRule="evenodd"
                          />
                        </svg>
                      )}
                    </div>

                    {editMode && (
                      <button
                        type="button"
                        onClick={onPickImage}
                        className="absolute -bottom-2 right-0 rounded-full bg-sky-600 hover:bg-sky-700 text-white text-xs px-3 py-1.5 shadow"
                      >
                        Cambiar
                      </button>
                    )}

                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={onImageChange}
                    />
                  </div>

                  {/* Datos */}
                  <div className="flex-1">
                    <h1 className="text-2xl font-bold text-slate-900">
                      Hola, {user.nombre}
                    </h1>

                    <p className="text-slate-600 mt-1">
                      Rol: <span className="font-medium">{roleLabel}</span>
                    </p>

                    <div className="flex flex-wrap gap-2 mt-4 w-full">
                      {!editMode ? (
                        <button
                          type="button"
                          onClick={() => setEditMode(true)}
                          className="btn-primary"
                        >
                          Editar perfil
                        </button>
                      ) : (
                        <>
                          <button
                            type="button"
                            onClick={handleCancelEdit}
                            className="btn-ghost"
                          >
                            Cancelar
                          </button>

                          <button
                            type="submit"
                            form="settings-form"
                            className="btn-primary disabled:opacity-60"
                            disabled={isSaving}
                          >
                            {isSaving ? "Guardando…" : "Guardar cambios"}
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </Card>

              {/* INFO */}
              <Card className="mt-6 w-full">
                <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wide">
                  Cuenta
                </h3>

                <ul className="mt-3 space-y-2 text-sm text-slate-700">
                  <li>
                    <span className="text-slate-500">Correo:</span> {user.email}
                  </li>
                  <li>
                    <span className="text-slate-500">Cédula:</span> {user.cedula}
                  </li>
                </ul>
              </Card>
            </section>

            {/* PANEL DERECHO */}
            <section className="lg:col-span-8">
              
              <Card className="w-full">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-slate-900">
                    Datos de perfil
                  </h2>

                  {!editMode && (
                    <span className="text-xs text-slate-500">Solo lectura</span>
                  )}
                </div>

                <form
                  id="settings-form"
                  onSubmit={handleUpdateProfile}
                  className="mt-6 grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 gap-4"
                >
                  <Field label="Nombre" htmlFor="nombre">
                    <input
                      id="nombre"
                      name="nombre"
                      type="text"
                      value={formData.nombre}
                      onChange={handleChange}
                      required
                      disabled={!editMode}
                      className="input"
                    />
                  </Field>

                  <Field label="Email" htmlFor="email">
                    <input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      disabled={!editMode}
                      className="input"
                    />
                  </Field>

                  <Field label="Cédula" htmlFor="cedula">
                    <input
                      id="cedula"
                      name="cedula"
                      type="text"
                      value={formData.cedula}
                      onChange={handleChange}
                      required
                      disabled={!editMode}
                      className="input"
                    />
                  </Field>

                  <Field
                    label="Contraseña actual"
                    htmlFor="current_password"
                    helper="Requerida para cambiar la contraseña."
                  >
                    <input
                      id="current_password"
                      name="current_password"
                      type="password"
                      value={formData.current_password || ""}
                      onChange={handleChange}
                      disabled={!editMode}
                      className="input"
                    />
                  </Field>

                  <Field label="Nueva contraseña" htmlFor="password">
                    <input
                      id="password"
                      name="password"
                      type="password"
                      value={formData.password || ""}
                      onChange={handleChange}
                      disabled={!editMode}
                      className="input"
                    />
                  </Field>

                  <Field
                    label="Confirmar contraseña"
                    htmlFor="password_confirmation"
                  >
                    <input
                      id="password_confirmation"
                      name="password_confirmation"
                      type="password"
                      value={formData.password_confirmation || ""}
                      onChange={handleChange}
                      disabled={!editMode}
                      className="input"
                    />
                  </Field>

                  {/* Botones móviles */}
                  <div className="md:col-span-2 flex md:hidden gap-3 pt-2">
                    {editMode ? (
                      <>
                        <button onClick={handleCancelEdit} type="button" className="btn-ghost w-full">
                          Cancelar
                        </button>
                        <button type="submit" disabled={isSaving} className="btn-primary w-full">
                          {isSaving ? "Guardando…" : "Guardar"}
                        </button>
                      </>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setEditMode(true)}
                        className="btn-primary w-full"
                      >
                        Editar
                      </button>
                    )}
                  </div>
                </form>
              </Card>

              {/* DANGER ZONE */}
              <Card className="mt-6 border-pink-200 w-full">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-pink-700 uppercase tracking-wide">
                    Zona de riesgo
                  </h3>

                  <button
                    type="button"
                    onClick={() => setShowConfirmDelete(true)}
                    className="px-3 py-1.5 text-sm font-medium rounded-lg bg-pink-600 text-white hover:bg-pink-700"
                  >
                    Eliminar cuenta
                  </button>
                </div>

                <p className="text-sm text-slate-600 mt-2">
                  Esta acción es permanente.
                </p>
              </Card>

            </section>
          </div>
        </div>
      </div>

      <Footer />

      {/* MODAL ELIMINAR */}
      <AnimatePresence>
        {showConfirmDelete && (
          <Modal onClose={() => setShowConfirmDelete(false)}>
            <div className="text-center">
              <h4 className="text-lg font-semibold text-slate-900">
                ¿Seguro que deseas eliminar tu cuenta?
              </h4>

              <p className="text-slate-600 mt-2">
                Esta acción es permanente.
              </p>

              <div className="mt-6 flex flex-col sm:flex-row gap-2 justify-center">
                <button
                  type="button"
                  onClick={async () => {
                    const id = toast.loading("Eliminando cuenta…");
                    try {
                      await deleteAccount(token);
                      toast.success("Cuenta eliminada");
                    } catch {
                      toast.error("Error al eliminar");
                    } finally {
                      toast.dismiss(id);
                    }
                  }}
                  className="w-full sm:w-auto px-4 py-2 rounded-lg bg-pink-600 text-white hover:bg-pink-700"
                >
                  Eliminar definitivamente
                </button>

                <button
                  type="button"
                  onClick={() => setShowConfirmDelete(false)}
                  className="w-full sm:w-auto px-4 py-2 rounded-lg border bg-white hover:bg-slate-50"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </Modal>
        )}
      </AnimatePresence>
    </>
  );
}

/* ============================================================
   UI PRIMITIVES 
============================================================ */

function Card({ children, className = "" }) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
      className={"bg-white rounded-2xl shadow-sm border border-slate-200 p-5 " + className}
    >
      {children}
    </motion.section>
  );
}

function Field({ label, htmlFor, helper, children }) {
  return (
    <label htmlFor={htmlFor} className="grid gap-2">
      <span className="text-sm font-medium text-slate-700">{label}</span>
      {children}
      {helper && <span className="text-xs text-slate-500">{helper}</span>}
    </label>
  );
}

function Modal({ children, onClose }) {
  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div
        onClick={onClose}
        className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm"
      />

      <motion.div
        initial={{ y: 16, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 16, opacity: 0 }}
        transition={{ type: "spring", stiffness: 260, damping: 22 }}
        className="relative w-full max-w-sm sm:max-w-md bg-white rounded-2xl shadow-xl p-6"
      >
        {children}
      </motion.div>
    </motion.div>
  );
}

/* ============================================================
   Tailwind Utilities Inline
============================================================ */

const styles = `
.btn-primary { @apply inline-flex items-center justify-center rounded-lg bg-sky-700 hover:bg-sky-800 text-white px-4 py-2 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-700; }
.btn-ghost   { @apply inline-flex items-center justify-center rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 px-4 py-2 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-300; }
.input       { @apply block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 shadow-sm focus:border-sky-600 focus:ring-2 focus:ring-sky-200 disabled:opacity-70; }
`;

(function injectInlineUtilities() {
  if (typeof document === "undefined") return;
  const id = "settings-styles-inline";
  if (document.getElementById(id)) return;
  const style = document.createElement("style");
  style.id = id;
  style.innerHTML = styles;
  document.head.appendChild(style);
})();
