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

  it("accepts equivalent Java formatting without requiring exact spaces", () => {
    expect(
      validateAnswer(
        "if (nota >= 7) {\n  System.out.println(\"Aprovado\");\n} else {\n  System.out.println(\"Reprovado\");\n}",
        "if (nota >= 7) { System.out.println(\"Aprovado\"); } else { System.out.println(\"Reprovado\"); }"
      ).success
    ).toBe(true);

    expect(
      validateAnswer(
        "String nome=\"Ana\";\nint nivel=5;\nSystem.out.println(nome + \" chegou ao nivel \" + nivel);",
        "String nome = \"Ana\"; int nivel = 5; System.out.println(nome + \" chegou ao nivel \" + nivel);"
      ).success
    ).toBe(true);
  });

  it("gives useful Java feedback without giving the answer away", () => {
    expect(
      validateAnswer(
        "if (nota = 7) { System.out.println(\"Aprovado\"); }",
        "if (nota == 7) { System.out.println(\"Aprovado\"); }"
      ).message
    ).toContain("comparacao usa ==");

    expect(
      validateAnswer(
        "if (nome == \"Ana\") { System.out.println(\"Ok\"); }",
        "if (nome.equals(\"Ana\")) { System.out.println(\"Ok\"); }"
      ).message
    ).toContain("String");

    expect(
      validateAnswer(
        "int idade = 18",
        "int idade = 18;"
      ).message
    ).toContain("ponto e virgula");
  });
});
