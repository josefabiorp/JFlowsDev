import { useState } from 'react';
import { Header } from '../Header.jsx';
import { Footer } from '../Footer.jsx';

// 🔥 IMPORTAMOS LA API GLOBAL
import { API_URL } from "../../config/api";

export function ForgotPassword() {
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const [errors, setErrors] = useState({});
  
    const handleChange = (e) => setEmail(e.target.value);
  
    const handleSubmit = async (e) => {
      e.preventDefault();
      setErrors({});
  
      if (!email) {
        setErrors({ email: 'El correo electrónico es obligatorio.' });
        return;
      }
  
      try {
        const response = await fetch(`${API_URL}/password/email`, {   // ←🔥 SOLO esto cambia
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ email }),
        });
  
        const data = await response.json();
  
        if (response.ok) {
          setMessage(data.message);
          setEmail('');
        } else {
          setErrors({ server: data.message || 'Ocurrió un error desconocido.' });
          setMessage('');
        }
      } catch (error) {
        console.error('Error:', error);
        setErrors({ server: 'Ocurrió un error enviando la petición.' });
        setMessage('');
      }
    };
  
    return (
    <>
    <Header />
      <div className="bg-slate-300 w-screen max-h-full pb-20 flex justify-center items-center h-screen">
        <div className="mx-auto max-w-2xl items-center">
          <div className='w-full max-w-md p-8 space-y-6 bg-white shadow-md rounded-lg'>
          <h2 className="text-2xl font-bold text-center">Recuperar Contraseña</h2>
          {message && <p className="text-sm text-cyan-600">{message}</p>}
          {errors.email && <p className="text-sm text-pink-700 text-center">{errors.email}</p>}
          {errors.server && <p className="text-sm text-pink-700 text-center">{errors.server}</p>}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="email" className="block mb-2 text-sm font-medium text-gray-900">
                Correo electrónico
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={handleChange}
                required
                className="w-full px-2 py-2 text-gray-700 bg-gray-50 border rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-600"
              />
            </div>
            <button
              type="submit"
              className="w-full px-4 py-2 text-white bg-sky-900 rounded-xl hover:bg-indigo-900 focus:ring-4 focus:outline-none focus:ring-blue-200">
              Enviar enlace de recuperación
            </button>
          </form>
        </div>
        </div>
      </div>
    <Footer/>
    </>
  );
}
