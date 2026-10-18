import type { Metadata } from "next";
import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { getAccess } from "@/lib/entitlements";
import { publicEnv } from "@/lib/public-env";
import { signedPhotoUrls } from "@/lib/storage";
import { SPECIES_LABEL } from "@/lib/products";
import type { Pet } from "@/lib/types";

export const metadata: Metadata = { title: "Meus pets" };

export default async function AppHome() {
  const { supabase, user } = await requireUser();
  const [{ data }, access] = await Promise.all([
    supabase.from("pets").select("*").order("created_at"),
    getAccess(supabase, user.id),
  ]);
  const pets = (data ?? []) as Pet[];
  const photos = await signedPhotoUrls(pets.map((p) => p.photo_path));
  const canAdd = pets.length < access.petLimit;

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="text-2xl font-extrabold">Meus pets</h1>
        <p className="text-sm text-gray-600">
          {access.petLimit > 0
            ? `${pets.length} de ${access.petLimit} ${access.petLimit === 1 ? "pet cadastrado" : "pets cadastrados"}`
            : "Sua conta ainda não tem um kit ativo."}
        </p>
      </div>

      {pets.length === 0 && access.petLimit > 0 && (
        <div className="card text-center">
          <div className="text-5xl">🐾</div>
          <p className="mt-2 font-semibold">Vamos cadastrar seu primeiro pet?</p>
          <p className="text-sm text-gray-600">Com os dados dele, os documentos e a página do QR code ficam prontos na hora.</p>
        </div>
      )}

      <ul className="flex flex-col gap-3">
        {pets.map((pet) => {
          const photo = pet.photo_path ? photos.get(pet.photo_path) : null;
          return (
            <li key={pet.id}>
              <Link href={`/app/pets/${pet.id}`} className="card flex items-center gap-4 transition hover:ring-brand-200">
                <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-brand-50">
                  {photo ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={photo} alt={pet.name} className="h-full w-full object-cover" />
                  ) : (
                    <span className="text-3xl">{pet.species === "cat" ? "🐱" : "🐶"}</span>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-lg font-bold">{pet.name}</p>
                  <p className="truncate text-sm text-gray-600">
                    {SPECIES_LABEL[pet.species]}{pet.breed ? ` · ${pet.breed}` : ""}
                  </p>
                </div>
                <span className="text-gray-400">›</span>
              </Link>
            </li>
          );
        })}
      </ul>

      {canAdd ? (
        <Link href="/app/pets/novo" className="btn-primary">+ Cadastrar pet</Link>
      ) : access.petLimit > 0 ? (
        <div className="card flex flex-col gap-3 text-center">
          <p className="font-semibold">Você usou todos os cadastros de pet da sua conta.</p>
          {publicEnv.extraPetCheckoutUrl ? (
            <a href={publicEnv.extraPetCheckoutUrl} className="btn-primary">Comprar mais um pet</a>
          ) : null}
        </div>
      ) : (
        <div className="card flex flex-col gap-3 text-center">
          <p>Se você já comprou, use o link que enviamos por e-mail e WhatsApp, ou fale com o suporte.</p>
          {publicEnv.checkoutUrl && <a href={publicEnv.checkoutUrl} className="btn-primary">Quero o Kit do Pet</a>}
        </div>
      )}
    </div>
  );
}
