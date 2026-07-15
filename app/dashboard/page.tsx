"use client";

import Link from "next/link";
import { useMemo, useSyncExternalStore } from "react";

import { usePlayer } from "@/application/hooks/usePlayer";
import { campaigns } from "@/data/campaigns";
import {
  getRecommendedCampaignIds,
  getSelectedCampaignIds,
  OnboardingAnswers,
  planDetails,
} from "@/data/onboarding";
import { hasCompletedStage } from "@/domain/game/playerProgress";

const cardAccents: Record<string, string> = {
  sql: "border-blue-400/55",
  javascript: "border-yellow-300/55",
  python: "border-emerald-300/55",
  java: "border-orange-300/55",
  csharp: "border-purple-300/55",
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
    const selectedIds = getSelectedCampaignIds(onboarding ?? {});
    const recommendedIds = selectedIds.length > 0
      ? selectedIds
      : getRecommendedCampaignIds(onboarding ?? {});

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
    <main className="cq-page">
      <section className="cq-shell">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="cq-kicker">
              Mapa de campanhas
            </p>

            <h1 className="cq-title mt-3 text-4xl md:text-6xl">
              Bem-vindo ao CodeQuest
            </h1>

            <p className="mt-4 max-w-2xl text-base leading-7 text-[#93a4bd] md:text-lg">
              {onboarding?.goal && onboarding.language
                ? `Seu caminho: ${onboarding.goal.toLowerCase()} com ${onboarding.language}.`
                : "Escolha uma campanha, avance por modulos, derrote bosses e transforme codigo em progresso real."}
            </p>
          </div>

          <div className="cq-panel min-w-56 p-5">
            <p className="cq-kicker">
              Progresso total
            </p>
            <p className="mt-2 font-mono text-3xl font-black">
              Nivel {player.level}
            </p>
            <p className="mt-1 text-sm text-[#93a4bd]">
              {player.xp} XP / {player.coins} moedas
            </p>
          </div>
        </div>

        {plan && (
          <div className="cq-panel mt-8 p-5">
            <p className="cq-kicker">
              {plan.title}
            </p>
            <p className="mt-2 max-w-4xl leading-7 text-[#c8d3e3]">
              {plan.description}
            </p>
          </div>
        )}

        {onboarding?.goal && (
          <div className="mt-8 flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="cq-kicker">
                Campanhas recomendadas
              </p>
              <p className="mt-1 text-[#93a4bd]">
                {onboarding?.language
                  ? "Mostrando o curso escolhido no onboarding."
                  : "Filtradas pelo objetivo escolhido no onboarding."}
              </p>
            </div>

            <Link
              href="/onboarding"
              className="cq-button cq-button-secondary"
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
                  "cq-card group relative min-h-72 overflow-hidden p-6",
                  cardAccents[campaign.id] ?? "border-blue-400/45",
                ].join(" ")}
              >
                <div className="relative flex h-full flex-col">
                  <div className="flex items-center justify-between gap-3">
                    <span className="cq-pixel-icon">
                      {campaign.icon}
                    </span>

                    <span className="font-mono text-sm text-[#93a4bd]">
                      {completed}/{stages.length}
                    </span>
                  </div>

                  <h2 className="cq-title mt-8 text-2xl">
                    {campaign.title}
                  </h2>

                  <p className="mt-3 leading-7 text-[#c8d3e3]">
                    {campaign.description}
                  </p>

                  <p className="mt-5 font-mono text-xs uppercase tracking-[0.1em] text-[#71849c]">
                    {campaign.chapters.length} modulos / {stages.length} fases
                  </p>

                  <div className="mt-auto pt-8">
                    <div className="cq-progress">
                      <div
                        className="cq-progress-fill transition-all"
                        style={{ width: `${progress}%` }}
                      />
                    </div>

                    <span className="cq-button mt-5">
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
