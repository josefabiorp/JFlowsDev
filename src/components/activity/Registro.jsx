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
    setErrors({});

    if (formData.password !== formData.password_confirmation) {
      setErrors({ password_confirmation: "Las contraseñas no coinciden" });
      setIsSubmitting(false);
      return;
    }

    const formDataToSend = new FormData();

    for (const key in formData) {
      if (key === "image") {
        if (formData.image instanceof File) {
          formDataToSend.append("profile_image", formData.image);
        }
        continue;
      }
      formDataToSend.append(key, formData[key]);
    }

    try {
      const res = await fetch(`${API_URL}/register`, {
        method: "POST",
        body: formDataToSend,
      });

      const data = await res.json();

      if (!res.ok) {
        if (data?.errors) {
          setErrors(data.errors);
          const first = Object.values(data.errors)[0][0];
          toast.error(first);
          setIsSubmitting(false);
          return;
        }

        if (data?.code === "ADMIN_LIMIT_REACHED") {
          toast.error(data.message);
          setIsSubmitting(false);
          return;
        }

        if (data?.message) {
          toast.error(data.message);
          setIsSubmitting(false);
          return;
        }

        toast.error("Hubo un problema con el registro.");
        setIsSubmitting(false);
        return;
      }

      toast.success("Registro exitoso 🎉");
      setTimeout(() => navigate("/LogIn"), 1500);

    } catch (err) {
      toast.error("Error de conexión con el servidor");
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  /* ================================
   *  UI — OPTIMIZADO FULL RESPONSIVE
   * ================================ */
  return (
    <>
      <Header />

      <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
        <div className="w-full max-w-xl bg-white rounded-2xl shadow-lg p-8 border border-gray-100">

          {/* Título */}
          <h1 className="text-3xl font-bold text-center text-sky-900 mb-2">
            Crear cuenta de administrador
          </h1>
          <p className="text-center text-gray-600 mb-8 text-sm">
            Registrá tu empresa y comenzá a usar JFlows Dev hoy mismo.
          </p>

          {/* FORMULARIO */}
          <form onSubmit={handleSubmit} className="space-y-5">

            {/* Nombre */}
            <FormInput
              label="Nombre completo"
              type="text"
              id="nombre"
              value={formData.nombre}
              onChange={handleChange}
              placeholder="Nombre completo"
              error={errors.nombre}
            />

            {/* Email */}
            <FormInput
              label="Correo electrónico"
              type="email"
              id="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="correo@empresa.com"
              error={errors.email}
            />

            {/* Cédula */}
            <FormInput
              label="Cédula"
              type="text"
              id="cedula"
              value={formData.cedula}
              onChange={handleChange}
              placeholder="Cédula"
              error={errors.cedula}
            />

            {/* Empresa */}
            <div>
              <label className="block text-sm font-semibold text-gray-700">
                Empresa
              </label>

              <div className="flex justify-between mb-1 items-center">
                <span className="text-xs text-red-700">
                  Debe tener una empresa registrada
                </span>
                <button
                  type="button"
                  onClick={() => navigate("/MantenimientoEmpresas")}
                  className="text-blue-600 text-sm underline hover:text-blue-800"
                >
                  Registrar empresa
                </button>
              </div>

              <select
                id="empresa_id"
                value={formData.empresa_id}
                onChange={handleChange}
                required
                className="w-full p-2.5 border border-gray-300 rounded-md bg-gray-50 focus:ring-2 focus:ring-sky-700"
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
            <FormInput
              label="Contraseña"
              type="password"
              id="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Contraseña"
            />

            {/* Confirmar */}
            <FormInput
              label="Confirmar contraseña"
              type="password"
              id="password_confirmation"
              value={formData.password_confirmation}
              onChange={handleChange}
              placeholder="Confirmar contraseña"
              error={errors.password_confirmation}
            />

            {/* Imagen */}
            <div>
              <label className="block text-sm font-semibold text-gray-700">
                Imagen de perfil (opcional)
              </label>
              <input
                type="file"
                id="image"
                accept="image/*"
                onChange={handleChange}
                className="mt-1 block w-full text-sm text-gray-700
                file:mr-3 file:py-2 file:px-4
                file:rounded-md file:border-0
                file:bg-sky-50 file:text-sky-800
                hover:file:bg-sky-100 cursor-pointer"
              />
            </div>

            {/* Botón */}
            <button
              type="submit"
              disabled={isSubmitting}
              className={`w-full py-3 mt-2 font-semibold rounded-lg text-white text-lg transition-all ${
                isSubmitting
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-sky-800 hover:bg-sky-900 shadow-md hover:shadow-lg"
              }`}
            >
              {isSubmitting ? "Registrando..." : "Registrarse"}
            </button>
          </form>

          {/* Link Login */}
          <p className="text-center text-sm text-gray-600 mt-6">
            ¿Ya tienes una cuenta?{" "}
            <button
              onClick={() => navigate("/LogIn")}
              className="text-sky-700 hover:text-sky-900 font-semibold underline"
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

/* ==================================
 *  SUBCOMPONENTE INPUT OPTIMIZADO
 * ================================== */
function FormInput({ label, id, type = "text", value, onChange, placeholder, error }) {
  return (
    <div>
      <label className="block text-sm font-semibold text-gray-700">{label}</label>
      <input
        id={id}
        type={type}
        value={value}
        onChange={onChange}
        required
        placeholder={placeholder}
        className={`mt-1 w-full p-2.5 rounded-md border bg-gray-50 focus:ring-2 focus:ring-sky-700 transition-all ${
          error ? "border-pink-500" : "border-gray-300"
        }`}
      />
      {error && <p className="text-pink-700 text-xs mt-1">{error[0] || error}</p>}
    </div>
  );
}
