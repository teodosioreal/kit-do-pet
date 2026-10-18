import Link from "next/link";

export function LegalPage({ title, updated, children }: { title: string; updated: string; children: React.ReactNode }) {
  return (
    <main className="mx-auto w-full max-w-2xl px-5 py-10">
      <Link href="/" className="text-sm font-semibold text-brand-600">‹ Kit do Pet</Link>
      <h1 className="mt-4 text-3xl font-extrabold">{title}</h1>
      <p className="mt-1 text-sm text-gray-500">Última atualização: {updated}</p>
      <div className="mt-6 flex flex-col gap-4 leading-relaxed text-gray-700 [&_h2]:mt-4 [&_h2]:text-xl [&_h2]:font-bold [&_h2]:text-gray-900 [&_ul]:list-disc [&_ul]:pl-6">
        {children}
      </div>
    </main>
  );
}
