// Leitura centralizada das variáveis de ambiente do servidor.
// Nunca importe este arquivo em componentes "use client".
import "server-only";

function required(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`Variável de ambiente ausente: ${name}`);
  return value;
}

function optional(name: string): string | undefined {
  const value = process.env[name];
  return value ? value : undefined;
}

export const env = {
  get siteUrl() {
    return (optional("NEXT_PUBLIC_SITE_URL") ?? "http://localhost:3000").replace(/\/$/, "");
  },
  get supabaseUrl() {
    return required("NEXT_PUBLIC_SUPABASE_URL");
  },
  get supabaseAnonKey() {
    return required("NEXT_PUBLIC_SUPABASE_ANON_KEY");
  },
  get supabaseServiceRoleKey() {
    return required("SUPABASE_SERVICE_ROLE_KEY");
  },
  /** Segredo usado para assinar links de acesso e hashes de IP. */
  get appSecret() {
    return required("APP_SECRET");
  },
  get adminEmails() {
    return (optional("ADMIN_EMAILS") ?? "")
      .split(",")
      .map((e) => e.trim().toLowerCase())
      .filter(Boolean);
  },
  get resendApiKey() {
    return optional("RESEND_API_KEY");
  },
  get emailFrom() {
    return optional("EMAIL_FROM") ?? "Kit do Pet <onboarding@resend.dev>";
  },
  get evolution() {
    const url = optional("EVOLUTION_API_URL");
    const apiKey = optional("EVOLUTION_API_KEY");
    const instance = optional("EVOLUTION_INSTANCE");
    return url && apiKey && instance ? { url: url.replace(/\/$/, ""), apiKey, instance } : undefined;
  },
  get kiwifyWebhookToken() {
    return optional("KIWIFY_WEBHOOK_TOKEN");
  },
  get cronSecret() {
    return optional("CRON_SECRET");
  },
  get renewalUrl() {
    return optional("RENEWAL_CHECKOUT_URL");
  },
};
