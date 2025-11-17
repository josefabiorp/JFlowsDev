import { useState } from "react";
import { motion } from "framer-motion";
import { fadeln } from "../variants";

export function CardFlip() {

    return (
<motion.div 
variants={fadeln("up",0.2)}
initial= "hidden"
whileInView={"show"}
viewport={{once:false, amount:0.7}}
className="flex lg:flex-row flex-col gap-32 h-screen text-center mt-24">
    <div className="lg:basis-2/4 ml-24 bg-slate-50 bg-opacity-5 p-9 rounded-2xl h-min lg:block hidden">
        <h1 className="text-white lg:text-6xl font-bold lg:mb-7 lg:mt-0 lg:pb-5 rounded-lg justify-center text-center text-4xl -mt-6 lg:block hidden">
            Sobre nosotros
        </h1>
        <p className=" text-white lg:mt-5 font-sans text-justify font-semibold lg:text-2xl leading-relaxed rounded-lg mt-6 text-xl text-balance lg:mx-0 lg:mb-0 mx-32 lg:block hidden">
Somos una empresa dedicada al desarrollo de soluciones tecnológicas para la gestión del talento humano.
Nuestro sistema de control de empleados permite administrar asistencia, horarios, permisos y desempeño de forma centralizada, segura y eficiente.

Creemos que la tecnología debe facilitar el trabajo, no complicarlo.
Por eso ofrecemos una herramienta ágil, moderna y adaptable, diseñada para optimizar la organización del equipo y mejorar la toma de decisiones.</p>
    </div>

    <div className="lg:basis-1/4 bg-slate-50 bg-opacity-5 p-9 rounded-2xl h-min">
        <h1 className="text-white lg:text-6xl font-bold lg:mb-7 lg:mt-0 lg:pb-5 rounded-lg justify-center text-center text-4xl -mt-6">
            Contacto
        </h1>

        <p className="lg:hidden block text-white font-sans font-semibold leading-7 rounded-lg mt-6 text-base text-balance">  Somos una empresa especializada en soluciones de facturación electrónica, 
            comprometida con la innovación y la eficiencia en la gestión de documentos fiscales. Nuestro sistema facilita a las empresas la emisión, recepción y almacenamiento de facturas electrónicas de manera segura 
            y conforme a las normativas legales.</p>

        <motion.div
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            transition={{ type: "spring", stiffness: 400, damping: 10 }}>
            <span className="inline-flex lg:gap-2 gap-4 align-middle text-right items-baseline">
                <svg xmlns="http://www.w3.org/2000/svg" width="1.2em" height="1.2em" viewBox="0 0 24 24"><path fill="white" d="M1 3h22v18H1zm2 2v1.83l9 4.55l9-4.55V5zm18 4.07l-9 4.55l-9-4.55V19h18z"/></svg>            
                <p className="cursor-pointer text-white lg:mt-2 lg:mb-5 lg:ml-3 font-sans font-semibold lg:text-2xl leading-10 text-jus rounded-lg mt-6 text-xl text-balance lg:mx-0mx-32">
                    josefabio35@gmail.com </p>
                    
            </span>
            
        </motion.div>
        <motion.div
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            transition={{ type: "spring", stiffness: 400, damping: 10 }}>
            <span className="inline-flex align-middle gap-6 text-right items-baseline">
            <svg xmlns="http://www.w3.org/2000/svg" width="1.2em" height="1.2em" viewBox="0 0 24 24"><path fill="white" d="M1 2h8.58l1.487 6.69l-1.86 1.86a14.1 14.1 0 0 0 4.243 4.242l1.86-1.859L22 14.42V23h-1a19.9 19.9 0 0 1-10.85-3.196a20.1 20.1 0 0 1-5.954-5.954A19.9 19.9 0 0 1 1 3zm2.027 2a17.9 17.9 0 0 0 2.849 8.764a18.1 18.1 0 0 0 5.36 5.36A17.9 17.9 0 0 0 20 20.973v-4.949l-4.053-.9l-2.174 2.175l-.663-.377a16.07 16.07 0 0 1-6.032-6.032l-.377-.663l2.175-2.174L7.976 4z"/></svg> 
            <p className="cursor-pointer text-white lg:mt-5 lg:mb-5 lg:ml-3 font-sans font-semibold lg:text-2xl leading-10 text-jus rounded-lg mt-6 text-xl text-balance lg:mx-0mx-32">
            (+506) 71531161 </p>
            </span>
        </motion.div>
        
        <motion.div
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            transition={{ type: "spring", stiffness: 400, damping: 10 }}>
            <span className="inline-flex gap-4 text-left items-baseline">
            <svg xmlns="http://www.w3.org/2000/svg" width="1.2em" height="1.2em" viewBox="0 0 24 24"><path fill="white" d="m12 1.198l10 8.334V22H2V9.532zM10 20h4v-5h-4zm6 0h4v-9.532l-8-6.666l-8 6.666V20h4v-7h8z"/></svg>            
            <p className=" text-white lg:mt-5 lg:mb-5 lg:ml-3 font-sans font-semibold lg:text-2xl leading-10 text-jus rounded-lg mt-6 text-xl text-balance lg:mx-0mx-32">
            Esparza, Puntarenas </p>
            </span>
        </motion.div>

    </div>

    </motion.div>
    );
};
