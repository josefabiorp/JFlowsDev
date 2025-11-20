import { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom'; // Importa useNavigate
import { Header } from '../Header.jsx';
import { API_URL } from "../../config/api";

export function ResetPassword() {
  const { token } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');
  const [message, setMessage] = useState('');
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const query = new URLSearchParams(location.search);
    const emailFromUrl = query.get('email');
    setEmail(emailFromUrl);
  }, [location]);

  const handlePasswordChange = (e) => setPassword(e.target.value);
  
  const handlePasswordConfirmationChange = (e) => setPasswordConfirmation(e.target.value); 

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});

    // Validaciones
    if (!password || !passwordConfirmation) {
      setErrors({ password: 'Ambas contraseñas son obligatorias.' });
      return;
    }
    if (password !== passwordConfirmation) {
      setErrors({ password: 'Las contraseñas no coinciden.' });
      return;
    }

    setLoading(true);

    try {
const response = await fetch(`${API_URL}/password/reset`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password, password_confirmation: passwordConfirmation, token }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage(data.message || 'Contraseña restablecida con éxito.');
        setPassword('');
        setPasswordConfirmation('');
        
        // Redirige al usuario al login después de un restablecimiento exitoso
        navigate('/login'); 
      } else {
        setErrors({ server: data.message || 'Ocurrió un error.' });
      }
    } catch (error) {
      setErrors({ server: 'Ocurrió un error al enviar la solicitud.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
    <Header />
    <div className="bg-slate-300 w-screen max-h-full pb-20 flex justify-center items-center h-screen">
      <div className="mx-auto max-w-2xl items-center"> 
        <div className='w-full max-w-md p-8 space-y-6 bg-white shadow-md rounded-lg'>
          <h2 className="text-2xl font-bold text-cente">Restablecer Contraseña</h2>
          {message && <p className="text-sm text-cyan-600">{message}</p>}
          {errors.password && <p className="text-sm text-pink-700 text-center">{errors.password}</p>}
          {errors.server && <p className="text-sm text-pink-700 text-center">{errors.server}</p>}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="password" className="block mb-2 text-sm font-medium text-gray-900">Nueva Contraseña</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={handlePasswordChange}
              required
              className="w-full px-2 py-2 text-gray-700 bg-gray-50 border rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-600"
              />
          </div>
          <div>
            <label htmlFor="password_confirmation" className="block mb-2 text-sm font-medium text-gray-900">Confirmar Nueva Contraseña</label>
            <input
              type="password"
              id="password_confirmation"
              value={passwordConfirmation}
              onChange={handlePasswordConfirmationChange}
              required
              className="w-full px-4 py-2 text-gray-700 bg-gray-50 border rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-600"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className={`w-full px-4 py-2 text-white ${loading ? 'bg-gray-400' : 'bg-sky-900 '} rounded-lg hover:bg-indigo-900 focus:ring-4 focus:outline-none focus:ring-blue-200`}
          >
            {loading ? 'Cargando...' : 'Restablecer Contraseña'}
          </button>
        </form>
      </div></div>
    </div>
  </>
  );
}
