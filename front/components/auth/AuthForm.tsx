"use client";

import Link from "next/link";
import { useState } from "react";

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

        <PasswordField
          name="password"
          label="Senha"
          placeholder="Minimo 6 caracteres"
          autoComplete={isRegister ? "new-password" : "current-password"}
        />

        {isRegister && (
          <PasswordField
            name="confirmPassword"
            label="Confirmar senha"
            placeholder="Repita sua senha"
            autoComplete="new-password"
          />
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

function PasswordField({
  name,
  label,
  placeholder,
  autoComplete,
}: {
  name: string;
  label: string;
  placeholder: string;
  autoComplete: string;
}) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <label className="block">
      <span className="mb-2 block font-mono text-xs font-bold uppercase tracking-[0.1em] text-[#9ec0ff]">
        {label}
      </span>
      <div className="flex rounded-md border border-[#26384f] bg-[#07101d] focus-within:border-[#5b8cff]">
        <input
          name={name}
          className="min-w-0 flex-1 bg-transparent px-4 py-3 text-white outline-none"
          placeholder={placeholder}
          type={showPassword ? "text" : "password"}
          autoComplete={autoComplete}
          required
        />
        <button
          type="button"
          onClick={() => setShowPassword((current) => !current)}
          className="grid w-12 place-items-center text-[#9ec0ff] transition hover:text-white"
          aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
          title={showPassword ? "Ocultar senha" : "Mostrar senha"}
        >
          {showPassword ? <EyeOffIcon /> : <EyeIcon />}
        </button>
      </div>
    </label>
  );
}

function EyeIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6S2 12 2 12Z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function EyeOffIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M3 3l18 18" />
      <path d="M10.6 10.6A2 2 0 0 0 12 14a2 2 0 0 0 1.4-.6" />
      <path d="M9.9 5.2A10.5 10.5 0 0 1 12 5c6.5 0 10 7 10 7a17.8 17.8 0 0 1-3 4" />
      <path d="M6.5 6.8C3.6 8.7 2 12 2 12s3.5 7 10 7a10.8 10.8 0 0 0 4.1-.8" />
    </svg>
  );
}
