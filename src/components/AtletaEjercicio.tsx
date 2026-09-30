"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import type { Machine, MuscleId } from "@/lib/types";

/**
 * Animación estilo Fitonomy: maniquí blanco anatómico, máquina negra,
 * fondo azul oscuro y músculos primarios en rojo al contraer.
 */

type Patron = {
  /** Vista de cámara. */
  vista: "perfil" | "trescuartos" | "frontal";
  etiquetaAngulo: string;
  anguloDe: (t: number) => number;
  /** Nombre corto del músculo que se enciende (para la etiqueta). */
  musculoClave: string;
};

function suave(t: number): number {
  return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
}

/** Ciclo: sube, pausa en pico, baja controlada. */
function progresoCiclo(tiempoMs: number, periodoMs: number): number {
  const u = (tiempoMs % periodoMs) / periodoMs;
  if (u < 0.4) return suave(u / 0.4);
  if (u < 0.55) return 1;
  return 1 - suave((u - 0.55) / 0.45);
}

function faseDe(tiempoMs: number, periodoMs: number): string {
  const u = (tiempoMs % periodoMs) / periodoMs;
  if (u < 0.4) return "Fase concéntrica activa";
  if (u < 0.55) return "Pausa en contracción";
  return "Fase excéntrica controlada";
}

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

const PATRONES: Record<string, Patron> = {
  "remo-sentado": {
    vista: "trescuartos",
    etiquetaAngulo: "Ángulo codo",
    anguloDe: (t) => lerp(155, 88, t),
    musculoClave: "Dorsal",
  },
  "jalon-al-pecho": {
    vista: "perfil",
    etiquetaAngulo: "Ángulo tronco",
    anguloDe: (t) => lerp(5, 18, t),
    musculoClave: "Dorsal",
  },
  "press-de-pecho": {
    vista: "perfil",
    etiquetaAngulo: "Ángulo codo",
    anguloDe: (t) => lerp(85, 165, t),
    musculoClave: "Pectoral",
  },
  "press-plano-mancuernas": {
    vista: "perfil",
    etiquetaAngulo: "Ángulo codo",
    anguloDe: (t) => lerp(80, 160, t),
    musculoClave: "Pectoral",
  },
  "press-militar": {
    vista: "perfil",
    etiquetaAngulo: "Ángulo hombro",
    anguloDe: (t) => lerp(20, 170, t),
    musculoClave: "Deltoides",
  },
  "prensa-inclinada": {
    vista: "perfil",
    etiquetaAngulo: "Ángulo rodilla",
    anguloDe: (t) => lerp(85, 165, t),
    musculoClave: "Cuádriceps",
  },
  "extension-de-cuadriceps": {
    vista: "perfil",
    etiquetaAngulo: "Ángulo rodilla",
    anguloDe: (t) => lerp(95, 5, t),
    musculoClave: "Cuádriceps",
  },
  "curl-femoral": {
    vista: "perfil",
    etiquetaAngulo: "Ángulo rodilla",
    anguloDe: (t) => lerp(170, 75, t),
    musculoClave: "Isquios",
  },
  abductores: {
    vista: "frontal",
    etiquetaAngulo: "Apertura cadera",
    anguloDe: (t) => lerp(8, 42, t),
    musculoClave: "Glúteo medio",
  },
  "curl-de-biceps": {
    vista: "perfil",
    etiquetaAngulo: "Ángulo codo",
    anguloDe: (t) => lerp(155, 40, t),
    musculoClave: "Bíceps",
  },
  "crunch-abdominal": {
    vista: "perfil",
    etiquetaAngulo: "Flexión tronco",
    anguloDe: (t) => lerp(5, 32, t),
    musculoClave: "Abdomen",
  },
};

const POR_DEFECTO = PATRONES["remo-sentado"];

function suscribirMovimiento(cb: () => void) {
  const media = window.matchMedia("(prefers-reduced-motion: reduce)");
  media.addEventListener("change", cb);
  return () => media.removeEventListener("change", cb);
}

function movimientoReducido() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function rojo(intensidad: number, base = 0.35) {
  const a = base + intensidad * (1 - base);
  return `rgba(255, 59, 92, ${a.toFixed(3)})`;
}

