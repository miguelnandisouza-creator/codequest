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
import LearningNotebook from "./LearningNotebook";
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
  const { player, completeStage, celebratePet } = usePlayer();

  const current = stage.content[step];
  const isLastStep = step === stage.content.length - 1;
  const nextLabel = isLastStep ? "Concluir etapa" : "Proximo";
  const stepNumber = step + 1;
  const progressPercent = Math.round((stepNumber / stage.content.length) * 100);
  const currentTypeLabel = getContentTypeLabel(current.type);
  const language = stage.language ?? "sql";
  const gatedHint = chapter.order >= 4 && campaign.id === "sql"
    ? {
      enabled: true,
      attemptsRequired: 4,
      previousProgress: getPreviousStageProgress(campaign, stage.id),
    }
    : undefined;
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
    celebratePet();
    setSceneResolved(true);
    setCompleted(true);
  }

  function resolveScene() {
    celebratePet();
    setSceneResolved(true);
    window.requestAnimationFrame(() => {
      sceneRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    });
  }

  function reviewTheory() {
    setStep(0);
    setSceneResolved(false);
    window.requestAnimationFrame(() => {
      sceneRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    });
  }

  return (
    <div className="mx-auto max-w-6xl">
      {unlocked && !completed && (
        <LearningNotebook
          stage={stage}
          current={current}
          language={language}
        />
      )}

      <div ref={sceneRef} className="scroll-mt-24">
        <PixelScene
          stage={stage}
          resolved={sceneResolved}
          state={!unlocked ? "locked" : completed ? "completed" : "playing"}
        />
      </div>

      {!unlocked ? (
        <div className="cq-panel border-yellow-300/40 p-6">
          <h2 className="cq-title text-2xl">
            Fase bloqueada
          </h2>

          <p className="mt-3 text-[#c8d3e3]">
            Conclua as fases anteriores para liberar este desafio.
          </p>

          <Link
            href={`/chapter/${chapterId}`}
            className="cq-button cq-button-secondary mt-6"
          >
            Voltar ao capitulo
          </Link>
        </div>
      ) : completed ? (
        <div className="cq-panel overflow-hidden border-green-300/40 p-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div>
              <p className="cq-kicker">Missao completa</p>
              <h2 className="cq-title mt-3 text-2xl">
                Etapa concluida
              </h2>
            </div>
            <div className="grid grid-cols-2 gap-3 text-center font-mono">
              <span className="rounded border border-green-300/35 bg-green-500/10 px-4 py-3 text-green-100">
                +{stage.reward.xp} XP
              </span>
              <span className="rounded border border-yellow-300/35 bg-yellow-500/10 px-4 py-3 text-yellow-100">
                +{stage.reward.coins} moedas
              </span>
            </div>
          </div>

          <p className="mt-3 text-[#c8d3e3]">
            Recompensa salva na sua conta. Continue para a proxima fase ou volte ao capitulo para escolher outro caminho.
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            {nextStageId && (
              <Link
                href={`/stage/${nextStageId}`}
                className="cq-button"
              >
                Proxima fase
              </Link>
            )}

            <Link
              href={`/chapter/${chapterId}`}
              className="cq-button cq-button-secondary"
            >
              Voltar ao capitulo
            </Link>
          </div>
        </div>
      ) : (
        <div className="cq-panel p-6 md:p-8">
          <div className="mb-7 rounded-md border border-[#26384f] bg-[#07101d] p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="cq-kicker">Progresso da aula</p>
                <p className="mt-2 font-mono text-sm text-[#dbe8ff]">
                  Passo {stepNumber} de {stage.content.length} - {currentTypeLabel}
                </p>
              </div>
              <span className="cq-badge">{progressPercent}%</span>
            </div>
            <div className="mt-4 h-2 overflow-hidden rounded-full bg-[#0b1424]">
              <div
                className="h-full rounded-full bg-[#5b8cff] transition-all"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          {current.type === "text" && (
            <TextStep
              key={`${stage.id}-${step}`}
              title={current.title}
              content={current.content}
              onNext={next}
              nextLabel={nextLabel}
            />
          )}

          {current.type === "example" && (
            <ExampleStep
              key={`${stage.id}-${step}`}
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
              key={`${stage.id}-${step}`}
              stageId={stage.id}
              title={current.title}
              objective={current.objective}
              expectedAnswer={current.expectedAnswer}
              hint={current.hint}
              language={language}
              gatedHint={gatedHint}
              onSuccess={next}
              onSolved={resolveScene}
              onReviewTheory={reviewTheory}
              successLabel={nextLabel}
            />
          )}

          {current.type === "quiz" && (
            <QuizStep
              stageId={stage.id}
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
              key={`${stage.id}-${step}`}
              stageId={stage.id}
              title={current.title}
              objective={current.objective}
              expectedAnswer={current.expectedAnswer}
              hint={current.hint}
              language={language}
              gatedHint={gatedHint}
              onSuccess={next}
              onSolved={resolveScene}
              onReviewTheory={reviewTheory}
              successLabel={nextLabel}
            />
          )}
        </div>
      )}
    </div>
  );
}

function getContentTypeLabel(type: Stage["content"][number]["type"]) {
  if (type === "text") return "Teoria";
  if (type === "example") return "Exemplo";
  if (type === "quiz") return "Quiz";
  if (type === "boss") return "Chefe";
  return "Desafio";
}

function getPreviousStageProgress(campaign: Campaign, stageId: string) {
  const stages = campaign.chapters
    .toSorted((left, right) => left.order - right.order)
    .flatMap((chapter) => (
      chapter.stages
        .toSorted((left, right) => left.order - right.order)
        .map((stage) => ({
          campaignId: campaign.id,
          chapterId: chapter.id,
          stageId: stage.id,
        }))
    ));
  const stageIndex = stages.findIndex((stage) => stage.stageId === stageId);

  return stageIndex > 0 ? stages[stageIndex - 1] : undefined;
}
