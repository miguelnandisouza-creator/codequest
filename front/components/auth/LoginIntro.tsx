export default function LoginIntro() {
  return (
    <div className="cq-panel flex min-h-80 flex-col justify-between p-6 md:p-8">
      <div>
        <p className="cq-kicker">Access gate</p>
        <h1 className="cq-title mt-4 text-4xl md:text-5xl">
          CodeQuest
        </h1>
        <p className="mt-5 max-w-md leading-7 text-[#93a4bd]">
          Entre ou registre sua conta para deixar sua jornada pronta para os proximos sistemas que vamos adicionar.
        </p>
      </div>

      <div className="mt-10 rounded-md border border-[#26384f] bg-[#050914]/42 p-4">
        <p className="font-mono text-xs uppercase tracking-[0.12em] text-[#9ec0ff]">
          Conta local
        </p>
        <p className="mt-2 text-sm leading-6 text-[#93a4bd]">
          Nesta versao, os dados ficam salvos no navegador. A tela registra, entra e cria sessao.
        </p>
      </div>
    </div>
  );
}
