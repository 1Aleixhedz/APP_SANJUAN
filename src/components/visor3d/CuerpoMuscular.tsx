"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useProgresoRemo } from "@/components/visor3d/progreso";

const BLANCO = "#f2f5f8";

function matBlanco(opts?: { rough?: number }) {
  return new THREE.MeshPhysicalMaterial({
    color: BLANCO,
    roughness: opts?.rough ?? 0.42,
    metalness: 0.02,
    clearcoat: 0.35,
    clearcoatRoughness: 0.35,
  });
}

/** Perfil del torso para LatheGeometry (eje Y). */
function perfilTorso() {
  const pts: THREE.Vector2[] = [];
  const radio = (y: number) => {
    if (y < 0.15) return 0.13 + y * 0.2;
    if (y < 0.45) return 0.16 + Math.sin((y - 0.15) * Math.PI) * 0.045;
    if (y < 0.75) return 0.2 + Math.sin((y - 0.45) * Math.PI) * 0.055;
    return 0.14 - (y - 0.75) * 0.08;
  };
  for (let i = 0; i <= 24; i++) {
    const y = i / 24;
    pts.push(new THREE.Vector2(radio(y), y * 0.72));
  }
  return pts;
}

/**
 * Cuerpo muscular estilizado (écorché Fitonomy-like) articulado
 * para sentarse y remar.
 */
