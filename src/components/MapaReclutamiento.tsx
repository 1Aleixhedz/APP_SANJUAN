import type { Machine } from "@/lib/types";

export default function MapaReclutamiento({ maquina }: { maquina: Machine }) {
  return (
    <section className="tarjeta p-4">
      <div className="flex items-start justify-between gap-3">
        <h2 className="etiqueta leading-relaxed text-suave">
          Mapa de reclutamiento neuromuscular
        </h2>
        <p className="text-right">
          <span className="etiqueta block text-suave">Vector</span>
          <span className="etiqueta block text-texto">
            {maquina.telemetria.vector}
          </span>
        </p>
      </div>

      <ul className="mt-3 space-y-3.5">
        {maquina.reclutamiento.map((grupo) => {
          const esPrimario = grupo.tipo === "primario";
          return (
            <li key={grupo.etiqueta}>
              <div className="flex items-start gap-2">
                <span
                  className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${
                    esPrimario ? "bg-carmesi" : "bg-oro"
                  }`}
                />
                <span className="min-w-0 flex-1 text-[13px] font-semibold leading-snug">
                  {grupo.etiqueta}
                  <span
                    className={`ml-1.5 inline-block rounded-full px-1.5 py-0.5 align-middle text-[9px] font-bold uppercase ${
                      esPrimario
                        ? "bg-carmesi/15 text-carmesi"
                        : "bg-oro/15 text-oro"
                    }`}
                  >
                    {esPrimario ? "Primario" : "Secundario"}
                  </span>
                </span>
                <span className="w-11 shrink-0 text-right font-mono text-sm font-bold">
                  {grupo.nivel}%
                </span>
              </div>
              <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-panel-alto">
                <div
                  className={`h-full rounded-full ${
                    esPrimario ? "bg-carmesi" : "bg-oro"
                  }`}
                  style={{ width: `${grupo.nivel}%` }}
                />
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
