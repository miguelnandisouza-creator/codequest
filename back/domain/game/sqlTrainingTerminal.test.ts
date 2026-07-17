import { describe, expect, it } from "vitest";

import { sqlCampaign } from "@/data/campaigns/sql";

import { getTrainingSchema, runSelectQuery } from "./sqlTrainingTerminal";

const courseQueries = Array.from(new Set(
  sqlCampaign.chapters.flatMap((chapter) => (
    chapter.stages.flatMap((stage) => (
      stage.content.flatMap((content) => (
        content.type === "challenge" || content.type === "boss"
          ? [content.expectedAnswer]
          : []
      ))
    ))
  ))
));

describe("sqlTrainingTerminal", () => {
  it("exposes the schema used by the SQL course", () => {
    expect(getTrainingSchema()).toEqual(expect.arrayContaining([
      expect.objectContaining({ name: "clientes", columns: expect.arrayContaining(["id", "nome", "cidade", "email"]) }),
      expect.objectContaining({ name: "produtos", columns: expect.arrayContaining(["id", "nome", "categoria", "preco", "estoque"]) }),
      expect.objectContaining({ name: "pedidos", columns: expect.arrayContaining(["id", "cliente_id", "produto_id", "quantidade", "data"]) }),
    ]));
  });

  it.each(courseQueries)("runs course query: %s", (query) => {
    const result = runSelectQuery(query);

    expect("error" in result ? result.error : "").toBe("");
    expect("rows" in result ? result.rows.length : 0).toBeGreaterThan(0);
  });

  it("returns useful errors for unknown columns", () => {
    const result = runSelectQuery("SELECT misterio FROM clientes;");

    expect(result).toEqual({
      error: expect.stringContaining("misterio"),
    });
  });
});
