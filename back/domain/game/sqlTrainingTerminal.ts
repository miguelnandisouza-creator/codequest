export type Cell = string | number;
export type DataRow = Record<string, Cell>;

export type TerminalResult = {
  columns: string[];
  rows: DataRow[];
  message: string;
};

export const sampleTables: Record<string, DataRow[]> = {
  clientes: [
    { id: 1, nome: "Ana", cidade: "Sao Paulo", email: "ana@email.com", idade: 28, pontos: 140 },
    { id: 2, nome: "Biel", cidade: "Curitiba", email: "biel@email.com", idade: 19, pontos: 90 },
    { id: 3, nome: "Tin", cidade: "Rio de Janeiro", email: "tin@email.com", idade: 35, pontos: 220 },
    { id: 4, nome: "Tio Ed", cidade: "Sao Paulo", email: "ed@email.com", idade: 42, pontos: 310 },
    { id: 5, nome: "Amanda", cidade: "Recife", email: "amanda@email.com", idade: 31, pontos: 185 },
    { id: 6, nome: "Caio", cidade: "Curitiba", email: "caio@email.com", idade: 24, pontos: 70 },
    { id: 7, nome: "Laura", cidade: "Sao Paulo", email: "laura@email.com", idade: 27, pontos: 260 },
    { id: 8, nome: "Rafa", cidade: "Recife", email: "rafa@email.com", idade: 22, pontos: 115 },
  ],
  pedidos: [
    { id: 1, cliente_id: 1, produto_id: 1, quantidade: 12, total: 180, status: "pago", data: "2026-01-05" },
    { id: 2, cliente_id: 2, produto_id: 2, quantidade: 1, total: 80, status: "pendente", data: "2026-01-07" },
    { id: 3, cliente_id: 1, produto_id: 4, quantidade: 2, total: 240, status: "pago", data: "2026-01-10" },
    { id: 4, cliente_id: 3, produto_id: 3, quantidade: 3, total: 105, status: "cancelado", data: "2026-01-12" },
    { id: 5, cliente_id: 2, produto_id: 5, quantidade: 8, total: 200, status: "pago", data: "2026-01-15" },
    { id: 6, cliente_id: 2, produto_id: 7, quantidade: 5, total: 300, status: "pago", data: "2026-01-18" },
    { id: 7, cliente_id: 2, produto_id: 8, quantidade: 2, total: 180, status: "pago", data: "2026-01-21" },
    { id: 8, cliente_id: 2, produto_id: 1, quantidade: 9, total: 135, status: "pendente", data: "2026-01-24" },
    { id: 9, cliente_id: 5, produto_id: 6, quantidade: 55, total: 1100, status: "pago", data: "2026-02-02" },
    { id: 10, cliente_id: 7, produto_id: 2, quantidade: 4, total: 320, status: "pago", data: "2026-02-05" },
  ],
  produtos: [
    { id: 1, nome: "Pocao", categoria: "alimentos", preco: 15, estoque: 8 },
    { id: 2, nome: "Cristal", categoria: "eletronicos", preco: 80, estoque: 14 },
    { id: 3, nome: "Mapa", categoria: "aventura", preco: 35, estoque: 6 },
    { id: 4, nome: "Lanterna", categoria: "eletronicos", preco: 120, estoque: 4 },
    { id: 5, nome: "Racao", categoria: "alimentos", preco: 25, estoque: 18 },
    { id: 6, nome: "Pergaminho", categoria: "livros", preco: 20, estoque: 22 },
    { id: 7, nome: "Radio", categoria: "eletronicos", preco: 60, estoque: 9 },
    { id: 8, nome: "Sensor", categoria: "eletronicos", preco: 90, estoque: 3 },
    { id: 9, nome: "Biscoito", categoria: "alimentos", preco: 12, estoque: 30 },
    { id: 10, nome: "Caderno", categoria: "livros", preco: 28, estoque: 17 },
  ],
  usuarios: [
    { id: 1, nome: "Ala", cidade: "Sao Paulo", email: "ala@gmail.com" },
    { id: 2, nome: "Miro", cidade: "Belo Horizonte", email: "miro@gmail.com" },
  ],
};

export function getTrainingSchema() {
  return Object.entries(sampleTables).map(([name, rows]) => ({
    name,
    columns: Object.keys(rows[0] ?? {}),
    rowCount: rows.length,
  }));
}

