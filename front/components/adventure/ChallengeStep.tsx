"use client";

import { useCallback, useEffect, useState } from "react";

import { CodeEditor } from "@/components/editor/CodeEditor";
import { recordAttempt } from "@/application/attempts/recordAttempt";
import {
  validateAnswer,
  ValidationResult,
} from "@/domain/game/validator";
import { usePlayer } from "@/application/hooks/usePlayer";

type Props = {
  stageId: string;
  title: string;
  objective: string;
  expectedAnswer: string;
  hint: string;
  language?: string;
  gatedHint?: {
    enabled: boolean;
    attemptsRequired: number;
    previousProgress?: {
      campaignId: string;
      chapterId: string;
      stageId: string;
    };
  };
  onSuccess: () => void;
  onSolved: () => void;
  onReviewTheory?: () => void;
  successLabel: string;
};

export default function ChallengeStep({
  stageId,
  title,
  objective,
  expectedAnswer,
  hint,
  language,
  gatedHint,
  onSuccess,
  onSolved,
  onReviewTheory,
  successLabel,
}: Props) {
  const [code, setCode] = useState("");
  const [result, setResult] = useState<ValidationResult | null>(null);
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [hintUnlocked, setHintUnlocked] = useState(false);
  const [penaltyMessage, setPenaltyMessage] = useState("");
  const [attemptHistory, setAttemptHistory] = useState<Array<{
    answer: string;
    success: boolean;
    message: string;
  }>>([]);
  const { petSay, applyHintPenalty, hintPenaltyCost, petAbilityReady } = usePlayer();
  const hintGateEnabled = Boolean(gatedHint?.enabled);
  const hasHintPenalty = Boolean(gatedHint?.enabled);
  const attemptsRequired = gatedHint?.attemptsRequired ?? 4;
  const canUseGatedHint = hintGateEnabled && failedAttempts >= attemptsRequired;
  const shouldShowHint = !hintGateEnabled || hintUnlocked;
  const reasoningChecklist = getReasoningChecklist(language);

  const execute = useCallback(() => {
    const validation = validateAnswer(
      code,
      expectedAnswer
    );

    setResult(validation);
    setPenaltyMessage("");
    setAttemptHistory((current) => [
      {
        answer: code,
        success: validation.success,
        message: validation.message,
      },
      ...current,
    ].slice(0, 5));
    recordAttempt({
      stageId,
      stepTitle: title,
      answer: code,
      success: validation.success,
      feedback: validation.message,
    });
    petSay(validation.success ? "Boa! Resposta correta!" : validation.message);

    if (validation.success) {
      onSolved();
      return;
    }

    setFailedAttempts((current) => current + 1);
  }, [code, expectedAnswer, onSolved, petSay, stageId, title]);

  function sendToNotebookTerminal() {
    window.dispatchEvent(new CustomEvent("codequest-terminal-load", {
      detail: {
        code: code.trim() || expectedAnswer,
      },
    }));
    petSay("Mandei para o terminal do caderno. Testa la!");
  }

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

        <div className="flex flex-wrap gap-2">
          <span className="cq-badge">
            Desafio {language?.toUpperCase() ?? "CODE"}
          </span>
          <span className={[
            "cq-badge",
            failedAttempts >= attemptsRequired && hintGateEnabled
              ? "border-yellow-300/50 text-yellow-100"
              : "",
          ].join(" ")}>
            Tentativas {failedAttempts}
          </span>
        </div>
      </div>

      <p className="mt-4 text-lg leading-7 text-[#c8d3e3]">{objective}</p>

      <div className="mt-6 rounded-md border border-[#26384f] bg-[#07101d] p-4 text-[#c8d3e3]">
        <p className="font-mono text-xs font-black uppercase tracking-[0.12em] text-[#9ec0ff]">
          Antes de executar
        </p>
        <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-6">
          {reasoningChecklist.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </div>

      {shouldShowHint ? (
        <div className="mt-6 rounded-md border border-[#e7c66a]/35 bg-[#e7c66a]/10 p-4 text-[#f3e3a5]">
          Dica: {hint}
        </div>
      ) : (
        <div className="mt-6 rounded-md border border-[#26384f] bg-[#07101d] p-4 text-[#93a4bd]">
          Dica bloqueada. Tente resolver com base na explicacao e no exemplo anterior.
          <span className="mt-2 block font-mono text-xs uppercase tracking-[0.1em] text-[#dbe8ff]">
            Tentativas erradas: {failedAttempts}/{attemptsRequired}
          </span>
          {canUseGatedHint && (
            <button
              type="button"
              onClick={() => {
                if (hasHintPenalty) {
                  applyHintPenalty(gatedHint?.previousProgress);
                  setPenaltyMessage(hintPenaltyCost > 0
                    ? `Voce usou uma dica avancada: perdeu ${hintPenaltyCost} nivel(is) e sua rota voltou uma missao para reforcar a base.`
                    : "Hunter protegeu seu nivel. A dica foi liberada e sua rota voltou uma missao para reforcar a base.");
                }
                setHintUnlocked(true);
                petSay(hasHintPenalty
                  ? hintPenaltyCost > 0
                    ? petAbilityReady
                      ? `Dica liberada, mas custou ${hintPenaltyCost} nivel(is) e sua rota voltou uma missao.`
                      : `Hunter esta em recarga nesta missao. A dica custou ${hintPenaltyCost} nivel(is).`
                    : "Hunter protegeu seu nivel nesta dica."
                  : "Dica liberada. Use ela para revisar o caminho, nao para decorar.");
              }}
              className="cq-button cq-button-secondary mt-4 border-yellow-300/50 text-yellow-100"
            >
              {hasHintPenalty
                ? hintPenaltyCost > 0
                  ? petAbilityReady
                    ? `Usar dica (-${hintPenaltyCost} niveis e volta 1 missao)`
                    : `Usar dica (Hunter em recarga, -${hintPenaltyCost} niveis)`
                  : "Usar dica (Hunter protege o nivel)"
                : "Mostrar dica"}
            </button>
          )}
        </div>
      )}

      {penaltyMessage && (
        <div className="mt-6 rounded-md border border-yellow-300/45 bg-yellow-500/10 p-4 text-yellow-100">
          <p className="font-mono text-xs font-black uppercase tracking-[0.12em]">
            Penalidade aplicada
          </p>
          <p className="mt-2 text-sm leading-6">{penaltyMessage}</p>
        </div>
      )}

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

        {(language === "sql" || language === "java") && (
          <button
            type="button"
            onClick={sendToNotebookTerminal}
            className="cq-button cq-button-secondary"
          >
            Usar no terminal
          </button>
        )}

        {result?.success && (
          <button
            onClick={onSuccess}
            className="cq-button border-green-200 bg-green-700 hover:bg-green-600"
          >
            {successLabel}
          </button>
        )}

        {!result?.success && failedAttempts > 0 && onReviewTheory && (
          <button
            type="button"
            onClick={onReviewTheory}
            className="cq-button cq-button-secondary"
          >
            Revisar teoria
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

      {result && !result.success && (
        <div className="mt-4 rounded-md border border-[#26384f] bg-[#07101d] p-4 text-[#c8d3e3]">
          <p className="font-mono text-xs font-black uppercase tracking-[0.12em] text-[#9ec0ff]">
            Como corrigir sem decorar
          </p>
          <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-6">
            {getRecoveryChecklist(language).map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      )}

      {attemptHistory.length > 0 && (
        <div className="mt-6 rounded-md border border-[#26384f] bg-[#070c15] p-4">
          <p className="font-mono text-xs font-black uppercase tracking-[0.12em] text-[#93a4bd]">
            Tentativas desta missao
          </p>
          <div className="mt-3 space-y-3">
            {attemptHistory.map((attempt, index) => (
              <div
                key={`${attempt.answer}-${index}`}
                className="rounded border border-[#1e3149] bg-[#0b1424] p-3 text-sm"
              >
                <div className="flex flex-wrap items-center gap-2">
                  <span className={[
                    "cq-badge",
                    attempt.success
                      ? "border-green-300/40 text-green-100"
                      : "border-red-300/40 text-red-100",
                  ].join(" ")}>
                    {attempt.success ? "Certo" : "Errado"}
                  </span>
                  <span className="text-[#93a4bd]">{attempt.message}</span>
                </div>
                <p className="mt-2 break-words font-mono text-xs text-[#dbe8ff]">
                  {attempt.answer || "(vazio)"}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );
}

function getReasoningChecklist(language?: string) {
  if (language === "sql") {
    return [
      "Identifique qual tabela guarda os dados pedidos.",
      "Escolha quais colunas precisam aparecer no resultado.",
      "Separe filtros de linha, agrupamentos e ordenacao antes de escrever.",
      "Monte a consulta por partes e execute apenas quando fizer sentido completo.",
    ];
  }

  return [
    "Leia o objetivo e identifique quais dados entram no problema.",
    "Pense no resultado esperado antes de escrever a primeira linha.",
    "Separe nomes, valores, condicoes e repeticoes quando existirem.",
    "Monte a solucao por partes pequenas e confira se cada parte tem funcao clara.",
  ];
}

function getRecoveryChecklist(language?: string) {
  if (language === "sql") {
    return [
      "Confira se a consulta tem SELECT e FROM antes de pensar nos detalhes.",
      "Veja se as colunas pedidas aparecem na ordem certa e separadas por virgula.",
      "Se tiver filtro, deixe a condicao no WHERE; se tiver ordem, use ORDER BY.",
      "Espacos extras nao importam: foque na estrutura e nos nomes corretos.",
    ];
  }

  return [
    "Compare o objetivo com o que seu codigo realmente entrega.",
    "Procure nomes trocados, valores fora do lugar e condicoes incompletas.",
    "Volte uma etapa se a ideia ainda nao estiver clara.",
    "Tente de novo com uma mudanca pequena, nao reescrevendo tudo do zero.",
  ];
}
