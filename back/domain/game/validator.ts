export type ValidationResult = {
  success: boolean;
  message: string;
};

export function validateAnswer(
  code: string,
  expectedAnswer: string
): ValidationResult {
  if (answersMatch(code, expectedAnswer)) {
    return {
      success: true,
      message: "Resposta correta!",
    };
  }

  const feedback = buildFeedback(code, expectedAnswer);

  return {
    success: false,
    message: feedback,
  };
}

function answersMatch(code: string, expectedAnswer: string) {
  const normalizedCode = normalizeAnswer(code);
  const normalizedExpected = normalizeAnswer(expectedAnswer);

  if (normalizedCode === normalizedExpected) {
    return true;
  }

  if (normalizeSqlText(expectedAnswer).startsWith("select ")) {
    return false;
  }

  return getCodeVariants(code, expectedAnswer).some((codeVariant) => (
    getCodeVariants(expectedAnswer, expectedAnswer).includes(codeVariant)
  ));
}

function buildFeedback(code: string, expectedAnswer: string) {
  const normalizedCode = normalizeSqlText(code);
  const normalizedExpected = normalizeSqlText(expectedAnswer);

  if (!normalizedExpected.startsWith("select ")) {
    return buildCodeFeedback(code, expectedAnswer);
  }

  if (!normalizedCode.startsWith("select")) {
    return "Comece usando SELECT. Essa missao espera uma consulta de leitura.";
  }

  const codeClauses = splitSelectClauses(normalizedCode);
  const expectedClauses = splitSelectClauses(normalizedExpected);

  if (!codeClauses.select) {
    return "Faltou dizer quais colunas voce quer buscar depois do SELECT.";
  }

  if (!codeClauses.from) {
    return "Faltou o FROM com o nome da tabela.";
  }

  if (expectedClauses.from && codeClauses.from !== expectedClauses.from) {
    return "A tabela ou os JOINs estao diferentes do objetivo. Revise a fonte dos dados.";
  }

  const selectFeedback = compareListClause(
    "coluna",
    codeClauses.select,
    expectedClauses.select
  );

  if (selectFeedback) {
    return selectFeedback;
  }

  const whereFeedback = compareClause(
    "WHERE",
    codeClauses.where,
    expectedClauses.where,
    normalizeConditions
  );

  if (whereFeedback) {
    return whereFeedback;
  }

  const groupFeedback = compareListClause(
    "campo do GROUP BY",
    codeClauses.groupBy,
    expectedClauses.groupBy,
    "GROUP BY"
  );

  if (groupFeedback) {
    return groupFeedback;
  }

  const havingFeedback = compareClause(
    "HAVING",
    codeClauses.having,
    expectedClauses.having,
    normalizeConditions
  );

  if (havingFeedback) {
    return havingFeedback;
  }

  const orderFeedback = compareClause(
    "ORDER BY",
    codeClauses.orderBy,
    expectedClauses.orderBy,
    normalizeOrderBy
  );

  if (orderFeedback) {
    return orderFeedback;
  }

  const limitFeedback = compareSimpleClause("LIMIT", codeClauses.limit, expectedClauses.limit);

  if (limitFeedback) {
    return limitFeedback;
  }

  const offsetFeedback = compareSimpleClause("OFFSET", codeClauses.offset, expectedClauses.offset);

  if (offsetFeedback) {
    return offsetFeedback;
  }

  return "A consulta esta quase certa, mas alguma parte ainda nao bate com o objetivo da missao.";
}