export default function CuerpoMuscular({ animar }: { animar: boolean }) {
  const progreso = useProgresoRemo();
  const hombroL = useRef<THREE.Group>(null);
  const hombroR = useRef<THREE.Group>(null);
  const codoL = useRef<THREE.Group>(null);
  const codoR = useRef<THREE.Group>(null);
  const torso = useRef<THREE.Group>(null);
  const dorsalL = useRef<THREE.Mesh>(null);
  const dorsalR = useRef<THREE.Mesh>(null);
  const tLocal = useRef(0.65);

  const geos = useMemo(() => {
    const torsoGeo = new THREE.LatheGeometry(perfilTorso(), 48);
    torsoGeo.computeVertexNormals();

    const dorsal = new THREE.SphereGeometry(0.14, 24, 18, 0, Math.PI);
    dorsal.scale(1.15, 1.35, 0.55);

    return {
      cabeza: new THREE.SphereGeometry(0.095, 32, 24),
      cuello: new THREE.CylinderGeometry(0.045, 0.055, 0.08, 20),
      torso: torsoGeo,
      pectoral: new THREE.SphereGeometry(0.08, 20, 16),
      deltoides: new THREE.SphereGeometry(0.07, 20, 16),
      brazo: new THREE.CapsuleGeometry(0.038, 0.16, 8, 16),
      antebrazo: new THREE.CapsuleGeometry(0.032, 0.15, 8, 16),
      mano: new THREE.SphereGeometry(0.035, 16, 12),
      muslo: new THREE.CapsuleGeometry(0.065, 0.26, 8, 16),
      pantorrilla: new THREE.CapsuleGeometry(0.045, 0.22, 8, 16),
      pie: new THREE.BoxGeometry(0.07, 0.04, 0.14),
      gluteo: new THREE.SphereGeometry(0.09, 20, 16),
      dorsal,
    };
  }, []);

  const mats = useMemo(() => {
    const rojo = new THREE.MeshPhysicalMaterial({
      color: "#ff3b5c",
      roughness: 0.35,
      metalness: 0.05,
      emissive: new THREE.Color("#ff2d55"),
      emissiveIntensity: 0.9,
      clearcoat: 0.2,
    });
    return {
      piel: matBlanco(),
      sombra: matBlanco({ rough: 0.5 }),
      rojo,
      cSuave: new THREE.Color("#ff6b81"),
      cFuerte: new THREE.Color("#ff1f4b"),
    };
  }, []);

  useFrame((_, dt) => {
    const target = animar ? progreso.current : 0.7;
    tLocal.current += (target - tLocal.current) * Math.min(1, dt * 8);
    const t = tLocal.current;

    const hombro = THREE.MathUtils.lerp(0.35, -0.85, t);
    const codo = THREE.MathUtils.lerp(0.15, 1.55, t);
    const lean = THREE.MathUtils.lerp(0.12, 0.04, t);

    if (torso.current) torso.current.rotation.x = lean;
    if (hombroL.current) {
      hombroL.current.rotation.x = hombro;
      hombroL.current.rotation.z = THREE.MathUtils.lerp(0.35, 0.15, t);
      hombroL.current.rotation.y = THREE.MathUtils.lerp(0.2, 0.55, t);
    }
    if (hombroR.current) {
      hombroR.current.rotation.x = hombro;
      hombroR.current.rotation.z = THREE.MathUtils.lerp(-0.35, -0.15, t);
      hombroR.current.rotation.y = THREE.MathUtils.lerp(-0.2, -0.55, t);
    }
    if (codoL.current) codoL.current.rotation.x = -codo;
    if (codoR.current) codoR.current.rotation.x = -codo;

    mats.rojo.color.lerpColors(mats.cSuave, mats.cFuerte, t);
    mats.rojo.emissiveIntensity = 0.25 + t * 1.35;

    const escala = 0.95 + t * 0.12;
    if (dorsalL.current) dorsalL.current.scale.setScalar(escala);
    if (dorsalR.current) dorsalR.current.scale.setScalar(escala);
  });

  return (
    <group position={[0, -0.15, 0]} rotation={[0, Math.PI * 0.72, 0]}>
      <group position={[-0.1, 0.05, 0.05]}>
        <mesh
          geometry={geos.gluteo}
          material={mats.piel}
          position={[0, 0.08, -0.02]}
          scale={[1, 0.9, 0.95]}
        />
        <mesh
          geometry={geos.muslo}
          material={mats.piel}
          position={[0.02, -0.05, 0.14]}
          rotation={[-1.15, 0.1, 0.15]}
        />
        <mesh
          geometry={geos.pantorrilla}
          material={mats.sombra}
          position={[0.06, -0.12, 0.38]}
          rotation={[0.35, 0, 0]}
        />
        <mesh
          geometry={geos.pie}
          material={mats.piel}
          position={[0.06, -0.24, 0.5]}
        />
      </group>
      <group position={[0.1, 0.05, 0.05]}>
        <mesh
          geometry={geos.gluteo}
          material={mats.piel}
          position={[0, 0.08, -0.02]}
          scale={[1, 0.9, 0.95]}
        />
        <mesh
          geometry={geos.muslo}
          material={mats.piel}
          position={[-0.02, -0.05, 0.14]}
          rotation={[-1.15, -0.1, -0.15]}
        />
        <mesh
          geometry={geos.pantorrilla}
          material={mats.sombra}
          position={[-0.06, -0.12, 0.38]}
          rotation={[0.35, 0, 0]}
        />
        <mesh
          geometry={geos.pie}
          material={mats.piel}
          position={[-0.06, -0.24, 0.5]}
        />
      </group>

      <group ref={torso} position={[0, 0.12, -0.02]}>
        <mesh
          geometry={geos.torso}
          material={mats.piel}
          castShadow
        />

        <mesh
          geometry={geos.pectoral}
          material={mats.piel}
          position={[-0.07, 0.48, 0.1]}
          scale={[1.1, 0.85, 0.7]}
        />
        <mesh
          geometry={geos.pectoral}
          material={mats.piel}
          position={[0.07, 0.48, 0.1]}
          scale={[1.1, 0.85, 0.7]}
        />

        <mesh
          ref={dorsalL}
          geometry={geos.dorsal}
          material={mats.rojo}
          position={[-0.1, 0.42, -0.06]}
          rotation={[0.15, -0.9, 0.2]}
        />
        <mesh
          ref={dorsalR}
          geometry={geos.dorsal}
          material={mats.rojo}
          position={[0.1, 0.42, -0.06]}
          rotation={[0.15, 0.9, -0.2]}
        />

        <mesh
          geometry={geos.cuello}
          material={mats.piel}
          position={[0, 0.76, 0.02]}
        />
        <mesh
          geometry={geos.cabeza}
          material={mats.piel}
          position={[0, 0.9, 0.03]}
          castShadow
        />

        <group ref={hombroL} position={[-0.2, 0.58, 0]}>
          <mesh geometry={geos.deltoides} material={mats.piel} />
          <mesh
            geometry={geos.brazo}
            material={mats.piel}
            position={[0, -0.12, 0]}
          />
          <group ref={codoL} position={[0, -0.24, 0]}>
            <mesh
              geometry={geos.antebrazo}
              material={mats.sombra}
              position={[0, -0.1, 0]}
            />
            <mesh
              geometry={geos.mano}
              material={mats.piel}
              position={[0, -0.2, 0]}
            />
          </group>
        </group>

        <group ref={hombroR} position={[0.2, 0.58, 0]}>
          <mesh geometry={geos.deltoides} material={mats.piel} />
          <mesh
            geometry={geos.brazo}
            material={mats.piel}
            position={[0, -0.12, 0]}
          />
          <group ref={codoR} position={[0, -0.24, 0]}>
            <mesh
              geometry={geos.antebrazo}
              material={mats.sombra}
              position={[0, -0.1, 0]}
            />
            <mesh
              geometry={geos.mano}
              material={mats.piel}
              position={[0, -0.2, 0]}
            />
          </group>
        </group>
      </group>
    </group>
  );
}
