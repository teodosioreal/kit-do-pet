import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { formatDateBR, formatDateTimeBR } from "@/lib/dates";
import { formatPhone } from "@/lib/phone";
import { PRODUCT_KEYS, PRODUCTS, SPECIES_LABEL, type ProductKey } from "@/lib/products";
import { createAdminClient } from "@/lib/supabase/admin";
import type { Entitlement } from "@/lib/types";
import { ActionButton } from "../../action-button";
import { grantManual, resendAccess, restoreEntitlement, revokeAllAccess, revokeEntitlement } from "../../actions";

export const metadata: Metadata = { title: "Cliente" };

export default async function CustomerPage({ params }: PageProps<"/admin/clientes/[id]">) {
  const { id } = await params;
  const admin = createAdminClient();
  const [{ data: profile }, { data: ents }, { data: pets }, { data: orders }, { data: reminders }] = await Promise.all([
    admin.from("profiles").select("*").eq("id", id).maybeSingle(),
    admin.from("entitlements").select("*").eq("user_id", id).order("created_at", { ascending: false }),
    admin.from("pets").select("id, name, species, public_code, registry_number, created_at").eq("user_id", id),
    admin.from("orders").select("id, provider_order_id, status, items, created_at").eq("user_id", id).order("created_at", { ascending: false }),
    admin.from("reminder_log").select("kind, ref_date, status, created_at").eq("user_id", id).order("created_at", { ascending: false }).limit(20),
  ]);
  if (!profile) notFound();
  const now = new Date();
  const isActive = (e: Entitlement) => !e.revoked_at && (!e.expires_at || new Date(e.expires_at) > now);

  return (
    <div className="flex flex-col gap-5">
      <Link href="/admin/clientes" className="text-sm text-gray-500">‹ Clientes</Link>
      <section className="card flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold">{profile.full_name || profile.email}</h1>
          <p className="text-gray-600">{profile.email} · {formatPhone(profile.whatsapp) || "sem WhatsApp"}</p>
          <p className="text-xs text-gray-500">
            Termos: {profile.terms_accepted_at ? formatDateTimeBR(profile.terms_accepted_at) : "não aceitos"} · Consentimento WhatsApp:{" "}
            {profile.whatsapp_consent_at ? "sim" : "não"} · Lembretes {profile.reminders_enabled ? "ativados" : "desativados"}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <ActionButton action={resendAccess.bind(null, id)} label="Reenviar acesso" />
          <ActionButton
            action={revokeAllAccess.bind(null, id)}
            label="Revogar todo o acesso"
            confirmText="Revogar todos os direitos deste cliente e encerrar as sessões?"
            className="btn py-2 text-sm bg-red-50 text-red-700"
          />
        </div>
      </section>

      <section className="card">
        <h2 className="font-bold">Direitos</h2>
        <table className="mt-3 w-full text-left text-sm">
          <thead className="text-xs uppercase text-gray-500"><tr><th className="py-2">Produto</th><th>Origem</th><th>Vence</th><th>Situação</th><th></th></tr></thead>
          <tbody>
            {((ents ?? []) as Entitlement[]).map((e) => (
              <tr key={e.id} className="border-t">
                <td className="py-2">{PRODUCTS[e.product].name}</td>
                <td className="text-xs">{e.source === "manual" ? `manual${e.note ? ` (${e.note})` : ""}` : "pedido"}</td>
                <td>{e.expires_at ? formatDateBR(e.expires_at.slice(0, 10)) : "—"}</td>
                <td>{isActive(e) ? <span className="text-green-700">ativo</span> : <span className="text-red-600">{e.revoked_at ? "revogado" : "vencido"}</span>}</td>
                <td className="text-right">
                  {e.revoked_at ? (
                    <ActionButton action={restoreEntitlement.bind(null, e.id, id)} label="Restaurar" className="text-xs font-semibold text-brand-600" />
                  ) : (
                    <ActionButton action={revokeEntitlement.bind(null, e.id, id)} label="Revogar" confirmText="Revogar este direito?" className="text-xs font-semibold text-red-600" />
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <form action={grantManual.bind(null, id)} className="mt-4 flex flex-wrap gap-2">
          <select name="product" className="input w-auto py-2">
            {PRODUCT_KEYS.map((k: ProductKey) => <option key={k} value={k}>{PRODUCTS[k].name}</option>)}
          </select>
          <input name="note" placeholder="Motivo (opcional)" className="input flex-1 py-2" />
          <button className="btn-primary py-2 text-sm">Liberar manualmente</button>
        </form>
      </section>

      <section className="card">
        <h2 className="font-bold">Pets</h2>
        <ul className="mt-2 flex flex-col gap-1 text-sm">
          {(pets ?? []).map((p) => (
            <li key={p.id}>
              {p.name} ({SPECIES_LABEL[p.species as "dog" | "cat"]}) · {p.registry_number} ·{" "}
              <a href={`/p/${p.public_code}`} target="_blank" className="text-brand-600 underline">página pública</a>
            </li>
          ))}
          {!pets?.length && <li className="text-gray-500">Nenhum pet cadastrado.</li>}
        </ul>
      </section>

      <section className="card">
        <h2 className="font-bold">Pedidos</h2>
        <ul className="mt-2 flex flex-col gap-1 text-sm">
          {(orders ?? []).map((o) => (
            <li key={o.id}>{formatDateTimeBR(o.created_at)} · {o.provider_order_id} · {o.status} · {(o.items as string[]).join(", ")}</li>
          ))}
        </ul>
      </section>

      <section className="card">
        <h2 className="font-bold">Últimos lembretes</h2>
        <ul className="mt-2 flex flex-col gap-1 text-sm">
          {(reminders ?? []).map((r, i) => (
            <li key={i}>{formatDateTimeBR(r.created_at)} · {r.kind} · dose {formatDateBR(r.ref_date)} · {r.status}</li>
          ))}
          {!reminders?.length && <li className="text-gray-500">Nenhum lembrete enviado.</li>}
        </ul>
      </section>
    </div>
  );
}
