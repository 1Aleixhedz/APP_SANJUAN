"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import AppHeader from "@/components/AppHeader";
import MaquinaFoto from "@/components/MaquinaFoto";
import { fetchCatalogo } from "@/lib/catalogo";
import { SECTORES } from "@/lib/machines";
import { useStore } from "@/lib/store";
import type { Machine } from "@/lib/types";

const FILTROS_RAPIDOS = ["Todo", "Espalda", "Pecho", "Brazos", "Pierna", "Hombro"];

export default function SalaScreen() {
  const { maquinaActiva, montado } = useStore();
  const [filtro, setFiltro] = useState("Todo");
  const [busqueda, setBusqueda] = useState("");
  const [catalogo, setCatalogo] = useState<Machine[]>([]);

  useEffect(() => {
    void fetchCatalogo().then(setCatalogo);
  }, []);

  const visibles = useMemo(() => {
    const texto = busqueda.trim().toLowerCase();
    return catalogo.filter((maquina) => {
      const coincideFiltro =
        filtro === "Todo" ||
        maquina.sector === filtro ||
        (filtro === "Brazos" &&
          (maquina.sector === "Brazo" ||
            maquina.primarios.includes("biceps") ||
            maquina.primarios.includes("triceps")));
      const coincideTexto =
        texto === "" ||
        maquina.nombre.toLowerCase().includes(texto) ||
        maquina.bahia.includes(texto) ||
        maquina.sector.toLowerCase().includes(texto) ||
        maquina.reclutamiento.some((r) =>
          r.etiqueta.toLowerCase().includes(texto),
        );
      return coincideFiltro && coincideTexto;
    });
  }, [filtro, busqueda, catalogo]);

  const chips = [
    "Todo",
    ...FILTROS_RAPIDOS.filter((f) => f !== "Todo").filter(
      (f) => f === "Brazos" || SECTORES.includes(f),
    ),
  ];

  return (
    <>
      <AppHeader />

      <div className="flex flex-col gap-4 px-4 pb-6 pt-1">
        <section>
          <p className="etiqueta text-suave">Tu entrenamiento de hoy</p>
          <h1 className="mt-1 text-2xl font-extrabold leading-tight tracking-tight">
            ¿Qué máquina buscas?
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-suave">
            Reconócela por la foto o escanea el código de la bahía.
          </p>
        </section>

        <Link
          href={montado && maquinaActiva ? `/m/${maquinaActiva.slug}` : "/m/remo-sentado"}
          className="boton-negro flex items-center gap-3 rounded-[22px] px-4 py-3.5 active:scale-[0.99]"
        >
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/15">
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor">
              <path d="M3 3h7v7H3zm2 2v3h3V5zM14 3h7v7h-7zm2 2v3h3V5zM3 14h7v7H3zm2 2v3h3v-3zM14 14h2.5v2.5H14zM18.5 14H21v2.5h-2.5zM16.25 16.25h2.5v2.5h-2.5zM14 18.5h2.5V21H14zM18.5 18.5H21V21h-2.5z" />
            </svg>
          </span>
          <span className="min-w-0 flex-1 text-left">
            <span className="block text-sm font-bold">Escanear QR de máquina</span>
            <span className="block text-[11px] text-white/70">
              {montado && maquinaActiva
                ? `Sesión: ${maquinaActiva.nombre}`
                : "Apunta al adhesivo de la bahía"}
            </span>
          </span>
          <span className="text-lg opacity-70">→</span>
        </Link>

        <div className="flex items-center gap-2 rounded-[18px] bg-lavanda px-3.5 py-3">
          <svg viewBox="0 0 24 24" className="h-5 w-5 shrink-0 text-suave" fill="currentColor">
            <path d="M10 3a7 7 0 015.6 11.2l4.1 4.1-1.4 1.4-4.1-4.1A7 7 0 1110 3zm0 2a5 5 0 100 10 5 5 0 000-10z" />
          </svg>
          <input
            type="search"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            placeholder="Buscar máquina o músculo…"
            className="w-full bg-transparent text-sm outline-none placeholder:text-suave/80"
          />
        </div>

        <div className="flex gap-2 overflow-x-auto pb-0.5 sin-scrollbar">
          {chips.map((opcion) => (
            <button
              key={opcion}
              type="button"
              onClick={() => setFiltro(opcion)}
              className={`shrink-0 rounded-full px-4 py-2 text-xs font-bold ${
                filtro === opcion
                  ? "bg-negro text-white"
                  : "bg-lavanda text-texto"
              }`}
            >
              {opcion}
            </button>
          ))}
        </div>

        <div className="flex flex-col gap-3">
          {visibles.map((maquina) => (
            <article
              key={maquina.id}
              className="tarjeta overflow-hidden p-3 shadow-sm"
            >
              <div className="mb-2 flex items-start justify-between gap-2 px-1">
                <p className="etiqueta text-rosa">
                  {maquina.sector}
                  {maquina.reclutamiento[0]
                    ? ` · ${maquina.reclutamiento[0].etiqueta.split("&")[0].trim()}`
                    : ""}
                </p>
                <p className="etiqueta text-suave">M-{maquina.bahia}</p>
              </div>
              <h2 className="px-1 text-xl font-extrabold leading-tight">
                {maquina.nombre.replace(/ con Cable$/i, "").replace(/ Selectorizado$/i, "")}
              </h2>
              <div className="mt-3">
                <MaquinaFoto
                  bahia={maquina.bahia}
                  nombre={maquina.nombre}
                  imagen={maquina.imagen}
                />
              </div>
              {maquina.claves[0] && (
                <p className="mt-2 flex items-start gap-1.5 px-1 text-[12px] leading-snug text-suave">
                  <span className="mt-0.5 text-negro">✓</span>
                  {maquina.claves[0].detalle.slice(0, 90)}
                  {maquina.claves[0].detalle.length > 90 ? "…" : ""}
                </p>
              )}
              <Link
                href={`/m/${maquina.slug}`}
                className="boton-negro mt-3 flex w-full items-center justify-center gap-2 rounded-2xl py-3.5 text-sm font-bold active:scale-[0.99]"
              >
                Ver técnica y registrar
                <span aria-hidden>›</span>
              </Link>
            </article>
          ))}
          {visibles.length === 0 && (
            <p className="py-8 text-center text-sm text-suave">
              Ninguna máquina coincide.
            </p>
          )}
        </div>

        <div className="tarjeta-suave flex gap-3 p-4">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-panel text-lg">
            ⌂
          </span>
          <p className="text-sm leading-relaxed text-suave">
            En cada máquina verás cómo usarla en 3 pasos claros, sin tecnicismos.
          </p>
        </div>
      </div>
    </>
  );
}
