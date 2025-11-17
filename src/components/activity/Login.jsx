import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useUser } from "../hooks/UserContext.jsx";
import { Header } from "../Header.jsx";
import { Footer } from "../Footer.jsx";
import "../../index.css";

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

    try {
      const response = await fetch("https://jflowsdev.duckdns.org/login/api/login", {
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
      console.error("Error:", error.message);
      setErrors({ server: "Hubo un problema al intentar iniciar sesión." });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gradient-to-br from-slate-200 via-slate-300 to-slate-400 flex flex-col justify-center items-center py-12 px-6">
        <div className="flex flex-col md:flex-row bg-white rounded-2xl shadow-2xl w-full max-w-5xl overflow-hidden border border-slate-200">
          {/* Lado Izquierdo / Branding */}
          <div className="hidden md:flex md:w-1/2 bg-gradient-to-br from-sky-800 to-indigo-900 text-white flex-col justify-center items-center p-12 space-y-6">
            <div className="text-center">
              <h2 className="text-3xl font-bold mb-3">JFlows Dev</h2>
              <p className="text-sm text-slate-100">
                Sistema corporativo de gestión y control de empleados.
              </p>
            </div>
            <img
              src="/login-illustration.svg"
              alt="Illustration"
              className="w-64 opacity-90 drop-shadow-xl"
              onError={(e) => (e.target.style.display = "none")}
            />
          </div>

          {/* Lado Derecho / Formulario */}
          <div className="w-full md:w-1/2 p-8 sm:p-12">
            <h1 className="text-3xl font-bold text-sky-900 mb-6 text-center">
              Iniciar Sesión
            </h1>
            <p className="text-gray-600 text-center mb-8">
              Bienvenido(a) de nuevo. Ingresa tus credenciales para continuar.
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
                  required
                  className="w-full p-2.5 rounded-md border border-gray-300 bg-gray-50 focus:ring-2 focus:ring-sky-600 focus:border-sky-600 transition-all"
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
                  required
                  className="w-full p-2.5 rounded-md border border-gray-300 bg-gray-50 focus:ring-2 focus:ring-sky-600 focus:border-sky-600 transition-all"
                  placeholder="••••••••"
                />
              </div>

              {/* Error */}
              {errors.server && (
                <p className="text-pink-700 font-semibold text-sm text-center mt-2">
                  {errors.server}
                </p>
              )}

              {/* Forgot password */}
              <div className="text-right text-sm mt-2">
                <Link
                  to="/forgotpassword"
                  className="text-sky-700 hover:text-sky-900 italic font-medium transition-all"
                >
                  ¿Olvidaste tu contraseña?
                </Link>
              </div>

              {/* Botón */}
              <button
                type="submit"
                disabled={isLoading}
                className={`w-full py-3 mt-4 rounded-lg text-white font-semibold text-lg transition-all ${
                  isLoading
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-sky-700 hover:bg-sky-800 shadow-md hover:shadow-lg"
                }`}
              >
                {isLoading ? "Verificando..." : "Iniciar sesión"}
              </button>

              {/* Registro */}
              <p className="text-center text-gray-600 text-sm mt-6">
                ¿Aún no tienes una cuenta?{" "}
                <Link
                  to="/Registro"
                  className="text-sky-700 hover:text-sky-900 font-semibold underline transition"
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
