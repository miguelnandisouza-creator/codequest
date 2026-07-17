"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";

import { CodeEditor } from "@/components/editor/CodeEditor";
import { Stage, StageContent } from "@/domain/entities/stage";
import {
  getTrainingSchema,
  runSelectQuery,
  sampleTables,
  TerminalResult,
} from "@/domain/game/sqlTrainingTerminal";
import {
  getDefaultJavaSnippet,
  getJavaTrainingGuide,
  JavaTerminalResult,
  runJavaSnippet,
} from "@/domain/game/javaTrainingTerminal";

type Props = {
  stage: Stage;
  current: StageContent;
  language: string;
};

export default function LearningNotebook({
  stage,
  current,
  language,
}: Props) {
  const storageKey = `codequest-notebook-${stage.id}`;
  const terminalKey = `codequest-terminal-${stage.id}`;
  const saveTimeoutRef = useRef<number | undefined>(undefined);
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<"notes" | "terminal" | "schema">("notes");
  const [pageTurnKey, setPageTurnKey] = useState(0);
  const [userId] = useState(() => readSessionUserId());
  const [notes, setNotes] = useState(() => readStorage(storageKey));
  const [noteStatus, setNoteStatus] = useState(userId ? "Carregando..." : "Local");
  const [terminalCode, setTerminalCode] = useState(() => (
    readStorage(terminalKey) || getDefaultTerminalCode(language)
  ));
  const [terminalResult, setTerminalResult] = useState<{
    language: string;
    result: TerminalResult | JavaTerminalResult;
  } | null>(null);
  const [terminalError, setTerminalError] = useState("");
  const currentExplanation = useMemo(() => getCurrentExplanation(current), [current]);

  useEffect(() => {
    if (!userId) {
      return undefined;
    }

    let cancelled = false;

    queueMicrotask(async () => {
      try {
        const response = await fetch(
          `/api/notebook-notes?userId=${encodeURIComponent(userId)}&stageId=${encodeURIComponent(stage.id)}`,
          { cache: "no-store" }
        );
        const data = await response.json() as { note?: { content?: string } | null };

        if (!cancelled && response.ok && data.note?.content !== undefined) {
          setNotes(data.note.content);
          writeStorage(storageKey, data.note.content);
          setNoteStatus("Sincronizado");
        } else if (!cancelled) {
          setNoteStatus("Local");
        }
      } catch {
        if (!cancelled) {
          setNoteStatus("Local");
        }
      }
    });

    return () => {
      cancelled = true;
    };
  }, [stage.id, storageKey, userId]);

  useEffect(() => () => {
    window.clearTimeout(saveTimeoutRef.current);
  }, []);

  useEffect(() => {
    queueMicrotask(() => {
      setTerminalCode(readStorage(terminalKey) || getDefaultTerminalCode(language));
      setTerminalResult(null);
      setTerminalError("");
    });
  }, [language, terminalKey]);

  useEffect(() => {
    function handleUseInTerminal(event: Event) {
      const nextCode = event instanceof CustomEvent
        ? String(event.detail?.code ?? "")
        : "";

      if (!nextCode.trim()) {
        return;
      }

      updateTerminal(nextCode);
      setTerminalResult(null);
      setTerminalError("");
      setOpen(true);
      turnTo("terminal");
    }

    window.addEventListener("codequest-terminal-load", handleUseInTerminal);

    return () => {
      window.removeEventListener("codequest-terminal-load", handleUseInTerminal);
    };
  });

  function updateNotes(value: string) {
    setNotes(value);
    writeStorage(storageKey, value);
    scheduleRemoteNoteSave(value);
  }

  function updateTerminal(value: string) {
    setTerminalCode(value);
    writeStorage(terminalKey, value);
  }

  function turnTo(nextTab: "notes" | "terminal" | "schema") {
    if (nextTab === tab) {
      return;
    }

    setPageTurnKey((current) => current + 1);
    setTab(nextTab);
  }

  function captureCurrentExplanation() {
    const title = getCurrentTitle(current);
    const block = [
      notes.trim(),
      `## ${title}`,
      currentExplanation,
    ].filter(Boolean).join("\n\n");

    updateNotes(block);
    turnTo("notes");
    setOpen(true);
  }

  function runTerminal() {
    setTerminalError("");
    setTerminalResult(null);

    const result = language === "java"
      ? runJavaSnippet(terminalCode)
      : runSelectQuery(terminalCode);

    if ("error" in result) {
      setTerminalError(result.error);
      return;
    }

    setTerminalResult({ language, result });
  }

  function scheduleRemoteNoteSave(value: string) {
    if (!userId) {
      setNoteStatus("Local");
      return;
    }

    window.clearTimeout(saveTimeoutRef.current);
    setNoteStatus("Salvando...");
    saveTimeoutRef.current = window.setTimeout(async () => {
      try {
        const response = await fetch("/api/notebook-notes", {
          method: "POST",
          headers: {
            "content-type": "application/json",
          },
          body: JSON.stringify({
            userId,
            stageId: stage.id,
            content: value,
          }),
        });

        setNoteStatus(response.ok ? "Sincronizado" : "Local");
      } catch {
        setNoteStatus("Local");
      }
    }, 650);
  }

  return (
    <div className="fixed bottom-4 right-4 z-40 max-w-[calc(100vw-2rem)]">
      {!open ? (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="group relative h-28 w-36 transition-transform hover:-translate-y-1"
          aria-label="Abrir caderno de estudos"
        >
          <span className="absolute bottom-4 left-5 h-5 w-24 -rotate-6 rounded-full bg-black/45 blur-md" />
          <Image
            src="/assets/ui/notebook-book.png"
            alt=""
            fill
            sizes="144px"
            className="object-contain drop-shadow-[0_10px_0_rgba(0,0,0,0.22)]"
            priority={false}
          />
        </button>
      ) : (
        <section className="relative w-[min(42rem,calc(100vw-2rem))] overflow-hidden rounded-md border border-[#3d5f92] bg-[#07101d]/95 p-2 shadow-[0_18px_50px_rgba(0,0,0,0.45)] backdrop-blur">
          <div className="pointer-events-none absolute inset-y-3 left-1/2 z-10 w-px bg-[#26384f]" />
          <div className="pointer-events-none absolute inset-2 border border-[#8fb4e8]/10" />

          <div className="relative z-20 flex items-center justify-between border-b border-[#26384f] bg-[#0b1424] px-4 py-3">
            <div>
              <p className="cq-kicker">Caderno de campo</p>
              <p className="mt-1 text-sm text-[#93a4bd]">{stage.title}</p>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="cq-button cq-button-secondary px-3 py-2"
              aria-label="Minimizar caderno"
            >
              Minimizar
            </button>
          </div>

          <div className="relative z-20 flex gap-2 border-b border-[#26384f] bg-[#08111f] px-4 py-3">
            <button
              type="button"
              onClick={() => turnTo("notes")}
              className={`cq-button px-3 py-2 ${tab === "notes" ? "" : "cq-button-secondary"}`}
            >
              Notas
            </button>
            <button
              type="button"
              onClick={() => turnTo("terminal")}
              className={`cq-button px-3 py-2 ${tab === "terminal" ? "" : "cq-button-secondary"}`}
            >
              Terminal
            </button>
            <button
              type="button"
              onClick={() => turnTo("schema")}
              className={`cq-button px-3 py-2 ${tab === "schema" ? "" : "cq-button-secondary"}`}
            >
              {language === "java" ? "Guia" : "Tabelas"}
            </button>
          </div>

          <div key={pageTurnKey} className="animate-cq-page-turn relative z-20 bg-[#0a1322]">
            {tab === "notes" ? (
            <div className="grid gap-4 p-4 md:grid-cols-[0.9fr_1.1fr]">
              <div className="rounded border border-[#26384f] bg-[#0f1b2d] p-4">
                <p className="font-mono text-xs font-black uppercase tracking-[0.14em] text-[#9ec0ff]">
                  Pagina atual
                </p>
                <h3 className="cq-title mt-3 text-lg">{getCurrentTitle(current)}</h3>
                <p className="mt-3 max-h-72 overflow-auto whitespace-pre-line text-sm leading-6 text-[#c8d3e3]">
                  {currentExplanation}
                </p>
              </div>

              <div>
              <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
                <p className="text-sm text-[#c8d3e3]">
                  Anote com suas palavras ou salve a explicacao atual.
                </p>
                <span className="cq-badge">{noteStatus}</span>
                <button
                  type="button"
                  onClick={captureCurrentExplanation}
                  className="cq-button cq-button-secondary px-3 py-2"
                >
                  Guardar explicacao
                </button>
              </div>
              <textarea
                value={notes}
                onChange={(event) => updateNotes(event.target.value)}
                className="min-h-72 w-full resize-y rounded-sm border border-[#26384f] bg-[#07101d] px-4 py-3 font-mono text-sm leading-6 text-[#f3f7ff] outline-none focus:border-[#6f91d8]"
                placeholder="Ex: SELECT escolhe as colunas, FROM escolhe a tabela..."
              />
              </div>
            </div>
          ) : tab === "terminal" ? (
            <div className="grid gap-4 p-4 md:grid-cols-[1fr_1fr]">
              <div className="rounded border border-[#26384f] bg-[#0f1b2d] p-4">
                <p className="font-mono text-xs font-black uppercase tracking-[0.14em] text-[#9ec0ff]">
                  Terminal de treino
                </p>
                <p className="mt-3 text-sm leading-6 text-[#c8d3e3]">
                  Teste comandos aqui sem concluir missao, perder nivel ou alterar progresso.
                </p>
                <p className="mt-4 font-mono text-xs leading-5 text-[#93a4bd]">
                  {language === "java"
                    ? "Java: variaveis, System.out, if, while e for basico."
                    : `Tabelas: ${Object.keys(sampleTables).join(", ")}`}
                </p>
              </div>

              <div className="grid gap-4">
              <div className="overflow-hidden rounded-md border border-[#26384f] bg-[#070c15]">
                <CodeEditor
                  code={terminalCode}
                  setCode={updateTerminal}
                  language={language === "java" ? "java" : "sql"}
                  height="190px"
                />
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={runTerminal}
                  className="cq-button"
                >
                  Rodar teste
                </button>
              </div>

              {terminalError && (
                <div className="rounded-md border border-red-500/40 bg-red-500/10 p-3 text-sm text-red-100">
                  {terminalError}
                </div>
              )}

              {terminalResult?.language === "java" && (
                <JavaTerminalOutput result={terminalResult.result as JavaTerminalResult} />
              )}

              {terminalResult?.language !== "java" && terminalResult && (
                <TerminalResultTable result={terminalResult.result as TerminalResult} />
              )}
              </div>
            </div>
          ) : (
            language === "java" ? <JavaGuidePage /> : <SchemaPage />
          )}
          </div>
        </section>
      )}
    </div>
  );
}

