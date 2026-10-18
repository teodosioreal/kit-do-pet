import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { ageLabel, formatDateBR } from "@/lib/dates";
import { getAccess } from "@/lib/entitlements";
import { getProfile } from "@/lib/profile";
import { SPECIES_LABEL } from "@/lib/products";
import { publicPetUrl, qrDataUrl } from "@/lib/qr";
import { signedPhotoUrl } from "@/lib/storage";
import type { HealthRecord, Pet } from "@/lib/types";
import { SEX_LABEL } from "@/lib/types";
import { DocumentsPanel } from "./documents-panel";
import { HealthRecords } from "./health-records";
import { PublicFieldsForm } from "./public-fields-form";

export const metadata: Metadata = { title: "Pet" };

export default async function PetPage({ params, searchParams }: PageProps<"/app/pets/[id]">) {
  const { id } = await params;
  const { novo } = await searchParams;
  const { supabase, user } = await requireUser();
  const [{ data }, { data: records }, access, profile] = await Promise.all([
    supabase.from("pets").select("*").eq("id", id).maybeSingle(),
    supabase.from("health_records").select("*").eq("pet_id", id).order("applied_on", { ascending: false, nullsFirst: false }),
    getAccess(supabase, user.id),
    getProfile(supabase, user.id),
  ]);
  if (!data) notFound();
  const pet = data as Pet;
  const [photoUrl, qr] = await Promise.all([signedPhotoUrl(pet.photo_path), qrDataUrl(publicPetUrl(pet.public_code))]);
  const publicUrl = publicPetUrl(pet.public_code);

  return (
    <div className="flex flex-col gap-5">
      <Link href="/app" className="text-sm font-semibold text-gray-500">‹ Meus pets</Link>

      {novo && (
        <p className="rounded-2xl bg-mint-100 p-4 text-sm font-semibold text-green-800">
          🎉 Cadastro de {pet.name} concluído! Agora é só gerar os documentos abaixo.
        </p>
      )}

      <section className="card flex items-center gap-4">
        <div className="flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-3xl bg-brand-50">
          {photoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={photoUrl} alt={pet.name} className="h-full w-full object-cover" />
          ) : (
            <span className="text-5xl">{pet.species === "cat" ? "🐱" : "🐶"}</span>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <h1 className="truncate text-2xl font-extrabold">{pet.name}</h1>
          <p className="text-sm text-gray-600">
            {SPECIES_LABEL[pet.species]}
            {pet.breed ? ` · ${pet.breed}` : ""}
            {pet.sex ? ` · ${SEX_LABEL[pet.sex]}` : ""}
          </p>
          {pet.birth_date && (
            <p className="text-sm text-gray-600">Nasceu em {formatDateBR(pet.birth_date)} ({ageLabel(pet.birth_date)})</p>
          )}
          <p className="mt-1 text-xs font-semibold text-gray-400">Registro {pet.registry_number}</p>
        </div>
      </section>
      <Link href={`/app/pets/${pet.id}/editar`} className="btn-secondary">✏️ Editar dados</Link>

      <DocumentsPanel
        petId={pet.id}
        rgColor={pet.rg_color}
        hasKit={access.hasKit}
        hasWhatsapp={!!(profile?.whatsapp && profile.whatsapp_consent_at)}
      />

      <section className="card flex flex-col gap-4">
        <h2 className="text-lg font-bold">Página do QR code</h2>
        <p className="text-sm text-gray-600">
          Quem escanear o QR code (no RG ou numa plaquinha na coleira) vê a página de {pet.name} e consegue falar com você.
        </p>
        <div className="flex items-center gap-4">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={qr} alt="QR code da página do pet" className="h-28 w-28 rounded-xl ring-1 ring-black/10" />
          <div className="flex min-w-0 flex-col gap-2">
            <a href={publicUrl} target="_blank" className="truncate text-sm font-semibold text-brand-600 underline">{publicUrl.replace(/^https?:\/\//, "")}</a>
            <a href={qr} download={`qrcode-${pet.name}.png`} className="btn-secondary px-3 py-2 text-sm">Baixar QR code</a>
          </div>
        </div>
        <PublicFieldsForm petId={pet.id} fields={pet.public_fields} />
      </section>

      <HealthRecords petId={pet.id} records={(records ?? []) as HealthRecord[]} />
    </div>
  );
}
