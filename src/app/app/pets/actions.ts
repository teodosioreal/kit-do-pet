"use server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { requireUser } from "@/lib/auth";
import { normalizePhone } from "@/lib/phone";
import { PET_PHOTOS_BUCKET } from "@/lib/storage";
import type { PublicFields } from "@/lib/types";
import { PUBLIC_FIELD_LABELS } from "@/lib/types";

/** Em caso de erro devolvemos os valores digitados (o React limpa o formulário após a ação). */
export type FormState = { error?: string; fieldErrors?: Record<string, string>; values?: Record<string, string> };

const optionalText = (max: number) =>
  z.string().trim().max(max).transform((v) => (v === "" ? null : v));

const petSchema = z.object({
  name: z.string().trim().min(1, "Informe o nome").max(60),
  species: z.enum(["dog", "cat"], { message: "Escolha a espécie" }),
  breed: optionalText(60),
  sex: z.enum(["male", "female", ""]).transform((v) => (v === "" ? null : v)),
  color: optionalText(60),
  birth_date: z
    .string()
    .trim()
    .refine((v) => v === "" || /^\d{4}-\d{2}-\d{2}$/.test(v), "Data inválida")
    .transform((v) => (v === "" ? null : v)),
  birth_place: optionalText(80),
  traits: optionalText(500),
  notes: optionalText(500),
  tutor_name: optionalText(80),
  tutor_whatsapp: z.string().trim().max(30),
  photo_path: optionalText(300),
});

function readPetForm(formData: FormData) {
  const raw: Record<string, string> = Object.fromEntries(
    ["name", "species", "breed", "sex", "color", "birth_date", "birth_place", "traits", "notes", "tutor_name", "tutor_whatsapp", "photo_path"].map(
      (k) => [k, String(formData.get(k) ?? "")],
    ),
  );
  return { raw, parsed: petSchema.safeParse(raw) };
}

export async function createPet(_prev: FormState, formData: FormData): Promise<FormState> {
  const { supabase, user } = await requireUser();
  const { raw, parsed } = readPetForm(formData);
  if (!parsed.success) return { fieldErrors: flatten(parsed.error), values: raw };
  const data = parsed.data;

  const tutorWhatsapp = data.tutor_whatsapp ? normalizePhone(data.tutor_whatsapp) : null;
  if (data.tutor_whatsapp && !tutorWhatsapp) return { fieldErrors: { tutor_whatsapp: "WhatsApp inválido. Use DDD + número." }, values: raw };
  if (data.photo_path && !data.photo_path.startsWith(`${user.id}/`)) return { error: "Foto inválida." };

  const { data: pet, error } = await supabase
    .from("pets")
    .insert({ ...data, tutor_whatsapp: tutorWhatsapp, user_id: user.id })
    .select("id")
    .single();

  if (error) {
    if (error.message.includes("PET_LIMIT_REACHED")) return { error: "Você atingiu o limite de pets da sua conta.", values: raw };
    console.error("[pets] erro ao criar", error.message);
    return { error: "Não foi possível salvar. Tente de novo.", values: raw };
  }
  revalidatePath("/app");
  redirect(`/app/pets/${pet.id}?novo=1`);
}

export async function updatePet(petId: string, _prev: FormState, formData: FormData): Promise<FormState> {
  const { supabase, user } = await requireUser();
  const { raw, parsed } = readPetForm(formData);
  if (!parsed.success) return { fieldErrors: flatten(parsed.error), values: raw };
  const data = parsed.data;

  const tutorWhatsapp = data.tutor_whatsapp ? normalizePhone(data.tutor_whatsapp) : null;
  if (data.tutor_whatsapp && !tutorWhatsapp) return { fieldErrors: { tutor_whatsapp: "WhatsApp inválido. Use DDD + número." }, values: raw };
  if (data.photo_path && !data.photo_path.startsWith(`${user.id}/`)) return { error: "Foto inválida." };

  const { data: current } = await supabase.from("pets").select("photo_path").eq("id", petId).single();
  if (!current) return { error: "Pet não encontrado." };

  const { error } = await supabase
    .from("pets")
    .update({ ...data, tutor_whatsapp: tutorWhatsapp })
    .eq("id", petId);
  if (error) {
    console.error("[pets] erro ao atualizar", error.message);
    return { error: "Não foi possível salvar. Tente de novo.", values: raw };
  }

  if (current.photo_path && current.photo_path !== data.photo_path) {
    await supabase.storage.from(PET_PHOTOS_BUCKET).remove([current.photo_path]);
  }
  revalidatePath("/app");
  redirect(`/app/pets/${petId}`);
}

export async function deletePet(petId: string) {
  const { supabase } = await requireUser();
  const { data: pet } = await supabase.from("pets").select("photo_path").eq("id", petId).single();
  await supabase.from("pets").delete().eq("id", petId);
  if (pet?.photo_path) await supabase.storage.from(PET_PHOTOS_BUCKET).remove([pet.photo_path]);
  revalidatePath("/app");
  redirect("/app");
}

const healthSchema = z.object({
  kind: z.enum(["vaccine", "dewormer", "antiflea"]),
  name: z.string().trim().min(1, "Informe o nome").max(80),
  applied_on: z.string().trim().transform((v) => (v === "" ? null : v)),
  next_due_on: z.string().trim().transform((v) => (v === "" ? null : v)),
  notes: optionalText(200),
});

export async function addHealthRecord(petId: string, _prev: FormState, formData: FormData): Promise<FormState> {
  const { supabase } = await requireUser();
  const parsed = healthSchema.safeParse({
    kind: formData.get("kind"),
    name: formData.get("name"),
    applied_on: String(formData.get("applied_on") ?? ""),
    next_due_on: String(formData.get("next_due_on") ?? ""),
    notes: String(formData.get("notes") ?? ""),
  });
  if (!parsed.success) return { fieldErrors: flatten(parsed.error) };
  const { error } = await supabase.from("health_records").insert({ ...parsed.data, pet_id: petId });
  if (error) return { error: "Não foi possível salvar o registro." };
  revalidatePath(`/app/pets/${petId}`);
  return {};
}

export async function deleteHealthRecord(petId: string, recordId: string) {
  const { supabase } = await requireUser();
  await supabase.from("health_records").delete().eq("id", recordId);
  revalidatePath(`/app/pets/${petId}`);
}

export async function updatePublicFields(petId: string, formData: FormData) {
  const { supabase } = await requireUser();
  const fields = Object.fromEntries(
    (Object.keys(PUBLIC_FIELD_LABELS) as (keyof PublicFields)[]).map((k) => [k, formData.get(k) === "on"]),
  ) as PublicFields;
  await supabase.from("pets").update({ public_fields: fields }).eq("id", petId);
  revalidatePath(`/app/pets/${petId}`);
}

export async function updateRgColor(petId: string, color: string) {
  const { supabase } = await requireUser();
  if (!["green", "blue", "pink"].includes(color)) return;
  await supabase.from("pets").update({ rg_color: color }).eq("id", petId);
  revalidatePath(`/app/pets/${petId}`);
}

function flatten(error: z.ZodError) {
  const out: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = String(issue.path[0] ?? "form");
    out[key] ??= issue.message;
  }
  return out;
}
