import "server-only";
import { createHmac, timingSafeEqual } from "node:crypto";
import { env } from "@/lib/env";

// Link de acesso enviado após a compra: /acesso/<token>.
// O token é assinado (HMAC) e expira; ao ser aberto gera um link mágico novo.

const DEFAULT_TTL_DAYS = 30;

function sign(payload: string) {
  return createHmac("sha256", env.appSecret).update(payload).digest("base64url");
}

export function createAccessToken(userId: string, ttlDays = DEFAULT_TTL_DAYS) {
  const exp = Math.floor(Date.now() / 1000) + ttlDays * 24 * 60 * 60;
  const payload = Buffer.from(JSON.stringify({ u: userId, e: exp })).toString("base64url");
  return `${payload}.${sign(payload)}`;
}

export function verifyAccessToken(token: string): { userId: string } | null {
  const [payload, signature] = token.split(".");
  if (!payload || !signature) return null;
  const expected = Buffer.from(sign(payload));
  const given = Buffer.from(signature);
  if (expected.length !== given.length || !timingSafeEqual(expected, given)) return null;
  try {
    const data = JSON.parse(Buffer.from(payload, "base64url").toString()) as { u: string; e: number };
    if (!data.u || data.e < Date.now() / 1000) return null;
    return { userId: data.u };
  } catch {
    return null;
  }
}

export function accessUrl(userId: string) {
  return `${env.siteUrl}/acesso/${createAccessToken(userId)}`;
}
