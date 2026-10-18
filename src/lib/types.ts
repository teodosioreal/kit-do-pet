import type { ProductKey, Species } from "@/lib/products";

export type PublicFields = {
  photo: boolean;
  species: boolean;
  breed: boolean;
  sex: boolean;
  color: boolean;
  birth_date: boolean;
  traits: boolean;
  notes: boolean;
  tutor_name: boolean;
  contact: boolean;
};

export const PUBLIC_FIELD_LABELS: Record<keyof PublicFields, string> = {
  photo: "Foto",
  species: "Espécie",
  breed: "Raça",
  sex: "Sexo",
  color: "Cor",
  birth_date: "Data de nascimento",
  traits: "Características",
  notes: "Observações",
  tutor_name: "Nome do tutor",
  contact: "Botão \"Falar com o tutor\" (WhatsApp)",
};

export type RgColor = "green" | "blue" | "pink";

export type Pet = {
  id: string;
  user_id: string;
  public_code: string;
  registry_number: string;
  name: string;
  species: Species;
  breed: string | null;
  sex: "male" | "female" | null;
  color: string | null;
  birth_date: string | null;
  birth_place: string | null;
  photo_path: string | null;
  traits: string | null;
  notes: string | null;
  tutor_name: string | null;
  tutor_whatsapp: string | null;
  rg_color: RgColor;
  public_fields: PublicFields;
  created_at: string;
  updated_at: string;
};

export type HealthKind = "vaccine" | "dewormer" | "antiflea";
export const HEALTH_KIND_LABEL: Record<HealthKind, string> = {
  vaccine: "Vacina",
  dewormer: "Vermífugo",
  antiflea: "Antipulgas",
};

export type HealthRecord = {
  id: string;
  pet_id: string;
  user_id: string;
  kind: HealthKind;
  name: string;
  applied_on: string | null;
  next_due_on: string | null;
  notes: string | null;
  created_at: string;
};

export type Profile = {
  id: string;
  email: string;
  full_name: string | null;
  whatsapp: string | null;
  whatsapp_consent_at: string | null;
  terms_accepted_at: string | null;
  reminders_enabled: boolean;
  reminders_whatsapp: string | null;
};

export type Entitlement = {
  id: string;
  user_id: string;
  order_id: string | null;
  product: ProductKey;
  quantity: number;
  starts_at: string;
  expires_at: string | null;
  revoked_at: string | null;
  source: "order" | "manual";
  note: string | null;
  created_at: string;
};

export const SEX_LABEL = { male: "Macho", female: "Fêmea" } as const;
export const RG_COLOR_LABEL: Record<RgColor, string> = { green: "Verde", blue: "Azul", pink: "Rosa" };
