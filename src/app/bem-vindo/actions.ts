"use server";
import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { normalizePhone } from "@/lib/phone";

export async function acceptTerms(_prev: { error?: string }, formData: FormData): Promise<{ error?: string }> {
  const { supabase, user } = await requireUser();
  if (formData.get("terms") !== "on") return { error: "Para continuar, aceite os termos de uso e a política de privacidade." };

  const fullName = String(formData.get("full_name") ?? "").trim().slice(0, 80) || null;
  const rawPhone = String(formData.get("whatsapp") ?? "").trim();
  const whatsapp = rawPhone ? normalizePhone(rawPhone) : null;
  if (rawPhone && !whatsapp) return { error: "WhatsApp inválido. Use DDD + número." };
  const consent = formData.get("whatsapp_consent") === "on" && !!whatsapp;
  const now = new Date().toISOString();

  const { error } = await supabase
    .from("profiles")
    .update({
      full_name: fullName,
      whatsapp,
      terms_accepted_at: now,
      whatsapp_consent_at: consent ? now : null,
    })
    .eq("id", user.id);
  if (error) return { error: "Não foi possível salvar. Tente de novo." };
  redirect("/app");
}