function buildCodeFeedback(code: string, expectedAnswer: string) {
  const trimmedCode = code.trim();
  const trimmedExpected = expectedAnswer.trim();
  const codeTokens = tokenizeCode(trimmedCode);
  const expectedTokens = tokenizeCode(trimmedExpected);

  if (!trimmedCode) {
    return "Escreva sua tentativa antes de executar. Comece pela estrutura pedida no objetivo.";
  }

  if (hasUnbalanced(trimmedCode, "{", "}")) {
    return "Tem chave abrindo ou fechando fora de par. Confira os blocos com { }.";
  }

  if (hasUnbalanced(trimmedCode, "(", ")")) {
    return "Tem parenteses abrindo ou fechando fora de par. Confira condicoes e chamadas de metodo.";
  }

  if (
    /(?:^|[^=!<>])=([^=]|$)/.test(trimmedCode) &&
    (expectedTokens.includes("==") || expectedTokens.includes("===")) &&
    !codeTokens.includes("==") &&
    !codeTokens.includes("===")
  ) {
    return "Parece que voce atribuiu com = onde precisava comparar. Em comparacao usa == ou === conforme a linguagem.";
  }

  if (
    expectedTokens.includes("equals") &&
    !codeTokens.includes("equals") &&
    trimmedCode.includes("==")
  ) {
    return "Para comparar conteudo de String, use equals em vez de ==.";
  }

  if (expectedTokens.includes("system") && !codeTokens.includes("system")) {
    return "Essa missao espera uma saida no terminal. Use System.out.print ou System.out.println.";
  }

  if (
    expectedTokens.includes("console") &&
    expectedTokens.includes("writeline") &&
    (!codeTokens.includes("console") || !codeTokens.includes("writeline"))
  ) {
    return "Essa missao espera uma saida no terminal. Use Console.WriteLine com o valor pedido.";
  }

  if (expectedTokens.includes("console") && !codeTokens.includes("console")) {
    return "Essa missao espera uma saida no console. Use console.log com o valor pedido.";
  }

  if (expectedTokens.includes("print") && !codeTokens.includes("print")) {
    return "Essa missao espera uma saida no terminal. Use print com o valor pedido.";
  }

  if (expectedTokens.includes("=>") && !codeTokens.includes("=>")) {
    return "Essa missao espera uma arrow function. Use => para declarar o callback ou funcao curta.";
  }

  if (expectedTokens.includes("await") && !codeTokens.includes("await")) {
    return "Essa missao precisa esperar uma Promise ou tarefa assincrona. Use await no ponto indicado.";
  }

  if (expectedTokens.includes(";") && !codeTokens.includes(";")) {
    return "Faltou ponto e virgula em alguma instrucao simples.";
  }

  if (expectedTokens.includes("if") && !codeTokens.includes("if")) {
    return "Essa missao precisa de uma decisao. Monte um if com condicao e bloco.";
  }

  if (expectedTokens.includes("else") && !codeTokens.includes("else")) {
    return "Faltou tratar o caminho alternativo com else.";
  }

  if (expectedTokens.includes("for") && !codeTokens.includes("for")) {
    return "Essa missao precisa de repeticao com for. Confira inicio, condicao e incremento.";
  }

  if (expectedTokens.includes("while") && !codeTokens.includes("while")) {
    return "Essa missao precisa de while. Lembre de mudar a variavel dentro do bloco para evitar loop infinito.";
  }

  if (expectedTokens.includes("return") && !codeTokens.includes("return")) {
    return "O metodo precisa devolver um valor com return.";
  }

  if (expectedTokens.includes("class") && !codeTokens.includes("class")) {
    return "Essa resposta espera uma classe. Comece declarando class e coloque atributos/metodos dentro das chaves.";
  }

  const missingKeyword = expectedTokens.find((token) => (
    isTeachingKeyword(token) && !codeTokens.includes(token)
  ));

  if (missingKeyword) {
    return `Faltou usar ${missingKeyword}. Revise qual conceito a missao esta treinando.`;
  }

  return "Ainda nao esta correto. Revise nomes, tipos, operadores e a ordem das instrucoes pedidas.";
}

function hasUnbalanced(text: string, open: string, close: string) {
  let depth = 0;

  for (const char of text) {
    if (char === open) depth += 1;
    if (char === close) depth -= 1;
    if (depth < 0) return true;
  }

  return depth !== 0;
}

function isTeachingKeyword(token: string) {
  return [
    "int",
    "double",
    "string",
    "boolean",
    "arraylist",
    "private",
    "public",
    "extends",
    "implements",
    "try",
    "catch",
  ].includes(token);
}

