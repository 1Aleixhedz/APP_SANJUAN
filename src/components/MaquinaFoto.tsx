import Image from "next/image";

/** Foto real de máquina o placeholder. */
export default function MaquinaFoto({
  bahia,
  nombre,
  imagen,
  grande,
  className = "",
}: {
  bahia: string;
  nombre: string;
  imagen?: string;
  grande?: boolean;
  className?: string;
}) {
  const alto = grande ? "min-h-[200px]" : "min-h-[140px]";
  const esData = Boolean(imagen?.startsWith("data:") || imagen?.startsWith("blob:"));

  if (imagen) {
    return (
      <div
        className={`relative flex w-full items-center justify-center overflow-hidden rounded-2xl bg-white ${alto} ${className}`}
      >
        {esData ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={imagen}
            alt={nombre}
            className="h-auto max-h-[220px] w-full object-contain p-2"
          />
        ) : (
          <Image
            src={imagen}
            alt={nombre}
            width={grande ? 640 : 480}
            height={grande ? 480 : 360}
            className="h-auto max-h-[220px] w-full object-contain p-2"
            sizes="(max-width: 448px) 100vw, 400px"
            priority={Boolean(grande)}
          />
        )}
      </div>
    );
  }

  return (
    <div
      className={`relative flex w-full flex-col items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-b from-white to-lavanda ${alto} py-6 ${className}`}
    >
      <svg
        viewBox="0 0 120 90"
        className={grande ? "h-28 w-36 text-negro/80" : "h-20 w-28 text-negro/70"}
        fill="currentColor"
        aria-hidden
      >
        <rect x="8" y="70" width="104" height="8" rx="2" opacity="0.25" />
        <rect x="48" y="20" width="10" height="50" rx="2" />
        <rect x="40" y="12" width="26" height="12" rx="3" />
        <rect x="20" y="38" width="36" height="8" rx="2" />
        <circle cx="22" cy="42" r="8" opacity="0.35" />
        <rect x="70" y="45" width="28" height="18" rx="3" />
      </svg>
      <p className="mt-2 text-center text-[11px] font-semibold text-suave">
        #{bahia} · {nombre}
      </p>
    </div>
  );
}
