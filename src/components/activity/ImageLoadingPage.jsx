import "../../index.css";
import { ButtonLoadingPage } from './ButtonLoadPage.jsx';
import React, { useState, useEffect } from "react";
import TextTransition, { presets } from 'react-text-transition';
const parrafos = ['Administra tus Optimiza la gestión de tu equipo en un solo lugar.','Más que control, un espacio para crecer juntos.', 'Controla tus ganancias','Gestión inteligente para empresas de cualquier tamaño.']
export function ImgLoadingPage({ image }) {
  const [index, setIndex] = React.useState(0);
  React.useEffect(() => {
    const intervalId = setInterval(
      () => setIndex((index) => index + 1),
      2500, // every 3 seconds
    );
    return () => clearTimeout(intervalId);
  }, []);

  
 return (
  <div className='relative flex items-center justify-start h-screen'>
    <img className='w-full h-full object-cover' src={image} alt='background' />

    <div className='absolute inset-0 flex items-center justify-start pl-32 pr-10'>
      <div className='text-left max-w-3xl'>
        <div>
          <h1 className='text-orange-600 lg:text-8xl text-6xl font-sans font-bold drop-shadow-md'>
            Agil. Fácil. Moderno
          </h1>
        </div>

        <TextTransition
          className='text-green-600 mt-10 p-4 font-sans text-4xl mb-10 drop-shadow-sm'
          springConfig={presets.slow}
        >
          {parrafos[index % parrafos.length]}
        </TextTransition>

        <div className='pt-10'>
          <ButtonLoadingPage />
        </div>
      </div>
    </div>
  </div>
);


};
