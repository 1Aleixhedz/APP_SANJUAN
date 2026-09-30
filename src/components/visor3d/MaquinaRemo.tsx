"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useProgresoRemo } from "@/components/visor3d/progreso";

/** Máquina de remo sentado: negra, simple, estilo Fitonomy. */
export default function MaquinaRemo() {
  const negro = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: "#141820",
        roughness: 0.65,
        metalness: 0.35,
      }),
    [],
  );
  const metal = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: "#2a303c",
        roughness: 0.4,
        metalness: 0.7,
      }),
    [],
  );

  return (
    <group>
      <mesh position={[0, -0.42, 0.05]} material={negro} receiveShadow>
        <boxGeometry args={[1.1, 0.06, 0.7]} />
      </mesh>

      <mesh position={[0.55, 0.35, -0.15]} material={negro} castShadow>
        <boxGeometry args={[0.08, 1.5, 0.08]} />
      </mesh>
      <mesh position={[0.55, 1.08, -0.15]} material={metal}>
        <boxGeometry args={[0.18, 0.08, 0.18]} />
      </mesh>
      <mesh position={[0.55, 0.95, -0.05]} material={metal}>
        <torusGeometry args={[0.06, 0.015, 12, 24]} />
      </mesh>

      <mesh position={[0, -0.05, 0.05]} material={negro} castShadow>
        <boxGeometry args={[0.38, 0.07, 0.4]} />
      </mesh>
      <mesh position={[0, -0.22, 0.05]} material={metal}>
        <cylinderGeometry args={[0.035, 0.035, 0.3, 12]} />
      </mesh>

      <mesh position={[0.28, -0.22, 0.35]} material={negro}>
        <boxGeometry args={[0.28, 0.04, 0.14]} />
      </mesh>
    </group>
  );
}

/** Cable + mango D que sigue el progreso del remo. */
export function CableRemo() {
  const progreso = useProgresoRemo();
  const mangoRef = useRef<THREE.Mesh>(null);
  const pos = useRef(new THREE.Vector3());
  const polea = useMemo(() => new THREE.Vector3(0.55, 0.95, -0.05), []);

  const linea = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(new Float32Array(6), 3));
    const mat = new THREE.LineBasicMaterial({
      color: "#2dd4e0",
      transparent: true,
      opacity: 0.75,
    });
    return new THREE.Line(geo, mat);
  }, []);

  useFrame(() => {
    const t = progreso.current;
    pos.current.set(
      THREE.MathUtils.lerp(0.35, 0.05, t),
      THREE.MathUtils.lerp(0.55, 0.45, t),
      THREE.MathUtils.lerp(0.25, -0.05, t),
    );
    if (mangoRef.current) mangoRef.current.position.copy(pos.current);

    const attr = linea.geometry.getAttribute("position") as THREE.BufferAttribute;
    attr.setXYZ(0, polea.x, polea.y, polea.z);
    attr.setXYZ(1, pos.current.x, pos.current.y, pos.current.z);
    attr.needsUpdate = true;
  });

  return (
    <group>
      <primitive object={linea} />
      <mesh ref={mangoRef} rotation={[0, 0, Math.PI / 2]}>
        <torusGeometry args={[0.05, 0.012, 10, 20]} />
        <meshStandardMaterial
          color="#1a1f2a"
          metalness={0.6}
          roughness={0.35}
        />
      </mesh>
    </group>
  );
}
