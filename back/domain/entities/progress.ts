export type Progress = {
  campaignId: string;
  chapterId: string;
  stageId: string;

  completedStages: string[];

  totalXP: number;

  level: number;
};