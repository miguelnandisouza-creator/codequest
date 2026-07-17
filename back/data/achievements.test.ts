import { describe, expect, it } from "vitest";

import {
  getAchievementCatalog,
  unlockEligibleAchievements,
} from "./achievements";
import { initialPlayer } from "@/domain/game/playerProgress";

describe("achievements", () => {
  it("unlocks eligible achievements once", () => {
    const player = {
      ...initialPlayer,
      level: 5,
      progress: {
        ...initialPlayer.progress,
        completedStages: ["java-01-foundation-01"],
      },
    };

    const first = unlockEligibleAchievements(player);
    const second = unlockEligibleAchievements(first.player);

    expect(first.unlocked.map((achievement) => achievement.id)).toEqual(
      expect.arrayContaining(["first-mission", "level-5"])
    );
    expect(second.unlocked).toHaveLength(0);
  });

  it("exposes the account catalog", () => {
    expect(getAchievementCatalog().length).toBeGreaterThanOrEqual(8);
  });
});
