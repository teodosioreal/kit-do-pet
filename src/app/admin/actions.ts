"use server";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { PROVIDERS } from "@/lib/payments";
import { findOrCreateUser, grantEntitlements, processPaymentEvent, recomputeDurations, sendAccess } from "@/lib/payments/process";
import type { ProviderName } from "@/lib/payments/types";
import { GUIDE_KEYS, PRODUCT_KEYS, type GuideKey, type ProductKey } from "@/lib/products";
import { GUIDES_BUCKET } from "@/lib/storage";
import { createAdminClient } from "@/lib/supabase/admin";

export type AdminResult = { ok: boolean; message: string };

export async function resendAccess(userId: string): Promise<AdminResult> {
  await requireAdmin();
  const admin = createAdminClient();
  const { data: profile } = await admin.from("profiles").select("email, full_name, whatsapp").eq("id", userId).single();
  if (!profile) return { ok: false, message: "Cliente não encontrado." };
  const sent = await sendAccess(userId, profile.email, profile.full_name, profile.whatsapp);
  return { ok: sent.email || sent.whatsapp, message: `E-mail: ${sent.email ? "enviado" : "falhou"} · WhatsApp: ${sent.whatsapp ? "enviado" : "falhou/sem número"}` };
}

export async function grantManual(userId: string, formData: FormData): Promise<void> {
  await requireAdmin();
  const product = String(formData.get("product")) as ProductKey;
  if (!PRODUCT_KEYS.includes(product)) return;
  const note = String(formData.get("note") ?? "").slice(0, 200) || "Liberação manual";
  await grantEntitlements(createAdminClient(), userId, null, [product], "manual", note);
  revalidatePath(`/admin/clientes/${userId}`);
}

/** Cria (ou encontra) um cliente pelo e-mail e libera o kit manualmente. */
export async function createCustomer(formData: FormData): Promise<void> {
  await requireAdmin();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return;
  const admin = createAdminClient();
  const userId = await findOrCreateUser(admin, email, null);
  if (formData.get("grant_kit") === "on") await grantEntitlements(admin, userId, null, ["kit"], "manual", "Cliente criado pelo admin");
  revalidatePath("/admin/clientes");
}

export async function revokeEntitlement(entitlementId: string, userId: string): Promise<void> {
  await requireAdmin();
  const admin = createAdminClient();
  await admin.from("entitlements").update({ revoked_at: new Date().toISOString() }).eq("id", entitlementId);
  await recomputeDurations(admin, userId);
  revalidatePath(`/admin/clientes/${userId}`);
}

export async function restoreEntitlement(entitlementId: string, userId: string): Promise<void> {
  await requireAdmin();
  const admin = createAdminClient();
  await admin.from("entitlements").update({ revoked_at: null }).eq("id", entitlementId);
  await recomputeDurations(admin, userId);
  revalidatePath(`/admin/clientes/${userId}`);
}

/** Revoga todos os direitos e encerra as sessões do cliente. */
export async function revokeAllAccess(userId: string): Promise<void> {
  await requireAdmin();
  const admin = createAdminClient();
  await admin.from("entitlements").update({ revoked_at: new Date().toISOString() }).eq("user_id", userId).is("revoked_at", null);
  await admin.auth.admin.signOut(userId).catch(() => {});
  revalidatePath(`/admin/clientes/${userId}`);
}

export async function reprocessWebhook(eventId: string): Promise<AdminResult> {
  await requireAdmin();
  const admin = createAdminClient();
  const { data: ev } = await admin.from("webhook_events").select("provider, body").eq("id", eventId).single();
  if (!ev) return { ok: false, message: "Evento não encontrado." };
  const providerName = String(ev.provider).split(":")[0] as ProviderName;
  const provider = PROVIDERS[providerName];
  if (!provider) return { ok: false, message: "Plataforma desconhecida." };
  let body: unknown;
  try {
    body = JSON.parse(ev.body ?? "");
  } catch {
    return { ok: false, message: "Corpo não é JSON." };
  }
  const event = provider.parse(body);
  if (!event) return { ok: false, message: "Não foi possível entender o corpo (confira o mapeamento no adaptador)." };
  try {
    const result = await processPaymentEvent(event);
    await admin.from("webhook_events").update({ processed_at: new Date().toISOString(), error: `Reprocessado: ${result.detail}` }).eq("id", eventId);
    revalidatePath("/admin/webhooks");
    return { ok: true, message: `${result.status}: ${result.detail}` };
  } catch (err) {
    return { ok: false, message: err instanceof Error ? err.message : "Erro" };
  }
}

/** Mostra como o adaptador interpretaria o corpo, sem processar nada. */
export async function previewWebhook(eventId: string): Promise<AdminResult> {
  await requireAdmin();
  const { data: ev } = await createAdminClient().from("webhook_events").select("provider, body").eq("id", eventId).single();
  if (!ev) return { ok: false, message: "Evento não encontrado." };
  const provider = PROVIDERS[String(ev.provider).split(":")[0] as ProviderName];
  try {
    const event = provider?.parse(JSON.parse(ev.body ?? ""));
    return { ok: !!event, message: event ? JSON.stringify(event, null, 2) : "Não reconhecido pelo adaptador." };
  } catch {
    return { ok: false, message: "Corpo não é JSON." };
  }
}

/** URL assinada para o navegador enviar o PDF do guia direto ao Storage (sem limite de tamanho da Vercel). */
export async function createGuideUploadUrl(product: string, species: string): Promise<{ path: string; token: string } | null> {
  await requireAdmin();
  if (!GUIDE_KEYS.includes(product as GuideKey) || !["dog", "cat"].includes(species)) return null;
  const path = `${product}/${species}/${Date.now()}.pdf`;
  const { data } = await createAdminClient().storage.from(GUIDES_BUCKET).createSignedUploadUrl(path);
  return data ? { path, token: data.token } : null;
}

export async function registerGuide(product: string, species: string, path: string, fileName: string): Promise<AdminResult> {
  await requireAdmin();
  if (!GUIDE_KEYS.includes(product as GuideKey) || !["dog", "cat"].includes(species) || !path.startsWith(`${product}/${species}/`)) {
    return { ok: false, message: "Dados inválidos." };
  }
  const admin = createAdminClient();
  const { data: previous } = await admin.from("guides").select("file_path").eq("product", product).eq("species", species).maybeSingle();
  const { error } = await admin
    .from("guides")
    .upsert({ product, species, file_path: path, file_name: fileName.slice(0, 120), updated_at: new Date().toISOString() });
  if (error) return { ok: false, message: error.message };
  if (previous?.file_path && previous.file_path !== path) await admin.storage.from(GUIDES_BUCKET).remove([previous.file_path]);
  revalidatePath("/admin/guias");
  return { ok: true, message: "Guia publicado!" };
}
