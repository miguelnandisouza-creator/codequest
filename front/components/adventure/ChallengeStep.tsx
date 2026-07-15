"use client";

import { useCallback, useEffect, useState } from "react";

import { CodeEditor } from "@/components/editor/CodeEditor";
import {
  validateAnswer,
  ValidationResult,
} from "@/domain/game/validator";
import { usePlayer } from "@/application/hooks/usePlayer";

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
  const { petSay } = usePlayer();

  const execute = useCallback(() => {
    const validation = validateAnswer(
      code,
      expectedAnswer
    );

    setResult(validation);
    petSay(validation.success ? "Boa! Resposta correta!" : validation.message);

    if (validation.success) {
      onSolved();
    }
  }, [code, expectedAnswer, onSolved, petSay]);

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
        <h2 className="cq-title text-2xl">{title}</h2>

        <span className="cq-badge">
          Desafio SQL
        </span>
      </div>

      <p className="mt-4 text-lg leading-7 text-[#c8d3e3]">{objective}</p>

      <div className="mt-6 rounded-md border border-[#e7c66a]/35 bg-[#e7c66a]/10 p-4 text-[#f3e3a5]">
        Dica: {hint}
      </div>

      <div className="mt-6 overflow-hidden rounded-md border border-[#26384f] bg-[#070c15]">
        <CodeEditor
          code={code}
          setCode={setCode}
          language={language}
        />
      </div>

      <div className="mt-5 flex flex-wrap gap-4">
        <button
          onClick={execute}
          className="cq-button"
        >
          Executar (F9)
        </button>

        {result?.success && (
          <button
            onClick={onSuccess}
            className="cq-button border-green-200 bg-green-700 hover:bg-green-600"
          >
            {successLabel}
          </button>
        )}
      </div>

      {result && (
        <div
          className={[
            "mt-6 rounded-md border p-4",
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
