import { Player } from "@/domain/entities/player";
import { initialPlayer } from "@/domain/game/playerProgress";

const STORAGE_KEY = "codequest-player";

export function loadPlayer(userId?: string | null): Player {
  if (typeof window === "undefined") {
    return initialPlayer;
  }

  const stored = window.localStorage.getItem(getStorageKey(userId));

  if (!stored) {
    const legacyStored = userId
      ? window.localStorage.getItem(STORAGE_KEY)
      : null;

    if (!legacyStored) {
      return initialPlayer;
    }

    return parsePlayer(legacyStored);
  }

  return parsePlayer(stored);
}

export function savePlayer(player: Player, userId?: string | null) {
  window.localStorage.setItem(
    getStorageKey(userId),
    JSON.stringify(player)
  );
}

function getStorageKey(userId?: string | null) {
  return userId ? `${STORAGE_KEY}:${userId}` : STORAGE_KEY;
}

function parsePlayer(stored: string) {
  try {
    const parsed = JSON.parse(stored) as Partial<Player>;

    const inventory = {
      ...initialPlayer.inventory,
      ...parsed.inventory,
      ownedRewardIds: Array.from(new Set([
        ...initialPlayer.inventory.ownedRewardIds,
        ...(parsed.inventory?.ownedRewardIds ?? []),
      ])),
    };

    return {
      ...initialPlayer,
      ...parsed,
      inventory,
      progress: {
        ...initialPlayer.progress,
        ...parsed.progress,
      },
    };
  } catch {
    return initialPlayer;
  }
}
