import { Stage, StageContent, StageType } from "@/domain/entities/stage";

type StageConfig = {
  id: string;
  chapterId: string;
  order: number;
  title: string;
  description: string;
  type: StageType;
  xp: number;
  coins: number;
  content: StageContent[];
};

function createStage(config: StageConfig): Stage {
  return {
    id: config.id,
    campaignId: "sql",
    chapterId: config.chapterId,
    order: config.order,
    title: config.title,
    description: config.description,
    type: config.type,
    language: "sql",
    reward: {
      xp: config.xp,
      coins: config.coins,
    },
    content: config.content,
  };
}

export const zeroToBasicsStages: Stage[] = [
  createStage({
    id: "sql-village-01-welcome",
    chapterId: "sql-chapter-1",
    order: 1,
    title: "Boas-vindas ao Reino SQL",
    description: "Byte apresenta o Reino SQL e a lojinha de dados.",
    type: "quiz",
    xp: 40,
    coins: 20,
    content: [
      {
        type: "text",
        title: "A chegada na Vila dos Dados",
        content:
          "Voce chegou ao Reino SQL. Aqui, cada cliente, cada produto e cada pedido vive guardado em tabelas, como planilhas gigantes dentro de um cofre. A unica forma de conversar com esse cofre e usando SQL.",
      },
      {
        type: "example",
        title: "A lojinha do reino",
        explanation:
          "Durante a jornada, voce vai consultar sempre a mesma base: clientes, produtos e pedidos.",
        code: "clientes: id, nome, cidade, email\nprodutos: id, nome, preco, categoria, estoque\npedidos: id, cliente_id, produto_id, quantidade, data",
        result: "Tres tabelas formam a lojinha do Reino SQL.",
      },
      {
        type: "quiz",
        title: "Primeira pergunta de Byte",
        question:
          "Para que serve SQL dentro de um banco de dados?",
        options: [
          "Para conversar com tabelas e pedir dados",
          "Para desenhar telas",
          "Para instalar programas",
        ],
        correctAnswer:
          "Para conversar com tabelas e pedir dados",
        explanation:
          "SQL e a linguagem usada para consultar e manipular dados em bancos relacionais.",
      },
    ],
  }),
  createStage({
    id: "sql-village-02-tables",
    chapterId: "sql-chapter-1",
    order: 2,
    title: "O que e uma tabela",
    description: "Entenda linhas, colunas e registros.",
    type: "quiz",
    xp: 45,
    coins: 20,
    content: [
      {
        type: "text",
        title: "O mural da vila",
        content:
          "Byte aponta para um mural com registros de clientes. Uma tabela e organizada em colunas e linhas. Cada coluna descreve um tipo de informacao. Cada linha e um registro completo.",
      },
      {
        type: "example",
        title: "Tabela clientes",
        explanation:
          "Cada linha representa um cliente. Cada coluna guarda uma informacao desse cliente.",
        code: "id | nome  | cidade    | email\n1  | Ana   | Sao Paulo | ana@mail.com\n2  | Bruno | Curitiba  | bruno@mail.com\n3  | Carla | Recife    | carla@mail.com",
        result: "clientes tem linhas de clientes e colunas de informacoes.",
      },
      {
        type: "quiz",
        title: "Quiz do mural",
        question:
          "Na tabela clientes, o que representa uma linha?",
        options: [
          "Um cliente registrado",
          "O nome de uma coluna",
          "A linguagem SQL inteira",
        ],
        correctAnswer: "Um cliente registrado",
        explanation:
          "Uma linha e um registro. Nesse caso, um cliente.",
      },
    ],
  }),
  createStage({
    id: "sql-village-03-database-map",
    chapterId: "sql-chapter-1",
    order: 3,
    title: "Banco, tabelas e dados",
    description: "Entenda o mapa antes de escrever comandos.",
    type: "quiz",
    xp: 45,
    coins: 20,
    content: [
      {
        type: "text",
        title: "O mapa da lojinha",
        content:
          "Byte abre um mapa simples. O banco de dados e o lugar onde tudo fica guardado. Dentro dele existem tabelas. Cada tabela guarda um tipo de coisa: clientes, produtos ou pedidos.",
      },
      {
        type: "example",
        title: "Organizacao do reino",
        explanation:
          "Pense no banco como uma pasta, nas tabelas como arquivos, nas colunas como campos e nas linhas como registros.",
        code: "banco: lojinha\n  tabela: clientes\n    colunas: id, nome, cidade, email\n    linhas: Ana, Bruno, Carla\n  tabela: produtos\n    colunas: id, nome, preco, categoria, estoque",
        result: "um banco guarda varias tabelas organizadas",
      },
      {
        type: "quiz",
        title: "Pergunta do mapa",
        question:
          "Dentro de um banco de dados relacional, onde os registros ficam organizados?",
        options: [
          "Em tabelas",
          "Em botoes da tela",
          "Em imagens soltas",
        ],
        correctAnswer: "Em tabelas",
        explanation:
          "Tabelas organizam os registros em linhas e colunas.",
      },
    ],
  }),
  createStage({
    id: "sql-village-04-result-grid",
    chapterId: "sql-chapter-1",
    order: 4,
    title: "Como ler um resultado",
    description: "Aprenda a interpretar a grade que volta da consulta.",
    type: "quiz",
    xp: 45,
    coins: 20,
    content: [
      {
        type: "text",
        title: "A janela de resposta",
        content:
          "Quando voce roda uma consulta, o banco responde com uma grade. O cabecalho mostra os nomes das colunas. Cada linha abaixo e um registro encontrado pela consulta.",
      },
      {
        type: "example",
        title: "Lendo a grade",
        explanation:
          "Na primeira linha de dados, Ana e o valor da coluna nome, e Sao Paulo e o valor da coluna cidade.",
        code: "id | nome  | cidade\n1  | Ana   | Sao Paulo\n2  | Bruno | Curitiba",
        result: "2 registros encontrados com 3 colunas exibidas",
      },
      {
        type: "quiz",
        title: "Pergunta da grade",
        question:
          "Se a consulta retorna 2 linhas de dados, o que isso significa?",
        options: [
          "Dois registros foram encontrados",
          "Duas tabelas foram apagadas",
          "Duas linguagens foram usadas",
        ],
        correctAnswer: "Dois registros foram encontrados",
        explanation:
          "Cada linha de dados retornada representa um registro do resultado.",
      },
    ],
  }),
  createStage({
    id: "sql-village-05-query-shape",
    chapterId: "sql-chapter-1",
    order: 5,
    title: "A frase basica do SQL",
    description: "Entenda SELECT e FROM antes de praticar.",
    type: "quiz",
    xp: 50,
    coins: 25,
    content: [
      {
        type: "text",
        title: "A frase magica sem misterio",
        content:
          "SQL parece estranho no comeco, mas a primeira frase tem uma logica simples: SELECT diz quais colunas voce quer ver. FROM diz qual tabela voce quer consultar.",
      },
      {
        type: "example",
        title: "Separando a frase",
        explanation:
          "Leia da seguinte forma: selecione nome e cidade da tabela clientes.",
        code: "SELECT nome, cidade FROM clientes;",
        result: "colunas nome e cidade vindas da tabela clientes",
      },
      {
        type: "quiz",
        title: "Pergunta da frase",
        question:
          "Em SELECT nome FROM clientes, qual parte diz a tabela consultada?",
        options: [
          "FROM clientes",
          "SELECT nome",
          "nome",
        ],
        correctAnswer: "FROM clientes",
        explanation:
          "FROM aponta de qual tabela os dados serao buscados.",
      },
    ],
  }),
  createStage({
    id: "sql-village-06-select-all",
    chapterId: "sql-chapter-1",
    order: 6,
    title: "Seu primeiro comando: SELECT * FROM",
    description: "Consulte todas as colunas de uma tabela.",
    type: "challenge",
    xp: 55,
    coins: 25,
    content: [
      {
        type: "text",
        title: "A lanterna do SELECT",
        content:
          "A vila esta escura e Byte entrega uma lanterna. SELECT diz o que voce quer ver. FROM diz de onde vem. A estrelinha significa todas as colunas.",
      },
      {
        type: "example",
        title: "Todos os clientes",
        explanation:
          "Este comando retorna a tabela clientes inteira.",
        code: "SELECT * FROM clientes;",
        result: "todas as colunas e linhas de clientes",
      },
      {
        type: "challenge",
        title: "Acenda a vila",
        objective:
          "Escreva o comando para listar todos os clientes.",
        expectedAnswer:
          "SELECT * FROM clientes;",
        hint:
          "Lembre da estrelinha.",
      },
    ],
  }),
  createStage({
    id: "sql-village-07-columns",
    chapterId: "sql-chapter-1",
    order: 7,
    title: "Escolhendo colunas especificas",
    description: "Liste apenas as colunas que interessam.",
    type: "challenge",
    xp: 60,
    coins: 30,
    content: [
      {
        type: "text",
        title: "Menos peso na mochila",
        content:
          "Nem sempre voce quer ver tudo. No lugar do *, voce pode escrever os nomes das colunas, separados por virgula, para trazer so o necessario.",
      },
      {
        type: "example",
        title: "Nome e cidade",
        explanation:
          "Este comando retorna apenas nome e cidade de cada cliente.",
        code: "SELECT nome, cidade FROM clientes;",
        result: "nome | cidade",
      },
      {
        type: "challenge",
        title: "Pegue apenas o necessario",
        objective:
          "Retorne apenas nome e email da tabela clientes.",
        expectedAnswer:
          "SELECT nome, email FROM clientes;",
        hint:
          "Troque o * pelos nomes das colunas, separados por virgula.",
      },
    ],
  }),
  createStage({
    id: "sql-village-08-star-quiz",
    chapterId: "sql-chapter-1",
    order: 8,
    title: "Quiz da estrelinha",
    description: "Fixe o significado do * em SELECT.",
    type: "quiz",
    xp: 45,
    coins: 20,
    content: [
      {
        type: "text",
        title: "A runa do tudo",
        content:
          "Byte desenha uma estrela no chao. Em SQL, ela nao multiplica nessa situacao: dentro de SELECT, ela representa todas as colunas.",
      },
      {
        type: "quiz",
        title: "Pergunta da runa",
        question:
          "O que o * significa em SELECT * FROM produtos?",
        options: [
          "Multiplicar valores",
          "Todas as colunas",
          "Apenas a primeira linha",
          "Nenhuma coluna",
        ],
        correctAnswer: "Todas as colunas",
        explanation:
          "SELECT * pede todas as colunas da tabela escolhida.",
      },
    ],
  }),
  createStage({
    id: "sql-village-09-limit",
    chapterId: "sql-chapter-1",
    order: 9,
    title: "Limitando resultados com LIMIT",
    description: "Peca apenas as primeiras linhas.",
    type: "challenge",
    xp: 65,
    coins: 30,
    content: [
      {
        type: "text",
        title: "A fila da lojinha",
        content:
          "Quando uma tabela e gigante, ver tudo pode atrapalhar. LIMIT pede apenas as primeiras N linhas do resultado.",
      },
      {
        type: "example",
        title: "Tres produtos",
        explanation:
          "Este comando retorna apenas os 3 primeiros produtos.",
        code: "SELECT * FROM produtos LIMIT 3;",
        result: "3 primeiras linhas de produtos",
      },
      {
        type: "challenge",
        title: "Controle a fila",
        objective:
          "Liste os 5 primeiros pedidos da tabela pedidos.",
        expectedAnswer:
          "SELECT * FROM pedidos LIMIT 5;",
        hint:
          "Use LIMIT 5 no final.",
      },
    ],
  }),
  createStage({
    id: "sql-village-10-boss",
    chapterId: "sql-chapter-1",
    order: 10,
    title: "Chefe: O Guardiao da Vila",
    description: "Combine colunas especificas e LIMIT.",
    type: "boss",
    xp: 120,
    coins: 60,
    content: [
      {
        type: "text",
        title: "O caminho para a cidade",
        content:
          "O Guardiao da Vila bloqueia a estrada. Para passar, voce precisa provar que sabe escolher colunas e limitar resultados.",
      },
      {
        type: "example",
        title: "Primeiro golpe",
        explanation:
          "Listar nome e preco de produtos mostra que voce sabe escolher colunas.",
        code: "SELECT nome, preco FROM produtos;",
        result: "nome | preco",
      },
      {
        type: "boss",
        title: "Golpe final",
        objective:
          "Liste nome e preco apenas dos 3 primeiros produtos.",
        expectedAnswer:
          "SELECT nome, preco FROM produtos LIMIT 3;",
        hint:
          "Combine SELECT nome, preco FROM produtos com LIMIT 3.",
      },
    ],
  }),
];

