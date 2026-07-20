import { describe, expect, it } from "vitest";

import { campaigns } from "@/data/campaigns";
import { validateAnswer } from "@/domain/game/validator";

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

  it("accepts every challenge expected answer as valid", () => {
    for (const campaign of campaigns) {
      for (const chapter of campaign.chapters) {
        for (const stage of chapter.stages) {
          for (const content of stage.content) {
            if (content.type !== "challenge" && content.type !== "boss") {
              continue;
            }

            expect(
              validateAnswer(content.expectedAnswer, content.expectedAnswer),
              `${stage.id}: ${content.title}`
            ).toMatchObject({ success: true });
          }
        }
      }
    }
  });
});
