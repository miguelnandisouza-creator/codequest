import { rewardItems } from "@/data/rewards";
import { campaigns } from "@/data/campaigns";
import { readStoredUsers, resetStoredUserPassword, updateStoredUserName } from "@/infrastructure/auth/userStore";
import { getSessionRequestPayload, isAdminSessionRequest } from "@/infrastructure/auth/sessionToken";
import {
  readPasswordResetRequests,
  resolvePasswordResetRequest,
} from "@/infrastructure/auth/passwordResetRequests";
import { recordAdminAction } from "@/infrastructure/admin/adminAuditRepository";
import { readRecentAttempts } from "@/infrastructure/supabase/attemptRepository";
import {
  readProgressSnapshots,
  readPlayerProgress,
  restoreProgressSnapshot,
  writePlayerProgress,
} from "@/infrastructure/supabase/playerProgressRepository";
import { initialPlayer } from "@/domain/game/playerProgress";

type AdminProgressAction =
  | "update"
  | "reset"
  | "resetProgress"
  | "resetAllProgress"
  | "grantReward"
  | "equipReward"
  | "giftReward"
  | "toggleRewardsLock"
  | "assignSurpriseExam"
  | "clearSurpriseExam"
  | "restoreSnapshot"
  | "resetPassword"
  | "approvePasswordResetRequest"
  | "rejectPasswordResetRequest";

export async function GET(request: Request) {
  if (!isAdminSessionRequest(request)) {
    return Response.json({ error: "Acesso negado." }, { status: 403 });
  }

  const users = await readStoredUsers();
  const rows = await Promise.all(users.map(async (user) => ({
    user,
    player: await readPlayerProgress(user.id),
    attempts: await readRecentAttempts(user.id, 8),
    snapshots: await readProgressSnapshots(user.id, 8),
  })));

  return Response.json({
    rows,
    stageOptions: getStageOptions(),
    passwordResetRequests: await readPasswordResetRequests(),
  });
}

