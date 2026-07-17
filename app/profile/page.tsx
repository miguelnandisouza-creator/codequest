"use client";

import Link from "next/link";
import { useMemo, useSyncExternalStore } from "react";

import { usePlayer } from "@/application/hooks/usePlayer";
import { campaigns } from "@/data/campaigns";
import { getSelectedCampaignIds, OnboardingAnswers } from "@/data/onboarding";
import { rewardItems } from "@/data/rewards";
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

export default function ProfilePage() {
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
    const progressIds = campaigns
      .filter((campaign) => {
        const campaignStages = campaign.chapters.flatMap((chapter) => chapter.stages);

        return campaignStages.some((stage) => hasCompletedStage(player, stage.id));
      })
      .map((campaign) => campaign.id);
    const ids = [...selectedIds, ...progressIds].filter((id, index, list) => (
      list.indexOf(id) === index
    ));

    if (ids.length === 0) {
      return [];
    }

    return ids
      .map((id) => campaigns.find((campaign) => campaign.id === id))
      .filter((campaign): campaign is (typeof campaigns)[number] => Boolean(campaign));
  }, [onboarding, player]);

  const visibleStages = visibleCampaigns.flatMap((campaign) => (
    campaign.chapters.flatMap((chapter) => chapter.stages)
  ));
  const completedVisibleStages = visibleStages.filter((stage) => (
    hasCompletedStage(player, stage.id)
  )).length;
  const gifts = player.giftNotifications ?? [];

  return (
    <main className="cq-page">
      <section className="cq-shell">
        <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="cq-kicker">Meus cursos</p>
            <h1 className="cq-title mt-3 text-4xl md:text-6xl">
              Cursos em andamento
            </h1>
            <p className="mt-4 max-w-2xl leading-7 text-[#93a4bd]">
              Aqui aparecem apenas os cursos do seu caminho atual ou campanhas onde voce ja tem progresso.
            </p>
          </div>

          <Link href="/account" className="cq-button cq-button-secondary">
            Ver conta
          </Link>
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-4">
          <Stat label="Nivel" value={player.level} />
          <Stat label="XP" value={player.xp} />
          <Stat label="Moedas" value={player.coins} />
          <Stat label="Fases" value={`${completedVisibleStages}/${visibleStages.length}`} />
        </div>

        {gifts.length > 0 && (
          <div className="cq-panel mt-8 p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="cq-kicker">Presentes recebidos</p>
                <h2 className="cq-title mt-2 text-2xl">Recompensas do admin</h2>
              </div>
              <Link href="/rewards" className="cq-button cq-button-secondary">
                Abrir loja
              </Link>
            </div>

            <div className="mt-5 grid gap-3 md:grid-cols-2">
              {gifts.slice(0, 4).map((gift) => {
                const reward = rewardItems.find((item) => item.id === gift.rewardId);

                return (
                  <div key={gift.id} className="rounded border border-[#26384f] bg-[#07101d] p-4">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="cq-badge">{reward ? getRewardKindLabel(reward.kind) : gift.rewardKind}</span>
                      <span className="cq-badge border-[#e7c66a]/50 text-[#ffe6a3]">Presente</span>
                    </div>
                    <h3 className="cq-title mt-3 text-xl">{gift.rewardName}</h3>
                    <p className="mt-2 text-sm leading-6 text-[#93a4bd]">
                      {reward?.description ?? "Item liberado diretamente pelo admin."}
                    </p>
                    <p className="mt-3 text-xs text-[#6f86a8]">
                      Recebido em {formatDate(gift.createdAt)}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {visibleCampaigns.length === 0 ? (
          <div className="cq-panel mt-10 p-6">
            <p className="cq-kicker">Nenhum curso ativo</p>
            <h2 className="cq-title mt-3 text-2xl">
              Escolha seu caminho primeiro
            </h2>
            <p className="mt-3 leading-7 text-[#93a4bd]">
              Responda as perguntas iniciais para o CodeQuest mostrar somente o curso certo para voce.
            </p>
            <Link href="/onboarding" className="cq-button mt-6">
              Escolher curso
            </Link>
          </div>
        ) : (
          <div className="mt-10 space-y-4">
            {visibleCampaigns.map((campaign) => {
              const campaignStages = campaign.chapters.flatMap(
                (chapter) => chapter.stages
              );
              const campaignCompleted = campaignStages.filter(
                (stage) => hasCompletedStage(player, stage.id)
              ).length;

              return (
                <Link
                  key={campaign.id}
                  href={`/campaign/${campaign.id}`}
                  className="cq-card block p-5"
                >
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-4">
                      <span className="cq-pixel-icon">{campaign.icon}</span>
                      <div>
                        <p className="cq-kicker">
                          {onboarding?.language && campaign.id === getSelectedCampaignIds(onboarding)[0]
                            ? "Curso escolhido"
                            : "Com progresso"}
                        </p>
                        <h2 className="cq-title mt-1 text-xl md:text-2xl">
                          {campaign.title}
                        </h2>
                      </div>
                    </div>

                    <span className="font-mono text-sm text-[#93a4bd]">
                      {campaignCompleted}/{campaignStages.length} fases
                    </span>
                  </div>

                  <div className="cq-progress mt-4">
                    <div
                      className="cq-progress-fill"
                      style={{
                        width: `${campaignStages.length === 0
                          ? 0
                          : (campaignCompleted / campaignStages.length) * 100}%`,
                      }}
                    />
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </section>
    </main>
  );
}

function getRewardKindLabel(kind: string) {
  if (kind === "avatar") return "Foto";
  if (kind === "pet") return "Pet";
  if (kind === "theme") return "Tema";
  if (kind === "frame") return "Moldura";
  return "Efeito";
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "2-digit",
  }).format(new Date(value));
}

function Stat({
  label,
  value,
}: {
  label: string;
  value: string | number;
}) {
  return (
    <div className="cq-panel p-5">
      <p className="cq-kicker">
        {label}
      </p>
      <p className="mt-2 font-mono text-3xl font-black">{value}</p>
    </div>
  );
}
