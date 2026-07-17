"use client";

import Image from "next/image";
import { useEffect, useMemo, useState, useSyncExternalStore } from "react";

import {
  getLocalSessionSnapshot,
  getServerLocalSessionSnapshot,
  LocalSession,
  subscribeToLocalAuth,
} from "@/application/auth/localAuth";

type RankingRow = {
  userId: string;
  name: string;
  level: number;
  xp: number;
  coins: number;
  completedStages: number;
  avatarSrc?: string | null;
  avatarName: string;
};

export default function RankingPage() {
  const sessionSnapshot = useSyncExternalStore(
    subscribeToLocalAuth,
    getLocalSessionSnapshot,
    getServerLocalSessionSnapshot
  );
  const session = useMemo(() => parseJson<LocalSession>(sessionSnapshot), [sessionSnapshot]);
  const [ranking, setRanking] = useState<RankingRow[]>([]);
  const [message, setMessage] = useState("");
  const [hasRankingVideo, setHasRankingVideo] = useState(false);

  useEffect(() => {
    queueMicrotask(async () => {
      try {
        const response = await fetch("/api/ranking", {
          cache: "no-store",
        });
        const data = await response.json() as { ranking?: RankingRow[]; error?: string };

        if (!response.ok) {
          throw new Error(data.error ?? "Nao foi possivel carregar ranking.");
        }

        setRanking(data.ranking ?? []);
      } catch (error) {
        setMessage(error instanceof Error ? error.message : "Erro ao carregar ranking.");
      }
    });
  }, []);

  useEffect(() => {
    queueMicrotask(async () => {
      try {
        const response = await fetch("/assets/ranking/ranking.mp4", {
          method: "HEAD",
        });

        setHasRankingVideo(response.ok);
      } catch {
        setHasRankingVideo(false);
      }
    });
  }, []);

  const topThree = ranking.slice(0, 3);

  return (
    <main className="cq-page">
      <section className="cq-shell">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="cq-kicker">Ranking</p>
            <h1 className="cq-title mt-3 text-4xl md:text-6xl">
              Hall dos jogadores
            </h1>
            <p className="mt-4 max-w-2xl text-[#93a4bd]">
              Classificacao por nivel, XP, fases concluidas e moedas.
            </p>
          </div>

          {session && (
            <div className="cq-panel p-4 text-sm text-[#dbe8ff]">
              Logado como {session.name}
            </div>
          )}
        </div>

        {message && (
          <div className="cq-panel mt-6 p-4 text-sm text-[#dbe8ff]">
            {message}
          </div>
        )}

        {hasRankingVideo && (
          <div className="cq-panel mt-8 overflow-hidden p-0">
            <div className="border-b border-[#26384f] p-5">
              <p className="cq-kicker">Video do ranking</p>
              <h2 className="cq-title mt-2 text-2xl">Destaque da guilda</h2>
            </div>
            <video
              src="/assets/ranking/ranking.mp4"
              controls
              preload="metadata"
              className="max-h-[32rem] w-full bg-black"
            />
          </div>
        )}

        <div className="mt-8 grid gap-5 md:grid-cols-3">
          {topThree.map((row, index) => (
            <article
              key={row.userId}
              className={[
                "cq-card p-5",
                index === 0 ? "border-yellow-300/60" : "",
              ].join(" ")}
            >
              <p className="cq-kicker">#{index + 1}</p>
              <div className="mt-4 flex items-center gap-4">
                <RankingAvatar row={row} size="lg" />
                <div className="min-w-0">
                  <h2 className="cq-title truncate text-2xl">{row.name}</h2>
                  <p className="mt-1 text-sm text-[#93a4bd]">
                    Level {row.level}
                  </p>
                </div>
              </div>
              <div className="mt-5 grid grid-cols-3 gap-2 text-center text-sm">
                <Stat label="XP" value={row.xp} />
                <Stat label="Fases" value={row.completedStages} />
                <Stat label="Moedas" value={row.coins} />
              </div>
            </article>
          ))}
        </div>

        <div className="cq-panel mt-8 overflow-hidden p-0">
          <div className="grid grid-cols-[4rem_1fr_5rem_5rem] border-b border-[#26384f] px-4 py-3 font-mono text-xs font-black uppercase tracking-[0.1em] text-[#93a4bd] md:grid-cols-[4rem_1fr_6rem_6rem_6rem]">
            <span>#</span>
            <span>Usuario</span>
            <span>Level</span>
            <span>XP</span>
            <span className="hidden md:block">Fases</span>
          </div>

          {ranking.map((row, index) => (
            <div
              key={row.userId}
              className={[
                "grid grid-cols-[4rem_1fr_5rem_5rem] items-center border-b border-[#172336] px-4 py-4 last:border-b-0 md:grid-cols-[4rem_1fr_6rem_6rem_6rem]",
                session?.userId === row.userId ? "bg-[#2f66e8]/10" : "",
              ].join(" ")}
            >
              <span className="font-mono text-sm font-black text-[#dbe8ff]">
                {index + 1}
              </span>
              <div className="flex min-w-0 items-center gap-3">
                <RankingAvatar row={row} />
                <div className="min-w-0">
                  <p className="truncate font-mono text-sm font-black text-[#f3f7ff]">
                    {row.name}
                  </p>
                  <p className="mt-1 text-xs text-[#93a4bd]">
                    {row.coins} moedas
                  </p>
                </div>
              </div>
              <span className="font-mono text-sm text-[#dbe8ff]">{row.level}</span>
              <span className="font-mono text-sm text-[#dbe8ff]">{row.xp}</span>
              <span className="hidden font-mono text-sm text-[#dbe8ff] md:block">
                {row.completedStages}
              </span>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}

function RankingAvatar({
  row,
  size = "sm",
}: {
  row: RankingRow;
  size?: "sm" | "lg";
}) {
  const dimensions = size === "lg" ? "size-20" : "size-11";

  return (
    <span className={`${dimensions} relative inline-flex overflow-hidden border border-[#6f91d8] bg-[#101827]`}>
      {row.avatarSrc ? (
        <Image
          src={row.avatarSrc}
          alt={row.avatarName}
          fill
          sizes={size === "lg" ? "80px" : "44px"}
          className="object-cover"
        />
      ) : (
        <span className="m-auto font-mono text-xs font-black text-[#dbe8ff]">
          CQ
        </span>
      )}
    </span>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded border border-[#26384f] bg-[#07101d] p-2">
      <p className="font-mono text-xs text-[#93a4bd]">{label}</p>
      <p className="mt-1 font-mono font-black text-[#f3f7ff]">{value}</p>
    </div>
  );
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
