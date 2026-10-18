import type { Metadata } from "next";
import { SalesPage } from "@/components/sales-page";
import { SALES } from "@/content/sales";

export const metadata: Metadata = {
  title: { absolute: "RG do Cachorro · Kit do Pet" },
  description: SALES.cao.heroSubtitle,
  openGraph: { title: SALES.cao.heroTitle, description: SALES.cao.heroSubtitle, images: ["/exemplos/cao-rg.webp"] },
};

export default function CaoPage() {
  return <SalesPage content={SALES.cao} />;
}
