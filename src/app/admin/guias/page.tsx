import type { Metadata } from "next";
import { formatDateTimeBR } from "@/lib/dates";
import { GUIDE_INFO } from "@/lib/guides";
import { GUIDE_KEYS, SPECIES_LABEL, type Species } from "@/lib/products";
import { createAdminClient } from "@/lib/supabase/admin";
import { GuideUpload } from "./guide-upload";

export const metadata: Metadata = { title: "Guias" };

export default async function GuidesAdminPage() {
  const { data: guides } = await createAdminClient().from("guides").select("*");
  const find = (p: string, s: string) => guides?.find((g) => g.product === p && g.species === s);

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl font-extrabold">Guias (bônus)</h1>
      <p className="text-sm text-gray-600">Envie a versão para cão e para gato de cada guia. O cliente vê a versão da espécie dos pets dele.</p>
      <div className="grid gap-4 md:grid-cols-2">
        {GUIDE_KEYS.map((product) =>
          (["dog", "cat"] as Species[]).map((species) => {
            const g = find(product, species);
            return (
              <section key={`${product}-${species}`} className="card flex flex-col gap-2">
                <h2 className="font-bold">{GUIDE_INFO[product].icon} {GUIDE_INFO[product].title} · {SPECIES_LABEL[species]}</h2>
                {g && <p className="text-xs text-gray-500">Atualizado em {formatDateTimeBR(g.updated_at)}</p>}
                <GuideUpload product={product} species={species} current={g?.file_name ?? null} />
              </section>
            );
          }),
        )}
      </div>
    </div>
  );
}
