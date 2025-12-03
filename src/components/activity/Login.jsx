import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useUser } from "../hooks/UserContext.jsx";
import { Header } from "../Header.jsx";
import { Footer } from "../Footer.jsx";
import "../../index.css";
import { API_URL } from "../../config/api";

export function Login() {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const { setUser, setToken } = useUser();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.id]: e.target.value }));
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setErrors({});

    try {
      const response = await fetch(`${API_URL}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        setUser(data.usuario);
        setToken(data.token);
        navigate("/Settings");
      } else {
        setErrors({
          server:
            data.message ||
            "Credenciales incorrectas. Por favor, intenta de nuevo.",
        });
      }
    } catch (error) {
      console.error("Error:", error);
      setErrors({ server: "Hubo un problema con el servidor." });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Header />

      <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
        <div className="w-full max-w-5xl bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden flex flex-col md:flex-row">
          
          {/* IZQUIERDA — Branding (oculto en móvil) */}
          <div className="hidden md:flex md:w-1/2 bg-gradient-to-br from-sky-800 to-indigo-900 text-white p-10 flex-col items-center justify-center space-y-6">
            <h2 className="text-3xl font-bold">JFlows Dev</h2>
            <p className="text-slate-200 text-sm text-center leading-relaxed">
              Sistema corporativo para gestión de empleados, asistencia y RRHH.
            </p>

            <img
              src="/login-illustration.svg"
              alt="Illustration"
              className="w-60 opacity-90 drop-shadow-xl"
              onError={(e) => (e.target.style.display = "none")}
            />
          </div>

          {/* DERECHA — Formulario */}
          <div className="w-full md:w-1/2 p-8 sm:p-12">
            <h1 className="text-3xl font-bold text-sky-900 text-center mb-4">
              Iniciar Sesión
            </h1>
            <p className="text-gray-600 text-center mb-8">
              Bienvenido(a), ingresa tus credenciales.
            </p>

            <form onSubmit={handleLogin} className="space-y-6">
              {/* Email */}
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-semibold text-gray-700 mb-2"
                >
                  Correo electrónico
                </label>
                <input
                  type="email"
                  id="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full p-2.5 rounded-lg border border-gray-300 bg-gray-50 focus:ring-2 focus:ring-sky-700 focus:border-sky-700 transition"
                  required
                  placeholder="correo@empresa.com"
                />
              </div>

              {/* Contraseña */}
              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-semibold text-gray-700 mb-2"
                >
                  Contraseña
                </label>
                <input
                  type="password"
                  id="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full p-2.5 rounded-lg border border-gray-300 bg-gray-50 focus:ring-2 focus:ring-sky-700 focus:border-sky-700 transition"
                  required
                  placeholder="••••••••"
                />
              </div>

              {/* Error */}
              {errors.server && (
                <p className="text-pink-700 font-semibold text-sm text-center">
                  {errors.server}
                </p>
              )}

              {/* Forgot password 
              <div className="text-right text-sm">
                <Link
                  to="/forgotpassword"
                  className="text-sky-700 hover:text-sky-900 font-medium italic transition"
                >
                  ¿Olvidaste tu contraseña?
                </Link>
              </div>*/}

              {/* Botón */}
              <button
                type="submit"
                disabled={isLoading}
                className={`w-full py-3 rounded-lg text-white font-semibold text-lg transition ${
                  isLoading
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-sky-800 hover:bg-sky-900 shadow-lg"
                }`}
              >
                {isLoading ? "Verificando..." : "Iniciar sesión"}
              </button>

              {/* Registro */}
              <p className="text-center text-sm text-gray-700 mt-4">
                ¿No tienes una cuenta?{" "}
                <Link
                  to="/Registro"
                  className="text-sky-700 hover:text-sky-900 underline font-semibold"
                >
                  Regístrate aquí
                </Link>
              </p>
            </form>
          </div>
        </div>
      </div>

      <Footer />
    </>
  );
}
