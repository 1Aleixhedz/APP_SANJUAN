"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import AppHeader from "@/components/AppHeader";
import Avatar from "@/components/Avatar";
import Cargando from "@/components/Cargando";
import MaquinaFoto from "@/components/MaquinaFoto";
import { MAQUINAS } from "@/lib/machines";
import {
  formatearKilos,
  formatearNumero,
  hace,
  nivelAtleta,
  recordDeMaquina,
  recordsQueOstenta,
  resumenMiembro,
  tablaDeRecords,
} from "@/lib/rankings";
import { useStore } from "@/lib/store";

export default function ProfileScreen() {
  const {
    entradas,
    usuario,
    sesion,
    montado,
    propias,
    fijarMaquina,
    cerrarSesion,
    esAdmin,
    cargarDemo,
    limpiarDemo,
    error: errorStore,
  } = useStore();
  const router = useRouter();
  const [demoMsg, setDemoMsg] = useState<string | null>(null);
  const [demoBusy, setDemoBusy] = useState(false);

  if (!montado) return <Cargando filas={6} />;

  if (!usuario) {
    return (
      <>
        <AppHeader />
        <div className="flex flex-1 flex-col items-center justify-center gap-4 px-8 text-center">
          <h1 className="text-xl font-extrabold">Tu perfil</h1>
          <p className="text-sm text-suave">
            Entra con el enlace mágico para ver tus marcas.
          </p>
          {errorStore && <p className="text-xs text-carmesi">{errorStore}</p>}
          <Link
            href="/login?next=/perfil"
            className="boton-negro rounded-2xl px-6 py-3.5 text-sm font-bold"
          >
            Entrar con email
          </Link>
        </div>
      </>
    );
  }

  const nivel = nivelAtleta(entradas, usuario.id);
  const mes = resumenMiembro(entradas, usuario.id, "mes");
  const reinados = recordsQueOstenta(entradas, usuario.id);

  const misPRs = MAQUINAS.flatMap((maquina) => {
    const tabla = tablaDeRecords(entradas, maquina.id);
    const mia = tabla.find((f) => f.memberId === usuario.id);
    if (!mia) return [];
    const recordSala = recordDeMaquina(entradas, maquina.id);
    return [
      {
        maquina,
        marca: mia,
        esRecordSala: recordSala?.memberId === usuario.id,
      },
    ];
  }).sort((a, b) => Number(b.esRecordSala) - Number(a.esRecordSala));

  const actividad = [
    ...new Map(
      propias
        .slice()
        .sort((a, b) => b.fecha - a.fecha)
        .map((e) => {
          const clave = `${new Date(e.fecha).toDateString()}-${e.machineId}`;
          return [clave, e] as const;
        }),
    ).values(),
  ].slice(0, 4);

  return (
    <>
      <AppHeader />

      <div className="flex flex-col gap-4 px-4 pb-6 pt-1">
        <section className="tarjeta-suave flex items-center gap-3 p-4">
          <div className="relative">
            <Avatar memberId={usuario.id} tamano="xl" forma="circulo" />
            <span className="absolute -bottom-0.5 -right-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-jade text-[10px] text-white">
              ✓
            </span>
          </div>
          <div className="min-w-0 flex-1">
            <p className="flex flex-wrap items-center gap-2 text-lg font-extrabold">
              {usuario.nombre}
              {esAdmin && (
                <span className="rounded-full bg-negro px-2 py-0.5 text-[10px] font-bold uppercase text-white">
                  Admin
                </span>
              )}
            </p>
            <p className="text-sm text-suave">
              Socio #{usuario.socio} · {nivel.titulo}
            </p>
            <p className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-panel px-3 py-1 text-[11px] font-bold">
              <span className="text-carmesi">🔥</span>
              {mes.sesiones} entrenos este mes
            </p>
          </div>
        </section>

        <div className="grid grid-cols-2 gap-3">
          <div className="tarjeta p-4">
            <p className="etiqueta text-suave">Volumen mes</p>
            <p className="mt-2 text-2xl font-extrabold leading-none">
              {formatearNumero(mes.kilos, 0)}
            </p>
            <p className="mt-1 text-xs text-suave">kg levantados</p>
          </div>
          <div className="tarjeta p-4">
            <p className="etiqueta text-suave">Hitos</p>
            <p className="mt-2 text-2xl font-extrabold leading-none">
              {reinados.length}
            </p>
            <p className="mt-1 text-xs text-suave">récords de sala</p>
          </div>
        </div>

        <section>
          <div className="mb-2 flex items-end justify-between">
            <div>
              <h2 className="text-lg font-extrabold">Marcas por máquina</h2>
              <p className="text-xs text-suave">Tus mejores series guardadas</p>
            </div>
          </div>
          <div className="flex flex-col gap-3">
            {misPRs.slice(0, 5).map(({ maquina, marca, esRecordSala }) => (
              <article key={maquina.id} className="tarjeta p-3">
                <div className="flex gap-3">
                  <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl">
                    <MaquinaFoto
                      bahia={maquina.bahia}
                      nombre={maquina.nombre}
                      imagen={maquina.imagen}
                    />
                    <span className="absolute left-1 top-1 rounded bg-negro px-1.5 py-0.5 text-[9px] font-bold text-white">
                      #{maquina.bahia}
                    </span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-1.5">
                      {esRecordSala && (
                        <span className="rounded-full bg-carmesi px-2 py-0.5 text-[9px] font-bold uppercase text-white">
                          PR sala
                        </span>
                      )}
                      <span className="text-[11px] font-semibold text-suave">
                        {maquina.sector}
                      </span>
                    </div>
                    <p className="mt-0.5 truncate font-extrabold">
                      {maquina.nombre.replace(/ con Cable$/i, "")}
                    </p>
                    <p className="mt-1 text-lg font-extrabold">
                      {formatearNumero(marca.peso, 1)} kg
                      <span className="ml-1 text-sm font-semibold text-suave">
                        × {marca.reps} reps
                      </span>
                    </p>
                  </div>
                </div>
                <div className="mt-3 flex gap-2">
                  <Link
                    href={`/ranking?maquina=${maquina.slug}`}
                    className="flex-1 rounded-2xl bg-lavanda py-2.5 text-center text-xs font-bold"
                  >
                    Ver ranking
                  </Link>
                  <button
                    type="button"
                    onClick={() => {
                      fijarMaquina(maquina.id);
                      router.push("/registro");
                    }}
                    className="flex h-10 w-10 items-center justify-center rounded-full bg-negro text-white"
                    aria-label="Registrar"
                  >
                    +
                  </button>
                </div>
              </article>
            ))}
            {misPRs.length === 0 && (
              <p className="tarjeta-suave py-6 text-center text-sm text-suave">
                Todavía no tienes marcas. ¡Empieza una serie!
              </p>
            )}
          </div>
        </section>

        <section>
          <div className="mb-2 flex items-center justify-between">
            <h2 className="text-lg font-extrabold">Historial reciente</h2>
          </div>
          <ul className="tarjeta divide-y divide-borde overflow-hidden">
            {actividad.map((entrada) => {
              const maquina = MAQUINAS.find((m) => m.id === entrada.machineId);
              return (
                <li
                  key={entrada.id}
                  className="flex items-center gap-3 px-3 py-3"
                >
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-lavanda text-suave">
                    ⏱
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-bold">
                      {maquina?.nombre ?? "Máquina"}
                    </p>
                    <p className="text-[11px] text-suave">
                      {hace(entrada.fecha)} · {formatearNumero(entrada.peso, 1)}{" "}
                      kg × {entrada.reps}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      if (maquina) fijarMaquina(maquina.id);
                      router.push("/registro");
                    }}
                    className="rounded-full bg-negro px-3 py-2 text-[11px] font-bold text-white"
                  >
                    Repetir
                  </button>
                </li>
              );
            })}
            {actividad.length === 0 && (
              <li className="px-4 py-6 text-center text-sm text-suave">
                Sin actividad todavía.
              </li>
            )}
          </ul>
        </section>

        <section className="tarjeta p-4">
          <p className="etiqueta text-suave">Cuenta</p>
          <p className="mt-1 truncate text-sm">{sesion?.email ?? usuario.email}</p>
          <p className="mt-1 text-[11px] text-suave">
            {formatearKilos(resumenMiembro(entradas, usuario.id, "total").kilos)}{" "}
            totales · {propias.length} series
          </p>

          {esAdmin && (
            <div className="mt-3 space-y-2 border-t border-borde pt-3">
              <p className="etiqueta text-suave">Admin</p>
              <button
                type="button"
                disabled={demoBusy}
                onClick={() => {
                  setDemoBusy(true);
                  setDemoMsg(null);
                  void cargarDemo()
                    .then(() => setDemoMsg("Demo cargada"))
                    .catch((e: Error) => setDemoMsg(e.message))
                    .finally(() => setDemoBusy(false));
                }}
                className="w-full rounded-2xl bg-lavanda py-2.5 text-xs font-bold disabled:opacity-50"
              >
                Cargar datos demo
              </button>
              <button
                type="button"
                disabled={demoBusy}
                onClick={() => {
                  setDemoBusy(true);
                  setDemoMsg(null);
                  void limpiarDemo()
                    .then(() => setDemoMsg("Demo eliminada"))
                    .catch((e: Error) => setDemoMsg(e.message))
                    .finally(() => setDemoBusy(false));
                }}
                className="w-full rounded-2xl border border-borde py-2.5 text-xs font-bold disabled:opacity-50"
              >
                Limpiar demo
              </button>
              {demoMsg && <p className="text-[11px] text-suave">{demoMsg}</p>}
              <Link
                href="/admin"
                className="block w-full rounded-2xl border border-borde py-2.5 text-center text-xs font-bold"
              >
                Panel administrador
              </Link>
            </div>
          )}

          <button
            type="button"
            onClick={() => void cerrarSesion().then(() => router.push("/login"))}
            className="mt-3 w-full rounded-2xl border border-borde py-3 text-xs font-bold uppercase tracking-wide text-suave"
          >
            Cerrar sesión
          </button>
        </section>
      </div>
    </>
  );
}
