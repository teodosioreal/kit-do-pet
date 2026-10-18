import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Profile } from "@/lib/types";

export async function getProfile(supabase: SupabaseClient, userId: string) {
  const { data } = await supabase.from("profiles").select("*").eq("id", userId).single();
  return data as Profile | null;
}