function normalizeAnswer(text: string) {
  const normalized = normalizeSqlText(text);

  if (!normalized.startsWith("select ")) {
    return normalizeCodeText(text);
  }

  return normalizeSelectQuery(normalized);
}

function normalizeCodeText(text: string) {
  return tokenizeCode(stripCodeComments(text).trim().replace(/\s*;\s*$/g, ";")).join("|");
}

function getCodeVariants(text: string, expectedAnswer: string) {
  const stripped = stripCodeComments(text).trim();
  const variants = new Set<string>([
    normalizeCodeText(stripped),
  ]);

  if (!tokenizeCode(expectedAnswer).includes(";")) {
    variants.add(tokenizeCode(stripped.replace(/\s*;\s*$/g, "")).join("|"));
  }

  variants.add(normalizeStringQuoteTokens(stripped, expectedAnswer).join("|"));

  const reordered = normalizeIndependentDeclarations(stripped, expectedAnswer);

  if (reordered) {
    variants.add(reordered);
    variants.add(normalizeStringQuoteTokens(reordered.replace(/\|/g, " "), expectedAnswer).join("|"));
  }

  return [...variants];
}

function stripCodeComments(text: string) {
  return text
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/\/\/.*$/gm, "")
    .replace(/#.*$/gm, "");
}

function normalizeStringQuoteTokens(text: string, expectedAnswer: string) {
  const shouldNormalizeQuotes = isLikelyJavaScript(expectedAnswer) || isLikelyPython(expectedAnswer);

  return tokenizeCode(text).map((token) => {
    if (!shouldNormalizeQuotes || !isStringLiteral(token)) {
      return token;
    }

    return `string:${token.slice(1, -1)}`;
  });
}

function isLikelyJavaScript(text: string) {
  const tokens = tokenizeCode(text);

  return tokens.some((token) => [
    "const",
    "let",
    "document",
    "console",
    "function",
    "async",
    "await",
    "=>",
  ].includes(token));
}

function isLikelyPython(text: string) {
  const tokens = tokenizeCode(text);

  return tokens.some((token) => [
    "def",
    "print",
    "input",
    "elif",
    "none",
    "true",
    "false",
    "self",
  ].includes(token)) || /^\s*(for|while|if|try|except|with)\b/m.test(text);
}

function isStringLiteral(token: string) {
  return (
    (token.startsWith("\"") && token.endsWith("\"")) ||
    (token.startsWith("'") && token.endsWith("'"))
  );
}

function normalizeIndependentDeclarations(text: string, expectedAnswer: string) {
  const expectedTokens = tokenizeCode(expectedAnswer);
  const declarationKeywords = getDeclarationKeywords(expectedTokens);

  if (declarationKeywords.length === 0) {
    return "";
  }

  const statements = splitCodeStatements(text);
  const normalizedStatements = statements.map((statement) => tokenizeCode(statement).join("|"));
  const declarationIndexes = normalizedStatements
    .map((statement, index) => ({ statement, index }))
    .filter(({ statement }) => declarationKeywords.some((keyword) => (
      statement.startsWith(`${keyword}|`)
    )));

  if (declarationIndexes.length < 2) {
    return "";
  }

  const declarationIndexSet = new Set(declarationIndexes.map(({ index }) => index));
  const sortedDeclarations = declarationIndexes
    .map(({ statement }) => statement)
    .sort();
  let nextDeclarationIndex = 0;

  return normalizedStatements.map((statement, index) => {
    if (!declarationIndexSet.has(index)) {
      return statement;
    }

    return sortedDeclarations[nextDeclarationIndex++];
  }).join("|;|");
}

function getDeclarationKeywords(tokens: string[]) {
  return [
    "const",
    "let",
    "var",
    "int",
    "double",
    "decimal",
    "string",
    "boolean",
    "bool",
  ].filter((keyword) => tokens.includes(keyword));
}