/** Maniquí blanco de 3/4 trasero: ideal para remo / espalda. */
function RemoTresCuartos({
  t,
  primarios,
}: {
  t: number;
  primarios: MuscleId[];
}) {
  // Brazo: extendido adelante → tirón al ombligo
  const hombro = lerp(22, -32, t);
  const codo = lerp(158, 86, t);
  const torso = lerp(10, 3, t);
  const intensidad = t;
  const dorsalOn =
    primarios.includes("dorsal") || primarios.includes("romboides");
  const mangoX = lerp(58, 6, t);
  const mangoY = lerp(98, 78, t);

  return (
    <g transform="translate(155 18) scale(1.05)">
      {/* Máquina negra */}
      <g>
        <rect x="-85" y="208" width="175" height="9" rx="3" fill="#141820" />
        {/* Torre de polea */}
        <rect x="88" y="8" width="16" height="205" rx="3" fill="#0e1118" />
        <rect x="82" y="8" width="28" height="18" rx="4" fill="#1a1f2a" />
        <circle cx="96" cy="28" r="9" fill="#0a0c12" stroke="#3a4254" strokeWidth="2" />
        {/* Asiento y soporte */}
        <path
          d="M-36 122h72a8 8 0 0 1 8 8v6H-44v-6a8 8 0 0 1 8-8z"
          fill="#1a1f2a"
        />
        <rect x="-10" y="136" width="14" height="58" rx="3" fill="#0e1118" />
        <path
          d="M36 158h42a5 5 0 0 1 5 5v4H31v-4a5 5 0 0 1 5-5z"
          fill="#1a1f2a"
        />
        {/* Cable */}
        <line
          x1="96"
          y1="37"
          x2={mangoX + 8}
          y2={mangoY}
          stroke="#5eead4"
          strokeWidth="1.8"
          strokeDasharray="5 4"
          opacity="0.65"
        />
      </g>

      <g transform={`rotate(${torso} 0 105)`}>
        {/* Piernas (sentado, vista 3/4) */}
        <path
          d="M-18 128
             C-20 148 -8 168 18 178
             C28 180 42 176 52 172
             L54 164
             C42 168 30 170 22 168
             C4 160 -6 145 -4 128 Z"
          fill="#f2f5f9"
        />
        <path
          d="M6 128
             C10 150 28 168 48 174
             L52 166
             C34 160 18 145 14 128 Z"
          fill="#e6ebf2"
        />
        <ellipse cx="52" cy="172" rx="13" ry="6" fill="#d5dce7" />

        {/* Pelvis / glúteo */}
        <ellipse cx="0" cy="124" rx="20" ry="16" fill="#f2f5f9" />

        {/* Tronco anatómico (espalda) */}
        <path
          d="M-22 52
             C-14 38 10 34 24 48
             C30 56 32 78 30 108
             C28 122 14 132 -4 130
             C-20 128 -26 116 -24 100
             C-24 78 -26 62 -22 52 Z"
          fill="#f7f9fc"
          stroke="#b8c2d1"
          strokeWidth="1.2"
        />

        {/* Línea de columna */}
        <path
          d="M2 54 C4 78 4 100 2 122"
          fill="none"
          stroke="#c5cedb"
          strokeWidth="2.5"
          strokeLinecap="round"
          opacity="0.55"
        />

        {/* Dorsales — se encienden en rojo */}
        <path
          d="M-18 62
             C-30 78 -32 100 -18 118
             C-10 108 -6 88 -8 68 Z"
          fill={dorsalOn ? rojo(intensidad) : "#e8eef6"}
          filter={dorsalOn && intensidad > 0.4 ? "url(#glow-rojo)" : undefined}
        />
        <path
          d="M10 58
             C22 72 26 98 14 118
             C8 106 6 84 8 64 Z"
          fill={dorsalOn ? rojo(intensidad * 0.95) : "#e8eef6"}
          filter={dorsalOn && intensidad > 0.4 ? "url(#glow-rojo)" : undefined}
        />

        {/* Romboides / centro espalda */}
        <path
          d="M-4 68 C4 64 12 68 12 82 C8 94 0 96 -4 86 Z"
          fill={
            dorsalOn ? rojo(intensidad * 0.75, 0.25) : "#edf1f7"
          }
        />

        {/* Trapecio */}
        <path
          d="M-10 50 C2 40 16 42 22 52 L14 64 L-2 64 Z"
          fill={
            primarios.includes("trapecio") || primarios.includes("romboides")
              ? rojo(intensidad * 0.65, 0.2)
              : "#eef2f7"
          }
        />

        {/* Cabeza */}
        <circle cx="4" cy="28" r="17" fill="#f7f9fc" stroke="#b8c2d1" strokeWidth="1.2" />
        <path
          d="M-6 14 C4 6 18 12 20 26"
          fill="none"
          stroke="#b8c2d1"
          strokeWidth="4"
          strokeLinecap="round"
        />

        {/* Hombro */}
        <ellipse cx="24" cy="56" rx="12" ry="11" fill="#f2f5f9" stroke="#b8c2d1" strokeWidth="0.8" />

        {/* Brazo (el que tira) */}
        <g transform={`translate(24 56) rotate(${hombro})`}>
          <path
            d="M-7 2
               C-10 18 -8 36 0 44
               C6 36 10 18 8 2
               C4 -2 0 -2 -7 2 Z"
            fill="#f7f9fc"
            stroke="#b8c2d1"
            strokeWidth="1"
          />
          <ellipse cx="5" cy="20" rx="5" ry="15" fill="#e2e8f0" opacity="0.75" />

          <g transform={`translate(0 42) rotate(${codo - 180})`}>
            <path
              d="M-6 0
                 C-8 16 -6 32 0 40
                 C5 32 7 16 5 0
                 C2 -3 -2 -3 -6 0 Z"
              fill={
                primarios.includes("biceps")
                  ? rojo(intensidad * 0.5, 0.15)
                  : "#f7f9fc"
              }
              stroke="#b8c2d1"
              strokeWidth="1"
            />
            {/* Mano + mango D negro */}
            <ellipse cx="0" cy="44" rx="7" ry="6" fill="#e2e8f0" />
            <path
              d="M-16 46
                 C-8 38 8 38 16 46
                 C8 54 -8 54 -16 46 Z"
              fill="#1a1f2a"
              stroke="#6b7280"
              strokeWidth="1"
            />
          </g>
        </g>

        {/* Brazo lejano (sugerido, más pequeño) */}
        <g
          opacity="0.45"
          transform={`translate(-14 58) rotate(${hombro * 0.7})`}
        >
          <ellipse cx="0" cy="18" rx="7" ry="16" fill="#e6ebf2" />
          <g transform={`translate(0 32) rotate(${codo - 180})`}>
            <ellipse cx="0" cy="14" rx="5" ry="13" fill="#e6ebf2" />
          </g>
        </g>

        {/* Flecha de tirón */}
        <g
          opacity={0.25 + intensidad * 0.55}
          transform={`translate(${lerp(62, 22, t)} ${lerp(92, 74, t)})`}
        >
          <path
            d="M12 0 H-10 M-10 0 L-4 -6 M-10 0 L-4 6"
            fill="none"
            stroke="#ffffff"
            strokeWidth="2.4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </g>
      </g>
    </g>
  );
}

