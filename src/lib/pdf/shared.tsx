import path from "node:path";
import { Font, Image, StyleSheet, Text, View } from "@react-pdf/renderer";
import { formatDateBR } from "@/lib/dates";
import { SPECIES_LABEL } from "@/lib/products";
import type { Pet, RgColor } from "@/lib/types";
import { SEX_LABEL } from "@/lib/types";

type Style = Exclude<React.ComponentProps<typeof View>["style"], unknown[] | undefined>;

const fontDir = path.join(process.cwd(), "assets", "fonts");
let registered = false;
export function registerFonts() {
  if (registered) return;
  Font.register({
    family: "Nunito",
    fonts: [
      { src: path.join(fontDir, "nunito-latin-400-normal.woff"), fontWeight: 400 },
      { src: path.join(fontDir, "nunito-latin-700-normal.woff"), fontWeight: 700 },
      { src: path.join(fontDir, "nunito-latin-800-normal.woff"), fontWeight: 800 },
    ],
  });
  Font.registerHyphenationCallback((word) => [word]);
  registered = true;
}

export const DISCLAIMER = "Documento personalizado, sem valor oficial.";

export const PALETTE = {
  ink: "#1f2937",
  muted: "#6b7280",
  line: "#e5e7eb",
  brand: "#f97316",
  brandDark: "#c2410c",
  brandSoft: "#fff7ed",
  cream: "#fffaf5",
};

export const RG_THEMES: Record<RgColor, { main: string; dark: string; soft: string }> = {
  green: { main: "#10b981", dark: "#047857", soft: "#ecfdf5" },
  blue: { main: "#0ea5e9", dark: "#0369a1", soft: "#f0f9ff" },
  pink: { main: "#f472b6", dark: "#be185d", soft: "#fdf2f8" },
};

export const base = StyleSheet.create({
  page: { fontFamily: "Nunito", fontSize: 10, color: PALETTE.ink, backgroundColor: "#ffffff" },
  label: { fontSize: 7, fontWeight: 700, color: PALETTE.muted, textTransform: "uppercase", letterSpacing: 0.5 },
  value: { fontSize: 10, fontWeight: 700 },
  disclaimer: { fontSize: 6.5, color: PALETTE.muted },
});

export type PetDocData = {
  pet: Pet;
  photo: string | null; // data URL
  qr: string; // data URL
  publicUrl: string;
};

export function petFacts(pet: Pet) {
  return {
    species: SPECIES_LABEL[pet.species],
    breed: pet.breed || "—",
    sex: pet.sex ? SEX_LABEL[pet.sex] : "—",
    color: pet.color || "—",
    birth: pet.birth_date ? formatDateBR(pet.birth_date) : "—",
    birthPlace: pet.birth_place || "—",
    tutor: pet.tutor_name || "—",
  };
}

export function Field({ label, value, style }: { label: string; value: string; style?: Style }) {
  return (
    <View style={[{ marginBottom: 5 }, style ?? {}]}>
      <Text style={base.label}>{label}</Text>
      <Text style={base.value}>{value}</Text>
    </View>
  );
}

/** Foto do pet ou um quadro com a inicial do nome. */
export function PetPhoto({ src, size, radius, border, name }: { src: string | null; size: number; radius: number; border: string; name: string }) {
  const box: Style = { width: size, height: size, minWidth: size, flexShrink: 0, flexGrow: 0, alignSelf: "flex-start" };
  const frame: Style = { width: size, height: size, borderRadius: radius, borderWidth: 3, borderColor: border, overflow: "hidden" };
  return (
    <View style={box}>
      {src ? (
        // eslint-disable-next-line jsx-a11y/alt-text
        <Image src={src} style={{ ...frame, objectFit: "cover" }} />
      ) : (
        <View style={{ ...frame, backgroundColor: PALETTE.brandSoft, alignItems: "center", justifyContent: "center" }}>
          <Text style={{ fontSize: size / 2.4, fontWeight: 800, color: border }}>{name.slice(0, 1).toUpperCase()}</Text>
        </View>
      )}
    </View>
  );
}

/** Patinha desenhada com círculos (sem emoji, que o PDF não renderiza). */
export function Paw({ size, color }: { size: number; color: string }) {
  const u = size / 100;
  const dot = (left: number, top: number, w: number, h: number) => (
    <View style={{ position: "absolute", left: left * u, top: top * u, width: w * u, height: h * u, borderRadius: 50 * u, backgroundColor: color }} />
  );
  return (
    <View style={{ width: size, height: size, position: "relative" }}>
      {dot(8, 26, 18, 24)}
      {dot(28, 8, 17, 23)}
      {dot(55, 8, 17, 23)}
      {dot(74, 26, 18, 24)}
      {dot(24, 46, 52, 44)}
    </View>
  );
}

export function issuedOn() {
  return new Intl.DateTimeFormat("pt-BR", { timeZone: "America/Sao_Paulo" }).format(new Date());
}
