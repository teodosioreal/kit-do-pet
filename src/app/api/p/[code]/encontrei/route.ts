import { createHmac } from "node:crypto";
import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { formatDateTimeBR } from "@/lib/dates";
import { env } from "@/lib/env";
import { normalizePhone } from "@/lib/phone";
import { getPublicPet, ownerContactNumber } from "@/lib/public-pet";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendWhatsappText } from "@/lib/whatsapp";

// Limites de envio do "Encontrei este pet"
const LIMITS = { perIpPerHour: 3, perPetPerHour: 5, perPetPerDay: 15 };

const bodySchema = z.object({
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),
  accuracy: z.number().min(0).max(100_000).optional(),
  phone: z.string().max(20).optional(),
});

function clientIp(request: NextRequest) {
  return request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || request.headers.get("x-real-ip") || "unknown";
}

export async function POST(request: NextRequest, ctx: { params: Promise<{ code: string }> }) {
  const { code } = await ctx.params;
  const result = await getPublicPet(code);
  if (!result?.active) return NextResponse.json({ message: "Pet não encontrado." }, { status: 404 });
  const { pet } = result;

  const parsed = bodySchema.safeParse(await request.json().catch(() => ({})));
  if (!parsed.success) return NextResponse.json({ message: "Dados inválidos." }, { status: 400 });
  const { latitude, longitude, accuracy } = parsed.data;
  const hasLocation = latitude !== undefined && longitude !== undefined;
  const finderPhone = normalizePhone(parsed.data.phone);

  const admin = createAdminClient();
  const ipHash = createHmac("sha256", env.appSecret).update(clientIp(request)).digest("hex");
  const hourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
  const dayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

  const [byIp, byPetHour, byPetDay] = await Promise.all([
    admin.from("found_reports").select("id", { count: "exact", head: true }).eq("ip_hash", ipHash).gte("created_at", hourAgo),
    admin.from("found_reports").select("id", { count: "exact", head: true }).eq("pet_id", pet.id).gte("created_at", hourAgo),
    admin.from("found_reports").select("id", { count: "exact", head: true }).eq("pet_id", pet.id).gte("created_at", dayAgo),
  ]);
  if ((byIp.count ?? 0) >= LIMITS.perIpPerHour || (byPetHour.count ?? 0) >= LIMITS.perPetPerHour || (byPetDay.count ?? 0) >= LIMITS.perPetPerDay) {
    return NextResponse.json(
      { message: "O tutor já foi avisado há pouco. Se puder, use o botão \"Falar com o tutor\"." },
      { status: 429 },
    );
  }

  const { data: report } = await admin
    .from("found_reports")
    .insert({ pet_id: pet.id, ip_hash: ipHash, latitude: latitude ?? null, longitude: longitude ?? null, accuracy_m: accuracy ?? null })
    .select("id")
    .single();

  const number = await ownerContactNumber(pet);
  if (!number) return NextResponse.json({ message: "Não foi possível avisar o tutor agora." }, { status: 503 });

  const lines = [
    `🐾 Alguém encontrou *${pet.name}* e escaneou o QR code!`,
    hasLocation
      ? `📍 Localização: https://www.google.com/maps?q=${latitude!.toFixed(6)},${longitude!.toFixed(6)}${accuracy ? ` (precisão de ~${Math.round(accuracy)} m)` : ""}`
      : "📍 A pessoa preferiu não enviar a localização.",
    finderPhone ? `📞 Telefone de quem encontrou: +${finderPhone} (https://wa.me/${finderPhone})` : null,
    `🕒 ${formatDateTimeBR(new Date())}`,
  ].filter(Boolean);

  const sent = await sendWhatsappText(number, lines.join("\n"));
  if (report) await admin.from("found_reports").update({ notified: sent.ok }).eq("id", report.id);
  if (!sent.ok) return NextResponse.json({ message: "Não foi possível avisar o tutor agora. Tente o botão \"Falar com o tutor\"." }, { status: 502 });
  return NextResponse.json({ ok: true });
}
