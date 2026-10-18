import type { Metadata } from "next";
import Link from "next/link";
import { formatDateTimeBR } from "@/lib/dates";
import { formatBRL } from "@/lib/products";
import { createAdminClient } from "@/lib/supabase/admin";

export const metadata: Metadata = { title: "Pedidos" };

const STATUS: Record<string, string> = { approved: "Aprovado", refunded: "Reembolsado", chargeback: "Chargeback", canceled: "Cancelado" };

export default async function OrdersPage({ searchParams }: PageProps<"/admin/pedidos">) {
  const { q } = await searchParams;
  let query = createAdminClient().from("orders").select("*").order("created_at", { ascending: false }).limit(200);
  if (typeof q === "string" && q.trim()) query = query.or(`email.ilike.%${q.trim().replace(/[%,()]/g, "")}%,provider_order_id.eq.${q.trim().replace(/[%,()]/g, "")}`);
  const { data: orders } = await query;

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl font-extrabold">Pedidos</h1>
      <form><input name="q" defaultValue={typeof q === "string" ? q : ""} placeholder="Buscar por e-mail ou nº do pedido" className="input" /></form>
      <div className="card overflow-x-auto p-0">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50 text-xs uppercase text-gray-500">
            <tr><th className="p-3">Data</th><th>Cliente</th><th>Itens</th><th>Valor</th><th>Status</th><th>Pedido</th></tr>
          </thead>
          <tbody>
            {(orders ?? []).map((o) => (
              <tr key={o.id} className="border-t align-top">
                <td className="whitespace-nowrap p-3">{formatDateTimeBR(o.created_at)}</td>
                <td className="p-3">
                  {o.user_id ? <Link href={`/admin/clientes/${o.user_id}`} className="font-semibold text-brand-600">{o.email}</Link> : o.email}
                  <div className="text-xs text-gray-500">{o.customer_name}</div>
                </td>
                <td className="p-3 text-xs">{(o.items as string[]).join(", ") || <span className="text-red-600">nenhum reconhecido</span>}</td>
                <td className="whitespace-nowrap p-3">{o.amount_cents != null ? formatBRL(o.amount_cents) : "—"}</td>
                <td className="p-3">
                  <span className={`rounded-full px-2 py-0.5 text-xs font-bold ${o.status === "approved" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>{STATUS[o.status] ?? o.status}</span>
                </td>
                <td className="p-3 text-xs text-gray-500">{o.provider} · {o.provider_order_id}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {!orders?.length && <p className="p-6 text-center text-gray-500">Nenhum pedido.</p>}
      </div>
    </div>
  );
}
