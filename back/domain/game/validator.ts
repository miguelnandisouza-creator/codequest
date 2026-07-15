export type ValidationResult = {
  success: boolean;
  message: string;
};

export function validateAnswer(
  code: string,
  expectedAnswer: string
): ValidationResult {
  const normalizedCode = normalizeAnswer(code);
  const normalizedExpected = normalizeAnswer(expectedAnswer);

  if (normalizedCode === normalizedExpected) {
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

function buildFeedback(code: string, expectedAnswer: string) {
  const normalizedCode = normalizeSqlText(code);
  const normalizedExpected = normalizeSqlText(expectedAnswer);

  if (!normalizedExpected.startsWith("select ")) {
    return "Ainda nao esta correto. Confira a sintaxe esperada.";
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

function normalizeAnswer(text: string) {
  const normalized = normalizeSqlText(text);

  if (!normalized.startsWith("select ")) {
    return normalized;
  }

  return normalizeSelectQuery(normalized);
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
