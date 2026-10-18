"use client";
import Link from "next/link";
import { useState, useTransition } from "react";
import { updateRgColor } from "../actions";
import { sendDocumentsToWhatsapp } from "./documents-actions";
import type { RgColor } from "@/lib/types";

const COLORS: { value: RgColor; label: string; className: string }[] = [
  { value: "green", label: "Verde", className: "bg-emerald-500" },
  { value: "blue", label: "Azul", className: "bg-sky-500" },
  { value: "pink", label: "Rosa", className: "bg-pink-400" },
];

const DOCS = [
  { slug: "rg", label: "RG do pet", icon: "🪪" },
  { slug: "certidao", label: "Certidão de nascimento", icon: "📜" },
  { slug: "vacinacao", label: "Carteira de vacinação", icon: "💉" },
];

type Props = { petId: string; rgColor: RgColor; hasKit: boolean; hasWhatsapp: boolean };

export function DocumentsPanel({ petId, rgColor, hasKit, hasWhatsapp }: Props) {
  const [color, setColor] = useState<RgColor>(rgColor);
  const [sending, startSending] = useTransition();
  const [message, setMessage] = useState<string | null>(null);

  if (!hasKit) {
    return (
      <section className="card">
        <h2 className="text-lg font-bold">Documentos</h2>
        <p className="mt-2 text-sm text-gray-600">Os documentos ficam disponíveis com o Kit do Pet ativo na sua conta.</p>
      </section>
    );
  }

  return (
    <section className="card flex flex-col gap-4">
      <div>
        <h2 className="text-lg font-bold">Documentos</h2>
        <p className="text-sm text-gray-600">Gere quantas vezes quiser. Sempre saem com os dados atuais.</p>
      </div>

      <div>
        <p className="label">Cor do RG</p>
        <div className="flex gap-3">
          {COLORS.map((c) => (
            <button
              key={c.value}
              type="button"
              onClick={() => {
                setColor(c.value);
                void updateRgColor(petId, c.value);
              }}
              className={`flex items-center gap-2 rounded-full border-2 px-3 py-1.5 text-sm font-semibold ${color === c.value ? "border-gray-800" : "border-gray-200"}`}
            >
              <span className={`h-4 w-4 rounded-full ${c.className}`} />
              {c.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-2">
        {DOCS.map((doc) => (
          <a
            key={doc.slug}
            href={`/api/pets/${petId}/pdf/${doc.slug}${doc.slug === "rg" ? `?cor=${color}` : ""}`}
            className="btn-secondary justify-between"
          >
            <span>{doc.icon} {doc.label}</span>
            <span className="text-sm">Baixar PDF ↓</span>
          </a>
        ))}
      </div>

      <div className="rounded-2xl bg-green-50 p-4">
        <p className="text-sm font-semibold text-green-900">Receber os 3 PDFs no WhatsApp</p>
        {hasWhatsapp ? (
          <button
            type="button"
            className="btn-whatsapp mt-2 w-full"
            disabled={sending}
            onClick={() =>
              startSending(async () => {
                const result = await sendDocumentsToWhatsapp(petId);
                setMessage(result.message);
              })
            }
          >
            {sending ? "Enviando..." : "Enviar para meu WhatsApp"}
          </button>
        ) : (
          <p className="mt-1 text-sm text-green-900">
            Cadastre seu WhatsApp e autorize as mensagens em <Link href="/app/conta" className="font-semibold underline">Conta</Link>.
          </p>
        )}
        {message && <p className="mt-2 text-sm text-green-900">{message}</p>}
      </div>
    </section>
  );
}
