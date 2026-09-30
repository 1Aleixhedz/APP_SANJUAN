"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const ENLACES = [
  {
    href: "/",
    etiqueta: "Máquinas",
    coincide: ["/", "/m", "/admin"],
    icono:
      "M6 6h2v12H6zm10 0h2v12h-2zM9 8h6v2H9zm0 6h6v2H9zM4 10h2v4H4zm14 0h2v4h-2z",
  },
  {
    href: "/registro",
    etiqueta: "Registro",
    coincide: ["/registro"],
    icono:
      "M7 3h10v2H7zm-2 4h14a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V8a1 1 0 0 1 1-1zm2 3v2h10V10zm0 4v2h7v-2z",
  },
  {
    href: "/ranking",
    etiqueta: "Récords",
    coincide: ["/ranking"],
    icono: "M7 21h10v-2H7zm2-4h6l1-7H8zm3-9a2 2 0 1 0 0-4 2 2 0 0 0 0 4z",
  },
  {
    href: "/perfil",
    etiqueta: "Mi Perfil",
    coincide: ["/perfil", "/login"],
    icono:
      "M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zm0 2c-4 0-7 2-7 4v1h14v-1c0-2-3-4-7-4z",
  },
];

export default function BottomNav() {
  const ruta = usePathname();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-borde bg-panel/95 backdrop-blur">
      <div className="mx-auto flex w-full max-w-md items-stretch justify-between px-1 pb-[env(safe-area-inset-bottom)]">
        {ENLACES.map((enlace) => {
          const activo = enlace.coincide.some((prefijo) =>
            prefijo === "/" ? ruta === "/" : ruta.startsWith(prefijo),
          );
          return (
            <Link
              key={enlace.href}
              href={enlace.href}
              className={`flex flex-1 flex-col items-center gap-1 py-2.5 text-[10px] font-bold uppercase tracking-wide transition-colors ${
                activo ? "text-negro" : "text-suave"
              }`}
            >
              <svg
                viewBox="0 0 24 24"
                className={`h-5 w-5 ${activo ? "opacity-100" : "opacity-70"}`}
                fill="currentColor"
              >
                <path d={enlace.icono} />
              </svg>
              {enlace.etiqueta}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
