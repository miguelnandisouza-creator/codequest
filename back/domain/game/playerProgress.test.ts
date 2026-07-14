import { describe, expect, it } from "vitest";

import {
  completeStage,
  hasCompletedStage,
  initialPlayer,
} from "@/domain/game/playerProgress";

describe("player progress", () => {
  it("completes a stage and grants its reward", () => {
    const player = completeStage(
      initialPlayer,
      "sql-village-intro",
      {
        xp: 50,
        coins: 20,
      }
    );

    expect(player.xp).toBe(50);
    expect(player.coins).toBe(20);
    expect(player.progress.totalXP).toBe(50);
    expect(player.progress.stageId).toBe("sql-village-intro");
    expect(hasCompletedStage(player, "sql-village-intro")).toBe(true);
  });

  it("does not reward the same stage twice", () => {
    const firstCompletion = completeStage(
      initialPlayer,
      "sql-village-intro",
      {
        xp: 50,
        coins: 20,
      }
    );

    const secondCompletion = completeStage(
      firstCompletion,
      "sql-village-intro",
      {
        xp: 50,
        coins: 20,
      }
    );

    expect(secondCompletion).toBe(firstCompletion);
    expect(secondCompletion.xp).toBe(50);
    expect(secondCompletion.coins).toBe(20);
    expect(secondCompletion.progress.completedStages).toEqual([
      "sql-village-intro",
    ]);
  });

  it("levels up from accumulated XP", () => {
    const player = completeStage(
      initialPlayer,
      "sql-village-intro",
      {
        xp: 100,
        coins: 0,
      }
    );

    expect(player.level).toBe(2);
    expect(player.progress.level).toBe(2);
  });

  it("keeps the original player immutable when completing a stage", () => {
    const player = completeStage(
      initialPlayer,
      "sql-village-intro",
      {
        xp: 50,
        coins: 20,
      }
    );

    expect(player).not.toBe(initialPlayer);
    expect(initialPlayer.xp).toBe(0);
    expect(initialPlayer.progress.completedStages).toEqual([]);
  });
});
