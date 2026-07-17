"use client";

import { useMemo, useState } from "react";

import { recordAttempt } from "@/application/attempts/recordAttempt";
import { usePlayer } from "@/application/hooks/usePlayer";
import { stableShuffle } from "@/application/utils/shuffle";

type Props = {
  stageId: string;
  title: string;
  question: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
  onSuccess: () => void;
  onSolved: () => void;
  successLabel: string;
};

export default function QuizStep({
  stageId,
  title,
  question,
  options,
  correctAnswer,
  explanation,
  onSuccess,
  onSolved,
  successLabel,
}: Props) {
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const { petSay } = usePlayer();
  const shuffledOptions = useMemo(() => (
    stableShuffle(options, `${title}:${question}`)
  ), [options, question, title]);

  const isCorrect = selectedAnswer === correctAnswer;

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="cq-title text-2xl">{title}</h2>

        <span className="cq-badge">
          Quiz
        </span>
      </div>

      <p className="mt-4 text-lg text-[#c8d3e3]">{question}</p>

      <div className="mt-6 space-y-3">
        {shuffledOptions.map((option) => (
          <button
            key={option}
            onClick={() => {
              const success = option === correctAnswer;
              setSelectedAnswer(option);
              recordAttempt({
                stageId,
                stepTitle: title,
                answer: option,
                success,
                feedback: success
                  ? explanation
                  : "Resposta incorreta no quiz.",
              });
              petSay(success
                ? "Boa! Essa era a resposta certa!"
                : "Quase! Revise a explicacao e tente outra opcao.");

              if (success) {
                onSolved();
              }
            }}
            className="cq-menu-option"
          >
            <span className="mr-3 text-[#72e6a8]">{">"}</span>
            {option}
          </button>
        ))}
      </div>

      {selectedAnswer && (
        <div className="mt-6 rounded-md border border-[#26384f] bg-[#0d1422] p-4">
          {isCorrect
            ? "Resposta correta!"
            : "Ainda nao. Revise a pergunta e tente outra opcao."}
          <p className="mt-2 text-sm text-[#93a4bd]">{explanation}</p>
        </div>
      )}

      {isCorrect && (
        <button
          onClick={onSuccess}
          className="cq-button mt-5 border-green-200 bg-green-700 hover:bg-green-600"
        >
          {successLabel}
        </button>
      )}
    </>
  );
}
