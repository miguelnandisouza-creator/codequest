export type JavaValue = string | number | boolean | JavaValue[];

export type JavaTerminalResult = {
  output: string[];
  variables: Record<string, JavaValue>;
  message: string;
};

type JavaEnv = Record<string, JavaValue>;

export function getJavaTrainingGuide() {
  return [
    {
      name: "Saida",
      items: [
        "System.out.println(\"Ola\");",
        "System.out.print(\"sem quebra\");",
      ],
    },
    {
      name: "Variaveis",
      items: [
        "int idade = 20;",
        "double preco = 9.5;",
        "String nome = \"Ana\";",
        "boolean ativo = true;",
      ],
    },
    {
      name: "Decisoes e loops",
      items: [
        "if (idade >= 18) { System.out.println(\"ok\"); }",
        "for (int i = 1; i <= 3; i++) { System.out.println(i); }",
      ],
    },
    {
      name: "Arrays e listas",
      items: [
        "int[] notas = {8, 7, 10};",
        "for (int nota : notas) { System.out.println(nota); }",
        "ArrayList<String> nomes = new ArrayList<>();",
        "nomes.add(\"Ana\");",
      ],
    },
    {
      name: "Strings",
      items: [
        "nome.length()",
        "email.trim().toLowerCase()",
        "senha.contains(\"!\")",
        "perfil.equals(\"admin\")",
      ],
    },
  ];
}

export function getDefaultJavaSnippet() {
  return [
    "String nome = \"Ana\";",
    "int nivel = 2;",
    "System.out.println(nome + \" chegou ao nivel \" + nivel);",
  ].join("\n");
}

export function runJavaSnippet(code: string): JavaTerminalResult | { error: string } {
  const env: JavaEnv = {};
  const output: string[] = [];

  try {
    runBlock(stripJavaShell(code), env, output);
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "Nao consegui executar esse trecho Java.",
    };
  }

  return {
    output,
    variables: env,
    message: `${output.length} linha(s) impressa(s).`,
  };
}

function stripJavaShell(code: string) {
  const withoutComments = code
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/\/\/.*$/gm, "")
    .replace(/^\s*import\s+.+?;\s*/gm, "");
  const mainMatch = withoutComments.match(/public\s+static\s+void\s+main\s*\([^)]*\)\s*\{([\s\S]*)\}\s*$/);

  if (mainMatch) {
    return unwrapLastBrace(mainMatch[1]);
  }

  return withoutComments;
}

function unwrapLastBrace(code: string) {
  let depth = 0;

  for (let index = 0; index < code.length; index += 1) {
    if (code[index] === "{") depth += 1;
    if (code[index] === "}") depth -= 1;

    if (depth < 0) {
      return code.slice(0, index);
    }
  }

  return code;
}

function runBlock(code: string, env: JavaEnv, output: string[]) {
  let remaining = code.trim();
  let guard = 0;

  while (remaining && guard < 400) {
    guard += 1;
    const block = readNextBlock(remaining);

    if (!block.statement.trim()) {
      break;
    }

    executeStatement(block.statement.trim(), env, output);
    remaining = block.rest.trim();
  }

  if (guard >= 400) {
    throw new Error("O terminal parou para evitar loop infinito.");
  }
}

function readNextBlock(code: string) {
  const trimmed = code.trimStart();
  const offset = code.length - trimmed.length;

  if (/^(for|while|if)\b/.test(trimmed)) {
    const firstBrace = trimmed.indexOf("{");

    if (firstBrace < 0) {
      throw new Error("Blocos de if/for/while precisam usar chaves neste terminal.");
    }

    const end = findMatchingBrace(trimmed, firstBrace);
    let statement = trimmed.slice(0, end + 1);
    let rest = trimmed.slice(end + 1);

    if (/^if\b/.test(trimmed) && /^\s*else\b/.test(rest)) {
      const elseText = rest.trimStart();
      const elseBrace = elseText.indexOf("{");

      if (elseBrace < 0) {
        throw new Error("O else precisa usar chaves neste terminal.");
      }

      const elseEnd = findMatchingBrace(elseText, elseBrace);
      statement += " " + elseText.slice(0, elseEnd + 1);
      rest = elseText.slice(elseEnd + 1);
    }

    return { statement, rest };
  }

  const semicolon = findTopLevelSemicolon(trimmed);

  if (semicolon < 0) {
    return { statement: trimmed, rest: "" };
  }

  return {
    statement: code.slice(offset, offset + semicolon + 1),
    rest: code.slice(offset + semicolon + 1),
  };
}

