import { useState, useEffect } from 'react';
import { Header } from '../Header.jsx';
import { Footer } from '../Footer.jsx';
import { useAccountManagement } from '../hooks/useAccountManagement';
import { Sidebar } from '../Sidebar.jsx';
import { useUser } from '../hooks/UserContext';
import { Bar } from 'react-chartjs-2';
import { Chart, CategoryScale, LinearScale, BarElement, Title } from 'chart.js';
import { API_URL } from "../../config/api";

// Registra las escalas y elementos que necesitas
Chart.register(CategoryScale, LinearScale, BarElement, Title);

export function EstadisticasFacturas() {
  const { user } = useUser();
  const [facturas, setFacturas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalFactura, setTotalFactura] = useState(0);
  const [facturaSeleccionada, setFacturaSeleccionada] = useState(null); // Estado para la factura seleccionada
  const { logout } = useAccountManagement();

  const fetchFacturas = () => {
    fetch(`${API_URL}/facturas`)  
      .then(response => {
        if (!response.ok) {
          throw new Error('Error en la red');
        }
        return response.json();
      })
      .then(data => {
        // Filtrar las facturas por empresa_id
        const facturasFiltradas = data.filter(factura => factura.empresa_id === user.empresa_id);

        // Asegúrate de que los totales son números
        const updatedData = facturasFiltradas.map(factura => ({
          ...factura,
          total: parseFloat(factura.total),
        }));
        setFacturas(updatedData);
        setLoading(false);
      })
      .catch(error => {
        console.error('Error fetching facturas:', error);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchFacturas();
  }, [user.empresa_id]); // Recarga las facturas si cambia el empresa_id

  // Calcula el total de todas las facturas si no hay una seleccionada
  useEffect(() => {
    if (!facturaSeleccionada) {
      const total = facturas.reduce((acc, factura) => acc + factura.total, 0);
      setTotalFactura(total);
    } else {
      setTotalFactura(facturaSeleccionada.total);
    }
  }, [facturas, facturaSeleccionada]);

  if (loading) return <p>Cargando facturas...</p>;

  // Datos para el gráfico (muestra solo la factura seleccionada si existe)
  const data = {
    labels: facturaSeleccionada ? [`Factura ${facturaSeleccionada.id}`] : facturas.map(factura => `Factura ${factura.id}`),
    datasets: [
      {
        label: 'Total Factura',
        data: facturaSeleccionada ? [facturaSeleccionada.total] : facturas.map(factura => factura.total),
        backgroundColor: 'rgba(75, 192, 192, 0.6)',
      },
    ],
  };

  return (
    <>
      <Header />
      <div className="bg-slate-300 w-screen flex h-max gap-0">
        <div className="basis-1/4 mr-4 h-full">
          <Sidebar logout={logout} />
        </div>

        <div className="flex gap-6">
          {/* Contenido principal */}
          <div className="basis-2/4 py-2 pt-12 p-6 mx-auto mt-6 mb-4 bg-white rounded-lg shadow-lg overflow-hidden">
            <h1 className="text-3xl font-bold text-gray-800 mb-6">Estadísticas de Facturas</h1>
            <p className="text-lg">Total de {facturaSeleccionada ? `la factura ${facturaSeleccionada.id}` : 'facturas'}: ₡{totalFactura.toLocaleString('es-CR')}</p>
            <div className="h-64"> {/* Establecer una altura máxima para el gráfico */}
              <Bar data={data} options={{ responsive: true, maintainAspectRatio: false }} />
            </div>
          </div>

          <div className="basis-2/4 py-2 pt-12 p-6 mx-auto mt-6 mb-4 bg-white rounded-lg shadow-lg overflow-hidden">
            <h2 className="text-3xl font-bold text-gray-800 mb-6">Facturas Registradas</h2>
            <div className="max-h-64 overflow-y-auto"> {/* Establecer altura máxima y permitir el desbordamiento */}
              <table className="w-full">
                <thead className="bg-gray-200 text-gray-600">
                  <tr>
                    <th className="p-3 text-left">ID</th>
                    <th className="p-3 text-left">Total</th>
                    <th className="p-3 text-left">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {facturas.map((factura) => (
                    <tr key={factura.id} className="border-b border-gray-200">
                      <td className="p-3">{factura.id}</td>
                      <td className="p-3">₡{factura.total.toLocaleString('es-CR')}</td>
                      <td className="p-3">
                        <button
                          onClick={() => setFacturaSeleccionada(factura)} // Selecciona la factura para mostrar
                          className="text-sm text-center font-medium mt-1 px-4 py-1 rounded-xl bg-gray-100 text-gray-600 hover:bg-slate-200 hover:text-sky-800 transition duration-200">
                          Ver
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
