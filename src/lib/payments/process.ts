import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import { accessUrl } from "@/lib/access-link";
import { sendAccessEmail } from "@/lib/email";
import { accessWhatsappMessage } from "@/lib/messages";
import { normalizePhone } from "@/lib/phone";
import { PRODUCTS, productKeyFromProviderId, type ProductKey } from "@/lib/products";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendWhatsappText } from "@/lib/whatsapp";
import type { NormalizedPaymentEvent } from "./types";

export type ProcessResult = { status: "processed" | "ignored" | "duplicate"; detail: string };

/** Encontra o usuário pelo e-mail ou cria um novo (já confirmado). */
export async function findOrCreateUser(admin: SupabaseClient, email: string, name: string | null) {
  const normalized = email.trim().toLowerCase();
  const { data: existing } = await admin.from("profiles").select("id").eq("email", normalized).maybeSingle();
  if (existing) return existing.id as string;

  const { data, error } = await admin.auth.admin.createUser({
    email: normalized,
    email_confirm: true,
    user_metadata: name ? { full_name: name } : undefined,
  });
  if (data.user) return data.user.id;

  // Corrida: outro webhook criou o usuário ao mesmo tempo
  const { data: again } = await admin.from("profiles").select("id").eq("email", normalized).maybeSingle();
  if (again) return again.id as string;
  throw new Error(`Não foi possível criar o usuário: ${error?.message}`);
}

function addMonths(date: Date, months: number) {
  const d = new Date(date);
  d.setMonth(d.getMonth() + months);
  return d;
}

