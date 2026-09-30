"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import AppHeader from "@/components/AppHeader";
import Cargando from "@/components/Cargando";
import MaquinaFoto from "@/components/MaquinaFoto";
import { inicioDeHoy } from "@/lib/data";
import {
  formatearNumero,
  recordDeMaquina,
  tablaDeRecords,
} from "@/lib/rankings";
import { useStore } from "@/lib/store";
import type { WorkoutEntry } from "@/lib/types";

const OBJETIVOS_REPS = [8, 10, 12, 15];
const MACROS_PESO = [2.5, 5, 10];

function redondear(valor: number, incremento: number): number {
  return Math.max(incremento, Math.round(valor / incremento) * incremento);
}

function formatearCron(segundos: number): string {
  const m = Math.floor(segundos / 60);
  const s = segundos % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

export default function RegistroScreen() {
  const {
    entradas,
    montado,
    usuario,
    maquinaActiva,
    sala,
    registrar,
    reiniciarDescanso,
  } = useStore();

  const [pesoManual, setPesoManual] = useState<number | null>(null);
  const [reps, setReps] = useState(10);
  const [guardando, setGuardando] = useState(false);
  const [pausado, setPausado] = useState(false);
  const [guardado, setGuardado] = useState<WorkoutEntry | null>(null);
  const [tick, setTick] = useState(Date.now());

  useEffect(() => {
    const id = window.setInterval(() => setTick(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, []);

  if (!montado) return <Cargando filas={5} />;

  if (!usuario) {
    return (
      <>
        <AppHeader />
        <div className="flex flex-1 flex-col items-center justify-center gap-4 px-8 text-center">
          <h1 className="text-xl font-extrabold">Entra para registrar</h1>
          <p className="text-sm text-suave">
            Necesitas una cuenta para guardar series.
          </p>
          <Link
            href="/login?next=/registro"
            className="boton-negro rounded-2xl px-6 py-3.5 text-sm font-bold"
          >
            Entrar con email
          </Link>
        </div>
      </>
    );
  }

  if (!maquinaActiva) {
    return (
      <>
        <AppHeader />
        <div className="flex flex-1 flex-col items-center justify-center gap-4 px-8 text-center">
          <h1 className="text-xl font-extrabold">Elige una máquina</h1>
          <p className="text-sm text-suave">
            Escanea el QR o ábrela desde la lista.
          </p>
          <Link
            href="/"
            className="boton-negro rounded-2xl px-6 py-3.5 text-sm font-bold"
          >
            Ver máquinas
          </Link>
        </div>
      </>
    );
  }

  const maquina = maquinaActiva;
  const hoy = inicioDeHoy();
  const misSeriesHoy = entradas.filter(
    (e) =>
      e.memberId === usuario.id &&
      e.machineId === maquina.id &&
      e.fecha >= hoy,
  );
  const serieActual = misSeriesHoy.length + 1;
  const objetivo = sala.objetivoSeries;

  const tabla = tablaDeRecords(entradas, maquina.id);
  const miMarca = tabla.find((f) => f.memberId === usuario.id);
  const ultima = misSeriesHoy.at(-1);
  const pesoSugerido = redondear(
    ultima?.peso ?? miMarca?.peso ?? (maquina.pesoMin + maquina.pesoMax) / 2,
    maquina.incremento,
  );
  const peso = pesoManual ?? pesoSugerido;

  const segundosDescanso =
    !pausado && sala.descansoDesde
      ? Math.max(0, Math.floor((tick - sala.descansoDesde) / 1000))
      : 0;

  const nombreCorto = maquina.nombre
    .replace(/ con Cable$/i, "")
    .replace(/ Selectorizado$/i, "");

  function ajustarPeso(delta: number) {
    setPesoManual(
      Math.min(
        maquina.pesoMax,
        Math.max(maquina.incremento, Number((peso + delta).toFixed(2))),
      ),
    );
  }

  async function guardar() {
    if (guardando) return;
    setGuardando(true);
    try {
      const entrada = await registrar({
        machineId: maquina.id,
        peso,
        reps,
        tipo: "efectiva",
      });
      setGuardado(entrada);
      setPesoManual(null);
      setPausado(false);
    } catch (e) {
      alert(e instanceof Error ? e.message : "No se pudo guardar");
    } finally {
      setGuardando(false);
    }
  }

  return (
    <>
      <AppHeader />

      <div className="flex flex-col gap-4 px-4 pb-6 pt-1">
        <section className="tarjeta flex items-center gap-3 p-3">
          <div className="h-14 w-14 shrink-0 overflow-hidden rounded-xl">
            <MaquinaFoto
              bahia={maquina.bahia}
              nombre={nombreCorto}
              imagen={maquina.imagen}
            />
          </div>
          <div className="min-w-0 flex-1">
            <p className="etiqueta text-suave">Máquina #{maquina.bahia}</p>
            <p className="truncate text-lg font-extrabold">{nombreCorto}</p>
            <p className="mt-0.5 flex items-center gap-1.5 text-xs text-suave">
              <span className="h-1.5 w-1.5 rounded-full bg-carmesi" />
              {maquina.sector}
            </p>
          </div>
          <span className="shrink-0 rounded-full bg-negro px-3 py-1.5 text-[11px] font-bold text-white">
            Serie {Math.min(serieActual, objetivo)} de {objetivo}
          </span>
        </section>

        <section className="tarjeta flex items-center gap-3 p-4">
          <div className="min-w-0 flex-1">
            <p className="etiqueta flex items-center gap-1.5 text-suave">
              <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="currentColor">
                <path d="M12 2a10 10 0 100 20 10 10 0 000-20zm1 5v5.3l4 2.3-1 1.7-5-2.9V7z" />
              </svg>
              Descanso
            </p>
            <p className="mt-1 font-mono text-3xl font-extrabold tracking-tight">
              {formatearCron(segundosDescanso)}
            </p>
          </div>
          <button
            type="button"
            onClick={() => setPausado((p) => !p)}
            className="rounded-2xl border border-borde bg-panel px-4 py-2.5 text-xs font-bold"
          >
            {pausado ? "Seguir" : "Pausar"}
          </button>
          <button
            type="button"
            onClick={() => {
              setPausado(false);
              reiniciarDescanso();
            }}
            aria-label="Reiniciar descanso"
            className="flex h-11 w-11 items-center justify-center rounded-full bg-lavanda"
          >
            ↺
          </button>
        </section>

        <section className="tarjeta p-4">
          <div className="flex items-center justify-between">
            <p className="etiqueta text-suave">Carga de peso</p>
            <p className="text-[11px] font-semibold text-suave">
              Anterior: {formatearNumero(ultima?.peso ?? miMarca?.peso ?? pesoSugerido, 1)} kg
            </p>
          </div>
          <div className="mt-4 flex items-center justify-center gap-5">
            <button
              type="button"
              onClick={() => ajustarPeso(-maquina.incremento)}
              className="flex h-14 w-14 items-center justify-center rounded-full bg-lavanda text-2xl font-bold"
            >
              −
            </button>
            <p className="min-w-[7rem] text-center text-4xl font-extrabold">
              {formatearNumero(peso, 1)}
              <span className="ml-1 text-lg font-bold text-suave">kg</span>
            </p>
            <button
              type="button"
              onClick={() => ajustarPeso(maquina.incremento)}
              className="flex h-14 w-14 items-center justify-center rounded-full bg-negro text-2xl font-bold text-white"
            >
              +
            </button>
          </div>
          <div className="mt-4 flex gap-2">
            {MACROS_PESO.map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => ajustarPeso(m)}
                className="flex-1 rounded-2xl border border-borde bg-panel py-3 text-sm font-bold"
              >
                +{m} kg
              </button>
            ))}
          </div>
        </section>

        <section className="tarjeta p-4">
          <div className="flex items-center justify-between">
            <p className="etiqueta text-suave">Repeticiones</p>
            <p className="text-[11px] font-semibold text-suave">
              Objetivo: 10 – 12 reps
            </p>
          </div>
          <div className="mt-4 flex items-center justify-center gap-5">
            <button
              type="button"
              onClick={() => setReps((r) => Math.max(1, r - 1))}
              className="flex h-14 w-14 items-center justify-center rounded-full bg-lavanda text-2xl font-bold"
            >
              −
            </button>
            <p className="min-w-[7rem] text-center text-4xl font-extrabold">
              {reps}
              <span className="ml-1 text-lg font-bold text-suave">reps</span>
            </p>
            <button
              type="button"
              onClick={() => setReps((r) => Math.min(30, r + 1))}
              className="flex h-14 w-14 items-center justify-center rounded-full bg-negro text-2xl font-bold text-white"
            >
              +
            </button>
          </div>
          <div className="mt-4 flex gap-2">
            {OBJETIVOS_REPS.map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setReps(r)}
                className={`flex-1 rounded-2xl py-3 text-sm font-bold ${
                  reps === r
                    ? "bg-negro text-white"
                    : "border border-borde bg-panel"
                }`}
              >
                {r}
              </button>
            ))}
          </div>
        </section>

        {guardado && (
          <p className="rounded-2xl bg-jade/10 px-4 py-3 text-center text-sm font-semibold text-jade">
            Serie guardada: {formatearNumero(guardado.peso, 1)} kg ×{" "}
            {guardado.reps}
            {recordDeMaquina([...entradas], maquina.id)?.peso === guardado.peso
              ? " · ¡Récord de sala!"
              : ""}
          </p>
        )}

        <button
          type="button"
          onClick={() => void guardar()}
          disabled={guardando}
          className="boton-negro flex w-full items-center justify-center gap-2 rounded-[22px] py-4 text-sm font-extrabold uppercase tracking-wide disabled:opacity-50"
        >
          {guardando ? "Guardando…" : "Guardar serie"}
        </button>

        <Link
          href="/"
          className="pb-2 text-center text-sm font-semibold text-suave"
        >
          Terminar ejercicio y pasar al siguiente →
        </Link>
      </div>
    </>
  );
}
