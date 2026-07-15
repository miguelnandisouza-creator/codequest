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
      <div className="cq-panel mt-10 p-6">
        <h2 className="cq-title text-2xl">
          Ainda nao existem fases neste capitulo.
        </h2>

        <p className="mt-2 text-[#93a4bd]">
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
              "cq-card block p-5",
              unlocked ? "hover:border-[#5b8cff]" : "opacity-55",
            ].join(" ")}
          >
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-4">
                <span className="cq-pixel-icon">
                  {String(stage.order).padStart(2, "0")}
                </span>

                <div>
                  <p className="cq-kicker">Missao</p>
                  <h2 className="cq-title mt-1 text-xl md:text-2xl">
                    {stage.title}
                  </h2>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                <span className="cq-badge">
                  {stage.type}
                </span>

                <span className="cq-badge">
                  {status === "completed"
                    ? "Concluida"
                    : status === "current"
                      ? "Atual"
                      : "Bloqueada"}
                </span>
              </div>
            </div>

            <p className="mt-3 leading-7 text-[#93a4bd]">
              {stage.description}
            </p>

            <p className="mt-3 font-mono text-sm text-[#72e6a8]">
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
