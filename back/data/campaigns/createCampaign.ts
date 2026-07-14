import { Campaign } from "@/domain/entities/campaign";
import { Chapter } from "@/domain/entities/chapter";
import { Stage, StageContent, StageType } from "@/domain/entities/stage";

type CampaignConfig = {
  id: string;
  title: string;
  description: string;
  icon: string;
  color: string;
  mentor: string;
  language: string;
  chapters: Array<{
    id: string;
    title: string;
    description: string;
    order: number;
    stages: StageConfig[];
  }>;
};

type StageConfig = {
  id: string;
  order: number;
  title: string;
  description: string;
  type: StageType;
  xp: number;
  coins: number;
  content: StageContent[];
};

export function createCampaign(config: CampaignConfig): Campaign {
  return {
    id: config.id,
    title: config.title,
    description: config.description,
    icon: config.icon,
    color: config.color,
    mentor: config.mentor,
    chapters: config.chapters.map((chapter): Chapter => ({
      id: chapter.id,
      campaignId: config.id,
      title: chapter.title,
      description: chapter.description,
      order: chapter.order,
      unlocked: true,
      stages: chapter.stages.map((stage): Stage => ({
        id: stage.id,
        campaignId: config.id,
        chapterId: chapter.id,
        order: stage.order,
        title: stage.title,
        description: stage.description,
        type: stage.type,
        language: config.language,
        reward: {
          xp: stage.xp,
          coins: stage.coins,
        },
        content: stage.content,
      })),
    })),
  };
}
