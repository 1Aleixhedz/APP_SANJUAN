"use client";

import Link from "next/link";
import { useEffect } from "react";
import AppHeader from "@/components/AppHeader";
import MaquinaFoto from "@/components/MaquinaFoto";
import { getMiembro } from "@/lib/data";
import { formatearNumero, recordDeMaquina } from "@/lib/rankings";
import { useStore } from "@/lib/store";
import type { Machine } from "@/lib/types";
import { inicioDeHoy } from "@/lib/data";

export default function MachineScreen({ maquina }: { maquina: Machine }) {
  const { entradas, montado, fijarMaquina, usuario } = useStore();

  useEffect(() => {
    fijarMaquina(maquina.id);
  }, [fijarMaquina, maquina.id]);

  const record = montado ? recordDeMaquina(entradas, maquina.id, "total") : undefined;
  const titular = record ? getMiembro(record.memberId) : undefined;

  const ultimaMia =
    usuario &&
    [...entradas]
      .filter((e) => e.memberId === usuario.id && e.machineId === maquina.id)
      .sort((a, b) => b.fecha - a.fecha)[0];

  const musculo =
    maquina.reclutamiento[0]?.etiqueta.replace(/\s*&\s*/g, " y ") ??
    maquina.sector;

  const nombreCorto = maquina.nombre
    .replace(/ con Cable$/i, "")
    .replace(/ Selectorizado$/i, "");

  return (
    <>
      <AppHeader titulo="Detalle de máquina" atras="/" />

      <div className="flex flex-col gap-4 px-4 pb-28 pt-1">
        <section className="flex items-start gap-3">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-negro font-mono text-sm font-bold text-white">
            #{maquina.bahia}
          </span>
          <div className="min-w-0 flex-1">
            <h1 className="text-2xl font-extrabold leading-tight">{nombreCorto}</h1>
            <p className="mt-0.5 text-sm text-suave">{maquina.detalles[0] ?? maquina.plataforma}</p>
          </div>
          <span className="shrink-0 rounded-full bg-lavanda px-3 py-1.5 text-[11px] font-bold text-texto">
            · Disponible
          </span>
        </section>

        <section className="tarjeta-suave overflow-hidden p-3">
          <p className="etiqueta mb-2 flex items-center gap-1.5 px-1 text-suave">
            <span className="text-jade">✓</span> Comprueba tu máquina
          </p>
          <MaquinaFoto
            bahia={maquina.bahia}
            nombre={nombreCorto}
            imagen={maquina.imagen}
            grande
          />
          {maquina.video && (
            <div className="mt-3 overflow-hidden rounded-2xl bg-negro">
              <video
                src={maquina.video}
                controls
                playsInline
                className="max-h-56 w-full"
                poster={maquina.imagen}
              >
                Tu navegador no reproduce el vídeo.
              </video>
              <p className="px-3 py-2 text-center text-[11px] text-white/70">
                Técnica en vídeo
              </p>
            </div>
          )}
        </section>

        <section className="tarjeta-suave p-4">
          <div className="flex gap-3">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-negro text-white">
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor">
                <path d="M12 3c2 3 3 5 3 7a3 3 0 11-6 0c0-2 1-4 3-7zm-5 14a5 5 0 0110 0v2H7z" />
              </svg>
            </span>
            <div>
              <p className="etiqueta text-suave">Músculo que entrenas</p>
              <h2 className="mt-0.5 text-lg font-extrabold">{musculo}</h2>
              <p className="mt-2 text-sm leading-relaxed text-suave">
                Te ayuda a mejorar la postura y a tirar con más fuerza en el día
                a día.
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                <span className="rounded-full bg-panel px-3 py-1.5 text-[11px] font-semibold">
                  · {maquina.sector}
                </span>
                {maquina.reclutamiento[1] && (
                  <span className="rounded-full bg-panel px-3 py-1.5 text-[11px] font-semibold">
                    · {maquina.reclutamiento[1].etiqueta.split("&")[0].trim()} (secundario)
                  </span>
                )}
              </div>
            </div>
          </div>
        </section>

        <section>
          <div className="mb-3 flex items-end justify-between">
            <h2 className="text-lg font-extrabold">Cómo usarla en 3 pasos</h2>
            <span className="text-[11px] font-semibold text-suave">Técnica segura</span>
          </div>
          <ol className="flex flex-col gap-4">
            {maquina.claves.slice(0, 3).map((clave, i) => (
              <li key={clave.titulo} className="flex gap-3">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-negro text-sm font-bold text-white">
                  {i + 1}
                </span>
                <div>
                  <p className="font-bold">{clave.titulo}</p>
                  <p className="mt-1 text-sm leading-relaxed text-suave">
                    {clave.detalle}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        </section>

        <section className="tarjeta flex items-center gap-3 p-3">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-lavanda text-xl">
            🏆
          </span>
          <div className="min-w-0 flex-1">
            <p className="etiqueta text-suave">Récord del gimnasio</p>
            <p className="truncate font-bold">
              {titular?.alias ?? "Aún sin marcas"}
            </p>
          </div>
          {record && (
            <p className="shrink-0 text-2xl font-extrabold">
              {formatearNumero(record.peso, 1)}
              <span className="ml-1 text-sm font-semibold text-suave">
                {maquina.unidad}
              </span>
            </p>
          )}
        </section>

        {ultimaMia && (
          <p className="tarjeta-suave px-4 py-3 text-sm leading-relaxed text-suave">
            <span className="font-bold text-texto">i </span>
            Tu último entrenamiento en esta máquina fue de{" "}
            <span className="font-bold text-texto">
              {formatearNumero(ultimaMia.peso, 1)} {maquina.unidad} ×{" "}
              {ultimaMia.reps} repeticiones
            </span>
            {ultimaMia.fecha >= inicioDeHoy() ? " (hoy)" : ""}.
          </p>
        )}
      </div>

      <div className="fixed inset-x-0 bottom-[calc(3.75rem+env(safe-area-inset-bottom))] z-30 mx-auto w-full max-w-md px-4 pb-2">
        <Link
          href="/registro"
          className="boton-negro flex w-full items-center justify-center gap-2 rounded-[22px] py-4 text-sm font-extrabold uppercase tracking-wide shadow-lg active:scale-[0.99]"
        >
          Empezar serie
        </Link>
      </div>
    </>
  );
}
