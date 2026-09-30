"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const ENLACES = [
  {
    href: "/admin",
    etiqueta: "Sala",
    coincide: ["/admin"],
    exacto: true,
    icono: "M6 6h2v12H6zm10 0h2v12h-2zM9 8h6v2H9zm0 6h6v2H9z",
  },
  {
    href: "/admin/qr",
    etiqueta: "QRs",
    coincide: ["/admin/qr"],
    exacto: false,
    icono:
      "M3 3h8v8H3zm2 2v4h4V5zm8-2h8v8h-8zm2 2v4h4V5zM3 13h8v8H3zm2 2v4h4v-4zm10 0h2v2h-2zm4 0h2v2h-2zm-4 4h2v2h-2zm4 0h2v4h-4v-2h2z",
  },
  {
    href: "/admin/socios",
    etiqueta: "Socios",
    coincide: ["/admin/socios"],
    exacto: false,
    icono:
      "M9 11a3 3 0 100-6 3 3 0 000 6zm6 0a3 3 0 100-6 3 3 0 000 6zM3 19c0-2.5 2.5-4 6-4s6 1.5 6 4v1H3zm12 0c0-1 .3-1.8.9-2.5 1.5.7 3.1 1.2 4.1 1.5V20h-5z",
  },
  {
    href: "/perfil",
    etiqueta: "Mi Perfil",
    coincide: ["/perfil"],
    exacto: false,
    icono:
      "M12 2l2 5 5 .5-3.8 3.4.9 5.1L12 13.5 7.9 16l.9-5.1L5 7.5 10 7z",
  },
];

export default function AdminNav() {
  const ruta = usePathname();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-borde bg-panel/95 backdrop-blur print:hidden">
      <div className="mx-auto flex w-full max-w-md items-stretch justify-between px-1 pb-[env(safe-area-inset-bottom)]">
        {ENLACES.map((enlace) => {
          const activo = enlace.exacto
            ? ruta === enlace.href
            : enlace.coincide.some((p) => ruta === p || ruta.startsWith(`${p}/`));
          return (
            <Link
              key={enlace.href}
              href={enlace.href}
              className={`flex flex-1 flex-col items-center gap-1 py-2.5 text-[10px] font-bold uppercase tracking-wide ${
                activo ? "text-negro" : "text-suave"
              }`}
            >
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor">
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
