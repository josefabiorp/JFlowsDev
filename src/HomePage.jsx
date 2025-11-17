import React from 'react';
import {Route, Routes} from "react-router-dom";

import { Header } from './components/Header.jsx';
import { Login } from "./components/activity/Login";
import { Register } from "./components/activity/Registro.jsx";


import{Settings}from "./components/activity/Settings";
import './index.css'
import { LoadingPage } from '././LoadingPage.jsx';
import { Footer } from './components/Footer.jsx';


export function  HomePage() {
  

  return (
    <div className="container bg-blue-100  w-screen h-max  " >

{/*
<Register />
<Login /> 
<Forgot_pass/>
<LoadingPage/>
<Registro_factura/>
<Registro_cliente/>
<MantenimientoProductos/> 
<MantenimientoProveedores/> 
<Compras/> 
  <Ventas/> 
 <Reporte_general/> 
*/}

  <Header/>
  <Settings/> 
  <Footer/>



    </div>
    
  );
}
