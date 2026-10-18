import "server-only";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { env } from "@/lib/env";

export function isAdminEmail(email: string | null | undefined) {
  return !!email && env.adminEmails.includes(email.toLowerCase());
}

/** Usuário logado (validado no servidor do Supabase) ou null. */
export async function getUser() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  return { supabase, user: data.user };
}

export async function requireUser(next = "/app") {
  const { supabase, user } = await getUser();
  if (!user) redirect(`/entrar?next=${encodeURIComponent(next)}`);
  return { supabase, user };
}

export async function requireAdmin() {
  const { supabase, user } = await requireUser("/admin");
  if (!isAdminEmail(user.email)) redirect("/app");
  return { supabase, user };
}
