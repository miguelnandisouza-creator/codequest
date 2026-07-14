import { Chapter } from "@/domain/entities/chapter";
import { intermediateToAdvancedStages } from "../stages/curriculum";

export const chapter4: Chapter = {
  id: "sql-chapter-4",
  campaignId: "sql",
  title: "Modulo 4: O Castelo das Estatisticas",
  description:
    "Resuma dados com agregacoes, GROUP BY e HAVING.",
  order: 4,
  unlocked: true,
  stages: intermediateToAdvancedStages,
};
