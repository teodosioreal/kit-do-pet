import "server-only";
import QRCode from "qrcode";
import { env } from "@/lib/env";

export function publicPetUrl(code: string) {
  return `${env.siteUrl}/p/${code}`;
}

export function qrDataUrl(text: string, dark = "#1f2937") {
  return QRCode.toDataURL(text, { margin: 1, width: 512, errorCorrectionLevel: "M", color: { dark, light: "#ffffff" } });
}
