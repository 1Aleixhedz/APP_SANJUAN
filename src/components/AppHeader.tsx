"use client";

import Link from "next/link";
import { useStore } from "@/lib/store";
import { GIMNASIO } from "@/lib/machines";
import Avatar from "@/components/Avatar";

export default function AppHeader({
  titulo,
  atras,
}: {
  titulo?: string;
  /** Si se pasa, muestra flecha atrás en lugar del logo. */
  atras?: string;
}) {
  const { usuario } = useStore();

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between gap-3 bg-fondo/95 px-4 py-3 backdrop-blur">
      {atras ? (
        <div className="flex min-w-0 flex-1 items-center gap-2">
          <Link
            href={atras}
            aria-label="Volver"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-panel text-texto active:scale-95"
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2.2">
              <path d="M15 6 9 12l6 6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </Link>
          {titulo && (
            <span className="truncate text-base font-bold">{titulo}</span>
          )}
        </div>
      ) : (
        <Link href="/" className="flex min-w-0 items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-negro text-white">
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor">
              <path d="M3 9h2.2v6H3zM18.8 9H21v6h-2.2zM6 7h2.6v10H6zM15.4 7H18v10h-2.6zM9.4 10.6h5.2v2.8H9.4z" />
            </svg>
          </span>
          <span className="truncate text-sm font-extrabold tracking-wide uppercase">
            {GIMNASIO.corto}
          </span>
        </Link>
      )}

      <div className="flex shrink-0 items-center gap-2">
        <Link
          href="/"
          aria-label="Escanear QR"
          className="flex h-10 w-10 items-center justify-center rounded-full bg-panel text-texto active:scale-95"
        >
          <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor">
            <path d="M3 3h7v7H3zm2 2v3h3V5zM14 3h7v7h-7zm2 2v3h3V5zM3 14h7v7H3zm2 2v3h3v-3zM14 14h2.5v2.5H14zM18.5 14H21v2.5h-2.5zM16.25 16.25h2.5v2.5h-2.5zM14 18.5h2.5V21H14zM18.5 18.5H21V21h-2.5z" />
          </svg>
        </Link>
        <Link
          href={usuario ? "/perfil" : "/login"}
          aria-label="Mi perfil"
          className="active:scale-95"
        >
          {usuario ? (
            <Avatar memberId={usuario.id} tamano="sm" anillo="borde" />
          ) : (
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-negro text-[11px] font-bold text-white">
              ?
            </span>
          )}
        </Link>
      </div>
    </header>
  );
}
