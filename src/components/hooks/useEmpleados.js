import { useState } from "react";
import toast from "react-hot-toast";

export function useEmpleados(API_URL, token, user) {
  const [empleados, setEmpleados] = useState([]);

  const fetchEmpleados = async () => {
    try {
      // ✅ Nueva ruta: con sucursal incluida
      const res = await fetch(`${API_URL}/usuarios/con-sucursal`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const data = await res.json();

      // Filtrar empleados según empresa / sucursal del usuario actual
      setEmpleados(
        Array.isArray(data)
          ? data.filter(
              (e) =>
                e.empresa_id === user.empresa_id &&
                (!user.sucursal_id || e.sucursal_id === user.sucursal_id)
            )
          : []
      );
    } catch (error) {
      console.error("Error al cargar empleados con sucursal:", error);
      toast.error("No se pudieron cargar los empleados");
    }
  };

  const exportarCSV = () => {
    const headers = ["ID", "Nombre", "Email", "Rol", "Sucursal"];
    const rows = empleados.map((e) => [
      e.id,
      e.nombre || "",
      e.email || "",
      e.role || e.rol || "",
      e.sucursal?.nombre || "—", // ✅ Muestra el nombre de la sucursal
    ]);
    const csv = [headers, ...rows].map((r) => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `empleados_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const imprimirTabla = () => {
    const w = window.open("", "_blank");
    if (!w) return;
    const rows = empleados
      .map(
        (e) => `
        <tr>
          <td style="padding:6px;border:1px solid #e5e7eb;">${e.id}</td>
          <td style="padding:6px;border:1px solid #e5e7eb;">${e.nombre || ""}</td>
          <td style="padding:6px;border:1px solid #e5e7eb;">${e.email || ""}</td>
          <td style="padding:6px;border:1px solid #e5e7eb;">${e.role || ""}</td>
          <td style="padding:6px;border:1px solid #e5e7eb;">${e.sucursal?.nombre || "—"}</td>
        </tr>`
      )
      .join("");
    w.document.write(`
      <html><head><title>Empleados</title></head>
      <body><h2>Listado de empleados</h2>
      <table style="border-collapse:collapse;font-family:sans-serif;">
        <thead>
          <tr><th>ID</th><th>Nombre</th><th>Email</th><th>Rol</th><th>Sucursal</th></tr>
        </thead>
        <tbody>${rows}</tbody>
      </table></body></html>`);
    w.document.close();
    w.print();
  };

  return { empleados, fetchEmpleados, exportarCSV, imprimirTabla };
}
