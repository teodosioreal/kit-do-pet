"use server";
import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/auth";
import { normalizePhone } from "@/lib/phone";

export type AccountState = { error?: string; ok?: string };

export async function updateAccount(_prev: AccountState, formData: FormData): Promise<AccountState> {
  const { supabase, user } = await requireUser();
  const { data: current } = await supabase.from("profiles").select("whatsapp_consent_at").eq("id", user.id).single();

  const fullName = String(formData.get("full_name") ?? "").trim().slice(0, 80) || null;
  const rawPhone = String(formData.get("whatsapp") ?? "").trim();
  const whatsapp = rawPhone ? normalizePhone(rawPhone) : null;
  if (rawPhone && !whatsapp) return { error: "WhatsApp inválido. Use DDD + número." };

  const rawReminderPhone = String(formData.get("reminders_whatsapp") ?? "").trim();
  const remindersWhatsapp = rawReminderPhone ? normalizePhone(rawReminderPhone) : null;
  if (rawReminderPhone && !remindersWhatsapp) return { error: "Número dos lembretes inválido." };

  const consent = formData.get("whatsapp_consent") === "on" && !!whatsapp;
  const { error } = await supabase
    .from("profiles")
    .update({
      full_name: fullName,
      whatsapp,
      whatsapp_consent_at: consent ? (current?.whatsapp_consent_at ?? new Date().toISOString()) : null,
      reminders_enabled: formData.get("reminders_enabled") === "on",
      reminders_whatsapp: remindersWhatsapp,
    })
    .eq("id", user.id);
  if (error) return { error: "Não foi possível salvar." };
  revalidatePath("/app", "layout");
  return { ok: "Dados salvos!" };
}
