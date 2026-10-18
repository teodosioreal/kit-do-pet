import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";

export const PET_PHOTOS_BUCKET = "pet-photos";
export const GUIDES_BUCKET = "guides";

/** URL temporária da foto (use só depois de checar permissão). */
export async function signedPhotoUrl(path: string | null, expiresIn = 60 * 60) {
  if (!path) return null;
  const { data } = await createAdminClient().storage.from(PET_PHOTOS_BUCKET).createSignedUrl(path, expiresIn);
  return data?.signedUrl ?? null;
}

export async function signedPhotoUrls(paths: (string | null)[], expiresIn = 60 * 60) {
  const valid = paths.filter((p): p is string => !!p);
  if (!valid.length) return new Map<string, string>();
  const { data } = await createAdminClient().storage.from(PET_PHOTOS_BUCKET).createSignedUrls(valid, expiresIn);
  return new Map((data ?? []).filter((d) => d.signedUrl && d.path).map((d) => [d.path as string, d.signedUrl]));
}

export async function downloadPhoto(path: string | null): Promise<Buffer | null> {
  if (!path) return null;
  const { data } = await createAdminClient().storage.from(PET_PHOTOS_BUCKET).download(path);
  return data ? Buffer.from(await data.arrayBuffer()) : null;
}
