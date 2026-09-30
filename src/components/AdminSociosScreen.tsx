"use client";

import Link from "next/link";
import AppHeader from "@/components/AppHeader";
import Avatar from "@/components/Avatar";
import Cargando from "@/components/Cargando";
import { useStore } from "@/lib/store";

export default function AdminSociosScreen() {
  const { miembros, montado, entradas } = useStore();

  if (!montado) return <Cargando filas={5} />;

  const reales = miembros.filter((m) => !m.id.startsWith("a0000000"));
  const lista = reales.length > 0 ? reales : miembros;

  return (
    <>
      <AppHeader atras="/admin" titulo="Socios" />
      <div className="flex flex-col gap-3 px-4 pb-6 pt-2">
        <p className="text-sm text-suave">
          {lista.length} perfiles en la base
          {reales.length === 0 ? " (incluye demo si está cargada)" : ""}.
        </p>
        <ul className="tarjeta divide-y divide-borde overflow-hidden">
          {lista.map((m) => {
            const series = entradas.filter((e) => e.memberId === m.id).length;
            return (
              <li key={m.id} className="flex items-center gap-3 px-3 py-3">
                <Avatar memberId={m.id} tamano="sm" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-bold">{m.nombre}</p>
                  <p className="text-[11px] text-suave">
                    #{m.socio}
                    {m.rol === "admin" ? " · Admin" : ""} · {series} series
                  </p>
                </div>
              </li>
            );
          })}
        </ul>
        <Link href="/admin" className="text-center text-sm font-bold text-suave">
          ← Volver al panel
        </Link>
      </div>
    </>
  );
}
