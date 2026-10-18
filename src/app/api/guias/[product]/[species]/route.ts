import { NextResponse, type NextRequest } from "next/server";
import { getUser } from "@/lib/auth";
import { getAccess } from "@/lib/entitlements";
import { GUIDE_KEYS, type GuideKey } from "@/lib/products";
import { GUIDES_BUCKET } from "@/lib/storage";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET(request: NextRequest, ctx: { params: Promise<{ product: string; species: string }> }) {
  const { product, species } = await ctx.params;
  const { supabase, user } = await getUser();
  if (!user) return NextResponse.redirect(new URL("/entrar", request.url));
  if (!GUIDE_KEYS.includes(product as GuideKey) || !["dog", "cat"].includes(species)) {
    return new NextResponse("Não encontrado", { status: 404 });
  }

  const access = await getAccess(supabase, user.id);
  if (!access.guides.has(product as GuideKey)) return new NextResponse("Sem acesso a este guia", { status: 403 });

  const admin = createAdminClient();
  const { data: guide } = await admin.from("guides").select("file_path, file_name").eq("product", product).eq("species", species).maybeSingle();
  if (!guide) return new NextResponse("Este guia ainda não foi publicado. Tente mais tarde.", { status: 404 });

  const { data } = await admin.storage.from(GUIDES_BUCKET).createSignedUrl(guide.file_path, 60 * 5, { download: guide.file_name });
  if (!data?.signedUrl) return new NextResponse("Erro ao gerar o download", { status: 500 });
  return NextResponse.redirect(data.signedUrl);
}
