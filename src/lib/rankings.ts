import { inicioDeMes, inicioDeSemana } from "./data";
import { MAQUINAS, getMaquinaPorId } from "./machines";
import type {
  NivelAtleta,
  Periodo,
  Trofeo,
  WorkoutEntry,
} from "./types";

const DIA = 24 * 60 * 60 * 1000;
const SEMANA = 7 * DIA;

/** Kilos movidos en una serie: peso × repeticiones. */
export function volumen(entrada: WorkoutEntry): number {
  return entrada.peso * entrada.reps;
}

export function desdeCuando(periodo: Periodo, ahora = Date.now()): number {
  if (periodo === "semana") return inicioDeSemana(ahora);
  if (periodo === "mes") return inicioDeMes(ahora);
  return 0;
}

export function filtrarPeriodo(
  entradas: WorkoutEntry[],
  periodo: Periodo,
  ahora = Date.now(),
): WorkoutEntry[] {
  const desde = desdeCuando(periodo, ahora);
  return desde === 0 ? entradas : entradas.filter((e) => e.fecha >= desde);
}

export interface Marca {
  memberId: string;
  peso: number;
  reps: number;
  fecha: number;
}

/** Mejor carga de una máquina: gana el peso y desempatan las repeticiones. */
export function recordDeMaquina(
  entradas: WorkoutEntry[],
  machineId: string,
  periodo: Periodo = "total",
  ahora = Date.now(),
): Marca | undefined {
  return tablaDeRecords(entradas, machineId, periodo, ahora)[0];
}

/** Mejor marca de cada atleta en una máquina, de más a menos peso. */
export function tablaDeRecords(
  entradas: WorkoutEntry[],
  machineId: string,
  periodo: Periodo = "total",
  ahora = Date.now(),
): Marca[] {
  const mejores = new Map<string, Marca>();

  for (const e of filtrarPeriodo(entradas, periodo, ahora)) {
    if (e.machineId !== machineId || e.tipo === "calentamiento") continue;
    const previo = mejores.get(e.memberId);
    if (
      !previo ||
      e.peso > previo.peso ||
      (e.peso === previo.peso && e.reps > previo.reps)
    ) {
      mejores.set(e.memberId, {
        memberId: e.memberId,
        peso: e.peso,
        reps: e.reps,
        fecha: e.fecha,
      });
    }
  }

  return [...mejores.values()].sort(
    (a, b) => b.peso - a.peso || b.reps - a.reps,
  );
}

export interface FilaVolumen {
  memberId: string;
  kilos: number;
  sesiones: number;
  series: number;
}

/** Kilos acumulados por atleta, en una máquina o en todo el gimnasio. */
export function rankingVolumen(
  entradas: WorkoutEntry[],
  opciones: { machineId?: string; periodo?: Periodo; ahora?: number } = {},
): FilaVolumen[] {
  const { machineId, periodo = "total", ahora = Date.now() } = opciones;
  const acumulado = new Map<
    string,
    { kilos: number; series: number; dias: Set<string> }
  >();

  for (const e of filtrarPeriodo(entradas, periodo, ahora)) {
    if (machineId && e.machineId !== machineId) continue;
    const actual =
      acumulado.get(e.memberId) ?? { kilos: 0, series: 0, dias: new Set() };
    actual.kilos += volumen(e);
    actual.series += 1;
    actual.dias.add(new Date(e.fecha).toDateString());
    acumulado.set(e.memberId, actual);
  }

  return [...acumulado.entries()]
    .map(([memberId, v]) => ({
      memberId,
      kilos: v.kilos,
      series: v.series,
      sesiones: v.dias.size,
    }))
    .sort((a, b) => b.kilos - a.kilos);
}

export function posicionEnRanking(
  filas: { memberId: string }[],
  memberId: string,
): number | undefined {
  const indice = filas.findIndex((fila) => fila.memberId === memberId);
  return indice === -1 ? undefined : indice + 1;
}

/** Cuánto falta para entrar en un puesto concreto de la tabla. */
export function distanciaAlPuesto(
  tabla: Marca[],
  memberId: string,
  puesto: number,
): { kilos: number; rival: Marca } | undefined {
  const rival = tabla[puesto - 1];
  const mia = tabla.find((fila) => fila.memberId === memberId);
  if (!rival || !mia || rival.memberId === memberId) return undefined;
  const kilos = rival.peso - mia.peso;
  return kilos > 0 ? { kilos, rival } : undefined;
}

export function resumenMiembro(
  entradas: WorkoutEntry[],
  memberId: string,
  periodo: Periodo = "total",
  ahora = Date.now(),
) {
  const propias = filtrarPeriodo(entradas, periodo, ahora).filter(
    (e) => e.memberId === memberId,
  );
  const dias = new Set(propias.map((e) => new Date(e.fecha).toDateString()));
  return {
    kilos: propias.reduce((total, e) => total + volumen(e), 0),
    series: propias.length,
    sesiones: dias.size,
    reps: propias.reduce((total, e) => total + e.reps, 0),
  };
}

