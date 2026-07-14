import { Chapter } from "@/domain/entities/chapter";
import { zeroToBasicsStages } from "../stages/curriculum";

export const chapter1: Chapter = {
  id: "sql-chapter-1",
  campaignId: "sql",
  title: "Modulo 1: A Vila dos Dados",
  description:
    "Comece do zero, entenda tabelas e escreva suas primeiras consultas.",
  order: 1,
  unlocked: true,
  stages: zeroToBasicsStages,
};
