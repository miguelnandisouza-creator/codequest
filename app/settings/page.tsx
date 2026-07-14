"use client";

import { usePlayer } from "@/application/hooks/usePlayer";

export default function SettingsPage() {
  const { resetProgress } = usePlayer();

  return (
    <main className="min-h-screen bg-zinc-950 p-10 text-white">
      <h1 className="text-5xl font-bold">Configuracoes</h1>

      <section className="mt-10 max-w-2xl rounded-xl border border-zinc-800 bg-zinc-900 p-6">
        <h2 className="text-2xl font-bold">Progresso local</h2>
        <p className="mt-3 text-zinc-400">
          O CodeQuest ainda roda sem backend. Seu progresso fica salvo no localStorage deste navegador.
        </p>

        <button
          onClick={resetProgress}
          className="mt-6 rounded-lg bg-red-600 px-5 py-3 font-semibold hover:bg-red-700"
        >
          Resetar progresso
        </button>
      </section>
    </main>
  );
}
