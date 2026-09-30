"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { GIMNASIO } from "@/lib/machines";
import { createClient } from "@/lib/supabase/client";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next") ?? "/perfil";
  const errorAuth = searchParams.get("error");

  const [email, setEmail] = useState("");
  const [enviado, setEnviado] = useState(false);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState<string | null>(
    errorAuth ? "No se pudo completar el acceso. Prueba otra vez." : null,
  );

  const emailValido = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());

  async function enviarEnlace() {
    if (!emailValido || cargando) return;
    if (
      !process.env.NEXT_PUBLIC_SUPABASE_URL ||
      !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    ) {
      setError("Falta configurar Supabase. Copia .env.local.example → .env.local (SETUP.md).");
      return;
    }
    setCargando(true);
    setError(null);

    const base =
      process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") ||
      window.location.origin;
    const redirectTo = `${base}/auth/callback?next=${encodeURIComponent(next)}`;

    try {
      const supabase = createClient();
      const { error: err } = await supabase.auth.signInWithOtp({
        email: email.trim(),
        options: { emailRedirectTo: redirectTo },
      });
      if (err) {
        setError(err.message);
        setCargando(false);
        return;
      }
      setEnviado(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error al enviar el enlace");
    } finally {
      setCargando(false);
    }
  }

  if (enviado) {
    return (
      <div className="flex flex-1 flex-col justify-center gap-4 px-6 text-center">
        <h1 className="text-xl font-bold">Mira tu correo</h1>
        <p className="text-sm text-suave">
          Te hemos enviado un enlace a{" "}
          <span className="font-semibold text-texto">{email}</span>. Al abrirlo
          entras directamente, sin contraseña.
        </p>
        <p className="text-[11px] text-suave/70">
          Si no lo ves, revisa spam. El enlace caduca en unos minutos.
        </p>
        <button
          type="button"
          onClick={() => setEnviado(false)}
          className="text-xs text-suave underline"
        >
          Usar otro email
        </button>
        <button
          type="button"
          onClick={() => router.push("/")}
          className="text-xs text-suave underline"
        >
          Volver a la sala
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col justify-center gap-5 px-6">
      <div>
        <p className="etiqueta text-carmesi">{GIMNASIO.nombre}</p>
        <h1 className="mt-1.5 text-2xl font-bold leading-tight">
          Entra para registrar tus cargas
        </h1>
        <p className="mt-2 text-sm text-suave">
          Escribe tu email y te mandamos un enlace de acceso. Sin contraseñas
          que recordar.
        </p>
      </div>

      <form
        className="space-y-3"
        onSubmit={(evento) => {
          evento.preventDefault();
          void enviarEnlace();
        }}
      >
        <input
          type="email"
          inputMode="email"
          autoComplete="email"
          value={email}
          onChange={(evento) => setEmail(evento.target.value)}
          placeholder="tu@email.com"
          className="w-full rounded-xl border border-borde bg-panel px-4 py-3.5 outline-none placeholder:text-suave/60 focus:border-carmesi"
        />
        {error && <p className="text-xs text-carmesi">{error}</p>}
        <button
          type="submit"
          disabled={!emailValido || cargando}
          className="boton-negro w-full rounded-2xl py-3.5 text-sm font-bold uppercase tracking-wide disabled:opacity-40"
        >
          {cargando ? "Enviando…" : "Enviar enlace"}
        </button>
      </form>
    </div>
  );
}

export default function LoginScreen() {
  return (
    <Suspense
      fallback={
        <div className="flex flex-1 items-center justify-center text-sm text-suave">
          Cargando…
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
