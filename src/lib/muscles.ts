import type { Muscle, MuscleId } from "./types";

export const MUSCULOS: Record<MuscleId, Muscle> = {
  pectoral: { id: "pectoral", nombre: "Pectoral", vista: "frente" },
  dorsal: { id: "dorsal", nombre: "Dorsal ancho", vista: "espalda" },
  trapecio: { id: "trapecio", nombre: "Trapecio", vista: "espalda" },
  romboides: { id: "romboides", nombre: "Romboides", vista: "espalda" },
  deltoides: { id: "deltoides", nombre: "Hombro", vista: "frente" },
  deltoidesPosterior: {
    id: "deltoidesPosterior",
    nombre: "Hombro posterior",
    vista: "espalda",
  },
  biceps: { id: "biceps", nombre: "Bíceps", vista: "frente" },
  triceps: { id: "triceps", nombre: "Tríceps", vista: "espalda" },
  antebrazo: { id: "antebrazo", nombre: "Antebrazo", vista: "frente" },
  abdomen: { id: "abdomen", nombre: "Abdominales", vista: "frente" },
  oblicuos: { id: "oblicuos", nombre: "Oblicuos", vista: "frente" },
  lumbar: { id: "lumbar", nombre: "Lumbares", vista: "espalda" },
  gluteo: { id: "gluteo", nombre: "Glúteo", vista: "espalda" },
  cuadriceps: { id: "cuadriceps", nombre: "Cuádriceps", vista: "frente" },
  isquios: { id: "isquios", nombre: "Isquiotibiales", vista: "espalda" },
  gemelos: { id: "gemelos", nombre: "Gemelos", vista: "espalda" },
  aductores: { id: "aductores", nombre: "Aductores", vista: "frente" },
  abductores: { id: "abductores", nombre: "Abductores", vista: "espalda" },
};

export function nombreMusculo(id: MuscleId): string {
  return MUSCULOS[id]?.nombre ?? id;
}