export function runSelectQuery(query: string): TerminalResult | { error: string } {
  const normalizedQuery = normalizeTerminalQuery(query);
  const clauses = splitTerminalSelect(normalizedQuery);

  if (!clauses) {
    return { error: "Use uma consulta no formato SELECT ... FROM tabela." };
  }

  const source = buildSourceRows(clauses.from);

  if ("error" in source) {
    return source;
  }

  let rows = clauses.where
    ? source.rows.filter((row) => evaluateWhere(row, clauses.where ?? ""))
    : source.rows;

  if (clauses.groupBy) {
    const grouped = buildGroupedResult(rows, clauses.select, clauses.groupBy, clauses.having);
    rows = grouped.rows;
  }

  if (!clauses.groupBy && hasAggregate(clauses.select)) {
    rows = [buildAggregateRow(rows, clauses.select)];
  }

  if (clauses.orderBy) {
    rows = sortRows(rows, clauses.orderBy);
  }

  if (clauses.offset) {
    rows = rows.slice(Number(clauses.offset));
  }

  if (clauses.limit) {
    rows = rows.slice(0, Number(clauses.limit));
  }

  const projected = projectRows(rows, clauses.select, source.defaultColumns);

  if ("error" in projected) {
    return projected;
  }

  return {
    columns: projected.columns,
    rows: projected.rows,
    message: `${projected.rows.length} linha(s) retornada(s).`,
  };
}

