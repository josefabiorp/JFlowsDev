// src/utils/asistenciasUtils.js
import { timeStrToMinutes, minutesToLabel } from "./timeUtils";

/**
 * Aplica redondeo de tiempos según política
 */
export const applyRedondeo = (minutos, modo, paso = 5) => {
  if (!modo || modo === "normal") return minutos;
  if (modo === "arriba") return Math.ceil(minutos / paso) * paso;
  if (modo === "abajo") return Math.floor(minutos / paso) * paso;
  return minutos;
};

/**
 * Calcula el resumen avanzado de la jornada según políticas + descansos
 * (MISMA LÓGICA que tu componente original)
 */
export const buildResumenAvanzado = ({
  resumenAsistencia,
  politicas,
  descansos,
  user,
}) => {
  if (!resumenAsistencia || !politicas) return null;

  // Jornada en curso: solo mostramos info de política
  if (!resumenAsistencia.horaEntrada || !resumenAsistencia.horaSalida) {
    return {
      totalMin: null,
      totalMinAjustado: null,
      jornadaMin: politicas.jornada_diaria_horas * 60,
      horasExtraMin: 0,
      minutosDescansoTomados: null,
      excesoDescansoMin: 0,
      tieneExtras: false,
    };
  }

  const entradaMin = timeStrToMinutes(resumenAsistencia.horaEntrada);
  const salidaMin = timeStrToMinutes(resumenAsistencia.horaSalida);
  if (entradaMin == null || salidaMin == null) return null;

  const totalMin = Math.max(0, salidaMin - entradaMin);

  const jornadaMin = (politicas.jornada_diaria_horas || 8) * 60;
  const maxHorasExtraPorDia = politicas.max_horas_extra_por_dia || 0;
  const modoRedondeo = politicas.politica_redondeo_tiempos || "normal";

  // Descansos de HOY del usuario logueado
  const hoyStr = new Date().toISOString().slice(0, 10);
  const descansosHoy = Array.isArray(descansos)
    ? descansos.filter(
        (d) =>
          Number(d.usuario_id) === Number(user.id) &&
          (d.fecha === hoyStr || !d.fecha)
      )
    : [];

  let minutosDescansoTomados = 0;
  descansosHoy.forEach((d) => {
    const ini = timeStrToMinutes(d.hora_inicio);
    const fin = timeStrToMinutes(d.hora_fin);
    if (ini != null && fin != null && fin > ini) {
      minutosDescansoTomados += fin - ini;
    }
  });

  const minutosDescansoPermitidos =
    (politicas.minutos_descanso || 0) *
    (politicas.cantidad_descansos_permitidos || 0);

  const excesoDescansoMin = Math.max(
    0,
    minutosDescansoTomados - minutosDescansoPermitidos
  );

  // Horas extra simples: diferencia entre total y jornada
  let horasExtraMin = 0;
  if (totalMin > jornadaMin) {
    horasExtraMin = totalMin - jornadaMin;
    const maxExtraMin = maxHorasExtraPorDia * 60;
    if (maxExtraMin > 0) {
      horasExtraMin = Math.min(horasExtraMin, maxExtraMin);
    }
  }

  const totalMinAjustado = applyRedondeo(totalMin, modoRedondeo);

  return {
    totalMin,
    totalMinAjustado,
    jornadaMin,
    horasExtraMin,
    minutosDescansoTomados,
    excesoDescansoMin,
    tieneExtras: horasExtraMin > 0,
  };
};
