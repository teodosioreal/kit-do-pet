"use client";
import { useActionState } from "react";
import { PhotoCropper } from "@/components/photo-cropper";
import type { FormState } from "@/app/app/pets/actions";
import type { Pet } from "@/lib/types";
import { formatPhone } from "@/lib/phone";

type Props = {
  action: (prev: FormState, formData: FormData) => Promise<FormState>;
  userId: string;
  pet?: Pet;
  photoUrl?: string | null;
  defaults?: { tutor_name?: string | null; tutor_whatsapp?: string | null };
  submitLabel: string;
};

function Field({ label, name, error, children }: { label: string; name: string; error?: string; children: React.ReactNode }) {
  return (
    <div>
      <label htmlFor={name} className="label">{label}</label>
      {children}
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  );
}

export function PetForm({ action, userId, pet, photoUrl, defaults, submitLabel }: Props) {
  const [state, formAction, pending] = useActionState(action, {});
  const fe = state.fieldErrors ?? {};
  // valor inicial de cada campo: o que foi digitado (após erro) ou o salvo
  const v = (key: keyof Pet & string, fallback?: string | null) => state.values?.[key] ?? (pet?.[key] as string | null | undefined) ?? fallback ?? "";

  return (
    <form action={formAction} className="flex flex-col gap-5">
      <section className="card flex flex-col gap-4">
        <h2 className="text-lg font-bold">Foto</h2>
        <PhotoCropper userId={userId} initialUrl={photoUrl ?? null} initialPath={pet?.photo_path ?? null} />
      </section>

      <section className="card flex flex-col gap-4">
        <h2 className="text-lg font-bold">Dados do pet</h2>
        <Field label="Nome *" name="name" error={fe.name}>
          <input id="name" name="name" required maxLength={60} defaultValue={v("name")} className="input" />
        </Field>
        <Field label="Espécie *" name="species" error={fe.species}>
          <div className="grid grid-cols-2 gap-3">
            {[
              ["dog", "🐶 Cão"],
              ["cat", "🐱 Gato"],
            ].map(([value, label]) => (
              <label key={value} className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border-2 border-gray-200 p-3 font-semibold has-[:checked]:border-brand-500 has-[:checked]:bg-brand-50">
                <input type="radio" name="species" value={value} required defaultChecked={v("species") === value} className="sr-only" />
                {label}
              </label>
            ))}
          </div>
        </Field>
        <Field label="Raça" name="breed" error={fe.breed}>
          <input id="breed" name="breed" maxLength={60} defaultValue={v("breed")} className="input" placeholder="Ex.: SRD, Shih-tzu, Siamês" />
        </Field>
        <Field label="Sexo" name="sex" error={fe.sex}>
          <select id="sex" name="sex" defaultValue={v("sex")} className="input">
            <option value="">Não informar</option>
            <option value="male">Macho</option>
            <option value="female">Fêmea</option>
          </select>
        </Field>
        <Field label="Cor" name="color" error={fe.color}>
          <input id="color" name="color" maxLength={60} defaultValue={v("color")} className="input" placeholder="Ex.: Caramelo, tricolor" />
        </Field>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Data de nascimento" name="birth_date" error={fe.birth_date}>
            <input id="birth_date" name="birth_date" type="date" defaultValue={v("birth_date")} className="input" />
          </Field>
          <Field label="Local de nascimento" name="birth_place" error={fe.birth_place}>
            <input id="birth_place" name="birth_place" maxLength={80} defaultValue={v("birth_place")} className="input" placeholder="Cidade/UF" />
          </Field>
        </div>
        <Field label="Características" name="traits" error={fe.traits}>
          <textarea id="traits" name="traits" rows={3} maxLength={500} defaultValue={v("traits")} className="input" placeholder="Ex.: brincalhão, mancha branca no peito, adora petiscos" />
        </Field>
        <Field label="Observações" name="notes" error={fe.notes}>
          <textarea id="notes" name="notes" rows={3} maxLength={500} defaultValue={v("notes")} className="input" placeholder="Ex.: alergias, medicamentos, cuidados especiais" />
        </Field>
      </section>

      <section className="card flex flex-col gap-4">
        <h2 className="text-lg font-bold">Tutor</h2>
        <Field label="Nome do tutor" name="tutor_name" error={fe.tutor_name}>
          <input id="tutor_name" name="tutor_name" maxLength={80} defaultValue={v("tutor_name", defaults?.tutor_name)} className="input" />
        </Field>
        <Field label="WhatsApp do tutor" name="tutor_whatsapp" error={fe.tutor_whatsapp}>
          <input
            id="tutor_whatsapp"
            name="tutor_whatsapp"
            inputMode="tel"
            maxLength={30}
            defaultValue={state.values?.tutor_whatsapp ?? formatPhone(pet?.tutor_whatsapp ?? defaults?.tutor_whatsapp ?? "")}
            className="input"
            placeholder="(11) 99999-9999"
          />
          <p className="mt-1 text-xs text-gray-500">Usado no botão &quot;Falar com o tutor&quot; da página do QR code, se você permitir.</p>
        </Field>
      </section>

      {state.error && <p className="rounded-xl bg-red-50 p-3 text-sm text-red-700">{state.error}</p>}
      <button className="btn-primary sticky bottom-20 z-20 shadow-lg" disabled={pending}>
        {pending ? "Salvando..." : submitLabel}
      </button>
    </form>
  );
}