/** Concede os direitos de um pedido (idempotente: um direito por produto por pedido). */
export async function grantEntitlements(
  admin: SupabaseClient,
  userId: string,
  orderId: string | null,
  items: ProductKey[],
  source: "order" | "manual" = "order",
  note?: string,
) {
  for (const product of items) {
    let expiresAt: string | null = null;
    const months = PRODUCTS[product].durationMonths;
    if (months) {
      // Renovação: soma a partir do maior vencimento ainda ativo
      const { data: current } = await admin
        .from("active_entitlements")
        .select("expires_at")
        .eq("user_id", userId)
        .eq("product", product)
        .order("expires_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      const base = current?.expires_at && new Date(current.expires_at) > new Date() ? new Date(current.expires_at) : new Date();
      expiresAt = addMonths(base, months).toISOString();
    }
    const row = { user_id: userId, order_id: orderId, product, quantity: 1, expires_at: expiresAt, source, note: note ?? null };
    const query = orderId
      ? admin.from("entitlements").upsert(row, { onConflict: "order_id,product", ignoreDuplicates: true })
      : admin.from("entitlements").insert(row);
    const { error } = await query;
    if (error) throw new Error(`Erro ao liberar ${product}: ${error.message}`);
  }
}

/**
 * Recalcula os vencimentos de produtos com prazo (ex.: lembretes) depois de uma
 * revogação: cada compra válida soma o prazo a partir do vencimento anterior.
 */
export async function recomputeDurations(admin: SupabaseClient, userId: string) {
  for (const product of Object.keys(PRODUCTS) as ProductKey[]) {
    const months = PRODUCTS[product].durationMonths;
    if (!months) continue;
    const { data: rows } = await admin
      .from("entitlements")
      .select("id, created_at, expires_at")
      .eq("user_id", userId)
      .eq("product", product)
      .is("revoked_at", null)
      .order("created_at");
    let previous: Date | null = null;
    for (const row of rows ?? []) {
      const created = new Date(row.created_at);
      const start: Date = previous && previous > created ? previous : created;
      const expires = addMonths(start, months);
      if (!row.expires_at || new Date(row.expires_at).getTime() !== expires.getTime()) {
        await admin.from("entitlements").update({ expires_at: expires.toISOString() }).eq("id", row.id);
      }
      previous = expires;
    }
  }
}

/** Envia o link de acesso por e-mail e WhatsApp. */
export async function sendAccess(userId: string, email: string, name: string | null, phone: string | null) {
  const link = accessUrl(userId);
  const [mail, whats] = await Promise.all([
    sendAccessEmail(email, name, link),
    phone ? sendWhatsappText(phone, accessWhatsappMessage(name, link)) : Promise.resolve({ ok: false as const, error: "no_phone" }),
  ]);
  return { email: mail.ok, whatsapp: whats.ok };
}

export async function processPaymentEvent(event: NormalizedPaymentEvent): Promise<ProcessResult> {
  const admin = createAdminClient();

  if (event.type === "approved") return processApproved(admin, event);
  if (event.type === "refunded" || event.type === "chargeback" || event.type === "canceled") return processRevocation(admin, event);
  return { status: "ignored", detail: `Evento ignorado (${event.rawType ?? "desconhecido"})` };
}

async function processApproved(admin: SupabaseClient, event: NormalizedPaymentEvent): Promise<ProcessResult> {
  const items = [
    ...new Set(
      event.providerProductIds
        .map((id) => productKeyFromProviderId(event.provider, id))
        .filter((k): k is ProductKey => !!k),
    ),
  ];
  const phone = normalizePhone(event.phone);

  const { data: existing } = await admin
    .from("orders")
    .select("id, status, user_id, items, provider_product_ids")
    .eq("provider", event.provider)
    .eq("provider_order_id", event.providerOrderId)
    .maybeSingle();

  if (existing && existing.status !== "approved") {
    return { status: "ignored", detail: `Pedido já está como ${existing.status}; aprovação ignorada.` };
  }

  const userId = existing?.user_id ?? (await findOrCreateUser(admin, event.email, event.name));

  // Completa o perfil sem sobrescrever o que o cliente já preencheu
  const { data: profile } = await admin.from("profiles").select("full_name, whatsapp").eq("id", userId).single();
  const profileUpdate: Record<string, string> = {};
  if (!profile?.full_name && event.name) profileUpdate.full_name = event.name;
  if (!profile?.whatsapp && phone) profileUpdate.whatsapp = phone;
  if (Object.keys(profileUpdate).length) await admin.from("profiles").update(profileUpdate).eq("id", userId);

  let orderId: string;
  let isNew = false;
  if (existing) {
    // Mesmo pedido chegando de novo (ou um order bump em evento separado): só soma itens novos
    orderId = existing.id;
    const mergedItems = [...new Set([...(existing.items as string[]), ...items])];
    const mergedIds = [...new Set([...(existing.provider_product_ids as string[]), ...event.providerProductIds])];
    if (mergedItems.length === (existing.items as string[]).length && mergedIds.length === (existing.provider_product_ids as string[]).length) {
      return { status: "duplicate", detail: "Pedido já processado." };
    }
    await admin.from("orders").update({ items: mergedItems, provider_product_ids: mergedIds }).eq("id", orderId);
  } else {
    const { data: inserted, error } = await admin
      .from("orders")
      .upsert(
        {
          provider: event.provider,
          provider_order_id: event.providerOrderId,
          status: "approved",
          user_id: userId,
          email: event.email,
          customer_name: event.name,
          customer_phone: phone,
          provider_product_ids: event.providerProductIds,
          items,
          amount_cents: event.amountCents,
          approved_at: new Date().toISOString(),
        },
        { onConflict: "provider,provider_order_id", ignoreDuplicates: true },
      )
      .select("id");
    if (error) throw new Error(`Erro ao salvar pedido: ${error.message}`);
    if (!inserted?.length) return { status: "duplicate", detail: "Pedido processado em paralelo." };
    orderId = inserted[0].id;
    isNew = true;
  }

  await grantEntitlements(admin, userId, orderId, items);

  if (!isNew) return { status: "processed", detail: `Itens adicionados ao pedido: ${items.join(", ")}` };

  const sent = await sendAccess(userId, event.email, event.name, phone);
  const unknown = items.length === 0 ? " ATENÇÃO: nenhum produto reconhecido — confira os IDs nas variáveis KIWIFY_PRODUCT_*." : "";
  return {
    status: "processed",
    detail: `Liberado: ${items.join(", ") || "nada"}. Acesso por e-mail: ${sent.email ? "ok" : "falhou"}; WhatsApp: ${sent.whatsapp ? "ok" : "falhou"}.${unknown}`,
  };
}

async function processRevocation(admin: SupabaseClient, event: NormalizedPaymentEvent): Promise<ProcessResult> {
  const status = event.type === "canceled" ? "canceled" : event.type;
  const { data: order } = await admin
    .from("orders")
    .select("id, status")
    .eq("provider", event.provider)
    .eq("provider_order_id", event.providerOrderId)
    .maybeSingle();

  const now = new Date().toISOString();
  if (!order) {
    // Reembolso de um pedido que nunca chegou aprovado: registra para histórico
    await admin.from("orders").upsert(
      {
        provider: event.provider,
        provider_order_id: event.providerOrderId,
        status,
        email: event.email,
        customer_name: event.name,
        provider_product_ids: event.providerProductIds,
        revoked_at: now,
      },
      { onConflict: "provider,provider_order_id", ignoreDuplicates: true },
    );
    return { status: "processed", detail: "Pedido não existia; registrado como revogado." };
  }
  if (order.status === status) return { status: "duplicate", detail: "Revogação já processada." };

  await admin.from("orders").update({ status, revoked_at: now }).eq("id", order.id);
  await admin.from("entitlements").update({ revoked_at: now }).eq("order_id", order.id).is("revoked_at", null);
  const { data: full } = await admin.from("orders").select("user_id").eq("id", order.id).single();
  if (full?.user_id) await recomputeDurations(admin, full.user_id);
  return { status: "processed", detail: `Direitos do pedido revogados (${status}).` };
}
