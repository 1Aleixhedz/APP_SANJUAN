"use client";

import { useEffect, useState } from "react";

function formatear(segundos: number): string {
  const minutos = Math.floor(segundos / 60);
  const resto = segundos % 60;
  return `${String(minutos).padStart(2, "0")}:${String(resto).padStart(2, "0")}`;
}

export default function Cronometro({
  desde,
  onReiniciar,
}: {
  desde: number | null;
  onReiniciar?: () => void;
}) {
  const [ahora, setAhora] = useState<number | null>(null);

  useEffect(() => {
    if (desde === null) return;
    const tic = () => setAhora(Date.now());
    tic();
    const intervalo = window.setInterval(tic, 1000);
    return () => window.clearInterval(intervalo);
  }, [desde]);

  const segundos =
    desde === null || ahora === null
      ? null
      : Math.max(0, Math.floor((ahora - desde) / 1000));

  return (
    <button
      type="button"
      onClick={onReiniciar}
      aria-label="Reiniciar cronómetro de descanso"
      className="flex shrink-0 flex-col items-end rounded-xl border border-carmesi/25 bg-carmesi/10 px-3 py-1.5 active:scale-95"
    >
      <span className="etiqueta text-suave">Descanso</span>
      <span className="flex items-center gap-1.5 font-mono text-lg font-bold leading-tight text-carmesi">
        <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="currentColor">
          <path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zm1 5v5.3l4 2.3-1 1.7-5-2.9V7z" />
        </svg>
        {segundos === null ? "00:00" : formatear(segundos)}
      </span>
    </button>
  );
}
