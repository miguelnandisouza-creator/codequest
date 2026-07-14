import { campaigns } from "@/data/campaigns";
import { Stage } from "@/domain/entities/stage";

export function getStage(id: string) {
  for (const campaign of campaigns) {
    for (const chapter of campaign.chapters) {
      const stage = chapter.stages.find(
        (stage: Stage) => stage.id === id
      );

      if (stage) {
        return stage;
      }
    }
  }

  return undefined;
}