function splitCodeStatements(text: string) {
  const statements: string[] = [];
  let current = "";
  let depth = 0;
  let quote = "";

  for (let index = 0; index < text.length; index += 1) {
    const char = text[index];
    const previous = text[index - 1];

    current += char;

    if (quote) {
      if (char === quote && previous !== "\\") {
        quote = "";
      }
      continue;
    }

    if (char === "\"" || char === "'" || char === "`") {
      quote = char;
      continue;
    }

    if (char === "{" || char === "(" || char === "[") depth += 1;
    if (char === "}" || char === ")" || char === "]") depth -= 1;

    if (char === ";" && depth === 0) {
      statements.push(current.trim());
      current = "";
    }
  }

  if (current.trim()) {
    statements.push(current.trim());
  }

  return statements;
}

function tokenizeCode(text: string) {
  const tokens = text.match(
    /`(?:\\.|[^`\\])*`|"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'|[A-Za-z_$][\w$]*|\d+(?:\.\d+)?m?|=>|==|!=|<=|>=|\+\+|--|\+=|-=|&&|\|\||[{}()[\];,.:+\-*/%=<>]/g
  ) ?? [];

  return tokens.map((token) => {
    if (token.startsWith("\"") || token.startsWith("'")) {
      return token;
    }

    return token.toLowerCase();
  });
}

function normalizeSqlText(text: string) {
  return text
    .trim()
    .replace(/\s*;\s*$/, "")
    .replace(/["`]/g, "")
    .replace(/\s+/g, " ")
    .replace(/\s*,\s*/g, ",")
    .replace(/\s*\.\s*/g, ".")
    .replace(/\s*\(\s*/g, "(")
    .replace(/\s*\)\s*/g, ")")
    .replace(/\s*(<>|!=|<=|>=|=|<|>|\+|-|\*|\/)\s*/g, "$1")
    .replace(/\binner\s+join\b/g, "join")
    .replace(/\border\s+by\s+(.+?)\s+asc\b/g, "order by $1")
    .toLowerCase()
    .replace(/^select\*from\b/, "select * from");
}

function normalizeSelectQuery(query: string) {
  const clauses = splitSelectClauses(query);

  if (!clauses.select || !clauses.from) {
    return query;
  }

  return [
    `select:${normalizeList(clauses.select, true)}`,
    `from:${clauses.from}`,
    clauses.where ? `where:${normalizeConditions(clauses.where)}` : "",
    clauses.groupBy ? `group:${normalizeList(clauses.groupBy, true)}` : "",
    clauses.having ? `having:${normalizeConditions(clauses.having)}` : "",
    clauses.orderBy ? `order:${normalizeOrderBy(clauses.orderBy)}` : "",
    clauses.limit ? `limit:${clauses.limit}` : "",
    clauses.offset ? `offset:${clauses.offset}` : "",
  ].filter(Boolean).join("|");
}

function splitSelectClauses(query: string) {
  const selectMatch = query.match(/^select\s+(.+?)\s+from\s+(.+)$/);

  if (!selectMatch) {
    return {};
  }

  const clauses: {
    select?: string;
    from?: string;
    where?: string;
    groupBy?: string;
    having?: string;
    orderBy?: string;
    limit?: string;
    offset?: string;
  } = {
    select: selectMatch[1],
  };

  const rest = selectMatch[2];
  const markers = findClauseMarkers(rest);
  const fromEnd = markers[0]?.index ?? rest.length;
  clauses.from = rest.slice(0, fromEnd).trim();

  for (let index = 0; index < markers.length; index += 1) {
    const marker = markers[index];
    const next = markers[index + 1];
    const value = rest.slice(
      marker.index + marker.token.length,
      next?.index ?? rest.length
    ).trim();

    clauses[marker.key] = value;
  }

  return clauses;
}

function findClauseMarkers(text: string) {
  const markers: {
    key: "where" | "groupBy" | "having" | "orderBy" | "limit" | "offset";
    token: string;
    index: number;
  }[] = [];
  const patterns = [
    { key: "where", token: " where " },
    { key: "groupBy", token: " group by " },
    { key: "having", token: " having " },
    { key: "orderBy", token: " order by " },
    { key: "limit", token: " limit " },
    { key: "offset", token: " offset " },
  ] as const;

  for (const pattern of patterns) {
    const index = text.indexOf(pattern.token);

    if (index >= 0) {
      markers.push({ ...pattern, index });
    }
  }

  return markers.sort((left, right) => left.index - right.index);
}