export const basicsToIntermediateStages: Stage[] = [
  createStage({
    id: "sql-city-01-filter-why",
    chapterId: "sql-chapter-2",
    order: 1,
    title: "Por que filtrar",
    description: "Entenda por que WHERE existe.",
    type: "quiz",
    xp: 55,
    coins: 25,
    content: [
      {
        type: "text",
        title: "A cidade nao quer tudo",
        content:
          "Na Cidade das Consultas, ninguem quer ver a lista inteira de pedidos. As pessoas querem apenas pedidos de um cliente, produtos baratos ou clientes de uma cidade. Para isso existe WHERE.",
      },
      {
        type: "quiz",
        title: "Pergunta dos portoes",
        question:
          "Qual palavra-chave filtra linhas em uma consulta?",
        options: [
          "WHERE",
          "TABLE",
          "LIMIT",
        ],
        correctAnswer: "WHERE",
        explanation:
          "WHERE define uma condicao que cada linha precisa cumprir.",
      },
    ],
  }),
  createStage({
    id: "sql-city-02-comparison",
    chapterId: "sql-chapter-2",
    order: 2,
    title: "WHERE com igualdade e comparacao",
    description: "Use igualdade e operadores como <, >, <= e >=.",
    type: "challenge",
    xp: 75,
    coins: 35,
    content: [
      {
        type: "text",
        title: "O filtro dos guardas",
        content:
          "WHERE funciona como um guarda. So entram as linhas que obedecem a regra. Voce pode comparar texto com = e numeros com operadores como >, <, >=, <= e <>.",
      },
      {
        type: "example",
        title: "Clientes de Curitiba",
        explanation:
          "Texto fica entre aspas simples.",
        code: "SELECT * FROM clientes WHERE cidade = 'Curitiba';\nSELECT nome, preco FROM produtos WHERE preco > 100;",
        result: "clientes filtrados por cidade e produtos filtrados por preco",
      },
      {
        type: "challenge",
        title: "Estoque baixo",
        objective:
          "Liste todos os produtos com estoque menor que 10.",
        expectedAnswer:
          "SELECT * FROM produtos WHERE estoque < 10;",
        hint:
          "Use WHERE estoque < 10.",
      },
    ],
  }),
  createStage({
    id: "sql-city-03-logic",
    chapterId: "sql-chapter-2",
    order: 3,
    title: "Combinando condicoes com AND, OR e NOT",
    description: "Misture regras para criar filtros mais precisos.",
    type: "challenge",
    xp: 85,
    coins: 40,
    content: [
      {
        type: "text",
        title: "Tres chaves da cidade",
        content:
          "AND exige que duas condicoes sejam verdadeiras. OR aceita uma ou outra. NOT inverte uma condicao. Com elas, voce cria filtros mais inteligentes.",
      },
      {
        type: "example",
        title: "Categoria e preco",
        explanation:
          "Este comando busca produtos eletronicos baratos.",
        code: "SELECT * FROM produtos WHERE categoria = 'eletronicos' AND preco < 200;",
        result: "eletronicos com preco abaixo de 200",
      },
      {
        type: "challenge",
        title: "Duas cidades",
        objective:
          "Liste clientes de Sao Paulo OU de Recife.",
        expectedAnswer:
          "SELECT * FROM clientes WHERE cidade = 'Sao Paulo' OR cidade = 'Recife';",
        hint:
          "Use OR entre as duas cidades.",
      },
    ],
  }),
  createStage({
    id: "sql-city-04-shortcuts",
    chapterId: "sql-chapter-2",
    order: 4,
    title: "Atalhos uteis: BETWEEN, IN, LIKE, IS NULL",
    description: "Aprenda filtros comuns do dia a dia.",
    type: "quiz",
    xp: 85,
    coins: 40,
    content: [
      {
        type: "text",
        title: "Ferramentas do distrito",
        content:
          "BETWEEN filtra intervalos. IN verifica uma lista de valores. LIKE procura padroes em texto. IS NULL encontra campos sem valor cadastrado.",
      },
      {
        type: "example",
        title: "Quatro atalhos",
        explanation:
          "Cada operador resolve um tipo comum de busca.",
        code: "SELECT * FROM produtos WHERE preco BETWEEN 50 AND 150;\nSELECT * FROM clientes WHERE cidade IN ('Curitiba', 'Recife');\nSELECT * FROM clientes WHERE nome LIKE 'A%';\nSELECT * FROM clientes WHERE email IS NULL;",
        result: "intervalo, lista, padrao e valor ausente",
      },
      {
        type: "quiz",
        title: "Quiz dos atalhos",
        question:
          "Qual operador encontra nomes que comecam com A?",
        options: [
          "LIKE 'A%'",
          "BETWEEN A AND Z",
          "IS NULL",
        ],
        correctAnswer: "LIKE 'A%'",
        explanation:
          "LIKE usa padroes. O % significa qualquer sequencia de caracteres.",
      },
    ],
  }),
  createStage({
    id: "sql-city-05-between-quiz",
    chapterId: "sql-chapter-2",
    order: 5,
    title: "Quiz de fixacao: BETWEEN",
    description: "Escolha o comando correto para intervalo.",
    type: "quiz",
    xp: 60,
    coins: 30,
    content: [
      {
        type: "text",
        title: "A balanca dos extremos",
        content:
          "Byte coloca duas moedas na balanca: 20 e 80. BETWEEN inclui os dois extremos do intervalo.",
      },
      {
        type: "quiz",
        title: "Pergunta da balanca",
        question:
          "Qual comando retorna produtos com preco entre 20 e 80, incluindo os dois extremos?",
        options: [
          "WHERE preco > 20 AND preco < 80",
          "WHERE preco BETWEEN 20 AND 80",
          "WHERE preco IN (20, 80)",
          "WHERE preco LIKE '20-80'",
        ],
        correctAnswer: "WHERE preco BETWEEN 20 AND 80",
        explanation:
          "BETWEEN inclui o valor inicial e o valor final.",
      },
    ],
  }),
  createStage({
    id: "sql-city-06-combined",
    chapterId: "sql-chapter-2",
    order: 6,
    title: "Desafio combinado",
    description: "Use categoria e preco no mesmo filtro.",
    type: "challenge",
    xp: 95,
    coins: 45,
    content: [
      {
        type: "text",
        title: "Pedido do mercado",
        content:
          "Um vendedor precisa encontrar produtos de uma categoria especifica com preco baixo. Agora voce combina duas condicoes com AND.",
      },
      {
        type: "challenge",
        title: "Produtos alimentos baratos",
        objective:
          "Liste produtos da categoria alimentos com preco menor que 30.",
        expectedAnswer:
          "SELECT * FROM produtos WHERE categoria = 'alimentos' AND preco < 30;",
        hint:
          "Use categoria = 'alimentos' AND preco < 30.",
      },
    ],
  }),
  createStage({
    id: "sql-city-07-boss",
    chapterId: "sql-chapter-2",
    order: 7,
    title: "Chefe: O Guardiao das Consultas",
    description: "Misture LIKE e BETWEEN para liberar o mercado.",
    type: "boss",
    xp: 130,
    coins: 65,
    content: [
      {
        type: "text",
        title: "O guardiao das regras",
        content:
          "O Guardiao das Consultas exige dominio sobre padroes e intervalos. Ele so abre caminho para quem sabe filtrar com precisao.",
      },
      {
        type: "example",
        title: "Primeiro pedido",
        explanation:
          "Clientes cujo nome comeca com C usam LIKE 'C%'.",
        code: "SELECT * FROM clientes WHERE nome LIKE 'C%';",
        result: "clientes com nome iniciado por C",
      },
      {
        type: "boss",
        title: "Intervalo final",
        objective:
          "Liste produtos com estoque entre 5 e 20.",
        expectedAnswer:
          "SELECT * FROM produtos WHERE estoque BETWEEN 5 AND 20;",
        hint:
          "Use BETWEEN 5 AND 20.",
      },
    ],
  }),
];

