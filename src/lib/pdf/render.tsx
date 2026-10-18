import "server-only";
import { renderToBuffer } from "@react-pdf/renderer";
import type { SupabaseClient } from "@supabase/supabase-js";
import { publicPetUrl, qrDataUrl } from "@/lib/qr";
import { downloadPhoto } from "@/lib/storage";
import type { HealthRecord, Pet, RgColor } from "@/lib/types";
import { CertidaoDocument } from "./certidao";
import { RgDocument } from "./rg";
import { registerFonts, type PetDocData } from "./shared";
import { VacinacaoDocument } from "./vacinacao";

export type DocSlug = "rg" | "certidao" | "vacinacao";
export const DOC_SLUGS: DocSlug[] = ["rg", "certidao", "vacinacao"];
export const DOC_TITLES: Record<DocSlug, string> = {
  rg: "RG do Pet",
  certidao: "Certidão de Nascimento",
  vacinacao: "Carteira de Vacinação",
};

function slugify(text: string) {
  return text.normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-zA-Z0-9]+/g, "-").replace(/^-|-$/g, "").toLowerCase() || "pet";
}

export function docFileName(slug: DocSlug, pet: Pet) {
  return `${slug}-${slugify(pet.name)}.pdf`;
}

async function loadDocData(pet: Pet): Promise<PetDocData> {
  const publicUrl = publicPetUrl(pet.public_code);
  const [photoBuffer, qr] = await Promise.all([downloadPhoto(pet.photo_path), qrDataUrl(publicUrl)]);
  return {
    pet,
    photo: photoBuffer ? `data:image/jpeg;base64,${photoBuffer.toString("base64")}` : null,
    qr,
    publicUrl,
  };
}

/**
 * Gera um documento. O `supabase` recebido define o acesso: com o cliente da
 * sessão, o RLS garante que o pet e os registros são do usuário logado.
 */
export async function renderPetDocument(
  supabase: SupabaseClient,
  pet: Pet,
  slug: DocSlug,
  options: { rgColor?: RgColor } = {},
): Promise<Buffer> {
  registerFonts();
  const data = await loadDocData(pet);
  if (slug === "rg") return renderToBuffer(<RgDocument data={data} color={options.rgColor ?? pet.rg_color} />);
  if (slug === "certidao") return renderToBuffer(<CertidaoDocument data={data} />);
  const { data: records } = await supabase.from("health_records").select("*").eq("pet_id", pet.id);
  return renderToBuffer(<VacinacaoDocument data={data} records={(records ?? []) as HealthRecord[]} />);
}
