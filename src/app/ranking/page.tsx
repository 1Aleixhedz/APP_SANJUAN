import { Suspense } from "react";
import Cargando from "@/components/Cargando";
import RankingScreen from "@/components/RankingScreen";

export const metadata = { title: "Rankings · IronPulse" };

export default function Page() {
  return (
    <Suspense fallback={<Cargando filas={7} />}>
      <RankingScreen />
    </Suspense>
  );
}
