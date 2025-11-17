import "../../index.css";
import { motion } from "framer-motion";
import { fadeln } from "../variants";

export function CardLoadingPage({ image00, image01, image02, image03 }) {
  return (
  
    <div className='bg-slate-300  lg:flex flex-col justify-center items-center lg:h-screen lg:relative' id="servicios">
<div class="absolute top-20 left-40 w-72 h-72 lg:bg-slate-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
    <div class="absolute top-14 right-24 w-72 h-72 lg:bg-sky-400 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-1000"></div>
    <div class="absolute -bottom-8 left-96 w-72 h-72 lg:bg-blue-500 rounded-full mix-blend-multiply filter blur-xl bg-opacity-20 opacity-20 animate-blob animation-delay-2000"></div>
        <h1 className='text-6xl text-center font-bold mb-1 text-blue-950 p-10
        lg:text-7xl  lg:justify-center '>Nuestros servicios</h1>
      <div>
  

      <motion.div 
    variants={fadeln("up",0.2)}
    initial= "hidden"
    whileInView={"show"}
    viewport={{once:true, amount:0.7}}
    className='w-full  lg:flex lg:space-x-12 lg:relative items-center content-center lg:m-30 mr-5 lg:p-30 px-24'>

        <motion.div 
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        transition={{ type: "spring", stiffness: 400, damping: 10 }}

          className='bg-white shadow-md p-4 rounded-md text-center content-center mb-7 lg:h-60 lg:w-40 w-full'>
          <img src={image00} alt="Card 1" className='h-32 w-32 object-cover mx-auto mb-4' />
          <h3 className='font-semibold lg:text-base text-2xl'>Rapidez</h3>
          <p className='text-gray-600 lg:text-sm text-1xl'>Para un rendimiento óptimo</p>
        </motion.div>

        <motion.div 
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        transition={{ type: "spring", stiffness: 400, damping: 10 }}

        className='bg-white shadow-md p-4 rounded-md text-center content-center mb-7 lg:h-60 lg:w-40 w-full'>
          <img src={image01} alt="Card 2" className='h-32 w-32 object-cover mx-auto mb-4' />
          <h3 className='font-semibold lg:text-base text-2xl'>Eficiencia</h3>
          <p className='text-gray-600 lg:text-sm text-1xl'>Para una gestión inteligente</p>
        </motion.div>

        <motion.div 
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        transition={{ type: "spring", stiffness: 400, damping: 10 }}

        className='bg-white shadow-md p-4 rounded-md text-center content-center mb-7 lg:h-60 lg:w-40 w-full'>
          <img src={image02} alt="Card 3" className='h-32 w-32 object-cover mx-auto mb-4' />
          <h3 className='font-semibold lg:text-base text-2xl text-balance'>Organiza</h3>
          <p className='text-gray-600 lg:text-sm text-1xl'>Para poductividad continua </p>
        </motion.div>

        <motion.div 
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        transition={{ type: "spring", stiffness: 400, damping: 10 }}
        
        className='bg-white shadow-md p-4 rounded-md text-center content-center lg:mb-7 mb-24 lg:h-60 lg:w-40 w-full'>
          <img src={image03} alt="Card 4" className='h-32 lg:w-32 w-full object-cover mx-auto lg:mb-0 mb-4' />
          <h3 className='font-semibold lg:text-base text-2xl'>Usuarios</h3>
          <p className='text-gray-600 lg:text-sm text-1xl'>Para un equipo conectado</p>
        </motion.div>
      
    </motion.div>
    </div>
    </div>
  );
}
