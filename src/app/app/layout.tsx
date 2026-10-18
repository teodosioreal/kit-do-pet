import Link from "next/link";
import { redirect } from "next/navigation";
import { isAdminEmail, requireUser } from "@/lib/auth";
import { getProfile } from "@/lib/profile";

export default async function AppLayout({ children }: LayoutProps<"/app">) {
  const { supabase, user } = await requireUser();
  const profile = await getProfile(supabase, user.id);
  if (!profile?.terms_accepted_at) redirect("/bem-vindo");

  return (
    <div className="flex flex-1 flex-col pb-20">
      <header className="sticky top-0 z-30 border-b border-black/5 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-2xl items-center justify-between px-4 py-3">
          <Link href="/app" className="flex items-center gap-2 text-lg font-extrabold text-brand-600">
            <span>🐾</span> Kit do Pet
          </Link>
          <div className="flex items-center gap-3 text-sm">
            {isAdminEmail(user.email) && <Link href="/admin" className="font-semibold text-gray-600">Admin</Link>}
            <form action="/auth/sair" method="post">
              <button className="font-semibold text-gray-500">Sair</button>
            </form>
          </div>
        </div>
      </header>
      <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-5">{children}</main>
      <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-black/5 bg-white pb-[env(safe-area-inset-bottom)]">
        <div className="mx-auto grid max-w-2xl grid-cols-3 text-center text-xs font-semibold text-gray-600">
          <Link href="/app" className="flex flex-col items-center gap-0.5 py-2.5"><span className="text-xl">🐶</span>Meus pets</Link>
          <Link href="/app/bonus" className="flex flex-col items-center gap-0.5 py-2.5"><span className="text-xl">🎁</span>Meus bônus</Link>
          <Link href="/app/conta" className="flex flex-col items-center gap-0.5 py-2.5"><span className="text-xl">⚙️</span>Conta</Link>
        </div>
      </nav>
    </div>
  );
}