export const intermediateStages: Stage[] = [
  createStage({
    id: "sql-market-01-why-order",
    chapterId: "sql-chapter-3",
    order: 1,
    title: "Por que ordenar",
    description: "Entenda por que a ordem muda a leitura dos dados.",
    type: "quiz",
    xp: 55,
    coins: 25,
    content: [
      {
        type: "text",
        title: "O mercado baguncado",
        content:
          "De nada adianta achar os produtos certos se eles aparecem numa ordem confusa. No Mercado dos Produtos, voce aprende a organizar resultados.",
      },
      {
        type: "quiz",
        title: "Pergunta da banca",
        question:
          "Qual parte de uma consulta organiza os resultados?",
        options: [
          "ORDER BY",
          "WHERE",
          "FROM",
        ],
        correctAnswer: "ORDER BY",
        explanation:
          "ORDER BY define a ordem das linhas no resultado.",
      },
    ],
  }),
  createStage({
    id: "sql-market-02-order-by",
    chapterId: "sql-chapter-3",
    order: 2,
    title: "ORDER BY",
    description: "Ordene resultados por uma coluna.",
    type: "challenge",
    xp: 80,
    coins: 40,
    content: [
      {
        type: "text",
        title: "Colocando tudo em fila",
        content:
          "ORDER BY organiza os resultados por uma coluna. Se voce nao disser o contrario, a ordem crescente e o padrao.",
      },
      {
        type: "example",
        title: "Produtos por preco",
        explanation:
          "Este comando ordena produtos do menor para o maior preco.",
        code: "SELECT nome, preco FROM produtos ORDER BY preco;",
        result: "produtos ordenados por preco",
      },
      {
        type: "challenge",
        title: "Clientes em ordem",
        objective:
          "Ordene clientes por nome em ordem alfabetica.",
        expectedAnswer:
          "SELECT * FROM clientes ORDER BY nome;",
        hint:
          "Use ORDER BY nome.",
      },
    ],
  }),
  createStage({
    id: "sql-market-03-asc-desc",
    chapterId: "sql-chapter-3",
    order: 3,
    title: "ASC e DESC",
    description: "Controle ordem crescente e decrescente.",
    type: "challenge",
    xp: 85,
    coins: 40,
    content: [
      {
        type: "text",
        title: "Subindo ou descendo",
        content:
          "ASC e a ordem crescente, e geralmente e o padrao. DESC inverte para ordem decrescente, do maior para o menor.",
      },
      {
        type: "example",
        title: "Mais caro primeiro",
        explanation:
          "DESC coloca os maiores precos no topo.",
        code: "SELECT nome, preco FROM produtos ORDER BY preco DESC;",
        result: "produtos do mais caro para o mais barato",
      },
      {
        type: "challenge",
        title: "Estoque do maior para o menor",
        objective:
          "Liste os produtos do maior estoque para o menor.",
        expectedAnswer:
          "SELECT * FROM produtos ORDER BY estoque DESC;",
        hint:
          "Use ORDER BY estoque DESC.",
      },
    ],
  }),
  createStage({
    id: "sql-market-04-where-order",
    chapterId: "sql-chapter-3",
    order: 4,
    title: "Combinando WHERE e ORDER BY",
    description: "Filtre primeiro, depois organize.",
    type: "challenge",
    xp: 90,
    coins: 45,
    content: [
      {
        type: "text",
        title: "A banca certa, na ordem certa",
        content:
          "WHERE escolhe quais linhas entram no resultado. ORDER BY organiza as linhas que sobraram depois do filtro.",
      },
      {
        type: "example",
        title: "Eletronicos caros primeiro",
        explanation:
          "O filtro vem antes da ordenacao.",
        code: "SELECT * FROM produtos WHERE categoria = 'eletronicos' ORDER BY preco DESC;",
        result: "eletronicos do mais caro para o mais barato",
      },
      {
        type: "challenge",
        title: "Pedidos do cliente 2",
        objective:
          "Liste pedidos do cliente com id 2, ordenados por data.",
        expectedAnswer:
          "SELECT * FROM pedidos WHERE cliente_id = 2 ORDER BY data;",
        hint:
          "Use WHERE cliente_id = 2 antes de ORDER BY data.",
      },
    ],
  }),
  createStage({
    id: "sql-market-05-desc-quiz",
    chapterId: "sql-chapter-3",
    order: 5,
    title: "Quiz de fixacao: DESC",
    description: "Fixe ordenacao decrescente.",
    type: "quiz",
    xp: 60,
    coins: 30,
    content: [
      {
        type: "text",
        title: "A seta para baixo",
        content:
          "Quando Byte vira a placa da banca, os maiores valores aparecem primeiro. Essa e a ideia do DESC.",
      },
      {
        type: "quiz",
        title: "Pergunta da placa",
        question:
          "Qual palavra-chave organiza os resultados do maior para o menor valor?",
        options: [
          "ASC",
          "DESC",
          "MAX",
          "TOP",
        ],
        correctAnswer: "DESC",
        explanation:
          "DESC significa ordem decrescente.",
      },
    ],
  }),
  createStage({
    id: "sql-market-06-pagination",
    chapterId: "sql-chapter-3",
    order: 6,
    title: "Paginando com LIMIT e OFFSET",
    description: "Crie paginas de resultado.",
    type: "challenge",
    xp: 95,
    coins: 45,
    content: [
      {
        type: "text",
        title: "A segunda pagina do livro",
        content:
          "OFFSET pula as primeiras N linhas antes do LIMIT. Isso permite criar paginas: por exemplo, pular os 5 primeiros e mostrar os 5 seguintes.",
      },
      {
        type: "example",
        title: "Segunda pagina de produtos",
        explanation:
          "Pula os 5 mais baratos e mostra os 5 seguintes.",
        code: "SELECT * FROM produtos ORDER BY preco LIMIT 5 OFFSET 5;",
        result: "segunda pagina de produtos por preco",
      },
      {
        type: "challenge",
        title: "Segunda pagina de clientes",
        objective:
          "Mostre a segunda pagina de clientes, 3 por pagina, ordenados por nome.",
        expectedAnswer:
          "SELECT * FROM clientes ORDER BY nome LIMIT 3 OFFSET 3;",
        hint:
          "Use ORDER BY nome LIMIT 3 OFFSET 3.",
      },
    ],
  }),
  createStage({
    id: "sql-market-07-boss",
    chapterId: "sql-chapter-3",
    order: 7,
    title: "Chefe: O Guardiao do Mercado",
    description: "Filtre, ordene e limite em um unico comando.",
    type: "boss",
    xp: 140,
    coins: 70,
    content: [
      {
        type: "text",
        title: "O leilao dos eletronicos",
        content:
          "O Guardiao do Mercado quer ver se voce sabe encontrar o que importa, ordenar corretamente e mostrar apenas o topo da lista.",
      },
      {
        type: "boss",
        title: "Tres mais caros",
        objective:
          "Liste os 3 produtos mais caros da categoria eletronicos.",
        expectedAnswer:
          "SELECT * FROM produtos WHERE categoria = 'eletronicos' ORDER BY preco DESC LIMIT 3;",
        hint:
          "Use WHERE, ORDER BY preco DESC e LIMIT 3.",
      },
    ],
  }),
];