/** Máquinas en las que este atleta manda ahora mismo. */
export function recordsQueOstenta(
  entradas: WorkoutEntry[],
  memberId: string,
  machineIds: string[] = MAQUINAS.map((maquina) => maquina.id),
): string[] {
  return machineIds.filter(
    (machineId) => recordDeMaquina(entradas, machineId)?.memberId === memberId,
  );
}

/** Días seguidos entrenando contando desde hoy o desde ayer. */
export function rachaDeDias(
  entradas: WorkoutEntry[],
  memberId: string,
  ahora = Date.now(),
): number {
  const dias = new Set(
    entradas
      .filter((e) => e.memberId === memberId)
      .map((e) => new Date(e.fecha).setHours(0, 0, 0, 0)),
  );
  const hoy = new Date(ahora).setHours(0, 0, 0, 0);
  let inicio = dias.has(hoy) ? hoy : hoy - DIA;
  if (!dias.has(inicio)) return 0;
  let racha = 0;
  while (dias.has(inicio)) {
    racha += 1;
    inicio -= DIA;
  }
  return racha;
}

/** Semanas seguidas en las que ha entrenado al menos una vez. */
export function rachaDeSemanas(
  entradas: WorkoutEntry[],
  memberId: string,
  ahora = Date.now(),
): number {
  const semanas = new Set(
    entradas
      .filter((e) => e.memberId === memberId)
      .map((e) => inicioDeSemana(e.fecha)),
  );
  let cursor = inicioDeSemana(ahora);
  let racha = 0;
  while (semanas.has(cursor)) {
    racha += 1;
    cursor -= SEMANA;
  }
  return racha;
}

/** Escaneos: cada combinación distinta de día y máquina. */
export function escaneosRegistrados(
  entradas: WorkoutEntry[],
  memberId: string,
): number {
  return new Set(
    entradas
      .filter((e) => e.memberId === memberId)
      .map((e) => `${new Date(e.fecha).toDateString()}-${e.machineId}`),
  ).size;
}

const RANGOS = [
  { desde: 1, titulo: "Iniciado" },
  { desde: 5, titulo: "Constante" },
  { desde: 9, titulo: "Fuerza Media" },
  { desde: 13, titulo: "Fuerza Avanzada" },
  { desde: 18, titulo: "Titán" },
  { desde: 25, titulo: "Leyenda IronPulse" },
];

const XP_POR_NIVEL = 3000;

/** Nivel de fuerza a partir del tonelaje acumulado y las series registradas. */
export function nivelAtleta(
  entradas: WorkoutEntry[],
  memberId: string,
): NivelAtleta {
  const resumen = resumenMiembro(entradas, memberId, "total");
  const xp = Math.floor(resumen.kilos / 6) + resumen.series * 2;
  const nivel = Math.floor(xp / XP_POR_NIVEL) + 1;
  const rangoActual = [...RANGOS].reverse().find((r) => nivel >= r.desde);
  const rangoSiguiente = RANGOS.find((r) => r.desde > nivel);

  return {
    nivel,
    titulo: rangoActual?.titulo ?? "Iniciado",
    siguienteTitulo: rangoSiguiente?.titulo ?? "Leyenda IronPulse",
    xp,
    xpNivel: xp % XP_POR_NIVEL,
    xpSiguiente: XP_POR_NIVEL,
  };
}

export function trofeosDe(
  entradas: WorkoutEntry[],
  memberId: string,
): Trofeo[] {
  const resumen = resumenMiembro(entradas, memberId, "total");
  const reinados = recordsQueOstenta(entradas, memberId);
  const semanas = rachaDeSemanas(entradas, memberId);
  const escaneos = escaneosRegistrados(entradas, memberId);
  const prensa = getMaquinaPorId("m06");

  return [
    {
      id: "club-100k",
      nombre: "Club de 100K",
      detalle: "Carga acumulada",
      icono: "💎",
      color: "var(--neon)",
      desbloqueado: resumen.kilos >= 100000,
    },
    {
      id: "rey-prensa",
      nombre: "Rey de la Prensa",
      detalle: `Récord #1 superado en ${prensa?.nombre ?? "prensa"}`,
      icono: "👑",
      color: "var(--oro)",
      desbloqueado: reinados.includes("m06"),
    },
    {
      id: "hierro-puro",
      nombre: "Hierro Puro",
      detalle: `${semanas} semanas seguidas`,
      icono: "🛡️",
      color: "var(--carmesi)",
      desbloqueado: semanas >= 6,
    },
    {
      id: "escaneador-pro",
      nombre: "Escaneador Pro",
      detalle: `${escaneos} QR registrados`,
      icono: "🔳",
      color: "var(--jade)",
      desbloqueado: escaneos >= 35,
    },
    {
      id: "titan-sala",
      nombre: "Titán de Sala",
      detalle: "Dos récords del gym a la vez",
      icono: "🏆",
      color: "var(--ambar)",
      desbloqueado: reinados.length >= 2,
    },
    {
      id: "media-tonelada",
      nombre: "Serie de Media Tonelada",
      detalle: "500 kg en una sola serie",
      icono: "⚡",
      color: "#a78bfa",
      desbloqueado: entradas.some(
        (e) => e.memberId === memberId && volumen(e) >= 500,
      ),
    },
  ];
}

