import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";

import logoImage from "../assets/Logo-completo.png";
import controlImage from "../assets/control.svg";

import { useUser } from "./hooks/UserContext";
import { usePermisos } from "./hooks/usePermisos";

const API_URL = "http://138.197.204.143/api";

export function Sidebar({ logout }) {
    const [open, setOpen] = useState(true);
    const navigate = useNavigate();

    // ──────────────────────────────────────────
    //   USUARIO ACTUAL
    // ──────────────────────────────────────────
    const { user, isAdmin, isEmpleado, token } = useUser();

    const empresaLogo = user?.empresa?.logo ? user.empresa.logo : null;
    const logoToShow = user ? empresaLogo || logoImage : logoImage;

    const handleClick = () => navigate("/");

    // ──────────────────────────────────────────
    //   PERMISOS PENDIENTES (ADMIN)
    // ──────────────────────────────────────────
    const { pendientes, fetchPendientes } = usePermisos(API_URL, token, user);

    useEffect(() => {
        if (isAdmin && token && user?.id) {
            fetchPendientes();
        }
    }, [isAdmin, token, user, fetchPendientes]);

    // ──────────────────────────────────────────
    //   MENÚ PRINCIPAL
    // ──────────────────────────────────────────
    const Menus = [
        {
            title: "Registro de Asistencias",
            src: "Ventas",
            link: "/RegistroAsistencias",
            roles: ["admin", "empleado"],
        },
        {
            title: "Gestión de Empleados",
            src: "Compras",
            link: "/mantenimientousuarios",
            roles: ["admin"],
        },
        {
            title: "Permisos",
            src: "usuarios",
            link: "/Permisos",
            roles: ["admin", "empleado"],
            gap: true,
        },

        // ⭐ NUEVO — MÓDULO DESCANSOS
        {
            title: "Descansos",
            src: "Proveedores",
            link: "/Descansos",
            roles: ["admin", "empleado"],
        },

        {
            title: "Reportes y Estadísticas",
            src: "Clientes",
            link: "/MantenimientoClientes",
            roles: ["admin"],
        },
        {
            title: "Comunicación interna",
            src: "Proveedores",
            link: "/MantenimientoProveedores",
            roles: ["admin"],
        },
        {
            title: "Documentación / Ayuda",
            src: "usuarios",
            link: "/mantenimientousuarios",
            roles: ["admin"],
        },
        {
            title: "Estadísticas",
            src: "Estadisticas",
            link: "/EstadisticasFacturas",
            roles: ["admin"],
        },
        {
            title: "Configuración",
            src: "Configuracion",
            link: "/Settings",
            roles: ["admin", "empleado"],
            gap: true,
        },
        {
            title: "Cerrar sesión",
            src: "CerrarSesion",
            roles: ["admin", "empleado"],
            action: logout,
        },
    ];

    return (
        <div className="flex min-h-dvh max-h-fit w-full h-fit">
            <div
                className={`flex-h-grow h-fit ${
                    open
                        ? "lg:w-72 lg:pb-72 w-screen bg-slate-50 pb-[50rem]"
                        : "lg:w-28 w-16 lg:bg-slate-50 lg:pb-[50rem]"
                } transition-width lg:bg-slate-50 lg:p-5 lg:pt-10 relative ease-in-out duration-300 lg:duration-150`}
            >
                {/* Control abrir/cerrar */}
                <img
                    src={controlImage}
                    className={`absolute cursor-pointer -right-2 lg:-right-5 top-9 border-slate-100 border-5 rounded-full
                        ${!open && "rotate-180"}
                        ${
                            open
                                ? "w-12 -translate-x-10 lg:-translate-x-0"
                                : "w-9 -translate-x-10 lg:-translate-x-0"
                        }
                        transition duration-300 ease-in-out`}
                    onClick={() => setOpen(!open)}
                    alt="Control"
                />

                {/* Logo */}
                <div className="flex gap-x-6 items-center">
                    <img
                        onClick={handleClick}
                        src={logoToShow}
                        className={`cursor-pointer duration-500 ${
                            open && "rotate-[360deg]"
                        } ${
                            open
                                ? "lg:block block lg:w-auto w-36 lg:pl-2"
                                : "lg:block hidden lg:pl-3"
                        }`}
                        alt="Logo"
                    />
                </div>

                {/* Menú */}
                <ul
                    className={`flex-grow pt-6 lg:mb-16 mb-0 transition ease-in-out duration-500 ${
                        open ? "lg:block block" : "lg:block hidden"
                    }`}
                    id="menuOptions"
                >
                    {Menus.map((Menu, index) =>
                        (isAdmin && Menu.roles.includes("admin")) ||
                        (isEmpleado && Menu.roles.includes("empleado")) ? (
                            <li
                                key={index}
                                className={`flex lg:text-sm md:text-base text-xl rounded-md p-2 cursor-pointer py-2 lg:px-3 px-8 my-1
                                    hover:bg-slate-200 lg:hover:px-1 hover:text-indigo-800 font-medium text-gray-900 items-left gap-x-5
                                    transition ease-in-out ${Menu.gap ? "mt-9" : "mt-2"}`}
                            >
                                {/* Cerrar sesión */}
                                {Menu.title === "Cerrar sesión" ? (
                                    <div
                                        onClick={Menu.action}
                                        className="flex items-center gap-x-4 cursor-pointer transition ease-in-out"
                                    >
                                        <img src={`./src/assets/${Menu.src}.svg`} alt={Menu.title} />
                                        <span className={`${!open && "hidden"} origin-left duration-700`}>
                                            {Menu.title}
                                        </span>
                                    </div>
                                ) : (
                                    <Link
                                        to={Menu.link}
                                        className="flex items-center gap-x-4 transition ease-in-out"
                                    >
                                        <img src={`./src/assets/${Menu.src}.svg`} alt={Menu.title} />
                                        <span
                                            className={`${!open && "hidden"} origin-left duration-700 flex items-center gap-2`}
                                        >
                                            {Menu.title}

                                            {/* Badge permisos pendientes */}
                                            {Menu.title === "Permisos" &&
                                                isAdmin &&
                                                pendientes > 0 && (
                                                    <span className="bg-red-600 text-white text-[10px] px-2 py-[2px] rounded-full">
                                                        {pendientes}
                                                    </span>
                                                )}
                                        </span>
                                    </Link>
                                )}
                            </li>
                        ) : null
                    )}
                </ul>
            </div>
        </div>
    );
}
