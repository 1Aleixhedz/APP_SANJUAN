import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import AppChrome from "@/components/AppChrome";
import RegistrarSW from "@/components/RegistrarSW";
import { GIMNASIO } from "@/lib/machines";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: `${GIMNASIO.nombre} · Récords y máquinas`,
  description:
    "Escanea el QR de la máquina, revisa la técnica y el reclutamiento muscular, registra tus series y compite por los récords de sala.",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: GIMNASIO.corto,
  },
};

export const viewport: Viewport = {
  themeColor: "#f6f5fb",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="es"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-fondo text-texto">
        <div className="mx-auto flex min-h-dvh w-full max-w-md flex-col pb-20">
          {children}
        </div>
        <AppChrome />
        <RegistrarSW />
      </body>
    </html>
  );
}
