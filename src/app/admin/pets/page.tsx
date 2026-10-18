import type { Metadata } from "next";
import Link from "next/link";
import { formatDateTimeBR } from "@/lib/dates";
import { SPECIES_LABEL } from "@/lib/products";
import { createAdminClient } from "@/lib/supabase/admin";

export const metadata: Metadata = { title: "Pets" };

export default async function PetsAdminPage({ searchParams }: PageProps<"/admin/pets">) {
  const { q } = await searchParams;
  const admin = createAdminClient();
  let query = admin.from("pets").select("id, user_id, name, species, breed, public_code, registry_number, created_at").order("created_at", { ascending: false }).limit(300);
  if (typeof q === "string" && q.trim()) query = query.ilike("name", `%${q.trim().replace(/[%,()]/g, "")}%`);
  const { data: pets } = await query;
  const ids = [...new Set((pets ?? []).map((p) => p.user_id))];
  const { data: owners } = ids.length ? await admin.from("profiles").select("id, email").in("id", ids) : { data: [] };
  const emailOf = new Map((owners ?? []).map((o) => [o.id, o.email]));
  const { count } = await admin.from("pets").select("id", { count: "exact", head: true });

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl font-extrabold">Pets <span className="text-base font-normal text-gray-500">({count ?? 0} no total)</span></h1>
      <form><input name="q" defaultValue={typeof q === "string" ? q : ""} placeholder="Buscar pelo nome do pet" className="input" /></form>
      <div className="card overflow-x-auto p-0">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50 text-xs uppercase text-gray-500">
            <tr><th className="p-3">Pet</th><th>Espécie</th><th>Tutor</th><th>Registro</th><th>Cadastro</th></tr>
          </thead>
          <tbody>
            {(pets ?? []).map((p) => (
              <tr key={p.id} className="border-t">
                <td className="p-3"><a href={`/p/${p.public_code}`} target="_blank" className="font-semibold text-brand-600">{p.name}</a></td>
                <td className="p-3">{SPECIES_LABEL[p.species as "dog" | "cat"]}{p.breed ? ` · ${p.breed}` : ""}</td>
                <td className="p-3"><Link href={`/admin/clientes/${p.user_id}`} className="underline">{emailOf.get(p.user_id)}</Link></td>
                <td className="p-3 text-xs">{p.registry_number}</td>
                <td className="whitespace-nowrap p-3">{formatDateTimeBR(p.created_at)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
