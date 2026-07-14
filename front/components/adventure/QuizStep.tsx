"use client";

import { useState } from "react";

type Props = {
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

  const isCorrect = selectedAnswer === correctAnswer;

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-2xl font-bold">{title}</h2>

        <span className="rounded-full bg-blue-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-blue-300">
          Quiz
        </span>
      </div>

      <p className="mt-4 text-lg text-zinc-300">{question}</p>

      <div className="mt-6 space-y-3">
        {options.map((option) => (
          <button
            key={option}
            onClick={() => {
              setSelectedAnswer(option);

              if (option === correctAnswer) {
                onSolved();
              }
            }}
            className="w-full rounded-lg border border-zinc-700 bg-zinc-800 p-4 text-left transition hover:border-blue-500"
          >
            {option}
          </button>
        ))}
      </div>

      {selectedAnswer && (
        <div className="mt-6 rounded-lg bg-zinc-800 p-4">
          {isCorrect
            ? "Resposta correta!"
            : "Ainda nao. Revise a pergunta e tente outra opcao."}
          <p className="mt-2 text-sm text-zinc-400">{explanation}</p>
        </div>
      )}

      {isCorrect && (
        <button
          onClick={onSuccess}
          className="mt-5 rounded-lg bg-green-600 px-6 py-3 hover:bg-green-700"
        >
          {successLabel}
        </button>
      )}
    </>
  );
}
