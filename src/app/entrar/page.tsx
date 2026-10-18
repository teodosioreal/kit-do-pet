import type { Metadata } from "next";
import Link from "next/link";
import { LoginForm } from "./login-form";

export const metadata: Metadata = { title: "Entrar" };

export default async function EntrarPage({ searchParams }: { searchParams: Promise<{ next?: string; erro?: string }> }) {
  const { next, erro } = await searchParams;
  const safeNext = next && next.startsWith("/") && !next.startsWith("//") ? next : "/app";
  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center gap-6 px-5 py-12">
      <div className="text-center">
        <Link href="/" className="text-5xl">🐾</Link>
        <h1 className="mt-3 text-2xl font-extrabold">Entrar no Kit do Pet</h1>
        <p className="mt-1 text-gray-600">Sem senha: enviamos um link para o seu e-mail.</p>
      </div>
      {erro === "link" && (
        <p className="rounded-xl bg-amber-50 p-3 text-sm text-amber-800">
          Esse link expirou ou já foi usado. Peça um novo abaixo.
        </p>
      )}
      <LoginForm next={safeNext} />
      <p className="text-center text-sm text-gray-500">
        Ainda não tem o kit? <Link href="/" className="font-semibold text-brand-600">Conheça</Link>
      </p>
    </main>
  );
}
