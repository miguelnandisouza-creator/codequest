"use client";

import { useSyncExternalStore } from "react";

import {
  getLocalSession,
  subscribeToLocalAuth,
} from "@/application/auth/localAuth";
import { rewardItems, RewardKind } from "@/data/rewards";
import { Player } from "@/domain/entities/player";
import {
  completeStage,
  initialPlayer,
} from "@/domain/game/playerProgress";
import {
  loadPlayer,
  savePlayer,
} from "@/infrastructure/storage/playerStorage";

type Listener = () => void;

const listeners = new Set<Listener>();

let currentPlayer: Player = initialPlayer;
let hydrated = false;
let activeUserId: string | null = null;
let syncInterval: number | undefined;

function hydratePlayer() {
  if (hydrated || typeof window === "undefined") {
    return false;
  }

  activeUserId = getLocalSession()?.userId ?? null;
  currentPlayer = loadPlayer(activeUserId);
  hydrated = true;
  void syncPlayerFromServer();

  return true;
}

function subscribe(listener: Listener) {
  listeners.add(listener);

  if (hydratePlayer()) {
    queueMicrotask(listener);
  }

  const unsubscribeAuth = typeof window === "undefined"
    ? () => {}
    : subscribeToLocalAuth(() => {
      const nextUserId = getLocalSession()?.userId ?? null;

      if (nextUserId !== activeUserId) {
        hydrated = false;
        hydratePlayer();
        emitPlayerChange();
      }
    });
  startServerSync();

  return () => {
    listeners.delete(listener);
    unsubscribeAuth();

    if (listeners.size === 0) {
      window.clearInterval(syncInterval);
      syncInterval = undefined;
    }
  };
}

function getSnapshot() {
  hydratePlayer();
  return currentPlayer;
}

function getServerSnapshot() {
  return initialPlayer;
}

function updatePlayer(updater: (player: Player) => Player) {
  hydratePlayer();
  currentPlayer = markUpdated(updater(currentPlayer));
  savePlayer(currentPlayer, activeUserId);
  void savePlayerToServer(currentPlayer);
  emitPlayerChange();
}

function replacePlayer(player: Player) {
  currentPlayer = markUpdated(player);
  savePlayer(currentPlayer, activeUserId);
  void savePlayerToServer(currentPlayer);
  emitPlayerChange();
}

function emitPlayerChange() {
  listeners.forEach((listener) => listener());
}

function startServerSync() {
  if (syncInterval || typeof window === "undefined") {
    return;
  }

  syncInterval = window.setInterval(() => {
    void syncPlayerFromServer();
  }, 8000);
}

async function syncPlayerFromServer() {
  const session = getLocalSession();

  if (!session) {
    return;
  }

  try {
    const response = await fetch(`/api/player?userId=${encodeURIComponent(session.userId)}`, {
      cache: "no-store",
    });

    if (!response.ok) {
      return;
    }

    const data = await response.json() as { player?: Player };

    if (!data.player) {
      return;
    }

    const serverExam = data.player.surpriseExam;

    if (
      serverExam &&
      !serverExam.completedAt &&
      currentPlayer.surpriseExam?.id !== serverExam.id
    ) {
      currentPlayer = {
        ...currentPlayer,
        surpriseExam: serverExam,
      };
      savePlayer(currentPlayer, activeUserId);
      emitPlayerChange();
      await savePlayerToServer(currentPlayer);
      return;
    }

    if (isLocalPlayerNewer(currentPlayer, data.player)) {
      await savePlayerToServer(currentPlayer);
      return;
    }

    currentPlayer = data.player;
    savePlayer(currentPlayer, activeUserId);
    emitPlayerChange();
  } catch {
    // Se a API falhar, o progresso local continua funcionando.
  }
}

async function savePlayerToServer(player: Player) {
  const session = getLocalSession();

  if (!session) {
    return;
  }

  try {
    await fetch("/api/player", {
      method: "POST",
      keepalive: true,
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify({
        userId: session.userId,
        player,
      }),
    });
  } catch {
    // O save local ja aconteceu antes da tentativa remota.
  }
}

function markUpdated(player: Player): Player {
  return {
    ...player,
    updatedAt: new Date().toISOString(),
  };
}

