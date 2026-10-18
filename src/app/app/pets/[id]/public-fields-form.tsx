import { updatePublicFields } from "../actions";
import { PUBLIC_FIELD_LABELS, type PublicFields } from "@/lib/types";

export function PublicFieldsForm({ petId, fields }: { petId: string; fields: PublicFields }) {
  return (
    <details className="rounded-2xl bg-gray-50 p-4">
      <summary className="cursor-pointer font-semibold">O que aparece na página pública</summary>
      <form action={updatePublicFields.bind(null, petId)} className="mt-3 flex flex-col gap-2">
        <p className="text-xs text-gray-500">O nome do pet sempre aparece. Escolha o resto:</p>
        {(Object.keys(PUBLIC_FIELD_LABELS) as (keyof PublicFields)[]).map((key) => (
          <label key={key} className="flex items-center gap-3 py-1">
            <input type="checkbox" name={key} defaultChecked={fields[key]} className="h-5 w-5 accent-brand-500" />
            <span>{PUBLIC_FIELD_LABELS[key]}</span>
          </label>
        ))}
        <button className="btn-primary mt-2">Salvar preferências</button>
      </form>
    </details>
  );
}
