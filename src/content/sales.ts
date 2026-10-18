// Textos das páginas de vendas (/cao e /gato). Edite à vontade.
// Regras: sem preço riscado, sem contador, sem "somente hoje" e sem prometer localização do pet.
import type { Species } from "@/lib/products";

export type Testimonial = { name: string; city: string; text: string; petName?: string };

export type SalesContent = {
  slug: "cao" | "gato";
  species: Species;
  petWord: string; // "cão" | "gato"
  petWordPlural: string;
  heroTitle: string;
  heroSubtitle: string;
  exampleName: string;
  faq: { q: string; a: string }[];
  /**
   * DEPOIMENTOS: preencha com depoimentos reais (com autorização do cliente).
   * Enquanto a lista estiver vazia, a seção não aparece na página.
   */
  testimonials: Testimonial[];
};

const commonFaq = [
  {
    q: "Os documentos têm valor oficial?",
    a: "Não. São documentos personalizados e afetivos, com o aviso \"Documento personalizado, sem valor oficial.\". Eles não substituem registros, atestados ou a carteira emitida pelo seu veterinário.",
  },
  {
    q: "Como recebo o acesso?",
    a: "Logo após a confirmação do pagamento, você recebe um link de acesso no e-mail e no WhatsApp informados na compra. No Pix e no cartão costuma chegar em poucos minutos.",
  },
  {
    q: "Posso editar os dados depois?",
    a: "Pode, quantas vezes quiser. Os documentos são gerados na hora com os dados atuais, então você baixa uma nova via sempre que precisar.",
  },
  {
    q: "Como funciona o QR code?",
    a: "Cada pet ganha uma página própria. Quem escanear o QR code (impresso no RG ou numa plaquinha) vê a foto e os dados que você escolheu mostrar, pode falar com você no WhatsApp e tem um botão para avisar que encontrou o pet, enviando a localização se quiser. É identificação: o QR code não mostra onde o pet está.",
  },
  {
    q: "Preciso instalar algum aplicativo?",
    a: "Não. Tudo funciona no navegador do celular. Se quiser, dá para adicionar o atalho na tela inicial.",
  },
  {
    q: "Tenho mais de um pet. E agora?",
    a: "O kit inclui 1 pet. No checkout você pode adicionar mais um pet por R$ 7,00, e depois também pela sua área de cliente.",
  },
  {
    q: "E se eu não gostar?",
    a: "Você tem 7 dias de garantia, conforme o Código de Defesa do Consumidor. É só pedir o reembolso pela plataforma de pagamento.",
  },
];

export const SALES: Record<"cao" | "gato", SalesContent> = {
  cao: {
    slug: "cao",
    species: "dog",
    petWord: "cão",
    petWordPlural: "cães",
    heroTitle: "O RG do seu cachorro, do jeitinho dele",
    heroSubtitle:
      "RG, certidão de nascimento e carteira de vacinação personalizados com a foto do seu cão, mais uma página com QR code para quem encontrá-lo falar com você.",
    exampleName: "Thor",
    faq: commonFaq,
    testimonials: [],
  },
  gato: {
    slug: "gato",
    species: "cat",
    petWord: "gato",
    petWordPlural: "gatos",
    heroTitle: "O RG do seu gato, com a carinha dele",
    heroSubtitle:
      "RG, certidão de nascimento e carteira de vacinação personalizados com a foto do seu gato, mais uma página com QR code para quem encontrá-lo falar com você.",
    exampleName: "Mia",
    faq: commonFaq,
    testimonials: [],
  },
};
