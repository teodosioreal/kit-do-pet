import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Kit do Pet",
    short_name: "Kit do Pet",
    description: "Documentos do seu pet e identificação por QR code.",
    start_url: "/app",
    scope: "/",
    display: "standalone",
    background_color: "#fffaf5",
    theme_color: "#f97316",
    lang: "pt-BR",
    icons: [
      { src: "/icons/192", sizes: "192x192", type: "image/png" },
      { src: "/icons/512", sizes: "512x512", type: "image/png" },
      { src: "/icons/512", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
