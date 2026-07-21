"use client";

import Link from "next/link";
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
  attempts: AttemptSummary[];
  snapshots: ProgressSnapshotSummary[];
};

type AdminProgressPatch = {
  coins?: number;
  level?: number;
  name?: string;
  stageId?: string;
  action?: string;
  password?: string;
  rewardId?: string;
  snapshotId?: string;
  surpriseExam?: {
    title: string;
    question: string;
    options: string[];
    correctAnswer: string;
    rewardXp: number;
    rewardCoins: number;
  };
};

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

type ProgressSnapshotSummary = {
  id: string;
  reason: string;
  createdAt: string;
  player: Player;
};

type AppSettingsSummary = {
  maintenanceMode: boolean;
  envForced: boolean;
  updatedAt?: string;
  updatedBy?: string;
};

type AdminAuditRecord = {
  id: string;
  action: string;
  label: string;
  actorEmail: string;
  targetUserId?: string;
  targetName?: string;
  targetEmail?: string;
  details?: string;
  createdAt: string;
};

type StageOption = {
  id: string;
  title: string;
  chapterId: string;
  chapterTitle: string;
  campaignId: string;
  campaignTitle: string;
};

type AdminUserTab = "progress" | "rewards" | "password" | "exam" | "history";

type ConfirmRequest = {
  title: string;
  message: string;
  confirmLabel?: string;
  danger?: boolean;
  onConfirm: () => void;
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
  const [appSettings, setAppSettings] = useState<AppSettingsSummary | null>(null);
  const [confirmRequest, setConfirmRequest] = useState<ConfirmRequest | null>(null);
  const [auditLog, setAuditLog] = useState<AdminAuditRecord[]>([]);
  const [stageOptions, setStageOptions] = useState<StageOption[]>([]);
  const [filter, setFilter] = useState<"all" | "pending" | "active" | "new" | "advanced">("all");
  const [search, setSearch] = useState("");
  const isAdmin = isAdminEmail(session?.email);
  const analytics = useMemo(() => getAdminAnalytics(rows), [rows]);
  const filteredRows = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();
    const searchedRows = normalizedSearch
      ? rows.filter((row) => (
        row.user.name.toLowerCase().includes(normalizedSearch) ||
        row.user.email.toLowerCase().includes(normalizedSearch) ||
        row.user.id.toLowerCase().includes(normalizedSearch)
      ))
      : rows;

    if (filter === "pending") {
      return searchedRows.filter((row) => row.player.surpriseExam && !row.player.surpriseExam.completedAt);
    }

    if (filter === "active") {
      return searchedRows.filter((row) => row.player.progress.completedStages.length > 0);
    }

    if (filter === "new") {
      return searchedRows.filter((row) => row.player.progress.completedStages.length === 0);
    }

    if (filter === "advanced") {
      return [...searchedRows].sort((left, right) => right.player.level - left.player.level);
    }

    return searchedRows;
  }, [filter, rows, search]);

  const loadAudit = useCallback(async () => {
    if (!session) {
      return;
    }

    const response = await fetch(
      "/api/admin/audit",
      {
        cache: "no-store",
        headers: getAdminRequestHeaders(session),
      }
    );
    const data = await response.json() as { auditLog?: AdminAuditRecord[]; error?: string };

    if (!response.ok) {
      throw new Error(data.error ?? "Nao foi possivel carregar historico admin.");
    }

    setAuditLog(data.auditLog ?? []);
  }, [session]);

  const loadRows = useCallback(async () => {
    if (!session) {
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      const response = await fetch(
        "/api/admin/progress",
        {
          cache: "no-store",
          headers: getAdminRequestHeaders(session),
        }
      );
      const storageResponse = await fetch(
        "/api/admin/storage-status",
        {
          cache: "no-store",
          headers: getAdminRequestHeaders(session),
        }
      );
      const settingsResponse = await fetch(
        "/api/admin/app-settings",
        {
          cache: "no-store",
          headers: getAdminRequestHeaders(session),
        }
      );
      const auditResponse = await fetch(
        "/api/admin/audit",
        {
          cache: "no-store",
          headers: getAdminRequestHeaders(session),
        }
      );
      const data = await response.json() as { rows?: AdminRow[]; stageOptions?: StageOption[]; error?: string };
      const storageData = await storageResponse.json() as { mode?: "local" | "supabase" };
      const settingsData = await settingsResponse.json() as AppSettingsSummary & { error?: string };
      const auditData = await auditResponse.json() as { auditLog?: AdminAuditRecord[]; error?: string };

      if (!response.ok) {
        throw new Error(data.error ?? "Nao foi possivel carregar usuarios.");
      }

      if (!auditResponse.ok) {
        throw new Error(auditData.error ?? "Nao foi possivel carregar historico admin.");
      }

      setRows(data.rows ?? []);
      setStageOptions(data.stageOptions ?? []);
      setStorageMode(storageData.mode ?? "");
      setAppSettings(settingsResponse.ok ? settingsData : null);
      setAuditLog(auditData.auditLog ?? []);
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
      "/api/admin/progress",
      {
        method: "PATCH",
        headers: {
          ...getAdminRequestHeaders(session),
          "content-type": "application/json",
        },
        body: JSON.stringify({
          userId,
          ...patch,
        }),
      }
    );
    const data = await response.json() as {
      player?: Player;
      user?: LocalUser;
      attempts?: AttemptSummary[];
      snapshots?: ProgressSnapshotSummary[];
      error?: string;
    };

    if (!response.ok || !data.player) {
      setMessage(data.error ?? "Nao foi possivel atualizar progresso.");
      return;
    }

    setRows((currentRows) => currentRows.map((row) => (
      row.user.id === userId
        ? {
          ...row,
          user: data.user ?? row.user,
          player: data.player as Player,
          attempts: data.attempts ?? row.attempts,
          snapshots: data.snapshots ?? row.snapshots,
        }
        : row
    )));
    setMessage(getAdminSuccessMessage(patch, data.user?.name));
    void loadAudit().catch((error) => {
      setMessage(error instanceof Error ? error.message : "Progresso atualizado, mas o historico nao recarregou.");
    });
  }

  async function resetAllProgress() {
    if (!session) {
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      const response = await fetch(
        "/api/admin/progress",
        {
          method: "PATCH",
          headers: {
            ...getAdminRequestHeaders(session),
            "content-type": "application/json",
          },
          body: JSON.stringify({
            action: "resetAllProgress",
          }),
        }
      );
      const data = await response.json() as {
        rows?: AdminRow[];
        stageOptions?: StageOption[];
        error?: string;
      };

      if (!response.ok || !data.rows) {
        throw new Error(data.error ?? "Nao foi possivel resetar todos os usuarios.");
      }

      setRows(data.rows);
      setStageOptions(data.stageOptions ?? stageOptions);
      setMessage("Campanha resetada para todos os usuarios.");
      await loadAudit();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Erro ao resetar todos.");
    } finally {
      setLoading(false);
    }
  }

  async function toggleMaintenanceMode() {
    if (!session || !appSettings) {
      return;
    }

    const nextMaintenanceMode = !appSettings.maintenanceMode;

    try {
      const response = await fetch(
        "/api/admin/app-settings",
        {
          method: "PATCH",
          headers: {
            ...getAdminRequestHeaders(session),
            "content-type": "application/json",
          },
          body: JSON.stringify({
            maintenanceMode: nextMaintenanceMode,
          }),
        }
      );
      const data = await response.json() as AppSettingsSummary & { error?: string };

      if (!response.ok) {
        throw new Error(data.error ?? "Nao foi possivel alterar manutencao.");
      }

      setAppSettings(data);
      setMessage(data.maintenanceMode
        ? "Modo manutencao ativado para alunos."
        : "Modo manutencao desativado.");
      await loadAudit();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Erro ao alterar manutencao.");
    }
  }

  if (!session) {
    return (
      <main className="cq-page">
        <section className="cq-shell">
          <div className="cq-panel max-w-2xl p-6">
            <p className="cq-kicker">Admin</p>
            <h1 className="cq-title mt-3 text-4xl">Entre para acessar</h1>
            <p className="mt-4 text-[#93a4bd]">
              O painel admin so abre depois do login com a conta autorizada.
            </p>
            <Link href="/login" className="cq-button mt-6">
              Entrar com a conta admin
            </Link>
          </div>
        </section>
      </main>
    );
  }

  if (!isAdmin) {
    return (
      <main className="cq-page">
        <section className="cq-shell">
          <div className="cq-panel max-w-2xl p-6">
            <p className="cq-kicker">Admin</p>
            <h1 className="cq-title mt-3 text-4xl">Conta sem permissao</h1>
            <p className="mt-4 text-[#93a4bd]">
              Voce esta logado como {session.email}. Para abrir este painel,
              entre com miguelnandisouza@gmail.com.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link href="/login" className="cq-button">
                Trocar conta
              </Link>
              <Link href="/dashboard" className="cq-button cq-button-secondary">
                Voltar ao mapa
              </Link>
            </div>
          </div>
        </section>
      </main>
    );
  }

  if (!session.sessionToken) {
    return (
      <main className="cq-page">
        <section className="cq-shell">
          <div className="cq-panel max-w-2xl p-6">
            <p className="cq-kicker">Admin</p>
            <h1 className="cq-title mt-3 text-4xl">Sessao antiga</h1>
            <p className="mt-4 text-[#93a4bd]">
              Entre de novo com a conta admin para ativar a protecao nova do painel.
            </p>
            <Link href="/login" className="cq-button mt-6">
              Entrar de novo
            </Link>
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

          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => {
                const nextMaintenanceMode = !appSettings?.maintenanceMode;

                setConfirmRequest({
                  title: nextMaintenanceMode ? "Ativar manutencao" : "Desativar manutencao",
                  message: nextMaintenanceMode
                    ? "Alunos vao ver a tela de manutencao ate voce desativar."
                    : "O site volta a ficar liberado para alunos.",
                  confirmLabel: nextMaintenanceMode ? "Ativar" : "Desativar",
                  danger: nextMaintenanceMode,
                  onConfirm: () => {
                    void toggleMaintenanceMode();
                  },
                });
              }}
              disabled={!appSettings || appSettings.envForced}
              className={[
                "cq-button cq-button-secondary",
                appSettings?.maintenanceMode
                  ? "border-yellow-300/50 text-yellow-100"
                  : "",
              ].join(" ")}
              title={appSettings?.envForced ? "CODEQUEST_MAINTENANCE=1 esta forcando manutencao no ambiente." : undefined}
            >
              {appSettings?.maintenanceMode ? "Desativar manutencao" : "Ativar manutencao"}
            </button>
            <button type="button" onClick={loadRows} className="cq-button cq-button-secondary">
              Atualizar
            </button>
            <button
              type="button"
              onClick={() => setConfirmRequest({
                title: "Resetar campanha de todos",
                message: "Todos os alunos voltam para o inicio da campanha, mantendo itens comprados e liberados.",
                confirmLabel: "Resetar todos",
                danger: true,
                onConfirm: () => {
                  void resetAllProgress();
                },
              })}
              className="cq-button cq-button-secondary border-red-300/50 text-red-100"
            >
              Resetar campanha de todos
            </button>
          </div>
        </div>

        {storageMode && (
          <div className="cq-panel mt-6 p-4 text-sm text-[#dbe8ff]">
            Armazenamento atual: {storageMode === "supabase" ? "Supabase" : "Local .data"}
          </div>
        )}

        {appSettings && (
          <div className="cq-panel mt-6 p-4 text-sm text-[#dbe8ff]">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <span>
                Manutencao: {appSettings.maintenanceMode ? "ativa" : "desativada"}
                {appSettings.envForced ? " (forcada por env)" : ""}
              </span>
              {appSettings.updatedAt && (
                <span className="text-[#93a4bd]">
                  Atualizado por {appSettings.updatedBy ?? "admin"} em {formatDate(appSettings.updatedAt)}
                </span>
              )}
            </div>
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

        <AdminAuditLog records={auditLog} />

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

        <div className="cq-panel mt-6 grid gap-3 p-4 md:grid-cols-[1fr_auto] md:items-center">
          <label className="grid gap-2 text-xs font-bold uppercase tracking-[0.12em] text-[#93a4bd]">
            Buscar aluno
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              className="min-h-11 border border-[#26384f] bg-[#0b1424] px-3 font-mono text-sm text-[#f3f7ff] outline-none focus:border-[#6f91d8]"
              placeholder="Nome, email ou ID"
            />
          </label>
          <span className="cq-badge">
            {filteredRows.length} de {rows.length}
          </span>
        </div>

        <div className="mt-8 grid gap-4">
          {loading ? (
            <div className="cq-panel p-6 text-[#93a4bd]">Carregando usuarios...</div>
          ) : filteredRows.length === 0 ? (
            <div className="cq-panel p-6 text-[#93a4bd]">Nenhum usuario encontrado.</div>
          ) : filteredRows.map((row) => (
            <AdminUserCard
              key={[
                row.user.id,
                row.user.name,
                row.player.coins,
                row.player.level,
                row.player.progress.stageId,
                row.snapshots.length,
                row.attempts.length,
              ].join("-")}
              row={row}
              onUpdate={updateProgress}
              stageOptions={stageOptions}
            />
          ))}
        </div>
        <ConfirmDialog
          request={confirmRequest}
          onClose={() => setConfirmRequest(null)}
        />
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

function ConfirmDialog({
  request,
  onClose,
}: {
  request: ConfirmRequest | null;
  onClose: () => void;
}) {
  if (!request) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[95] grid place-items-center bg-black/70 px-4 py-8">
      <section className="cq-panel w-full max-w-md border-[#6f91d8]/55 p-5 shadow-[0_0_40px_rgba(47,102,232,0.2)]">
        <p className="cq-kicker">Confirmacao</p>
        <h2 className="cq-title mt-3 text-2xl">{request.title}</h2>
        <p className="mt-3 whitespace-pre-line leading-6 text-[#c8d3e3]">{request.message}</p>
        <div className="mt-6 flex flex-wrap justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="cq-button cq-button-secondary"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={() => {
              request.onConfirm();
              onClose();
            }}
            className={[
              "cq-button",
              request.danger ? "border-red-300/50 bg-red-500/20 text-red-100" : "",
            ].join(" ")}
          >
            {request.confirmLabel ?? "Confirmar"}
          </button>
        </div>
      </section>
    </div>
  );
}

function AdminAuditLog({ records }: { records: AdminAuditRecord[] }) {
  const visibleRecords = records.slice(0, 8);

  return (
    <section className="cq-panel mt-8 p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="cq-kicker">Historico admin</p>
          <h2 className="cq-title mt-2 text-2xl">Ultimas acoes</h2>
        </div>
        <span className="cq-badge">{records.length} registros</span>
      </div>

      <div className="mt-5 grid gap-3">
        {visibleRecords.length === 0 ? (
          <p className="text-sm text-[#93a4bd]">
            Nenhuma acao administrativa registrada ainda.
          </p>
        ) : visibleRecords.map((record) => (
          <article key={record.id} className="rounded border border-[#26384f] bg-[#07101d] p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="font-mono text-sm font-black text-[#f3f7ff]">
                  {record.label}
                </p>
                <p className="mt-1 text-xs text-[#93a4bd]">
                  {record.targetName || record.targetEmail
                    ? `${record.targetName ?? "Aluno"} ${record.targetEmail ? `(${record.targetEmail})` : ""}`
                    : "Acao global"}
                </p>
              </div>
              <span className="cq-badge">{formatDate(record.createdAt)}</span>
            </div>
            <div className="mt-3 flex flex-wrap gap-2 text-xs text-[#93a4bd]">
              <span>Por {record.actorEmail}</span>
              <span>Tipo: {record.action}</span>
            </div>
            {record.details && (
              <p className="mt-3 text-sm leading-6 text-[#c8d3e3]">
                {record.details}
              </p>
            )}
          </article>
        ))}
      </div>
    </section>
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
  stageOptions,
}: {
  row: AdminRow;
  onUpdate: (userId: string, patch: AdminProgressPatch) => void;
  stageOptions: StageOption[];
}) {
  const [expanded, setExpanded] = useState(false);
  const [activeTab, setActiveTab] = useState<AdminUserTab>("progress");
  const [name, setName] = useState(row.user.name);
  const [coins, setCoins] = useState(String(row.player.coins));
  const [level, setLevel] = useState(String(row.player.level));
  const [newPassword, setNewPassword] = useState("");
  const [stageId, setStageId] = useState(row.player.progress.stageId);
  const [rewardId, setRewardId] = useState(rewardItems[0]?.id ?? "");
  const [snapshotId, setSnapshotId] = useState(row.snapshots[0]?.id ?? "");
  const [examTitle, setExamTitle] = useState("Prova surpresa");
  const [examQuestion, setExamQuestion] = useState("Qual comando lista todos os clientes?");
  const [examOptions, setExamOptions] = useState("SELECT * FROM clientes\nSELECT clientes\nGET clientes");
  const [examAnswer, setExamAnswer] = useState("SELECT * FROM clientes");
  const [examXp, setExamXp] = useState("80");
  const [examCoins, setExamCoins] = useState("40");
  const [localMessage, setLocalMessage] = useState("");
  const [confirmRequest, setConfirmRequest] = useState<ConfirmRequest | null>(null);

  const completedCount = row.player.progress.completedStages.length;
  const selectedReward = rewardItems.find((reward) => reward.id === rewardId);
  const currentStage = stageOptions.find((stage) => stage.id === row.player.progress.stageId);
  const selectedSnapshot = row.snapshots.find((snapshot) => snapshot.id === (snapshotId || row.snapshots[0]?.id));
  const ownedRewards = rewardItems.filter((reward) => row.player.inventory.ownedRewardIds.includes(reward.id));
  const equippedRewards = getEquippedRewards(row.player);
  const latestGift = row.player.giftNotifications?.[0];

  function confirmUpdate(
    title: string,
    message: string,
    detailOrPatch: string | AdminProgressPatch,
    patchOrOptions?: AdminProgressPatch | {
      confirmLabel?: string;
      danger?: boolean;
      afterConfirm?: () => void;
    },
    maybeOptions?: {
      confirmLabel?: string;
      danger?: boolean;
      afterConfirm?: () => void;
    }
  ) {
    const hasDetail = typeof detailOrPatch === "string";
    const detail = hasDetail ? detailOrPatch : "";
    const patch = hasDetail
      ? patchOrOptions as AdminProgressPatch
      : detailOrPatch;
    const options = hasDetail
      ? maybeOptions
      : patchOrOptions as typeof maybeOptions | undefined;

    setLocalMessage("");
    setConfirmRequest({
      title,
      message: detail ? `${message}\n\n${detail}` : message,
      confirmLabel: options?.confirmLabel,
      danger: options?.danger,
      onConfirm: () => {
        onUpdate(row.user.id, patch);
        options?.afterConfirm?.();
      },
    });
  }

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
            <span className="md:col-span-4">
              Atual: {currentStage ? `${currentStage.campaignTitle} / ${currentStage.title}` : row.player.progress.stageId}
            </span>
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
        <div className="mt-6 border-t border-[#26384f] pt-5">
          <div className="mb-5 flex flex-wrap gap-2">
            {[
              ["progress", "Progresso"],
              ["rewards", "Recompensas"],
              ["password", "Senha"],
              ["exam", "Prova"],
              ["history", "Historico"],
            ].map(([value, label]) => (
              <button
                key={value}
                type="button"
                onClick={() => setActiveTab(value as AdminUserTab)}
                className={`cq-button ${activeTab === value ? "" : "cq-button-secondary"}`}
              >
                {label}
              </button>
            ))}
          </div>

          {localMessage && (
            <div className="cq-panel mb-5 border-yellow-300/40 p-3 text-sm text-yellow-100">
              {localMessage}
            </div>
          )}

          {activeTab === "progress" && (
          <div className="grid gap-3 sm:grid-cols-2 lg:ml-auto lg:max-w-[34rem]">
            <label className="grid gap-2 text-xs font-bold uppercase tracking-[0.12em] text-[#93a4bd] sm:col-span-2">
            Nome
            <input
              value={name}
              onChange={(event) => setName(event.target.value)}
              className="min-h-11 border border-[#26384f] bg-[#0b1424] px-3 font-mono text-sm text-[#f3f7ff] outline-none focus:border-[#6f91d8]"
            />
          </label>

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
            onClick={() => confirmUpdate(
              "Salvar dados do aluno",
              `Salvar nome, nivel e moedas de ${row.user.name}?`,
              { name, coins: Number(coins), level: Number(level) },
              { confirmLabel: "Salvar" }
            )}
            className="cq-button sm:col-span-2"
          >
            Salvar nome/nivel/moedas
          </button>
          </div>
          )}

          {activeTab === "password" && (
          <div className="grid gap-3 sm:grid-cols-2 lg:ml-auto lg:max-w-[34rem]">
          <div className="cq-panel p-4 sm:col-span-2">
            <p className="cq-kicker">Senha</p>
            <p className="mt-2 text-sm text-[#93a4bd]">
              Redefine a senha do usuario sem mostrar a senha antiga.
            </p>
            <div className="mt-4 grid gap-3 sm:grid-cols-[1fr_auto]">
              <input
                type="password"
                value={newPassword}
                onChange={(event) => setNewPassword(event.target.value)}
                className="min-h-11 border border-[#26384f] bg-[#0b1424] px-3 font-mono text-sm text-[#f3f7ff] outline-none focus:border-[#6f91d8]"
                placeholder="Nova senha com 6+ caracteres"
              />
              <button
                type="button"
                onClick={() => {
                  if (newPassword.trim().length < 6) {
                    setLocalMessage("A senha precisa ter pelo menos 6 caracteres.");
                    return;
                  }

                  confirmUpdate(
                    "Redefinir senha",
                    `Redefinir senha de ${row.user.name}?`,
                    "A senha antiga sera substituida e o aluno devera entrar com a nova senha.",
                    { action: "resetPassword", password: newPassword },
                    {
                      confirmLabel: "Redefinir",
                      danger: true,
                      afterConfirm: () => setNewPassword(""),
                    }
                  );
                }}
                className="cq-button cq-button-secondary"
              >
                Redefinir
              </button>
            </div>
          </div>
          </div>
          )}

          {activeTab === "progress" && (
          <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:ml-auto lg:max-w-[34rem]">
          <label className="grid gap-2 text-xs font-bold uppercase tracking-[0.12em] text-[#93a4bd] sm:col-span-2">
            Fase atual
            <select
              value={stageId}
              onChange={(event) => setStageId(event.target.value)}
              className="min-h-11 border border-[#26384f] bg-[#0b1424] px-3 font-mono text-sm text-[#f3f7ff] outline-none focus:border-[#6f91d8]"
            >
              {stageOptions.map((stage) => (
                <option key={stage.id} value={stage.id}>
                  {stage.campaignTitle} / {stage.chapterTitle} / {stage.title}
                </option>
              ))}
            </select>
          </label>

          <button
            type="button"
            onClick={() => confirmUpdate(
              "Trocar fase atual",
              `Trocar fase atual de ${row.user.name}?`,
              "O aluno sera movido para a fase selecionada.",
              { stageId },
              { confirmLabel: "Trocar fase" }
            )}
            className="cq-button cq-button-secondary sm:col-span-2"
          >
            Trocar fase atual
          </button>

          <button
            type="button"
            onClick={() => confirmUpdate(
              "Adicionar moedas",
              `Adicionar 500 moedas para ${row.user.name}?`,
              "O saldo do aluno aumenta imediatamente.",
              { coins: row.player.coins + 500 },
              { confirmLabel: "+500 moedas" }
            )}
            className="cq-button cq-button-secondary"
          >
            +500 moedas
          </button>

          <button
            type="button"
            onClick={() => confirmUpdate(
              "Adicionar nivel",
              `Adicionar 1 nivel para ${row.user.name}?`,
              "O nivel do aluno aumenta imediatamente.",
              { level: row.player.level + 1 },
              { confirmLabel: "+1 nivel" }
            )}
            className="cq-button cq-button-secondary"
          >
            +1 nivel
          </button>

          <button
            type="button"
            onClick={() => confirmUpdate(
              row.player.inventory.rewardsLocked ? "Desbloquear loja" : "Bloquear loja",
              row.player.inventory.rewardsLocked
                ? `Desbloquear loja de ${row.user.name}?`
                : `Bloquear loja de ${row.user.name}?`,
              row.player.inventory.rewardsLocked
                ? "O aluno volta a comprar e equipar itens."
                : "O aluno podera ver a loja, mas nao comprar ou trocar equipamentos.",
              { action: "toggleRewardsLock" },
              {
                confirmLabel: row.player.inventory.rewardsLocked ? "Desbloquear" : "Bloquear",
                danger: !row.player.inventory.rewardsLocked,
              }
            )}
            className={[
              "cq-button cq-button-secondary sm:col-span-2",
              row.player.inventory.rewardsLocked
                ? "border-yellow-300/50 text-yellow-100"
                : "border-red-300/50 text-red-100",
            ].join(" ")}
          >
            {row.player.inventory.rewardsLocked
              ? "Desbloquear loja do usuario"
              : "Bloquear loja do usuario"}
          </button>
          </div>
          )}

          {activeTab === "rewards" && (
          <div className="grid gap-3 sm:grid-cols-2 lg:ml-auto lg:max-w-[34rem]">
          <div className="cq-panel p-4 sm:col-span-2">
            <p className="cq-kicker">Itens do usuario</p>
            <div className="mt-4 grid gap-3 text-sm text-[#c8d3e3]">
              <div>
                <p className="font-mono text-xs font-black uppercase tracking-[0.12em] text-[#93a4bd]">
                  Equipados
                </p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {equippedRewards.length === 0 ? (
                    <span className="text-[#6f86a8]">Nada equipado.</span>
                  ) : equippedRewards.map((reward) => (
                    <span key={reward.id} className="cq-badge">
                      {getRewardKindLabel(reward.kind)}: {reward.name}
                    </span>
                  ))}
                </div>
              </div>
              <div>
                <p className="font-mono text-xs font-black uppercase tracking-[0.12em] text-[#93a4bd]">
                  Comprados/liberados
                </p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {ownedRewards.length === 0 ? (
                    <span className="text-[#6f86a8]">Nenhum item liberado.</span>
                  ) : ownedRewards.map((reward) => (
                    <span key={reward.id} className="cq-badge border-[#3d5f92]">
                      {reward.name}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

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

          {selectedReward && (
            <div className="rounded border border-[#26384f] bg-[#07101d] p-3 text-sm text-[#c8d3e3] sm:col-span-2">
              <p className="font-mono text-xs font-black uppercase tracking-[0.12em] text-[#93a4bd]">
                Item selecionado
              </p>
              <p className="mt-2">
                {selectedReward.name} - {getRewardKindLabel(selectedReward.kind)}
              </p>
              <p className="mt-1 text-[#93a4bd]">
                Requer nivel {selectedReward.levelRequired}, custa {selectedReward.price} moedas.
              </p>
            </div>
          )}

          {latestGift && (
            <div className="rounded border border-yellow-300/35 bg-yellow-500/10 p-3 text-sm text-yellow-100 sm:col-span-2">
              Ultimo presente: {latestGift.rewardName} em {formatDate(latestGift.createdAt)}.
            </div>
          )}

          <button
            type="button"
            onClick={() => confirmUpdate(
              "Liberar recompensa",
              `Liberar ${selectedReward?.name ?? "item"} para ${row.user.name}?`,
              "O item entra na conta do aluno sem equipar automaticamente.",
              { action: "grantReward", rewardId },
              { confirmLabel: "Liberar" }
            )}
            className="cq-button cq-button-secondary"
          >
            Liberar {selectedReward ? getRewardKindLabel(selectedReward.kind).toLowerCase() : "item"}
          </button>

          <button
            type="button"
            onClick={() => confirmUpdate(
              "Presentear e equipar",
              `Presentear ${row.user.name} com ${selectedReward?.name ?? "item"} e equipar agora?`,
              "O aluno recebe uma notificacao de presente e o item ja fica equipado.",
              { action: "giftReward", rewardId },
              { confirmLabel: "Presentear" }
            )}
            className="cq-button"
          >
            Presentear e equipar
          </button>

          <button
            type="button"
            onClick={() => confirmUpdate(
              "Equipar recompensa",
              `Equipar ${selectedReward?.name ?? "item"} em ${row.user.name}?`,
              "O item selecionado vira o equipamento ativo desse tipo.",
              { action: "equipReward", rewardId },
              { confirmLabel: "Equipar" }
            )}
            className="cq-button cq-button-secondary"
          >
            Equipar
          </button>
          </div>
          )}

          {activeTab === "exam" && (
          <div className="grid gap-3 sm:grid-cols-2 lg:ml-auto lg:max-w-[34rem]">
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
                onClick={() => confirmUpdate(
                  "Enviar prova surpresa",
                  `Enviar prova surpresa para ${row.user.name}?`,
                  "A prova aparece para o aluno ate ele responder.",
                  {
                    action: "assignSurpriseExam",
                    surpriseExam: {
                      title: examTitle,
                      question: examQuestion,
                      options: examOptions.split(/\r?\n/),
                      correctAnswer: examAnswer,
                      rewardXp: Number(examXp),
                      rewardCoins: Number(examCoins),
                    },
                  },
                  { confirmLabel: "Enviar prova" }
                )}
                className="cq-button"
              >
                Enviar prova para usuario
              </button>
              <button
                type="button"
                onClick={() => confirmUpdate(
                  "Limpar prova pendente",
                  `Limpar prova pendente de ${row.user.name}?`,
                  "A prova atual sera removida da conta do aluno.",
                  { action: "clearSurpriseExam" },
                  { confirmLabel: "Limpar", danger: true }
                )}
                className="cq-button cq-button-secondary"
              >
                Limpar prova pendente
              </button>
            </div>
          </div>
          </div>
          )}

          {activeTab === "history" && (
          <div className="grid gap-3 sm:grid-cols-2 lg:ml-auto lg:max-w-[34rem]">
          <div className="cq-panel p-4 sm:col-span-2">
            <p className="cq-kicker">Historico recente</p>
            <div className="mt-4 space-y-3">
              {row.attempts.length === 0 ? (
                <p className="text-sm text-[#93a4bd]">Nenhuma tentativa registrada ainda.</p>
              ) : row.attempts.map((attempt) => (
                <div key={attempt.id ?? `${attempt.stageId}-${attempt.createdAt}`} className="rounded border border-[#26384f] bg-[#07101d] p-3 text-sm">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={`cq-badge ${attempt.success ? "border-green-300/40 text-green-100" : "border-red-300/40 text-red-100"}`}>
                      {attempt.success ? "Acertou" : "Errou"}
                    </span>
                    <span className="text-[#dbe8ff]">{attempt.stepTitle || attempt.stageId}</span>
                  </div>
                  <p className="mt-2 break-words font-mono text-xs text-[#93a4bd]">
                    {attempt.answer}
                  </p>
                  <p className="mt-2 text-xs text-[#6f86a8]">
                    {formatDate(attempt.createdAt)}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="cq-panel p-4 sm:col-span-2">
            <p className="cq-kicker">Backups de progresso</p>
            {row.snapshots.length === 0 ? (
              <p className="mt-3 text-sm text-[#93a4bd]">
                Nenhum backup ainda. Eles aparecem quando houver mudanca real de progresso.
              </p>
            ) : (
              <div className="mt-4 grid gap-3">
                <select
                  value={snapshotId || row.snapshots[0]?.id || ""}
                  onChange={(event) => setSnapshotId(event.target.value)}
                  className="min-h-11 border border-[#26384f] bg-[#0b1424] px-3 font-mono text-sm text-[#f3f7ff] outline-none focus:border-[#6f91d8]"
                >
                  {row.snapshots.map((snapshot) => (
                    <option key={snapshot.id} value={snapshot.id}>
                      {formatDate(snapshot.createdAt)} - Nv {snapshot.player.level} - {snapshot.player.coins} moedas
                    </option>
                  ))}
                </select>
                {selectedSnapshot && (
                  <div className="rounded border border-[#26384f] bg-[#07101d] p-3 text-sm text-[#c8d3e3]">
                    <p className="font-mono text-xs font-black uppercase tracking-[0.12em] text-[#93a4bd]">
                      Previa do backup
                    </p>
                    <div className="mt-3 grid gap-2 sm:grid-cols-2">
                      <span>Nivel {selectedSnapshot.player.level}</span>
                      <span>{selectedSnapshot.player.coins} moedas</span>
                      <span>{selectedSnapshot.player.xp} XP</span>
                      <span>{selectedSnapshot.player.progress.completedStages.length} fases concluidas</span>
                      <span className="sm:col-span-2">
                        Fase: {selectedSnapshot.player.progress.stageId || "inicio"}
                      </span>
                    </div>
                  </div>
                )}
                <button
                  type="button"
                  onClick={() => {
                    const selectedSnapshotId = snapshotId || row.snapshots[0]?.id;

                    if (selectedSnapshotId) {
                      confirmUpdate(
                        "Restaurar backup",
                        `Restaurar backup de ${row.user.name}?`,
                        "O progresso atual sera substituido pelo backup selecionado.",
                        {
                        action: "restoreSnapshot",
                        snapshotId: selectedSnapshotId,
                        },
                        { confirmLabel: "Restaurar", danger: true }
                      );
                    }
                  }}
                  className="cq-button cq-button-secondary border-yellow-300/50 text-yellow-100"
                >
                  Restaurar backup selecionado
                </button>
              </div>
            )}
          </div>
          </div>
          )}

          {activeTab === "progress" && (
          <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:ml-auto lg:max-w-[34rem]">
          <div className="cq-panel p-4 sm:col-span-2">
            <p className="cq-kicker">Reset</p>
            <p className="mt-2 text-sm leading-6 text-[#93a4bd]">
              Use o reset de campanha quando mudar a quantidade de missoes. Ele volta fase, XP,
              nivel, moedas e conquistas para o inicio, mas mantem fotos, pets, temas e itens liberados.
            </p>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <button
                type="button"
                onClick={() => confirmUpdate(
                  "Resetar campanha",
                  `Resetar campanha de ${row.user.name} mantendo os itens comprados?`,
                  "Fase, XP, nivel, moedas e conquistas voltam ao inicio. Itens liberados continuam na conta.",
                  { action: "resetProgress" },
                  { confirmLabel: "Resetar campanha", danger: true }
                )}
                className="cq-button cq-button-secondary border-yellow-300/50 text-yellow-100"
              >
                Resetar campanha
              </button>

              <button
                type="button"
                onClick={() => confirmUpdate(
                  "Reset total",
                  `Reset TOTAL de ${row.user.name}?`,
                  "Isso apaga progresso, moedas, nivel, itens, equipamentos e volta a conta para o estado inicial.",
                  { action: "reset" },
                  { confirmLabel: "Reset total", danger: true }
                )}
                className="cq-button cq-button-secondary border-red-300/50 text-red-100"
              >
                Reset total
              </button>
            </div>
          </div>
          </div>
          )}
        </div>
      )}
      <ConfirmDialog
        request={confirmRequest}
        onClose={() => setConfirmRequest(null)}
      />
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

function getEquippedRewards(player: Player) {
  const equippedIds = [
    player.inventory.equippedAvatarId ?? player.avatar,
    player.inventory.equippedPetId,
    player.inventory.equippedThemeId,
    player.inventory.equippedFrameId,
    player.inventory.equippedEffectId,
  ].filter(Boolean);

  return rewardItems.filter((reward) => equippedIds.includes(reward.id));
}

function formatDate(value?: string) {
  if (!value) {
    return "-";
  }

  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
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

function getAdminRequestHeaders(session: LocalSession): Record<string, string> {
  if (!session.sessionToken) {
    return {};
  }

  return { "x-codequest-session-token": session.sessionToken };
}

function getAdminSuccessMessage(patch: AdminProgressPatch, userName?: string) {
  const target = userName ? `${userName} ` : "";

  if (patch.action === "giftReward" && patch.rewardId) {
    const reward = rewardItems.find((item) => item.id === patch.rewardId);

    return reward
      ? `${target}recebeu ${reward.name} e ja equipou.`
      : "Presente entregue e equipado.";
  }

  if (patch.action === "grantReward" && patch.rewardId) {
    const reward = rewardItems.find((item) => item.id === patch.rewardId);

    return reward
      ? `${target}recebeu ${reward.name}.`
      : "Recompensa liberada.";
  }

  if (patch.action === "equipReward" && patch.rewardId) {
    const reward = rewardItems.find((item) => item.id === patch.rewardId);

    return reward
      ? `${target}equipou ${reward.name}.`
      : "Recompensa equipada.";
  }

  if (patch.action === "resetPassword") {
    return `Senha de ${userName ?? "usuario"} redefinida.`;
  }

  return "Progresso atualizado.";
}
