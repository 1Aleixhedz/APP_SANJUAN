"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import MachineScreen from "@/components/MachineScreen";
import { fetchMaquinaPorSlug } from "@/lib/catalogo";
import type { Machine } from "@/lib/types";

export default function MachinePageClient({
  slug,
  inicial,
}: {
  slug: string;
  inicial?: Machine;
}) {
  const [maquina, setMaquina] = useState<Machine | undefined>(inicial);
  const [listo, setListo] = useState(Boolean(inicial));

  useEffect(() => {
    let cancel = false;
    void fetchMaquinaPorSlug(slug).then((m) => {
      if (!cancel) {
        setMaquina(m ?? inicial);
        setListo(true);
      }
    });
    return () => {
      cancel = true;
    };
  }, [slug, inicial]);

  if (!listo) {
    return (
      <p className="p-8 text-center text-sm text-suave">Cargando máquina…</p>
    );
  }

  if (!maquina) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-3 px-6 text-center">
        <p className="text-lg font-extrabold">Máquina no encontrada</p>
        <Link href="/" className="text-sm font-bold text-suave">
          Volver a la sala
        </Link>
      </div>
    );
  }

  return <MachineScreen maquina={maquina} />;
}
