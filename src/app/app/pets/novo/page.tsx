import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { PetForm } from "@/components/pet-form";
import { requireUser } from "@/lib/auth";
import { getAccess } from "@/lib/entitlements";
import { getProfile } from "@/lib/profile";
import { createPet } from "../actions";

export const metadata: Metadata = { title: "Cadastrar pet" };

export default async function NewPetPage() {
  const { supabase, user } = await requireUser();
  const [access, { count }, profile] = await Promise.all([
    getAccess(supabase, user.id),
    supabase.from("pets").select("id", { count: "exact", head: true }),
    getProfile(supabase, user.id),
  ]);
  if ((count ?? 0) >= access.petLimit) redirect("/app");

  return (
    <div className="flex flex-col gap-4">
      <Link href="/app" className="text-sm font-semibold text-gray-500">‹ Voltar</Link>
      <h1 className="text-2xl font-extrabold">Cadastrar pet</h1>
      <PetForm
        action={createPet}
        userId={user.id}
        defaults={{ tutor_name: profile?.full_name, tutor_whatsapp: profile?.whatsapp }}
        submitLabel="Salvar pet"
      />
    </div>
  );
}
