import { ImageResponse } from "next/og";
import { PawArt } from "@/components/paw-icon";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(<PawArt size={180} />, size);
}
