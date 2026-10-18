import "server-only";
import { createClient } from "@supabase/supabase-js";
import { env } from "@/lib/env";

/**
 * Cliente com a service role: ignora RLS.
 * Use somente em código de servidor que já validou quem está pedindo
 * (webhook assinado, cron com segredo, admin autenticado, página pública filtrada).
 */
export function createAdminClient() {
  return createClient(env.supabaseUrl, env.supabaseServiceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
