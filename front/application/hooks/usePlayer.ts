"use client";

import { useSyncExternalStore } from "react";

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

function hydratePlayer() {
  if (hydrated || typeof window === "undefined") {
    return false;
  }

  currentPlayer = loadPlayer();
  hydrated = true;
  return true;
}

function subscribe(listener: Listener) {
  listeners.add(listener);

  if (hydratePlayer()) {
    queueMicrotask(listener);
  }

  return () => {
    listeners.delete(listener);
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
  currentPlayer = updater(currentPlayer);
  savePlayer(currentPlayer);
  listeners.forEach((listener) => listener());
}

function replacePlayer(player: Player) {
  currentPlayer = player;
  savePlayer(currentPlayer);
  listeners.forEach((listener) => listener());
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
  };
}
