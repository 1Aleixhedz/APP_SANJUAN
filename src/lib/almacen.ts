/** Estado local de la sesión de entrenamiento (no va a Supabase). */

const CLAVE_SALA = "ironpulse.sala";

export interface EstadoSala {
  maquinaActiva: string | null;
  objetivoSeries: number;
  descansoDesde: number | null;
}

export const SALA_INICIAL: EstadoSala = {
  maquinaActiva: null,
  objetivoSeries: 4,
  descansoDesde: null,
};

let sala: EstadoSala = SALA_INICIAL;
const oyentes = new Set<() => void>();

function leerJSON<T>(clave: string): T | null {
  try {
    const bruto = window.localStorage.getItem(clave);
    return bruto ? (JSON.parse(bruto) as T) : null;
  } catch {
    return null;
  }
}

function guardarJSON(clave: string, valor: unknown) {
  try {
    window.localStorage.setItem(clave, JSON.stringify(valor));
  } catch {
    // Modo privado o almacenamiento lleno.
  }
}

function avisar() {
  for (const oyente of oyentes) oyente();
}

export function suscribirSala(oyente: () => void) {
  oyentes.add(oyente);
  return () => {
    oyentes.delete(oyente);
  };
}

export function obtenerSala(): EstadoSala {
  return sala;
}

export function obtenerSalaServidor(): EstadoSala {
  return SALA_INICIAL;
}

if (typeof window !== "undefined") {
  sala = { ...SALA_INICIAL, ...(leerJSON<EstadoSala>(CLAVE_SALA) ?? {}) };
}

function actualizarSala(cambios: Partial<EstadoSala>) {
  sala = { ...sala, ...cambios };
  guardarJSON(CLAVE_SALA, sala);
  avisar();
}

export function fijarMaquinaActiva(machineId: string) {
  if (sala.maquinaActiva === machineId) return;
  actualizarSala({ maquinaActiva: machineId });
}

export function ajustarObjetivoSeries(objetivo: number) {
  actualizarSala({ objetivoSeries: Math.min(8, Math.max(1, objetivo)) });
}

export function reiniciarDescanso() {
  actualizarSala({ descansoDesde: Date.now() });
}

export function marcarDescansoTrasSerie(machineId: string, fecha: number) {
  actualizarSala({
    maquinaActiva: machineId,
    descansoDesde: fecha,
  });
}
