import { Stage } from "@/domain/entities/stage";

export type Chapter = {
  id: string;

  campaignId: string;

  title: string;

  description: string;

  order: number;

  stages: Stage[];

  unlocked: boolean;
};
