import { campaigns } from "@/data/campaigns";

export function getStageNavigation(stageId: string) {
  for (const campaign of campaigns) {
    const sortedChapters = [...campaign.chapters].sort(
      (left, right) => left.order - right.order
    );
    const campaignStages = sortedChapters.flatMap((chapter) => (
      [...chapter.stages].sort(
        (left, right) => left.order - right.order
      ).map((stage) => ({
        chapter,
        stage,
      }))
    ));

    const stageIndex = campaignStages.findIndex(
      (item) => item.stage.id === stageId
    );

    if (stageIndex >= 0) {
      const current = campaignStages[stageIndex];

      if (current) {
        return {
          campaignId: campaign.id,
          chapterId: current.chapter.id,
          nextStageId: campaignStages[stageIndex + 1]?.stage.id,
        };
      }
    }
  }

  return undefined;
}
