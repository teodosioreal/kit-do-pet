import "server-only";
import { env } from "@/lib/env";

// Envio pela Evolution API (v2). Configuração em EVOLUTION_API_URL,
// EVOLUTION_API_KEY e EVOLUTION_INSTANCE.

export type SendResult = { ok: true } | { ok: false; error: string };

async function call(path: string, body: unknown): Promise<SendResult> {
  const config = env.evolution;
  if (!config) {
    console.warn("[whatsapp] Evolution API não configurada; mensagem não enviada.");
    return { ok: false, error: "whatsapp_not_configured" };
  }
  try {
    const res = await fetch(`${config.url}${path}/${encodeURIComponent(config.instance)}`, {
      method: "POST",
      headers: { "Content-Type": "application/json", apikey: config.apiKey },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(30_000),
    });
    if (!res.ok) {
      const text = await res.text().catch(() => "");
      console.error("[whatsapp] erro", res.status, text.slice(0, 500));
      return { ok: false, error: `http_${res.status}` };
    }
    return { ok: true };
  } catch (err) {
    console.error("[whatsapp] falha", err);
    return { ok: false, error: err instanceof Error ? err.message : "unknown" };
  }
}

export function sendWhatsappText(number: string, text: string) {
  return call("/message/sendText", { number, text });
}

export function sendWhatsappDocument(number: string, file: Buffer, fileName: string, caption?: string) {
  return call("/message/sendMedia", {
    number,
    mediatype: "document",
    mimetype: "application/pdf",
    media: file.toString("base64"),
    fileName,
    caption,
  });
}