export async function PATCH(request: Request) {
  if (!isAdminSessionRequest(request)) {
    return Response.json({ error: "Acesso negado." }, { status: 403 });
  }

  const body = await request.json().catch(() => null) as {
    userId?: string;
    coins?: number;
    level?: number;
    name?: string;
    stageId?: string;
    action?: AdminProgressAction;
    password?: string;
    requestId?: string;
    rewardId?: string;
    snapshotId?: string;
    surpriseExam?: {
      title?: string;
      question?: string;
      options?: string[];
      correctAnswer?: string;
      rewardXp?: number;
      rewardCoins?: number;
    };
  } | null;
  const actorEmail = getSessionRequestPayload(request)?.email ?? "admin";

  if (body?.action === "resetAllProgress") {
    const users = await readStoredUsers();

    await Promise.all(users.map(async (user) => {
      const currentPlayer = await readPlayerProgress(user.id);

      await writePlayerProgress(
        user.id,
        {
          ...currentPlayer,
          xp: initialPlayer.xp,
          level: initialPlayer.level,
          coins: initialPlayer.coins,
          streak: initialPlayer.streak,
          achievements: [],
          progress: {
            ...initialPlayer.progress,
            completedStages: [],
          },
          updatedAt: new Date().toISOString(),
        },
        { forceOverwrite: true }
      );
    }));
    await recordAdminAction({
      action: "resetAllProgress",
      label: "Resetou campanha de todos",
      actorEmail,
      details: `${users.length} usuario(s) voltaram ao inicio mantendo itens liberados.`,
    });

    const rows = await Promise.all(users.map(async (user) => ({
      user,
      player: await readPlayerProgress(user.id),
      attempts: await readRecentAttempts(user.id, 8),
      snapshots: await readProgressSnapshots(user.id, 8),
    })));

    return Response.json({
      rows,
      stageOptions: getStageOptions(),
      passwordResetRequests: await readPasswordResetRequests(),
    });
  }

  if (!body?.userId) {
    return Response.json({ error: "Usuario nao informado." }, { status: 400 });
  }

  const player = await readPlayerProgress(body.userId);
  const action = body.action ?? "update";
  const usersBeforeChange = await readStoredUsers();
  const targetUser = usersBeforeChange.find((storedUser) => storedUser.id === body.userId);

  if (body.name !== undefined) {
    await updateStoredUserName(body.userId, body.name);
  }

  if (action === "resetPassword") {
    if (!body.password) {
      return Response.json({ error: "Senha nao informada." }, { status: 400 });
    }

    await resetStoredUserPassword(body.userId, body.password);
    const user = (await readStoredUsers()).find((storedUser) => storedUser.id === body.userId);
    await recordAdminAction({
      action,
      label: "Redefiniu senha",
      actorEmail,
      targetUserId: body.userId,
      targetName: user?.name ?? targetUser?.name,
      targetEmail: user?.email ?? targetUser?.email,
    });

    return Response.json({
      player,
      user,
      attempts: await readRecentAttempts(body.userId, 8),
      snapshots: await readProgressSnapshots(body.userId, 8),
      passwordResetRequests: await readPasswordResetRequests(),
    });
  }

  if (action === "approvePasswordResetRequest" || action === "rejectPasswordResetRequest") {
    if (!body.requestId) {
      return Response.json({ error: "Solicitacao de senha nao informada." }, { status: 400 });
    }

    const requestStatus = action === "approvePasswordResetRequest" ? "approved" : "rejected";
    const passwordRequest = await resolvePasswordResetRequest(body.requestId, requestStatus, actorEmail);

    if (passwordRequest.userId !== body.userId) {
      return Response.json({ error: "Solicitacao nao pertence a este usuario." }, { status: 400 });
    }

    if (requestStatus === "approved") {
      await resetStoredUserPassword(body.userId, passwordRequest.requestedPassword);
    }

    const user = (await readStoredUsers()).find((storedUser) => storedUser.id === body.userId);
    await recordAdminAction({
      action,
      label: requestStatus === "approved" ? "Aprovou troca de senha" : "Recusou troca de senha",
      actorEmail,
      targetUserId: body.userId,
      targetName: user?.name ?? targetUser?.name,
      targetEmail: user?.email ?? targetUser?.email,
      details: `Solicitacao ${body.requestId} ${requestStatus === "approved" ? "aprovada" : "recusada"}.`,
    });

    return Response.json({
      player,
      user,
      attempts: await readRecentAttempts(body.userId, 8),
      snapshots: await readProgressSnapshots(body.userId, 8),
      passwordResetRequests: await readPasswordResetRequests(),
    });
  }

  if (action === "restoreSnapshot") {
    if (!body.snapshotId) {
      return Response.json({ error: "Snapshot nao informado." }, { status: 400 });
    }

    const restoredPlayer = await restoreProgressSnapshot(body.userId, body.snapshotId);
    const user = (await readStoredUsers()).find((storedUser) => storedUser.id === body.userId);
    await recordAdminAction({
      action,
      label: "Restaurou backup",
      actorEmail,
      targetUserId: body.userId,
      targetName: user?.name ?? targetUser?.name,
      targetEmail: user?.email ?? targetUser?.email,
      details: `Backup ${body.snapshotId} restaurado.`,
    });

    return Response.json({
      player: restoredPlayer,
      user,
      attempts: await readRecentAttempts(body.userId, 8),
      snapshots: await readProgressSnapshots(body.userId, 8),
    });
  }

  const forceOverwrite = action === "reset" || action === "resetProgress";
  let nextPlayer = {
    ...player,
    coins: Number.isFinite(body.coins) ? Math.max(0, Math.floor(Number(body.coins))) : player.coins,
    level: Number.isFinite(body.level) ? Math.max(1, Math.floor(Number(body.level))) : player.level,
  };

  if (action === "reset") {
    nextPlayer = {
      ...initialPlayer,
      id: body.userId,
    };
  }

  if (action === "resetProgress") {
    nextPlayer = {
      ...player,
      xp: initialPlayer.xp,
      level: initialPlayer.level,
      coins: initialPlayer.coins,
      streak: initialPlayer.streak,
      achievements: [],
      progress: {
        ...initialPlayer.progress,
        completedStages: [],
      },
    };
  }

  if (body.stageId) {
    const stageOption = getStageOptions().find((stage) => stage.id === body.stageId);

    if (!stageOption) {
      return Response.json({ error: "Fase nao encontrada." }, { status: 404 });
    }

    nextPlayer = {
      ...nextPlayer,
      progress: {
        ...nextPlayer.progress,
        campaignId: stageOption.campaignId,
        chapterId: stageOption.chapterId,
        stageId: stageOption.id,
      },
    };
  }

  if ((action === "grantReward" || action === "equipReward" || action === "giftReward") && body.rewardId) {
    const reward = rewardItems.find((item) => item.id === body.rewardId);

    if (!reward) {
      return Response.json({ error: "Recompensa nao encontrada." }, { status: 404 });
    }

    const ownedRewardIds = nextPlayer.inventory.ownedRewardIds.includes(reward.id)
      ? nextPlayer.inventory.ownedRewardIds
      : [...nextPlayer.inventory.ownedRewardIds, reward.id];
    const shouldEquipReward = action === "equipReward" || action === "giftReward";
    const giftNotifications = action === "giftReward"
      ? [
        {
          id: crypto.randomUUID(),
          rewardId: reward.id,
          rewardName: reward.name,
          rewardKind: reward.kind,
          giftedBy: "Admin",
          createdAt: new Date().toISOString(),
        },
        ...(nextPlayer.giftNotifications ?? []).slice(0, 9),
      ]
      : nextPlayer.giftNotifications;

    nextPlayer = {
      ...nextPlayer,
      giftNotifications,
      avatar: reward.kind === "avatar" && shouldEquipReward
        ? reward.id
        : nextPlayer.avatar,
      inventory: {
        ...nextPlayer.inventory,
        ownedRewardIds,
        equippedAvatarId: reward.kind === "avatar" && shouldEquipReward
          ? reward.id
          : nextPlayer.inventory.equippedAvatarId,
        equippedPetId: reward.kind === "pet" && shouldEquipReward
          ? reward.id
          : nextPlayer.inventory.equippedPetId,
        equippedThemeId: reward.kind === "theme" && shouldEquipReward
          ? reward.id
          : nextPlayer.inventory.equippedThemeId,
        equippedFrameId: reward.kind === "frame" && shouldEquipReward
          ? reward.id
          : nextPlayer.inventory.equippedFrameId,
        equippedEffectId: reward.kind === "effect" && shouldEquipReward
          ? reward.id
          : nextPlayer.inventory.equippedEffectId,
      },
    };
  }

  if (action === "toggleRewardsLock") {
    nextPlayer = {
      ...nextPlayer,
      inventory: {
        ...nextPlayer.inventory,
        rewardsLocked: !nextPlayer.inventory.rewardsLocked,
      },
    };
  }

  if (action === "assignSurpriseExam") {
    const exam = body.surpriseExam;
    const options = exam?.options?.map((option) => option.trim()).filter(Boolean) ?? [];

    if (!exam?.title || !exam.question || options.length < 2 || !exam.correctAnswer) {
      return Response.json({ error: "Dados da prova surpresa invalidos." }, { status: 400 });
    }

    const correctAnswer = exam.correctAnswer.trim();

    if (!options.includes(correctAnswer)) {
      return Response.json({ error: "A resposta correta precisa estar entre as opcoes." }, { status: 400 });
    }

    nextPlayer = {
      ...nextPlayer,
      surpriseExam: {
        id: crypto.randomUUID(),
        title: exam.title.trim(),
        question: exam.question.trim(),
        options,
        correctAnswer,
        rewardXp: Number.isFinite(exam.rewardXp) ? Math.max(0, Math.floor(Number(exam.rewardXp))) : 50,
        rewardCoins: Number.isFinite(exam.rewardCoins) ? Math.max(0, Math.floor(Number(exam.rewardCoins))) : 25,
        assignedAt: new Date().toISOString(),
      },
    };
  }

  if (action === "clearSurpriseExam") {
    nextPlayer = {
      ...nextPlayer,
      surpriseExam: undefined,
    };
  }

  const savedPlayer = await writePlayerProgress(
    body.userId,
    {
      ...nextPlayer,
      updatedAt: new Date().toISOString(),
    },
    { forceOverwrite }
  );

  const user = (await readStoredUsers()).find((storedUser) => storedUser.id === body.userId);
  await recordAdminAction({
    action,
    label: getAuditLabel(action, body),
    actorEmail,
    targetUserId: body.userId,
    targetName: user?.name ?? targetUser?.name,
    targetEmail: user?.email ?? targetUser?.email,
    details: getAuditDetails(action, body, player, savedPlayer),
  });

  return Response.json({
    player: savedPlayer,
    user,
    attempts: await readRecentAttempts(body.userId, 8),
    snapshots: await readProgressSnapshots(body.userId, 8),
    passwordResetRequests: await readPasswordResetRequests(),
  });
}

