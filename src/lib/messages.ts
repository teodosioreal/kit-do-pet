// Textos das mensagens de WhatsApp (centralizados para facilitar ajustes).

const firstName = (name: string | null | undefined) => name?.trim().split(/\s+/)[0] || null;

export function accessWhatsappMessage(name: string | null, link: string) {
  const first = firstName(name);
  return [
    `Oi${first ? `, ${first}` : ""}! 🐾 Seu *Kit do Pet* está liberado.`,
    "",
    "Toque no link para entrar, cadastrar seu pet e gerar os documentos:",
    link,
    "",
    "O link é pessoal e vale por 30 dias.",
  ].join("\n");
}

const KIND_PHRASE = { vaccine: "da vacina", dewormer: "do vermífugo", antiflea: "do antipulgas" } as const;

function petArticle(sex: "male" | "female" | null) {
  return sex === "female" ? "da" : sex === "male" ? "do" : "de";
}

/** Ex.: "Oi, Ana! Daqui a 3 dias é dia do vermífugo (Drontal) da Mia 🐾" */
export function reminderMessage(opts: {
  tutorName: string | null;
  petName: string;
  petSex: "male" | "female" | null;
  kind: keyof typeof KIND_PHRASE;
  itemName: string;
  daysBefore: 0 | 3;
}) {
  const first = firstName(opts.tutorName);
  const hello = `Oi${first ? `, ${first}` : ""}!`;
  const what = `${KIND_PHRASE[opts.kind]} (${opts.itemName}) ${petArticle(opts.petSex)} ${opts.petName}`;
  return opts.daysBefore === 3 ? `${hello} Daqui a 3 dias é dia ${what} 🐾` : `${hello} Hoje é dia ${what} 🐾`;
}

export function renewalMessage(name: string | null, untilLabel: string, link: string | undefined) {
  const first = firstName(name);
  return [
    `Oi${first ? `, ${first}` : ""}! 🐾 Seu plano de lembretes do Kit do Pet vence em ${untilLabel}.`,
    link ? `Para continuar recebendo os avisos de vacina, vermífugo e antipulgas, renove aqui: ${link}` : "Para continuar recebendo os avisos, fale com a gente.",
  ].join("\n");
}
