import { copyFile, mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

import { Player } from "@/domain/entities/player";
import { initialPlayer } from "@/domain/game/playerProgress";

const dataDir = path.join(process.cwd(), ".data");
const progressDir = path.join(dataDir, "progress");
const backupDir = path.join(dataDir, "progress-backups");

export function mergePlayer(player: Partial<Player> | null | undefined): Player {
  const inventory = {
    ...initialPlayer.inventory,
    ...player?.inventory,
    ownedRewardIds: Array.from(new Set([
      ...initialPlayer.inventory.ownedRewardIds,
      ...(player?.inventory?.ownedRewardIds ?? []),
    ])),
  };

  return {
    ...initialPlayer,
    ...player,
    inventory,
    progress: {
      ...initialPlayer.progress,
      ...player?.progress,
    },
  };
}

export async function readPlayerProgress(userId: string) {
  try {
    const rawPlayer = await readFile(getProgressFile(userId), "utf8");
    return mergePlayer(JSON.parse(rawPlayer) as Partial<Player>);
  } catch {
    return mergePlayer({
      id: userId,
    });
  }
}

export async function writePlayerProgress(userId: string, player: Player) {
  await mkdir(progressDir, { recursive: true });
  await backupExistingProgress(userId);
  await writeFile(
    getProgressFile(userId),
    JSON.stringify(mergePlayer({ ...player, id: userId }), null, 2),
    "utf8"
  );
}

function getProgressFile(userId: string) {
  return path.join(progressDir, `${safeFileName(userId)}.json`);
}

async function backupExistingProgress(userId: string) {
  const progressFile = getProgressFile(userId);

  try {
    await readFile(progressFile, "utf8");
  } catch {
    return;
  }

  await mkdir(backupDir, { recursive: true });
  await copyFile(
    progressFile,
    path.join(backupDir, `${safeFileName(userId)}-${new Date().toISOString().replace(/[:.]/g, "-")}.json`)
  );
}

function safeFileName(value: string) {
  return value.replace(/[^a-zA-Z0-9_-]/g, "_");
}
