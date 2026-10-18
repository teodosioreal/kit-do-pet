"use client";
import { useActionState } from "react";
import Link from "next/link";
import { acceptTerms } from "./actions";
import { formatPhone } from "@/lib/phone";

export function WelcomeForm({ name, whatsapp }: { name: string; whatsapp: string }) {
  const [state, action, pending] = useActionState(acceptTerms, {});
  return (
    <form action={action} className="card flex flex-col gap-4">
      <div>
        <label htmlFor="full_name" className="label">Seu nome</label>
        <input id="full_name" name="full_name" defaultValue={name} maxLength={80} className="input" />
      </div>
      <div>
        <label htmlFor="whatsapp" className="label">Seu WhatsApp</label>
        <input id="whatsapp" name="whatsapp" inputMode="tel" defaultValue={formatPhone(whatsapp)} className="input" placeholder="(11) 99999-9999" />
      </div>
      <label className="flex items-start gap-3 text-sm">
        <input type="checkbox" name="whatsapp_consent" defaultChecked className="mt-0.5 h-5 w-5 accent-brand-500" />
        <span>Aceito receber mensagens do Kit do Pet no WhatsApp (acesso, documentos, avisos do QR code e lembretes, se contratados). Posso cancelar quando quiser.</span>
      </label>
      <label className="flex items-start gap-3 text-sm">
        <input type="checkbox" name="terms" required className="mt-0.5 h-5 w-5 accent-brand-500" />
        <span>
          Li e aceito os <Link href="/termos" target="_blank" className="font-semibold text-brand-600 underline">termos de uso</Link> e a{" "}
          <Link href="/privacidade" target="_blank" className="font-semibold text-brand-600 underline">política de privacidade</Link>.
        </span>
      </label>
      {state.error && <p className="text-sm text-red-600">{state.error}</p>}
      <button className="btn-primary" disabled={pending}>{pending ? "Salvando..." : "Começar"}</button>
    </form>
  );
}
