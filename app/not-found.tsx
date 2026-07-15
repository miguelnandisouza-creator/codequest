import Link from "next/link";

export default function NotFound() {
  return (
    <main className="cq-page flex items-center justify-center p-6">
      <div className="cq-panel max-w-xl p-8 text-center">
        <p className="cq-kicker">
          Caminho desconhecido
        </p>

        <h1 className="cq-title mt-4 text-4xl">
          Esta parte do reino ainda nao foi descoberta.
        </h1>

        <p className="mt-4 text-[#93a4bd]">
          Volte ao mapa principal para escolher uma campanha, capitulo ou fase valida.
        </p>

        <Link
          href="/dashboard"
          className="cq-button mt-8"
        >
          Voltar ao mapa
        </Link>
      </div>
    </main>
  );
}
