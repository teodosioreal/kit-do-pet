import "server-only";
import { addDaysISO, formatDateBR, todayISO } from "@/lib/dates";
import { env } from "@/lib/env";
import { reminderMessage, renewalMessage } from "@/lib/messages";
import { createAdminClient } from "@/lib/supabase/admin";
import type { HealthKind } from "@/lib/types";
import { sendWhatsappText } from "@/lib/whatsapp";

const RENEWAL_NOTICE_DAYS = 30;

type ReminderKind = "due_in_3_days" | "due_today" | "renewal";

export type ReminderRunResult = { day: string; sent: number; failed: number; skipped: number };

/**
 * Rotina diária: avisa 3 dias antes e no dia de cada próxima dose e manda o
 * link de renovação 30 dias antes do fim do plano. Cada envio é registrado
 * antes em reminder_log (chave única), então rodar duas vezes não duplica.
 */
export async function runDailyReminders(now = new Date()): Promise<ReminderRunResult> {
  const admin = createAdminClient();
  const today = todayISO(now);
  const in3 = addDaysISO(today, 3);
  const result: ReminderRunResult = { day: today, sent: 0, failed: 0, skipped: 0 };

  // 1. Quem tem o plano de lembretes ativo (e até quando)
  const { data: plans } = await admin.from("active_entitlements").select("user_id, expires_at").eq("product", "reminders");
  const planUntil = new Map<string, string>();
  for (const p of plans ?? []) {
    if (!p.expires_at) continue;
    const current = planUntil.get(p.user_id);
    if (!current || p.expires_at > current) planUntil.set(p.user_id, p.expires_at);
  }
  if (!planUntil.size) return result;

  // 2. Perfis com lembretes ligados e consentimento de WhatsApp
  const { data: profiles } = await admin
    .from("profiles")
    .select("id, full_name, whatsapp, reminders_whatsapp, reminders_enabled, whatsapp_consent_at")
    .in("id", [...planUntil.keys()]);
  const recipients = new Map<string, { name: string | null; phone: string }>();
  for (const p of profiles ?? []) {
    const phone = p.reminders_whatsapp || p.whatsapp;
    if (p.reminders_enabled && p.whatsapp_consent_at && phone) recipients.set(p.id, { name: p.full_name, phone });
  }

  async function deliver(userId: string, kind: ReminderKind, refDate: string, recordId: string | null, text: string) {
    const to = recipients.get(userId)!;
    // "Reserva" o envio; se já existe (mesmo usuário, registro, tipo e data), não envia de novo
    const { data: claimed } = await admin
      .from("reminder_log")
      .upsert(
        { user_id: userId, health_record_id: recordId, kind, ref_date: refDate, phone: to.phone, status: "sent" },
        { onConflict: "user_id,health_record_id,kind,ref_date", ignoreDuplicates: true },
      )
      .select("id");
    if (!claimed?.length) {
      result.skipped++;
      return;
    }
    const sent = await sendWhatsappText(to.phone, text);
    if (sent.ok) {
      result.sent++;
    } else {
      result.failed++;
      await admin.from("reminder_log").update({ status: "failed", error: sent.error }).eq("id", claimed[0].id);
    }
  }

  // 3. Doses de hoje e de daqui a 3 dias
  const userIds = [...recipients.keys()];
  if (userIds.length) {
    const { data: records } = await admin
      .from("health_records")
      .select("id, user_id, kind, name, next_due_on, pets(name, sex, tutor_name)")
      .in("user_id", userIds)
      .in("next_due_on", [today, in3]);

    for (const r of records ?? []) {
      const pet = (Array.isArray(r.pets) ? r.pets[0] : r.pets) as { name: string; sex: "male" | "female" | null; tutor_name: string | null } | null;
      if (!pet) continue;
      // o lembrete só vale enquanto o plano estiver ativo na data da dose
      if ((planUntil.get(r.user_id) ?? "") < `${r.next_due_on}T00:00:00`) continue;
      const daysBefore = r.next_due_on === today ? 0 : 3;
      const text = reminderMessage({
        tutorName: recipients.get(r.user_id)!.name ?? pet.tutor_name,
        petName: pet.name,
        petSex: pet.sex,
        kind: r.kind as HealthKind,
        itemName: r.name,
        daysBefore,
      });
      await deliver(r.user_id, daysBefore === 0 ? "due_today" : "due_in_3_days", r.next_due_on, r.id, text);
    }
  }

  // 4. Aviso de renovação (uma vez por data de vencimento)
  const renewalLimit = addDaysISO(today, RENEWAL_NOTICE_DAYS);
  for (const [userId, until] of planUntil) {
    if (!recipients.has(userId)) continue;
    const untilDay = todayISO(new Date(until));
    if (untilDay > renewalLimit) continue;
    await deliver(userId, "renewal", untilDay, null, renewalMessage(recipients.get(userId)!.name, formatDateBR(untilDay), env.renewalUrl));
  }

  return result;
}
