"use server";
import { z } from "zod";
import { env } from "@/lib/env";
import { createClient } from "@/lib/supabase/server";

export type LoginState = { status: "idle" | "sent" | "error"; message?: string };

export async function sendMagicLink(_prev: LoginState, formData: FormData): Promise<LoginState> {
  const email = z.string().trim().toLowerCase().email().safeParse(formData.get("email"));
  if (!email.success) return { status: "error", message: "Digite um e-mail válido." };
  const next = String(formData.get("next") ?? "/app");

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithOtp({
    email: email.data,
    options: {
      // Só quem comprou tem conta: não criamos usuário pelo formulário de login.
      shouldCreateUser: false,
      emailRedirectTo: `${env.siteUrl}/auth/confirm?next=${encodeURIComponent(next)}`,
    },
  });

  if (error) {
    // Não revelamos se o e-mail existe ou não.
    if (error.status === 429) return { status: "error", message: "Muitas tentativas. Aguarde um minuto e tente de novo." };
  }
  return { status: "sent" };
}