export const intermediateToAdvancedStages: Stage[] = [
  createStage({
    id: "sql-stats-01-why-aggregate",
    chapterId: "sql-chapter-4",
    order: 1,
    title: "Por que agregar",
    description: "Aprenda a transformar muitas linhas em resumo.",
    type: "quiz",
    xp: 60,
    coins: 30,
    content: [
      {
        type: "text",
        title: "O Castelo das Estatisticas",
        content:
          "As vezes voce nao quer ver cada linha. Voce quer um resumo: quantos clientes existem, qual o preco medio dos produtos, qual foi o total pedido.",
      },
      {
        type: "quiz",
        title: "Pergunta do castelo",
        question:
          "O que uma agregacao faz?",
        options: [
          "Resume varias linhas em um resultado calculado",
          "Apaga uma tabela",
          "Muda a cor do banco",
        ],
        correctAnswer:
          "Resume varias linhas em um resultado calculado",
        explanation:
          "COUNT, SUM, AVG, MIN e MAX sao funcoes de agregacao.",
      },
    ],
  }),
  createStage({
    id: "sql-stats-02-functions",
    chapterId: "sql-chapter-4",
    order: 2,
    title: "COUNT, SUM, AVG, MIN e MAX",
    description: "Use funcoes de agregacao.",
    type: "challenge",
    xp: 95,
    coins: 45,
    content: [
      {
        type: "text",
        title: "As cinco runas de resumo",
        content:
          "COUNT conta linhas. SUM soma valores. AVG calcula media. MIN encontra o menor valor. MAX encontra o maior.",
      },
      {
        type: "example",
        title: "Resumo da lojinha",
        explanation:
          "Esses comandos respondem perguntas de negocio.",
        code: "SELECT COUNT(*) FROM clientes;\nSELECT SUM(quantidade) FROM pedidos;\nSELECT AVG(preco) FROM produtos;\nSELECT MIN(preco), MAX(preco) FROM produtos;",
        result: "contagem, soma, media, minimo e maximo",
      },
      {
        type: "challenge",
        title: "Conte eletronicos",
        objective:
          "Conte quantos produtos existem na categoria eletronicos.",
        expectedAnswer:
          "SELECT COUNT(*) FROM produtos WHERE categoria = 'eletronicos';",
        hint:
          "Use COUNT(*) com WHERE categoria = 'eletronicos'.",
      },
    ],
  }),
  createStage({
    id: "sql-stats-03-group-by",
    chapterId: "sql-chapter-4",
    order: 3,
    title: "Agrupando com GROUP BY",
    description: "Calcule resumos por grupo.",
    type: "challenge",
    xp: 105,
    coins: 55,
    content: [
      {
        type: "text",
        title: "Salas por categoria",
        content:
          "GROUP BY junta linhas que tem o mesmo valor em uma coluna. Depois disso, voce pode aplicar agregacoes em cada grupo.",
      },
      {
        type: "example",
        title: "Produtos por categoria",
        explanation:
          "Conta quantos produtos existem em cada categoria.",
        code: "SELECT categoria, COUNT(*) FROM produtos GROUP BY categoria;",
        result: "categoria | quantidade",
      },
      {
        type: "challenge",
        title: "Media por categoria",
        objective:
          "Mostre o preco medio dos produtos por categoria.",
        expectedAnswer:
          "SELECT categoria, AVG(preco) FROM produtos GROUP BY categoria;",
        hint:
          "Use GROUP BY categoria com AVG(preco).",
      },
    ],
  }),
  createStage({
    id: "sql-stats-04-having",
    chapterId: "sql-chapter-4",
    order: 4,
    title: "Filtrando grupos com HAVING",
    description: "Filtre depois do agrupamento.",
    type: "challenge",
    xp: 110,
    coins: 60,
    content: [
      {
        type: "text",
        title: "O tribunal dos grupos",
        content:
          "WHERE filtra linhas antes de agrupar. HAVING filtra grupos depois do GROUP BY. Essa diferenca e crucial quando voce usa agregacoes.",
      },
      {
        type: "example",
        title: "Categorias grandes",
        explanation:
          "Mostra apenas categorias com mais de 5 produtos.",
        code: "SELECT categoria, COUNT(*) FROM produtos GROUP BY categoria HAVING COUNT(*) > 5;",
        result: "categorias com muitos produtos",
      },
      {
        type: "challenge",
        title: "Clientes frequentes",
        objective:
          "Mostre clientes que fizeram mais de 3 pedidos.",
        expectedAnswer:
          "SELECT cliente_id, COUNT(*) FROM pedidos GROUP BY cliente_id HAVING COUNT(*) > 3;",
        hint:
          "Agrupe por cliente_id e use HAVING COUNT(*) > 3.",
      },
    ],
  }),
  createStage({
    id: "sql-stats-05-where-having-quiz",
    chapterId: "sql-chapter-4",
    order: 5,
    title: "Quiz de fixacao: WHERE x HAVING",
    description: "Entenda a diferenca principal.",
    type: "quiz",
    xp: 70,
    coins: 35,
    content: [
      {
        type: "text",
        title: "Antes e depois",
        content:
          "Byte mostra duas portas: WHERE fica antes do agrupamento. HAVING fica depois do agrupamento.",
      },
      {
        type: "quiz",
        title: "Pergunta do tribunal",
        question:
          "Qual a diferenca principal entre WHERE e HAVING?",
        options: [
          "Nao ha diferenca",
          "WHERE filtra linhas antes de agrupar, HAVING filtra grupos depois",
          "HAVING so funciona com ORDER BY",
          "WHERE so funciona com numeros",
        ],
        correctAnswer:
          "WHERE filtra linhas antes de agrupar, HAVING filtra grupos depois",
        explanation:
          "Use WHERE para linhas e HAVING para grupos agregados.",
      },
    ],
  }),
  createStage({
    id: "sql-stats-06-combined",
    chapterId: "sql-chapter-4",
    order: 6,
    title: "Desafio combinado",
    description: "Some quantidades e filtre grupos.",
    type: "challenge",
    xp: 115,
    coins: 60,
    content: [
      {
        type: "text",
        title: "Relatorio de vendas",
        content:
          "O castelo precisa saber quais produtos venderam muito. Para isso, voce soma quantidades por produto e filtra apenas os grupos fortes.",
      },
      {
        type: "challenge",
        title: "Mais de 50 unidades",
        objective:
          "Mostre a quantidade total vendida por produto, apenas dos produtos que venderam mais de 50 unidades.",
        expectedAnswer:
          "SELECT produto_id, SUM(quantidade) FROM pedidos GROUP BY produto_id HAVING SUM(quantidade) > 50;",
        hint:
          "Use SUM(quantidade), GROUP BY produto_id e HAVING SUM(quantidade) > 50.",
      },
    ],
  }),
  createStage({
    id: "sql-stats-07-boss",
    chapterId: "sql-chapter-4",
    order: 7,
    title: "Chefe: O Guardiao das Estatisticas",
    description: "Domine GROUP BY, AVG e HAVING.",
    type: "boss",
    xp: 150,
    coins: 80,
    content: [
      {
        type: "text",
        title: "A coroa dos relatorios",
        content:
          "O Guardiao das Estatisticas so libera a Fortaleza das Relacoes para quem consegue transformar dados brutos em respostas de negocio.",
      },
      {
        type: "example",
        title: "Preco medio por categoria",
        explanation:
          "Primeiro voce mostra a media por categoria.",
        code: "SELECT categoria, AVG(preco) FROM produtos GROUP BY categoria;",
        result: "categoria | preco medio",
      },
      {
        type: "boss",
        title: "Categorias com mais de 3 produtos",
        objective:
          "Mostre categorias com mais de 3 produtos cadastrados.",
        expectedAnswer:
          "SELECT categoria, COUNT(*) FROM produtos GROUP BY categoria HAVING COUNT(*) > 3;",
        hint:
          "Use GROUP BY categoria e HAVING COUNT(*) > 3.",
      },
    ],
  }),
];

