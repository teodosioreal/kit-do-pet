import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";
import type { Pet } from "@/lib/types";

/** Busca o pet pelo código público e verifica se o dono tem o kit ativo. */
export async function getPublicPet(code: string) {
  if (!/^[a-z0-9]{6,16}$/.test(code)) return null;
  const admin = createAdminClient();
  const { data } = await admin.from("pets").select("*").eq("public_code", code).maybeSingle();
  if (!data) return null;
  const pet = data as Pet;
  const { data: active } = await admin.rpc("has_entitlement", { uid: pet.user_id, p: "kit" });
  return { pet, active: active === true };
}

/** Número que recebe o aviso: WhatsApp do tutor no pet, ou o WhatsApp da conta. */
export async function ownerContactNumber(pet: Pet) {
  if (pet.tutor_whatsapp) return pet.tutor_whatsapp;
  const { data } = await createAdminClient().from("profiles").select("whatsapp").eq("id", pet.user_id).maybeSingle();
  return (data?.whatsapp as string | null) ?? null;
}
