import type { Machine, MuscleId, Reclutamiento, Telemetria, ClaveTecnica } from "./types";
import { MAQUINAS } from "./machines";
import { createClient } from "./supabase/client";

export type MaquinaRow = {
  id: string;
  slug: string;
  bahia: string;
  sector: string;
  plataforma: string;
  familia: string;
  gama: string;
  referencia: string;
  nombre: string;
  nombre_tecnico: string;
  imagen: string | null;
  video: string | null;
  detalles: string[];
  primarios: MuscleId[];
  secundarios: MuscleId[];
  reclutamiento: Reclutamiento[];
  telemetria: Telemetria;
  claves: ClaveTecnica[];
  errores: string[];
  peso_min: number;
  peso_max: number;
  incremento: number;
  unidad: "kg" | "kg/manc";
  macros: number[];
  activa: boolean;
  origen: "seed" | "admin";
};

const SECTOR_A_MUSCULO: Record<string, MuscleId[]> = {
  Espalda: ["dorsal", "romboides"],
  Pecho: ["pectoral"],
  Piernas: ["cuadriceps", "isquios"],
  Pierna: ["cuadriceps"],
  Brazos: ["biceps", "triceps"],
  Brazo: ["biceps"],
  Hombros: ["deltoides"],
  Hombro: ["deltoides"],
  Core: ["abdomen"],
};

function normalizarSector(sector: string) {
  if (sector === "Piernas") return "Pierna";
  if (sector === "Brazos") return "Brazo";
  if (sector === "Hombros") return "Hombro";
  return sector;
}

function slugify(texto: string) {
  return texto
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 48);
}

export function rowAMachine(row: MaquinaRow): Machine {
  return {
    id: row.id,
    slug: row.slug,
    bahia: row.bahia,
    sector: row.sector,
    plataforma: row.plataforma,
    familia: row.familia,
    gama: row.gama,
    referencia: row.referencia,
    nombre: row.nombre,
    nombreTecnico: row.nombre_tecnico,
    imagen: row.imagen ?? undefined,
    video: row.video ?? undefined,
    detalles: row.detalles ?? [],
    primarios: row.primarios ?? [],
    secundarios: row.secundarios ?? [],
    reclutamiento: row.reclutamiento ?? [],
    telemetria: row.telemetria,
    claves: row.claves ?? [],
    errores: row.errores ?? [],
    pesoMin: Number(row.peso_min),
    pesoMax: Number(row.peso_max),
    incremento: Number(row.incremento),
    unidad: row.unidad,
    macros: row.macros ?? [],
  };
}

function machineARow(m: Machine, origen: "seed" | "admin"): Omit<MaquinaRow, "activa"> & { activa: boolean } {
  return {
    id: m.id,
    slug: m.slug,
    bahia: m.bahia,
    sector: m.sector,
    plataforma: m.plataforma,
    familia: m.familia,
    gama: m.gama,
    referencia: m.referencia,
    nombre: m.nombre,
    nombre_tecnico: m.nombreTecnico,
    imagen: m.imagen ?? null,
    video: null,
    detalles: m.detalles,
    primarios: m.primarios,
    secundarios: m.secundarios,
    reclutamiento: m.reclutamiento,
    telemetria: m.telemetria,
    claves: m.claves,
    errores: m.errores,
    peso_min: m.pesoMin,
    peso_max: m.pesoMax,
    incremento: m.incremento,
    unidad: m.unidad,
    macros: m.macros,
    activa: true,
    origen,
  };
}

/** Catálogo en nube. Si falla o está vacío, usa el código local. */
export async function fetchCatalogo(): Promise<Machine[]> {
  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("maquinas")
      .select("*")
      .eq("activa", true)
      .order("bahia", { ascending: true });

    if (error) throw error;
    if (!data || data.length === 0) return MAQUINAS;
    return (data as MaquinaRow[]).map(rowAMachine);
  } catch {
    return MAQUINAS;
  }
}

export async function fetchMaquinaPorSlug(slug: string): Promise<Machine | undefined> {
  const local = MAQUINAS.find((m) => m.slug === slug);
  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("maquinas")
      .select("*")
      .eq("slug", slug)
      .maybeSingle();
    if (error) throw error;
    if (data) return rowAMachine(data as MaquinaRow);
  } catch {
    // fallback local
  }
  return local;
}

