export type MuscleId =
  | "pectoral"
  | "dorsal"
  | "trapecio"
  | "romboides"
  | "deltoides"
  | "deltoidesPosterior"
  | "biceps"
  | "triceps"
  | "antebrazo"
  | "abdomen"
  | "oblicuos"
  | "lumbar"
  | "gluteo"
  | "cuadriceps"
  | "isquios"
  | "gemelos"
  | "aductores"
  | "abductores";

export type BodyView = "frente" | "espalda";

export interface Muscle {
  id: MuscleId;
  nombre: string;
  vista: BodyView;
}

/** Grupo muscular implicado, con su porcentaje de reclutamiento. */
export interface Reclutamiento {
  etiqueta: string;
  musculos: MuscleId[];
  nivel: number;
  tipo: "primario" | "secundario";
}

/** Datos biomecánicos fijos de la máquina que se muestran sobre el visor. */
export interface Telemetria {
  articulacion: string;
  angulo: string;
  veredicto: string;
  pausa: string;
  fase: string;
  vector: string;
}

export interface ClaveTecnica {
  titulo: string;
  detalle: string;
}

export interface Machine {
  id: string;
  slug: string;
  /** Número de bahía pintado en el suelo de la sala. */
  bahia: string;
  sector: string;
  plataforma: string;
  familia: string;
  gama: string;
  referencia: string;
  nombre: string;
  nombreTecnico: string;
  /** Foto en /public/maquinas/… o URL de Storage */
  imagen?: string;
  /** Vídeo de técnica (URL pública Storage o /videos/…) */
  video?: string;
  detalles: string[];
  primarios: MuscleId[];
  secundarios: MuscleId[];
  reclutamiento: Reclutamiento[];
  telemetria: Telemetria;
  claves: ClaveTecnica[];
  errores: string[];
  pesoMin: number;
  pesoMax: number;
  incremento: number;
  unidad: "kg" | "kg/manc";
  macros: number[];
}

export interface Member {
  id: string;
  nombre: string;
  alias: string;
  /** Número de socio de IronPulse. */
  socio: string;
  apodo?: string;
  avatarColor: string;
  email?: string;
  rol?: "socio" | "admin";
}

export type TipoSerie = "calentamiento" | "efectiva";

/** Una serie registrada. El volumen de la serie es peso × reps. */
export interface WorkoutEntry {
  id: string;
  memberId: string;
  machineId: string;
  peso: number;
  reps: number;
  tipo: TipoSerie;
  /** Esfuerzo percibido, de 6 a 10. */
  rpe?: number;
  nota?: string;
  fecha: number;
}

export type Periodo = "semana" | "mes" | "total";

export interface Trofeo {
  id: string;
  nombre: string;
  detalle: string;
  icono: string;
  color: string;
  desbloqueado: boolean;
}

export interface NivelAtleta {
  nivel: number;
  titulo: string;
  siguienteTitulo: string;
  xp: number;
  xpNivel: number;
  xpSiguiente: number;
}