function normalizeList(value: string, sortItems: boolean) {
  const items = splitTopLevel(value, ",")
    .map((item) => item.trim())
    .filter(Boolean);

  return (sortItems ? items.sort() : items).join(",");
}

function normalizeOrderBy(value: string) {
  return splitTopLevel(value, ",")
    .map((item) => item.trim().replace(/\s+asc$/, ""))
    .join(",");
}

function compareListClause(
  label: string,
  current?: string,
  expected?: string,
  clauseName = "SELECT"
) {
  if (!expected) {
    return current ? `Remova o ${clauseName}; essa missao nao precisa dessa parte.` : "";
  }

  if (!current) {
    return `Faltou informar ${label} em ${clauseName}.`;
  }

  const currentItems = normalizeList(current, true).split(",").filter(Boolean);
  const expectedItems = normalizeList(expected, true).split(",").filter(Boolean);
  const missing = expectedItems.filter((item) => !currentItems.includes(item));
  const extra = currentItems.filter((item) => !expectedItems.includes(item));

  if (missing.length > 0) {
    return `Faltou ${label} no ${clauseName}. Revise o que a missao pediu para mostrar.`;
  }

  if (extra.length > 0) {
    return `Tem ${label} sobrando no ${clauseName}. Mostre apenas o que a missao pediu.`;
  }

  return "";
}

function compareClause(
  clauseName: string,
  current: string | undefined,
  expected: string | undefined,
  normalize: (value: string) => string
) {
  if (!expected) {
    return current ? `Remova o ${clauseName}; essa missao nao precisa dessa parte.` : "";
  }

  if (!current) {
    return `Faltou usar ${clauseName}.`;
  }

  if (normalize(current) !== normalize(expected)) {
    return `O ${clauseName} esta diferente do objetivo. Revise a condicao ou a ordem pedida.`;
  }

  return "";
}

function compareSimpleClause(
  clauseName: string,
  current?: string,
  expected?: string
) {
  if (!expected) {
    return current ? `Remova o ${clauseName}; essa missao nao precisa dessa parte.` : "";
  }

  if (!current) {
    return `Faltou usar ${clauseName}.`;
  }

  if (current !== expected) {
    return `O valor do ${clauseName} esta diferente do objetivo.`;
  }

  return "";
}

function normalizeConditions(value: string) {
  const andParts = splitByLogicalOperator(value, "and");

  if (andParts.length > 1 && !andParts.some((part) => /\s+or\s+/.test(part))) {
    return andParts.sort().join(" and ");
  }

  const orParts = splitByLogicalOperator(value, "or");

  if (orParts.length > 1 && !orParts.some((part) => /\s+and\s+/.test(part))) {
    return orParts.sort().join(" or ");
  }

  return value;
}

function splitByLogicalOperator(value: string, operator: "and" | "or") {
  const separator = ` ${operator} `;
  const parts: string[] = [];
  let depth = 0;
  let start = 0;
  let index = 0;

  while (index < value.length) {
    const char = value[index];

    if (char === "(") {
      depth += 1;
    } else if (char === ")") {
      depth -= 1;
    }

    if (depth === 0 && value.slice(index, index + separator.length) === separator) {
      parts.push(value.slice(start, index).trim());
      start = index + separator.length;
      index = start;
      continue;
    }

    index += 1;
  }

  parts.push(value.slice(start).trim());

  return parts.filter(Boolean);
}

function splitTopLevel(value: string, separator: string) {
  const parts: string[] = [];
  let depth = 0;
  let start = 0;

  for (let index = 0; index < value.length; index += 1) {
    const char = value[index];

    if (char === "(") {
      depth += 1;
    } else if (char === ")") {
      depth -= 1;
    }

    if (depth === 0 && char === separator) {
      parts.push(value.slice(start, index));
      start = index + 1;
    }
  }

  parts.push(value.slice(start));

  return parts;
}
