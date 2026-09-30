import type { BodyView, MuscleId } from "@/lib/types";

type Forma =
  | { tipo: "ellipse"; cx: number; cy: number; rx: number; ry: number; rot?: number }
  | { tipo: "rect"; x: number; y: number; w: number; h: number; r?: number }
  | { tipo: "path"; d: string };

/**
 * Silueta estilizada de 160 × 380, simétrica respecto a x = 80 para reutilizar
 * las mismas coordenadas en la vista de frente y en la de espalda.
 */
const SILUETA: Forma[] = [
  { tipo: "ellipse", cx: 80, cy: 26, rx: 15, ry: 18 },
  { tipo: "rect", x: 71, y: 39, w: 18, h: 14, r: 5 },
  {
    tipo: "path",
    d: "M56 52 Q80 46 104 52 L108 100 Q106 132 99 158 L61 158 Q54 132 52 100 Z",
  },
  { tipo: "path", d: "M60 154 L100 154 L98 186 Q80 198 62 186 Z" },
  { tipo: "ellipse", cx: 50, cy: 62, rx: 13, ry: 15 },
  { tipo: "ellipse", cx: 110, cy: 62, rx: 13, ry: 15 },
  { tipo: "rect", x: 34, y: 68, w: 19, h: 60, r: 9 },
  { tipo: "rect", x: 107, y: 68, w: 19, h: 60, r: 9 },
  { tipo: "ellipse", cx: 43, cy: 128, rx: 9, ry: 9 },
  { tipo: "ellipse", cx: 117, cy: 128, rx: 9, ry: 9 },
  { tipo: "rect", x: 32, y: 126, w: 17, h: 54, r: 8 },
  { tipo: "rect", x: 111, y: 126, w: 17, h: 54, r: 8 },
  { tipo: "ellipse", cx: 40, cy: 189, rx: 8, ry: 11 },
  { tipo: "ellipse", cx: 120, cy: 189, rx: 8, ry: 11 },
  { tipo: "rect", x: 57, y: 180, w: 23, h: 82, r: 11 },
  { tipo: "rect", x: 80, y: 180, w: 23, h: 82, r: 11 },
  { tipo: "ellipse", cx: 68, cy: 264, rx: 10, ry: 9 },
  { tipo: "ellipse", cx: 92, cy: 264, rx: 10, ry: 9 },
  { tipo: "rect", x: 59, y: 262, w: 19, h: 72, r: 9 },
  { tipo: "rect", x: 82, y: 262, w: 19, h: 72, r: 9 },
  { tipo: "ellipse", cx: 67, cy: 342, rx: 9, ry: 10 },
  { tipo: "ellipse", cx: 93, cy: 342, rx: 9, ry: 10 },
];

const FORMAS: Partial<Record<MuscleId, Partial<Record<BodyView, Forma[]>>>> = {
  deltoides: {
    frente: [
      { tipo: "ellipse", cx: 50, cy: 62, rx: 12, ry: 14 },
      { tipo: "ellipse", cx: 110, cy: 62, rx: 12, ry: 14 },
    ],
  },
  deltoidesPosterior: {
    espalda: [
      { tipo: "ellipse", cx: 50, cy: 64, rx: 12, ry: 13 },
      { tipo: "ellipse", cx: 110, cy: 64, rx: 12, ry: 13 },
    ],
  },
  pectoral: {
    frente: [
      { tipo: "ellipse", cx: 69, cy: 79, rx: 13, ry: 10, rot: -10 },
      { tipo: "ellipse", cx: 91, cy: 79, rx: 13, ry: 10, rot: 10 },
    ],
  },
  abdomen: {
    frente: [{ tipo: "rect", x: 69, y: 92, w: 22, h: 54, r: 7 }],
  },
  oblicuos: {
    frente: [
      { tipo: "ellipse", cx: 62, cy: 118, rx: 7, ry: 21 },
      { tipo: "ellipse", cx: 98, cy: 118, rx: 7, ry: 21 },
    ],
  },
  biceps: {
    frente: [
      { tipo: "ellipse", cx: 43, cy: 93, rx: 9, ry: 19 },
      { tipo: "ellipse", cx: 117, cy: 93, rx: 9, ry: 19 },
    ],
  },
  antebrazo: {
    frente: [
      { tipo: "ellipse", cx: 40, cy: 150, rx: 8, ry: 22 },
      { tipo: "ellipse", cx: 120, cy: 150, rx: 8, ry: 22 },
    ],
  },
  triceps: {
    espalda: [
      { tipo: "ellipse", cx: 43, cy: 95, rx: 9, ry: 20 },
      { tipo: "ellipse", cx: 117, cy: 95, rx: 9, ry: 20 },
    ],
  },
  trapecio: {
    espalda: [
      { tipo: "path", d: "M80 46 L98 54 L106 66 L80 76 L54 66 L62 54 Z" },
    ],
  },
  romboides: {
    espalda: [
      { tipo: "path", d: "M80 78 L95 74 L93 100 L80 104 L67 100 L65 74 Z" },
    ],
  },
  dorsal: {
    espalda: [
      { tipo: "path", d: "M78 88 L60 93 Q51 112 62 148 L78 152 Z" },
      { tipo: "path", d: "M82 88 L100 93 Q109 112 98 148 L82 152 Z" },
    ],
  },
  lumbar: {
    espalda: [{ tipo: "rect", x: 69, y: 126, w: 22, h: 30, r: 6 }],
  },
  gluteo: {
    espalda: [
      { tipo: "ellipse", cx: 69, cy: 172, rx: 14, ry: 17 },
      { tipo: "ellipse", cx: 91, cy: 172, rx: 14, ry: 17 },
    ],
  },
  abductores: {
    espalda: [
      { tipo: "ellipse", cx: 59, cy: 192, rx: 7, ry: 15 },
      { tipo: "ellipse", cx: 101, cy: 192, rx: 7, ry: 15 },
    ],
  },
  cuadriceps: {
    frente: [
      { tipo: "ellipse", cx: 68, cy: 216, rx: 11, ry: 36 },
      { tipo: "ellipse", cx: 92, cy: 216, rx: 11, ry: 36 },
    ],
  },
  aductores: {
    frente: [
      { tipo: "ellipse", cx: 76, cy: 208, rx: 5, ry: 26 },
      { tipo: "ellipse", cx: 84, cy: 208, rx: 5, ry: 26 },
    ],
  },
  isquios: {
    espalda: [
      { tipo: "ellipse", cx: 68, cy: 218, rx: 11, ry: 34 },
      { tipo: "ellipse", cx: 92, cy: 218, rx: 11, ry: 34 },
    ],
  },
  gemelos: {
    espalda: [
      { tipo: "ellipse", cx: 68, cy: 290, rx: 9, ry: 25 },
      { tipo: "ellipse", cx: 92, cy: 290, rx: 9, ry: 25 },
    ],
  },
};

