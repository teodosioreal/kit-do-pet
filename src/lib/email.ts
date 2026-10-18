import "server-only";
import { Resend } from "resend";
import { env } from "@/lib/env";

function escapeHtml(text: string) {
  return text.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);
}

export async function sendEmail(to: string, subject: string, html: string, text: string) {
  if (!env.resendApiKey) {
    console.warn("[email] RESEND_API_KEY não configurada; e-mail não enviado.");
    return { ok: false as const, error: "email_not_configured" };
  }
  const { error } = await new Resend(env.resendApiKey).emails.send({ from: env.emailFrom, to, subject, html, text });
  if (error) {
    console.error("[email] erro", error);
    return { ok: false as const, error: error.message };
  }
  return { ok: true as const };
}

export function sendAccessEmail(to: string, name: string | null, link: string) {
  const first = name?.split(" ")[0];
  const hello = first ? `Oi, ${escapeHtml(first)}!` : "Oi!";
  const html = `<!doctype html><html><body style="margin:0;background:#fffaf5;font-family:Arial,Helvetica,sans-serif;color:#1f2937">
  <div style="max-width:480px;margin:0 auto;padding:32px 20px">
    <div style="text-align:center;font-size:40px">🐾</div>
    <h1 style="text-align:center;color:#ea580c;font-size:24px;margin:8px 0 16px">Seu Kit do Pet chegou!</h1>
    <p style="font-size:16px;line-height:1.5">${hello} Obrigado pela compra. Toque no botão abaixo para entrar, cadastrar seu pet e gerar os documentos.</p>
    <p style="text-align:center;margin:28px 0">
      <a href="${link}" style="background:#f97316;color:#fff;text-decoration:none;font-weight:bold;padding:14px 28px;border-radius:14px;display:inline-block;font-size:16px">Acessar meu Kit do Pet</a>
    </p>
    <p style="font-size:13px;color:#6b7280;line-height:1.5">Este link é pessoal e vale por 30 dias. Depois disso, entre pelo site com este e-mail que enviamos um novo link.</p>
    <p style="font-size:12px;color:#9ca3af;margin-top:24px">Se o botão não funcionar, copie e cole no navegador:<br>${link}</p>
  </div></body></html>`;
  const text = `${first ? `Oi, ${first}!` : "Oi!"} Obrigado pela compra do Kit do Pet.\n\nAcesse aqui: ${link}\n\nEste link é pessoal e vale por 30 dias.`;
  return sendEmail(to, "Seu acesso ao Kit do Pet 🐾", html, text);
}
