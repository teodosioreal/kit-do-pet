import type { Metadata } from "next";
import { SalesPage } from "@/components/sales-page";
import { SALES } from "@/content/sales";

export const metadata: Metadata = {
  title: { absolute: "RG do Gato · Kit do Pet" },
  description: SALES.gato.heroSubtitle,
  openGraph: { title: SALES.gato.heroTitle, description: SALES.gato.heroSubtitle, images: ["/exemplos/gato-rg.webp"] },
};

export default function GatoPage() {
  return <SalesPage content={SALES.gato} />;
}
