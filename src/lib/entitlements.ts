import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { GuideKey } from "@/lib/products";
import type { Entitlement } from "@/lib/types";

export type UserAccess = {
  hasKit: boolean;
  petLimit: number;
  remindersUntil: Date | null;
  guides: Set<GuideKey>;
};

export function summarizeAccess(rows: Entitlement[]): UserAccess {
  const access: UserAccess = { hasKit: false, petLimit: 0, remindersUntil: null, guides: new Set() };
  for (const row of rows) {
    switch (row.product) {
      case "kit":
        access.hasKit = true;
        access.petLimit += row.quantity;
        break;
      case "extra_pet":
        access.petLimit += row.quantity;
        break;
      case "reminders": {
        const until = row.expires_at ? new Date(row.expires_at) : null;
        if (until && (!access.remindersUntil || until > access.remindersUntil)) access.remindersUntil = until;
        break;
      }
      case "guide_training":
      case "guide_treats":
        access.guides.add(row.product);
        break;
    }
  }
  return access;
}

/** Direitos ativos. Com o cliente da sessão, o RLS limita ao próprio usuário. */
export async function getAccess(supabase: SupabaseClient, userId: string): Promise<UserAccess> {
  const { data, error } = await supabase.from("active_entitlements").select("*").eq("user_id", userId);
  if (error) throw error;
  return summarizeAccess((data ?? []) as Entitlement[]);
}
