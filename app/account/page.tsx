"use client";

import Link from "next/link";
import { FormEvent, useMemo, useState, useSyncExternalStore } from "react";

import {
  getLocalSessionSnapshot,
  getLocalUsers,
  getServerLocalSessionSnapshot,
  LocalSession,
  subscribeToLocalAuth,
} from "@/application/auth/localAuth";
import { getSelectedCampaignIds, OnboardingAnswers, planDetails } from "@/data/onboarding";
import { campaigns } from "@/data/campaigns";
import ProfileAvatar from "@/components/rewards/ProfileAvatar";
import { usePlayer } from "@/application/hooks/usePlayer";
import { isAdminEmail } from "@/data/admin";

function subscribeToOnboardingStorage(callback: () => void) {
  window.addEventListener("storage", callback);

  return () => {
    window.removeEventListener("storage", callback);
  };
}

function getOnboardingSnapshot() {
  try {
    return localStorage.getItem("codequest-onboarding") ?? "";
  } catch {
    return "";
  }
}

function getServerOnboardingSnapshot() {
  return "";
}

export default function AccountPage() {
  const { player, addCoins, addLevels } = usePlayer();
  const [coinAmount, setCoinAmount] = useState("500");
  const [levelAmount, setLevelAmount] = useState("1");
  const sessionSnapshot = useSyncExternalStore(
    subscribeToLocalAuth,
    getLocalSessionSnapshot,
    getServerLocalSessionSnapshot
  );
  const onboardingSnapshot = useSyncExternalStore(
    subscribeToOnboardingStorage,
    getOnboardingSnapshot,
    getServerOnboardingSnapshot
  );

  const session = useMemo(() => parseJson<LocalSession>(sessionSnapshot), [sessionSnapshot]);
  const onboarding = useMemo(() => parseJson<OnboardingAnswers>(onboardingSnapshot), [onboardingSnapshot]);
  const user = useMemo(() => {
    if (!session) {
      return null;
    }

    return getLocalUsers().find((localUser) => localUser.id === session.userId) ?? null;
  }, [session]);

  const currentCampaigns = useMemo(() => {
    const selectedIds = getSelectedCampaignIds(onboarding ?? {});

    return selectedIds
      .map((id) => campaigns.find((campaign) => campaign.id === id))
      .filter((campaign): campaign is (typeof campaigns)[number] => Boolean(campaign));
  }, [onboarding]);
  const isAdmin = isAdminEmail(session?.email);

  function handleAdminCoins(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const amount = Number(coinAmount);

    if (!Number.isFinite(amount) || amount <= 0) {
      return;
    }

    addCoins(Math.floor(amount));
  }

  function handleAdminLevels(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const amount = Number(levelAmount);

    if (!Number.isFinite(amount) || amount <= 0) {
      return;
    }

    addLevels(Math.floor(amount));
  }

  if (!session) {
    return (
      <main className="cq-page">
        <section className="cq-shell">
          <div className="cq-panel max-w-2xl p-6 md:p-8">
            <p className="cq-kicker">Conta</p>
            <h1 className="cq-title mt-3 text-4xl">Entre na sua conta</h1>
            <p className="mt-4 leading-7 text-[#93a4bd]">
              Voce ainda nao esta logado. Entre ou crie uma conta para ver seus dados aqui.
            </p>
            <Link href="/login" className="cq-button mt-6">
              Ir para login
            </Link>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="cq-page">
      <section className="cq-shell">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div className="flex items-center gap-5">
            <ProfileAvatar size="lg" />
            <div>
              <p className="cq-kicker">Conta</p>
              <h1 className="cq-title mt-3 text-4xl md:text-6xl">
                Perfil
              </h1>
              <p className="mt-4 text-[#93a4bd]">
                {session.name} - {session.email}
              </p>
            </div>
          </div>

          <Link href="/profile" className="cq-button cq-button-secondary">
            Ver meus cursos
          </Link>
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-3">
          <InfoCard label="ID da conta" value={session.userId.slice(0, 8).toUpperCase()} />
          <InfoCard label="Conta criada" value={formatDate(user?.createdAt)} />
          <InfoCard label="Sessao iniciada" value={formatDate(session.startedAt)} />
        </div>

        {isAdmin && (
          <section className="cq-panel mt-8 p-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
              <div>
                <p className="cq-kicker">Admin</p>
                <h2 className="cq-title mt-3 text-2xl">Testar progresso</h2>
                <p className="mt-3 text-sm leading-6 text-[#93a4bd]">
                  Nivel {player.level} · {player.coins} moedas. Use isso para testar compras na loja.
                </p>
              </div>

              <div className="grid w-full gap-4 md:w-auto md:min-w-[360px]">
                <form
                  onSubmit={handleAdminCoins}
                  className="flex w-full flex-col gap-3 sm:flex-row"
                >
                  <input
                    type="number"
                    min="1"
                    step="1"
                    value={coinAmount}
                    onChange={(event) => setCoinAmount(event.target.value)}
                    aria-label="Moedas para adicionar"
                    className="min-h-11 border border-[#26384f] bg-[#0b1424] px-4 font-mono text-sm text-[#f3f7ff] outline-none focus:border-[#6f91d8]"
                  />
                  <button type="submit" className="cq-button">
                    Add moedas
                  </button>
                </form>

                <form
                  onSubmit={handleAdminLevels}
                  className="flex w-full flex-col gap-3 sm:flex-row"
                >
                  <input
                    type="number"
                    min="1"
                    step="1"
                    value={levelAmount}
                    onChange={(event) => setLevelAmount(event.target.value)}
                    aria-label="Niveis para adicionar"
                    className="min-h-11 border border-[#26384f] bg-[#0b1424] px-4 font-mono text-sm text-[#f3f7ff] outline-none focus:border-[#6f91d8]"
                  />
                  <button type="submit" className="cq-button">
                    Add nivel
                  </button>
                </form>
              </div>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              {[100, 500, 1000, 5000].map((amount) => (
                <button
                  key={amount}
                  type="button"
                  onClick={() => addCoins(amount)}
                  className="cq-button cq-button-secondary"
                >
                  +{amount}
                </button>
              ))}
            </div>

            <div className="mt-3 flex flex-wrap gap-2">
              {[1, 3, 5, 10].map((amount) => (
                <button
                  key={amount}
                  type="button"
                  onClick={() => addLevels(amount)}
                  className="cq-button cq-button-secondary"
                >
                  +{amount} nivel
                </button>
              ))}
            </div>
          </section>
        )}

        <div className="mt-8 grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          <section className="cq-panel p-6">
            <p className="cq-kicker">Plano atual</p>
            <h2 className="cq-title mt-3 text-2xl">
              {onboarding?.deadline ? planDetails[onboarding.deadline]?.title : "Sem plano escolhido"}
            </h2>
            <p className="mt-3 leading-7 text-[#93a4bd]">
              {onboarding?.deadline
                ? planDetails[onboarding.deadline]?.description
                : "Responda o onboarding para montar um caminho de estudo."}
            </p>
            <Link href="/onboarding" className="cq-button cq-button-secondary mt-6">
              Ajustar plano
            </Link>
          </section>

          <section className="cq-panel p-6">
            <p className="cq-kicker">Curso em foco</p>
            {currentCampaigns.length > 0 ? (
              <div className="mt-4 space-y-3">
                {currentCampaigns.map((campaign) => (
                  <Link
                    key={campaign.id}
                    href={`/campaign/${campaign.id}`}
                    className="cq-card flex items-center gap-4 p-4"
                  >
                    <span className="cq-pixel-icon">{campaign.icon}</span>
                    <div>
                      <h3 className="cq-title text-xl">{campaign.title}</h3>
                      <p className="mt-1 text-sm text-[#93a4bd]">
                        {campaign.chapters.length} modulos
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <p className="mt-3 leading-7 text-[#93a4bd]">
                Nenhum curso escolhido ainda.
              </p>
            )}
          </section>
        </div>
      </section>
    </main>
  );
}

function InfoCard({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="cq-panel p-5">
      <p className="cq-kicker">{label}</p>
      <p className="mt-2 font-mono text-xl font-black text-[#f3f7ff]">{value}</p>
    </div>
  );
}

function parseJson<T>(value: string) {
  if (!value) {
    return null;
  }

  try {
    return JSON.parse(value) as T;
  } catch {
    return null;
  }
}

function formatDate(value?: string) {
  if (!value) {
    return "Nao registrado";
  }

  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(value));
}
