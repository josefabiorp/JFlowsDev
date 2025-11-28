import "../../index.css";
import { ButtonLoadingPage } from './ButtonLoadPage.jsx';
import React, { useState, useEffect } from "react";
import TextTransition, { presets } from 'react-text-transition';

const parrafos = [
  'Optimiza la gestión de tu equipo en un solo lugar.',
  'Más que control, un espacio para crecer juntos.',
  'Controla tus ganancias',
  'Gestión inteligente para empresas de cualquier tamaño.'
];

export function ImgLoadingPage({ image }) {
  const [index, setIndex] = React.useState(0);

  React.useEffect(() => {
    const intervalId = setInterval(
      () => setIndex((index) => index + 1),
      2500
    );
    return () => clearInterval(intervalId);
  }, []);

  return (
    <div className="relative w-full min-h-screen flex items-center justify-center overflow-hidden">

      {/* Imagen — responsive B */}
      <img
        className="absolute inset-0 w-full h-full object-contain md:object-cover"
        src={image}
        alt="background"
      />

      {/* Overlay degradado suave para mejorar legibilidad */}
      <div className="absolute inset-0 bg-black/40 md:bg-black/20"></div>

      {/* Contenido */}
      <div className="
        relative z-10 w-full 
        px-6 md:px-20 lg:px-32 
        py-12 md:py-0 
        max-w-4xl
        flex flex-col items-start
        justify-center
      ">

        {/* TÍTULO */}
        <h1 className="
          text-orange-500 
          text-4xl sm:text-5xl md:text-6xl lg:text-7xl 
          font-bold drop-shadow-md leading-tight
        ">
          Ágil. Fácil. Moderno
        </h1>

        {/* FRASE — siempre debajo, nunca tapa el botón */}
        <TextTransition
          className="
            text-green-400 
            mt-6 
            text-xl sm:text-2xl md:text-3xl 
            font-medium drop-shadow-sm
          "
          springConfig={presets.slow}
        >
          {parrafos[index % parrafos.length]}
        </TextTransition>

        {/* Botón — SIEMPRE aislado para que nada lo invada */}
        <div className="mt-10">
          <ButtonLoadingPage />
        </div>

      </div>
    </div>
  );
}
