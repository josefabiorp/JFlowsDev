import { useState, useEffect } from "react";
import { Header } from "../Header.jsx";
import { Footer } from "../Footer.jsx";
import { Sidebar } from "../Sidebar.jsx";
import { useAccountManagement } from "../hooks/useAccountManagement.js";
import { useUser } from "../hooks/UserContext";
import { Loading } from "./Loading.jsx";
import toast from "react-hot-toast";

import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

import { AppModal } from "./AppModal.jsx";

export function MantenimientoUsuarios() {
  const { token, user } = useUser();
  const { logout } = useAccountManagement();
  const API_URL = "https://jflowsdev.duckdns.org/api";

  // Estados principales
  const [usuarios, setUsuarios] = useState([]);
  const [sucursales, setSucursales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingUsuario, setEditingUsuario] = useState(null);
  const [errors, setErrors] = useState({});

  // Formulario de usuario
  const [formData, setFormData] = useState({
    nombre: "",
    email: "",
    cedula: "",
    empresa_id: user?.empresa_id || "",
    sucursal_id: "",
    role: "",
    password: "",
    password_confirmation: "",
  });

  // Modal de sucursal (usa AppModal)
  const [showModal, setShowModal] = useState(false);
  const [newSucursal, setNewSucursal] = useState({
    nombre: "",
    direccion: "",
    latitud: "",
    longitud: "",
    empresa_id: user?.empresa_id || "",
  });

  /** ======================
   *  SINCRONIZAR EMPRESA LOGUEADA
   * ====================== */
  useEffect(() => {
    if (user?.empresa_id) {
      setNewSucursal((prev) => ({
        ...prev,
        empresa_id: user.empresa_id,
      }));
    }
  }, [user]);

  /** ======================
   *  CARGA DE DATOS
   * ====================== */
  useEffect(() => {
    if (!token) return;
    fetchUsuarios();
    fetchSucursales();
  }, [token]);

  const fetchUsuarios = async () => {
    try {
      const res = await fetch(`${API_URL}/usuarios/con-sucursal`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Error al obtener usuarios");
      const data = await res.json();
      setUsuarios(data.filter((u) => u.empresa_id === user?.empresa_id));
    } catch (err) {
      toast.error("No se pudieron cargar los usuarios");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchSucursales = async () => {
    try {
      const res = await fetch(`${API_URL}/sucursales`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Error al obtener sucursales");
      const data = await res.json();
      setSucursales(data.filter((s) => s.empresa_id === user?.empresa_id));
    } catch (err) {
      toast.error("No se pudieron cargar las sucursales");
      console.error(err);
    }
  };

  /** ======================
   *  CRUD USUARIOS
   * ====================== */
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.password_confirmation) {
      setErrors({ password_confirmation: "Las contraseñas no coinciden" });
      return;
    }

    try {
      const res = await fetch(`${API_URL}/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...formData,
          empresa_id: user?.empresa_id || formData.empresa_id || 1,
          sucursal_id: formData.sucursal_id || 1,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setErrors(data.errors || {});
        toast.error("Error al registrar el usuario");
        return;
      }
      toast.success("Usuario registrado con éxito");
      fetchUsuarios();
      resetForm();
    } catch (err) {
      toast.error("Error de conexión con el servidor");
      console.error(err);
    }
  };

 const handleUpdate = async (e) => {
  e.preventDefault();

  try {
    const res = await fetch(`${API_URL}/admin/usuarios/${editingUsuario}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        nombre: formData.nombre,
        email: formData.email,
        cedula: formData.cedula,
        empresa_id: user.empresa_id,
        sucursal_id: formData.sucursal_id,
        role: formData.role,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      toast.error("Error al actualizar el usuario");
      console.log(data);
      return;
    }

    toast.success("Usuario actualizado correctamente");
    fetchUsuarios();
    resetForm();
  } catch (err) {
    toast.error("No se pudo conectar con el servidor");
    console.error(err);
  }
};

  const handleDelete = async (id) => {
    if (!window.confirm("¿Seguro que deseas eliminar este usuario?")) return;
    try {
      const res = await fetch(`${API_URL}/usuarios/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        toast.success("Usuario eliminado");
        fetchUsuarios();
      }
    } catch (err) {
      toast.error("Error al eliminar el usuario");
      console.error(err);
    }
  };

  const handleEdit = (usuario) => {
    setFormData({
      nombre: usuario.nombre,
      email: usuario.email,
      cedula: usuario.cedula,
      empresa_id: user?.empresa_id || "",
      sucursal_id: usuario.sucursal_id || "",
      role: usuario.role,
      password: "",
      password_confirmation: "",
    });
    setEditingUsuario(usuario.id);
  };

  const resetForm = () => {
    setFormData({
      nombre: "",
      email: "",
      cedula: "",
      empresa_id: user?.empresa_id || "",
      sucursal_id: "",
      role: "",
      password: "",
      password_confirmation: "",
    });
    setEditingUsuario(null);
    setErrors({});
  };

  /** ======================
   *  CRUD SUCURSAL (MODAL)
   * ====================== */
  const handleSucursalChange = (e) => {
    const { name, value } = e.target;
    setNewSucursal((prev) => ({ ...prev, [name]: value }));
  };

  const handleSucursalSubmit = async (e) => {
    e.preventDefault();

    if (!user?.empresa_id) {
      toast.error("No se detectó empresa asociada al usuario logueado.");
      return;
    }

    const sucursalData = {
      ...newSucursal,
      empresa_id: user.empresa_id,
      latitud: newSucursal.latitud
        ? parseFloat(newSucursal.latitud)
        : null,
      longitud: newSucursal.longitud
        ? parseFloat(newSucursal.longitud)
        : null,
    };

    try {
      const res = await fetch(`${API_URL}/sucursales`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(sucursalData),
      });

      const data = await res.json();

      if (!res.ok) {
        console.error("Error al crear sucursal:", data);
        toast.error("Error al registrar la sucursal");
        return;
      }

      toast.success("Sucursal registrada con éxito");
      await fetchSucursales();
      setShowModal(false);
      setNewSucursal({
        nombre: "",
        direccion: "",
        latitud: "",
        longitud: "",
        empresa_id: user.empresa_id,
      });
    } catch (err) {
      toast.error("Error de conexión con el servidor");
      console.error(err);
    }
  };

  /** ======================
   *  UI
   * ====================== */
  if (loading)
    return (
      <div className="duration-700">
        <Loading />
      </div>
    );

  return (
    <>
      <Header />
      <div className="flex flex-col lg:flex-row bg-slate-200 min-h-screen">
        <div className="w-full lg:w-1/4">
          <Sidebar logout={logout} />
        </div>

        <div className="flex-1 p-6 lg:p-10">
          <div className="max-w-7xl mx-auto bg-white rounded-2xl shadow-lg p-8 transition-all duration-300 hover:shadow-xl">
            <h1 className="text-3xl font-bold text-sky-900 mb-8 text-center">
              {editingUsuario ? "Actualizar Usuario" : "Registrar Usuario"}
            </h1>

            <form
              onSubmit={editingUsuario ? handleUpdate : handleSubmit}
              className="grid grid-cols-1 md:grid-cols-2 gap-6"
            >
              <Input
                label="Nombre"
                name="nombre"
                value={formData.nombre}
                onChange={handleChange}
              />
              <Input
                label="Email"
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
              />
              <Input
                label="Cédula"
                name="cedula"
                value={formData.cedula}
                onChange={handleChange}
              />

              {/* Selector de Sucursal */}
              <div>
                <label className="flex justify-between items-center font-semibold text-gray-700">
                  <span>Sucursal</span>
                  <button
                    type="button"
                    onClick={() => setShowModal(true)}
                    className="text-sm text-blue-600 underline hover:text-blue-800"
                  >
                    Registrar nueva
                  </button>
                </label>
                <select
                  name="sucursal_id"
                  value={formData.sucursal_id}
                  onChange={handleChange}
                  className="w-full mt-1 p-2 border rounded-md focus:ring-2 focus:ring-sky-700"
                  required
                >
                  <option value="">Seleccione una sucursal</option>
                  {sucursales.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.nombre}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-gray-700">
                  Rol
                </label>
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  required
                  className="w-full mt-1 p-2 border rounded-md focus:ring-2 focus:ring-sky-700"
                >
                  <option value="">Seleccione un rol</option>
                  <option value="admin">Administrador</option>
                  <option value="contador">Contador</option>
                  <option value="empleado">Empleado</option>
                </select>
              </div>

              {!editingUsuario && (
                <>
                  <Input
                    label="Contraseña"
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    autoComplete="new-password"
                  />
                  <Input
                    label="Confirmar Contraseña"
                    type="password"
                    name="password_confirmation"
                    value={formData.password_confirmation}
                    onChange={handleChange}
                    autoComplete="new-password"
                    error={errors.password_confirmation}
                  />
                </>
              )}

              <div className="md:col-span-2">
                <button
                  type="submit"
                  className="w-full bg-sky-800 hover:bg-indigo-900 text-white p-3 rounded-md font-medium transition-all"
                >
                  {editingUsuario ? "Actualizar Usuario" : "Registrar Usuario"}
                </button>
              </div>
            </form>

            {/* Tabla de usuarios */}
            <h2 className="text-xl font-bold mt-10 mb-4 text-gray-800">
              Usuarios Registrados
            </h2>
            <div className="overflow-x-auto">
              <table className="min-w-full border border-gray-200 text-sm rounded-lg overflow-hidden">
                <thead className="bg-gray-100 text-gray-700 uppercase">
                  <tr>
                    {[
                      "ID",
                      "Nombre",
                      "Email",
                      "Rol",
                      "Sucursal",
                      "Acciones",
                    ].map((h) => (
                      <th key={h} className="border px-4 py-2 text-left">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {usuarios.map((u) => (
                    <tr
                      key={u.id}
                      className="hover:bg-slate-50 transition"
                    >
                      <td className="border px-4 py-2">{u.id}</td>
                      <td className="border px-4 py-2">{u.nombre}</td>
                      <td className="border px-4 py-2">{u.email}</td>
                      <td className="border px-4 py-2">{u.role}</td>
                      <td className="border px-4 py-2">
                        {u.sucursal?.nombre || "—"}
                      </td>
                      <td className="border px-4 py-2 flex flex-wrap gap-2">
                        <button
                          onClick={() => handleEdit(u)}
                          className="px-3 py-1 bg-gray-100 hover:bg-slate-200 text-gray-700 rounded-md"
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => handleDelete(u.id)}
                          className="px-3 py-1 bg-red-100 hover:bg-red-200 text-red-700 rounded-md"
                        >
                          Eliminar
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

      {/* MODAL SUCURSAL con AppModal */}
      <AppModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title="🏢 Registrar Nueva Sucursal"
        size="md"
      >
        <form onSubmit={handleSucursalSubmit} className="space-y-6">
          <div className="grid md:grid-cols-2 gap-5">
            <Input
              label="Nombre"
              name="nombre"
              value={newSucursal.nombre}
              onChange={handleSucursalChange}
            />
            <Input
              label="Dirección"
              name="direccion"
              value={newSucursal.direccion}
              onChange={handleSucursalChange}
            />
          </div>

          <Input
            label="Empresa asociada"
            name="empresa_id"
            value={newSucursal.empresa_id || user?.empresa_id || ""}
            onChange={() => {}}
            type="text"
            readOnly
          />

          <div>
            <p className="text-sm text-gray-600 mb-2">
              Hacé clic en el mapa para definir la ubicación de la sucursal.
            </p>
            <div className="rounded-xl overflow-hidden border border-gray-300 shadow-inner">
              <MapSelector
                lat={newSucursal.latitud}
                lng={newSucursal.longitud}
                setNewSucursal={setNewSucursal}
              />
            </div>
          </div>

          <div className="flex justify-end gap-4 pt-4">
            <button
              type="button"
              onClick={() => setShowModal(false)}
              className="px-5 py-2 rounded-lg border border-gray-300 hover:bg-gray-100 text-gray-700 font-medium transition-all"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-6 py-2 rounded-lg bg-sky-700 hover:bg-sky-800 text-white font-semibold shadow-sm transition-all"
            >
              Guardar
            </button>
          </div>
        </form>
      </AppModal>

      <Footer />
    </>
  );
}

/* ===========================
 *  Subcomponente Input
 * =========================== */
function Input({
  label,
  name,
  type = "text",
  value,
  onChange,
  error,
  autoComplete,
  readOnly,
}) {
  return (
    <div>
      <label className="block font-semibold text-gray-700">{label}</label>
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        autoComplete={autoComplete}
        placeholder={`Ingrese ${label.toLowerCase()}`}
        readOnly={readOnly}
        className={`w-full mt-1 p-2 border rounded-md focus:ring-2 focus:ring-sky-700 ${
          error ? "border-pink-500" : ""
        } ${readOnly ? "bg-gray-100 text-gray-500 cursor-not-allowed" : ""}`}
        required={!readOnly}
      />
      {error && <p className="text-pink-700 text-sm mt-1">{error}</p>}
    </div>
  );
}

/* ===========================
 *  Subcomponente Mapa
 * =========================== */
function MapSelector({ lat, lng, setNewSucursal }) {
  const defaultPosition = [
    lat || 9.9281,
    lng || -84.0907, // San José, CR como fallback
  ];

  const markerIcon = new L.Icon({
    iconUrl:
      "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
    shadowUrl:
      "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
  });

  const MapClickHandler = () => {
    useMapEvents({
      click(e) {
        const { lat, lng } = e.latlng;
        setNewSucursal((prev) => ({
          ...prev,
          latitud: lat.toFixed(6),
          longitud: lng.toFixed(6),
        }));
      },
    });
    return null;
  };

  const hasCoords = lat && lng;
  const markerPos = hasCoords
    ? [parseFloat(lat), parseFloat(lng)]
    : null;

  return (
    <MapContainer
      center={defaultPosition}
      zoom={8}
      className="h-72 w-full rounded-lg"
      scrollWheelZoom
    >
      <TileLayer
        attribution='&copy; <a href="https://openstreetmap.org">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <MapClickHandler />
      {markerPos && <Marker position={markerPos} icon={markerIcon} />}
    </MapContainer>
  );
}
