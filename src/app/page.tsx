import Image from "next/image";
import Link from "next/link";
import { MetaPixel } from "@/components/meta-pixel";
import { publicEnv } from "@/lib/public-env";

export default function Home() {
  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col items-center justify-center gap-6 px-6 py-12 text-center">
      <MetaPixel pixelId={publicEnv.metaPixelId} />
      <h1 className="text-3xl font-extrabold text-brand-600">🐾 Kit do Pet</h1>
      <p className="text-gray-600">RG, certidão de nascimento e carteira de vacinação personalizados, com identificação por QR code.</p>
      <div className="grid w-full grid-cols-2 gap-4">
        {[
          { href: "/cao", img: "/exemplos/cao.webp", label: "Tenho um cão" },
          { href: "/gato", img: "/exemplos/gato.webp", label: "Tenho um gato" },
        ].map((o) => (
          <Link key={o.href} href={o.href} className="card flex flex-col items-center gap-3 p-4 transition hover:ring-brand-300">
            <Image src={o.img} alt="" width={640} height={640} priority className="rounded-2xl" sizes="160px" />
            <span className="font-bold text-brand-700">{o.label}</span>
          </Link>
        ))}
      </div>
      <Link href="/entrar" className="btn-secondary w-full">Já comprei · Entrar</Link>
    </main>
  );
}
