import React, { createContext, useState, useEffect, useContext } from 'react';

// Crear el contexto
const UserContext = createContext();

// Crear un hook para usar el contexto
const useUser = () => useContext(UserContext);

// Crear el proveedor del contexto
const UserProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const storedUser = localStorage.getItem('user');
    return storedUser ? JSON.parse(storedUser) : null;
  });
  const [token, setToken] = useState(() => {
    return localStorage.getItem('token') || '';
  });
  
  // Agregar lógica para los roles
  const isAdmin = user?.role === 'admin';  // Verifica si el usuario es admin
  const isEmpleado = user?.role === 'empleado'; // Verifica si el usuario es empleado

  useEffect(() => {
    if (user) {
      localStorage.setItem('user', JSON.stringify(user));
    } else {
      localStorage.removeItem('user');
    }
  }, [user]);

  useEffect(() => {
    if (token) {
      localStorage.setItem('token', token);
    } else {
      localStorage.removeItem('token');
    }
  }, [token]);

  return (
    <UserContext.Provider value={{ user, setUser, token, setToken, isAdmin, isEmpleado }}>
      {children}
    </UserContext.Provider>
  );
};

export { UserProvider, useUser }; // Exportar de forma individual
