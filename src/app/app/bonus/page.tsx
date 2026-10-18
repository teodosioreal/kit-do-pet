import type { Metadata } from "next";
import { requireUser } from "@/lib/auth";
import { getAccess } from "@/lib/entitlements";
import { GUIDE_INFO, guideSpeciesFor } from "@/lib/guides";
import { GUIDE_KEYS, SPECIES_LABEL, type Species } from "@/lib/products";

export const metadata: Metadata = { title: "Meus bônus" };

export default async function BonusPage() {
  const { supabase, user } = await requireUser();
  const [access, { data: pets }] = await Promise.all([
    getAccess(supabase, user.id),
    supabase.from("pets").select("species"),
  ]);
  const species = guideSpeciesFor((pets ?? []).map((p) => p.species as Species));
  const owned = GUIDE_KEYS.filter((g) => access.guides.has(g));

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl font-extrabold">Meus bônus</h1>
      {owned.length === 0 && (
        <div className="card text-center text-gray-600">
          <div className="text-4xl">🎁</div>
          <p className="mt-2">Você ainda não tem guias bônus.</p>
        </div>
      )}
      {owned.map((key) => (
        <section key={key} className="card flex flex-col gap-3">
          <div className="flex items-center gap-3">
            <span className="text-3xl">{GUIDE_INFO[key].icon}</span>
            <div>
              <h2 className="font-bold">{GUIDE_INFO[key].title}</h2>
              <p className="text-sm text-gray-600">{GUIDE_INFO[key].description}</p>
            </div>
          </div>
          {species.map((s) => (
            <a key={s} href={`/api/guias/${key}/${s}`} className="btn-secondary justify-between">
              <span>{s === "dog" ? "🐶" : "🐱"} Versão para {SPECIES_LABEL[s].toLowerCase()}</span>
              <span className="text-sm">Baixar ↓</span>
            </a>
          ))}
        </section>
      ))}
    </div>
  );
}
