"use client";

import Link from "next/link";

import { usePlayer } from "@/application/hooks/usePlayer";
import { campaigns } from "@/data/campaigns";
import { hasCompletedStage } from "@/domain/game/playerProgress";

export default function ProfilePage() {
  const { player } = usePlayer();
  const totalStages = campaigns.reduce(
    (total, campaign) => (
      total + campaign.chapters.reduce(
        (chapterTotal, chapter) => chapterTotal + chapter.stages.length,
        0
      )
    ),
    0
  );
  const completedStages = player.progress.completedStages.length;

  return (
    <main className="min-h-screen bg-zinc-950 p-10 text-white">
      <h1 className="text-5xl font-bold">Perfil</h1>

      <div className="mt-8 grid gap-4 md:grid-cols-4">
        <Stat label="Nivel" value={player.level} />
        <Stat label="XP" value={player.xp} />
        <Stat label="Moedas" value={player.coins} />
        <Stat label="Fases" value={`${completedStages}/${totalStages}`} />
      </div>

      <div className="mt-10 space-y-4">
        {campaigns.map((campaign) => {
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
              className="block rounded-xl border border-zinc-800 bg-zinc-900 p-5 hover:border-blue-500"
            >
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h2 className="text-2xl font-bold">{campaign.title}</h2>
                <span className="text-sm text-zinc-400">
                  {campaignCompleted}/{campaignStages.length} fases
                </span>
              </div>

              <div className="mt-4 h-2 overflow-hidden rounded-full bg-zinc-800">
                <div
                  className="h-full rounded-full bg-blue-500"
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
    </main>
  );
}

function Stat({
  label,
  value,
}: {
  label: string;
  value: string | number;
}) {
  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-5">
      <p className="text-sm uppercase tracking-[0.16em] text-zinc-500">
        {label}
      </p>
      <p className="mt-2 text-3xl font-bold">{value}</p>
    </div>
  );
}
