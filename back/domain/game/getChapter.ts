import { campaigns } from "@/data/campaigns";
import { Chapter } from "@/domain/entities/chapter";

export function getChapter(id: string) {
  for (const campaign of campaigns) {
    const chapter = campaign.chapters.find(
      (chapter: Chapter) => chapter.id === id
    );
    if (chapter) {
      return chapter;
    }
  }

  return undefined;
}
