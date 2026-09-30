"use client";

import { QRCodeSVG } from "qrcode.react";
import { useCallback, useEffect, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import AppHeader from "@/components/AppHeader";
import MaquinaFoto from "@/components/MaquinaFoto";
import {
  crearMaquinaNube,
  fetchCatalogo,
  sincronizarSeed,
} from "@/lib/catalogo";
import { GIMNASIO } from "@/lib/machines";
import { useStore } from "@/lib/store";
import type { Machine } from "@/lib/types";

const GRUPOS = ["Espalda", "Pecho", "Piernas", "Brazos", "Hombros"] as const;
const sinCambios = () => () => {};

export default function AdminScreen() {
  const { usuario, miembros, montado } = useStore();
  const [formAbierto, setFormAbierto] = useState(true);
  const [nombre, setNombre] = useState("");
  const [bahia, setBahia] = useState("");
  const [sector, setSector] = useState<(typeof GRUPOS)[number]>("Espalda");
  const [fotoFile, setFotoFile] = useState<File | null>(null);
  const [fotoPreview, setFotoPreview] = useState<string | undefined>();
  const [fotoNombre, setFotoNombre] = useState<string | null>(null);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoNombre, setVideoNombre] = useState<string | null>(null);
  const [generarQr, setGenerarQr] = useState(true);
  const [busqueda, setBusqueda] = useState("");
  const [qrMaquina, setQrMaquina] = useState<Machine | null>(null);
  const [mensaje, setMensaje] = useState<string | null>(null);
  const [catalogo, setCatalogo] = useState<Machine[]>([]);
  const [cargandoCat, setCargandoCat] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [syncing, setSyncing] = useState(false);

  const origenEnv =
    process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") ?? "";
  const origen = useSyncExternalStore(
    sinCambios,
    () => window.location.origin,
    () => origenEnv,
  );
  const base = origenEnv || origen;

  const recargar = useCallback(async () => {
    setCargandoCat(true);
    const lista = await fetchCatalogo();
    setCatalogo(lista);
    setCargandoCat(false);
  }, []);

  useEffect(() => {
    void recargar();
  }, [recargar]);

  const visibles = catalogo.filter((m) => {
    const t = busqueda.trim().toLowerCase();
    if (!t) return true;
    return (
      m.nombre.toLowerCase().includes(t) ||
      m.bahia.includes(t) ||
      m.sector.toLowerCase().includes(t)
    );
  });

  const sociosHoy = miembros.filter((m) => !m.id.startsWith("a0000000")).length;

  function onFoto(file: File | null) {
    if (!file) return;
    setFotoFile(file);
    setFotoNombre(file.name);
    setFotoPreview(URL.createObjectURL(file));
  }

  function onVideo(file: File | null) {
    if (!file) return;
    setVideoFile(file);
    setVideoNombre(file.name);
  }

  async function guardar() {
    if (!nombre.trim() || !bahia.trim()) {
      setMensaje("Nombre y número de estación son obligatorios.");
      return;
    }
    setGuardando(true);
    setMensaje("Subiendo a la nube…");
    try {
      const creada = await crearMaquinaNube({
        nombre,
        bahia,
        sector,
        foto: fotoFile,
        video: videoFile,
        generarQr,
      });
      setMensaje(`Máquina «${creada.nombre}» activada en Supabase.`);
      setNombre("");
      setBahia("");
      setFotoFile(null);
      setFotoPreview(undefined);
      setFotoNombre(null);
      setVideoFile(null);
      setVideoNombre(null);
      await recargar();
      if (generarQr) setQrMaquina(creada);
    } catch (e) {
      setMensaje(
        e instanceof Error
          ? e.message
          : "Error al guardar. ¿Ejecutaste supabase/maquinas.sql?",
      );
    } finally {
      setGuardando(false);
    }
  }

  async function syncSeed() {
    setSyncing(true);
    setMensaje("Sincronizando catálogo base…");
    try {
      const r = await sincronizarSeed();
      setMensaje(
        r.error && r.ok === 0
          ? `Error: ${r.error}`
          : `Catálogo base sincronizado (${r.ok} máquinas).`,
      );
      await recargar();
    } catch (e) {
      setMensaje(e instanceof Error ? e.message : "Error al sincronizar");
    } finally {
      setSyncing(false);
    }
  }

  if (!montado) {
    return <p className="p-6 text-sm text-suave">Cargando panel…</p>;
  }

  return (
    <>
      <AppHeader atras="/" titulo="Panel admin" />

      <div className="flex flex-col gap-4 px-4 pb-8 pt-1 print:hidden">
        <section className="tarjeta-suave p-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="rounded-full bg-negro px-3 py-1 text-[10px] font-bold uppercase tracking-wide text-white">
              ◆ Dueño · {GIMNASIO.nombre}
            </span>
            <span className="rounded-full bg-panel px-3 py-1 text-[10px] font-bold text-jade">
              · En línea
            </span>
          </div>
          <div className="mt-4 flex items-center gap-3">
            <span className="flex h-14 w-14 items-center justify-center rounded-full bg-negro text-lg font-extrabold text-white">
              {(usuario?.alias ?? "AD")
                .split(" ")
                .map((p) => p[0])
                .join("")
                .slice(0, 2)
                .toUpperCase()}
            </span>
            <div>
              <p className="text-lg font-extrabold">
                {usuario?.nombre ?? "Administrador"}
              </p>
              <p className="text-sm text-suave">
                Gerente · Panel de control operativo
              </p>
            </div>
          </div>
          <div className="mt-4 grid grid-cols-3 gap-2">
            <div className="rounded-2xl bg-panel px-2 py-3 text-center">
              <p className="text-2xl font-extrabold">{catalogo.length}</p>
              <p className="text-[10px] font-semibold text-suave">En sala</p>
            </div>
            <div className="rounded-2xl bg-panel px-2 py-3 text-center">
              <p className="text-2xl font-extrabold">{catalogo.length}</p>
              <p className="text-[10px] font-semibold text-suave">QR activos</p>
            </div>
            <div className="rounded-2xl bg-panel px-2 py-3 text-center">
              <p className="text-2xl font-extrabold">{sociosHoy || "—"}</p>
              <p className="text-[10px] font-semibold text-suave">Socios</p>
            </div>
          </div>
        </section>

        <button
          type="button"
          onClick={() => setFormAbierto((v) => !v)}
          className="boton-negro flex w-full items-center justify-center gap-2 rounded-[22px] py-3.5 text-sm font-bold"
        >
          {formAbierto ? "−" : "+"} Añadir nueva máquina a la sala
        </button>

        {formAbierto && (
          <section className="tarjeta p-4 shadow-sm">
            <p className="etiqueta text-suave">Formulario de registro</p>
            <h2 className="mt-1 text-lg font-extrabold">Añadir nueva máquina</h2>
            <p className="mt-1 text-xs leading-relaxed text-suave">
              Sube foto (y vídeo si puedes) para que los socios la reconozcan al
              instante.
            </p>

            <label className="mt-4 block">
              <span className="etiqueta text-suave">
                Nombre de la máquina · Requerido
              </span>
              <input
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                placeholder="Remo en Polea Baja Pro"
                className="mt-1.5 w-full rounded-2xl border border-borde bg-fondo px-4 py-3.5 text-sm outline-none focus:border-negro"
              />
            </label>

            <label className="mt-3 block">
              <span className="etiqueta text-suave">
                Número o identificador · Etiqueta de sala
              </span>
              <input
                value={bahia}
                onChange={(e) => setBahia(e.target.value)}
                placeholder="M-15"
                className="mt-1.5 w-full rounded-2xl border border-borde bg-fondo px-4 py-3.5 text-sm outline-none focus:border-negro"
              />
            </label>

            <div className="mt-3">
              <p className="etiqueta text-suave">Grupo muscular principal</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {GRUPOS.map((g) => (
                  <button
                    key={g}
                    type="button"
                    onClick={() => setSector(g)}
                    className={`rounded-full px-3.5 py-2 text-xs font-bold ${
                      sector === g ? "bg-negro text-white" : "bg-lavanda text-texto"
                    }`}
                  >
                    {g}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-4">
              <p className="etiqueta text-suave">Fotografía de la máquina</p>
              <div className="mt-2 flex items-center gap-3 rounded-2xl bg-lavanda p-3">
                <div className="h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-panel">
                  {fotoPreview ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={fotoPreview} alt="" className="h-full w-full object-contain" />
                  ) : (
                    <span className="flex h-full items-center justify-center text-xs text-suave">
                      Foto
                    </span>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-semibold">
                    {fotoNombre ?? "Sin foto todavía"}
                  </p>
                  <label className="mt-1 inline-block cursor-pointer text-xs font-bold text-negro underline">
                    {fotoPreview ? "Cambiar foto" : "Subir foto"}
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => onFoto(e.target.files?.[0] ?? null)}
                    />
                  </label>
                </div>
              </div>
            </div>

            <div className="mt-3">
              <p className="etiqueta text-suave">Vídeo demostrativo de técnica</p>
              <div className="mt-2 flex items-center gap-3 rounded-2xl bg-lavanda p-3">
                <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-panel text-lg">
                  ▶
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-semibold">
                    {videoNombre ?? "Opcional · MP4 corto"}
                  </p>
                  <label className="mt-1 inline-block cursor-pointer text-xs font-bold text-negro underline">
                    {videoNombre ? "Cambiar vídeo" : "Subir vídeo"}
                    <input
                      type="file"
                      accept="video/mp4,video/*"
                      className="hidden"
                      onChange={(e) => onVideo(e.target.files?.[0] ?? null)}
                    />
                  </label>
                </div>
                {videoNombre && (
                  <span className="etiqueta rounded-full bg-jade/15 px-2 py-1 text-jade">
                    Listo
                  </span>
                )}
              </div>
            </div>

            <div className="mt-4 flex items-center justify-between gap-3 rounded-2xl border border-borde px-4 py-3">
              <div>
                <p className="text-sm font-bold">Generación de QR inmediata</p>
                <p className="text-[11px] text-suave">
                  Listo para imprimir y pegar en el chasis
                </p>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={generarQr}
                onClick={() => setGenerarQr((v) => !v)}
                className={`relative h-8 w-14 rounded-full transition-colors ${
                  generarQr ? "bg-negro" : "bg-lavanda"
                }`}
              >
                <span
                  className={`absolute top-1 h-6 w-6 rounded-full bg-white transition-transform ${
                    generarQr ? "left-7" : "left-1"
                  }`}
                />
              </button>
            </div>

            {mensaje && (
              <p className="mt-3 text-center text-xs font-semibold text-suave">
                {mensaje}
              </p>
            )}

            <button
              type="button"
              onClick={() => void guardar()}
              disabled={guardando}
              className="boton-negro mt-4 flex w-full items-center justify-center gap-2 rounded-[22px] py-4 text-sm font-extrabold uppercase tracking-wide disabled:opacity-50"
            >
              {guardando ? "Guardando…" : "Guardar y activar máquina"}
            </button>
          </section>
        )}

        <button
          type="button"
          onClick={() => void syncSeed()}
          disabled={syncing}
          className="w-full rounded-2xl border border-borde bg-panel py-3 text-xs font-bold disabled:opacity-50"
        >
          {syncing
            ? "Sincronizando…"
            : "Sincronizar catálogo base → Supabase"}
        </button>

        <section>
          <div className="mb-2 flex items-end justify-between gap-2">
            <div>
              <h2 className="text-lg font-extrabold">Máquinas en sala</h2>
              <p className="text-xs text-suave">
                {cargandoCat
                  ? "Cargando…"
                  : `${catalogo.length} unidades en la nube`}
              </p>
            </div>
            <div className="flex gap-2">
              <input
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                placeholder="Buscar…"
                className="w-28 rounded-full bg-lavanda px-3 py-2 text-xs outline-none"
              />
              <Link
                href="/admin/qr"
                className="flex h-9 w-9 items-center justify-center rounded-full bg-lavanda text-sm"
                aria-label="Imprimir todos"
              >
                ⎙
              </Link>
            </div>
          </div>

          <ul className="flex flex-col gap-3">
            {visibles.map((m) => (
              <li key={m.id} className="tarjeta p-3">
                <div className="flex gap-3">
                  <div className="h-16 w-16 shrink-0 overflow-hidden rounded-xl">
                    <MaquinaFoto
                      bahia={m.bahia}
                      nombre={m.nombre}
                      imagen={m.imagen}
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-extrabold">{m.nombre}</p>
                    <p className="text-[11px] font-semibold uppercase text-suave">
                      M-{m.bahia} · {m.sector}
                    </p>
                    <span className="mt-1 inline-block rounded-full bg-jade/15 px-2 py-0.5 text-[9px] font-bold uppercase text-jade">
                      QR activo
                    </span>
                  </div>
                </div>
                <div className="mt-3 flex gap-2">
                  <Link
                    href={`/m/${m.slug}`}
                    className="flex-1 rounded-2xl bg-lavanda py-2.5 text-center text-xs font-bold"
                  >
                    Editar
                  </Link>
                  <button
                    type="button"
                    onClick={() => setQrMaquina(m)}
                    className="flex-1 rounded-2xl bg-lavanda py-2.5 text-xs font-bold"
                  >
                    Ver QR
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setQrMaquina(m);
                      window.setTimeout(() => window.print(), 300);
                    }}
                    className="boton-negro flex flex-1 items-center justify-center gap-1 rounded-2xl py-2.5 text-xs font-bold"
                  >
                    Imprimir
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </section>

        <div className="tarjeta-suave flex items-center justify-between gap-3 p-4">
          <p className="text-sm font-semibold leading-snug">
            Catálogo sincronizado en Supabase.
            <span className="block text-xs font-normal text-suave">
              Fotos y vídeos en Storage · QR → {base || "tu dominio"}/m/…
            </span>
          </p>
          <span className="shrink-0 text-sm font-extrabold text-jade">100% OK</span>
        </div>
      </div>

      {qrMaquina && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-negro/40 p-4 print:static print:bg-transparent print:p-0">
          <div className="w-full max-w-sm rounded-[24px] bg-panel p-5 print:shadow-none">
            <div className="print:hidden mb-3 flex items-center justify-between">
              <p className="font-extrabold">QR · {qrMaquina.nombre}</p>
              <button
                type="button"
                onClick={() => setQrMaquina(null)}
                className="text-sm font-bold text-suave"
              >
                Cerrar
              </button>
            </div>
            <div className="flex flex-col items-center gap-3 rounded-2xl bg-white p-4">
              <QRCodeSVG
                value={`${base}/m/${qrMaquina.slug}`}
                size={200}
                level="M"
                includeMargin
              />
              <p className="text-center text-sm font-bold">
                M-{qrMaquina.bahia} · {qrMaquina.nombre}
              </p>
              <p className="break-all text-center font-mono text-[10px] text-suave">
                {base}/m/{qrMaquina.slug}
              </p>
            </div>
            <button
              type="button"
              onClick={() => window.print()}
              className="boton-negro print:hidden mt-4 w-full rounded-2xl py-3 text-sm font-bold"
            >
              Imprimir adhesivo
            </button>
          </div>
        </div>
      )}
    </>
  );
}
