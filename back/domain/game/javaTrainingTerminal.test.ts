import { describe, expect, it } from "vitest";

import { runJavaSnippet } from "./javaTrainingTerminal";

describe("runJavaSnippet", () => {
  it("runs variables and println", () => {
    const result = runJavaSnippet([
      "String nome = \"Ana\";",
      "int nivel = 3;",
      "System.out.println(nome + \" nivel \" + nivel);",
    ].join("\n"));

    expect(result).not.toHaveProperty("error");
    expect("output" in result ? result.output : []).toEqual(["Ana nivel 3"]);
  });

  it("runs if and else blocks", () => {
    const result = runJavaSnippet([
      "int idade = 17;",
      "if (idade >= 18) {",
      "  System.out.println(\"Maior\");",
      "} else {",
      "  System.out.println(\"Menor\");",
      "}",
    ].join("\n"));

    expect(result).not.toHaveProperty("error");
    expect("output" in result ? result.output : []).toEqual(["Menor"]);
  });

  it("runs for loops with counters", () => {
    const result = runJavaSnippet("for (int i = 1; i <= 3; i++) { System.out.println(i); }");

    expect(result).not.toHaveProperty("error");
    expect("output" in result ? result.output : []).toEqual(["1", "2", "3"]);
  });

  it("runs arrays and for-each loops", () => {
    const result = runJavaSnippet([
      "int[] notas = {8, 7, 10};",
      "int total = 0;",
      "for (int nota : notas) { total += nota; }",
      "System.out.println(total);",
      "System.out.println(notas.length);",
    ].join("\n"));

    expect(result).not.toHaveProperty("error");
    expect("output" in result ? result.output : []).toEqual(["25", "3"]);
  });

  it("runs ArrayList add/get/size and String helpers", () => {
    const result = runJavaSnippet([
      "ArrayList<String> nomes = new ArrayList<>();",
      "nomes.add(\" Ana \");",
      "String nome = nomes.get(0).trim().toLowerCase();",
      "System.out.println(nome);",
      "System.out.println(nomes.size());",
      "System.out.println(nome.contains(\"an\"));",
    ].join("\n"));

    expect(result).not.toHaveProperty("error");
    expect("output" in result ? result.output : []).toEqual(["ana", "1", "true"]);
  });
});