function executeStatement(statement: string, env: JavaEnv, output: string[]) {
  const normalizedStatement = statement.trim();

  if (/^for\b/.test(normalizedStatement)) {
    runFor(normalizedStatement, env, output);
    return;
  }

  if (/^while\b/.test(normalizedStatement)) {
    runWhile(normalizedStatement, env, output);
    return;
  }

  if (/^if\b/.test(normalizedStatement)) {
    runIf(normalizedStatement, env, output);
    return;
  }

  const printMatch = normalizedStatement.match(/^System\.out\.(println|print)\s*\(([\s\S]*)\)\s*;?$/);

  if (printMatch) {
    output.push(formatJavaValue(evaluateExpression(printMatch[2], env)));
    return;
  }

  const arrayDeclaration = normalizedStatement.match(/^(?:final\s+)?(?:int|double|String|boolean|char)\[\]\s+([A-Za-z_$][\w$]*)\s*=\s*\{([\s\S]*?)\}\s*;?$/);

  if (arrayDeclaration) {
    env[arrayDeclaration[1]] = splitTopLevel(arrayDeclaration[2], ",")
      .map((item) => evaluateExpression(item, env));
    return;
  }

  const arrayListDeclaration = normalizedStatement.match(/^ArrayList\s*<\s*(?:Integer|Double|String|Boolean|Character)\s*>\s+([A-Za-z_$][\w$]*)\s*=\s*new\s+ArrayList\s*<\s*>\s*\(\s*\)\s*;?$/);

  if (arrayListDeclaration) {
    env[arrayListDeclaration[1]] = [];
    return;
  }

  const listAdd = normalizedStatement.match(/^([A-Za-z_$][\w$]*)\.add\s*\(([\s\S]+)\)\s*;?$/);

  if (listAdd) {
    const list = getArrayValue(env, listAdd[1]);
    list.push(evaluateExpression(listAdd[2], env));
    return;
  }

  const declaration = normalizedStatement.match(/^(?:final\s+)?(?:int|double|String|boolean|char)\s+([A-Za-z_$][\w$]*)\s*(?:=\s*([\s\S]+?))?\s*;?$/);

  if (declaration) {
    env[declaration[1]] = declaration[2] === undefined
      ? 0
      : evaluateExpression(declaration[2], env);
    return;
  }

  const increment = normalizedStatement.match(/^([A-Za-z_$][\w$]*)\s*(\+\+|--)\s*;?$/);

  if (increment) {
    env[increment[1]] = Number(env[increment[1]] ?? 0) + (increment[2] === "++" ? 1 : -1);
    return;
  }

  const assignment = normalizedStatement.match(/^([A-Za-z_$][\w$]*)\s*([+\-*/%]?=)\s*([\s\S]+?)\s*;?$/);

  if (assignment) {
    const [, name, operator, expression] = assignment;
    const current = Number(env[name] ?? 0);
    const next = evaluateExpression(expression, env);

    if (operator === "=") env[name] = next;
    if (operator === "+=") env[name] = current + Number(next);
    if (operator === "-=") env[name] = current - Number(next);
    if (operator === "*=") env[name] = current * Number(next);
    if (operator === "/=") env[name] = current / Number(next);
    if (operator === "%=") env[name] = current % Number(next);
    return;
  }

  if (/^(class|public\s+class|interface|public\s+interface)\b/.test(normalizedStatement)) {
    output.push("Classe/contrato lido. Para compilar de verdade, use uma IDE Java.");
    return;
  }

  throw new Error("Este terminal treina Java basico: variaveis, print, if, while e for com chaves.");
}

function runFor(statement: string, env: JavaEnv, output: string[]) {
  const eachMatch = statement.match(/^for\s*\(\s*(?:int|double|String|boolean|char|[A-Za-z_$][\w$]*)\s+([A-Za-z_$][\w$]*)\s*:\s*([A-Za-z_$][\w$]*)\s*\)\s*\{([\s\S]*)\}$/);

  if (eachMatch) {
    const [, itemName, sourceName, body] = eachMatch;
    const source = getArrayValue(env, sourceName);

    for (const item of source) {
      env[itemName] = item;
      runBlock(body, env, output);
    }

    return;
  }

  const match = statement.match(/^for\s*\(([^;]+);([^;]+);([^)]+)\)\s*\{([\s\S]*)\}$/);

  if (!match) {
    throw new Error("Use for no formato: for (int i = 1; i <= 3; i++) { ... }");
  }

  executeStatement(match[1] + ";", env, output);

  let guard = 0;
  while (Boolean(evaluateExpression(match[2], env)) && guard < 200) {
    runBlock(match[4], env, output);
    executeStatement(match[3] + ";", env, output);
    guard += 1;
  }

  if (guard >= 200) {
    throw new Error("O for parece infinito. Revise condicao e incremento.");
  }
}

