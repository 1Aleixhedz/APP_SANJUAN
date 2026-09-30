import { ImageResponse } from "next/og";

/**
 * Icono de la app dibujado con cajas de color: una mancuerna roja sobre fondo
 * oscuro. No usa texto para no depender de ninguna fuente.
 */
export function iconoApp(tamano: number) {
  const u = tamano / 100;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#0b0d12",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: u * 2,
          }}
        >
          <div
            style={{
              width: u * 11,
              height: u * 40,
              borderRadius: u * 4,
              background: "#ef4444",
            }}
          />
          <div
            style={{
              width: u * 7,
              height: u * 26,
              borderRadius: u * 3,
              background: "#b91c1c",
            }}
          />
          <div
            style={{
              width: u * 16,
              height: u * 9,
              background: "#ef4444",
            }}
          />
          <div
            style={{
              width: u * 7,
              height: u * 26,
              borderRadius: u * 3,
              background: "#b91c1c",
            }}
          />
          <div
            style={{
              width: u * 11,
              height: u * 40,
              borderRadius: u * 4,
              background: "#ef4444",
            }}
          />
        </div>
      </div>
    ),
    { width: tamano, height: tamano },
  );
}
