import { NextResponse, type NextRequest } from "next/server";
import { getUser } from "@/lib/auth";
import { getAccess } from "@/lib/entitlements";
import { DOC_SLUGS, docFileName, renderPetDocument, type DocSlug } from "@/lib/pdf/render";
import type { Pet, RgColor } from "@/lib/types";

export const maxDuration = 30;

export async function GET(request: NextRequest, ctx: { params: Promise<{ id: string; doc: string }> }) {
  const { id, doc } = await ctx.params;
  if (!DOC_SLUGS.includes(doc as DocSlug)) return new NextResponse("Documento inválido", { status: 404 });

  const { supabase, user } = await getUser();
  if (!user) return NextResponse.redirect(new URL("/entrar", request.url));

  const access = await getAccess(supabase, user.id);
  if (!access.hasKit) return new NextResponse("O Kit do Pet não está ativo na sua conta.", { status: 403 });

  // RLS: só encontra o pet se for do usuário logado
  const { data: pet } = await supabase.from("pets").select("*").eq("id", id).maybeSingle();
  if (!pet) return new NextResponse("Pet não encontrado", { status: 404 });

  const cor = request.nextUrl.searchParams.get("cor");
  const rgColor = (["green", "blue", "pink"] as const).includes(cor as RgColor) ? (cor as RgColor) : undefined;

  const pdf = await renderPetDocument(supabase, pet as Pet, doc as DocSlug, { rgColor });
  return new NextResponse(new Uint8Array(pdf), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${docFileName(doc as DocSlug, pet as Pet)}"`,
      "Cache-Control": "private, no-store",
    },
  });
}
