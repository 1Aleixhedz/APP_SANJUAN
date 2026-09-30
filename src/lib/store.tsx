"use client";

import { useCallback, useEffect, useMemo, useState, useSyncExternalStore } from "react";
import {
  ajustarObjetivoSeries,
  fijarMaquinaActiva,
  marcarDescansoTrasSerie,
  obtenerSala,
  obtenerSalaServidor,
  reiniciarDescanso,
  suscribirSala,
  type EstadoSala,
} from "./almacen";
import { getMaquinaPorId } from "./machines";
import { setMiembrosCache } from "./miembros";
import { createClient } from "./supabase/client";
import type { Member, TipoSerie, WorkoutEntry } from "./types";

interface ProfileRow {
  id: string;
  user_id: string | null;
  email: string | null;
  nombre: string;
  alias: string;
  socio: string;
  apodo: string | null;
  avatar_color: string;
  rol: "socio" | "admin";
  es_demo: boolean;
}

interface SerieRow {
  id: string;
  member_id: string;
  machine_id: string;
  peso: number;
  reps: number;
  tipo: TipoSerie;
  rpe: number | null;
  nota: string | null;
  fecha: string;
}

function mapProfile(row: ProfileRow): Member {
  return {
    id: row.id,
    nombre: row.nombre,
    alias: row.alias,
    socio: row.socio,
    apodo: row.apodo ?? undefined,
    avatarColor: row.avatar_color,
    email: row.email ?? undefined,
    rol: row.rol,
  };
}

function mapSerie(row: SerieRow): WorkoutEntry {
  return {
    id: row.id,
    memberId: row.member_id,
    machineId: row.machine_id,
    peso: Number(row.peso),
    reps: row.reps,
    tipo: row.tipo,
    rpe: row.rpe ?? undefined,
    nota: row.nota ?? undefined,
    fecha: new Date(row.fecha).getTime(),
  };
}

function supabaseListo() {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  );
}

export function useStore() {
  const sala = useSyncExternalStore(
    suscribirSala,
    obtenerSala,
    obtenerSalaServidor,
  ) as EstadoSala;

  const [montado, setMontado] = useState(false);
  const [entradas, setEntradas] = useState<WorkoutEntry[]>([]);
  const [miembros, setMiembros] = useState<Member[]>([]);
  const [usuario, setUsuario] = useState<Member | undefined>();
  const [emailSesion, setEmailSesion] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const recargar = useCallback(async () => {
    if (!supabaseListo()) {
      setMiembros([]);
      setMiembrosCache([]);
      setEntradas([]);
      setUsuario(undefined);
      setEmailSesion(null);
      setMontado(true);
      setError(
        "Falta configurar Supabase (.env.local). Ver SETUP.md.",
      );
      return;
    }

    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const [{ data: profiles, error: errP }, { data: series, error: errS }] =
      await Promise.all([
        supabase.from("profiles").select("*"),
        supabase.from("series").select("*").order("fecha", { ascending: true }),
      ]);

    if (errP || errS) {
      setError(errP?.message ?? errS?.message ?? "Error al cargar datos");
    } else {
      setError(null);
    }

    const lista = (profiles as ProfileRow[] | null)?.map(mapProfile) ?? [];
    setMiembros(lista);
    setMiembrosCache(lista);
    setEntradas((series as SerieRow[] | null)?.map(mapSerie) ?? []);

    if (user) {
      setEmailSesion(user.email ?? null);
      const propio =
        lista.find((m) =>
          (profiles as ProfileRow[] | null)?.some(
            (p) => p.id === m.id && p.user_id === user.id,
          ),
        ) ??
        (profiles as ProfileRow[] | null)
          ?.filter((p) => p.user_id === user.id)
          .map(mapProfile)[0];
      setUsuario(propio);
    } else {
      setEmailSesion(null);
      setUsuario(undefined);
    }

    setMontado(true);
  }, []);

  useEffect(() => {
    void recargar();
    if (!supabaseListo()) return;

    const supabase = createClient();
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(() => {
      void recargar();
    });
    return () => subscription.unsubscribe();
  }, [recargar]);

  const registrar = useCallback(
    async (datos: {
      machineId: string;
      peso: number;
      reps: number;
      tipo?: TipoSerie;
      rpe?: number;
      nota?: string;
    }) => {
      if (!usuario || !supabaseListo()) {
        throw new Error("Debes iniciar sesión para registrar series");
      }
      const supabase = createClient();
      const fecha = new Date().toISOString();
      const { data, error: err } = await supabase
        .from("series")
        .insert({
          member_id: usuario.id,
          machine_id: datos.machineId,
          peso: datos.peso,
          reps: datos.reps,
          tipo: datos.tipo ?? "efectiva",
          rpe: datos.rpe ?? null,
          nota: datos.nota?.trim() ? datos.nota.trim() : null,
          fecha,
          es_demo: false,
        })
        .select("*")
        .single();

      if (err || !data) throw new Error(err?.message ?? "No se pudo guardar");

      const entrada = mapSerie(data as SerieRow);
      setEntradas((prev) => [...prev, entrada]);
      marcarDescansoTrasSerie(datos.machineId, entrada.fecha);
      return entrada;
    },
    [usuario],
  );

  const borrarEntrada = useCallback(async (id: string) => {
    if (!supabaseListo()) return;
    const supabase = createClient();
    const { error: err } = await supabase.from("series").delete().eq("id", id);
    if (err) throw new Error(err.message);
    setEntradas((prev) => prev.filter((e) => e.id !== id));
  }, []);

  const cerrarSesion = useCallback(async () => {
    if (!supabaseListo()) return;
    const supabase = createClient();
    await supabase.auth.signOut();
    setUsuario(undefined);
    setEmailSesion(null);
  }, []);

  const cargarDemo = useCallback(async () => {
    const supabase = createClient();
    const { error: err } = await supabase.rpc("seed_demo");
    if (err) throw new Error(err.message);
    await recargar();
  }, [recargar]);

  const limpiarDemo = useCallback(async () => {
    const supabase = createClient();
    const { error: err } = await supabase.rpc("clear_demo");
    if (err) throw new Error(err.message);
    await recargar();
  }, [recargar]);

  const propias = useMemo(
    () => (usuario ? entradas.filter((e) => e.memberId === usuario.id) : []),
    [entradas, usuario],
  );

  return useMemo(
    () => ({
      entradas,
      propias,
      miembros,
      sala,
      maquinaActiva: sala.maquinaActiva
        ? getMaquinaPorId(sala.maquinaActiva)
        : undefined,
      montado,
      usuario,
      sesion: emailSesion ? { email: emailSesion, memberId: usuario?.id ?? "" } : null,
      error,
      esAdmin: usuario?.rol === "admin",
      registrar,
      borrarEntrada,
      fijarMaquina: fijarMaquinaActiva,
      ajustarObjetivo: ajustarObjetivoSeries,
      reiniciarDescanso,
      cerrarSesion,
      recargar,
      cargarDemo,
      limpiarDemo,
      /** @deprecated Usar magic link real */
      iniciarSesion: async () => undefined,
      reiniciar: async () => undefined,
    }),
    [
      entradas,
      propias,
      miembros,
      sala,
      montado,
      usuario,
      emailSesion,
      error,
      registrar,
      borrarEntrada,
      cerrarSesion,
      recargar,
      cargarDemo,
      limpiarDemo,
    ],
  );
}
