import { Chapter } from "@/domain/entities/chapter";

export type Campaign = {
  id: string;

  title: string;

  description: string;

  icon: string;

  color: string;

  mentor: string;

  chapters: Chapter[];
};
