import { ImageResponse } from "next/og";
import { PawArt } from "@/components/paw-icon";

const ALLOWED = new Set([180, 192, 512]);

export async function GET(_req: Request, ctx: { params: Promise<{ size: string }> }) {
  const { size: raw } = await ctx.params;
  const size = ALLOWED.has(Number(raw)) ? Number(raw) : 192;
  return new ImageResponse(<PawArt size={size} />, {
    width: size,
    height: size,
    headers: { "Cache-Control": "public, max-age=31536000, immutable" },
  });
}
