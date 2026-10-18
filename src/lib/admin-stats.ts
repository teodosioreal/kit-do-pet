import "server-only";
import { addDaysISO, todayISO } from "@/lib/dates";
import type { ProductKey } from "@/lib/products";
import { createAdminClient } from "@/lib/supabase/admin";

/** Início do dia (AAAA-MM-DD) no horário de Brasília, em ISO UTC. */
export function startOfDayBR(dayISO: string) {
  return new Date(`${dayISO}T00:00:00-03:00`).toISOString();
}

export type DayStats = {
  day: string;
  /** Pedidos com o Kit do Pet (venda principal). */
  orders: number;
  /** Pedidos aprovados sem o kit (renovação de lembretes, mais um pet avulso...). */
  otherOrders: number;
  revenueCents: number;
  refunds: number;
  bumpRate: Record<Exclude<ProductKey, "kit">, number>;
  remindersSent: number;
  remindersFailed: number;
};

export async function getDayStats(day = todayISO()): Promise<DayStats> {
  const admin = createAdminClient();
  const from = startOfDayBR(day);
  const to = startOfDayBR(addDaysISO(day, 1));
  const [{ data: orders }, { count: refunds }, { count: sent }, { count: failed }] = await Promise.all([
    admin.from("orders").select("items, amount_cents").eq("status", "approved").gte("approved_at", from).lt("approved_at", to),
    admin.from("orders").select("id", { count: "exact", head: true }).in("status", ["refunded", "chargeback"]).gte("revoked_at", from).lt("revoked_at", to),
    admin.from("reminder_log").select("id", { count: "exact", head: true }).eq("status", "sent").gte("created_at", from).lt("created_at", to),
    admin.from("reminder_log").select("id", { count: "exact", head: true }).eq("status", "failed").gte("created_at", from).lt("created_at", to),
  ]);
  const all = orders ?? [];
  // % de order bump: só sobre os pedidos que têm o produto principal
  const list = all.filter((o) => (o.items as string[]).includes("kit"));
  const rate = (key: ProductKey) => (list.length ? list.filter((o) => (o.items as string[]).includes(key)).length / list.length : 0);
  return {
    day,
    orders: list.length,
    otherOrders: all.length - list.length,
    revenueCents: all.reduce((sum, o) => sum + (o.amount_cents ?? 0), 0),
    refunds: refunds ?? 0,
    bumpRate: {
      reminders: rate("reminders"),
      extra_pet: rate("extra_pet"),
      guide_training: rate("guide_training"),
      guide_treats: rate("guide_treats"),
    },
    remindersSent: sent ?? 0,
    remindersFailed: failed ?? 0,
  };
}