function dibujar(forma: Forma, key: string, props: Record<string, unknown>) {
  if (forma.tipo === "ellipse") {
    return (
      <ellipse
        key={key}
        cx={forma.cx}
        cy={forma.cy}
        rx={forma.rx}
        ry={forma.ry}
        transform={
          forma.rot ? `rotate(${forma.rot} ${forma.cx} ${forma.cy})` : undefined
        }
        {...props}
      />
    );
  }
  if (forma.tipo === "rect") {
    return (
      <rect
        key={key}
        x={forma.x}
        y={forma.y}
        width={forma.w}
        height={forma.h}
        rx={forma.r ?? 6}
        {...props}
      />
    );
  }
  return <path key={key} d={forma.d} {...props} />;
}

function Cuerpo({
  vista,
  primarios,
  secundarios,
  animar,
}: {
  vista: BodyView;
  primarios: MuscleId[];
  secundarios: MuscleId[];
  animar: boolean;
}) {
  return (
    <g>
      {SILUETA.map((forma, i) =>
        dibujar(forma, `base-${vista}-${i}`, {
          fill: "#1b1e25",
          stroke: "#2c313b",
          strokeWidth: 1.2,
        }),
      )}

      {(Object.keys(FORMAS) as MuscleId[]).map((musculo) => {
        const formas = FORMAS[musculo]?.[vista];
        if (!formas) return null;
        const esPrimario = primarios.includes(musculo);
        const esSecundario = secundarios.includes(musculo);
        const fill = esPrimario
          ? "#ff3b5c"
          : esSecundario
            ? "#d97706"
            : "#282d36";
        return (
          <g
            key={`${vista}-${musculo}`}
            opacity={esPrimario ? 1 : esSecundario ? 0.85 : 0.6}
            filter={esPrimario ? "url(#brillo-musculo)" : undefined}
            className={esPrimario && animar ? "animate-musculo" : undefined}
          >
            {formas.map((forma, i) =>
              dibujar(forma, `${vista}-${musculo}-${i}`, {
                fill,
                stroke: esPrimario ? "#ffb3c0" : "#333945",
                strokeWidth: esPrimario ? 1 : 0.8,
              }),
            )}
          </g>
        );
      })}
    </g>
  );
}

export default function MuscleMap({
  primarios,
  secundarios = [],
  vista = "ambas",
  animar = true,
  etiquetas = true,
  className,
}: {
  primarios: MuscleId[];
  secundarios?: MuscleId[];
  vista?: BodyView | "ambas";
  animar?: boolean;
  etiquetas?: boolean;
  className?: string;
}) {
  const vistas: BodyView[] = vista === "ambas" ? ["frente", "espalda"] : [vista];
  const ancho = vistas.length === 2 ? 340 : 160;

  return (
    <svg
      viewBox={`0 0 ${ancho} ${etiquetas ? 400 : 390}`}
      className={className}
      role="img"
      aria-label="Mapa de músculos implicados"
    >
      <defs>
        <filter id="brillo-musculo" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="3.4" result="difuso" />
          <feMerge>
            <feMergeNode in="difuso" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {vistas.map((v, indice) => (
        <g key={v} transform={`translate(${indice * 180} 8)`}>
          <Cuerpo
            vista={v}
            primarios={primarios}
            secundarios={secundarios}
            animar={animar}
          />
          {etiquetas && (
            <text
              x="80"
              y="388"
              textAnchor="middle"
              fill="#8b9098"
              fontSize="12"
              fontWeight="700"
              letterSpacing="1.6"
            >
              {v === "frente" ? "FRENTE" : "ESPALDA"}
            </text>
          )}
        </g>
      ))}
    </svg>
  );
}
