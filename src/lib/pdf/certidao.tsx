import { Document, Page, Text, View } from "@react-pdf/renderer";
import { base, DISCLAIMER, Field, issuedOn, PALETTE, Paw, PetPhoto, petFacts, type PetDocData } from "./shared";

const ACCENT = "#14b8a6";

export function CertidaoDocument({ data }: { data: PetDocData }) {
  const { pet, photo } = data;
  const f = petFacts(pet);
  const where = pet.birth_place ? `, em ${pet.birth_place}` : "";
  const when = pet.birth_date ? ` no dia ${f.birth}` : "";

  return (
    <Document title={`Certidão de Nascimento - ${pet.name}`} author="Kit do Pet">
      <Page size="A4" style={[base.page, { padding: 22, backgroundColor: PALETTE.cream }]}>
        <View style={{ flexGrow: 1, borderWidth: 6, borderColor: PALETTE.brand, borderRadius: 18, padding: 6 }}>
          <View style={{ flexGrow: 1, borderWidth: 2, borderColor: ACCENT, borderRadius: 12, padding: 28, alignItems: "center", backgroundColor: "#ffffff" }}>
            <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 6 }}>
              <Paw size={18} color={PALETTE.brand} />
              <Text style={{ marginHorizontal: 8, fontSize: 10, fontWeight: 700, color: ACCENT, letterSpacing: 2 }}>KIT DO PET</Text>
              <Paw size={18} color={PALETTE.brand} />
            </View>
            <Text style={{ fontSize: 30, fontWeight: 800, color: PALETTE.brandDark }}>Certidão de Nascimento</Text>
            <Text style={{ fontSize: 14, fontWeight: 700, color: ACCENT, marginBottom: 18 }}>do Pet</Text>

            <PetPhoto src={photo} size={150} radius={75} border={PALETTE.brand} name={pet.name} />

            <Text style={{ fontSize: 28, fontWeight: 800, marginTop: 14 }}>{pet.name}</Text>
            <Text style={{ fontSize: 11.5, textAlign: "center", marginTop: 8, marginHorizontal: 30, lineHeight: 1.5 }}>
              Certificamos, com muito carinho, que {pet.name} nasceu{when}{where}, e desde então faz parte da família de{" "}
              {pet.tutor_name || "seu tutor"}.
            </Text>

            <View style={{ flexDirection: "row", flexWrap: "wrap", marginTop: 20, width: "100%", borderTopWidth: 1, borderBottomWidth: 1, borderColor: PALETTE.line, paddingVertical: 12 }}>
              {[
                ["Espécie", f.species],
                ["Raça", f.breed],
                ["Sexo", f.sex],
                ["Cor", f.color],
                ["Data de nascimento", f.birth],
                ["Local de nascimento", f.birthPlace],
                ["Tutor(a)", f.tutor],
                ["Registro", pet.registry_number],
              ].map(([label, value]) => (
                <Field key={label} label={label} value={value} style={{ width: "50%", paddingHorizontal: 8, marginBottom: 8 }} />
              ))}
            </View>

            <View style={{ width: "100%", marginTop: 12 }}>
              <Text style={base.label}>Características</Text>
              <Text style={{ fontSize: 10.5, marginTop: 2, minHeight: 28 }}>{pet.traits || " "}</Text>
              <Text style={[base.label, { marginTop: 8 }]}>Observações</Text>
              <Text style={{ fontSize: 10.5, marginTop: 2, minHeight: 28 }}>{pet.notes || " "}</Text>
            </View>

            <View style={{ flexGrow: 1 }} />
            <View style={{ flexDirection: "row", width: "100%", justifyContent: "space-between", alignItems: "flex-end" }}>
              <View style={{ width: "55%", alignItems: "center" }}>
                <View style={{ borderTopWidth: 1, borderColor: PALETTE.ink, width: "100%" }} />
                <Text style={{ fontSize: 9, marginTop: 3 }}>Assinatura do(a) tutor(a)</Text>
              </View>
              <Text style={{ fontSize: 9, color: PALETTE.muted }}>Emitida em {issuedOn()}</Text>
            </View>
            <Text style={[base.disclaimer, { marginTop: 14 }]}>{DISCLAIMER}</Text>
          </View>
        </View>
      </Page>
    </Document>
  );
}
