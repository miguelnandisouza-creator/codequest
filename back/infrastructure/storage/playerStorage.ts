import { Player } from "@/domain/entities/player";
import { initialPlayer } from "@/domain/game/playerProgress";

const STORAGE_KEY = "codequest-player";

export function loadPlayer(): Player {
  if (typeof window === "undefined") {
    return initialPlayer;
  }

  const stored = window.localStorage.getItem(STORAGE_KEY);

  if (!stored) {
    return initialPlayer;
  }

  try {
    return {
      ...initialPlayer,
      ...JSON.parse(stored),
    };
  } catch {
    return initialPlayer;
  }
}

export function savePlayer(player: Player) {
  window.localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(player)
  );
}
