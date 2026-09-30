"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import AppHeader from "@/components/AppHeader";
import Avatar from "@/components/Avatar";
import Cargando from "@/components/Cargando";
import MaquinaFoto from "@/components/MaquinaFoto";
import { getMiembro } from "@/lib/data";
import { MAQUINAS, getMaquinaPorSlug } from "@/lib/machines";
import {
  distanciaAlPuesto,
  formatearNumero,
  hace,
  posicionEnRanking,
  rankingVolumen,
  tablaDeRecords,
} from "@/lib/rankings";
import { useStore } from "@/lib/store";
import type { Periodo } from "@/lib/types";

function RankingInner() {
  const { entradas, usuario, montado, maquinaActiva } = useStore();
  const parametros = useSearchParams();
  const slugPedido = parametros.get("maquina");

  const [periodo, setPeriodo] = useState<Periodo>("semana");
  const [modo, setModo] = useState<"maquina" | "volumen">("maquina");
  const [slug, setSlug] = useState(
    () => getMaquinaPorSlug(slugPedido ?? "")?.slug ?? null,
  );

  if (!montado) return <Cargando filas={7} />;

  const maquina =
    getMaquinaPorSlug(slug ?? "") ?? maquinaActiva ?? MAQUINAS[0];

  const tabla =
    modo === "maquina"
      ? tablaDeRecords(entradas, maquina.id, periodo).map((marca) => ({
          memberId: marca.memberId,
          valor: marca.peso,
          fecha: marca.fecha,
          unidad: maquina.unidad,
        }))
      : rankingVolumen(entradas, { periodo }).map((fila) => ({
          memberId: fila.memberId,
          valor: fila.kilos,
          fecha: Date.now(),
          unidad: "kg",
        }));

  const podio = tabla.slice(0, 3);
  const resto = tabla.slice(3, 8);
  const miPuesto = usuario ? posicionEnRanking(tabla, usuario.id) : undefined;
  const miFila = usuario
    ? tabla.find((f) => f.memberId === usuario.id)
    : undefined;
  const distancia =
    usuario && modo === "maquina"
      ? distanciaAlPuesto(
          tablaDeRecords(entradas, maquina.id, periodo),
          usuario.id,
          5,
        )
      : undefined;

  const mes = new Date().toLocaleDateString("es-ES", {
    month: "long",
    year: "numeric",
  });

  return (
    <>
      <AppHeader />

      <div className="flex flex-col gap-4 px-4 pb-6 pt-1">
        <section>
          <p className="etiqueta text-suave">Comunidad · Sala</p>
          <div className="mt-1 flex items-end justify-between gap-2">
            <h1 className="text-2xl font-extrabold">Récords & Podio</h1>
            <span className="shrink-0 rounded-full bg-lavanda px-3 py-1.5 text-[10px] font-bold uppercase text-suave">
              {mes}
            </span>
          </div>
        </section>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setModo("maquina")}
            className={`flex flex-1 items-center justify-center gap-2 rounded-2xl py-3.5 text-sm font-bold ${
              modo === "maquina" ? "bg-negro text-white" : "bg-lavanda text-texto"
            }`}
          >
            Por máquina
          </button>
          <button
            type="button"
            onClick={() => setModo("volumen")}
            className={`flex flex-1 items-center justify-center gap-2 rounded-2xl py-3.5 text-sm font-bold ${
              modo === "volumen" ? "bg-negro text-white" : "bg-lavanda text-texto"
            }`}
          >
            Kilos totales
          </button>
        </div>

        {modo === "maquina" && (
          <section>
            <p className="etiqueta mb-2 text-suave">Selecciona máquina</p>
            <div className="flex gap-2 overflow-x-auto pb-1 sin-scrollbar">
              {MAQUINAS.map((m) => {
                const activa = m.id === maquina.id;
                return (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setSlug(m.slug)}
                    className={`w-28 shrink-0 overflow-hidden rounded-2xl border p-2 text-left ${
                      activa
                        ? "border-transparent bg-lavanda"
                        : "border-borde bg-panel"
                    }`}
                  >
                    <div className="h-16 overflow-hidden rounded-xl">
                      <MaquinaFoto
                        bahia={m.bahia}
                        nombre={m.nombre}
                        imagen={m.imagen}
                      />
                    </div>
                    <p className="mt-2 truncate text-xs font-bold">
                      {m.nombre.split(" ")[0]} {m.nombre.split(" ")[1] ?? ""}
                    </p>
                    <p className="etiqueta text-suave">#{m.bahia}</p>
                  </button>
                );
              })}
            </div>
          </section>
        )}

        <div className="flex gap-2">
          {(["semana", "mes", "total"] as Periodo[]).map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => setPeriodo(p)}
              className={`rounded-full px-3 py-1.5 text-[11px] font-bold ${
                periodo === p ? "bg-negro text-white" : "bg-lavanda text-suave"
              }`}
            >
              {p === "semana" ? "Semana" : p === "mes" ? "Mes" : "Histórico"}
            </button>
          ))}
        </div>

        <section className="tarjeta-suave p-4">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <p className="etiqueta text-suave">Cuadro de honor</p>
              <p className="text-sm font-bold">
                {modo === "maquina" ? "Mejor marca" : "Más kilos movidos"}
              </p>
            </div>
          </div>

          {podio.length === 0 ? (
            <p className="py-6 text-center text-sm text-suave">
              Aún no hay marcas en este periodo.
            </p>
          ) : (
            <div className="flex items-end justify-center gap-2 pt-2">
              {[podio[1], podio[0], podio[2]].map((fila, visual) => {
                if (!fila) return <div key={visual} className="w-24" />;
                const puesto = visual === 1 ? 1 : visual === 0 ? 2 : 3;
                const esLider = puesto === 1;
                const miembro = getMiembro(fila.memberId);
                const gap =
                  podio[0] && !esLider
                    ? `-${formatearNumero(podio[0].valor - fila.valor, 0)}kg`
                    : null;
                return (
                  <div
                    key={fila.memberId}
                    className={`flex w-24 flex-col items-center ${esLider ? "-mt-2" : ""}`}
                  >
                    {esLider && <span className="mb-1 text-lg">👑</span>}
                    <div
                      className={`relative flex items-center justify-center rounded-full font-bold text-white ${
                        esLider
                          ? "h-16 w-16 bg-negro text-lg"
                          : "h-12 w-12 bg-suave/60 text-sm"
                      }`}
                    >
                      {(miembro?.alias ?? "?").slice(0, 2).toUpperCase()}
                      {gap && (
                        <span className="absolute -right-2 -top-1 rounded-full bg-panel px-1.5 py-0.5 text-[9px] font-bold text-texto shadow">
                          {gap}
                        </span>
                      )}
                    </div>
                    {esLider && (
                      <span className="mt-1 rounded bg-carmesi px-1.5 py-0.5 text-[9px] font-bold uppercase text-white">
                        Récord
                      </span>
                    )}
                    <p className="mt-1 max-w-full truncate text-xs font-bold">
                      {miembro?.alias}
                    </p>
                    <p className="font-extrabold">
                      {formatearNumero(fila.valor, modo === "maquina" ? 1 : 0)}
                      <span className="ml-0.5 text-[10px] text-suave">
                        {fila.unidad}
                      </span>
                    </p>
                    <div
                      className={`mt-2 flex h-8 w-full items-center justify-center rounded-t-lg text-[10px] font-bold ${
                        esLider ? "bg-negro text-white" : "bg-panel text-suave"
                      }`}
                    >
                      {esLider ? "Líder" : `#${puesto}`}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {usuario && miFila ? (
          <section className="flex items-center gap-3 rounded-[22px] bg-negro p-3 text-white">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-white font-mono text-lg font-extrabold text-negro">
              #{miPuesto}
            </span>
            <div className="min-w-0 flex-1">
              <p className="flex items-center gap-2 text-sm font-bold">
                Tú
                <span className="rounded-full bg-white/15 px-2 py-0.5 text-[10px] font-bold uppercase text-white/80">
                  Progreso
                </span>
              </p>
              <p className="mt-0.5 text-[11px] text-white/70">
                {distancia
                  ? `A solo ${formatearNumero(distancia.kilos, 1)} kg del Top 5`
                  : miPuesto && miPuesto <= 5
                    ? "Estás en el Top 5 de la sala"
                    : "Sigue sumando series"}
              </p>
            </div>
            <div className="shrink-0 text-right">
              <p className="text-xl font-extrabold">
                {formatearNumero(miFila.valor, modo === "maquina" ? 1 : 0)}
              </p>
              <p className="etiqueta text-white/50">Tu marca</p>
            </div>
          </section>
        ) : (
          <Link
            href="/login?next=/ranking"
            className="tarjeta-suave block p-4 text-center text-sm"
          >
            <span className="font-bold">Entra</span> para ver tu puesto
          </Link>
        )}

        {resto.length > 0 && (
          <section>
            <p className="mb-2 text-base font-extrabold">Tabla de clasificación</p>
            <ul className="tarjeta divide-y divide-borde overflow-hidden">
              {resto.map((fila, i) => {
                const esTu = fila.memberId === usuario?.id;
                return (
                  <li
                    key={fila.memberId}
                    className={`flex items-center gap-3 px-3 py-3 ${
                      esTu ? "bg-lavanda" : ""
                    }`}
                  >
                    <span className="w-5 text-center font-mono text-sm font-bold text-suave">
                      {i + 4}
                    </span>
                    <Avatar
                      memberId={fila.memberId}
                      tamano="sm"
                      anillo={esTu ? "carmesi" : "borde"}
                    />
                    <div className="min-w-0 flex-1">
                      <p className="flex items-center gap-2 truncate text-sm font-bold">
                        {getMiembro(fila.memberId)?.alias}
                        {esTu && (
                          <span className="rounded-full bg-negro px-2 py-0.5 text-[9px] font-bold uppercase text-white">
                            Actual
                          </span>
                        )}
                      </p>
                      <p className="text-[11px] text-suave">{hace(fila.fecha)}</p>
                    </div>
                    <p className="font-extrabold">
                      {formatearNumero(fila.valor, modo === "maquina" ? 1 : 0)}
                      <span className="ml-0.5 text-[10px] text-suave">
                        {fila.unidad}
                      </span>
                    </p>
                  </li>
                );
              })}
            </ul>
          </section>
        )}
      </div>
    </>
  );
}

export default function RankingScreen() {
  return (
    <Suspense fallback={<Cargando filas={7} />}>
      <RankingInner />
    </Suspense>
  );
}
