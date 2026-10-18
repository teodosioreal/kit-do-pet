"use client";
import { useActionState, useEffect, useRef, useTransition } from "react";
import { addHealthRecord, deleteHealthRecord, type FormState } from "../actions";
import { formatDateBR } from "@/lib/dates";
import { HEALTH_KIND_LABEL, type HealthKind, type HealthRecord } from "@/lib/types";

const KIND_ICON: Record<HealthKind, string> = { vaccine: "💉", dewormer: "💊", antiflea: "🛡️" };

export function HealthRecords({ petId, records }: { petId: string; records: HealthRecord[] }) {
  const [state, action, pending] = useActionState<FormState, FormData>(addHealthRecord.bind(null, petId), {});
  const formRef = useRef<HTMLFormElement>(null);
  const [deleting, startDelete] = useTransition();

  useEffect(() => {
    if (!pending && !state.error && !state.fieldErrors) formRef.current?.reset();
  }, [state, pending]);

  return (
    <section className="card flex flex-col gap-4">
      <h2 className="text-lg font-bold">Vacinas e vermífugos</h2>
      {records.length === 0 && <p className="text-sm text-gray-600">Nenhum registro ainda.</p>}
      <ul className="flex flex-col divide-y divide-gray-100">
        {records.map((r) => (
          <li key={r.id} className="flex items-start gap-3 py-3">
            <span className="text-2xl">{KIND_ICON[r.kind]}</span>
            <div className="min-w-0 flex-1">
              <p className="font-semibold">{r.name} <span className="text-xs font-normal text-gray-500">({HEALTH_KIND_LABEL[r.kind]})</span></p>
              <p className="text-sm text-gray-600">
                {r.applied_on ? `Aplicada em ${formatDateBR(r.applied_on)}` : "Sem data de aplicação"}
                {r.next_due_on ? ` · Próxima: ${formatDateBR(r.next_due_on)}` : ""}
              </p>
            </div>
            <button
              type="button"
              aria-label="Excluir registro"
              disabled={deleting}
              className="text-sm text-gray-400 hover:text-red-600"
              onClick={() => confirm("Excluir este registro?") && startDelete(() => deleteHealthRecord(petId, r.id))}
            >
              ✕
            </button>
          </li>
        ))}
      </ul>

      <details className="rounded-2xl bg-gray-50 p-4">
        <summary className="cursor-pointer font-semibold">+ Adicionar registro</summary>
        <form ref={formRef} action={action} className="mt-3 flex flex-col gap-3">
          <div>
            <label className="label" htmlFor="kind">Tipo</label>
            <select id="kind" name="kind" className="input" defaultValue="vaccine">
              <option value="vaccine">Vacina</option>
              <option value="dewormer">Vermífugo</option>
              <option value="antiflea">Antipulgas</option>
            </select>
          </div>
          <div>
            <label className="label" htmlFor="hr-name">Nome</label>
            <input id="hr-name" name="name" required maxLength={80} className="input" placeholder="Ex.: V10, Antirrábica, Drontal" />
            {state.fieldErrors?.name && <p className="mt-1 text-sm text-red-600">{state.fieldErrors.name}</p>}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label" htmlFor="applied_on">Aplicada em</label>
              <input id="applied_on" name="applied_on" type="date" className="input" />
            </div>
            <div>
              <label className="label" htmlFor="next_due_on">Próxima dose</label>
              <input id="next_due_on" name="next_due_on" type="date" className="input" />
            </div>
          </div>
          {state.error && <p className="text-sm text-red-600">{state.error}</p>}
          <button className="btn-primary" disabled={pending}>{pending ? "Salvando..." : "Adicionar"}</button>
        </form>
      </details>
    </section>
  );
}
