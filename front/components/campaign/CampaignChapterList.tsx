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

        const content = (
          <div
            className={[
              "block rounded-xl border p-5 transition",
              unlocked
                ? "border-zinc-800 bg-zinc-900 hover:border-blue-500 hover:bg-zinc-800"
                : "border-zinc-900 bg-zinc-900/50 opacity-60",
            ].join(" ")}
          >
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-2xl font-bold">
                {chapter.title}
              </h2>

              <div className="flex flex-wrap gap-2">
                <span className="rounded-full bg-blue-500/10 px-3 py-1 text-sm text-blue-300">
                  {chapter.stages.length} fases
                </span>

                <span className="rounded-full bg-zinc-800 px-3 py-1 text-sm text-zinc-300">
                  {completed
                    ? "Concluido"
                    : unlocked
                      ? "Liberado"
                      : "Bloqueado"}
                </span>
              </div>
            </div>

            <p className="mt-2 text-zinc-400">
              {chapter.description}
            </p>
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
