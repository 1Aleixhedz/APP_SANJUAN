import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-3 px-6 text-center">
      <span className="flex h-16 w-16 items-center justify-center rounded-2xl border border-borde bg-panel text-2xl">
        🔳
      </span>
      <h1 className="text-lg font-bold">Esta bahía no está en la app</h1>
      <p className="text-sm text-suave">
        Puede que el QR sea de una máquina que ya se ha retirado de la sala.
        Búscala en el listado.
      </p>
      <Link
        href="/"
        className="boton-carmesi mt-2 rounded-xl px-5 py-3 text-xs font-bold uppercase tracking-wide text-white"
      >
        Ver todas las bahías
      </Link>
    </div>
  );
}