export const advancedStages: Stage[] = [
  createStage({
    id: "sql-relations-01-why-separate",
    chapterId: "sql-chapter-5",
    order: 1,
    title: "Por que separar em tabelas",
    description: "Entenda chaves primarias e estrangeiras.",
    type: "quiz",
    xp: 70,
    coins: 35,
    content: [
      {
        type: "text",
        title: "A Fortaleza das Relacoes",
        content:
          "A tabela pedidos nao guarda o nome do cliente, apenas cliente_id. Isso evita repetir dados. O id identifica uma linha; cliente_id e produto_id apontam para outras tabelas.",
      },
      {
        type: "example",
        title: "Chaves da lojinha",
        explanation:
          "clientes.id e produtos.id sao chaves primarias. pedidos.cliente_id e pedidos.produto_id sao chaves estrangeiras.",
        code: "pedidos.cliente_id -> clientes.id\npedidos.produto_id -> produtos.id",
        result: "pedidos se conecta a clientes e produtos",
      },
      {
        type: "quiz",
        title: "Quiz das chaves",
        question:
          "O que cliente_id em pedidos representa?",
        options: [
          "Uma chave estrangeira que aponta para clientes.id",
          "O nome do cliente",
          "O preco do produto",
        ],
        correctAnswer:
          "Uma chave estrangeira que aponta para clientes.id",
        explanation:
          "A chave estrangeira guarda a referencia para outra tabela.",
      },
    ],
  }),
  createStage({
    id: "sql-relations-02-inner-join",
    chapterId: "sql-chapter-5",
    order: 2,
    title: "INNER JOIN",
    description: "Junte registros que possuem correspondencia.",
    type: "challenge",
    xp: 120,
    coins: 65,
    content: [
      {
        type: "text",
        title: "A primeira ponte",
        content:
          "INNER JOIN junta tabelas mostrando apenas linhas que encontram correspondencia dos dois lados.",
      },
      {
        type: "example",
        title: "Pedidos com clientes",
        explanation:
          "Junta cada pedido ao nome do cliente que fez o pedido.",
        code: "SELECT pedidos.id, clientes.nome FROM pedidos INNER JOIN clientes ON pedidos.cliente_id = clientes.id;",
        result: "pedido | cliente",
      },
      {
        type: "challenge",
        title: "Produtos pedidos",
        objective:
          "Mostre o nome do produto junto com a quantidade pedida, juntando pedidos com produtos.",
        expectedAnswer:
          "SELECT produtos.nome, pedidos.quantidade FROM pedidos INNER JOIN produtos ON pedidos.produto_id = produtos.id;",
        hint:
          "Use pedidos.produto_id = produtos.id.",
      },
    ],
  }),
  createStage({
    id: "sql-relations-03-left-join",
    chapterId: "sql-chapter-5",
    order: 3,
    title: "LEFT JOIN",
    description: "Mantenha todas as linhas da tabela da esquerda.",
    type: "challenge",
    xp: 125,
    coins: 70,
    content: [
      {
        type: "text",
        title: "Ninguem fica para tras",
        content:
          "LEFT JOIN mantem todas as linhas da tabela da esquerda, mesmo quando nao existe correspondencia na direita. Quando falta correspondencia, aparecem valores NULL.",
      },
      {
        type: "example",
        title: "Todos os clientes e seus pedidos",
        explanation:
          "Clientes sem pedido tambem aparecem.",
        code: "SELECT clientes.nome, pedidos.id FROM clientes LEFT JOIN pedidos ON clientes.id = pedidos.cliente_id;",
        result: "todos os clientes, com ou sem pedido",
      },
      {
        type: "challenge",
        title: "Clientes e pedidos opcionais",
        objective:
          "Liste todos os clientes e, se existir, o id do pedido que fizeram.",
        expectedAnswer:
          "SELECT clientes.nome, pedidos.id FROM clientes LEFT JOIN pedidos ON clientes.id = pedidos.cliente_id;",
        hint:
          "Use LEFT JOIN pedidos ON clientes.id = pedidos.cliente_id.",
      },
    ],
  }),
  createStage({
    id: "sql-relations-04-join-group",
    chapterId: "sql-chapter-5",
    order: 4,
    title: "JOIN com WHERE e GROUP BY",
    description: "Junte tabelas e gere relatorios.",
    type: "challenge",
    xp: 140,
    coins: 80,
    content: [
      {
        type: "text",
        title: "A consulta mais importante",
        content:
          "Agora voce junta tudo: pedidos, clientes e produtos. Primeiro conecta tabelas, depois agrupa e soma para responder perguntas reais.",
      },
      {
        type: "example",
        title: "Pedidos por cliente",
        explanation:
          "Conta quantos pedidos cada cliente fez.",
        code: "SELECT clientes.nome, COUNT(pedidos.id) FROM clientes INNER JOIN pedidos ON clientes.id = pedidos.cliente_id GROUP BY clientes.nome;",
        result: "cliente | quantidade de pedidos",
      },
      {
        type: "challenge",
        title: "Total gasto por cliente",
        objective:
          "Mostre o nome do cliente e o total gasto por ele, juntando pedidos, clientes e produtos.",
        expectedAnswer:
          "SELECT clientes.nome, SUM(pedidos.quantidade * produtos.preco) FROM pedidos INNER JOIN clientes ON pedidos.cliente_id = clientes.id INNER JOIN produtos ON pedidos.produto_id = produtos.id GROUP BY clientes.nome;",
        hint:
          "Junte pedidos com produtos para saber o preco, depois com clientes, depois agrupe e some.",
      },
    ],
  }),
  createStage({
    id: "sql-relations-05-join-quiz",
    chapterId: "sql-chapter-5",
    order: 5,
    title: "Quiz de fixacao: INNER x LEFT",
    description: "Compare os dois tipos de JOIN.",
    type: "quiz",
    xp: 80,
    coins: 40,
    content: [
      {
        type: "text",
        title: "Duas pontes diferentes",
        content:
          "INNER JOIN mostra apenas correspondencias. LEFT JOIN preserva tudo da tabela da esquerda, mesmo sem correspondencia.",
      },
      {
        type: "quiz",
        title: "Pergunta da ponte",
        question:
          "O que diferencia um INNER JOIN de um LEFT JOIN?",
        options: [
          "Nada, sao sinonimos",
          "LEFT JOIN mantem todas as linhas da tabela a esquerda mesmo sem correspondencia",
          "INNER JOIN e mais rapido sempre",
          "LEFT JOIN so funciona com numeros",
        ],
        correctAnswer:
          "LEFT JOIN mantem todas as linhas da tabela a esquerda mesmo sem correspondencia",
        explanation:
          "LEFT JOIN preserva a tabela da esquerda e completa com NULL quando nao encontra relacao.",
      },
    ],
  }),
  createStage({
    id: "sql-relations-06-subquery",
    chapterId: "sql-chapter-5",
    order: 6,
    title: "Introducao a subqueries",
    description: "Use uma consulta dentro de outra.",
    type: "challenge",
    xp: 125,
    coins: 70,
    content: [
      {
        type: "text",
        title: "Uma pergunta dentro da outra",
        content:
          "Uma subquery e uma consulta dentro de outra. Ela pode calcular uma lista ou valor usado pela consulta principal.",
      },
      {
        type: "example",
        title: "Produtos acima da media",
        explanation:
          "A consulta interna calcula a media dos precos.",
        code: "SELECT nome FROM produtos WHERE preco > (SELECT AVG(preco) FROM produtos);",
        result: "produtos mais caros que a media",
      },
      {
        type: "challenge",
        title: "Clientes que compraram",
        objective:
          "Liste clientes que fizeram pelo menos um pedido usando subquery com IN.",
        expectedAnswer:
          "SELECT * FROM clientes WHERE id IN (SELECT cliente_id FROM pedidos);",
        hint:
          "Use id IN (SELECT cliente_id FROM pedidos).",
      },
    ],
  }),
  createStage({
    id: "sql-relations-07-final-boss",
    chapterId: "sql-chapter-5",
    order: 7,
    title: "Chefe final: O Guardiao da Fortaleza",
    description: "Combine filtrar, ordenar, agregar e juntar tabelas.",
    type: "boss",
    xp: 250,
    coins: 150,
    content: [
      {
        type: "text",
        title: "O titulo de Mestre do Reino SQL",
        content:
          "O Guardiao da Fortaleza exige tudo que voce aprendeu: juntar clientes, produtos e pedidos, calcular gasto total, agrupar por cliente, ordenar do maior para o menor e mostrar apenas os 3 maiores.",
      },
      {
        type: "boss",
        title: "Os 3 clientes que mais gastaram",
        objective:
          "Liste os 3 clientes que mais gastaram no total, juntando pedidos, produtos e clientes, agrupando por cliente e ordenando do maior gasto para o menor.",
        expectedAnswer:
          "SELECT clientes.nome, SUM(pedidos.quantidade * produtos.preco) FROM pedidos INNER JOIN clientes ON pedidos.cliente_id = clientes.id INNER JOIN produtos ON pedidos.produto_id = produtos.id GROUP BY clientes.nome ORDER BY SUM(pedidos.quantidade * produtos.preco) DESC LIMIT 3;",
        hint:
          "Junte as 3 tabelas, agrupe por clientes.nome, some quantidade * preco, ordene DESC e use LIMIT 3.",
      },
    ],
  }),
];