function getAuditLabel(
  action: AdminProgressAction,
  body: {
    name?: string;
    coins?: number;
    level?: number;
    stageId?: string;
    rewardId?: string;
  }
) {
  if (action === "grantReward") return "Liberou recompensa";
  if (action === "equipReward") return "Equipou recompensa";
  if (action === "giftReward") return "Enviou presente";
  if (action === "toggleRewardsLock") return "Alterou bloqueio da loja";
  if (action === "assignSurpriseExam") return "Enviou prova surpresa";
  if (action === "clearSurpriseExam") return "Limpou prova pendente";
  if (action === "resetProgress") return "Resetou campanha";
  if (action === "reset") return "Resetou conta inteira";

  if (body.stageId) return "Alterou fase atual";
  if (body.name !== undefined || body.coins !== undefined || body.level !== undefined) {
    return "Atualizou dados do aluno";
  }

  return "Atualizou progresso";
}

function getAuditDetails(
  action: AdminProgressAction,
  body: {
    name?: string;
    coins?: number;
    level?: number;
    stageId?: string;
    rewardId?: string;
    surpriseExam?: { title?: string };
  },
  previousPlayer: Awaited<ReturnType<typeof readPlayerProgress>>,
  savedPlayer: Awaited<ReturnType<typeof readPlayerProgress>>
) {
  if (body.rewardId) {
    const reward = rewardItems.find((item) => item.id === body.rewardId);

    return reward ? `${reward.name} (${reward.kind}).` : `Recompensa ${body.rewardId}.`;
  }

  if (body.stageId) {
    const stage = getStageOptions().find((item) => item.id === body.stageId);

    return stage ? `Fase atual: ${stage.campaignTitle} / ${stage.chapterTitle} / ${stage.title}.` : `Fase ${body.stageId}.`;
  }

  if (action === "toggleRewardsLock") {
    return savedPlayer.inventory.rewardsLocked ? "Loja bloqueada." : "Loja desbloqueada.";
  }

  if (action === "assignSurpriseExam") {
    return `Prova: ${body.surpriseExam?.title ?? "sem titulo"}.`;
  }

  if (action === "clearSurpriseExam") {
    return "Prova pendente removida.";
  }

  if (action === "resetProgress") {
    return "Campanha voltou ao inicio mantendo itens liberados.";
  }

  if (action === "reset") {
    return "Conta voltou ao estado inicial completo.";
  }

  const changes = [
    body.name !== undefined ? `nome alterado` : "",
    previousPlayer.coins !== savedPlayer.coins ? `moedas ${previousPlayer.coins} -> ${savedPlayer.coins}` : "",
    previousPlayer.level !== savedPlayer.level ? `nivel ${previousPlayer.level} -> ${savedPlayer.level}` : "",
  ].filter(Boolean);

  return changes.length > 0 ? `${changes.join(", ")}.` : undefined;
}

function getStageOptions() {
  return campaigns.flatMap((campaign) => (
    campaign.chapters.flatMap((chapter) => (
      chapter.stages.map((stage) => ({
        id: stage.id,
        title: stage.title,
        chapterId: chapter.id,
        chapterTitle: chapter.title,
        campaignId: campaign.id,
        campaignTitle: campaign.title,
      }))
    ))
  ));
}
