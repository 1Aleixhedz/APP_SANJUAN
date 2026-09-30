import MachinePageClient from "@/components/MachinePageClient";
import { MAQUINAS, getMaquinaPorSlug } from "@/lib/machines";

export function generateStaticParams() {
  return MAQUINAS.map((maquina) => ({ slug: maquina.slug }));
}

export async function generateMetadata({ params }: PageProps<"/m/[slug]">) {
  const { slug } = await params;
  const maquina = getMaquinaPorSlug(slug);
  return {
    title: maquina ? `${maquina.nombre} · IronPulse` : "Máquina",
  };
}

export default async function Page({ params }: PageProps<"/m/[slug]">) {
  const { slug } = await params;
  const inicial = getMaquinaPorSlug(slug);
  return <MachinePageClient slug={slug} inicial={inicial} />;
}
