"use client";
import { useCallback, useState } from "react";
import Cropper, { type Area } from "react-easy-crop";
import { createClient } from "@/lib/supabase/client";

const OUTPUT_SIZE = 800;

async function cropToBlob(imageSrc: string, area: Area): Promise<Blob> {
  const image = await new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = imageSrc;
  });
  const canvas = document.createElement("canvas");
  canvas.width = OUTPUT_SIZE;
  canvas.height = OUTPUT_SIZE;
  const ctx = canvas.getContext("2d")!;
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, OUTPUT_SIZE, OUTPUT_SIZE);
  ctx.drawImage(image, area.x, area.y, area.width, area.height, 0, 0, OUTPUT_SIZE, OUTPUT_SIZE);
  return new Promise((resolve, reject) =>
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("crop"))), "image/jpeg", 0.88),
  );
}

type Props = {
  userId: string;
  initialUrl: string | null;
  initialPath: string | null;
  name?: string;
};

/** Escolhe a foto, corta em quadrado e envia para o Storage. Grava o caminho num input escondido. */
export function PhotoCropper({ userId, initialUrl, initialPath, name = "photo_path" }: Props) {
  const [source, setSource] = useState<string | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [area, setArea] = useState<Area | null>(null);
  const [preview, setPreview] = useState<string | null>(initialUrl);
  const [path, setPath] = useState<string | null>(initialPath);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onComplete = useCallback((_: Area, pixels: Area) => setArea(pixels), []);

  function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (!file.type.startsWith("image/")) return setError("Escolha uma imagem.");
    setError(null);
    setZoom(1);
    setCrop({ x: 0, y: 0 });
    setSource(URL.createObjectURL(file));
  }

  async function confirm() {
    if (!source || !area) return;
    setUploading(true);
    setError(null);
    try {
      const blob = await cropToBlob(source, area);
      const newPath = `${userId}/${crypto.randomUUID()}.jpg`;
      const { error: upError } = await createClient()
        .storage.from("pet-photos")
        .upload(newPath, blob, { contentType: "image/jpeg", upsert: false });
      if (upError) throw upError;
      setPath(newPath);
      setPreview(URL.createObjectURL(blob));
      URL.revokeObjectURL(source);
      setSource(null);
    } catch {
      setError("Não foi possível enviar a foto. Tente de novo.");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div>
      <input type="hidden" name={name} value={path ?? ""} />
      <div className="flex items-center gap-4">
        <div className="flex h-28 w-28 shrink-0 items-center justify-center overflow-hidden rounded-3xl bg-brand-50 ring-2 ring-brand-200">
          {preview ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={preview} alt="Foto do pet" className="h-full w-full object-cover" />
          ) : (
            <span className="text-4xl">🐾</span>
          )}
        </div>
        <label className="btn-secondary cursor-pointer">
          {preview ? "Trocar foto" : "Escolher foto"}
          <input type="file" accept="image/*" className="hidden" onChange={onFile} />
        </label>
      </div>
      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}

      {source && (
        <div className="fixed inset-0 z-50 flex flex-col bg-black/90">
          <div className="relative flex-1">
            <Cropper
              image={source}
              crop={crop}
              zoom={zoom}
              aspect={1}
              cropShape="rect"
              onCropChange={setCrop}
              onZoomChange={setZoom}
              onCropComplete={onComplete}
            />
          </div>
          <div className="flex flex-col gap-3 bg-white p-4">
            <label className="text-sm font-semibold text-gray-700">
              Zoom
              <input type="range" min={1} max={3} step={0.05} value={zoom} onChange={(e) => setZoom(Number(e.target.value))} className="mt-1 w-full accent-brand-500" />
            </label>
            <div className="flex gap-3">
              <button type="button" className="btn-secondary flex-1" onClick={() => setSource(null)} disabled={uploading}>Cancelar</button>
              <button type="button" className="btn-primary flex-1" onClick={confirm} disabled={uploading}>
                {uploading ? "Enviando..." : "Usar esta foto"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
