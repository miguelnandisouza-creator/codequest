"use client";

import Link from "next/link";

import { usePlayer } from "@/application/hooks/usePlayer";
import { Campaign } from "@/domain/entities/campaign";
import {
  getSortedChapters,
  isChapterCompleted,
  isChapterUnlocked,
} from "@/domain/game/progression";

type Props = {
  campaign: Campaign;
};

export default function CampaignChapterList({ campaign }: Props) {
  const { player } = usePlayer();

  return (
    <div className="mt-10 space-y-4">
      {getSortedChapters(campaign).map((chapter) => {
        const unlocked = isChapterUnlocked(campaign, chapter, player);
        const completed = isChapterCompleted(chapter, player);
        const completedStages = chapter.stages.filter((stage) => (
          player.progress.completedStages.includes(stage.id)
        )).length;

        const content = (
          <div
            className={[
              "cq-card block p-5",
              unlocked ? "hover:border-[#5b8cff]" : "opacity-55",
            ].join(" ")}
          >
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-4">
                <span className="cq-pixel-icon">
                  {String(chapter.order).padStart(2, "0")}
                </span>

                <div>
                  <p className="cq-kicker">Capitulo</p>
                  <h2 className="cq-title mt-1 text-xl md:text-2xl">
                    {chapter.title}
                  </h2>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                <span className="cq-badge">
                  {chapter.stages.length} fases
                </span>

                <span className="cq-badge">
                  {completed
                    ? "Concluido"
                    : unlocked
                      ? "Liberado"
                      : "Bloqueado"}
                </span>
              </div>
            </div>

            <p className="mt-3 leading-7 text-[#93a4bd]">
              {chapter.description}
            </p>

            <div className="mt-5 flex items-center gap-4">
              <div className="cq-progress flex-1">
                <div
                  className="cq-progress-fill"
                  style={{
                    width: `${chapter.stages.length === 0
                      ? 0
                      : (completedStages / chapter.stages.length) * 100}%`,
                  }}
                />
              </div>

              <span className="font-mono text-xs text-[#93a4bd]">
                {completedStages}/{chapter.stages.length}
              </span>
            </div>
          </div>
        );

        if (!unlocked) {
          return (
            <div key={chapter.id}>
              {content}
            </div>
          );
        }

        return (
          <Link
            key={chapter.id}
            href={`/chapter/${chapter.id}`}
          >
            {content}
          </Link>
        );
      })}
    </div>
  );
}
