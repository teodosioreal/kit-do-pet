import type { Metadata } from "next";
import { formatDateTimeBR } from "@/lib/dates";
import { createAdminClient } from "@/lib/supabase/admin";
import { ActionButton } from "../action-button";
import { previewWebhook, reprocessWebhook } from "../actions";

export const metadata: Metadata = { title: "Webhooks" };

function pretty(body: string | null) {
  try {
    return JSON.stringify(JSON.parse(body ?? ""), null, 2);
  } catch {
    return body ?? "";
  }
}

export default async function WebhooksPage() {
  const { data: events } = await createAdminClient().from("webhook_events").select("*").order("created_at", { ascending: false }).limit(50);
  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl font-extrabold">Webhooks recebidos</h1>
      <p className="text-sm text-gray-600">
        Os 50 mais recentes, incluindo os de teste (<code>/api/webhooks/kiwify/teste</code>). Use &quot;Ver interpretação&quot; para
        conferir se os campos estão sendo lidos certo.
      </p>
      {(events ?? []).map((ev) => (
        <details key={ev.id} className="card">
          <summary className="flex cursor-pointer flex-wrap items-center gap-2 text-sm">
            <span className="font-semibold">{formatDateTimeBR(ev.created_at)}</span>
            <span className="rounded bg-gray-100 px-2 py-0.5 text-xs">{ev.provider}</span>
            {ev.event_type && <span className="text-xs text-gray-600">{ev.event_type}</span>}
            {ev.provider_order_id && <span className="text-xs text-gray-600">pedido {ev.provider_order_id}</span>}
            <span className={`text-xs ${ev.signature_valid ? "text-green-700" : "text-red-600"}`}>{ev.signature_valid ? "assinatura ok" : "assinatura inválida"}</span>
            <span className="w-full text-xs text-gray-500">{ev.error}</span>
          </summary>
          <div className="mt-3 flex flex-col gap-3">
            <div className="flex flex-wrap gap-2">
              <ActionButton action={previewWebhook.bind(null, ev.id)} label="Ver interpretação" pre />
              <ActionButton action={reprocessWebhook.bind(null, ev.id)} label="Reprocessar" confirmText="Processar este evento agora (liberar/revogar direitos)?" />
            </div>
            <pre className="max-h-96 overflow-auto rounded-xl bg-gray-900 p-3 text-xs text-gray-100">{pretty(ev.body)}</pre>
            <pre className="overflow-auto rounded-xl bg-gray-100 p-3 text-xs">{JSON.stringify({ query: ev.query, headers: ev.headers }, null, 2)}</pre>
          </div>
        </details>
      ))}
    </div>
  );
}
