import { getMiembro } from "@/lib/data";

const TAMANOS = {
  xs: "h-7 w-7 text-[10px]",
  sm: "h-9 w-9 text-[11px]",
  md: "h-11 w-11 text-sm",
  lg: "h-14 w-14 text-base",
  xl: "h-20 w-20 text-2xl",
};

const ANILLOS = {
  oro: "ring-2 ring-oro",
  plata: "ring-2 ring-[#cbd5e1]",
  bronce: "ring-2 ring-[#c2703c]",
  carmesi: "ring-2 ring-carmesi",
  borde: "ring-1 ring-borde",
};

export default function Avatar({
  memberId,
  tamano = "md",
  anillo,
  forma = "circulo",
}: {
  memberId: string;
  tamano?: keyof typeof TAMANOS;
  anillo?: keyof typeof ANILLOS;
  /** En el perfil del diseño nuevo el avatar es cuadrado redondeado. */
  forma?: "circulo" | "cuadrado";
}) {
  const miembro = getMiembro(memberId);
  const iniciales = (miembro?.nombre ?? "?")
    .split(" ")
    .map((parte) => parte[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <span
      className={`${TAMANOS[tamano]} ${anillo ? ANILLOS[anillo] : ""} flex shrink-0 items-center justify-center font-bold text-white ${
        forma === "cuadrado" ? "rounded-2xl" : "rounded-full"
      }`}
      style={{ backgroundColor: miembro?.avatarColor ?? "#4b5563" }}
    >
      {iniciales}
    </span>
  );
}