/** Perfil lateral genérico para press, curls, pierna, etc. */
function AtletaPerfil({
  t,
  slug,
  primarios,
}: {
  t: number;
  slug: string;
  primarios: MuscleId[];
}) {
  const intensidad = t;
  const sentado = [
    "jalon-al-pecho",
    "press-de-pecho",
    "extension-de-cuadriceps",
    "crunch-abdominal",
  ].includes(slug);
  const tumbado = slug === "press-plano-mancuernas" || slug === "curl-femoral";
  const prensa = slug === "prensa-inclinada";
  const dePie = slug === "press-militar" || slug === "curl-de-biceps";

  let hombro = 20;
  let codo = 150;
  let torso = 0;
  let cadera = 175;
  let rodilla = 175;

  if (slug === "jalon-al-pecho") {
    hombro = lerp(-150, -40, t);
    codo = lerp(165, 85, t);
    torso = lerp(4, 14, t);
    cadera = 90;
    rodilla = 90;
  } else if (slug === "press-de-pecho") {
    hombro = lerp(5, 55, t);
    codo = lerp(85, 165, t);
    torso = 0;
    cadera = 95;
    rodilla = 90;
  } else if (slug === "press-plano-mancuernas") {
    hombro = lerp(-5, 50, t);
    codo = lerp(80, 160, t);
    torso = -8;
    cadera = 170;
    rodilla = 100;
  } else if (slug === "press-militar") {
    hombro = lerp(-20, -170, t);
    codo = lerp(90, 170, t);
    torso = 0;
    cadera = 175;
    rodilla = 175;
  } else if (slug === "prensa-inclinada") {
    hombro = 30;
    codo = 145;
    torso = -18;
    cadera = lerp(70, 145, t);
    rodilla = lerp(85, 165, t);
  } else if (slug === "extension-de-cuadriceps") {
    hombro = 15;
    codo = 140;
    torso = 4;
    cadera = 90;
    rodilla = lerp(95, 175, t);
  } else if (slug === "curl-femoral") {
    hombro = 35;
    codo = 120;
    torso = -78;
    cadera = 175;
    rodilla = lerp(170, 75, t);
  } else if (slug === "curl-de-biceps") {
    hombro = lerp(12, 8, t);
    codo = lerp(155, 40, t);
    torso = 4;
    cadera = 175;
    rodilla = 175;
  } else if (slug === "crunch-abdominal") {
    hombro = lerp(35, 18, t);
    codo = 85;
    torso = lerp(5, 32, t);
    cadera = 100;
    rodilla = 80;
  }

  const fillMusculo = (id: MuscleId, factor = 1) =>
    primarios.includes(id) ? rojo(intensidad * factor) : "#eef2f7";

  return (
    <g transform="translate(160 30)">
      {/* Equipo */}
      {sentado && !prensa && (
        <g>
          <rect x="-40" y="125" width="70" height="12" rx="4" fill="#1a1d24" />
          <rect x="-10" y="137" width="12" height="55" rx="2" fill="#12151b" />
          <rect x="-55" y="188" width="100" height="8" rx="2" fill="#1a1d24" />
        </g>
      )}
      {tumbado && slug === "press-plano-mancuernas" && (
        <rect x="-90" y="118" width="140" height="12" rx="4" fill="#1a1d24" />
      )}
      {tumbado && slug === "curl-femoral" && (
        <rect x="-80" y="70" width="130" height="14" rx="4" fill="#1a1d24" />
      )}
      {prensa && (
        <g>
          <rect x="-70" y="20" width="14" height="180" rx="3" fill="#12151b" />
          <rect
            x="-54"
            y={lerp(90, 40, t)}
            width="80"
            height="10"
            rx="3"
            fill="#2a303c"
          />
        </g>
      )}
      {dePie && (
        <rect x="-50" y="205" width="110" height="8" rx="2" fill="#1a1d24" opacity="0.7" />
      )}

      <g transform={`rotate(${torso} 0 90)`}>
        {/* Pierna */}
        <g transform={`rotate(${cadera - 175} 0 125)`}>
          <path
            d="M-10 120 C-12 145 -4 175 4 190 C10 170 12 145 10 122 Z"
            fill={fillMusculo("cuadriceps")}
            filter={
              primarios.includes("cuadriceps") && intensidad > 0.5
                ? "url(#glow-rojo)"
                : undefined
            }
          />
          <path
            d="M-12 125 C-16 150 -10 178 -2 190 C0 165 -2 140 0 125 Z"
            fill={fillMusculo("isquios", 0.9)}
            opacity="0.95"
          />
          <ellipse cx="0" cy="122" rx="12" ry="11" fill={fillMusculo("gluteo", 0.85)} />
          <g transform={`translate(0 185) rotate(${rodilla - 175})`}>
            <path
              d="M-6 0 C-8 20 -4 42 2 52 C6 40 7 18 5 0 Z"
              fill="#eef2f7"
              stroke="#c5cedb"
              strokeWidth="0.8"
            />
            <ellipse cx="2" cy="54" rx="11" ry="5" fill="#d8dee8" />
            {(slug === "curl-femoral" || slug === "extension-de-cuadriceps") && (
              <circle
                cx="2"
                cy="50"
                r="8"
                fill="#1a1d24"
                stroke="#2dd4e0"
                strokeWidth="1"
                opacity="0.85"
              />
            )}
          </g>
        </g>

        {/* Tronco */}
        <path
          d="M-16 45 C-6 32 10 32 18 45 L20 115 C6 128 -12 126 -18 112 Z"
          fill="#f4f7fb"
          stroke="#c5cedb"
          strokeWidth="1"
        />
        <ellipse
          cx="8"
          cy="62"
          rx="10"
          ry="14"
          fill={fillMusculo("pectoral")}
          filter={
            primarios.includes("pectoral") && intensidad > 0.5
              ? "url(#glow-rojo)"
              : undefined
          }
        />
        <path
          d="M-14 58 C-22 75 -20 100 -8 112 C-4 95 -6 72 -8 60 Z"
          fill={fillMusculo("dorsal")}
          filter={
            primarios.includes("dorsal") && intensidad > 0.5
              ? "url(#glow-rojo)"
              : undefined
          }
        />
        <rect
          x="-5"
          y="78"
          width="12"
          height="28"
          rx="3"
          fill={fillMusculo("abdomen")}
          filter={
            primarios.includes("abdomen") && intensidad > 0.5
              ? "url(#glow-rojo)"
              : undefined
          }
        />

        {/* Cabeza */}
        <circle cx="0" cy="24" r="15" fill="#f4f7fb" stroke="#c5cedb" strokeWidth="1" />

        {/* Brazo */}
        <g transform={`translate(16 52) rotate(${hombro})`}>
          <ellipse
            cx="0"
            cy="16"
            rx="9"
            ry="17"
            fill={fillMusculo("deltoides")}
            filter={
              primarios.includes("deltoides") && intensidad > 0.5
                ? "url(#glow-rojo)"
                : undefined
            }
          />
          <ellipse cx="3" cy="18" rx="6" ry="14" fill="#e4e9f0" opacity="0.85" />
          <g transform={`translate(0 32) rotate(${codo - 180})`}>
            <ellipse
              cx="0"
              cy="15"
              rx="7"
              ry="15"
              fill={fillMusculo("biceps", 0.85)}
              filter={
                primarios.includes("biceps") && intensidad > 0.5
                  ? "url(#glow-rojo)"
                  : undefined
              }
            />
            <ellipse cx="0" cy="34" rx="5" ry="6" fill="#d8dee8" />
            {(slug === "jalon-al-pecho" || slug === "press-de-pecho") && (
              <rect x="-16" y="36" width="32" height="5" rx="2" fill="#2a303c" />
            )}
            {(slug === "press-militar" ||
              slug === "press-plano-mancuernas" ||
              slug === "curl-de-biceps") && (
              <circle cx="0" cy="40" r="7" fill="#2a303c" stroke="#8b919c" strokeWidth="1" />
            )}
          </g>
        </g>
      </g>
    </g>
  );
}

