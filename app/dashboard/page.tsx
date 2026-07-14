"use client";

import Link from "next/link";
import { useMemo, useSyncExternalStore } from "react";

import { usePlayer } from "@/application/hooks/usePlayer";
import { campaigns } from "@/data/campaigns";
import {
  getRecommendedCampaignIds,
  OnboardingAnswers,
  planDetails,
} from "@/data/onboarding";
import { hasCompletedStage } from "@/domain/game/playerProgress";

const cardAccents: Record<string, string> = {
  sql: "from-blue-500/25 via-cyan-500/10 to-zinc-900",
  javascript: "from-yellow-400/25 via-amber-500/10 to-zinc-900",
  python: "from-emerald-400/25 via-blue-500/10 to-zinc-900",
  java: "from-orange-500/25 via-red-500/10 to-zinc-900",
  csharp: "from-purple-500/25 via-fuchsia-500/10 to-zinc-900",
};

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

export default function DashboardPage() {
  const { player } = usePlayer();
  const onboardingSnapshot = useSyncExternalStore(
    subscribeToOnboardingStorage,
    getOnboardingSnapshot,
    getServerOnboardingSnapshot
  );
  const onboarding = useMemo<OnboardingAnswers | null>(() => {
    if (!onboardingSnapshot) {
      return null;
    }

    try {
      return JSON.parse(onboardingSnapshot);
    } catch {
      return null;
    }
  }, [onboardingSnapshot]);

  const visibleCampaigns = useMemo(() => {
    const recommendedIds = getRecommendedCampaignIds(onboarding ?? {});

    if (recommendedIds.length === 0) {
      return campaigns;
    }

    return recommendedIds
      .map((id) => campaigns.find((campaign) => campaign.id === id))
      .filter((campaign): campaign is (typeof campaigns)[number] => Boolean(campaign));
  }, [onboarding]);

  const plan = onboarding?.deadline
    ? planDetails[onboarding.deadline]
    : undefined;

  return (
    <main className="min-h-screen bg-zinc-950 px-6 py-10 text-white md:px-10">
      <section className="mx-auto max-w-7xl">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-blue-300">
              Mapa de campanhas
            </p>

            <h1 className="mt-3 text-5xl font-black tracking-tight md:text-6xl">
              Bem-vindo ao CodeQuest
            </h1>

            <p className="mt-4 max-w-2xl text-lg leading-8 text-zinc-400">
              {onboarding?.goal && onboarding.language
                ? `Seu caminho: ${onboarding.goal.toLowerCase()} com ${onboarding.language}.`
                : "Escolha uma campanha, avance por modulos, derrote bosses e transforme codigo em progresso real."}
            </p>
          </div>

          <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-5">
            <p className="text-sm uppercase tracking-[0.16em] text-zinc-500">
              Progresso total
            </p>
            <p className="mt-2 text-3xl font-bold">
              Nivel {player.level}
            </p>
            <p className="mt-1 text-sm text-zinc-400">
              {player.xp} XP / {player.coins} moedas
            </p>
          </div>
        </div>

        {plan && (
          <div className="mt-8 rounded-xl border border-blue-500/30 bg-blue-500/10 p-5">
            <p className="text-sm font-bold uppercase tracking-[0.18em] text-blue-200">
              {plan.title}
            </p>
            <p className="mt-2 max-w-4xl leading-7 text-zinc-300">
              {plan.description}
            </p>
          </div>
        )}

        {onboarding?.goal && (
          <div className="mt-8 flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.18em] text-zinc-500">
                Campanhas recomendadas
              </p>
              <p className="mt-1 text-zinc-400">
                Filtradas pelo objetivo escolhido no onboarding.
              </p>
            </div>

            <Link
              href="/onboarding"
              className="rounded-lg border border-zinc-700 px-4 py-2 text-sm font-semibold text-zinc-200 hover:border-blue-400 hover:text-white"
            >
              Refazer perguntas
            </Link>
          </div>
        )}

        <div className="mt-6 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {visibleCampaigns.map((campaign) => {
            const stages = campaign.chapters.flatMap((chapter) => chapter.stages);
            const completed = stages.filter((stage) => (
              hasCompletedStage(player, stage.id)
            )).length;
            const progress = stages.length === 0
              ? 0
              : (completed / stages.length) * 100;

            return (
              <Link
                key={campaign.id}
                href={`/campaign/${campaign.id}`}
                className={[
                  "group relative min-h-72 overflow-hidden rounded-xl border border-zinc-800 bg-gradient-to-br p-6 shadow-xl transition hover:-translate-y-1 hover:border-blue-400",
                  cardAccents[campaign.id] ?? "from-blue-500/20 to-zinc-900",
                ].join(" ")}
              >
                <div className="absolute -right-10 -top-10 size-36 rounded-full bg-white/5 transition group-hover:scale-125" />

                <div className="relative flex h-full flex-col">
                  <div className="flex items-center justify-between gap-3">
                    <span className="rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-sm font-black tracking-[0.2em] text-blue-200">
                      {campaign.icon}
                    </span>

                    <span className="text-sm text-zinc-400">
                      {completed}/{stages.length}
                    </span>
                  </div>

                  <h2 className="mt-8 text-3xl font-black">
                    {campaign.title}
                  </h2>

                  <p className="mt-3 leading-7 text-zinc-300">
                    {campaign.description}
                  </p>

                  <p className="mt-5 text-sm text-zinc-500">
                    {campaign.chapters.length} modulos / {stages.length} fases
                  </p>

                  <div className="mt-auto pt-8">
                    <div className="h-2 overflow-hidden rounded-full bg-white/10">
                      <div
                        className="h-full rounded-full bg-blue-400 transition-all"
                        style={{ width: `${progress}%` }}
                      />
                    </div>

                    <span className="mt-5 inline-block rounded-lg bg-blue-600 px-5 py-3 font-semibold transition group-hover:bg-blue-500">
                      Entrar
                    </span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </section>
    </main>
  );
}
