import type { Metadata } from "next";
import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { getAccess } from "@/lib/entitlements";
import { getProfile } from "@/lib/profile";
import { AccountForm } from "./account-form";

export const metadata: Metadata = { title: "Conta" };

export default async function AccountPage() {
  const { supabase, user } = await requireUser();
  const [profile, access] = await Promise.all([getProfile(supabase, user.id), getAccess(supabase, user.id)]);
  if (!profile) return null;
  const until = access.remindersUntil
    ? new Intl.DateTimeFormat("pt-BR", { timeZone: "America/Sao_Paulo" }).format(access.remindersUntil)
    : null;

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl font-extrabold">Conta</h1>
      <AccountForm profile={profile} remindersUntil={until} />
      <p className="text-center text-xs text-gray-500">
        <Link href="/termos" className="underline">Termos de uso</Link> · <Link href="/privacidade" className="underline">Privacidade</Link>
      </p>
    </div>
  );
}
