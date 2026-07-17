import { isAdminEmail } from "@/data/admin";
import { rewardItems } from "@/data/rewards";
import { campaigns } from "@/data/campaigns";
import { readStoredUsers, resetStoredUserPassword, updateStoredUserName } from "@/infrastructure/auth/userStore";
import { readRecentAttempts } from "@/infrastructure/supabase/attemptRepository";
import {
  readProgressSnapshots,
  readPlayerProgress,
  restoreProgressSnapshot,
  writePlayerProgress,
} from "@/infrastructure/supabase/playerProgressRepository";
import { initialPlayer } from "@/domain/game/playerProgress";

export async function GET(request: Request) {
  if (!isAdminRequest(request)) {
    return Response.json({ error: "Acesso negado." }, { status: 403 });
  }

  const users = await readStoredUsers();
  const rows = await Promise.all(users.map(async (user) => ({
    user,
    player: await readPlayerProgress(user.id),
    attempts: await readRecentAttempts(user.id, 8),
    snapshots: await readProgressSnapshots(user.id, 8),
  })));

  return Response.json({ rows, stageOptions: getStageOptions() });
}

export async function PATCH(request: Request) {
  if (!isAdminRequest(request)) {
    return Response.json({ error: "Acesso negado." }, { status: 403 });
  }

  const body = await request.json().catch(() => null) as {
    userId?: string;
    coins?: number;
    level?: number;
    name?: string;
    stageId?: string;
    action?: "update" | "reset" | "resetProgress" | "resetAllProgress" | "grantReward" | "equipReward" | "giftReward" | "toggleRewardsLock" | "assignSurpriseExam" | "clearSurpriseExam" | "restoreSnapshot" | "resetPassword";
    password?: string;
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

    const rows = await Promise.all(users.map(async (user) => ({
      user,
      player: await readPlayerProgress(user.id),
      attempts: await readRecentAttempts(user.id, 8),
      snapshots: await readProgressSnapshots(user.id, 8),
    })));

    return Response.json({ rows, stageOptions: getStageOptions() });
  }

  if (!body?.userId) {
    return Response.json({ error: "Usuario nao informado." }, { status: 400 });
  }

  const player = await readPlayerProgress(body.userId);
  const action = body.action ?? "update";

  if (body.name !== undefined) {
    await updateStoredUserName(body.userId, body.name);
  }

  if (action === "resetPassword") {
    if (!body.password) {
      return Response.json({ error: "Senha nao informada." }, { status: 400 });
    }

    await resetStoredUserPassword(body.userId, body.password);
    const user = (await readStoredUsers()).find((storedUser) => storedUser.id === body.userId);

    return Response.json({
      player,
      user,
      attempts: await readRecentAttempts(body.userId, 8),
      snapshots: await readProgressSnapshots(body.userId, 8),
    });
  }

  if (action === "restoreSnapshot") {
    if (!body.snapshotId) {
      return Response.json({ error: "Snapshot nao informado." }, { status: 400 });
    }

    const restoredPlayer = await restoreProgressSnapshot(body.userId, body.snapshotId);
    const user = (await readStoredUsers()).find((storedUser) => storedUser.id === body.userId);

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

    nextPlayer = {
      ...nextPlayer,
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

  return Response.json({
    player: savedPlayer,
    user,
    attempts: await readRecentAttempts(body.userId, 8),
    snapshots: await readProgressSnapshots(body.userId, 8),
  });
}

function isAdminRequest(request: Request) {
  const email = new URL(request.url).searchParams.get("adminEmail") ?? "";

  return isAdminEmail(email);
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
