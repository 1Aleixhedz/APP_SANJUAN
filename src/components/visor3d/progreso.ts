"use client";

import { createContext, useContext } from "react";

/** Ref mutable compartida: progreso 0→1 del ciclo de remo. */
export type ProgresoRef = { current: number };

export const ProgresoCtx = createContext<ProgresoRef>({ current: 0.65 });

export function useProgresoRemo() {
  return useContext(ProgresoCtx);
}
