import "server-only";
import type { NormalizedPaymentEvent, PaymentEventType, PaymentProvider } from "./types";
import { collectProductIds, firstStr, pick, safeEqual, toCents } from "./utils";

// Adaptador da Cakto (pronto para quando trocar de plataforma).
// A Cakto envia um campo `secret` no corpo com a chave configurada no webhook.
// Confira o formato com um pedido de teste (/api/webhooks/cakto/teste) antes de usar.

function mapType(event: string | null, status: string | null): PaymentEventType {
  const s = `${event ?? ""} ${status ?? ""}`.toLowerCase();
  if (/chargeback/.test(s)) return "chargeback";
  if (/refund|reembols/.test(s)) return "refunded";
  if (/cancel/.test(s)) return "canceled";
  if (/purchase_approved|approved|\bpaid\b/.test(s)) return "approved";
  return "ignored";
}

export const cakto: PaymentProvider = {
  name: "cakto",

  verify({ rawBody }) {
    const secret = process.env.CAKTO_WEBHOOK_SECRET;
    if (!secret) return false;
    try {
      const given = firstStr(JSON.parse(rawBody), ["secret"]);
      return !!given && safeEqual(given, secret);
    } catch {
      return false;
    }
  },

  parse(body): NormalizedPaymentEvent | null {
    const data = pick(body, "data") ?? body;
    const orderId = firstStr(data, ["id", "refId", "order_id"]);
    const email = firstStr(data, ["customer.email", "email"]);
    if (!orderId || !email) return null;
    const productIds = new Set(collectProductIds(data));
    const main = firstStr(data, ["product.id", "product_id"]);
    if (main) productIds.add(main);
    return {
      provider: "cakto",
      type: mapType(firstStr(body, ["event"]), firstStr(data, ["status"])),
      rawType: firstStr(body, ["event"]),
      providerOrderId: orderId,
      email: email.toLowerCase(),
      name: firstStr(data, ["customer.name"]),
      phone: firstStr(data, ["customer.phone"]),
      providerProductIds: [...productIds],
      amountCents: toCents(pick(data, "amount")),
    };
  },
};
