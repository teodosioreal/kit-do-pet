"use client";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { createGuideUploadUrl, registerGuide } from "../actions";

export function GuideUpload({ product, species, current }: { product: string; species: string; current: string | null }) {
  const [status, setStatus] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (file.type !== "application/pdf") return setStatus("Envie um arquivo PDF.");
    setBusy(true);
    setStatus("Enviando...");
    try {
      const target = await createGuideUploadUrl(product, species);
      if (!target) throw new Error("Sem permissão");
      const { error } = await createClient().storage.from("guides").uploadToSignedUrl(target.path, target.token, file, { contentType: "application/pdf" });
      if (error) throw error;
      const result = await registerGuide(product, species, target.path, file.name);
      setStatus(result.message);
    } catch (err) {
      setStatus(`Erro: ${err instanceof Error ? err.message : "falha no envio"}`);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <p className="text-sm text-gray-600">{current ? `Atual: ${current}` : "Nenhum arquivo publicado."}</p>
      <label className={`btn-secondary cursor-pointer py-2 text-sm ${busy ? "pointer-events-none opacity-50" : ""}`}>
        {current ? "Substituir PDF" : "Enviar PDF"}
        <input type="file" accept="application/pdf" className="hidden" onChange={onFile} />
      </label>
      {status && <p className="text-xs text-gray-600">{status}</p>}
    </div>
  );
}
