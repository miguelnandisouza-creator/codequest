"use client";

import { useMemo, useState } from "react";

import { usePlayer } from "@/application/hooks/usePlayer";
import { stableShuffle } from "@/application/utils/shuffle";

export default function SurpriseExamModal() {
  const { player, completeSurpriseExam, petSay } = usePlayer();
  const [selectedAnswer, setSelectedAnswer] = useState("");
  const [answered, setAnswered] = useState(false);
  const exam = player.surpriseExam;
  const shuffledOptions = useMemo(() => (
    exam && !exam.completedAt ? stableShuffle(exam.options, exam.id) : []
  ), [exam]);

  if (!exam || exam.completedAt) {
    return null;
  }

  const activeExam = exam;
  const isCorrect = selectedAnswer === activeExam.correctAnswer;

  function answer(option: string) {
    setSelectedAnswer(option);
    setAnswered(true);

    if (option === activeExam.correctAnswer) {
      completeSurpriseExam();
      petSay(`Mandou bem! +${activeExam.rewardCoins} moedas.`);
    } else {
      petSay("Quase! Essa prova surpresa continua aberta.");
    }
  }

  return (
    <div className="fixed inset-0 z-[70] grid place-items-center bg-black/70 px-4 backdrop-blur-sm">
      <section className="cq-panel w-full max-w-2xl p-6 md:p-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="cq-kicker">Prova surpresa</p>
            <h2 className="cq-title mt-3 text-3xl md:text-4xl">
              {activeExam.title}
            </h2>
          </div>

          <span className="cq-badge">
            +{activeExam.rewardXp} XP / +{activeExam.rewardCoins} moedas
          </span>
        </div>

        <p className="mt-6 text-lg leading-8 text-[#dbe8ff]">
          {activeExam.question}
        </p>

        <div className="mt-6 grid gap-3">
          {shuffledOptions.map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => answer(option)}
              disabled={isCorrect}
              className="cq-menu-option disabled:cursor-not-allowed disabled:opacity-70"
            >
              <span className="mr-3 text-[#72e6a8]">{">"}</span>
              {option}
            </button>
          ))}
        </div>

        {answered && (
          <div
            className={[
              "mt-6 rounded-md border p-4",
              isCorrect
                ? "border-green-500/40 bg-green-500/10 text-green-100"
                : "border-red-500/40 bg-red-500/10 text-red-100",
            ].join(" ")}
          >
            {isCorrect
              ? "Resposta correta! Recompensa recebida."
              : "Ainda nao. Tente outra resposta para fechar a prova."}
          </div>
        )}
      </section>
    </div>
  );
}
