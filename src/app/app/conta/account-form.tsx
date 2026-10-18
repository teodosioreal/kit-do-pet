"use client";
import { useActionState } from "react";
import { updateAccount, type AccountState } from "./actions";
import { formatPhone } from "@/lib/phone";
import type { Profile } from "@/lib/types";

export function AccountForm({ profile, remindersUntil }: { profile: Profile; remindersUntil: string | null }) {
  const [state, action, pending] = useActionState<AccountState, FormData>(updateAccount, {});
  return (
    <form action={action} className="flex flex-col gap-5">
      <section className="card flex flex-col gap-4">
        <h2 className="text-lg font-bold">Seus dados</h2>
        <div>
          <span className="label">E-mail</span>
          <p className="text-gray-700">{profile.email}</p>
        </div>
        <div>
          <label className="label" htmlFor="full_name">Nome</label>
          <input id="full_name" name="full_name" defaultValue={profile.full_name ?? ""} maxLength={80} className="input" />
        </div>
        <div>
          <label className="label" htmlFor="whatsapp">WhatsApp</label>
          <input id="whatsapp" name="whatsapp" inputMode="tel" defaultValue={formatPhone(profile.whatsapp)} className="input" placeholder="(11) 99999-9999" />
        </div>
        <label className="flex items-start gap-3 text-sm">
          <input type="checkbox" name="whatsapp_consent" defaultChecked={!!profile.whatsapp_consent_at} className="mt-0.5 h-5 w-5 accent-brand-500" />
          <span>Aceito receber mensagens do Kit do Pet no WhatsApp. Desmarque para parar de receber.</span>
        </label>
      </section>

      <section className="card flex flex-col gap-4">
        <h2 className="text-lg font-bold">Lembretes no WhatsApp</h2>
        {remindersUntil ? (
          <>
            <p className="text-sm text-gray-600">Seu plano de lembretes vale até <strong>{remindersUntil}</strong>. Avisamos 3 dias antes e no dia de cada próxima dose cadastrada.</p>
            <label className="flex items-center gap-3">
              <input type="checkbox" name="reminders_enabled" defaultChecked={profile.reminders_enabled} className="h-5 w-5 accent-brand-500" />
              <span className="font-semibold">Lembretes ativados</span>
            </label>
            <div>
              <label className="label" htmlFor="reminders_whatsapp">Número que recebe os lembretes</label>
              <input id="reminders_whatsapp" name="reminders_whatsapp" inputMode="tel" defaultValue={formatPhone(profile.reminders_whatsapp)} className="input" placeholder="Deixe em branco para usar o WhatsApp acima" />
            </div>
          </>
        ) : (
          <>
            <input type="hidden" name="reminders_enabled" value={profile.reminders_enabled ? "on" : ""} />
            <p className="text-sm text-gray-600">Você não tem o plano de lembretes ativo.</p>
          </>
        )}
      </section>

      {state.error && <p className="rounded-xl bg-red-50 p-3 text-sm text-red-700">{state.error}</p>}
      {state.ok && <p className="rounded-xl bg-mint-100 p-3 text-sm text-green-800">{state.ok}</p>}
      <button className="btn-primary" disabled={pending}>{pending ? "Salvando..." : "Salvar"}</button>
    </form>
  );
}
