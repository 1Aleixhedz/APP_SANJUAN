"use client";

import { usePathname } from "next/navigation";
import AdminNav from "@/components/AdminNav";
import BottomNav from "@/components/BottomNav";

export default function AppChrome() {
  const ruta = usePathname();
  const esAdmin = ruta.startsWith("/admin");
  return esAdmin ? <AdminNav /> : <BottomNav />;
}
