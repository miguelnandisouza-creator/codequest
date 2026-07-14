import { Chapter } from "@/domain/entities/chapter";
import { intermediateStages } from "../stages/curriculum";

export const chapter3: Chapter = {
  id: "sql-chapter-3",
  campaignId: "sql",
  title: "Modulo 3: O Mercado dos Produtos",
  description:
    "Organize e pagine resultados com ORDER BY, LIMIT e OFFSET.",
  order: 3,
  unlocked: true,
  stages: intermediateStages,
};
