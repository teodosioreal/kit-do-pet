import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Modelo de renderização clássico: páginas com cookies/sessão são dinâmicas.
  cacheComponents: false,
  // @react-pdf usa módulos Node que não devem ser empacotados.
  serverExternalPackages: ["@react-pdf/renderer"],
  images: {
    remotePatterns: [{ protocol: "https", hostname: "*.supabase.co" }],
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
