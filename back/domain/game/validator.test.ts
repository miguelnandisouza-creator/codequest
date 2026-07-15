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

  it("accepts optional spaces around commas and operators", () => {
    expect(
      validateAnswer(
        "select nome, email from clientes where idade >= 18",
        "select nome,email from clientes where idade>=18"
      ).success
    ).toBe(true);
  });

  it("accepts equivalent select column order", () => {
    expect(
      validateAnswer(
        "select email, nome from clientes",
        "select nome,email from clientes"
      ).success
    ).toBe(true);
  });

  it("accepts equivalent AND condition order", () => {
    expect(
      validateAnswer(
        "select * from produtos where preco < 30 and categoria = 'alimentos'",
        "select * from produtos where categoria = 'alimentos' and preco < 30"
      ).success
    ).toBe(true);
  });

  it("accepts common SQL spelling variations", () => {
    expect(
      validateAnswer(
        "select * from clientes order by nome asc",
        "select * from clientes order by nome"
      ).success
    ).toBe(true);

    expect(
      validateAnswer(
        "select produtos.nome,pedidos.quantidade from pedidos join produtos on pedidos.produto_id=produtos.id",
        "select produtos.nome, pedidos.quantidade from pedidos inner join produtos on pedidos.produto_id = produtos.id"
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

  it("explains when the table is wrong", () => {
    const message = validateAnswer(
      "select * from pedidos",
      "select * from clientes"
    ).message;

    expect(message).toContain("tabela");
    expect(message).not.toContain("clientes");
  });

  it("explains missing columns without giving the answer away", () => {
    const message = validateAnswer(
      "select nome from clientes",
      "select nome,email from clientes"
    ).message;

    expect(message).toContain("Faltou coluna");
    expect(message).not.toContain("email");
  });

  it("explains missing clauses without giving exact values away", () => {
    expect(
      validateAnswer(
        "select * from produtos",
        "select * from produtos where estoque < 10"
      ).message
    ).toContain("WHERE");

    expect(
      validateAnswer(
        "select * from pedidos",
        "select * from pedidos limit 5"
      ).message
    ).toBe("Faltou usar LIMIT.");

    expect(
      validateAnswer(
        "select * from clientes",
        "select * from clientes order by nome"
      ).message
    ).toContain("ORDER BY");

  });
});
