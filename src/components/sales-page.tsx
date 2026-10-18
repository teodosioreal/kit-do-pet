import Image from "next/image";
import Link from "next/link";
import { CheckoutButton } from "@/components/checkout-button";
import { MetaPixel } from "@/components/meta-pixel";
import type { SalesContent } from "@/content/sales";
import { formatBRL, PRODUCTS } from "@/lib/products";
import { publicEnv } from "@/lib/public-env";

const price = formatBRL(PRODUCTS.kit.priceCents);

export function SalesPage({ content }: { content: SalesContent }) {
  const c = content;
  const checkout = publicEnv.checkoutUrl;
  const cta = (label = `Quero o kit por ${price}`) => (
    <div className="flex flex-col items-center gap-2">
      <CheckoutButton href={checkout} value={PRODUCTS.kit.priceCents / 100} className="btn-primary w-full max-w-sm py-4 text-lg shadow-lg shadow-brand-500/30">
        {label}
      </CheckoutButton>
      <p className="text-xs text-gray-500">Pagamento único · Pix ou cartão · Acesso enviado por e-mail e WhatsApp</p>
    </div>
  );

  const examples = [
    { src: `/exemplos/${c.slug}-rg.webp`, w: 460, h: 643, title: "RG do pet", text: "Frente e verso, nas cores verde, azul ou rosa, com QR code." },
    { src: `/exemplos/${c.slug}-certidao.webp`, w: 640, h: 905, title: "Certidão de nascimento", text: "Com foto, dados de nascimento, características e observações." },
    { src: `/exemplos/${c.slug}-vacinacao.webp`, w: 640, h: 905, title: "Carteira de vacinação", text: "Vacinas e vermífugos com as próximas doses, e linhas para preencher à mão." },
  ];

  return (
    <div className="flex flex-col overflow-x-clip">
      <MetaPixel pixelId={publicEnv.metaPixelId} />

      <header className="mx-auto flex w-full max-w-5xl items-center justify-between px-5 py-4">
        <span className="text-lg font-extrabold text-brand-600">🐾 Kit do Pet</span>
        <Link href="/entrar" className="text-sm font-semibold text-gray-600">Já comprei · Entrar</Link>
      </header>

      {/* Hero */}
      <section className="mx-auto grid w-full max-w-5xl items-center gap-8 px-5 pb-12 pt-4 md:grid-cols-2">
        <div className="flex flex-col gap-5 text-center md:text-left">
          <span className="mx-auto rounded-full bg-brand-100 px-3 py-1 text-xs font-bold uppercase tracking-wider text-brand-700 md:mx-0">
            Documentos personalizados para {c.petWordPlural}
          </span>
          <h1 className="text-4xl font-extrabold leading-tight md:text-5xl">{c.heroTitle}</h1>
          <p className="text-lg text-gray-600">{c.heroSubtitle}</p>
          <div className="md:max-w-sm">{cta()}</div>
        </div>
        <div className="relative mx-auto w-full max-w-sm">
          <div className="absolute -inset-4 -z-10 rotate-3 rounded-[2.5rem] bg-brand-100" />
          <Image src={examples[0].src} alt={`Exemplo de RG do pet com o ${c.exampleName}`} width={460} height={643} priority className="rounded-3xl shadow-xl" sizes="(max-width: 768px) 90vw, 384px" />
        </div>
      </section>

      {/* Exemplos */}
      <section className="bg-white py-14">
        <div className="mx-auto max-w-5xl px-5">
          <h2 className="text-center text-3xl font-extrabold">Veja como fica</h2>
          <p className="mt-2 text-center text-gray-600">Exemplos reais gerados pelo app, com a foto e os dados do pet.</p>
          <div className="-mx-5 mt-8 flex snap-x snap-mandatory gap-4 overflow-x-auto px-5 pb-4 md:grid md:grid-cols-3 md:overflow-visible">
            {examples.map((ex) => (
              <figure key={ex.title} className="card w-[78%] shrink-0 snap-center md:w-auto">
                <Image src={ex.src} alt={`Exemplo: ${ex.title}`} width={ex.w} height={ex.h} loading="lazy" className="mx-auto max-h-96 w-auto rounded-xl ring-1 ring-black/5" sizes="(max-width: 768px) 75vw, 320px" />
                <figcaption className="mt-3">
                  <p className="font-bold">{ex.title}</p>
                  <p className="text-sm text-gray-600">{ex.text}</p>
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      {/* Como funciona */}
      <section className="mx-auto w-full max-w-5xl px-5 py-14">
        <h2 className="text-center text-3xl font-extrabold">Como funciona</h2>
        <ol className="mt-8 grid gap-4 md:grid-cols-3">
          {[
            ["Compre o kit", "O pagamento é único. Você recebe o link de acesso no e-mail e no WhatsApp."],
            [`Cadastre seu ${c.petWord}`, "Coloque a foto, o nome, a raça, a data de nascimento e as vacinas. Leva poucos minutos."],
            ["Baixe e use", "Gere os PDFs para imprimir ou guardar no celular e use o QR code no RG ou numa plaquinha."],
          ].map(([title, text], i) => (
            <li key={title} className="card flex gap-4">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-500 text-lg font-extrabold text-white">{i + 1}</span>
              <div>
                <p className="font-bold">{title}</p>
                <p className="text-sm text-gray-600">{text}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      {/* O que vem no kit */}
      <section className="bg-white py-14">
        <div className="mx-auto grid max-w-5xl gap-8 px-5 md:grid-cols-2">
          <div>
            <h2 className="text-3xl font-extrabold">O que vem no kit</h2>
            <ul className="mt-6 flex flex-col gap-3">
              {[
                "RG do pet em PDF, frente e verso, com foto e QR code (verde, azul ou rosa)",
                "Certidão de nascimento em PDF",
                "Carteira de vacinação em PDF, com espaço para preencher à mão",
                "Página do pet com QR code e botão \"Falar com o tutor\"",
                "Botão \"Encontrei este pet\", que avisa você no WhatsApp",
                "Novas vias ilimitadas sempre que atualizar os dados",
                "Acesso pelo celular, sem instalar aplicativo",
              ].map((item) => (
                <li key={item} className="flex gap-3">
                  <span className="mt-0.5 text-mint-500">✔</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="card flex flex-col gap-3 bg-brand-50">
            <p className="font-bold">Opcionais que você pode adicionar no checkout</p>
            {[
              ["reminders", "Lembretes de vacina, vermífugo e antipulgas no WhatsApp por 1 ano"],
              ["extra_pet", "Cadastro de mais um pet"],
              ["guide_training", `Guia de adestramento básico (versão para ${c.petWord})`],
              ["guide_treats", `Guia de petiscos caseiros (versão para ${c.petWord})`],
            ].map(([key, label]) => (
              <div key={key} className="flex items-start justify-between gap-4 border-b border-brand-100 pb-2 last:border-0">
                <span className="text-sm">{label}</span>
                <span className="whitespace-nowrap text-sm font-bold">{formatBRL(PRODUCTS[key as keyof typeof PRODUCTS].priceCents)}</span>
              </div>
            ))}
            <div className="mt-2 rounded-2xl bg-white p-4 text-center">
              <p className="text-sm text-gray-600">Kit do Pet</p>
              <p className="text-4xl font-extrabold text-brand-600">{price}</p>
              <p className="text-xs text-gray-500">pagamento único</p>
            </div>
            {cta("Quero o Kit do Pet")}
          </div>
        </div>
      </section>

      {/* QR code */}
      <section className="mx-auto grid w-full max-w-5xl items-center gap-8 px-5 py-14 md:grid-cols-2">
        <Image src={`/exemplos/${c.slug}.webp`} alt={`Ilustração de um ${c.petWord}`} width={640} height={640} loading="lazy" className="mx-auto w-56 rounded-[2.5rem] shadow-lg md:w-72" sizes="288px" />
        <div className="flex flex-col gap-3">
          <h2 className="text-3xl font-extrabold">Se ele se perder, quem encontrar sabe com quem falar</h2>
          <p className="text-gray-600">
            O QR code leva para a página do seu {c.petWord}, com a foto e os dados que você escolher mostrar. Quem encontrar pode
            falar com você no WhatsApp com um toque, ou apertar &quot;Encontrei este pet&quot; e enviar a localização de onde está,
            se quiser.
          </p>
          <p className="text-sm text-gray-500">Você decide o que aparece e pode mudar quando quiser.</p>
        </div>
      </section>

      {/* Depoimentos (aparece só quando houver depoimentos em src/content/sales.ts) */}
      {c.testimonials.length > 0 && (
        <section className="bg-white py-14">
          <div className="mx-auto max-w-5xl px-5">
            <h2 className="text-center text-3xl font-extrabold">Quem já tem o kit</h2>
            <div className="mt-8 grid gap-4 md:grid-cols-3">
              {c.testimonials.map((t) => (
                <blockquote key={t.name + t.text} className="card flex flex-col gap-3">
                  <p className="text-gray-700">&ldquo;{t.text}&rdquo;</p>
                  <footer className="text-sm font-bold">
                    {t.name}
                    <span className="font-normal text-gray-500"> · {t.city}{t.petName ? ` · tutor(a) de ${t.petName}` : ""}</span>
                  </footer>
                </blockquote>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* FAQ */}
      <section className="mx-auto w-full max-w-3xl px-5 py-14">
        <h2 className="text-center text-3xl font-extrabold">Perguntas frequentes</h2>
        <div className="mt-8 flex flex-col gap-3">
          {c.faq.map((item) => (
            <details key={item.q} className="card group">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-bold">
                {item.q}
                <span className="text-brand-500 transition group-open:rotate-45">+</span>
              </summary>
              <p className="mt-3 text-gray-600">{item.a}</p>
            </details>
          ))}
        </div>
      </section>

      <section className="bg-brand-500 px-5 py-14 text-center text-white">
        <h2 className="text-3xl font-extrabold">Pronto para fazer o RG do seu {c.petWord}?</h2>
        <p className="mt-2 text-brand-50">Em poucos minutos os documentos estão prontos.</p>
        <div className="mt-6 flex justify-center">
          <CheckoutButton href={checkout} value={PRODUCTS.kit.priceCents / 100} className="btn w-full max-w-sm bg-white py-4 text-lg text-brand-700 hover:bg-brand-50">
            Quero o kit por {price}
          </CheckoutButton>
        </div>
      </section>

      <footer className="px-5 py-8 text-center text-xs text-gray-500">
        <p>Os documentos são personalizados e sem valor oficial.</p>
        <p className="mt-2">
          <Link href="/termos" className="underline">Termos de uso</Link> · <Link href="/privacidade" className="underline">Política de privacidade</Link>
        </p>
      </footer>
    </div>
  );
}
