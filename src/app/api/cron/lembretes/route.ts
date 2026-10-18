import { NextResponse, type NextRequest } from "next/server";
import { env } from "@/lib/env";
import { runDailyReminders } from "@/lib/reminders";

export const maxDuration = 300;

// Chamado pelo cron da Vercel (vercel.json) uma vez por dia.
// A Vercel envia "Authorization: Bearer <CRON_SECRET>".
export async function GET(request: NextRequest) {
  const secret = env.cronSecret;
  if (!secret || request.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }
  const result = await runDailyReminders();
  console.log("[cron lembretes]", result);
  return NextResponse.json({ ok: true, ...result });
}
