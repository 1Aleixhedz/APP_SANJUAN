import type { Member } from "./types";

/** Caché en memoria: Avatar/rankings leen aquí tras hidratar desde Supabase. */
let cache: Member[] = [];

export function setMiembrosCache(miembros: Member[]) {
  cache = miembros;
}

export function getMiembrosCache(): Member[] {
  return cache;
}

export function getMiembro(id: string): Member | undefined {
  return cache.find((m) => m.id === id);
}
