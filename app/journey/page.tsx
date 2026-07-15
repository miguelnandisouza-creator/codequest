"use client";

import Link from "next/link";
import { useMemo, useSyncExternalStore } from "react";

import { usePlayer } from "@/application/hooks/usePlayer";
import { campaigns } from "@/data/campaigns";
import { getSelectedCampaignIds, OnboardingAnswers } from "@/data/onboarding";
import { rewardItems, RewardKind } from "@/data/rewards";
import { hasCompletedStage } from "@/domain/game/playerProgress";

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

export default function JourneyPage() {
  const { player } = usePlayer();
  const onboardingSnapshot = useSyncExternalStore(
    subscribeToOnboardingStorage,
    getOnboardingSnapshot,
    getServerOnboardingSnapshot
  );
  const onboarding = useMemo(() => parseJson<OnboardingAnswers>(onboardingSnapshot), [onboardingSnapshot]);
  const selectedIds = getSelectedCampaignIds(onboarding ?? {});
  const campaign = campaigns.find((item) => item.id === player.progress.campaignId)
    ?? campaigns.find((item) => selectedIds.includes(item.id))
    ?? campaigns[0];
  const stages = campaign.chapters.flatMap((chapter) => chapter.stages);
  const completedStages = stages.filter((stage) => hasCompletedStage(player, stage.id));
  const nextStage = stages.find((stage) => !hasCompletedStage(player, stage.id));
  const activeChapter = campaign.chapters.find((chapter) => (
    chapter.stages.some((stage) => stage.id === nextStage?.id || stage.id === player.progress.stageId)
  )) ?? campaign.chapters[0];
  const nextRewards = rewardItems
    .filter((reward) => !player.inventory.ownedRewardIds.includes(reward.id))
    .sort((left, right) => left.levelRequired - right.levelRequired || left.price - right.price)
    .slice(0, 4);
  const progress = stages.length === 0 ? 0 : Math.round((completedStages.length / stages.length) * 100);

  return (
    <main className="cq-page">
      <section className="cq-shell">
        <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="cq-kicker">Minha jornada</p>
            <h1 className="cq-title mt-3 text-4xl md:text-6xl">
              {campaign.title}
            </h1>
            <p className="mt-4 max-w-2xl leading-7 text-[#93a4bd]">
              Acompanhe onde voce esta, o que ja concluiu e quais recompensas vem a seguir.
            </p>
          </div>

          <Link href={nextStage ? `/stage/${nextStage.id}` : `/campaign/${campaign.id}`} className="cq-button">
            {nextStage ? "Continuar fase" : "Ver campanha"}
          </Link>
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-4">
          <Stat label="Nivel" value={player.level} />
          <Stat label="XP" value={player.xp} />
          <Stat label="Moedas" value={player.coins} />
          <Stat label="Progresso" value={`${progress}%`} />
        </div>

        <section className="cq-panel mt-8 p-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="cq-kicker">Modulo atual</p>
              <h2 className="cq-title mt-2 text-2xl">{activeChapter?.title ?? "Campanha completa"}</h2>
              <p className="mt-2 text-[#93a4bd]">
                {nextStage ? nextStage.title : "Voce concluiu todas as fases disponiveis."}
              </p>
            </div>

            <span className="cq-badge">
              {completedStages.length}/{stages.length} fases
            </span>
          </div>

          <div className="cq-progress mt-6">
            <div className="cq-progress-fill" style={{ width: `${progress}%` }} />
          </div>
        </section>

        <div className="mt-8 grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <section className="cq-panel p-6">
            <p className="cq-kicker">Modulos</p>
            <div className="mt-5 space-y-3">
              {campaign.chapters.map((chapter) => {
                const chapterCompleted = chapter.stages.filter((stage) => (
                  hasCompletedStage(player, stage.id)
                )).length;
                const chapterProgress = chapter.stages.length === 0
                  ? 0
                  : (chapterCompleted / chapter.stages.length) * 100;

                return (
                  <Link
                    key={chapter.id}
                    href={`/chapter/${chapter.id}`}
                    className="cq-card block p-4"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <h3 className="cq-title text-xl">{chapter.title}</h3>
                        <p className="mt-1 text-sm text-[#93a4bd]">{chapter.description}</p>
                      </div>
                      <span className="font-mono text-sm text-[#93a4bd]">
                        {chapterCompleted}/{chapter.stages.length}
                      </span>
                    </div>
                    <div className="cq-progress mt-4">
                      <div className="cq-progress-fill" style={{ width: `${chapterProgress}%` }} />
                    </div>
                  </Link>
                );
              })}
            </div>
          </section>

          <aside className="space-y-6">
            <section className="cq-panel p-6">
              <p className="cq-kicker">Proximas recompensas</p>
              <div className="mt-5 space-y-3">
                {nextRewards.map((reward) => (
                  <div key={reward.id} className="cq-card p-4">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <h3 className="cq-title text-lg">{reward.name}</h3>
                        <p className="mt-1 text-sm text-[#93a4bd]">
                          Nivel {reward.levelRequired} / {reward.price} moedas
                        </p>
                      </div>
                      <span className="cq-badge">{getRewardKindLabel(reward.kind)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section className="cq-panel p-6">
              <p className="cq-kicker">Prova surpresa</p>
              <h2 className="cq-title mt-2 text-xl">
                {player.surpriseExam && !player.surpriseExam.completedAt
                  ? player.surpriseExam.title
                  : "Nenhuma prova pendente"}
              </h2>
              <p className="mt-3 text-sm leading-6 text-[#93a4bd]">
                {player.surpriseExam && !player.surpriseExam.completedAt
                  ? "Ela vai aparecer como popup ate voce acertar."
                  : "Quando o admin mandar uma prova, ela aparece automaticamente."}
              </p>
            </section>
          </aside>
        </div>
      </section>
    </main>
  );
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="cq-panel p-5">
      <p className="cq-kicker">{label}</p>
      <p className="mt-2 font-mono text-3xl font-black">{value}</p>
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

function getRewardKindLabel(kind: RewardKind) {
  if (kind === "avatar") return "Foto";
  if (kind === "pet") return "Pet";
  if (kind === "theme") return "Tema";
  if (kind === "frame") return "Moldura";
  return "Efeito";
}