function SchemaPage() {
  return (
    <div className="grid gap-4 p-4 md:grid-cols-2">
      {getTrainingSchema().map((table) => (
        <div key={table.name} className="rounded border border-[#26384f] bg-[#0f1b2d] p-4">
          <div className="flex items-center justify-between gap-3">
            <h3 className="cq-title text-lg">{table.name}</h3>
            <span className="cq-badge">{table.rowCount} linhas</span>
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            {table.columns.map((column) => (
              <span key={column} className="rounded border border-[#3d5f92] bg-[#07101d] px-2 py-1 font-mono text-xs text-[#dbe8ff]">
                {column}
              </span>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function JavaGuidePage() {
  return (
    <div className="grid gap-4 p-4 md:grid-cols-2">
      {getJavaTrainingGuide().map((section) => (
        <div key={section.name} className="rounded border border-[#26384f] bg-[#0f1b2d] p-4">
          <h3 className="cq-title text-lg">{section.name}</h3>
          <div className="mt-3 space-y-2">
            {section.items.map((item) => (
              <code
                key={item}
                className="block rounded border border-[#3d5f92] bg-[#07101d] px-3 py-2 font-mono text-xs leading-5 text-[#dbe8ff]"
              >
                {item}
              </code>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function JavaTerminalOutput({ result }: { result: JavaTerminalResult }) {
  return (
    <div className="rounded-md border border-[#26384f] bg-[#07101d] p-3">
      <p className="mb-3 text-sm text-[#93a4bd]">{result.message}</p>
      <div className="rounded border border-[#1e3149] bg-black/30 p-3 font-mono text-xs leading-6 text-[#dbe8ff]">
        {result.output.length > 0 ? result.output.map((line, index) => (
          <p key={`${line}-${index}`}>{line}</p>
        )) : (
          <p className="text-[#7f91aa]">Nenhuma saida. Use System.out.println para imprimir.</p>
        )}
      </div>
      {Object.keys(result.variables).length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {Object.entries(result.variables).map(([name, value]) => (
            <span key={name} className="cq-badge">
              {name}: {String(value)}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

function TerminalResultTable({ result }: { result: TerminalResult }) {
  return (
    <div className="rounded-md border border-[#26384f] bg-[#07101d] p-3">
      <p className="mb-3 text-sm text-[#93a4bd]">{result.message}</p>
      <div className="overflow-auto">
        <table className="min-w-full border-collapse text-left font-mono text-xs text-[#dbe8ff]">
          <thead>
            <tr>
              {result.columns.map((column) => (
                <th key={column} className="border border-[#26384f] bg-[#10203a] px-3 py-2">
                  {column}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {result.rows.map((row, index) => (
              <tr key={index}>
                {result.columns.map((column) => (
                  <td key={column} className="border border-[#26384f] px-3 py-2">
                    {String(row[column] ?? "")}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function getCurrentTitle(current: StageContent) {
  return "title" in current ? current.title : "Anotacao";
}

function getCurrentExplanation(current: StageContent) {
  if (current.type === "text") return current.content;
  if (current.type === "example") return `${current.explanation}\n\n${current.code}\n\nResultado: ${current.result}`;
  if (current.type === "quiz") return `${current.question}\n\nExplicacao: ${current.explanation}`;

  return `${current.objective}\n\nPonto importante: tente resolver antes de abrir a dica.`;
}

function readStorage(key: string) {
  if (typeof window === "undefined") {
    return "";
  }

  return window.localStorage.getItem(key) ?? "";
}

function readSessionUserId() {
  if (typeof window === "undefined") {
    return "";
  }

  try {
    const session = JSON.parse(window.localStorage.getItem("codequest-session") ?? "{}") as {
      userId?: string;
    };

    return session.userId ?? "";
  } catch {
    return "";
  }
}

function writeStorage(key: string, value: string) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(key, value);
}

function getDefaultTerminalCode(language: string) {
  if (language === "java") {
    return getDefaultJavaSnippet();
  }

  return "select * from clientes limit 3";
}
