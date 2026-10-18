// Catálogo dos produtos vendidos. As chaves internas são gravadas no banco
// (tabela entitlements). Os IDs dos produtos na plataforma de pagamento vêm
// de variáveis de ambiente, para trocar de Kiwify para Cakto sem mexer no código.

export type ProductKey = "kit" | "reminders" | "extra_pet" | "guide_training" | "guide_treats";
export type GuideKey = Extract<ProductKey, "guide_training" | "guide_treats">;
export type Species = "dog" | "cat";

type ProductInfo = {
  name: string;
  priceCents: number;
  /** Validade em meses a partir da compra (undefined = vitalício). */
  durationMonths?: number;
  /** Variáveis com os IDs do produto em cada plataforma (aceita vários IDs separados por vírgula). */
  idEnv: { kiwify: string; cakto: string };
};

export const PRODUCTS: Record<ProductKey, ProductInfo> = {
  kit: {
    name: "Kit do Pet",
    priceCents: 1490,
    idEnv: { kiwify: "KIWIFY_PRODUCT_KIT", cakto: "CAKTO_PRODUCT_KIT" },
  },
  reminders: {
    name: "Lembretes no WhatsApp por 1 ano",
    priceCents: 1990,
    durationMonths: 12,
    idEnv: { kiwify: "KIWIFY_PRODUCT_REMINDERS", cakto: "CAKTO_PRODUCT_REMINDERS" },
  },
  extra_pet: {
    name: "Mais um pet",
    priceCents: 700,
    idEnv: { kiwify: "KIWIFY_PRODUCT_EXTRA_PET", cakto: "CAKTO_PRODUCT_EXTRA_PET" },
  },
  guide_training: {
    name: "Guia de adestramento básico",
    priceCents: 490,
    idEnv: { kiwify: "KIWIFY_PRODUCT_GUIDE_TRAINING", cakto: "CAKTO_PRODUCT_GUIDE_TRAINING" },
  },
  guide_treats: {
    name: "Guia de petiscos caseiros",
    priceCents: 490,
    idEnv: { kiwify: "KIWIFY_PRODUCT_GUIDE_TREATS", cakto: "CAKTO_PRODUCT_GUIDE_TREATS" },
  },
};

export const PRODUCT_KEYS = Object.keys(PRODUCTS) as ProductKey[];
export const GUIDE_KEYS: GuideKey[] = ["guide_training", "guide_treats"];

export const SPECIES_LABEL: Record<Species, string> = { dog: "Cão", cat: "Gato" };

/** Converte um ID de produto da plataforma na chave interna. */
export function productKeyFromProviderId(provider: "kiwify" | "cakto", providerId: string): ProductKey | undefined {
  const id = providerId.trim();
  if (!id) return undefined;
  return PRODUCT_KEYS.find((key) =>
    (process.env[PRODUCTS[key].idEnv[provider]] ?? "")
      .split(",")
      .map((v) => v.trim())
      .includes(id),
  );
}

export function formatBRL(cents: number) {
  return (cents / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}
