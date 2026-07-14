import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-zinc-950 p-6 text-white">
      <div className="max-w-xl text-center">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-400">
          Caminho desconhecido
        </p>

        <h1 className="mt-4 text-4xl font-bold">
          Esta parte do reino ainda nao foi descoberta.
        </h1>

        <p className="mt-4 text-zinc-400">
          Volte ao mapa principal para escolher uma campanha, capitulo ou fase valida.
        </p>

        <Link
          href="/dashboard"
          className="mt-8 inline-block rounded-lg bg-blue-600 px-6 py-3 font-semibold transition hover:bg-blue-700"
        >
          Voltar ao mapa
        </Link>
      </div>
    </main>
  );
}
