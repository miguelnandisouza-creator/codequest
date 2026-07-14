import { Chapter } from "@/domain/entities/chapter";
import { advancedStages } from "../stages/curriculum";

export const chapter5: Chapter = {
  id: "sql-chapter-5",
  campaignId: "sql",
  title: "Modulo 5: A Fortaleza das Relacoes",
  description:
    "Conecte informacoes espalhadas em varias tabelas com JOINs e subqueries.",
  order: 5,
  unlocked: true,
  stages: advancedStages,
};
