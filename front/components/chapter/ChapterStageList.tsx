"use client";

import Link from "next/link";

import { usePlayer } from "@/application/hooks/usePlayer";
import { Chapter } from "@/domain/entities/chapter";
import {
  getSortedStages,
  getStageProgressStatus,
} from "@/domain/game/progression";

type Props = {
  chapter: Chapter;
};

export default function ChapterStageList({ chapter }: Props) {
  const { player } = usePlayer();
  const stages = getSortedStages(chapter);

  if (stages.length === 0) {
    return (
      <div className="mt-10 rounded-xl bg-zinc-900 p-6">
        <h2 className="text-2xl font-semibold">
          Ainda nao existem fases neste capitulo.
        </h2>

        <p className="mt-2 text-zinc-400">
          Vamos criar a primeira fase agora.
        </p>
      </div>
    );
  }

  return (
    <div className="mt-10 space-y-4">
      {stages.map((stage) => {
        const status = getStageProgressStatus(chapter, stage, player);
        const unlocked = status !== "locked";

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
                {stage.order}. {stage.title}
              </h2>

              <div className="flex flex-wrap gap-2">
                <span className="rounded-full bg-zinc-800 px-3 py-1 text-sm uppercase text-zinc-300">
                  {stage.type}
                </span>

                <span className="rounded-full bg-blue-500/10 px-3 py-1 text-sm text-blue-300">
                  {status === "completed"
                    ? "Concluida"
                    : status === "current"
                      ? "Atual"
                      : "Bloqueada"}
                </span>
              </div>
            </div>

            <p className="mt-2 text-zinc-400">
              {stage.description}
            </p>

            <p className="mt-3 text-sm text-green-400">
              {stage.reward.xp} XP / {stage.reward.coins} moedas
            </p>
          </div>
        );

        if (!unlocked) {
          return (
            <div key={stage.id}>
              {content}
            </div>
          );
        }

        return (
          <Link
            key={stage.id}
            href={`/stage/${stage.id}`}
          >
            {content}
          </Link>
        );
      })}
    </div>
  );
}
