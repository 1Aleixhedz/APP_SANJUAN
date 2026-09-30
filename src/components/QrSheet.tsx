"use client";

import { QRCodeSVG } from "qrcode.react";
import { useState, useSyncExternalStore } from "react";
import AppHeader from "@/components/AppHeader";
import { GIMNASIO, MAQUINAS } from "@/lib/machines";

const sinCambios = () => () => {};

export default function QrSheet() {
  const origenEnv =
    typeof process !== "undefined"
      ? process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") ?? ""
      : "";
  const origen = useSyncExternalStore(
    sinCambios,
    () => window.location.origin,
    () => origenEnv,
  );
  const [editada, setEditada] = useState<string | null>(null);
  const base = editada ?? (origenEnv || origen);

  return (
    <>
      <div className="print:hidden">
        <AppHeader titulo="QR de la sala" />
      </div>

      <div className="px-4 pb-4 pt-4">
        <div className="print:hidden">
          <p className="text-sm text-suave">
            Un adhesivo por bahía. Imprime, recorta y pégalo donde se vea al
            sentarse en la máquina.
          </p>
          <div className="tarjeta mt-3 p-3">
            <label htmlFor="base" className="etiqueta text-suave">
              Dirección de la app
            </label>
            <input
              id="base"
              value={base}
              onChange={(evento) => setEditada(evento.target.value)}
              placeholder="https://ironpulse.app"
              className="mt-1.5 w-full rounded-lg border border-borde bg-obsidiana px-3 py-2 font-mono text-xs outline-none focus:border-carmesi"
            />
            <p className="mt-1.5 text-[11px] text-suave/70">
              Cuando la app esté publicada, pon aquí su dirección definitiva
              antes de imprimir.
            </p>
          </div>
          <button
            type="button"
            onClick={() => window.print()}
            className="boton-carmesi mt-3 w-full rounded-2xl py-3.5 text-sm font-bold uppercase tracking-wide text-white"
          >
            Imprimir hoja de QR
          </button>
        </div>

        <div className="mt-5 grid grid-cols-2 gap-3">
          {MAQUINAS.map((maquina) => (
            <div
              key={maquina.id}
              className="flex break-inside-avoid flex-col items-center gap-1.5 rounded-2xl border border-borde bg-white p-3 text-center print:border-2 print:border-black"
            >
              <p className="text-[9px] font-bold uppercase tracking-[0.14em] text-red-600">
                {GIMNASIO.nombre}
              </p>
              <p className="font-mono text-xs font-bold text-neutral-500">
                Bahía #{maquina.bahia} · {maquina.sector}
              </p>
              <p className="text-sm font-bold leading-tight text-black">
                {maquina.nombre}
              </p>
              <QRCodeSVG
                value={`${base || "https://ironpulse.app"}/m/${maquina.slug}`}
                size={128}
                level="M"
                marginSize={1}
                className="h-auto w-full max-w-[128px]"
              />
              <p className="text-[9px] font-semibold leading-snug text-neutral-700">
                Escanea para ver la técnica,
                <br />
                los récords y registrar tu serie
              </p>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
