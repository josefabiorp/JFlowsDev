import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import "../../index.css";
import { Header } from "../Header.jsx";
import { Footer } from "../Footer.jsx";
import toast from "react-hot-toast";

import { API_URL } from "../../config/api";


export function Register() {
  const [formData, setFormData] = useState({
    nombre: "",
    email: "",
    cedula: "",
    role: "admin",
    password: "",
    password_confirmation: "",
    image: null,
    empresa_id: "",
  });

  const [errors, setErrors] = useState({});
  const [empresas, setEmpresas] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const navigate = useNavigate();

  /* ================================
   *  CARGAR EMPRESAS
   * ================================ */
  useEffect(() => {
    const fetchEmpresas = async () => {
      try {
        
          const res = await fetch(`${API_URL}/empresas`);
        if (!res.ok) throw new Error("Error al cargar empresas");
        const data = await res.json();
        setEmpresas(data);
      } catch (err) {
        toast.error("No se pudieron cargar las empresas");
        console.error(err);
      }
    };
    fetchEmpresas();
  }, []);

  /* ================================
   *  MANEJADORES
   * ================================ */
  const handleChange = (e) => {
    const { id, value, type, files } = e.target;
    setFormData((prev) => ({
      ...prev,
      [id]: type === "file" ? files[0] : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    if (formData.password !== formData.password_confirmation) {
      setErrors({ password_confirmation: "Las contraseñas no coinciden" });
      setIsSubmitting(false);
      return;
    }

    const formDataToSend = new FormData();
    for (const key in formData) {
      formDataToSend.append(
        key === "image" ? "profile_image" : key,
        formData[key]
      );
    }

    try {
       const res = await fetch(`${API_URL}/register`, {
        method: "POST",
        body: formDataToSend,
      });

      const data = await res.json();

      if (!res.ok) {
        setErrors(data.errors || {});
        toast.error("Ocurrió un error al registrar el usuario");
        setIsSubmitting(false);
        return;
      }

      toast.success("Usuario registrado correctamente 🎉");
      setTimeout(() => navigate("/LogIn"), 2000);
    } catch (err) {
      toast.error("Error de conexión con el servidor");
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  /* ================================
   *  UI
   * ================================ */
  return (
    <>
      <Header />
      <div className="min-h-screen bg-gradient-to-br from-slate-200 via-slate-300 to-slate-400 flex flex-col items-center justify-center py-16 px-4">
        <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 p-8 transition-all hover:shadow-sky-200">
          <h1 className="text-4xl font-bold text-center text-sky-900 mb-2">
            ¡Bienvenido(a)!
          </h1>
          <p className="text-center text-gray-600 mb-8">
            Registra tu cuenta de administrador para comenzar
          </p>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Nombre */}
            <div>
              <label className="block text-sm font-semibold text-gray-700">
                Nombre de usuario
              </label>
              <input
                type="text"
                id="nombre"
                value={formData.nombre}
                onChange={handleChange}
                required
                className="mt-1 w-full p-2.5 rounded-md border border-gray-300 bg-gray-50 focus:ring-2 focus:ring-sky-600 focus:border-sky-600 transition-all"
                placeholder="Nombre completo"
              />
              {errors.nombre && (
                <p className="text-pink-700 text-sm mt-1">{errors.nombre[0]}</p>
              )}
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-semibold text-gray-700">
                Correo electrónico
              </label>
              <input
                type="email"
                id="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="mt-1 w-full p-2.5 rounded-md border border-gray-300 bg-gray-50 focus:ring-2 focus:ring-sky-600 focus:border-sky-600 transition-all"
                placeholder="nombre@email.com"
              />
              {errors.email && (
                <p className="text-pink-700 text-sm mt-1">{errors.email[0]}</p>
              )}
            </div>

            {/* Cédula */}
            <div>
              <label className="block text-sm font-semibold text-gray-700">
                Cédula de identidad
              </label>
              <input
                type="text"
                id="cedula"
                value={formData.cedula}
                onChange={handleChange}
                required
                className="mt-1 w-full p-2.5 rounded-md border border-gray-300 bg-gray-50 focus:ring-2 focus:ring-sky-600 focus:border-sky-600 transition-all"
                placeholder="Cédula"
              />
              {errors.cedula && (
                <p className="text-pink-700 text-sm mt-1">{errors.cedula[0]}</p>
              )}
            </div>

            {/* Empresa */}
            <div>
              <label className="block text-sm font-semibold text-gray-700">
                Empresa
              </label>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-red-700">
                  Debe tener una empresa registrada para crear usuarios
                </span>
                <button
                  type="button"
                  onClick={() => navigate("/MantenimientoEmpresas")}
                  className="text-sm text-blue-600 underline hover:text-blue-800 transition"
                >
                  Registrar empresa
                </button>
              </div>

              <select
                id="empresa_id"
                value={formData.empresa_id}
                onChange={handleChange}
                required
                className="w-full p-2.5 border border-gray-300 rounded-md bg-gray-50 focus:ring-2 focus:ring-sky-600 focus:border-sky-600 transition"
              >
                <option value="">Seleccione una empresa</option>
                {empresas.map((empresa) => (
                  <option key={empresa.id} value={empresa.id}>
                    {empresa.nombre}
                  </option>
                ))}
              </select>
            </div>

            {/* Contraseña */}
            <div>
              <label className="block text-sm font-semibold text-gray-700">
                Contraseña
              </label>
              <input
                type="password"
                id="password"
                value={formData.password}
                onChange={handleChange}
                required
                className="mt-1 w-full p-2.5 rounded-md border border-gray-300 bg-gray-50 focus:ring-2 focus:ring-sky-600 focus:border-sky-600 transition-all"
                placeholder="Contraseña"
              />
            </div>

            {/* Confirmar contraseña */}
            <div>
              <label className="block text-sm font-semibold text-gray-700">
                Confirmar contraseña
              </label>
              <input
                type="password"
                id="password_confirmation"
                value={formData.password_confirmation}
                onChange={handleChange}
                required
                className="mt-1 w-full p-2.5 rounded-md border border-gray-300 bg-gray-50 focus:ring-2 focus:ring-sky-600 focus:border-sky-600 transition-all"
                placeholder="Confirmar contraseña"
              />
              {errors.password_confirmation && (
                <p className="text-pink-700 text-sm mt-1">
                  {errors.password_confirmation}
                </p>
              )}
            </div>

            {/* Imagen */}
            <div>
              <label className="block text-sm font-semibold text-gray-700">
                Imagen de perfil
              </label>
              <input
                type="file"
                id="image"
                accept="image/*"
                onChange={handleChange}
                className="mt-1 block w-full text-sm text-gray-700
                file:mr-3 file:py-2 file:px-4
                file:rounded-full file:border-0
                file:text-sm file:font-semibold
                file:bg-sky-50 file:text-sky-800
                hover:file:bg-sky-100 cursor-pointer"
              />
            </div>

            {/* Botón */}
            <button
              type="submit"
              disabled={isSubmitting}
              className={`w-full py-3 mt-4 font-semibold rounded-lg text-white text-lg transition-all
              ${
                isSubmitting
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-sky-700 hover:bg-sky-800 shadow-md hover:shadow-lg"
              }`}
            >
              {isSubmitting ? "Registrando..." : "Registrarse"}
            </button>
          </form>

          <p className="text-center text-sm text-gray-600 mt-6">
            ¿Ya tienes una cuenta?{" "}
            <button
              onClick={() => navigate("/LogIn")}
              className="text-sky-700 hover:text-sky-900 font-semibold underline transition"
            >
              Iniciar sesión
            </button>
          </p>
        </div>
      </div>
      <Footer />
    </>
  );
}
