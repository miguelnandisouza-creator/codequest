import { describe, expect, it } from "vitest";

import { sqlCampaign } from "@/data/campaigns/sql";

describe("sqlCampaign", () => {
  it("has a complete learning path", () => {
    expect(sqlCampaign.chapters).toHaveLength(5);
    expect(
      sqlCampaign.chapters.flatMap((chapter) => chapter.stages)
    ).toHaveLength(38);
  });

  it("keeps every chapter populated and ordered", () => {
    for (const chapter of sqlCampaign.chapters) {
      expect(chapter.stages.length).toBeGreaterThan(0);

      const stageOrders = chapter.stages.map((stage) => stage.order);

      expect(new Set(stageOrders).size).toBe(stageOrders.length);
      expect(stageOrders).toEqual(
        [...stageOrders].sort((left, right) => left - right)
      );
    }
  });

  it("keeps stages linked to their chapter and campaign", () => {
    for (const chapter of sqlCampaign.chapters) {
      for (const stage of chapter.stages) {
        expect(stage.campaignId).toBe(sqlCampaign.id);
        expect(stage.chapterId).toBe(chapter.id);
        expect(stage.content.length).toBeGreaterThan(0);
        expect(stage.reward.xp).toBeGreaterThan(0);
      }
    }
  });

  it("uses every content mode supported by the adventure engine", () => {
    const contentTypes = new Set(
      sqlCampaign.chapters.flatMap((chapter) => (
        chapter.stages.flatMap((stage) => (
          stage.content.map((content) => content.type)
        ))
      ))
    );

    expect(contentTypes).toEqual(
      new Set(["text", "example", "challenge", "quiz", "boss"])
    );
  });
});