/** Sube el catálogo de código a Supabase (solo admin). No pisa altas `admin`. */
export async function sincronizarSeed(): Promise<{ ok: number; error?: string }> {
  const supabase = createClient();
  let ok = 0;
  let lastError: string | undefined;

  for (const m of MAQUINAS) {
    const fila = machineARow(m, "seed");
    const { data: existente } = await supabase
      .from("maquinas")
      .select("id, origen, imagen, video")
      .eq("id", m.id)
      .maybeSingle();

    if (!existente) {
      const { error } = await supabase.from("maquinas").insert(fila);
      if (error) lastError = error.message;
      else ok += 1;
      continue;
    }

    if (existente.origen === "admin") continue;

    const { error } = await supabase
      .from("maquinas")
      .update({
        ...fila,
        // conserva media si ya se subió en nube y el seed solo tiene path local
        imagen: existente.imagen || fila.imagen,
        video: existente.video || fila.video,
      })
      .eq("id", m.id)
      .eq("origen", "seed");

    if (error) lastError = error.message;
    else ok += 1;
  }

  return { ok, error: ok === 0 ? lastError : undefined };
}

async function subirArchivo(
  bucket: "maquinas-fotos" | "maquinas-videos",
  path: string,
  file: File,
): Promise<string> {
  const supabase = createClient();
  const { error } = await supabase.storage.from(bucket).upload(path, file, {
    upsert: true,
    contentType: file.type,
  });
  if (error) throw new Error(error.message);
  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
  return data.publicUrl;
}

export async function crearMaquinaNube(datos: {
  nombre: string;
  bahia: string;
  sector: string;
  foto?: File | null;
  video?: File | null;
  generarQr: boolean;
}): Promise<Machine> {
  const bahia = datos.bahia.replace(/^M-?/i, "").trim() || String(Date.now() % 100);
  const slug = slugify(datos.nombre) || `maquina-${bahia}`;
  const id = `m-cloud-${Date.now()}`;
  const sector = normalizarSector(datos.sector);
  const primarios = SECTOR_A_MUSCULO[datos.sector] ?? SECTOR_A_MUSCULO[sector] ?? ["dorsal"];

  let imagen: string | null = null;
  let video: string | null = null;

  if (datos.foto) {
    const ext = datos.foto.name.split(".").pop() || "jpg";
    imagen = await subirArchivo(
      "maquinas-fotos",
      `${slug}/${Date.now()}.${ext}`,
      datos.foto,
    );
  }

  if (datos.video) {
    const ext = datos.video.name.split(".").pop() || "mp4";
    video = await subirArchivo(
      "maquinas-videos",
      `${slug}/${Date.now()}.${ext}`,
      datos.video,
    );
  }

  const plantilla = MAQUINAS[0];
  const fila: MaquinaRow = {
    id,
    slug,
    bahia,
    sector,
    plataforma: "Sala",
    familia: "Cargas guiadas",
    gama: "Etenon",
    referencia: `ADM-${bahia}`,
    nombre: datos.nombre.trim(),
    nombre_tecnico: datos.nombre.trim(),
    imagen,
    video,
    detalles: ["Alta desde panel admin"],
    primarios,
    secundarios: [],
    reclutamiento: [
      {
        etiqueta: datos.sector,
        musculos: primarios,
        nivel: 80,
        tipo: "primario",
      },
    ],
    telemetria: plantilla.telemetria,
    claves: [
      {
        titulo: "Ajusta el asiento",
        detalle: "Colócate cómodo antes de cargar peso.",
      },
      {
        titulo: "Postura estable",
        detalle: "Espalda neutra y movimiento controlado.",
      },
      {
        titulo: "Repeticiones suaves",
        detalle: "Sube y baja despacio.",
      },
    ],
    errores: ["Usar demasiado peso al empezar."],
    peso_min: 5,
    peso_max: 120,
    incremento: 2.5,
    unidad: "kg",
    macros: [2.5, 5, 10],
    activa: true,
    origen: "admin",
  };

  const supabase = createClient();
  const { data, error } = await supabase
    .from("maquinas")
    .insert(fila)
    .select("*")
    .single();

  if (error) throw new Error(error.message);
  return rowAMachine(data as MaquinaRow);
}

/** @deprecated localStorage — mantenido vacío para no romper imports viejos */
export function getCatalogo(): Machine[] {
  return MAQUINAS;
}

export function getMaquinaCatalogo(slug: string): Machine | undefined {
  return MAQUINAS.find((m) => m.slug === slug);
}