function AtletaFrontal({
  t,
  primarios,
}: {
  t: number;
  primarios: MuscleId[];
}) {
  const apertura = lerp(8, 42, t);
  const intensidad = t;
  const fill = primarios.includes("abductores")
    ? rojo(intensidad)
    : "#eef2f7";

  return (
    <g transform="translate(160 35)">
      <rect x="-50" y="185" width="100" height="10" rx="3" fill="#1a1d24" />
      <rect x="-12" y="120" width="24" height="14" rx="4" fill="#1a1d24" />
      <rect x="-8" y="134" width="16" height="50" rx="2" fill="#12151b" />

      <circle cx="0" cy="20" r="16" fill="#f4f7fb" stroke="#c5cedb" strokeWidth="1" />
      <path
        d="M-22 42 C0 32 22 42 L20 115 C0 126 -20 115 Z"
        fill="#f4f7fb"
        stroke="#c5cedb"
        strokeWidth="1"
      />

      <g transform={`rotate(${-apertura} -12 115)`}>
        <ellipse
          cx="-18"
          cy="155"
          rx="14"
          ry="40"
          fill={fill}
          filter={intensidad > 0.5 ? "url(#glow-rojo)" : undefined}
        />
        <ellipse cx="-18" cy="205" rx="10" ry="22" fill="#eef2f7" />
        <rect x="-32" y="118" width="20" height="22" rx="4" fill="#2a303c" />
      </g>
      <g transform={`rotate(${apertura} 12 115)`}>
        <ellipse
          cx="18"
          cy="155"
          rx="14"
          ry="40"
          fill={fill}
          filter={intensidad > 0.5 ? "url(#glow-rojo)" : undefined}
        />
        <ellipse cx="18" cy="205" rx="10" ry="22" fill="#eef2f7" />
        <rect x="12" y="118" width="20" height="22" rx="4" fill="#2a303c" />
      </g>
    </g>
  );
}

