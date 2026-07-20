"use client";

import Link from "next/link";
import { useEffect, useMemo, useState, useSyncExternalStore } from "react";

import {
  getLocalSessionSnapshot,
  getServerLocalSessionSnapshot,
  getSessionRequestHeaders,
  LocalSession,
  subscribeToLocalAuth,
} from "@/application/auth/localAuth";
import { campaigns } from "@/data/campaigns";

type AttemptSummary = {
  id?: string;
  userId: string;
  stageId: string;
  stepTitle?: string;
  answer: string;
  success: boolean;
  feedback: string;
  createdAt?: string;
};

type ReviewGroup = {
  stageId: string;
  title: string;
  campaignTitle: string;
  chapterTitle: string;
  attempts: AttemptSummary[];
  errors: number;
  successes: number;
  lastAttempt?: AttemptSummary;
};

const stageLookup = new Map(campaigns.flatMap((campaign) => (
  campaign.chapters.flatMap((chapter) => (
    chapter.stages.map((stage) => [
      stage.id,
      {
        title: stage.title,
        campaignTitle: campaign.title,
        chapterTitle: chapter.title,
      },
    ] as const)
  ))
)));

export default function ReviewPage() {
  const sessionSnapshot = useSyncExternalStore(
    subscribeToLocalAuth,
    getLocalSessionSnapshot,
    getServerLocalSessionSnapshot
  );
  const session = useMemo(() => parseJson<LocalSession>(sessionSnapshot), [sessionSnapshot]);
  const [attempts, setAttempts] = useState<AttemptSummary[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const reviewGroups = useMemo(() => buildReviewGroups(attempts), [attempts]);
  const weakSpots = reviewGroups.filter((group) => group.errors > 0).slice(0, 6);
  const totalErrors = reviewGroups.reduce((total, group) => total + group.errors, 0);
  const totalSuccesses = reviewGroups.reduce((total, group) => total + group.successes, 0);

  useEffect(() => {
    if (!session) {
      return;
    }

    let cancelled = false;

    queueMicrotask(async () => {
      setLoading(true);
      setMessage("");

      try {
        const response = await fetch(
          `/api/attempts?userId=${encodeURIComponent(session.userId)}&limit=100`,
          {
            cache: "no-store",
            headers: getSessionRequestHeaders(),
          }
        );
        const data = await response.json() as { attempts?: AttemptSummary[]; error?: string };

        if (!response.ok) {
          throw new Error(data.error ?? "Nao foi possivel carregar revisao.");
        }

        if (!cancelled) {
          setAttempts(data.attempts ?? []);
        }
      } catch (error) {
        if (!cancelled) {
          setMessage(error instanceof Error ? error.message : "Erro ao carregar revisao.");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    });

    return () => {
      cancelled = true;
    };
  }, [session]);

  if (!session) {
    return (
      <main className="cq-page">
        <section className="cq-shell">
          <div className="cq-panel max-w-2xl p-6">
            <p className="cq-kicker">Revisao</p>
            <h1 className="cq-title mt-3 text-4xl">Entre para revisar</h1>
            <p className="mt-4 text-[#93a4bd]">
              A revisao usa suas tentativas salvas para mostrar onde treinar.
            </p>
            <Link href="/login" className="cq-button mt-6">Entrar</Link>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="cq-page">
      <section className="cq-shell">
        <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="cq-kicker">Modo revisao</p>
            <h1 className="cq-title mt-3 text-4xl md:text-6xl">
              Treinar pontos fracos
            </h1>
            <p className="mt-4 max-w-2xl leading-7 text-[#93a4bd]">
              Aqui ficam as fases em que voce tentou, errou, acertou e pode voltar para reforcar.
            </p>
          </div>
          <Link href="/journey" className="cq-button cq-button-secondary">
            Voltar para jornada
          </Link>
        </div>

        {message && (
          <div className="cq-panel mt-6 p-4 text-sm text-[#dbe8ff]">{message}</div>
        )}

        <div className="mt-8 grid gap-4 md:grid-cols-4">
          <Stat label="Tentativas" value={attempts.length} />
          <Stat label="Acertos" value={totalSuccesses} />
          <Stat label="Erros" value={totalErrors} />
          <Stat label="Fases revisaveis" value={weakSpots.length} />
        </div>

        <section className="cq-panel mt-8 p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="cq-kicker">Prioridade</p>
              <h2 className="cq-title mt-2 text-2xl">Onde revisar primeiro</h2>
            </div>
            {loading && <span className="cq-badge">Carregando...</span>}
          </div>

          <div className="mt-5 grid gap-4">
            {weakSpots.length === 0 ? (
              <p className="text-[#93a4bd]">
                Nenhum erro registrado ainda. Tente algumas missoes para montar sua revisao.
              </p>
            ) : weakSpots.map((group) => (
              <ReviewCard key={group.stageId} group={group} />
            ))}
          </div>
        </section>
      </section>
    </main>
  );
}

function ReviewCard({ group }: { group: ReviewGroup }) {
  const lastWrong = group.attempts.find((attempt) => !attempt.success);

  return (
    <article className="cq-card p-5">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <div className="flex flex-wrap gap-2">
            <span className="cq-badge border-red-300/40 text-red-100">{group.errors} erro(s)</span>
            <span className="cq-badge border-green-300/40 text-green-100">{group.successes} acerto(s)</span>
          </div>
          <h3 className="cq-title mt-4 text-2xl">{group.title}</h3>
          <p className="mt-2 text-sm text-[#93a4bd]">
            {group.campaignTitle} / {group.chapterTitle}
          </p>
          {lastWrong && (
            <div className="mt-4 rounded border border-[#26384f] bg-[#07101d] p-3">
              <p className="font-mono text-xs font-black uppercase tracking-[0.12em] text-[#9ec0ff]">
                Ultimo tropeço
              </p>
              <p className="mt-2 text-sm text-[#c8d3e3]">{lastWrong.feedback}</p>
              <p className="mt-2 break-words font-mono text-xs text-[#93a4bd]">
                {lastWrong.answer || "(vazio)"}
              </p>
            </div>
          )}
        </div>

        <div className="flex flex-wrap gap-3 lg:justify-end">
          <Link href={`/stage/${group.stageId}`} className="cq-button">
            Refazer fase
          </Link>
          <Link href={`/stage/${group.stageId}`} className="cq-button cq-button-secondary">
            Revisar teoria
          </Link>
        </div>
      </div>
    </article>
  );
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="cq-panel p-5">
      <p className="cq-kicker">{label}</p>
      <p className="mt-2 font-mono text-3xl font-black">{value}</p>
    </div>
  );
}

function buildReviewGroups(attempts: AttemptSummary[]): ReviewGroup[] {
  const grouped = new Map<string, AttemptSummary[]>();

  for (const attempt of attempts) {
    grouped.set(attempt.stageId, [...(grouped.get(attempt.stageId) ?? []), attempt]);
  }

  return [...grouped.entries()]
    .map(([stageId, stageAttempts]) => {
      const stage = stageLookup.get(stageId);

      return {
        stageId,
        title: stage?.title ?? stageAttempts[0]?.stepTitle ?? stageId,
        campaignTitle: stage?.campaignTitle ?? "Campanha",
        chapterTitle: stage?.chapterTitle ?? "Modulo",
        attempts: stageAttempts,
        errors: stageAttempts.filter((attempt) => !attempt.success).length,
        successes: stageAttempts.filter((attempt) => attempt.success).length,
        lastAttempt: stageAttempts[0],
      };
    })
    .sort((left, right) => (
      right.errors - left.errors ||
      Date.parse(right.lastAttempt?.createdAt ?? "") - Date.parse(left.lastAttempt?.createdAt ?? "")
    ));
}

function parseJson<T>(value: string) {
  if (!value) {
    return null;
  }

  try {
    return JSON.parse(value) as T;
  } catch {
    return null;
  }
}
