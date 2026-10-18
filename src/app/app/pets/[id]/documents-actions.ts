"use server";
import { requireUser } from "@/lib/auth";
import { getAccess } from "@/lib/entitlements";
import { getProfile } from "@/lib/profile";
import { DOC_SLUGS, DOC_TITLES, docFileName, renderPetDocument } from "@/lib/pdf/render";
import type { Pet } from "@/lib/types";
import { sendWhatsappDocument, sendWhatsappText } from "@/lib/whatsapp";

export async function sendDocumentsToWhatsapp(petId: string): Promise<{ ok: boolean; message: string }> {
  const { supabase, user } = await requireUser();
  const [access, profile, { data: pet }] = await Promise.all([
    getAccess(supabase, user.id),
    getProfile(supabase, user.id),
    supabase.from("pets").select("*").eq("id", petId).maybeSingle(),
  ]);
  if (!access.hasKit || !pet) return { ok: false, message: "Documentos indisponíveis." };
  if (!profile?.whatsapp || !profile.whatsapp_consent_at) {
    return { ok: false, message: "Cadastre seu WhatsApp e autorize as mensagens em Conta." };
  }

  const p = pet as Pet;
  await sendWhatsappText(profile.whatsapp, `Aqui estão os documentos do(a) ${p.name} 🐾`);
  for (const slug of DOC_SLUGS) {
    const pdf = await renderPetDocument(supabase, p, slug);
    const result = await sendWhatsappDocument(profile.whatsapp, pdf, docFileName(slug, p), DOC_TITLES[slug]);
    if (!result.ok) return { ok: false, message: "Não conseguimos enviar agora. Tente de novo em alguns minutos ou baixe os PDFs aqui." };
  }
  return { ok: true, message: "Pronto! Os documentos foram enviados para o seu WhatsApp." };
}
