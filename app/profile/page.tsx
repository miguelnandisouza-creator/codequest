"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState, useSyncExternalStore } from "react";

import { usePlayer } from "@/application/hooks/usePlayer";
import {
  getLocalSessionSnapshot,
  getServerLocalSessionSnapshot,
  getSessionRequestHeaders,
  LocalSession,
  subscribeToLocalAuth,
} from "@/application/auth/localAuth";
import { campaigns } from "@/data/campaigns";
import { getSelectedCampaignIds, OnboardingAnswers } from "@/data/onboarding";
import { rewardItems } from "@/data/rewards";
import { Player } from "@/domain/entities/player";
import { hasCompletedStage } from "@/domain/game/playerProgress";
import ProfileAvatar from "@/components/rewards/ProfileAvatar";

type AttemptSummary = {
  id?: string;
  userId: string;
  stageId: string;
  stepTitle?: string;
  answer: string;
  success: boolean;
  feedback: string;
  createdAt?: string;
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

export default function ProfilePage() {
  const { player } = usePlayer();
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
  const [attempts, setAttempts] = useState<AttemptSummary[]>([]);

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
  const equippedRewards = getEquippedRewards(player);
  const ownedRewards = rewardItems.filter((reward) => player.inventory.ownedRewardIds.includes(reward.id));
  const recentAchievements = [...player.achievements].slice(-4).reverse();
  const recentGifts = gifts.slice(0, 4);
  const attemptStats = getAttemptStats(attempts);
  const courseProgress = getCourseProgress(player);
  const completionPercent = visibleStages.length === 0
    ? 0
    : Math.round((completedVisibleStages / visibleStages.length) * 100);

  useEffect(() => {
    if (!session) {
      queueMicrotask(() => setAttempts([]));
      return;
    }

    let cancelled = false;

    queueMicrotask(async () => {
      try {
        const response = await fetch(
          `/api/attempts?userId=${encodeURIComponent(session.userId)}&limit=80`,
          {
            cache: "no-store",
            headers: getSessionRequestHeaders(),
          }
        );
        const data = await response.json() as { attempts?: AttemptSummary[] };

        if (!cancelled && response.ok) {
          setAttempts(data.attempts ?? []);
        }
      } catch {
        if (!cancelled) {
          setAttempts([]);
        }
      }
    });

    return () => {
      cancelled = true;
    };
  }, [session]);

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

        <section className="cq-panel mt-8 p-5">
          <div className="grid gap-5 md:grid-cols-[auto_1fr_auto] md:items-center">
            <ProfileAvatar size="lg" />
            <div>
              <p className="cq-kicker">Identidade do jogador</p>
              <h2 className="cq-title mt-2 text-2xl">{player.name || "Aventureiro CodeQuest"}</h2>
              <p className="mt-2 leading-7 text-[#93a4bd]">
                {completionPercent}% do caminho visivel concluido, {player.streak} de sequencia, {ownedRewards.length} itens liberados e {player.achievements.length} conquistas.
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                {equippedRewards.length === 0 ? (
                  <span className="text-sm text-[#6f86a8]">Nenhum item equipado ainda.</span>
                ) : equippedRewards.map((reward) => (
                  <span key={reward.id} className="cq-badge">
                    {getRewardKindLabel(reward.kind)}: {reward.name}
                  </span>
                ))}
              </div>
            </div>
            <Link href="/rewards" className="cq-button cq-button-secondary">
              Editar visual
            </Link>
          </div>
        </section>

        <div className="mt-8 grid gap-5 xl:grid-cols-[1.1fr_0.9fr]">
          <section className="cq-panel p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="cq-kicker">Vitrine</p>
                <h2 className="cq-title mt-2 text-2xl">Itens equipados</h2>
              </div>
              <Link href="/rewards" className="cq-button cq-button-secondary">
                Trocar itens
              </Link>
            </div>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              {equippedRewards.length === 0 ? (
                <p className="text-sm text-[#93a4bd]">Equipe itens na loja para montar sua vitrine.</p>
              ) : equippedRewards.map((reward) => (
                <RewardShowcase key={reward.id} reward={reward} />
              ))}
            </div>
          </section>

          <section className="cq-panel p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="cq-kicker">Desempenho</p>
                <h2 className="cq-title mt-2 text-2xl">Tentativas recentes</h2>
              </div>
              <Link href="/review" className="cq-button cq-button-secondary">
                Revisar
              </Link>
            </div>
            <div className="mt-5 grid gap-3 sm:grid-cols-3 xl:grid-cols-1">
              <MiniStat label="Tentativas" value={attemptStats.total} />
              <MiniStat label="Acertos" value={attemptStats.successes} />
              <MiniStat label="Precisao" value={`${attemptStats.accuracy}%`} />
            </div>
            {attemptStats.lastAttempt && (
              <div className="mt-4 rounded border border-[#26384f] bg-[#07101d] p-4">
                <p className="font-mono text-xs font-black uppercase tracking-[0.12em] text-[#9ec0ff]">
                  Ultima tentativa
                </p>
                <p className="mt-2 text-sm text-[#c8d3e3]">
                  {attemptStats.lastAttempt.stepTitle || attemptStats.lastAttempt.stageId}
                </p>
                <span className={`cq-badge mt-3 ${attemptStats.lastAttempt.success ? "border-green-300/40 text-green-100" : "border-red-300/40 text-red-100"}`}>
                  {attemptStats.lastAttempt.success ? "Acertou" : "Errou"}
                </span>
              </div>
            )}
          </section>
        </div>

        <section className="cq-panel mt-8 p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="cq-kicker">Conquistas</p>
              <h2 className="cq-title mt-2 text-2xl">Ultimos marcos</h2>
            </div>
            <span className="cq-badge">{player.achievements.length} liberadas</span>
          </div>
          <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            {recentAchievements.length === 0 ? (
              <p className="text-sm text-[#93a4bd]">Complete fases para liberar suas primeiras conquistas.</p>
            ) : recentAchievements.map((achievement) => (
              <article key={achievement.id} className="rounded border border-[#26384f] bg-[#07101d] p-4">
                <span className="cq-badge">{achievement.icon}</span>
                <h3 className="cq-title mt-3 text-xl">{achievement.title}</h3>
                <p className="mt-2 text-sm leading-6 text-[#93a4bd]">{achievement.description}</p>
              </article>
            ))}
          </div>
        </section>

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
              {recentGifts.map((gift) => {
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
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {courseProgress.map((course) => (
                <CourseProgressCard key={course.id} course={course} />
              ))}
            </div>

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

function RewardShowcase({ reward }: { reward: (typeof rewardItems)[number] }) {
  return (
    <article className="rounded border border-[#26384f] bg-[#07101d] p-4">
      <div className="flex items-start gap-4">
        {reward.imageSrc ? (
          <div className="relative size-16 overflow-hidden border border-[#6f91d8] bg-[#101827]">
            <Image
              src={reward.imageSrc}
              alt={reward.name}
              fill
              sizes="64px"
              className={reward.kind === "avatar" ? "object-cover" : "object-contain p-1"}
            />
          </div>
        ) : reward.swatch ? (
          <div className="flex size-16 overflow-hidden border border-[#6f91d8]">
            {reward.swatch.map((color) => (
              <span key={color} className="flex-1" style={{ backgroundColor: color }} />
            ))}
          </div>
        ) : (
          <div className="cq-pixel-icon size-16 text-base">{reward.sprite}</div>
        )}
        <div className="min-w-0">
          <span className="cq-badge">{getRewardKindLabel(reward.kind)}</span>
          <h3 className="cq-title mt-2 text-xl">{reward.name}</h3>
          <p className="mt-2 line-clamp-2 text-sm leading-6 text-[#93a4bd]">
            {reward.description}
          </p>
        </div>
      </div>
    </article>
  );
}

function CourseProgressCard({
  course,
}: {
  course: {
    id: string;
    title: string;
    icon: string;
    completed: number;
    total: number;
    percent: number;
  };
}) {
  return (
    <Link href={`/campaign/${course.id}`} className="cq-card block p-5">
      <div className="flex items-center gap-4">
        <span className="cq-pixel-icon">{course.icon}</span>
        <div className="min-w-0">
          <p className="cq-kicker">Progresso do curso</p>
          <h3 className="cq-title mt-1 truncate text-xl">{course.title}</h3>
        </div>
      </div>
      <div className="cq-progress mt-5">
        <div className="cq-progress-fill" style={{ width: `${course.percent}%` }} />
      </div>
      <p className="mt-3 font-mono text-sm text-[#93a4bd]">
        {course.completed}/{course.total} fases - {course.percent}%
      </p>
    </Link>
  );
}

function MiniStat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded border border-[#26384f] bg-[#07101d] p-4">
      <p className="font-mono text-xs font-black uppercase tracking-[0.12em] text-[#93a4bd]">
        {label}
      </p>
      <p className="mt-2 font-mono text-2xl font-black">{value}</p>
    </div>
  );
}

function getEquippedRewards(player: Player) {
  const equippedIds = [
    player.inventory.equippedAvatarId ?? player.avatar,
    player.inventory.equippedPetId,
    player.inventory.equippedThemeId,
    player.inventory.equippedFrameId,
    player.inventory.equippedEffectId,
  ].filter(Boolean);

  return rewardItems.filter((reward) => equippedIds.includes(reward.id));
}

function getCourseProgress(player: Player) {
  return campaigns.map((campaign) => {
    const stages = campaign.chapters.flatMap((chapter) => chapter.stages);
    const completed = stages.filter((stage) => hasCompletedStage(player, stage.id)).length;
    const percent = stages.length === 0
      ? 0
      : Math.round((completed / stages.length) * 100);

    return {
      id: campaign.id,
      title: campaign.title,
      icon: campaign.icon,
      completed,
      total: stages.length,
      percent,
    };
  }).filter((course) => course.completed > 0 || course.id === player.progress.campaignId);
}

function getAttemptStats(attempts: AttemptSummary[]) {
  const successes = attempts.filter((attempt) => attempt.success).length;
  const total = attempts.length;

  return {
    total,
    successes,
    accuracy: total === 0 ? 0 : Math.round((successes / total) * 100),
    lastAttempt: attempts[0],
  };
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "2-digit",
  }).format(new Date(value));
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
