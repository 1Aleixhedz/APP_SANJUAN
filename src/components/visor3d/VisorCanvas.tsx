"use client";

import { Suspense, useEffect, useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Environment, OrbitControls } from "@react-three/drei";
import * as THREE from "three";
import CuerpoMuscular from "@/components/visor3d/CuerpoMuscular";
import MaquinaRemo, { CableRemo } from "@/components/visor3d/MaquinaRemo";
import { ProgresoCtx } from "@/components/visor3d/progreso";
import type { Machine } from "@/lib/types";

export interface Telemetria3D {
  articulacion: string;
  angulo: string;
  veredicto: string;
  fase: string;
  pausa: string;
  intensidad: number;
  musculoClave: string;
}

function suave(t: number) {
  return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
}

function progresoCiclo(ms: number, periodo: number) {
  const u = (ms % periodo) / periodo;
  if (u < 0.4) return suave(u / 0.4);
  if (u < 0.55) return 1;
  return 1 - suave((u - 0.55) / 0.45);
}

function faseDe(ms: number, periodo: number) {
  const u = (ms % periodo) / periodo;
  if (u < 0.4) return "Fase concéntrica activa";
  if (u < 0.55) return "Pausa en contracción";
  return "Fase excéntrica controlada";
}

function EscenaRemo({
  animar,
  onTelemetria,
  articulacion,
  musculoClave,
}: {
  animar: boolean;
  onTelemetria?: (t: Telemetria3D) => void;
  articulacion: string;
  musculoClave: string;
}) {
  const progresoRef = useRef(0.65);
  const inicio = useRef<number | null>(null);
  const ultimoAviso = useRef(0);
  const periodo = 3200;
  const onRef = useRef(onTelemetria);
  onRef.current = onTelemetria;

  useFrame(({ clock }) => {
    if (!animar) {
      progresoRef.current = 0.7;
      return;
    }
    if (inicio.current === null) inicio.current = clock.elapsedTime * 1000;
    const ms = clock.elapsedTime * 1000 - inicio.current;
    const t = progresoCiclo(ms, periodo);
    progresoRef.current = t;

    const ahora = performance.now();
    if (ahora - ultimoAviso.current > 100) {
      ultimoAviso.current = ahora;
      const angulo = THREE.MathUtils.lerp(155, 88, t);
      const u = (ms % periodo) / periodo;
      onRef.current?.({
        articulacion,
        angulo: `${angulo.toFixed(1)}°`,
        veredicto: t > 0.85 ? "Óptimo" : t > 0.4 ? "En rango" : "Iniciando",
        fase: faseDe(ms, periodo),
        pausa: u >= 0.4 && u < 0.55 ? "Pausa 1.0s" : "En movimiento",
        intensidad: t,
        musculoClave,
      });
    }
  });

  useEffect(() => {
    if (!animar) {
      progresoRef.current = 0.7;
      onRef.current?.({
        articulacion,
        angulo: "90.0°",
        veredicto: "Óptimo",
        fase: "Pausa en contracción",
        pausa: "Pausa 1.0s",
        intensidad: 0.7,
        musculoClave,
      });
    } else {
      inicio.current = null;
    }
  }, [animar, articulacion, musculoClave]);

  return (
    <ProgresoCtx.Provider value={progresoRef}>
      <color attach="background" args={["#0b1220"]} />
      <fog attach="fog" args={["#0b1220", 4.5, 9]} />

      <ambientLight intensity={0.32} />
      <directionalLight
        position={[2.2, 3.8, 2.2]}
        intensity={1.4}
        castShadow={false}
      />
      <directionalLight position={[-2.2, 1.8, -1.5]} intensity={0.5} color="#9ec8ff" />
      <spotLight
        position={[0.2, 3.2, 1.8]}
        angle={0.45}
        penumbra={0.55}
        intensity={0.9}
        color="#ffffff"
      />
      <pointLight position={[0, 0.8, 1.2]} intensity={0.35} color="#ff5a7a" />

      <Suspense fallback={null}>
        <Environment preset="warehouse" environmentIntensity={0.28} />
      </Suspense>

      <group position={[0, -0.55, 0]}>
        <MaquinaRemo />
        <CableRemo />
        <CuerpoMuscular animar={animar} />
        {/* Suelo sutil (sin shadow map de three r186) */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.42, 0]}>
          <circleGeometry args={[1.8, 48]} />
          <meshStandardMaterial color="#0a101c" roughness={0.9} metalness={0.05} />
        </mesh>
      </group>

      <OrbitControls
        enablePan={false}
        minPolarAngle={Math.PI / 3}
        maxPolarAngle={Math.PI / 1.65}
        minDistance={1.55}
        maxDistance={3.1}
        target={[0, 0.08, 0]}
      />
    </ProgresoCtx.Provider>
  );
}

export default function VisorCanvas({
  maquina,
  animar,
  onTelemetria,
}: {
  maquina: Machine;
  animar: boolean;
  onTelemetria?: (t: Telemetria3D) => void;
}) {
  const cam = useMemo(
    () => ({
      position: [1.4, 0.58, 1.6] as [number, number, number],
      fov: 34,
    }),
    [],
  );

  const musculoClave =
    maquina.reclutamiento[0]?.etiqueta.split(" ")[0] ?? "Dorsal";

  return (
    <Canvas
      dpr={[1, 1.75]}
      camera={cam}
      gl={{
        antialias: true,
        alpha: false,
        powerPreference: "high-performance",
      }}
      style={{ width: "100%", height: "100%", touchAction: "none" }}
    >
      <EscenaRemo
        animar={animar}
        onTelemetria={onTelemetria}
        articulacion={maquina.telemetria.articulacion}
        musculoClave={musculoClave}
      />
    </Canvas>
  );
}
