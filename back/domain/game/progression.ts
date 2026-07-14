import { Campaign } from "@/domain/entities/campaign";
import { Chapter } from "@/domain/entities/chapter";
import { Player } from "@/domain/entities/player";
import { Stage } from "@/domain/entities/stage";
import { hasCompletedStage } from "@/domain/game/playerProgress";

export type StageProgressStatus =
  | "completed"
  | "current"
  | "locked";

export function isChapterCompleted(chapter: Chapter, player: Player) {
  return chapter.stages.every((stage) => (
    hasCompletedStage(player, stage.id)
  ));
}

export function isChapterUnlocked(
  campaign: Campaign,
  chapter: Chapter,
  player: Player
) {
  if (!chapter.unlocked) {
    return false;
  }

  const sortedChapters = getSortedChapters(campaign);
  const chapterIndex = sortedChapters.findIndex(
    (item) => item.id === chapter.id
  );

  if (chapterIndex <= 0) {
    return true;
  }

  return isChapterCompleted(
    sortedChapters[chapterIndex - 1],
    player
  );
}

export function getStageProgressStatus(
  chapter: Chapter,
  stage: Stage,
  player: Player
): StageProgressStatus {
  if (hasCompletedStage(player, stage.id)) {
    return "completed";
  }

  const sortedStages = getSortedStages(chapter);
  const stageIndex = sortedStages.findIndex(
    (item) => item.id === stage.id
  );

  if (stageIndex === 0) {
    return "current";
  }

  const previousStage = sortedStages[stageIndex - 1];

  if (previousStage && hasCompletedStage(player, previousStage.id)) {
    return "current";
  }

  return "locked";
}

export function getSortedChapters(campaign: Campaign) {
  return [...campaign.chapters].sort(
    (left, right) => left.order - right.order
  );
}

export function getSortedStages(chapter: Chapter) {
  return [...chapter.stages].sort(
    (left, right) => left.order - right.order
  );
}
