import { NextResponse, type NextRequest } from "next/server";
import { verifyAccessToken } from "@/lib/access-link";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

// Abre a sessão a partir do link enviado por e-mail/WhatsApp após a compra.
export async function GET(request: NextRequest, ctx: { params: Promise<{ token: string }> }) {
  const { token } = await ctx.params;
  const fail = NextResponse.redirect(new URL("/entrar?erro=link", request.url));

  const verified = verifyAccessToken(token);
  if (!verified) return fail;

  const admin = createAdminClient();
  const { data: userData } = await admin.auth.admin.getUserById(verified.userId);
  const email = userData.user?.email;
  if (!email) return fail;

  const { data: link, error } = await admin.auth.admin.generateLink({ type: "magiclink", email });
  if (error || !link.properties?.hashed_token) return fail;

  const supabase = await createClient();
  const { error: otpError } = await supabase.auth.verifyOtp({
    type: "magiclink",
    token_hash: link.properties.hashed_token,
  });
  if (otpError) return fail;

  return NextResponse.redirect(new URL("/app", request.url));
}
