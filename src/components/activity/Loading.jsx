import React from "react";
import { useUser } from "../hooks/UserContext";
import systemLogo from "../../assets/Logo-completo.png";

export const Loading = () => {

    // Obtener el usuario autenticado
    const { user } = useUser();

    // Si el usuario tiene empresa y logo → úsalo
    const empresaLogo = user?.empresa?.logo ? user.empresa.logo : null;

    // Logo por defecto si no hay usuario
    const logoToShow = user ? empresaLogo || systemLogo : systemLogo;

    return (
        <div className="flex items-center justify-center w-full h-full mt-48 flex-col">

            <div className="flex justify-center items-center space-x-1">
                <img
                    src={logoToShow}
                    className="w-60 h-60 cursor-pointer duration-300 animate-spin object-contain"
                    alt="Logo"
                />
            </div>

            <p className="text-2xl text-gray-500 mt-14 font-semibold italic">
                Cargando ...
            </p>
        </div>
    );
};
