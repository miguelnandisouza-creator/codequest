"use client";

import { useCallback, useEffect, useMemo, useState, useSyncExternalStore } from "react";

import {
  getLocalSessionSnapshot,
  getServerLocalSessionSnapshot,
  LocalSession,
  LocalUser,
  subscribeToLocalAuth,
} from "@/application/auth/localAuth";
import { isAdminEmail } from "@/data/admin";
import { rewardItems, RewardKind } from "@/data/rewards";
import { Player } from "@/domain/entities/player";

type AdminRow = {
  user: LocalUser;
  player: Player;
};

type AdminProgressPatch = {
  coins?: number;
  level?: number;
  action?: string;
  rewardId?: string;
  surpriseExam?: {
    title: string;
    question: string;
    options: string[];
    correctAnswer: string;
    rewardXp: number;
    rewardCoins: number;
  };
};

export default function AdminPage() {
  const sessionSnapshot = useSyncExternalStore(
    subscribeToLocalAuth,
    getLocalSessionSnapshot,
    getServerLocalSessionSnapshot
  );
  const session = useMemo(() => parseJson<LocalSession>(sessionSnapshot), [sessionSnapshot]);
  const [rows, setRows] = useState<AdminRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [storageMode, setStorageMode] = useState<"local" | "supabase" | "">("");
  const [filter, setFilter] = useState<"all" | "pending" | "active" | "new" | "advanced">("all");
  const isAdmin = isAdminEmail(session?.email);
  const analytics = useMemo(() => getAdminAnalytics(rows), [rows]);
  const filteredRows = useMemo(() => {
    if (filter === "pending") {
      return rows.filter((row) => row.player.surpriseExam && !row.player.surpriseExam.completedAt);
    }

    if (filter === "active") {
      return rows.filter((row) => row.player.progress.completedStages.length > 0);
    }

    if (filter === "new") {
      return rows.filter((row) => row.player.progress.completedStages.length === 0);
    }

    if (filter === "advanced") {
      return [...rows].sort((left, right) => right.player.level - left.player.level);
    }

    return rows;
  }, [filter, rows]);

  const loadRows = useCallback(async () => {
    if (!session) {
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      const response = await fetch(
        `/api/admin/progress?adminEmail=${encodeURIComponent(session.email)}`,
        { cache: "no-store" }
      );
      const storageResponse = await fetch(
        `/api/admin/storage-status?adminEmail=${encodeURIComponent(session.email)}`,
        { cache: "no-store" }
      );
      const data = await response.json() as { rows?: AdminRow[]; error?: string };
      const storageData = await storageResponse.json() as { mode?: "local" | "supabase" };

      if (!response.ok) {
        throw new Error(data.error ?? "Nao foi possivel carregar usuarios.");
      }

      setRows(data.rows ?? []);
      setStorageMode(storageData.mode ?? "");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Erro ao carregar painel.");
    } finally {
      setLoading(false);
    }
  }, [session]);

  useEffect(() => {
    if (session && isAdmin) {
      queueMicrotask(() => {
        void loadRows();
      });
    }
  }, [session, isAdmin, loadRows]);

  async function updateProgress(userId: string, patch: AdminProgressPatch) {
    if (!session) {
      return;
    }

    const response = await fetch(
      `/api/admin/progress?adminEmail=${encodeURIComponent(session.email)}`,
      {
        method: "PATCH",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({
          userId,
          ...patch,
        }),
      }
    );
    const data = await response.json() as { player?: Player; error?: string };

    if (!response.ok || !data.player) {
      setMessage(data.error ?? "Nao foi possivel atualizar progresso.");
      return;
    }

    setRows((currentRows) => currentRows.map((row) => (
      row.user.id === userId
        ? { ...row, player: data.player as Player }
        : row
    )));
    setMessage("Progresso atualizado.");
  }

  if (!session || !isAdmin) {
    return (
      <main className="cq-page">
        <section className="cq-shell">
          <div className="cq-panel max-w-2xl p-6">
            <p className="cq-kicker">Admin</p>
            <h1 className="cq-title mt-3 text-4xl">Acesso negado</h1>
            <p className="mt-4 text-[#93a4bd]">
              Entre com a conta admin do Miguel para abrir este painel.
            </p>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="cq-page">
      <section className="cq-shell">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="cq-kicker">Admin</p>
            <h1 className="cq-title mt-3 text-4xl md:text-6xl">
              Usuarios
            </h1>
            <p className="mt-4 max-w-2xl text-[#93a4bd]">
              Veja e ajuste nivel/moedas de cada conta salva no projeto.
            </p>
          </div>

          <button type="button" onClick={loadRows} className="cq-button cq-button-secondary">
            Atualizar
          </button>
        </div>

        {storageMode && (
          <div className="cq-panel mt-6 p-4 text-sm text-[#dbe8ff]">
            Armazenamento atual: {storageMode === "supabase" ? "Supabase" : "Local .data"}
          </div>
        )}

        {message && (
          <div className="cq-panel mt-6 p-4 text-sm text-[#dbe8ff]">
            {message}
          </div>
        )}

        <div className="mt-8 grid gap-4 md:grid-cols-3 xl:grid-cols-6">
          <AdminStat label="Usuarios" value={analytics.totalUsers} />
          <AdminStat label="Ativos" value={analytics.activeUsers} />
          <AdminStat label="Provas" value={analytics.pendingExams} />
          <AdminStat label="Nivel medio" value={analytics.averageLevel} />
          <AdminStat label="Fases" value={analytics.totalCompletedStages} />
          <AdminStat label="Top aluno" value={analytics.topUser} compact />
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          {[
            ["all", "Todos"],
            ["pending", "Com prova"],
            ["active", "Com progresso"],
            ["new", "Sem progresso"],
            ["advanced", "Mais avancados"],
          ].map(([value, label]) => (
            <button
              key={value}
              type="button"
              onClick={() => setFilter(value as typeof filter)}
              className={`cq-button ${filter === value ? "" : "cq-button-secondary"}`}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="mt-8 grid gap-4">
          {loading ? (
            <div className="cq-panel p-6 text-[#93a4bd]">Carregando usuarios...</div>
          ) : filteredRows.map((row) => (
            <AdminUserCard
              key={`${row.user.id}-${row.player.coins}-${row.player.level}`}
              row={row}
              onUpdate={updateProgress}
            />
          ))}
        </div>
      </section>
    </main>
  );
}

function AdminStat({
  label,
  value,
  compact = false,
}: {
  label: string;
  value: string | number;
  compact?: boolean;
}) {
  return (
    <div className="cq-panel p-4">
      <p className="cq-kicker">{label}</p>
      <p className={`mt-2 font-mono font-black ${compact ? "text-base" : "text-2xl"}`}>
        {value}
      </p>
    </div>
  );
}

function getAdminAnalytics(rows: AdminRow[]) {
  const totalUsers = rows.length;
  const activeUsers = rows.filter((row) => row.player.progress.completedStages.length > 0).length;
  const pendingExams = rows.filter((row) => row.player.surpriseExam && !row.player.surpriseExam.completedAt).length;
  const totalCompletedStages = rows.reduce((total, row) => (
    total + row.player.progress.completedStages.length
  ), 0);
  const averageLevel = totalUsers === 0
    ? 0
    : Math.round(rows.reduce((total, row) => total + row.player.level, 0) / totalUsers);
  const topRow = [...rows].sort((left, right) => (
    right.player.progress.completedStages.length - left.player.progress.completedStages.length
  ))[0];

  return {
    totalUsers,
    activeUsers,
    pendingExams,
    averageLevel,
    totalCompletedStages,
    topUser: topRow ? topRow.user.name : "-",
  };
}

function AdminUserCard({
  row,
  onUpdate,
}: {
  row: AdminRow;
  onUpdate: (userId: string, patch: AdminProgressPatch) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const [coins, setCoins] = useState(String(row.player.coins));
  const [level, setLevel] = useState(String(row.player.level));
  const [rewardId, setRewardId] = useState(rewardItems[0]?.id ?? "");
  const [examTitle, setExamTitle] = useState("Prova surpresa");
  const [examQuestion, setExamQuestion] = useState("Qual comando lista todos os clientes?");
  const [examOptions, setExamOptions] = useState("SELECT * FROM clientes\nSELECT clientes\nGET clientes");
  const [examAnswer, setExamAnswer] = useState("SELECT * FROM clientes");
  const [examXp, setExamXp] = useState("80");
  const [examCoins, setExamCoins] = useState("40");

  const completedCount = row.player.progress.completedStages.length;
  const selectedReward = rewardItems.find((reward) => reward.id === rewardId);

  return (
    <article className="cq-card p-5">
      <div className="grid gap-5 lg:grid-cols-[1fr_auto] lg:items-center">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <h2 className="cq-title text-2xl">{row.user.name}</h2>
            <span className="cq-badge">{row.user.email}</span>
            {row.player.surpriseExam && !row.player.surpriseExam.completedAt && (
              <span className="cq-badge border-yellow-300/40 text-yellow-100">
                Prova pendente
              </span>
            )}
          </div>

          <div className="mt-4 grid gap-3 text-sm text-[#93a4bd] md:grid-cols-4">
            <span>Nivel {row.player.level}</span>
            <span>{row.player.coins} moedas</span>
            <span>{row.player.xp} XP</span>
            <span>{completedCount} fases</span>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setExpanded((current) => !current)}
          className="cq-button cq-button-secondary"
          aria-expanded={expanded}
        >
          {expanded ? "Minimizar" : "Gerenciar"}
        </button>
      </div>

      {expanded && (
        <div className="mt-6 grid gap-3 border-t border-[#26384f] pt-5 sm:grid-cols-2 lg:ml-auto lg:max-w-[34rem]">
          <label className="grid gap-2 text-xs font-bold uppercase tracking-[0.12em] text-[#93a4bd]">
            Moedas
            <input
              type="number"
              min="0"
              value={coins}
              onChange={(event) => setCoins(event.target.value)}
              className="min-h-11 border border-[#26384f] bg-[#0b1424] px-3 font-mono text-sm text-[#f3f7ff] outline-none focus:border-[#6f91d8]"
            />
          </label>

          <label className="grid gap-2 text-xs font-bold uppercase tracking-[0.12em] text-[#93a4bd]">
            Nivel
            <input
              type="number"
              min="1"
              value={level}
              onChange={(event) => setLevel(event.target.value)}
              className="min-h-11 border border-[#26384f] bg-[#0b1424] px-3 font-mono text-sm text-[#f3f7ff] outline-none focus:border-[#6f91d8]"
            />
          </label>

          <button
            type="button"
            onClick={() => onUpdate(row.user.id, { coins: Number(coins), level: Number(level) })}
            className="cq-button sm:col-span-2"
          >
            Salvar progresso
          </button>

          <button
            type="button"
            onClick={() => onUpdate(row.user.id, { coins: row.player.coins + 500 })}
            className="cq-button cq-button-secondary"
          >
            +500 moedas
          </button>

          <button
            type="button"
            onClick={() => onUpdate(row.user.id, { level: row.player.level + 1 })}
            className="cq-button cq-button-secondary"
          >
            +1 nivel
          </button>

          <label className="grid gap-2 text-xs font-bold uppercase tracking-[0.12em] text-[#93a4bd] sm:col-span-2">
            Recompensa
            <select
              value={rewardId}
              onChange={(event) => setRewardId(event.target.value)}
              className="min-h-11 border border-[#26384f] bg-[#0b1424] px-3 font-mono text-sm text-[#f3f7ff] outline-none focus:border-[#6f91d8]"
            >
              {rewardItems.map((reward) => (
                <option key={reward.id} value={reward.id}>
                  {reward.name} - {getRewardKindLabel(reward.kind)}
                </option>
              ))}
            </select>
          </label>

          <button
            type="button"
            onClick={() => onUpdate(row.user.id, { action: "grantReward", rewardId })}
            className="cq-button cq-button-secondary"
          >
            Liberar {selectedReward ? getRewardKindLabel(selectedReward.kind).toLowerCase() : "item"}
          </button>

          <button
            type="button"
            onClick={() => onUpdate(row.user.id, { action: "equipReward", rewardId })}
            className="cq-button cq-button-secondary"
          >
            Equipar
          </button>

          <div className="cq-panel p-4 sm:col-span-2">
            <p className="cq-kicker">Prova surpresa</p>
            {row.player.surpriseExam && !row.player.surpriseExam.completedAt && (
              <p className="mt-2 text-sm text-[#93a4bd]">
                Pendente: {row.player.surpriseExam.title}
              </p>
            )}
            <div className="mt-4 grid gap-3">
              <input
                value={examTitle}
                onChange={(event) => setExamTitle(event.target.value)}
                className="min-h-11 border border-[#26384f] bg-[#0b1424] px-3 font-mono text-sm text-[#f3f7ff] outline-none focus:border-[#6f91d8]"
                placeholder="Titulo"
              />
              <textarea
                value={examQuestion}
                onChange={(event) => setExamQuestion(event.target.value)}
                className="min-h-24 border border-[#26384f] bg-[#0b1424] px-3 py-3 font-mono text-sm text-[#f3f7ff] outline-none focus:border-[#6f91d8]"
                placeholder="Pergunta"
              />
              <textarea
                value={examOptions}
                onChange={(event) => setExamOptions(event.target.value)}
                className="min-h-28 border border-[#26384f] bg-[#0b1424] px-3 py-3 font-mono text-sm text-[#f3f7ff] outline-none focus:border-[#6f91d8]"
                placeholder="Opcoes, uma por linha"
              />
              <input
                value={examAnswer}
                onChange={(event) => setExamAnswer(event.target.value)}
                className="min-h-11 border border-[#26384f] bg-[#0b1424] px-3 font-mono text-sm text-[#f3f7ff] outline-none focus:border-[#6f91d8]"
                placeholder="Resposta correta exatamente como uma opcao"
              />
              <div className="grid gap-3 sm:grid-cols-2">
                <input
                  type="number"
                  min="0"
                  value={examXp}
                  onChange={(event) => setExamXp(event.target.value)}
                  className="min-h-11 border border-[#26384f] bg-[#0b1424] px-3 font-mono text-sm text-[#f3f7ff] outline-none focus:border-[#6f91d8]"
                  placeholder="XP"
                />
                <input
                  type="number"
                  min="0"
                  value={examCoins}
                  onChange={(event) => setExamCoins(event.target.value)}
                  className="min-h-11 border border-[#26384f] bg-[#0b1424] px-3 font-mono text-sm text-[#f3f7ff] outline-none focus:border-[#6f91d8]"
                  placeholder="Moedas"
                />
              </div>
              <button
                type="button"
                onClick={() => onUpdate(row.user.id, {
                  action: "assignSurpriseExam",
                  surpriseExam: {
                    title: examTitle,
                    question: examQuestion,
                    options: examOptions.split(/\r?\n/),
                    correctAnswer: examAnswer,
                    rewardXp: Number(examXp),
                    rewardCoins: Number(examCoins),
                  },
                })}
                className="cq-button"
              >
                Enviar prova para usuario
              </button>
              <button
                type="button"
                onClick={() => onUpdate(row.user.id, { action: "clearSurpriseExam" })}
                className="cq-button cq-button-secondary"
              >
                Limpar prova pendente
              </button>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              if (window.confirm(`Resetar progresso de ${row.user.name}?`)) {
                onUpdate(row.user.id, { action: "reset" });
              }
            }}
            className="cq-button cq-button-secondary border-red-300/50 text-red-100 sm:col-span-2"
          >
            Resetar progresso
          </button>
        </div>
      )}
    </article>
  );
}

function getRewardKindLabel(kind: RewardKind) {
  if (kind === "avatar") return "Foto";
  if (kind === "pet") return "Pet";
  if (kind === "theme") return "Tema";
  if (kind === "frame") return "Moldura";
  return "Efeito";
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
