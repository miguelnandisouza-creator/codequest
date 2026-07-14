"use client";

import { useRef, useState } from "react";

import { usePlayer } from "@/application/hooks/usePlayer";
import { Campaign } from "@/domain/entities/campaign";
import { Chapter } from "@/domain/entities/chapter";
import { Stage } from "@/domain/entities/stage";
import {
  getStageProgressStatus,
  isChapterUnlocked,
} from "@/domain/game/progression";
import ChallengeStep from "./ChallengeStep";
import ExampleStep from "./ExampleStep";
import Link from "next/link";
import PixelScene from "./PixelScene";
import QuizStep from "./QuizStep";
import TextStep from "./TextStep";

type Props = {
  campaign: Campaign;
  chapter: Chapter;
  stage: Stage;
  chapterId: string;
  nextStageId?: string;
};

export default function AdventureEngine({
  campaign,
  chapter,
  stage,
  chapterId,
  nextStageId,
}: Props) {
  const [step, setStep] = useState(0);
  const [completed, setCompleted] = useState(false);
  const [sceneResolved, setSceneResolved] = useState(false);
  const sceneRef = useRef<HTMLDivElement>(null);
  const { player, completeStage } = usePlayer();

  const current = stage.content[step];
  const isLastStep = step === stage.content.length - 1;
  const nextLabel = isLastStep ? "Concluir etapa" : "Proximo";
  const language = stage.language ?? "sql";
  const stageStatus = getStageProgressStatus(chapter, stage, player);
  const unlocked = (
    isChapterUnlocked(campaign, chapter, player) &&
    stageStatus !== "locked"
  );

  function next() {
    if (!isLastStep) {
      setStep((prev) => prev + 1);
      setSceneResolved(false);
      return;
    }

    completeStage(stage.id, stage.reward);
    setSceneResolved(true);
    setCompleted(true);
  }

  function resolveScene() {
    setSceneResolved(true);
    window.requestAnimationFrame(() => {
      sceneRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    });
  }

  return (
    <div className="mx-auto max-w-6xl">
      <div ref={sceneRef} className="scroll-mt-24">
        <PixelScene
          stage={stage}
          resolved={sceneResolved}
          state={!unlocked ? "locked" : completed ? "completed" : "playing"}
        />
      </div>

      {!unlocked ? (
        <div className="rounded-xl border border-yellow-500/40 bg-yellow-500/10 p-6">
          <h2 className="text-2xl font-bold">
            Fase bloqueada
          </h2>

          <p className="mt-3 text-zinc-300">
            Conclua as fases anteriores para liberar este desafio.
          </p>

          <Link
            href={`/chapter/${chapterId}`}
            className="mt-6 inline-block rounded-lg bg-zinc-800 px-5 py-3 font-semibold hover:bg-zinc-700"
          >
            Voltar ao capitulo
          </Link>
        </div>
      ) : completed ? (
        <div className="rounded-xl border border-green-500/40 bg-green-500/10 p-6">
          <h2 className="text-2xl font-bold">
            Etapa concluida
          </h2>

          <p className="mt-3 text-zinc-300">
            Voce recebeu {stage.reward.xp} XP e {stage.reward.coins} moedas.
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            {nextStageId && (
              <Link
                href={`/stage/${nextStageId}`}
                className="rounded-lg bg-blue-600 px-5 py-3 font-semibold hover:bg-blue-700"
              >
                Proxima fase
              </Link>
            )}

            <Link
              href={`/chapter/${chapterId}`}
              className="rounded-lg bg-zinc-800 px-5 py-3 font-semibold hover:bg-zinc-700"
            >
              Voltar ao capitulo
            </Link>
          </div>
        </div>
      ) : (
        <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-6 shadow-xl md:p-8">
          {current.type === "text" && (
            <TextStep
              title={current.title}
              content={current.content}
              onNext={next}
              nextLabel={nextLabel}
            />
          )}

          {current.type === "example" && (
            <ExampleStep
              title={current.title}
              explanation={current.explanation}
              code={current.code}
              result={current.result}
              onNext={next}
              nextLabel={nextLabel}
            />
          )}

          {current.type === "challenge" && (
            <ChallengeStep
              title={current.title}
              objective={current.objective}
              expectedAnswer={current.expectedAnswer}
              hint={current.hint}
              language={language}
              onSuccess={next}
              onSolved={resolveScene}
              successLabel={nextLabel}
            />
          )}

          {current.type === "quiz" && (
            <QuizStep
              title={current.title}
              question={current.question}
              options={current.options}
              correctAnswer={current.correctAnswer}
              explanation={current.explanation}
              onSuccess={next}
              onSolved={resolveScene}
              successLabel={nextLabel}
            />
          )}

          {current.type === "boss" && (
            <ChallengeStep
              title={current.title}
              objective={current.objective}
              expectedAnswer={current.expectedAnswer}
              hint={current.hint}
              language={language}
              onSuccess={next}
              onSolved={resolveScene}
              successLabel={nextLabel}
            />
          )}
        </div>
      )}
    </div>
  );
}
