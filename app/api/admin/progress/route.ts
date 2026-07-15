import { isAdminEmail } from "@/data/admin";
import { rewardItems } from "@/data/rewards";
import { readStoredUsers } from "@/infrastructure/auth/userStore";
import {
  readPlayerProgress,
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
  })));

  return Response.json({ rows });
}

export async function PATCH(request: Request) {
  if (!isAdminRequest(request)) {
    return Response.json({ error: "Acesso negado." }, { status: 403 });
  }

  const body = await request.json().catch(() => null) as {
    userId?: string;
    coins?: number;
    level?: number;
    action?: "update" | "reset" | "grantReward" | "equipReward" | "assignSurpriseExam" | "clearSurpriseExam";
    rewardId?: string;
    surpriseExam?: {
      title?: string;
      question?: string;
      options?: string[];
      correctAnswer?: string;
      rewardXp?: number;
      rewardCoins?: number;
    };
  } | null;

  if (!body?.userId) {
    return Response.json({ error: "Usuario nao informado." }, { status: 400 });
  }

  const player = await readPlayerProgress(body.userId);
  const action = body.action ?? "update";
  const forceOverwrite = action === "reset";
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

  if ((action === "grantReward" || action === "equipReward") && body.rewardId) {
    const reward = rewardItems.find((item) => item.id === body.rewardId);

    if (!reward) {
      return Response.json({ error: "Recompensa nao encontrada." }, { status: 404 });
    }

    const ownedRewardIds = nextPlayer.inventory.ownedRewardIds.includes(reward.id)
      ? nextPlayer.inventory.ownedRewardIds
      : [...nextPlayer.inventory.ownedRewardIds, reward.id];

    nextPlayer = {
      ...nextPlayer,
      avatar: reward.kind === "avatar" && action === "equipReward"
        ? reward.id
        : nextPlayer.avatar,
      inventory: {
        ...nextPlayer.inventory,
        ownedRewardIds,
        equippedAvatarId: reward.kind === "avatar" && action === "equipReward"
          ? reward.id
          : nextPlayer.inventory.equippedAvatarId,
        equippedPetId: reward.kind === "pet" && action === "equipReward"
          ? reward.id
          : nextPlayer.inventory.equippedPetId,
        equippedThemeId: reward.kind === "theme" && action === "equipReward"
          ? reward.id
          : nextPlayer.inventory.equippedThemeId,
        equippedFrameId: reward.kind === "frame" && action === "equipReward"
          ? reward.id
          : nextPlayer.inventory.equippedFrameId,
        equippedEffectId: reward.kind === "effect" && action === "equipReward"
          ? reward.id
          : nextPlayer.inventory.equippedEffectId,
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

  return Response.json({ player: savedPlayer });
}

function isAdminRequest(request: Request) {
  const email = new URL(request.url).searchParams.get("adminEmail") ?? "";

  return isAdminEmail(email);
}
