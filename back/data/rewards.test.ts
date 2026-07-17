import { describe, expect, it } from "vitest";
import { existsSync } from "node:fs";
import path from "node:path";

import { rewardItems, RewardKind } from "./rewards";

const rewardKinds: RewardKind[] = ["avatar", "pet", "theme", "frame", "effect"];

describe("rewardItems", () => {
  it("keeps a large store catalog across every reward kind", () => {
    for (const kind of rewardKinds) {
      expect(
        rewardItems.filter((item) => item.kind === kind).length,
        kind
      ).toBeGreaterThanOrEqual(11);
    }
  });

  it("keeps reward ids unique", () => {
    const ids = rewardItems.map((item) => item.id);

    expect(new Set(ids).size).toBe(ids.length);
  });

  it("uses real image assets for generated avatars and pets", () => {
    const generatedVisualRewards = rewardItems.filter((item) => (
      (item.kind === "avatar" || item.kind === "pet") &&
      (item.imageSrc?.includes("/generated/") ?? false)
    ));

    expect(generatedVisualRewards.length).toBeGreaterThanOrEqual(20);

    for (const reward of generatedVisualRewards) {
      expect(reward.imageSrc, reward.id).toBeTruthy();
      expect(
        existsSync(path.join(process.cwd(), "public", reward.imageSrc!.replace(/^\//, ""))),
        reward.id
      ).toBe(true);
    }
  });
});
