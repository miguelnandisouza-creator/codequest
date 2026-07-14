import { Campaign } from "@/domain/entities/campaign";
import { chapter1 } from "./chapters/chapter-1";
import { chapter2 } from "./chapters/chapter-2";
import { chapter3 } from "./chapters/chapter-3";
import { chapter4 } from "./chapters/chapter-4";
import { chapter5 } from "./chapters/chapter-5";

export const sqlCampaign: Campaign = {
  id: "sql",

  title: "Reino SQL",

  description:
    "Aprenda SQL do zero ao avancado explorando um reino movido por dados.",

  icon: "SQL",

  color: "#2563EB",

  mentor: "Byte",

  chapters: [
    chapter1,
    chapter2,
    chapter3,
    chapter4,
    chapter5,
  ],
};
