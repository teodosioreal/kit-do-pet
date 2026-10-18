import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ageLabel, formatDateBR } from "@/lib/dates";
import { whatsappLink } from "@/lib/phone";
import { SPECIES_LABEL } from "@/lib/products";
import { getPublicPet } from "@/lib/public-pet";
import { signedPhotoUrl } from "@/lib/storage";
import { SEX_LABEL } from "@/lib/types";
import { FoundButton } from "./found-button";

export async function generateMetadata({ params }: PageProps<"/p/[code]">): Promise<Metadata> {
  const { code } = await params;
  const result = await getPublicPet(code);
  return {
    title: result?.active ? `${result.pet.name} 🐾` : "Pet",
    robots: { index: false, follow: false },
  };
}

export default async function PublicPetPage({ params }: PageProps<"/p/[code]">) {
  const { code } = await params;
  const result = await getPublicPet(code);
  if (!result) notFound();
  const { pet, active } = result;

  if (!active) {
    return (
      <main className="mx-auto flex w-full max-w-md flex-1 flex-col items-center justify-center gap-3 px-6 py-16 text-center">
        <div className="text-5xl">🐾</div>
        <h1 className="text-xl font-bold">Esta página não está disponível no momento.</h1>
      </main>
    );
  }

  const show = pet.public_fields;
  const photo = show.photo ? await signedPhotoUrl(pet.photo_path) : null;
  const contact = show.contact && pet.tutor_whatsapp
    ? whatsappLink(pet.tutor_whatsapp, `Olá! Estou com o(a) ${pet.name}. Vi a página do QR code.`)
    : null;

  const facts: [string, string | null][] = [
    ["Espécie", show.species ? SPECIES_LABEL[pet.species] : null],
    ["Raça", show.breed ? pet.breed : null],
    ["Sexo", show.sex && pet.sex ? SEX_LABEL[pet.sex] : null],
    ["Cor", show.color ? pet.color : null],
    ["Nascimento", show.birth_date && pet.birth_date ? `${formatDateBR(pet.birth_date)} (${ageLabel(pet.birth_date)})` : null],
    ["Tutor(a)", show.tutor_name ? pet.tutor_name : null],
  ];

  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col gap-5 px-5 py-8">
      <div className="flex flex-col items-center text-center">
        <div className="flex h-44 w-44 items-center justify-center overflow-hidden rounded-[2.5rem] bg-brand-100 ring-4 ring-brand-400">
          {photo ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={photo} alt={pet.name} className="h-full w-full object-cover" />
          ) : (
            <span className="text-7xl">{pet.species === "cat" ? "🐱" : "🐶"}</span>
          )}
        </div>
        <p className="mt-4 text-sm font-bold uppercase tracking-widest text-brand-600">Olá, eu sou</p>
        <h1 className="text-4xl font-extrabold">{pet.name}</h1>
        <p className="mt-2 text-gray-600">Se você me encontrou, por favor avise meu tutor. 💛</p>
      </div>

      <div className="flex flex-col gap-3">
        {contact && (
          <a href={contact} className="btn-whatsapp py-4 text-lg">💬 Falar com o tutor</a>
        )}
        <FoundButton code={pet.public_code} petName={pet.name} />
      </div>

      {facts.some(([, v]) => v) && (
        <section className="card grid grid-cols-2 gap-4">
          {facts.filter(([, v]) => v).map(([label, value]) => (
            <div key={label}>
              <p className="text-xs font-bold uppercase text-gray-500">{label}</p>
              <p className="font-semibold">{value}</p>
            </div>
          ))}
        </section>
      )}
      {show.traits && pet.traits && (
        <section className="card">
          <p className="text-xs font-bold uppercase text-gray-500">Características</p>
          <p className="mt-1 whitespace-pre-line">{pet.traits}</p>
        </section>
      )}
      {show.notes && pet.notes && (
        <section className="card">
          <p className="text-xs font-bold uppercase text-gray-500">Observações</p>
          <p className="mt-1 whitespace-pre-line">{pet.notes}</p>
        </section>
      )}

      <p className="mt-4 text-center text-xs text-gray-400">
        Identificação por QR code · <Link href="/" className="underline">Kit do Pet</Link>
      </p>
    </main>
  );
}
