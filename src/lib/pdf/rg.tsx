import { Document, Image, Page, Text, View } from "@react-pdf/renderer";
import { base, DISCLAIMER, Field, issuedOn, PALETTE, Paw, PetPhoto, petFacts, RG_THEMES, type PetDocData } from "./shared";
import type { RgColor } from "@/lib/types";

const MM = 2.835;
const CARD_W = 100 * MM;
const CARD_H = 66 * MM;

export function RgDocument({ data, color }: { data: PetDocData; color: RgColor }) {
  const { pet, photo, qr } = data;
  const theme = RG_THEMES[color];
  const f = petFacts(pet);

  const card = {
    width: CARD_W,
    height: CARD_H,
    borderRadius: 10,
    borderWidth: 1,
    borderStyle: "dashed" as const,
    borderColor: "#9ca3af",
    backgroundColor: theme.soft,
    overflow: "hidden" as const,
  };

  return (
    <Document title={`RG do Pet - ${pet.name}`} author="Kit do Pet">
      <Page size="A4" style={[base.page, { padding: 36, alignItems: "center" }]}>
        <Text style={{ fontSize: 18, fontWeight: 800, color: theme.dark }}>RG do Pet · {pet.name}</Text>
        <Text style={{ fontSize: 9, color: PALETTE.muted, marginTop: 4, marginBottom: 18, textAlign: "center" }}>
          Imprima em papel mais grosso (180 g ou mais), recorte nas linhas tracejadas e cole a frente e o verso. Se quiser, plastifique.
        </Text>

        {/* Frente */}
        <Text style={[base.label, { marginBottom: 4 }]}>Frente</Text>
        <View style={card}>
          <View style={{ backgroundColor: theme.main, paddingVertical: 7, paddingHorizontal: 12, flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <Paw size={16} color="#ffffff" />
              <Text style={{ color: "#ffffff", fontSize: 13, fontWeight: 800, marginLeft: 6 }}>RG DO PET</Text>
            </View>
            <Text style={{ color: "#ffffff", fontSize: 7, fontWeight: 700 }}>Kit do Pet</Text>
          </View>
          <View style={{ flexDirection: "row", padding: 10, flexGrow: 1 }}>
            <PetPhoto src={photo} size={30 * MM} radius={10} border={theme.main} name={pet.name} />
            <View style={{ marginLeft: 12, flexGrow: 1, flexShrink: 1 }}>
              <Text style={{ fontSize: 16, fontWeight: 800, color: theme.dark, marginBottom: 4 }}>{pet.name}</Text>
              <View style={{ flexDirection: "row" }}>
                <Field label="Espécie" value={f.species} style={{ width: "50%" }} />
                <Field label="Sexo" value={f.sex} style={{ width: "50%" }} />
              </View>
              <Field label="Raça" value={f.breed} />
              <Field label="Nascimento" value={f.birth} />
            </View>
          </View>
          <View style={{ backgroundColor: theme.dark, paddingVertical: 4, paddingHorizontal: 12, flexDirection: "row", justifyContent: "space-between" }}>
            <Text style={{ color: "#ffffff", fontSize: 8, fontWeight: 700 }}>Nº {pet.registry_number}</Text>
            <Text style={{ color: "#ffffff", fontSize: 6.5 }}>{DISCLAIMER}</Text>
          </View>
        </View>

        {/* Verso */}
        <Text style={[base.label, { marginTop: 18, marginBottom: 4 }]}>Verso</Text>
        <View style={card}>
          <View style={{ flexDirection: "row", padding: 12, flexGrow: 1 }}>
            <View style={{ flexGrow: 1, flexShrink: 1, paddingRight: 10 }}>
              <Field label="Tutor(a)" value={f.tutor} />
              <Field label="Cor" value={f.color} />
              <Field label="Local de nascimento" value={f.birthPlace} />
              <Field label="Registro" value={pet.registry_number} />
              <Field label="Emitido em" value={issuedOn()} />
            </View>
            <View style={{ alignItems: "center", width: 30 * MM }}>
              {/* eslint-disable-next-line jsx-a11y/alt-text */}
              <Image src={qr} style={{ width: 28 * MM, height: 28 * MM, borderRadius: 6 }} />
              <Text style={{ fontSize: 6.5, fontWeight: 700, color: theme.dark, textAlign: "center", marginTop: 3 }}>
                Me encontrou? Escaneie e fale com meu tutor
              </Text>
            </View>
          </View>
          <View style={{ backgroundColor: theme.main, paddingVertical: 4, paddingHorizontal: 12 }}>
            <Text style={{ color: "#ffffff", fontSize: 6.5, textAlign: "center" }}>{DISCLAIMER} Identificação por QR code — Kit do Pet.</Text>
          </View>
        </View>

        <Text style={[base.disclaimer, { position: "absolute", bottom: 24, left: 36, right: 36, textAlign: "center" }]}>
          {DISCLAIMER} Este RG é uma lembrança personalizada e não substitui nenhum registro oficial.
        </Text>
      </Page>
    </Document>
  );
}