function runWhile(statement: string, env: JavaEnv, output: string[]) {
  const match = statement.match(/^while\s*\(([\s\S]+?)\)\s*\{([\s\S]*)\}$/);

  if (!match) {
    throw new Error("Use while no formato: while (condicao) { ... }");
  }

  let guard = 0;
  while (Boolean(evaluateExpression(match[1], env)) && guard < 200) {
    runBlock(match[2], env, output);
    guard += 1;
  }

  if (guard >= 200) {
    throw new Error("O while parece infinito. Revise a variavel que muda dentro do bloco.");
  }
}

function runIf(statement: string, env: JavaEnv, output: string[]) {
  const match = statement.match(/^if\s*\(([\s\S]+?)\)\s*\{([\s\S]*?)\}(?:\s*else\s*\{([\s\S]*)\})?$/);

  if (!match) {
    throw new Error("Use if/else com chaves: if (condicao) { ... } else { ... }");
  }

  if (Boolean(evaluateExpression(match[1], env))) {
    runBlock(match[2], env, output);
  } else if (match[3]) {
    runBlock(match[3], env, output);
  }
}

function evaluateExpression(expression: string, env: JavaEnv): JavaValue {
  const text = expression.trim().replace(/;$/, "");
  const chainedStringMethod = evaluateChainedStringMethod(text, env);

  if (chainedStringMethod !== null) {
    return chainedStringMethod;
  }

  if (/^".*"$/.test(text)) {
    return text.slice(1, -1);
  }

  if (/^'.*'$/.test(text)) {
    return text.slice(1, -1);
  }

  if (text === "true") return true;
  if (text === "false") return false;

  const arrayAccess = text.match(/^([A-Za-z_$][\w$]*)\s*\[\s*(.+)\s*\]$/);

  if (arrayAccess) {
    const array = getArrayValue(env, arrayAccess[1]);
    const index = Number(evaluateExpression(arrayAccess[2], env));

    return array[index] ?? "";
  }

  const listGet = text.match(/^([A-Za-z_$][\w$]*)\.get\s*\((.+)\)$/);

  if (listGet) {
    const list = getArrayValue(env, listGet[1]);
    const index = Number(evaluateExpression(listGet[2], env));

    return list[index] ?? "";
  }

  const listSize = text.match(/^([A-Za-z_$][\w$]*)\.size\s*\(\s*\)$/);

  if (listSize) {
    return getArrayValue(env, listSize[1]).length;
  }

  const arrayLength = text.match(/^([A-Za-z_$][\w$]*)\.length$/);

  if (arrayLength) {
    return getArrayValue(env, arrayLength[1]).length;
  }

  const equalsMatch = text.match(/^(.+)\.equals\s*\((.+)\)$/);

  if (equalsMatch) {
    return String(evaluateExpression(equalsMatch[1], env)) === String(evaluateExpression(equalsMatch[2], env));
  }

  const ignoreCaseMatch = text.match(/^(.+)\.equalsIgnoreCase\s*\((.+)\)$/);

  if (ignoreCaseMatch) {
    return String(evaluateExpression(ignoreCaseMatch[1], env)).toLowerCase()
      === String(evaluateExpression(ignoreCaseMatch[2], env)).toLowerCase();
  }

  const containsMatch = text.match(/^(.+)\.contains\s*\((.+)\)$/);

  if (containsMatch) {
    return String(evaluateExpression(containsMatch[1], env)).includes(String(evaluateExpression(containsMatch[2], env)));
  }

  const substringMatch = text.match(/^(.+)\.substring\s*\((.+),(.+)\)$/);

  if (substringMatch) {
    return String(evaluateExpression(substringMatch[1], env)).substring(
      Number(evaluateExpression(substringMatch[2], env)),
      Number(evaluateExpression(substringMatch[3], env))
    );
  }

  const trimMatch = text.match(/^(.+)\.trim\s*\(\s*\)$/);

  if (trimMatch) {
    return String(evaluateExpression(trimMatch[1], env)).trim();
  }

  const lowerMatch = text.match(/^(.+)\.toLowerCase\s*\(\s*\)$/);

  if (lowerMatch) {
    return String(evaluateExpression(lowerMatch[1], env)).toLowerCase();
  }

  const upperMatch = text.match(/^(.+)\.toUpperCase\s*\(\s*\)$/);

  if (upperMatch) {
    return String(evaluateExpression(upperMatch[1], env)).toUpperCase();
  }

  const lengthMatch = text.match(/^(.+)\.length\(\)$/);

  if (lengthMatch) {
    return String(evaluateExpression(lengthMatch[1], env)).length;
  }

  const concatParts = splitTopLevel(text, "+");

  if (concatParts.length > 1) {
    const values = concatParts.map((part) => evaluateExpression(part, env));

    if (values.some((value) => typeof value === "string")) {
      return values.join("");
    }

    return values.reduce((sum, value) => Number(sum) + Number(value), 0);
  }

  if (Object.prototype.hasOwnProperty.call(env, text)) {
    return env[text];
  }

  return evaluateNumericOrBoolean(text, env);
}

