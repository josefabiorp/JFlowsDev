import React from 'react';
import { createRoot } from 'react-dom/client';
import { UserProvider } from './components/hooks/UserContext';
import { Toaster } from "react-hot-toast";
import { RouteMain } from './components/routes/RouteMain';

const rootElement = document.getElementById('root');
const root = createRoot(rootElement);

root.render(
  <React.StrictMode>
    <UserProvider>
      <RouteMain />
      {/* 👇 Este componente muestra las notificaciones */}
      <Toaster position="top-right" toastOptions={{ duration: 3000 }} />
    </UserProvider>
  </React.StrictMode>
);
