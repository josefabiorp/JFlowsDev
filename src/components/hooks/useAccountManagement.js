import { useNavigate } from 'react-router-dom';
import { useUser } from './UserContext'; // Asegúrate de importar correctamente
import { API_URL } from "../../config/api";

export const useAccountManagement = () => {
  const navigate = useNavigate();
  const { setUser, setToken } = useUser(); // Extraer setUser y setToken directamente del contexto

  const deleteAccount = async (token) => {
    try {
const response = await fetch(`${API_URL}/password/reset`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Error al eliminar la cuenta');
      }

      setUser(null);
      setToken('');
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      navigate('/login');
    } catch (err) {
      console.error(err.message);
    }
  };

  const logout = () => {
    setUser(null);
    setToken('');
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/');
  };

  return { deleteAccount, logout };
};
