import { createHmac, timingSafeEqual } from "node:crypto";

export function safeEqual(a: string, b: string) {
  const ba = Buffer.from(a);
  const bb = Buffer.from(b);
  return ba.length === bb.length && timingSafeEqual(ba, bb);
}

export function hmacHex(algorithm: "sha1" | "sha256", secret: string, payload: string) {
  return createHmac(algorithm, secret).update(payload).digest("hex");
}

export function asRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === "object" && !Array.isArray(value) ? (value as Record<string, unknown>) : null;
}

export function str(value: unknown): string | null {
  if (typeof value === "string" && value.trim()) return value.trim();
  if (typeof value === "number") return String(value);
  return null;
}

/** Lê um caminho como "Customer.email" ignorando maiúsculas/minúsculas nas chaves. */
export function pick(obj: unknown, path: string): unknown {
  let current: unknown = obj;
  for (const part of path.split(".")) {
    const rec = asRecord(current);
    if (!rec) return undefined;
    const key = Object.keys(rec).find((k) => k.toLowerCase() === part.toLowerCase());
    current = key ? rec[key] : undefined;
  }
  return current;
}

export function firstStr(obj: unknown, paths: string[]): string | null {
  for (const p of paths) {
    const v = str(pick(obj, p));
    if (v) return v;
  }
  return null;
}

/**
 * Procura IDs de produto em qualquer lugar do corpo: objetos dentro de chaves
 * que contenham "product", "bump" ou "item" e que tenham "product_id"/"id".
 * Usado porque o formato dos order bumps não é documentado oficialmente.
 */
export function collectProductIds(body: unknown): string[] {
  const ids = new Set<string>();
  const visit = (node: unknown, insideProductKey: boolean, depth: number) => {
    if (depth > 6 || node === null || node === undefined) return;
    if (Array.isArray(node)) {
      node.forEach((n) => visit(n, insideProductKey, depth + 1));
      return;
    }
    const rec = asRecord(node);
    if (!rec) return;
    for (const [key, value] of Object.entries(rec)) {
      const k = key.toLowerCase();
      if (k === "product_id" || k === "productid" || (insideProductKey && k === "id")) {
        const v = str(value);
        if (v) ids.add(v);
      }
      if (typeof value === "object") {
        visit(value, insideProductKey || /product|bump|item|offer/.test(k), depth + 1);
      }
    }
  };
  visit(body, false, 0);
  return [...ids];
}

/** "1490", 1490, "14.90" → centavos */
export function toCents(value: unknown): number | null {
  if (typeof value === "number") return Number.isInteger(value) ? value : Math.round(value * 100);
  if (typeof value === "string" && value.trim()) {
    const v = value.trim();
    if (/^\d+$/.test(v)) return Number(v);
    const n = Number(v.replace(/\./g, "").replace(",", "."));
    if (Number.isFinite(n)) return v.includes(",") || v.includes(".") ? Math.round(n * 100) : n;
  }
  return null;
}
