"use client";
import { useState } from "react";

type Status = "idle" | "open" | "sending" | "sent" | "error";

export function FoundButton({ code, petName }: { code: string; petName: string }) {
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string>("");
  const [phone, setPhone] = useState("");

  async function send(coords?: GeolocationCoordinates) {
    setStatus("sending");
    try {
      const res = await fetch(`/api/p/${code}/encontrei`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          latitude: coords?.latitude,
          longitude: coords?.longitude,
          accuracy: coords?.accuracy,
          phone: phone || undefined,
        }),
      });
      const data = (await res.json().catch(() => ({}))) as { message?: string };
      if (!res.ok) {
        setError(data.message ?? "Não foi possível enviar o aviso agora.");
        setStatus("error");
        return;
      }
      setStatus("sent");
    } catch {
      setError("Sem conexão. Tente de novo.");
      setStatus("error");
    }
  }

  function sendWithLocation() {
    if (!navigator.geolocation) return send();
    setStatus("sending");
    navigator.geolocation.getCurrentPosition(
      (pos) => send(pos.coords),
      () => send(),
      { enableHighAccuracy: true, timeout: 10_000, maximumAge: 60_000 },
    );
  }

  if (status === "sent") {
    return (
      <div className="rounded-2xl bg-mint-100 p-4 text-center font-semibold text-green-800">
        Obrigado! Avisamos o tutor do(a) {petName}. 💚
      </div>
    );
  }

  if (status === "idle") {
    return (
      <button type="button" className="btn-primary py-4 text-lg" onClick={() => setStatus("open")}>
        📍 Encontrei este pet
      </button>
    );
  }

  return (
    <div className="card flex flex-col gap-3">
      <p className="font-semibold">Vamos avisar o tutor no WhatsApp.</p>
      <p className="text-sm text-gray-600">
        Se você permitir, enviamos também a sua localização atual, só para o tutor. É opcional.
      </p>
      <div>
        <label htmlFor="finder-phone" className="label">Seu telefone (opcional)</label>
        <input id="finder-phone" inputMode="tel" maxLength={20} value={phone} onChange={(e) => setPhone(e.target.value)} className="input" placeholder="Para o tutor falar com você" />
      </div>
      {status === "error" && <p className="text-sm text-red-600">{error}</p>}
      <button type="button" className="btn-primary" disabled={status === "sending"} onClick={sendWithLocation}>
        {status === "sending" ? "Enviando..." : "Avisar com minha localização"}
      </button>
      <button type="button" className="btn-secondary" disabled={status === "sending"} onClick={() => send()}>
        Avisar sem localização
      </button>
    </div>
  );
}
