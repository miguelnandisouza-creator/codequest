import { describe, expect, it } from "vitest";

import { validateAnswer } from "@/domain/game/validator";

describe("validateAnswer", () => {
  it("accepts the expected answer exactly", () => {
    expect(
      validateAnswer(
        "SELECT * FROM clientes;",
        "SELECT * FROM clientes;"
      ).success
    ).toBe(true);
  });

  it("ignores case, extra whitespace, and the final semicolon", () => {
    expect(
      validateAnswer(
        "  select   *   from   clientes  ; ",
        "SELECT * FROM clientes"
      ).success
    ).toBe(true);
  });

  it("rejects a different answer", () => {
    expect(
      validateAnswer(
        "SELECT nome FROM clientes;",
        "SELECT * FROM clientes;"
      ).success
    ).toBe(false);
  });
});
