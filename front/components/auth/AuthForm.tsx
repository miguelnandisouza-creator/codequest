import Link from "next/link";

type Props = {
  mode: "login" | "register";
};

export default function AuthForm({ mode }: Props) {
  const isRegister = mode === "register";

  return (
    <div className="cq-panel p-6 md:p-8">
      <div className="flex rounded-md border border-[#26384f] bg-[#07101d] p-1">
        <Link
          href="/login"
          className={[
            "flex-1 rounded px-4 py-3 text-center font-mono text-sm font-bold",
            !isRegister
              ? "bg-[#2f66e8] text-white"
              : "text-[#93a4bd] hover:text-white",
          ].join(" ")}
        >
          Login
        </Link>
        <Link
          href="/register"
          className={[
            "flex-1 rounded px-4 py-3 text-center font-mono text-sm font-bold",
            isRegister
              ? "bg-[#2f66e8] text-white"
              : "text-[#93a4bd] hover:text-white",
          ].join(" ")}
        >
          Criar conta
        </Link>
      </div>

      <div className="mt-8">
        <p className="cq-kicker">{isRegister ? "New hero" : "Session"}</p>
        <h2 className="cq-title mt-3 text-3xl">
          {isRegister ? "Criar conta" : "Entrar"}
        </h2>
        <p className="mt-3 leading-7 text-[#93a4bd]">
          {isRegister
            ? "Crie um perfil local para guardar sua jornada no CodeQuest."
            : "Continue sua campanha com o progresso salvo neste navegador."}
        </p>
      </div>

      <form
        action={isRegister ? "/api/auth/register" : "/api/auth/login"}
        method="post"
        className="mt-7 space-y-4"
      >
        {isRegister && (
          <label className="block">
            <span className="mb-2 block font-mono text-xs font-bold uppercase tracking-[0.1em] text-[#9ec0ff]">
              Nome
            </span>
            <input
              name="name"
              className="w-full rounded-md border border-[#26384f] bg-[#07101d] px-4 py-3 text-white outline-none focus:border-[#5b8cff]"
              placeholder="Seu nome"
              autoComplete="name"
            />
          </label>
        )}

        <label className="block">
          <span className="mb-2 block font-mono text-xs font-bold uppercase tracking-[0.1em] text-[#9ec0ff]">
            Email
          </span>
          <input
            name="email"
            className="w-full rounded-md border border-[#26384f] bg-[#07101d] px-4 py-3 text-white outline-none focus:border-[#5b8cff]"
            placeholder="voce@email.com"
            type="email"
            autoComplete="email"
            required
          />
        </label>

        <label className="block">
          <span className="mb-2 block font-mono text-xs font-bold uppercase tracking-[0.1em] text-[#9ec0ff]">
            Senha
          </span>
          <div className="flex rounded-md border border-[#26384f] bg-[#07101d] focus-within:border-[#5b8cff]">
            <input
              name="password"
              className="min-w-0 flex-1 bg-transparent px-4 py-3 text-white outline-none"
              placeholder="Minimo 6 caracteres"
              type="password"
              autoComplete={isRegister ? "new-password" : "current-password"}
              required
            />
          </div>
        </label>

        {isRegister && (
          <label className="block">
            <span className="mb-2 block font-mono text-xs font-bold uppercase tracking-[0.1em] text-[#9ec0ff]">
              Confirmar senha
            </span>
            <div className="flex rounded-md border border-[#26384f] bg-[#07101d] focus-within:border-[#5b8cff]">
              <input
                name="confirmPassword"
                className="min-w-0 flex-1 bg-transparent px-4 py-3 text-white outline-none"
                placeholder="Repita sua senha"
                type="password"
                autoComplete="new-password"
                required
              />
            </div>
          </label>
        )}

        <div className="flex flex-wrap items-center gap-3 pt-2">
          <button type="submit" className="cq-button">
            {isRegister ? "Registrar conta" : "Entrar na conta"}
          </button>

          <Link href="/" className="cq-button cq-button-secondary">
            Voltar
          </Link>
        </div>
      </form>
    </div>
  );
}
