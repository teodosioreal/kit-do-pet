import Link from "next/link";

export default function Home() {
  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col items-center justify-center gap-6 px-6 py-16 text-center">
      <div className="text-6xl">🐾</div>
      <h1 className="text-3xl font-extrabold text-brand-600">Kit do Pet</h1>
      <p className="text-gray-600">Documentos personalizados do seu pet e identificação por QR code.</p>
      <div className="flex w-full flex-col gap-3">
        <Link href="/cao" className="btn-primary">Tenho um cão</Link>
        <Link href="/gato" className="btn-primary">Tenho um gato</Link>
        <Link href="/entrar" className="btn-secondary">Já comprei — entrar</Link>
      </div>
    </main>
  );
}
