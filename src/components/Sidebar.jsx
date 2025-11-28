import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";

import logoImage from "../assets/Logo-completo.png";
import controlImage from "../assets/control.svg";

import { useUser } from "./hooks/UserContext";
import { usePermisos } from "./hooks/usePermisos";
import { API_URL } from "../config/api";

// Íconos
import IconVentas from "../assets/Ventas.svg";
import IconCompras from "../assets/Compras.svg";
import IconUsuarios from "../assets/usuarios.svg";
import IconProveedores from "../assets/Proveedores.svg";
import IconClientes from "../assets/Clientes.svg";
import IconEstadisticas from "../assets/Estadisticas.svg";
import IconConfiguracion from "../assets/Configuracion.svg";
import IconCerrarSesion from "../assets/CerrarSesion.svg";
import IconPoliticasEmpresa from "../assets/politicas.png";

// Mapa
const iconMap = {
    Ventas: IconVentas,
    Compras: IconCompras,
    usuarios: IconUsuarios,
    Proveedores: IconProveedores,
    Clientes: IconClientes,
    Estadisticas: IconEstadisticas,
    Configuracion: IconConfiguracion,
    PoliticasEmpresa: IconPoliticasEmpresa,
    CerrarSesion: IconCerrarSesion,
};

export function Sidebar({ logout }) {
    const [open, setOpen] = useState(true);
    const navigate = useNavigate();
    const { user, isAdmin, isEmpleado, token } = useUser();

    const empresaLogo = user?.empresa?.logo ? user.empresa.logo : null;
    const logoToShow = user ? empresaLogo || logoImage : logoImage;

    const handleClick = () => navigate("/");

    const { pendientes, fetchPendientes } = usePermisos(API_URL, token, user);

    useEffect(() => {
        if (isAdmin && token && user?.id) {
            fetchPendientes();
        }
    }, [isAdmin, token, user, fetchPendientes]);

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
        {
            title: "Descansos",
            src: "Proveedores",
            link: "/Descansos",
            roles: ["admin", "empleado"],
        },
        {
            title: "Comunicación interna",
            src: "Clientes",
            link: "/Chat",
            roles: ["admin", "empleado"],
        },
        {
            title: "Políticas de Empresa",
            src: "PoliticasEmpresa",
            link: "/PoliticasEmpresa",
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
        <div className="flex min-h-dvh w-full h-fit">
            <div
                className={`flex-h-grow h-fit ${
                    open
                        ? "lg:w-72 w-screen bg-slate-50 pb-[50rem]"
                        : "lg:w-28 w-16 lg:bg-slate-50 lg:pb-[50rem]"
                } transition-width lg:p-5 lg:pt-10 relative ease-in-out duration-300`}
            >

                {/* Botón toggle */}
                <img
                    src={controlImage}
                    className={`
                        absolute cursor-pointer top-8
                        transition duration-300 border border-gray-200 rounded-full shadow
                        ${open ? "right-[-18px] w-10" : "right-[-18px] w-8 rotate-180"}
                    `}
                    onClick={() => setOpen(!open)}
                    alt="Control"
                />

                {/* Logo */}
                <div className="flex gap-x-6 items-center">
                    <img
                        onClick={handleClick}
                        src={logoToShow}
                        className={`cursor-pointer duration-500 hidden lg:block ${
                            open && "rotate-[360deg]"
                        } w-36`}
                        alt="Logo"
                    />
                </div>

                {/* Menú */}
                <ul
                    className={`flex-grow pt-6 transition ${
                        open ? "block" : "hidden lg:block"
                    }`}
                >
                    {Menus.map((Menu, index) =>
                        (isAdmin && Menu.roles.includes("admin")) ||
                        (isEmpleado && Menu.roles.includes("empleado")) ? (
                            <li
                                key={index}
                                className={`flex lg:text-sm md:text-base text-xl rounded-md cursor-pointer py-2 px-8 lg:px-3 my-1
                                    hover:bg-slate-200 hover:text-indigo-800 font-medium text-gray-900 gap-x-5
                                    transition ${Menu.gap ? "mt-9" : "mt-2"}`}
                            >
                                {/* Cerrar sesión */}
                                {Menu.title === "Cerrar sesión" ? (
                                    <div
                                        onClick={Menu.action}
                                        className="flex items-center gap-x-4"
                                    >
                                        <img
                                            src={iconMap[Menu.src]}
                                            alt={Menu.title}
                                            className="w-6 h-6 object-contain"
                                        />

                                        {/* TEXTO — móvil oculto; escritorio abierto visible */}
                                        <span
                                            className={`
                                                hidden
                                                ${open ? "lg:inline-flex" : "lg:hidden"}
                                                duration-300 whitespace-nowrap
                                            `}
                                        >
                                            {Menu.title}
                                        </span>
                                    </div>
                                ) : (
                                    <Link to={Menu.link} className="flex items-center gap-x-4">
                                        <img
                                            src={iconMap[Menu.src]}
                                            alt={Menu.title}
                                            className="w-6 h-6 object-contain"
                                        />

                                        {/* TEXTO — móvil oculto; escritorio abierto visible */}
                                        <span
                                            className={`
                                                hidden 
                                                ${open ? "lg:inline-flex" : "lg:hidden"}
                                                duration-300 whitespace-nowrap items-center gap-2
                                            `}
                                        >
                                            {Menu.title}

                                            {/* badge */}
                                            {Menu.title === "Permisos" &&
                                                isAdmin &&
                                                pendientes > 0 &&
                                                open && (
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
