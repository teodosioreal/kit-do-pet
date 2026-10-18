import "server-only";
import { env } from "@/lib/env";
import type { NormalizedPaymentEvent, PaymentEventType, PaymentProvider } from "./types";
import { collectProductIds, firstStr, hmacHex, pick, safeEqual, toCents } from "./utils";

// Adaptador da Kiwify.
// Autenticação: a Kiwify envia `?signature=<hmac-sha1 do corpo com o token do webhook>`.
// Também aceitamos o token enviado direto (query `token` ou cabeçalho `x-kiwify-token`).
// Formato do corpo (campos mais comuns): order_id, order_status, webhook_event_type,
// Product.product_id, Customer.email/full_name/mobile, Commissions.charge_amount.
// Se algo não bater com um pedido real, use /api/webhooks/kiwify/teste para capturar
// o corpo e ajuste os caminhos abaixo.

function mapType(status: string | null, eventType: string | null): PaymentEventType {
  const s = `${status ?? ""} ${eventType ?? ""}`.toLowerCase();
  if (/chargeback|chargedback/.test(s)) return "chargeback";
  if (/refund/.test(s)) return "refunded";
  if (/cancel/.test(s)) return "canceled";
  if (/\bpaid\b|approved|order_approved|aprovad/.test(s)) return "approved";
  return "ignored";
}

export const kiwify: PaymentProvider = {
  name: "kiwify",

  verify({ rawBody, headers, query }) {
    const token = env.kiwifyWebhookToken;
    if (!token) return false;
    if (query.signature && safeEqual(query.signature.toLowerCase(), hmacHex("sha1", token, rawBody))) return true;
    const direct = query.token ?? headers["x-kiwify-token"];
    return !!direct && safeEqual(direct, token);
  },

  parse(body): NormalizedPaymentEvent | null {
    const orderId = firstStr(body, ["order_id", "order.id", "id", "order_ref"]);
    const email = firstStr(body, ["Customer.email", "customer.email", "email"]);
    if (!orderId || !email) return null;

    const status = firstStr(body, ["order_status", "status", "order.status"]);
    const eventType = firstStr(body, ["webhook_event_type", "event", "type"]);
    const mainProduct = firstStr(body, ["Product.product_id", "product_id", "Product.id"]);
    const productIds = new Set(collectProductIds(body));
    if (mainProduct) productIds.add(mainProduct);

    return {
      provider: "kiwify",
      type: mapType(status, eventType),
      rawType: [eventType, status].filter(Boolean).join(" / ") || null,
      providerOrderId: orderId,
      email: email.toLowerCase(),
      name: firstStr(body, ["Customer.full_name", "Customer.name", "Customer.first_name", "customer.name"]),
      phone: firstStr(body, ["Customer.mobile", "Customer.phone", "customer.mobile", "customer.phone"]),
      providerProductIds: [...productIds],
      amountCents: toCents(pick(body, "Commissions.charge_amount") ?? pick(body, "Commissions.product_base_price")),
    };
  },
};
