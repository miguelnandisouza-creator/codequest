import { Player } from "@/domain/entities/player";
import { appendFile, mkdir, readFile } from "node:fs/promises";
import path from "node:path";
import {
  mergePlayer,
  readPlayerProgress as readFilePlayerProgress,
  writePlayerProgress as writeFilePlayerProgress,
} from "@/infrastructure/storage/serverPlayerStorage";
import { getSupabaseServerClient } from "./serverClient";

const dataDir = path.join(process.cwd(), ".data");
const snapshotsFile = path.join(dataDir, "progress-snapshots.jsonl");
const canWriteLocalFiles = process.env.VERCEL !== "1";

type PlayerProgressRow = {
  user_id: string;
  player: Partial<Player>;
  updated_at: string;
};

export type ProgressSnapshot = {
  id: string;
  userId: string;
  player: Player;
  reason: string;
  createdAt: string;
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
    return canWriteLocalFiles
      ? readFilePlayerProgress(userId)
      : mergePlayer({ id: userId });
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
    ? await readExistingProgress(userId)
    : await readExistingProgress(userId);
  const mergedPlayer = existingPlayer
    ? options.forceOverwrite
      ? incomingPlayer
      : mergeSafeProgress(existingPlayer, incomingPlayer)
    : incomingPlayer;
  const supabase = getSupabaseServerClient();

  if (existingPlayer && shouldSnapshot(existingPlayer, mergedPlayer)) {
    await saveProgressSnapshot(userId, existingPlayer, options.forceOverwrite ? "force_overwrite" : "before_write");
  }

  if (!supabase) {
    await writeFilePlayerProgress(userId, mergedPlayer);
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

    if (canWriteLocalFiles) {
      await writeFilePlayerProgress(userId, mergedPlayer);
    }
  }

  return mergedPlayer;
}

export async function readProgressSnapshots(userId: string, limit = 10) {
  const safeLimit = Math.min(Math.max(limit, 1), 50);
  const supabase = getSupabaseServerClient();

  if (supabase) {
    const { data, error } = await supabase
      .from("progress_snapshots")
      .select("id, user_id, player, reason, created_at")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(safeLimit);

    if (!error && data) {
      return data.map((row) => ({
        id: String(row.id),
        userId: String(row.user_id),
        player: mergePlayer({
          ...(row.player as Partial<Player>),
          id: String(row.user_id),
        }),
        reason: String(row.reason ?? ""),
        createdAt: String(row.created_at),
      }));
    }

    console.warn("Supabase read progress_snapshots failed:", error?.message);
  }

  try {
    const raw = await readFile(snapshotsFile, "utf8");
    return raw
      .split(/\r?\n/)
      .filter(Boolean)
      .map((line) => JSON.parse(line) as ProgressSnapshot)
      .filter((snapshot) => snapshot.userId === userId)
      .slice(-safeLimit)
      .reverse();
  } catch {
    return [];
  }
}

export async function restoreProgressSnapshot(userId: string, snapshotId: string) {
  const snapshots = await readProgressSnapshots(userId, 50);
  const snapshot = snapshots.find((item) => item.id === snapshotId);

  if (!snapshot) {
    throw new Error("Snapshot nao encontrado.");
  }

  return writePlayerProgress(userId, {
    ...snapshot.player,
    id: userId,
    updatedAt: new Date().toISOString(),
  }, { forceOverwrite: true });
}

async function saveProgressSnapshot(userId: string, player: Player, reason: string) {
  const snapshot = {
    id: crypto.randomUUID(),
    userId,
    player,
    reason,
    createdAt: new Date().toISOString(),
  };
  const supabase = getSupabaseServerClient();

  if (supabase) {
    const { error } = await supabase
      .from("progress_snapshots")
      .insert({
        user_id: userId,
        player,
        reason,
        created_at: snapshot.createdAt,
      });

    if (!error) {
      return;
    }

    console.warn("Supabase insert progress_snapshots failed:", error.message);
  }

  if (canWriteLocalFiles) {
    await mkdir(dataDir, { recursive: true });
    await appendFile(snapshotsFile, `${JSON.stringify(snapshot)}\n`, "utf8");
  }
}

function shouldSnapshot(existing: Player, next: Player) {
  return getSnapshotSignature(existing) !== getSnapshotSignature(next);
}

function getSnapshotSignature(player: Player) {
  return JSON.stringify({
    xp: player.xp,
    level: player.level,
    coins: player.coins,
    streak: player.streak,
    avatar: player.avatar,
    achievements: player.achievements,
    progress: player.progress,
    inventory: player.inventory,
    surpriseExam: player.surpriseExam,
  });
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

  if (canWriteLocalFiles) {
    try {
      return await readFilePlayerProgress(userId);
    } catch {
      return null;
    }
  }

  return null;
}

function mergeSafeProgress(existing: Player, incoming: Player) {
  const existingTime = Date.parse(existing.updatedAt ?? "");
  const incomingTime = Date.parse(incoming.updatedAt ?? "");
  const completedStages = Array.from(new Set([
    ...existing.progress.completedStages,
    ...incoming.progress.completedStages,
  ]));
  const ownedRewardIds = Array.from(new Set([
    ...existing.inventory.ownedRewardIds,
    ...incoming.inventory.ownedRewardIds,
  ]));
  const giftNotifications = mergeGiftNotifications(existing, incoming);

  if (
    Number.isFinite(existingTime) &&
    Number.isFinite(incomingTime) &&
    existingTime > incomingTime
  ) {
    return mergePlayer({
      ...existing,
      inventory: {
        ...existing.inventory,
        ownedRewardIds,
      },
      giftNotifications,
      updatedAt: existing.updatedAt,
    });
  }

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
    giftNotifications,
    surpriseExam: incoming.surpriseExam ?? existing.surpriseExam,
    updatedAt: incoming.updatedAt ?? existing.updatedAt,
  });
}

function mergeGiftNotifications(existing: Player, incoming: Player) {
  const byId = new Map<string, NonNullable<Player["giftNotifications"]>[number]>();

  for (const notification of [
    ...(existing.giftNotifications ?? []),
    ...(incoming.giftNotifications ?? []),
  ]) {
    const previous = byId.get(notification.id);

    byId.set(notification.id, {
      ...previous,
      ...notification,
      seenAt: notification.seenAt ?? previous?.seenAt,
    });
  }

  return [...byId.values()]
    .sort((left, right) => Date.parse(right.createdAt) - Date.parse(left.createdAt))
    .slice(0, 10);
}

function getProgressScore(player: Player) {
  return player.xp
    + (player.level * 1000)
    + (player.progress.completedStages.length * 100)
    + (player.inventory.ownedRewardIds.length * 25);
}
