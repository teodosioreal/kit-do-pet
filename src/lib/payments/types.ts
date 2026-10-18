// Formato padronizado de um evento de pagamento, independente da plataforma.
// Para trocar Kiwify por Cakto (ou outra), basta escrever um adaptador que
// implemente PaymentProvider; o processamento (process.ts) não muda.

export type ProviderName = "kiwify" | "cakto";

export type PaymentEventType = "approved" | "refunded" | "chargeback" | "canceled" | "ignored";

export type NormalizedPaymentEvent = {
  provider: ProviderName;
  type: PaymentEventType;
  /** Tipo original do evento na plataforma (para log). */
  rawType: string | null;
  providerOrderId: string;
  email: string;
  name: string | null;
  phone: string | null;
  /** IDs dos produtos comprados neste pedido (principal + order bumps). */
  providerProductIds: string[];
  amountCents: number | null;
};

export type IncomingWebhook = {
  rawBody: string;
  headers: Record<string, string>;
  query: Record<string, string>;
};

export interface PaymentProvider {
  name: ProviderName;
  /** Confere se a requisição veio mesmo da plataforma. */
  verify(req: IncomingWebhook): boolean;
  /** Converte o corpo no formato padronizado (null se não der para entender). */
  parse(body: unknown): NormalizedPaymentEvent | null;
}
