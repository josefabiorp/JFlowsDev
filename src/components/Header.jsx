import React, { useState } from "react";
import { Link } from "react-router-dom";
import { HashLink } from "react-router-hash-link";
import { useUser } from "./hooks/UserContext";
import { Clock } from "./activity/clock";

import menuIcon from "../assets/menu.svg";
import systemLogo from "../assets/Logo-completo.png"; // Logo general del sistema

export const Header = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const { user } = useUser();

  // 1️⃣ Logo dinámico según empresa
  const empresaLogo = user?.empresa?.logo ? user.empresa.logo : null;

  // 2️⃣ Decide qué mostrar siempre
  const logoToShow = user ? empresaLogo || systemLogo : systemLogo;

  return (
    <nav className="flex flex-row justify-between h-20 bg-white relative pt-2 pb-2">
      
      <Link
  to={user ? "/Settings" : "/"}
  className="flex items-center lg:basis-1/5"
>
  <img
    src={logoToShow}
    alt="Logo"
    className="h-20 w-auto object-contain"  // 🔥 Más grande
  />
</Link>


      {/* Botón menú mobile */}
      <div
        className="lg:hidden cursor-pointer justify-between"
        onClick={() => setMenuOpen(!menuOpen)}
        onKeyDown={() => setMenuOpen(!menuOpen)}
      >
        <img
          src={menuIcon}
          className={`${menuOpen ? "w-20 h-20" : "w-21 h-20"} 
                      p-5 mr-1 pt-2 pb-8 
                      relative ease-in-out duration-300 flex rounded-full 
                      ${!menuOpen && "transform scale-x-[-1]"}`}
          alt="Control"
        />
      </div>

      {/* MENÚ */}
      <ul
        className={`flex flex-col lg:flex-row md:space-x-8 md:items-center absolute md:static
          top-16 right-0 w-full md:w-auto bg-white md:bg-transparent z-10 transform
          ${menuOpen ? "translate-x-0 opacity-100" : "translate-x-full opacity-0 md:opacity-100 md:translate-x-0"}
          transition duration-300 ease-in-out`}
      >
        {/* ─────────────────────────────────────── */}
        {/* SI HAY USUARIO AUTENTICADO */}
        {user ? (
          <div className="flex lg:justify-end lg:space-x-1 lg:flex-row lg:mt-0 mt-3">
            <li className="lg:p-0 px-10 py-2 lg:bg-transparent bg-slate-200">
              <div className="flex items-center lg:m-0 ml-1 lg:text-xl lg:mx-16 text-center">
                <Clock />
                <div className="lg:m-5 lg:ml-12 lg:w-3 lg:h-3 lg:mx-1 w-2 h-2 bg-green-500 ml-10 rounded-full" />
                <span className="leading-none text-gray-600 text-sm mx-2 lg:mx-7 text-center">
                  En línea
                </span>
                <Link
                  to="/Settings"
                  className="px-4 py-1.5 ml-5 text-sm text-center font-medium 
                  rounded-2xl lg:mx-7 lg:bg-gray-100 bg-slate-50 lg:bg-opacity-25 
                  text-gray-600 hover:bg-slate-200 hover:text-sky-800 
                  transition duration-200"
                >
                  Perfil de usuario
                </Link>
              </div>
            </li>
          </div>
        ) : (
          /* ─────────────────────────────────────── */
          /* MODO PÚBLICO (sin usuario) */
          <>
            <div className="lg:flex lg:ml-96 lg:gap-5 lg:basis-6/6 lg:justify-between lg:space-x-3 lg:flex-wrap">
              <li className="lg:mt-0 lg:p-0 p-4 text-center lg:bg-transparent bg-slate-200">
                <HashLink
                  smooth
                  to={"/#contacto"}
                  className="lg:font-bold lg:text-base lg:p-2 lg:px-3 lg:rounded-2xl 
                  lg:bg-transparent text-xl font-bold pb-1 pt-2 text-indigo-950 
                  lg:hover:text-white lg:hover:bg-blue-900 lg:active:bg-slate-300 
                  hover:text-indigo-800 active:text-indigo-700"
                >
                  Contacto
                </HashLink>
              </li>

              <li className="lg:p-0 p-4 text-center lg:bg-transparent bg-slate-100">
                <HashLink
                  smooth
                  to={"/#servicios"}
                  className="lg:font-bold lg:text-base lg:p-2 lg:px-3 lg:rounded-2xl 
                  lg:bg-transparent text-xl font-bold pb-1 pt-2 text-indigo-950 
                  lg:hover:text-white lg:hover:bg-blue-900"
                >
                  Servicios
                </HashLink>
              </li>

              <li className="lg:p-0 p-4 text-center lg:bg-transparent bg-slate-200">
                <HashLink
                  smooth
                  to={"/#precio"}
                  className="lg:font-bold lg:text-base lg:p-2 lg:px-3 lg:rounded-2xl 
                  lg:bg-transparent text-xl font-bold pb-1 pt-1.5 text-indigo-950 
                  lg:hover:text-white lg:hover:bg-blue-900"
                >
                  Planes
                </HashLink>
              </li>

              <li className="lg:p-0 p-4 text-center lg:bg-transparent bg-slate-100">
                <Link
                  to="/Login"
                  className="lg:font-bold lg:text-base lg:p-2 lg:px-3 lg:rounded-2xl  
                  text-xl font-bold pb-1 pt-1.5 lg:hover:bg-sky-100 lg:text-sky-900 
                  lg:bg-slate-100 lg:hover:text-sky-700 text-indigo-900"
                >
                  Iniciar sesión
                </Link>
              </li>

              <li className="lg:p-0 p-4 text-center lg:bg-transparent bg-slate-20">
                <Link
                  to="/Registro"
                  className="lg:font-bold lg:text-base lg:p-2 lg:px-3 lg:rounded-2xl 
                  text-xl font-bold pb-1 pt-1.5 lg:hover:bg-sky-100 lg:text-sky-900 
                  lg:bg-slate-100 lg:hover:text-sky-700 text-indigo-900"
                >
                  Registrarse
                </Link>
              </li>
            </div>
          </>
        )}
      </ul>
    </nav>
  );
};
