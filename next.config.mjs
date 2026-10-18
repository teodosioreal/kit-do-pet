// Configuração em JavaScript puro (sem TypeScript) para o Next não precisar
// compilar este arquivo: no servidor da Hostinger só o compilador WASM funciona.

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Modelo de renderização clássico: páginas com cookies/sessão são dinâmicas.
  cacheComponents: false,
  // @react-pdf usa módulos Node que não devem ser empacotados.
  serverExternalPackages: ["@react-pdf/renderer"],
  // Fontes usadas nos PDFs (lidas do disco em tempo de execução).
  outputFileTracingIncludes: { "/**": ["./assets/fonts/**"] },
  images: {
    remotePatterns: [{ protocol: "https", hostname: "*.supabase.co" }],
  },
};

export default nextConfig;
