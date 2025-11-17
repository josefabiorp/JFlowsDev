import React from 'react';
import { useUser } from "./hooks/UserContext";
import systemLogo from "../assets/Logo-completo.png";

export const Footer = () => {

  const { user } = useUser();

  // Logo dinámico
  const empresaLogo = user?.empresa?.logo ? user.empresa.logo : null;
  const logoToShow = user ? empresaLogo || systemLogo : systemLogo;

  return (
    <div className='flex flex-col items-center justify-center bg-white max-w-full mx-auto p-6 lg:h-auto h-min'>

      <img
        src={logoToShow}
        alt="Logo DevSync"
        className="lg:w-56 w-24 mb-4 object-contain"
      />

      <p className='text-gray-400 text-center'>
        Copyright JFlows Dev ©2025<br />
        Hecho en Costa Rica ♡
      </p>

    </div>
  );
};
