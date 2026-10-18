import type { GuideKey, Species } from "@/lib/products";

export const GUIDE_INFO: Record<GuideKey, { title: string; description: string; icon: string }> = {
  guide_training: {
    title: "Guia de adestramento básico",
    description: "Comandos essenciais, rotina e reforço positivo, passo a passo.",
    icon: "🎓",
  },
  guide_treats: {
    title: "Guia de petiscos caseiros",
    description: "Receitas simples e seguras para fazer em casa.",
    icon: "🍪",
  },
};

/** Espécies cujos guias o cliente deve ver: as dos pets cadastrados (ou as duas se ainda não tem pet). */
export function guideSpeciesFor(petSpecies: Species[]): Species[] {
  const set = new Set(petSpecies);
  return set.size ? (["dog", "cat"] as Species[]).filter((s) => set.has(s)) : ["dog", "cat"];
}
