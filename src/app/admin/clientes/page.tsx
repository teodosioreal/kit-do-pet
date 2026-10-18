import type { Metadata } from "next";
import Link from "next/link";
import { formatDateTimeBR } from "@/lib/dates";
import { formatPhone } from "@/lib/phone";
import { createAdminClient } from "@/lib/supabase/admin";
import { createCustomer } from "../actions";

export const metadata: Metadata = { title: "Clientes" };

export default async function CustomersPage({ searchParams }: PageProps<"/admin/clientes">) {
  const { q } = await searchParams;
  const admin = createAdminClient();
  let query = admin.from("profiles").select("id, email, full_name, whatsapp, created_at").order("created_at", { ascending: false }).limit(200);
  if (typeof q === "string" && q.trim()) query = query.ilike("email", `%${q.trim().replace(/[%,()]/g, "")}%`);
  const { data: profiles } = await query;
  const ids = (profiles ?? []).map((p) => p.id);
  const { data: pets } = ids.length ? await admin.from("pets").select("user_id").in("user_id", ids) : { data: [] };
  const petCount = new Map<string, number>();
  (pets ?? []).forEach((p) => petCount.set(p.user_id, (petCount.get(p.user_id) ?? 0) + 1));

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl font-extrabold">Clientes</h1>
      <div className="grid gap-3 md:grid-cols-2">
        <form><input name="q" defaultValue={typeof q === "string" ? q : ""} placeholder="Buscar por e-mail" className="input" /></form>
        <form action={createCustomer} className="flex flex-wrap items-center gap-2">
          <input name="email" type="email" required placeholder="Criar cliente pelo e-mail" className="input flex-1" />
          <label className="flex items-center gap-1 text-sm"><input type="checkbox" name="grant_kit" defaultChecked /> liberar kit</label>
          <button className="btn-secondary py-2">Criar</button>
        </form>
      </div>
      <div className="card overflow-x-auto p-0">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50 text-xs uppercase text-gray-500">
            <tr><th className="p-3">E-mail</th><th>Nome</th><th>WhatsApp</th><th>Pets</th><th>Desde</th></tr>
          </thead>
          <tbody>
            {(profiles ?? []).map((p) => (
              <tr key={p.id} className="border-t">
                <td className="p-3"><Link href={`/admin/clientes/${p.id}`} className="font-semibold text-brand-600">{p.email}</Link></td>
                <td className="p-3">{p.full_name}</td>
                <td className="whitespace-nowrap p-3">{formatPhone(p.whatsapp)}</td>
                <td className="p-3">{petCount.get(p.id) ?? 0}</td>
                <td className="whitespace-nowrap p-3">{formatDateTimeBR(p.created_at)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
