"use client";

import { useCallback, useEffect, useState } from "react";

import { CodeEditor } from "@/components/editor/CodeEditor";
import {
  validateAnswer,
  ValidationResult,
} from "@/domain/game/validator";

type Props = {
  title: string;
  objective: string;
  expectedAnswer: string;
  hint: string;
  language?: string;
  onSuccess: () => void;
  onSolved: () => void;
  successLabel: string;
};

export default function ChallengeStep({
  title,
  objective,
  expectedAnswer,
  hint,
  language,
  onSuccess,
  onSolved,
  successLabel,
}: Props) {
  const [code, setCode] = useState("");
  const [result, setResult] = useState<ValidationResult | null>(null);

  const execute = useCallback(() => {
    const validation = validateAnswer(
      code,
      expectedAnswer
    );

    setResult(validation);

    if (validation.success) {
      onSolved();
    }
  }, [code, expectedAnswer, onSolved]);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "F9") {
        event.preventDefault();
        execute();
      }
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [execute]);

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-2xl font-bold">{title}</h2>

        <span className="rounded-full bg-blue-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-blue-300">
          Desafio SQL
        </span>
      </div>

      <p className="mt-4 text-lg leading-7 text-zinc-300">{objective}</p>

      <div className="mt-6 rounded-lg border border-yellow-500 bg-yellow-500/10 p-4">
        Dica: {hint}
      </div>

      <div className="mt-6 overflow-hidden rounded-lg border border-zinc-700 bg-black shadow-xl">
        <CodeEditor
          code={code}
          setCode={setCode}
          language={language}
        />
      </div>

      <div className="mt-5 flex flex-wrap gap-4">
        <button
          onClick={execute}
          className="rounded-lg bg-blue-600 px-6 py-3 font-semibold hover:bg-blue-700"
        >
          Executar (F9)
        </button>

        {result?.success && (
          <button
            onClick={onSuccess}
            className="rounded-lg bg-green-600 px-6 py-3 font-semibold hover:bg-green-700"
          >
            {successLabel}
          </button>
        )}
      </div>

      {result && (
        <div
          className={[
            "mt-6 rounded-lg border p-4",
            result.success
              ? "border-green-500/40 bg-green-500/10 text-green-100"
              : "border-red-500/40 bg-red-500/10 text-red-100",
          ].join(" ")}
        >
          {result.message}
        </div>
      )}
    </>
  );
}
