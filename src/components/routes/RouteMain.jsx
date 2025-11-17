import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';

import { useUser } from "../hooks/UserContext";

// Páginas
import { LoadingPage } from '../../LoadingPage.jsx';
import { Login } from '../activity/Login.jsx';
import { Register } from '../activity/Registro.jsx';
import { HomePage } from '../../HomePage.jsx';
import { Settings } from '../activity/Settings.jsx';
import { ResetPassword } from '../activity/ResetPassword.jsx';
import { ForgotPassword } from '../activity/ForgotPassword.jsx';

import { Sidebar } from '../Sidebar.jsx';
import { MantenimientoUsuarios } from '../activity/MantenimientoUsuarios.jsx';
import { EstadisticasFacturas } from '../activity/EstadisticasFacturas.jsx';
import { MantenimientoEmpresas } from '../activity/MantenimientoEmpresas.jsx';
import { RegistroAsistencias } from '../activity/RegistroAsistencias.jsx';
import { Descansos } from '../activity/Descansos.jsx';

// 🔥 NUEVOS módulos incorporados
import { Permisos } from '../activity/Permisos.jsx';
import { PoliticasEmpresa } from '../activity/PoliticasEmpresa.jsx';

// Protectores
import ProtectedRoute from './ProtectedRoute';


// ================================================
// Rutas públicas (si ya está logueado → Settings)
// ================================================
function PublicRoute({ children }) {
  const { user } = useUser();
  return user ? <Navigate to="/Settings" /> : children;
}


// ================================================
// Rutas solo para admins
// ================================================
function AdminRoute({ children }) {
  const { isAdmin } = useUser();
  const [hasNoPermission, setHasNoPermission] = useState(false);
  const [redirect, setRedirect] = useState(false);

  useEffect(() => {
    if (!isAdmin) {
      setHasNoPermission(true);
      const timer = setTimeout(() => setRedirect(true), 1000);
      return () => clearTimeout(timer);
    }
  }, [isAdmin]);

  if (redirect) {
    return <Navigate to="/Settings" />;
  }

  if (hasNoPermission) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <h1 className="text-6xl font-bold text-red-500">No tienes permisos!</h1>
      </div>
    );
  }

  return isAdmin ? children : null;
}


// ================================================
// ROUTER PRINCIPAL
// ================================================
export function RouteMain() {
  return (
    <Router>
      <Routes>

        <Route path="/" element={<LoadingPage />} />
        <Route path="/HomePage" element={<HomePage />} />

        {/* Login / Registro públicos */}
        <Route path="/LogIn" element={
          <PublicRoute><Login /></PublicRoute>
        } />

        <Route path="/Registro" element={
          <PublicRoute><Register /></PublicRoute>
        } />

        {/* Recuperación */}
        <Route path="/ResetPassword/:token" element={<ResetPassword />} />
        <Route path="/ForgotPassword" element={<ForgotPassword />} />

        {/* Sidebar suelto */}
        <Route path="/Sidebar" element={
          <ProtectedRoute><Sidebar /></ProtectedRoute>
        } />

        {/* Asistencias */}
        <Route path="/RegistroAsistencias" element={
          <ProtectedRoute><RegistroAsistencias /></ProtectedRoute>
        } />

        {/* ================================
            🔥 RUTA CORPORATIVA: PERMISOS
        ================================ */}
        <Route path="/Permisos" element={
          <ProtectedRoute>
            <Permisos />
          </ProtectedRoute>
        } />


        {/* ================================
            🔥 RUTA CORPORATIVA: POLÍTICAS
            SOLO ADMINISTRADORES
        ================================ */}
        <Route path="/PoliticasEmpresa" element={
          <ProtectedRoute>
            <AdminRoute>
              <PoliticasEmpresa />
            </AdminRoute>
          </ProtectedRoute>
        } />


        {/* ================================
            ADMIN ONLY
        ================================ */}
        <Route path="/MantenimientoUsuarios" element={
          <ProtectedRoute><AdminRoute><MantenimientoUsuarios /></AdminRoute></ProtectedRoute>
        } />

        <Route path="/EstadisticasFacturas" element={
          <ProtectedRoute><AdminRoute><EstadisticasFacturas /></AdminRoute></ProtectedRoute>
        } />

        {/* Empresas */}
        <Route path="/MantenimientoEmpresas" element={
          <PublicRoute><MantenimientoEmpresas /></PublicRoute>
        } />

        {/* Perfil */}
        <Route path="/Settings" element={
          <ProtectedRoute><Settings /></ProtectedRoute>
        } />

        {/* ================================
            🔥 NUEVA RUTA: DESCANSOS
        ================================ */}
        <Route path="/Descansos" element={
          <ProtectedRoute>
            <Descansos />
          </ProtectedRoute>
        } />

      </Routes>
    </Router>
  );
}