function normalizeTerminalQuery(query: string) {
  return query
    .trim()
    .replace(/\s*;\s*$/, "")
    .replace(/["`]/g, "")
    .replace(/\s+/g, " ")
    .replace(/\binner\s+join\b/gi, "join");
}

function splitTerminalSelect(query: string) {
  const match = query.match(/^select\s+(.+?)\s+from\s+(.+)$/i);

  if (!match) {
    return null;
  }

  const [, select, rest] = match;
  const markerPattern = /\s(where|group by|having|order by|limit|offset)\s/gi;
  const markers = [...rest.matchAll(markerPattern)]
    .map((item) => ({
      token: item[1].toLowerCase(),
      index: item.index ?? 0,
      length: item[0].length,
    }))
    .sort((left, right) => left.index - right.index);
  const fromEnd = markers[0]?.index ?? rest.length;
  const clauses: {
    select: string;
    from: string;
    where?: string;
    groupBy?: string;
    having?: string;
    orderBy?: string;
    limit?: string;
    offset?: string;
  } = {
    select,
    from: rest.slice(0, fromEnd).trim(),
  };

  for (let index = 0; index < markers.length; index += 1) {
    const marker = markers[index];
    const next = markers[index + 1];
    const value = rest.slice(marker.index + marker.length, next?.index ?? rest.length).trim();

    if (marker.token === "group by") clauses.groupBy = value;
    else if (marker.token === "order by") clauses.orderBy = value;
    else clauses[marker.token as "where" | "having" | "limit" | "offset"] = value;
  }

  return clauses;
}

function buildSourceRows(fromClause: string): { rows: DataRow[]; defaultColumns: string[] } | { error: string } {
  const baseMatch = fromClause.match(/^([a-z_][\w]*)(.*)$/i);

  if (!baseMatch) {
    return { error: "FROM precisa comecar com o nome de uma tabela." };
  }

  const baseTableName = baseMatch[1].toLowerCase();
  const baseTable = sampleTables[baseTableName];

  if (!baseTable) {
    return { error: `Tabela "${baseTableName}" nao existe neste banco de treino.` };
  }

  let rows = baseTable.map((row) => qualifyRow(baseTableName, row));
  const defaultColumns = Object.keys(baseTable[0] ?? {});
  const joinPattern = /\s(left\s+join|join)\s+([a-z_][\w]*)\s+on\s+([a-z_][\w]*\.[a-z_][\w]*)\s*=\s*([a-z_][\w]*\.[a-z_][\w]*)/gi;

  for (const join of baseMatch[2].matchAll(joinPattern)) {
    const joinType = join[1].toLowerCase();
    const joinTableName = join[2].toLowerCase();
    const leftKey = join[3].toLowerCase();
    const rightKey = join[4].toLowerCase();
    const joinTable = sampleTables[joinTableName];

    if (!joinTable) {
      return { error: `Tabela "${joinTableName}" nao existe neste banco de treino.` };
    }

    const qualifiedJoinRows = joinTable.map((row) => qualifyRow(joinTableName, row));
    const nextRows: DataRow[] = [];

    for (const row of rows) {
      const matches = qualifiedJoinRows.filter((joinRow) => row[leftKey] === joinRow[rightKey]);

      if (matches.length === 0 && joinType.startsWith("left")) {
        nextRows.push(row);
      } else {
        nextRows.push(...matches.map((match) => ({ ...row, ...match })));
      }
    }

    rows = nextRows;
  }

  return { rows, defaultColumns };
}

function qualifyRow(tableName: string, row: DataRow) {
  return Object.fromEntries([
    ...Object.entries(row),
    ...Object.entries(row).map(([key, value]) => [`${tableName}.${key}`, value]),
  ]);
}

function projectRows(
  rows: DataRow[],
  selectClause: string,
  defaultColumns: string[]
): { columns: string[]; rows: DataRow[] } | { error: string } {
  if (selectClause.trim() === "*") {
    return {
      columns: defaultColumns,
      rows: rows.map((row) => Object.fromEntries(defaultColumns.map((column) => [column, row[column] ?? ""]))),
    };
  }

  const expressions = splitComma(selectClause);
  const columns = expressions.map((expression) => expression.trim());
  const projectedRows = rows.map((row) => Object.fromEntries(
    columns.map((column) => [column, evaluateExpression(row, column)])
  ));
  const invalidColumn = columns.find((column) => projectedRows.every((row) => row[column] === undefined));

  if (invalidColumn) {
    return { error: `Coluna ou expressao "${invalidColumn}" nao existe neste banco de treino.` };
  }

  return {
    columns,
    rows: projectedRows.map((row) => Object.fromEntries(
      Object.entries(row).map(([key, value]) => [key, value ?? ""])
    )),
  };
}

function evaluateWhere(row: DataRow, whereClause: string): boolean {
  const orParts = splitLogical(whereClause, "or");

  if (orParts.length > 1) {
    return orParts.some((part) => evaluateWhere(row, part));
  }

  const betweenMatch = whereClause.match(/^(.+?)\s+between\s+(.+?)\s+and\s+(.+)$/i);

  if (betweenMatch) {
    const value = Number(evaluateExpression(row, betweenMatch[1]));
    const start = Number(parseLiteral(betweenMatch[2]));
    const end = Number(parseLiteral(betweenMatch[3]));

    return value >= start && value <= end;
  }

  const andParts = splitLogical(whereClause, "and");

  if (andParts.length > 1) {
    return andParts.every((part) => evaluateWhere(row, part));
  }

  const likeMatch = whereClause.match(/^(.+?)\s+like\s+'(.+)'$/i);

  if (likeMatch) {
    const value = String(evaluateExpression(row, likeMatch[1]));
    const pattern = likeMatch[2].replaceAll("%", ".*");

    return new RegExp(`^${pattern}$`, "i").test(value);
  }

  const inMatch = whereClause.match(/^(.+?)\s+in\s+\(select\s+(.+?)\s+from\s+([a-z_][\w]*)\)$/i);

  if (inMatch) {
    const [, column, subColumn, tableName] = inMatch;
    const table = sampleTables[tableName.toLowerCase()] ?? [];
    const values = table.map((item) => item[subColumn.trim()]);
    const current = evaluateExpression(row, column);

    return current !== undefined && values.includes(current);
  }

  const compareMatch = whereClause.match(/^(.+?)\s*(=|!=|<>|>=|<=|>|<)\s*(.+)$/i);

  if (!compareMatch) {
    return false;
  }

  return compareValue(
    evaluateExpression(row, compareMatch[1]),
    compareMatch[2],
    parseLiteral(compareMatch[3])
  );
}

function buildGroupedResult(
  rows: DataRow[],
  selectClause: string,
  groupByClause: string,
  havingClause?: string
) {
  const groupColumns = splitComma(groupByClause);
  const groups = new Map<string, DataRow[]>();

  for (const row of rows) {
    const key = groupColumns.map((column) => String(evaluateExpression(row, column))).join("|");
    groups.set(key, [...(groups.get(key) ?? []), row]);
  }

  let groupedRows = [...groups.values()].map((groupRows) => {
    const first = groupRows[0];
    const row: DataRow = {};

    for (const column of groupColumns) {
      row[column] = evaluateExpression(first, column) ?? "";
    }

    for (const expression of splitComma(selectClause)) {
      row[expression] = hasAggregate(expression)
        ? evaluateAggregate(groupRows, expression)
        : evaluateExpression(first, expression) ?? "";
    }

    return row;
  });

  if (havingClause) {
    groupedRows = groupedRows.filter((row) => evaluateHaving(row, havingClause));
  }

  return { rows: groupedRows };
}

function buildAggregateRow(rows: DataRow[], selectClause: string) {
  return Object.fromEntries(splitComma(selectClause).map((expression) => [
    expression,
    evaluateAggregate(rows, expression),
  ]));
}

function evaluateHaving(row: DataRow, havingClause: string) {
  const match = havingClause.match(/^(.+?)\s*(=|!=|<>|>=|<=|>|<)\s*(.+)$/i);

  if (!match) {
    return false;
  }

  return compareValue(row[match[1].trim()], match[2], parseLiteral(match[3]));
}

function evaluateAggregate(rows: DataRow[], expression: string): Cell {
  const normalized = expression.trim();
  const aggregateMatch = normalized.match(/^(count|sum|avg)\((.+)\)$/i);

  if (!aggregateMatch) {
    return evaluateExpression(rows[0] ?? {}, normalized) ?? "";
  }

  const fn = aggregateMatch[1].toLowerCase();
  const inner = aggregateMatch[2].trim();

  if (fn === "count") {
    return rows.length;
  }

  const values = rows.map((row) => Number(evaluateExpression(row, inner))).filter((value) => !Number.isNaN(value));
  const sum = values.reduce((total, value) => total + value, 0);

  return fn === "avg" ? Number((sum / Math.max(values.length, 1)).toFixed(2)) : sum;
}

function sortRows(rows: DataRow[], orderByClause: string) {
  const [expression, direction = ""] = orderByClause.trim().split(/\s+(asc|desc)$/i);
  const sortedRows = [...rows].sort((left, right) => compareForSort(
    evaluateExpression(left, expression),
    evaluateExpression(right, expression)
  ));

  return direction.toLowerCase() === "desc" ? sortedRows.reverse() : sortedRows;
}

function evaluateExpression(row: DataRow, expression: string): Cell | undefined {
  const cleanExpression = expression.trim();

  if (cleanExpression.includes("*") && !cleanExpression.includes("count(")) {
    return cleanExpression
      .split("*")
      .map((part) => Number(evaluateExpression(row, part)))
      .reduce((total, value) => total * value, 1);
  }

  if (row[cleanExpression] !== undefined) {
    return row[cleanExpression];
  }

  const lowerKey = Object.keys(row).find((key) => key.toLowerCase() === cleanExpression.toLowerCase());

  if (lowerKey) {
    return row[lowerKey];
  }

  if (/^'.*'$/.test(cleanExpression) || !Number.isNaN(Number(cleanExpression))) {
    return parseLiteral(cleanExpression);
  }

  return undefined;
}

function parseLiteral(value: string): Cell {
  const trimmed = value.trim().replace(/^'|'$/g, "");
  const numeric = Number(trimmed);

  return Number.isNaN(numeric) ? trimmed : numeric;
}

function compareValue(current: Cell | undefined, operator: string, expected: Cell) {
  if (operator === "=") return current === expected;
  if (operator === "!=" || operator === "<>") return current !== expected;
  if (typeof current !== typeof expected) return false;

  if (typeof current === "string" && typeof expected === "string") {
    const comparison = current.localeCompare(expected, "pt-BR");

    if (operator === ">") return comparison > 0;
    if (operator === "<") return comparison < 0;
    if (operator === ">=") return comparison >= 0;
    if (operator === "<=") return comparison <= 0;

    return false;
  }

  if (typeof current !== "number" || typeof expected !== "number") return false;
  if (operator === ">") return current > expected;
  if (operator === "<") return current < expected;
  if (operator === ">=") return current >= expected;
  if (operator === "<=") return current <= expected;

  return false;
}

function compareForSort(left: Cell | undefined, right: Cell | undefined) {
  if (typeof left === "number" && typeof right === "number") {
    return left - right;
  }

  return String(left ?? "").localeCompare(String(right ?? ""), "pt-BR");
}

function splitLogical(value: string, operator: "and" | "or") {
  return value.split(new RegExp(`\\s+${operator}\\s+`, "i")).map((part) => part.trim()).filter(Boolean);
}

function splitComma(value: string) {
  return value.split(",").map((item) => item.trim()).filter(Boolean);
}

function hasAggregate(value: string) {
  return /\b(count|sum|avg)\s*\(/i.test(value);
}
