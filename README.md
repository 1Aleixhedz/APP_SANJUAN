# IronPulse Central · app de máquinas y récords

Prototipo de web app (PWA) para el gimnasio. Cada bahía lleva un QR pegado; al
escanearlo se abre la ficha de esa máquina con la técnica, el mapa de
reclutamiento muscular y los récords, y desde ahí se registran las series que
alimentan los rankings.

## Arrancar

Para producción (Supabase + Vercel): sigue **[`SETUP.md`](SETUP.md)** paso a paso.

```bash
cp .env.local.example .env.local   # rellena URL y anon key de Supabase
npm install
npm run dev
```

Se abre en http://localhost:3000

Para verlo en el móvil, con el móvil en la misma wifi que el ordenador:

```bash
npm run dev:movil
```

Luego busca la IP del ordenador (`ipconfig` en Windows) y entra desde el móvil
a `http://esa-ip:3000`.

## Pantallas

La barra inferior tiene cuatro pestañas, igual que en los diseños.

| Ruta | Pestaña | Qué es |
| --- | --- | --- |
| `/` | Máquina / QR | Escaneo, sesión en curso y listado de bahías |
| `/m/<maquina>` | Máquina / QR | **La pantalla del QR**: visor biomecánico, reclutamiento, claves de técnica y récords de la bahía |
| `/registro` | Registro | Benchmark de sala, cronómetro de descanso, RPE, macro placas y series de la sesión |
| `/ranking` | Rankings | Podio por máquina o por kilos totales, tu posición y Salón de la Fama |
| `/perfil` | Mi Perfil | Nivel y XP, récords personales, vitrina de trofeos y actividad reciente |
| `/login` | — | Acceso por magic link (Supabase Auth) |
| `/admin/qr` | — | Genera los QR de todas las bahías (solo admin) |

## Qué es de verdad y qué está simulado

Funciona de verdad (con Supabase configurado):

- Auth por magic link, perfiles y series en la nube (multi-dispositivo).
- Récords por máquina (histórico, semana, mes) y rankings de carga y tonelaje.
- Nivel y XP, trofeos, rachas, récords batidos de la temporada, bestia de la
  semana y récord más longevo del gimnasio.
- Registro de series con calentamiento/efectiva, RPE, notas y cronómetro.
- Generación e impresión de los QR.
- Seed de demo solo para admins (botón en Perfil o `supabase/seed_demo.sql`).

Pendiente / simulado:

- La telemetría del visor (ángulo, pausa, fase) son datos técnicos fijos de cada
  máquina, no sensores en vivo.
- Vídeos de técnica: opcional en `public/videos/` (ver LEEME ahí).
- Catálogo de máquinas sigue en código (`src/lib/machines.ts`), no en la DB.

## Cambiar máquinas, músculos o textos

- Bahías, sectores, técnica, reclutamiento y topes de peso: `src/lib/machines.ts`
- Esquema DB, seed demo y RLS: `supabase/schema.sql`
- Récords, rankings, niveles y trofeos: `src/lib/rankings.ts`
- Músculos y en qué vista se dibuja cada uno: `src/lib/muscles.ts`
- Dibujo del cuerpo y de cada músculo: `src/components/MuscleMap.tsx`
- Colores y tipografía del tema: `src/app/globals.css`

## Utilidad de desarrollo

`npm run capturas -- /ranking /perfil` guarda capturas de pantalla en
`capturas/` usando el Edge instalado en Windows. Útil para revisar el diseño
sin tener que abrir el móvil.
