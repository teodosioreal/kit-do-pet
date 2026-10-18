import "server-only";
import { NextResponse, type NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { PROVIDERS } from "./index";
import { processPaymentEvent } from "./process";
import type { IncomingWebhook, ProviderName } from "./types";

const MAX_BODY = 200_000;
const SAFE_HEADERS = ["content-type", "user-agent", "x-forwarded-for", "x-kiwify-token", "x-cakto-signature"];

async function readIncoming(request: NextRequest): Promise<IncomingWebhook> {
  const rawBody = (await request.text()).slice(0, MAX_BODY);
  const headers: Record<string, string> = {};
  request.headers.forEach((value, key) => {
    if (SAFE_HEADERS.includes(key.toLowerCase())) headers[key.toLowerCase()] = value;
  });
  const query = Object.fromEntries(request.nextUrl.searchParams.entries());
  return { rawBody, headers, query };
}

function redactQuery(query: Record<string, string>) {
  const rest = { ...query };
  delete rest.token;
  return rest;
}

/** Webhook real: valida, registra e processa. */
export function webhookHandler(providerName: ProviderName) {
  return async function POST(request: NextRequest) {
    const provider = PROVIDERS[providerName];
    const incoming = await readIncoming(request);
    const admin = createAdminClient();
    const valid = provider.verify(incoming);

    let body: unknown = null;
    try {
      body = JSON.parse(incoming.rawBody);
    } catch {
      // corpo inválido: registrado abaixo
    }
    const event = valid && body ? provider.parse(body) : null;

    const { data: log } = await admin
      .from("webhook_events")
      .insert({
        provider: providerName,
        event_type: event?.rawType ?? null,
        provider_order_id: event?.providerOrderId ?? null,
        signature_valid: valid,
        headers: incoming.headers,
        query: redactQuery(incoming.query),
        body: incoming.rawBody,
      })
      .select("id")
      .single();

    const finish = async (status: number, payload: Record<string, unknown>, error?: string) => {
      if (log) {
        await admin
          .from("webhook_events")
          .update({ processed_at: new Date().toISOString(), error: error ?? (payload.detail as string | undefined) ?? null })
          .eq("id", log.id);
      }
      return NextResponse.json(payload, { status });
    };

    if (!valid) return finish(401, { ok: false }, "Assinatura/token inválido");
    if (!event) return finish(200, { ok: true, detail: "Corpo não reconhecido; nada feito." });

    try {
      const result = await processPaymentEvent(event);
      return finish(200, { ok: true, ...result });
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      console.error(`[webhook ${providerName}]`, message);
      // 500 faz a plataforma tentar de novo mais tarde
      return finish(500, { ok: false }, message);
    }
  };
}

/** Webhook de teste: só grava o corpo bruto para ajustar o mapeamento dos campos. */
export function captureHandler(providerName: ProviderName) {
  return async function POST(request: NextRequest) {
    const incoming = await readIncoming(request);
    const provider = PROVIDERS[providerName];
    await createAdminClient().from("webhook_events").insert({
      provider: `${providerName}:teste`,
      signature_valid: provider.verify(incoming),
      headers: incoming.headers,
      query: redactQuery(incoming.query),
      body: incoming.rawBody,
      processed_at: new Date().toISOString(),
      error: "Captura de teste (não processado)",
    });
    return NextResponse.json({ ok: true, captured: true });
  };
}
