import { describe, expect, it } from "vitest";

import { sqlCampaign } from "@/data/campaigns/sql";
import { completeStage, initialPlayer } from "@/domain/game/playerProgress";
import {
  getStageProgressStatus,
  isChapterUnlocked,
} from "@/domain/game/progression";

describe("progression", () => {
  it("unlocks the first chapter and locks the second before progress", () => {
    const [firstChapter, secondChapter] = sqlCampaign.chapters;

    expect(
      isChapterUnlocked(sqlCampaign, firstChapter, initialPlayer)
    ).toBe(true);
    expect(
      isChapterUnlocked(sqlCampaign, secondChapter, initialPlayer)
    ).toBe(false);
  });

  it("unlocks a chapter after the previous chapter is completed", () => {
    const [firstChapter, secondChapter] = sqlCampaign.chapters;
    const player = firstChapter.stages.reduce(
      (currentPlayer, stage) => (
        completeStage(currentPlayer, stage.id, stage.reward)
      ),
      initialPlayer
    );

    expect(
      isChapterUnlocked(sqlCampaign, secondChapter, player)
    ).toBe(true);
  });

  it("marks only the next available stage as current", () => {
    const [firstChapter] = sqlCampaign.chapters;
    const [firstStage, secondStage, thirdStage] = firstChapter.stages;

    const player = completeStage(
      initialPlayer,
      firstStage.id,
      firstStage.reward
    );

    expect(
      getStageProgressStatus(firstChapter, firstStage, player)
    ).toBe("completed");
    expect(
      getStageProgressStatus(firstChapter, secondStage, player)
    ).toBe("current");
    expect(
      getStageProgressStatus(firstChapter, thirdStage, player)
    ).toBe("locked");
  });
});
