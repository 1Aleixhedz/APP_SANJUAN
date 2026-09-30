import type { MetadataRoute } from "next";
import { GIMNASIO } from "@/lib/machines";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: `${GIMNASIO.nombre} · Récords`,
    short_name: "San Juan",
    description:
      "Técnica de cada máquina, registro de series y rankings del gimnasio.",
    start_url: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#f6f5fb",
    theme_color: "#f6f5fb",
    lang: "es",
    icons: [
      {
        src: "/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: "/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
    ],
  };
}
