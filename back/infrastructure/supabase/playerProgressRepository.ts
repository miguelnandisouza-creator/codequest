import { Player } from "@/domain/entities/player";
import {
  mergePlayer,
  readPlayerProgress as readFilePlayerProgress,
  writePlayerProgress as writeFilePlayerProgress,
} from "@/infrastructure/storage/serverPlayerStorage";
import { getSupabaseServerClient } from "./serverClient";

type PlayerProgressRow = {
  user_id: string;
  player: Partial<Player>;
  updated_at: string;
};

export async function readPlayerProgress(userId: string) {
  const supabase = getSupabaseServerClient();

  if (!supabase) {
    return readFilePlayerProgress(userId);
  }

  const { data, error } = await supabase
    .from("player_progress")
    .select("user_id, player, updated_at")
    .eq("user_id", userId)
    .maybeSingle<PlayerProgressRow>();

  if (error) {
    console.warn("Supabase read player_progress failed:", error.message);
    return readFilePlayerProgress(userId);
  }

  if (!data) {
    const localPlayer = await readFilePlayerProgress(userId);
    await writePlayerProgress(userId, localPlayer);
    return localPlayer;
  }

  return mergePlayer({
    ...data.player,
    id: userId,
    updatedAt: data.player.updatedAt ?? data.updated_at,
  });
}

export async function writePlayerProgress(
  userId: string,
  player: Player,
  options: { forceOverwrite?: boolean } = {}
) {
  const incomingPlayer = mergePlayer({
    ...player,
    id: userId,
    updatedAt: player.updatedAt ?? new Date().toISOString(),
  });
  const existingPlayer = options.forceOverwrite
    ? null
    : await readExistingProgress(userId);
  const mergedPlayer = existingPlayer
    ? mergeSafeProgress(existingPlayer, incomingPlayer)
    : incomingPlayer;
  const supabase = getSupabaseServerClient();

  await writeFilePlayerProgress(userId, mergedPlayer);

  if (!supabase) {
    return mergedPlayer;
  }

  const { error } = await supabase
    .from("player_progress")
    .upsert({
      user_id: userId,
      player: mergedPlayer,
      updated_at: mergedPlayer.updatedAt,
    });

  if (error) {
    console.warn("Supabase write player_progress failed:", error.message);
  }

  return mergedPlayer;
}

async function readExistingProgress(userId: string) {
  const supabase = getSupabaseServerClient();

  if (supabase) {
    const { data } = await supabase
      .from("player_progress")
      .select("user_id, player, updated_at")
      .eq("user_id", userId)
      .maybeSingle<PlayerProgressRow>();

    if (data) {
      return mergePlayer({
        ...data.player,
        id: userId,
        updatedAt: data.player.updatedAt ?? data.updated_at,
      });
    }
  }

  try {
    return await readFilePlayerProgress(userId);
  } catch {
    return null;
  }
}

function mergeSafeProgress(existing: Player, incoming: Player) {
  const completedStages = Array.from(new Set([
    ...existing.progress.completedStages,
    ...incoming.progress.completedStages,
  ]));
  const ownedRewardIds = Array.from(new Set([
    ...existing.inventory.ownedRewardIds,
    ...incoming.inventory.ownedRewardIds,
  ]));
  const incomingIsAhead = getProgressScore(incoming) >= getProgressScore(existing);

  return mergePlayer({
    ...(incomingIsAhead ? incoming : existing),
    id: incoming.id,
    xp: Math.max(existing.xp, incoming.xp),
    level: Math.max(existing.level, incoming.level),
    coins: incoming.coins,
    progress: {
      ...(incomingIsAhead ? incoming.progress : existing.progress),
      completedStages,
      totalXP: Math.max(existing.progress.totalXP, incoming.progress.totalXP),
      level: Math.max(existing.progress.level, incoming.progress.level),
    },
    inventory: {
      ...existing.inventory,
      ...incoming.inventory,
      ownedRewardIds,
    },
    surpriseExam: incoming.surpriseExam ?? existing.surpriseExam,
    updatedAt: incoming.updatedAt ?? existing.updatedAt,
  });
}

function getProgressScore(player: Player) {
  return player.xp
    + (player.level * 1000)
    + (player.progress.completedStages.length * 100)
    + (player.inventory.ownedRewardIds.length * 25);
}
