import { Document, Page, Text, View } from "@react-pdf/renderer";
import { formatDateBR } from "@/lib/dates";
import type { HealthRecord } from "@/lib/types";
import { HEALTH_KIND_LABEL } from "@/lib/types";
import { base, DISCLAIMER, Field, PALETTE, Paw, PetPhoto, petFacts, type PetDocData } from "./shared";

const VACCINE_COLOR = "#0ea5e9";
const PARASITE_COLOR = "#22c55e";

function Table({ title, color, rows, blankRows, firstColumn }: { title: string; color: string; rows: HealthRecord[]; blankRows: number; firstColumn: string }) {
  const cols = [
    { label: firstColumn, width: "34%" },
    { label: "Aplicada em", width: "18%" },
    { label: "Próxima dose", width: "18%" },
    { label: "Veterinário / carimbo", width: "30%" },
  ];
  const cell = (width: string, text: string, bold = false) => (
    <View style={{ width, paddingVertical: 7, paddingHorizontal: 6, borderRightWidth: 1, borderColor: PALETTE.line }}>
      <Text style={{ fontSize: 9.5, fontWeight: bold ? 700 : 400 }}>{text}</Text>
    </View>
  );
  const total = rows.length + blankRows;
  return (
    <View style={{ marginTop: 16 }}>
      <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 6 }}>
        <Paw size={14} color={color} />
        <Text style={{ fontSize: 14, fontWeight: 800, color, marginLeft: 6 }}>{title}</Text>
      </View>
      <View style={{ borderWidth: 1, borderColor: PALETTE.line, borderRadius: 8, overflow: "hidden" }}>
        <View style={{ flexDirection: "row", backgroundColor: color }} fixed>
          {cols.map((c) => (
            <View key={c.label} style={{ width: c.width, paddingVertical: 5, paddingHorizontal: 6 }}>
              <Text style={{ fontSize: 8, fontWeight: 800, color: "#ffffff", textTransform: "uppercase" }}>{c.label}</Text>
            </View>
          ))}
        </View>
        {Array.from({ length: total }).map((_, i) => {
          const r = rows[i];
          return (
            <View key={i} wrap={false} style={{ flexDirection: "row", minHeight: 24, borderTopWidth: i === 0 ? 0 : 1, borderColor: PALETTE.line, backgroundColor: i % 2 ? "#fafafa" : "#ffffff" }}>
              {cell(cols[0].width, r ? `${r.name}${r.kind !== "vaccine" ? ` (${HEALTH_KIND_LABEL[r.kind]})` : ""}` : "", true)}
              {cell(cols[1].width, r ? formatDateBR(r.applied_on) : "")}
              {cell(cols[2].width, r ? formatDateBR(r.next_due_on) : "")}
              {cell(cols[3].width, "")}
            </View>
          );
        })}
      </View>
    </View>
  );
}

export function VacinacaoDocument({ data, records }: { data: PetDocData; records: HealthRecord[] }) {
  const { pet, photo } = data;
  const f = petFacts(pet);
  const sortByDate = (a: HealthRecord, b: HealthRecord) => (a.applied_on ?? "").localeCompare(b.applied_on ?? "");
  const vaccines = records.filter((r) => r.kind === "vaccine").sort(sortByDate);
  const parasites = records.filter((r) => r.kind !== "vaccine").sort(sortByDate);

  return (
    <Document title={`Carteira de Vacinação - ${pet.name}`} author="Kit do Pet">
      <Page size="A4" style={[base.page, { padding: 32, paddingBottom: 44 }]}>
        <View style={{ flexDirection: "row", alignItems: "center", backgroundColor: PALETTE.brandSoft, borderRadius: 16, padding: 14 }}>
          <PetPhoto src={photo} size={92} radius={18} border={PALETTE.brand} name={pet.name} />
          <View style={{ marginLeft: 14, flexGrow: 1, flexShrink: 1 }}>
            <Text style={{ fontSize: 9, fontWeight: 800, color: PALETTE.brand, letterSpacing: 1.5 }}>CARTEIRA DE VACINAÇÃO</Text>
            <Text style={{ fontSize: 24, fontWeight: 800, marginBottom: 6 }}>{pet.name}</Text>
            <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
              <Field label="Espécie" value={f.species} style={{ width: "33%" }} />
              <Field label="Raça" value={f.breed} style={{ width: "33%" }} />
              <Field label="Sexo" value={f.sex} style={{ width: "33%" }} />
              <Field label="Nascimento" value={f.birth} style={{ width: "33%" }} />
              <Field label="Tutor(a)" value={f.tutor} style={{ width: "33%" }} />
              <Field label="Registro" value={pet.registry_number} style={{ width: "33%" }} />
            </View>
          </View>
        </View>

        <Table title="Vacinas" color={VACCINE_COLOR} rows={vaccines} blankRows={Math.max(10 - vaccines.length, 4)} firstColumn="Vacina" />
        <Table title="Vermífugos e antipulgas" color={PARASITE_COLOR} rows={parasites} blankRows={Math.max(8 - parasites.length, 4)} firstColumn="Produto" />

        <Text style={{ fontSize: 8.5, color: PALETTE.muted, marginTop: 12 }}>
          As linhas em branco podem ser preenchidas à mão. Siga sempre o calendário indicado pelo seu médico-veterinário.
        </Text>
        <Text fixed style={[base.disclaimer, { position: "absolute", bottom: 20, left: 32, right: 32, textAlign: "center" }]}>
          {DISCLAIMER} Não substitui a carteira emitida pelo médico-veterinário.
        </Text>
      </Page>
    </Document>
  );
}