function evaluateChainedStringMethod(text: string, env: JavaEnv): JavaValue | null {
  const methodMatch = text.match(/^(.+)\.(trim|toLowerCase|toUpperCase|length)\s*\(\s*\)$/);

  if (!methodMatch) {
    return null;
  }

  const [, receiver, method] = methodMatch;
  const value = String(evaluateExpression(receiver, env));

  if (method === "trim") return value.trim();
  if (method === "toLowerCase") return value.toLowerCase();
  if (method === "toUpperCase") return value.toUpperCase();
  if (method === "length") return value.length;

  return null;
}

function evaluateNumericOrBoolean(expression: string, env: JavaEnv) {
  const replaced = expression.replace(/\b[A-Za-z_$][\w$]*\b/g, (name) => {
    if (!Object.prototype.hasOwnProperty.call(env, name)) {
      throw new Error(`Variavel "${name}" ainda nao foi declarada.`);
    }

    const value = env[name];

    if (Array.isArray(value)) {
      throw new Error(`Use indice, length, size() ou for-each para acessar "${name}".`);
    }

    return JSON.stringify(value);
  });

  if (!/^[\d\s+\-*/%().<>=!&|"truefals]+$/.test(replaced)) {
    throw new Error("Expressao fora do treino seguro deste terminal.");
  }

  return Function(`"use strict"; return (${replaced});`)() as JavaValue;
}

function getArrayValue(env: JavaEnv, name: string) {
  const value = env[name];

  if (!Array.isArray(value)) {
    throw new Error(`"${name}" nao e um array/lista declarado neste terminal.`);
  }

  return value;
}

function formatJavaValue(value: JavaValue): string {
  if (Array.isArray(value)) {
    return `[${value.map(formatJavaValue).join(", ")}]`;
  }

  return String(value);
}

function findTopLevelSemicolon(text: string) {
  let depth = 0;
  let inString = false;
  let stringQuote = "";

  for (let index = 0; index < text.length; index += 1) {
    const char = text[index];
    const previous = text[index - 1];

    if ((char === "\"" || char === "'") && previous !== "\\") {
      if (!inString) {
        inString = true;
        stringQuote = char;
      } else if (stringQuote === char) {
        inString = false;
      }
    }

    if (inString) continue;
    if (char === "(" || char === "{") depth += 1;
    if (char === ")" || char === "}") depth -= 1;
    if (char === ";" && depth === 0) return index;
  }

  return -1;
}

function findMatchingBrace(text: string, start: number) {
  let depth = 0;

  for (let index = start; index < text.length; index += 1) {
    if (text[index] === "{") depth += 1;
    if (text[index] === "}") depth -= 1;
    if (depth === 0) return index;
  }

  throw new Error("Faltou fechar uma chave }.");
}

function splitTopLevel(text: string, separator: string) {
  const parts: string[] = [];
  let depth = 0;
  let start = 0;
  let inString = false;
  let stringQuote = "";

  for (let index = 0; index < text.length; index += 1) {
    const char = text[index];
    const previous = text[index - 1];

    if ((char === "\"" || char === "'") && previous !== "\\") {
      if (!inString) {
        inString = true;
        stringQuote = char;
      } else if (stringQuote === char) {
        inString = false;
      }
    }

    if (inString) continue;
    if (char === "(") depth += 1;
    if (char === ")") depth -= 1;

    if (depth === 0 && char === separator) {
      parts.push(text.slice(start, index).trim());
      start = index + 1;
    }
  }

  parts.push(text.slice(start).trim());

  return parts.filter(Boolean);
}
