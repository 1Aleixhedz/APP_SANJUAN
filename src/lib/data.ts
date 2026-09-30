/** Utilidades de fechas y (legacy) seed local — el historial vivo viene de Supabase. */

const DIA = 24 * 60 * 60 * 1000;

/** Medianoche de hoy. */
export function inicioDeHoy(): number {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}

/** Lunes de la semana en curso a las 00:00. */
export function inicioDeSemana(referencia = Date.now()): number {
  const d = new Date(referencia);
  d.setHours(0, 0, 0, 0);
  const dia = d.getDay();
  return d.getTime() - (dia === 0 ? 6 : dia - 1) * DIA;
}

/** Día 1 del mes en curso a las 00:00. */
export function inicioDeMes(referencia = Date.now()): number {
  const d = new Date(referencia);
  d.setHours(0, 0, 0, 0);
  d.setDate(1);
  return d.getTime();
}

export { getMiembro } from "./miembros";
