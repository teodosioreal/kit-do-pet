import Link from "next/link";
import { requireAdmin } from "@/lib/auth";

const LINKS = [
  ["/admin", "Hoje"],
  ["/admin/pedidos", "Pedidos"],
  ["/admin/clientes", "Clientes"],
  ["/admin/pets", "Pets"],
  ["/admin/guias", "Guias"],
  ["/admin/webhooks", "Webhooks"],
];

export default async function AdminLayout({ children }: LayoutProps<"/admin">) {
  await requireAdmin();
  return (
    <div className="flex flex-1 flex-col bg-gray-50">
      <header className="sticky top-0 z-30 border-b bg-white">
        <div className="mx-auto flex max-w-6xl items-center gap-4 overflow-x-auto px-4 py-3 text-sm">
          <span className="whitespace-nowrap font-extrabold text-brand-600">🐾 Admin</span>
          {LINKS.map(([href, label]) => (
            <Link key={href} href={href} className="whitespace-nowrap font-semibold text-gray-600 hover:text-brand-600">{label}</Link>
          ))}
          <Link href="/app" className="ml-auto whitespace-nowrap text-gray-400">Área do cliente</Link>
        </div>
      </header>
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6">{children}</main>
    </div>
  );
}
