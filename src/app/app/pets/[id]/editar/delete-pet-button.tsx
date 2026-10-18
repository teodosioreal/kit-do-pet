"use client";
import { useTransition } from "react";
import { deletePet } from "../../actions";

export function DeletePetButton({ petId, petName }: { petId: string; petName: string }) {
  const [pending, start] = useTransition();
  return (
    <button
      type="button"
      disabled={pending}
      className="mt-4 text-sm font-semibold text-red-600"
      onClick={() => {
        if (confirm(`Excluir ${petName}? Os dados, as vacinas e a página do QR code serão apagados. Essa vaga de pet volta a ficar livre.`)) {
          start(() => deletePet(petId));
        }
      }}
    >
      {pending ? "Excluindo..." : "Excluir pet"}
    </button>
  );
}