function isLocalPlayerNewer(localPlayer: Player, serverPlayer: Player) {
  const localProgressScore = getProgressScore(localPlayer);
  const serverProgressScore = getProgressScore(serverPlayer);

  if (localProgressScore !== serverProgressScore) {
    return localProgressScore > serverProgressScore;
  }

  const localOwnedRewards = [...localPlayer.inventory.ownedRewardIds].sort();
  const serverOwnedRewards = [...serverPlayer.inventory.ownedRewardIds].sort();
  const localOwnedSignature = localOwnedRewards.join("|");
  const serverOwnedSignature = serverOwnedRewards.join("|");

  if (localOwnedSignature !== serverOwnedSignature) {
    return localOwnedRewards.length > serverOwnedRewards.length;
  }

  const localTime = Date.parse(localPlayer.updatedAt ?? "");
  const serverTime = Date.parse(serverPlayer.updatedAt ?? "");

  if (Number.isFinite(localTime) && Number.isFinite(serverTime) && localTime !== serverTime) {
    return localTime > serverTime;
  }

  if (Number.isFinite(localTime) && !Number.isFinite(serverTime)) {
    return true;
  }

  return getInventorySignature(localPlayer) !== getInventorySignature(serverPlayer);
}

function getInventorySignature(player: Player) {
  return JSON.stringify({
    ownedRewardIds: [...player.inventory.ownedRewardIds].sort(),
    equippedAvatarId: player.inventory.equippedAvatarId ?? "",
    equippedPetId: player.inventory.equippedPetId ?? "",
    equippedThemeId: player.inventory.equippedThemeId ?? "",
    equippedFrameId: player.inventory.equippedFrameId ?? "",
    equippedEffectId: player.inventory.equippedEffectId ?? "",
  });
}

function getProgressScore(player: Player) {
  return player.xp
    + (player.level * 1000)
    + (player.progress.completedStages.length * 100)
    + (player.inventory.ownedRewardIds.length * 25);
}

function canUseReward(reward: { allowedEmails?: string[] }) {
  if (!reward.allowedEmails?.length) {
    return true;
  }

  const session = getLocalSession();

  return session
    ? reward.allowedEmails.includes(session.email.toLowerCase())
    : false;
}

export function usePlayer() {
  const player = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot
  );

  return {
    player,
    completeStage(stageId: string, reward: { xp: number; coins: number }) {
      updatePlayer((current) => (
        completeStage(current, stageId, reward)
      ));
    },
    resetProgress() {
      replacePlayer(initialPlayer);
    },
    addCoins(amount: number) {
      updatePlayer((current) => ({
        ...current,
        coins: Math.max(0, current.coins + amount),
      }));
    },
    addLevels(amount: number) {
      updatePlayer((current) => ({
        ...current,
        level: Math.max(1, current.level + amount),
      }));
    },
    completeSurpriseExam() {
      updatePlayer((current) => {
        if (!current.surpriseExam || current.surpriseExam.completedAt) {
          return current;
        }

        return {
          ...current,
          xp: current.xp + current.surpriseExam.rewardXp,
          coins: current.coins + current.surpriseExam.rewardCoins,
          surpriseExam: {
            ...current.surpriseExam,
            completedAt: new Date().toISOString(),
          },
        };
      });
    },
    buyReward(rewardId: string) {
      updatePlayer((current) => {
        const reward = rewardItems.find((item) => item.id === rewardId);

        if (!reward || !canUseReward(reward)) {
          return current;
        }

        if (current.inventory.ownedRewardIds.includes(rewardId)) {
          return current;
        }

        if (current.level < reward.levelRequired || current.coins < reward.price) {
          return current;
        }

        return {
          ...current,
          coins: current.coins - reward.price,
          inventory: {
            ...current.inventory,
            ownedRewardIds: [
              ...current.inventory.ownedRewardIds,
              rewardId,
            ],
          },
        };
      });
    },
    equipReward(rewardId: string, kind: RewardKind) {
      updatePlayer((current) => {
        const reward = rewardItems.find((item) => item.id === rewardId);

        if (!reward || !canUseReward(reward)) {
          return current;
        }

        if (!current.inventory.ownedRewardIds.includes(rewardId)) {
          return current;
        }

        return {
          ...current,
          avatar: kind === "avatar" ? rewardId : current.avatar,
          inventory: {
            ...current.inventory,
            equippedAvatarId: kind === "avatar"
              ? rewardId
              : current.inventory.equippedAvatarId,
            equippedPetId: kind === "pet"
              ? rewardId
              : current.inventory.equippedPetId,
            equippedThemeId: kind === "theme"
              ? rewardId
              : current.inventory.equippedThemeId,
            equippedFrameId: kind === "frame"
              ? rewardId
              : current.inventory.equippedFrameId,
            equippedEffectId: kind === "effect"
              ? rewardId
              : current.inventory.equippedEffectId,
          },
        };
      });
    },
    celebratePet() {
      window.dispatchEvent(new Event("codequest-pet-celebrate"));
    },
    petSay(message: string) {
      window.dispatchEvent(new CustomEvent("codequest-pet-say", {
        detail: { message },
      }));
    },
  };
}
