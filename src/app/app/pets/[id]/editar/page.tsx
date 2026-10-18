import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PetForm } from "@/components/pet-form";
import { requireUser } from "@/lib/auth";
import { signedPhotoUrl } from "@/lib/storage";
import type { Pet } from "@/lib/types";
import { updatePet } from "../../actions";
import { DeletePetButton } from "./delete-pet-button";

export const metadata: Metadata = { title: "Editar pet" };

export default async function EditPetPage({ params }: PageProps<"/app/pets/[id]/editar">) {
  const { id } = await params;
  const { supabase, user } = await requireUser();
  const { data } = await supabase.from("pets").select("*").eq("id", id).maybeSingle();
  if (!data) notFound();
  const pet = data as Pet;
  const photoUrl = await signedPhotoUrl(pet.photo_path);

  return (
    <div className="flex flex-col gap-4">
      <Link href={`/app/pets/${pet.id}`} className="text-sm font-semibold text-gray-500">‹ Voltar</Link>
      <h1 className="text-2xl font-extrabold">Editar {pet.name}</h1>
      <p className="text-sm text-gray-600">Ao salvar, os documentos gerados a partir de agora já saem atualizados.</p>
      <PetForm action={updatePet.bind(null, pet.id)} userId={user.id} pet={pet} photoUrl={photoUrl} submitLabel="Salvar alterações" />
      <DeletePetButton petId={pet.id} petName={pet.name} />
    </div>
  );
}
