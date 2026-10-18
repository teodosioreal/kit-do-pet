import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { getProfile } from "@/lib/profile";
import { WelcomeForm } from "./welcome-form";

export const metadata: Metadata = { title: "Boas-vindas" };

export default async function WelcomePage() {
  const { supabase, user } = await requireUser("/bem-vindo");
  const profile = await getProfile(supabase, user.id);
  if (profile?.terms_accepted_at) redirect("/app");
  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center gap-6 px-5 py-10">
      <div className="text-center">
        <div className="text-5xl">🐾</div>
        <h1 className="mt-3 text-2xl font-extrabold">Boas-vindas ao Kit do Pet!</h1>
        <p className="mt-1 text-gray-600">Só confirme alguns dados para começar.</p>
      </div>
      <WelcomeForm name={profile?.full_name ?? ""} whatsapp={profile?.whatsapp ?? ""} />
    </main>
  );
}
