"use client";

import dynamic from "next/dynamic";
import { useCallback, useState } from "react";
import type { Telemetria3D } from "@/components/visor3d/VisorCanvas";
import type { Machine } from "@/lib/types";

const VisorCanvas = dynamic(
  () => import("@/components/visor3d/VisorCanvas"),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-[300px] items-center justify-center text-sm text-suave">
        Cargando modelo 3D…
      </div>
    ),
  },
);

export default function VisorBiomecanico({ maquina }: { maquina: Machine }) {
  const [animar, setAnimar] = useState(true);
  const [telemetria, setTelemetria] = useState<Telemetria3D>(() => ({
    articulacion: maquina.telemetria.articulacion,
    angulo: maquina.telemetria.angulo,
    veredicto: maquina.telemetria.veredicto,
    fase: maquina.telemetria.fase,
    pausa: maquina.telemetria.pausa,
    intensidad: 0.5,
    musculoClave: maquina.reclutamiento[0]?.etiqueta.split(" ")[0] ?? "Primario",
  }));

  const alActualizar = useCallback((datos: Telemetria3D) => {
    setTelemetria(datos);
  }, []);

  return (
    <section
      data-visor="telemetria"
      className="relative overflow-hidden rounded-2xl border border-borde bg-[#0a0e18]"
    >
      <div className="relative z-10 flex items-center justify-between px-3 pt-3">
        <span className="etiqueta flex items-center gap-1.5 rounded-lg border border-neon/25 bg-neon/10 px-2.5 py-1 text-neon">
          <svg viewBox="0 0 24 24" className="h-3 w-3" fill="currentColor">
            <path d="M11 2h2v4h4v2h-4v4h-2V8H7V6h4zM4 14h6v6H4zm10 0h6v6h-6z" />
          </svg>
          3D Telemetría
        </span>
        <button
          type="button"
          onClick={() => setAnimar((previo) => !previo)}
          aria-label={animar ? "Pausar animación" : "Reanudar animación"}
          className="flex h-8 w-8 items-center justify-center rounded-full bg-carmesi text-white active:scale-95"
        >
          {animar ? (
            <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="currentColor">
              <path d="M8 5h3v14H8zM13 5h3v14h-3z" />
            </svg>
          ) : (
            <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="currentColor">
              <path d="M8 5l11 7-11 7z" />
            </svg>
          )}
        </button>
      </div>

      <div className="relative h-[320px] w-full">
        <VisorCanvas
          key={maquina.id}
          maquina={maquina}
          animar={animar}
          onTelemetria={alActualizar}
        />

        <div className="pointer-events-none absolute right-3 top-2 z-10 max-w-[48%] rounded-xl border border-neon/25 bg-[#0a0e18]/90 px-2.5 py-1.5 backdrop-blur">
          <p className="etiqueta text-suave">{telemetria.articulacion}</p>
          <p className="font-mono text-base font-bold leading-tight">
            {telemetria.angulo}{" "}
            <span className="text-[11px] font-semibold text-jade">
              {telemetria.veredicto}
            </span>
          </p>
        </div>

        <div className="pointer-events-none absolute bottom-12 left-3 z-10 rounded-xl border border-carmesi/35 bg-[#0a0e18]/90 px-2.5 py-1.5 backdrop-blur">
          <p className="etiqueta text-suave">{telemetria.musculoClave}</p>
          <p className="text-sm font-bold text-carmesi">
            {telemetria.intensidad > 0.7
              ? "Contracción máxima"
              : telemetria.pausa}
          </p>
        </div>

        <div className="pointer-events-none absolute inset-x-0 bottom-3 z-10 flex justify-center">
          <span className="flex items-center gap-2 rounded-full border border-borde bg-[#0a0e18]/90 px-3 py-1.5 text-[11px] font-bold uppercase tracking-wide backdrop-blur">
            <span
              className="h-2 w-2 rounded-full bg-carmesi"
              style={{
                opacity: 0.4 + telemetria.intensidad * 0.6,
                boxShadow:
                  telemetria.intensidad > 0.65
                    ? "0 0 10px rgba(255,59,92,0.95)"
                    : "none",
              }}
            />
            {telemetria.fase}
          </span>
        </div>
      </div>
    </section>
  );
}