/** Temporada en curso: un trimestre natural y la semana dentro de él. */
export function temporadaActual(ahora = Date.now()) {
  const fecha = new Date(ahora);
  const trimestre = Math.floor(fecha.getMonth() / 3);
  const inicioTrimestre = new Date(
    fecha.getFullYear(),
    trimestre * 3,
    1,
  ).getTime();
  const semana =
    Math.floor((inicioSemanaDe(ahora) - inicioSemanaDe(inicioTrimestre)) / SEMANA) +
    1;
  return {
    numero: trimestre + 1,
    semana,
    desde: inicioTrimestre,
  };
}

function inicioSemanaDe(fecha: number): number {
  return inicioDeSemana(fecha);
}

/** Veces que alguien ha mejorado su propia marca desde una fecha. */
export function recordsBatidos(
  entradas: WorkoutEntry[],
  desde: number,
): number {
  const mejores = new Map<string, number>();
  let batidos = 0;

  for (const e of [...entradas].sort((a, b) => a.fecha - b.fecha)) {
    if (e.tipo === "calentamiento") continue;
    const clave = `${e.memberId}-${e.machineId}`;
    const previo = mejores.get(clave);
    if (previo !== undefined && e.peso > previo && e.fecha >= desde) {
      batidos += 1;
    }
    if (previo === undefined || e.peso > previo) mejores.set(clave, e.peso);
  }

  return batidos;
}

/** Quien más tonelaje ha movido esta semana, y cuánto supera a la media. */
export function bestiaDeLaSemana(
  entradas: WorkoutEntry[],
  ahora = Date.now(),
) {
  const ranking = rankingVolumen(entradas, { periodo: "semana", ahora });
  const lider = ranking[0];
  if (!lider) return undefined;
  // Mediana en vez de media: un par de atletas con una sola serie registrada
  // hundirían la media y el porcentaje saldría disparatado.
  const kilos = ranking.map((fila) => fila.kilos).sort((a, b) => a - b);
  const medio = Math.floor(kilos.length / 2);
  const mediana =
    kilos.length % 2 === 0
      ? (kilos[medio - 1] + kilos[medio]) / 2
      : kilos[medio];
  return {
    ...lider,
    sobreMedia: mediana > 0 ? Math.round((lider.kilos / mediana - 1) * 100) : 0,
  };
}

/** El récord del gimnasio que lleva más tiempo sin que nadie lo tumbe. */
export function recordMasLongevo(entradas: WorkoutEntry[], ahora = Date.now()) {
  const candidatos = MAQUINAS.flatMap((maquina) => {
    const record = recordDeMaquina(entradas, maquina.id);
    if (!record) return [];
    return [
      {
        maquina,
        record,
        semanas: Math.max(
          1,
          Math.floor((ahora - record.fecha) / SEMANA),
        ),
      },
    ];
  });
  return candidatos.sort((a, b) => b.semanas - a.semanas)[0];
}

const formateadorKilos = new Intl.NumberFormat("es-ES", {
  maximumFractionDigits: 0,
});

export function formatearKilos(kilos: number): string {
  return `${formateadorKilos.format(Math.round(kilos))} kg`;
}

/** Igual que formatearKilos pero sin la unidad, para maquetar el "kg" aparte. */
export function formatearNumero(valor: number, decimales = 0): string {
  return new Intl.NumberFormat("es-ES", {
    maximumFractionDigits: decimales,
    minimumFractionDigits: 0,
  }).format(valor);
}

export function formatearPeso(kilos: number, unidad = "kg"): string {
  return `${formatearNumero(kilos, 1)} ${unidad}`;
}

export function formatearFecha(fecha: number): string {
  return new Intl.DateTimeFormat("es-ES", {
    day: "numeric",
    month: "short",
  }).format(new Date(fecha));
}

export function formatearHora(fecha: number): string {
  return new Intl.DateTimeFormat("es-ES", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(fecha));
}

/** "Hoy", "Ayer" o "hace N días". */
export function hace(fecha: number, ahora = Date.now()): string {
  const dias = Math.floor(
    (new Date(ahora).setHours(0, 0, 0, 0) -
      new Date(fecha).setHours(0, 0, 0, 0)) /
      DIA,
  );
  if (dias <= 0) return "Hoy";
  if (dias === 1) return "Ayer";
  if (dias < 7) return `Hace ${dias} días`;
  const semanas = Math.floor(dias / 7);
  return semanas === 1 ? "Hace 1 semana" : `Hace ${semanas} semanas`;
}
