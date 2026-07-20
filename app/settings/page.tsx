"use client";

import { usePlayer } from "@/application/hooks/usePlayer";

export default function SettingsPage() {
  const { resetProgress } = usePlayer();
  const handleResetProgress = () => {
    const confirmed = window.confirm(
      "Tem certeza que quer resetar seu progresso neste navegador?"
    );

    if (confirmed) {
      resetProgress();
    }
  };

  return (
    <main className="cq-page">
      <section className="cq-shell">
        <p className="cq-kicker">Sistema</p>
        <h1 className="cq-title mt-3 text-4xl md:text-6xl">Configuracoes</h1>

        <section className="cq-panel mt-10 max-w-2xl p-6">
          <h2 className="cq-title text-2xl">Progresso da conta</h2>
          <p className="mt-3 leading-7 text-[#93a4bd]">
            O CodeQuest sincroniza o progresso da conta com o servidor e mantem uma copia neste navegador para continuar respondendo rapido.
          </p>

          <button
            onClick={handleResetProgress}
            className="cq-button mt-6 border-red-300 bg-red-700 hover:bg-red-600"
          >
            Resetar progresso
          </button>
        </section>
      </section>
    </main>
  );
}
