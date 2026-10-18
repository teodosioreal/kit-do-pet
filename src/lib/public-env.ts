// Variáveis públicas (podem ir para o navegador).
export const publicEnv = {
  siteUrl: (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").replace(/\/$/, ""),
  checkoutUrl: process.env.NEXT_PUBLIC_CHECKOUT_URL ?? "",
  extraPetCheckoutUrl: process.env.NEXT_PUBLIC_EXTRA_PET_CHECKOUT_URL ?? "",
  metaPixelId: process.env.NEXT_PUBLIC_META_PIXEL_ID ?? "",
  supportWhatsapp: process.env.NEXT_PUBLIC_SUPPORT_WHATSAPP ?? "",
};
