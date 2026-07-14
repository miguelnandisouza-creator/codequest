import { Chapter } from "@/domain/entities/chapter";
import { basicsToIntermediateStages } from "../stages/curriculum";

export const chapter2: Chapter = {
  id: "sql-chapter-2",
  campaignId: "sql",
  title: "Modulo 2: A Cidade das Consultas",
  description:
    "Aprenda a filtrar dados com WHERE e combinar condicoes.",
  order: 2,
  unlocked: true,
  stages: basicsToIntermediateStages,
};