export interface TelemetriaViva {
  articulacion: string;
  angulo: string;
  veredicto: string;
  fase: string;
  pausa: string;
  intensidad: number;
  musculoClave: string;
}

export default function AtletaEjercicio({
  maquina,
  animar = true,
  onTelemetria,
  className,
}: {
  maquina: Machine;
  animar?: boolean;
  onTelemetria?: (datos: TelemetriaViva) => void;
  className?: string;
}) {
  const patron = PATRONES[maquina.slug] ?? POR_DEFECTO;
  const [t, setT] = useState(0.65);
  const reducido = useSyncExternalStore(
    suscribirMovimiento,
    movimientoReducido,
    () => false,
  );

  useEffect(() => {
    if (!animar || reducido) {
      const fija = 0.7;
      const marco = requestAnimationFrame(() => {
        setT(fija);
        onTelemetria?.({
          articulacion: patron.etiquetaAngulo,
          angulo: `${patron.anguloDe(fija).toFixed(1)}°`,
          veredicto: maquina.telemetria.veredicto,
          fase: maquina.telemetria.fase,
          pausa: maquina.telemetria.pausa,
          intensidad: fija,
          musculoClave: patron.musculoClave,
        });
      });
      return () => cancelAnimationFrame(marco);
    }

    const periodo = 3200;
    let marco = 0;
    let ultimoAviso = 0;
    const inicio = performance.now();

    const tick = (ahora: number) => {
      const progreso = progresoCiclo(ahora - inicio, periodo);
      setT(progreso);

      if (ahora - ultimoAviso > 80) {
        ultimoAviso = ahora;
        const u = ((ahora - inicio) % periodo) / periodo;
        onTelemetria?.({
          articulacion: patron.etiquetaAngulo,
          angulo: `${patron.anguloDe(progreso).toFixed(1)}°`,
          veredicto:
            progreso > 0.85
              ? maquina.telemetria.veredicto
              : progreso > 0.4
                ? "En rango"
                : "Iniciando",
          fase: faseDe(ahora - inicio, periodo),
          pausa: u >= 0.4 && u < 0.55 ? "Pausa 1.0s" : "En movimiento",
          intensidad: progreso,
          musculoClave: patron.musculoClave,
        });
      }

      marco = requestAnimationFrame(tick);
    };

    marco = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(marco);
  }, [
    animar,
    reducido,
    maquina.slug,
    maquina.telemetria.veredicto,
    maquina.telemetria.fase,
    maquina.telemetria.pausa,
    patron,
    onTelemetria,
  ]);

  return (
    <svg
      viewBox="0 0 320 280"
      className={className}
      role="img"
      aria-label={`Animación de técnica: ${maquina.nombre}`}
    >
      <defs>
        <linearGradient id="fondo-fitonomy" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#1a2744" />
          <stop offset="100%" stopColor="#0a0e18" />
        </linearGradient>
        <filter id="glow-rojo" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="4.5" result="b" />
          <feMerge>
            <feMergeNode in="b" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <radialGradient id="suelo-fit" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.07" />
          <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
        </radialGradient>
      </defs>

      <rect width="320" height="280" fill="url(#fondo-fitonomy)" rx="12" />
      <ellipse cx="160" cy="255" rx="95" ry="10" fill="url(#suelo-fit)" />

      {maquina.slug === "remo-sentado" ? (
        <RemoTresCuartos t={t} primarios={maquina.primarios} />
      ) : patron.vista === "frontal" ? (
        <AtletaFrontal t={t} primarios={maquina.primarios} />
      ) : (
        <AtletaPerfil t={t} slug={maquina.slug} primarios={maquina.primarios} />
      )}
    </svg>
  );
}
