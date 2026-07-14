import { describe, expect, it } from "vitest";

import { campaigns } from "@/data/campaigns";

describe("campaigns", () => {
  it("registers all available courses", () => {
    expect(campaigns.map((campaign) => campaign.id)).toEqual([
      "sql",
      "javascript",
      "python",
      "java",
      "csharp",
    ]);
  });

  it("keeps every campaign playable", () => {
    for (const campaign of campaigns) {
      expect(campaign.chapters.length).toBeGreaterThan(0);

      for (const chapter of campaign.chapters) {
        expect(chapter.campaignId).toBe(campaign.id);
        expect(chapter.stages.length).toBeGreaterThan(0);

        for (const stage of chapter.stages) {
          expect(stage.campaignId).toBe(campaign.id);
          expect(stage.chapterId).toBe(chapter.id);
          expect(stage.content.length).toBeGreaterThan(0);
          expect(stage.reward.xp).toBeGreaterThan(0);
        }
      }
    }
  });
});
