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
          "Voce chegou ao Reino SQL. Aqui, cada cliente, produto e pedido vive guardado em tabelas. Pense em SQL como uma forma organizada de fazer perguntas para esse cofre: voce nao clica nos dados um por um, voce descreve o que quer encontrar. Aprender SQL e aprender a ser especifico: qual tabela olhar, quais colunas trazer, quais linhas entram na resposta e como o resultado deve aparecer.",
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
          "Byte aponta para um mural com registros de clientes. Uma tabela e organizada em colunas e linhas. A coluna define o tipo de informacao guardada, como nome, cidade ou email. A linha junta os valores de uma coisa real. Quando voce entende essa diferenca, fica mais facil saber se a pergunta pede uma coluna especifica ou varios registros inteiros.",
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
          "Byte abre um mapa simples. O banco de dados e o lugar onde tudo fica guardado. Dentro dele existem tabelas, e cada tabela costuma representar um assunto: clientes descreve pessoas, produtos descreve itens, pedidos descreve compras. Antes de escrever qualquer comando, um bom programador pergunta: qual tabela tem a informacao principal desta pergunta?",
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
          "Quando voce roda uma consulta, o banco responde com uma grade. O cabecalho mostra quais colunas foram escolhidas. Cada linha abaixo e um registro que passou pelas regras da consulta. Ler bem essa grade importa: se veio coluna demais, seu SELECT esta amplo; se veio linha demais, talvez falte filtro; se veio linha de menos, talvez o filtro esteja forte demais.",
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
          "SQL parece estranho no comeco, mas a primeira frase tem uma logica simples: SELECT diz quais colunas voce quer ver. FROM diz qual tabela voce quer consultar. Leia a consulta quase como portugues: selecione estas informacoes a partir desta tabela. A partir dessa base, todo comando maior continua sendo uma pergunta bem montada.",
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
          "A vila esta escura e Byte entrega uma lanterna. SELECT controla o que a lanterna ilumina. FROM escolhe em qual sala voce entrou. A estrelinha pede todas as colunas, o que e util para explorar uma tabela nova, mas nem sempre e ideal em relatorios reais. Primeiro aprenda a ver tudo; depois voce aprende a trazer apenas o necessario.",
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
          "Pense nas tres pecas: escolher todas as colunas, indicar a tabela e finalizar a consulta.",
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
          "Nem sempre voce quer ver tudo. Em sistemas reais, trazer colunas demais polui a tela, dificulta a leitura e pode revelar dados que nao eram necessarios. No lugar do *, voce escreve os nomes das colunas separados por virgula. A ordem dos nomes tambem define a ordem das colunas no resultado.",
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
          "No lugar da estrela entram duas colunas, separadas por virgula. A tabela continua sendo clientes.",
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
          "Quando uma tabela e gigante, ver tudo pode atrapalhar. LIMIT reduz a quantidade de linhas retornadas e ajuda a testar consultas sem despejar a tabela inteira na tela. Ele nao escolhe colunas e nao filtra por condicao; ele apenas corta o tamanho final da resposta.",
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
          "A consulta explora pedidos inteiros e corta a resposta final para cinco linhas.",
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
          "Monte em camadas: colunas certas, tabela certa e um corte pequeno no final.",
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
          "Na Cidade das Consultas, ninguem quer ver a lista inteira de pedidos o tempo todo. As pessoas perguntam coisas especificas: clientes de uma cidade, produtos abaixo de um preco, pedidos de um periodo. WHERE e a parte que transforma uma busca ampla em uma busca precisa. Ele testa cada linha e so deixa passar quem cumpre a condicao.",
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
          "WHERE funciona como um guarda. Cada linha chega no portao, a condicao e avaliada, e apenas linhas aprovadas aparecem no resultado. Texto costuma ser comparado entre aspas simples. Numeros nao precisam de aspas. Operadores como >, <, >=, <= e <> permitem transformar a pergunta em regra verificavel.",
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
          "A condicao compara uma coluna numerica de produtos com o limite 10.",
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
          "AND, OR e NOT mudam a logica do filtro. AND estreita a busca porque tudo precisa ser verdade. OR amplia a busca porque basta uma das opcoes funcionar. NOT inverte uma regra e pode excluir casos. Antes de escrever, diga a frase em voz alta: preciso das duas coisas ao mesmo tempo, de uma entre varias, ou de tudo menos isso?",
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
          "A linha pode passar por uma cidade ou pela outra. Texto precisa ficar entre aspas simples.",
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
          "BETWEEN, IN, LIKE e IS NULL sao atalhos para filtros comuns. BETWEEN lida com intervalo fechado. IN evita repetir muitos OR quando voce tem uma lista de valores. LIKE procura padroes em texto, usando % como qualquer sequencia. IS NULL procura ausencia real de valor, diferente de texto vazio.",
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
          "Um vendedor precisa encontrar produtos que obedecem a duas regras ao mesmo tempo: pertencem a uma categoria e estao abaixo de um preco. Esse tipo de pergunta e comum em relatorios. Quando as duas regras precisam ser verdadeiras na mesma linha, AND e a escolha natural.",
      },
      {
        type: "challenge",
        title: "Produtos alimentos baratos",
        objective:
          "Liste produtos da categoria alimentos com preco menor que 30.",
        expectedAnswer:
          "SELECT * FROM produtos WHERE categoria = 'alimentos' AND preco < 30;",
        hint:
          "As duas regras precisam ser verdadeiras na mesma linha: categoria e preco.",
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
          "Use uma condicao de faixa inclusiva para o estoque.",
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
          "De nada adianta achar os produtos certos se eles aparecem numa ordem confusa. Ordenar nao muda os dados salvos na tabela; muda apenas a forma como o resultado aparece. Isso e essencial para descobrir maiores valores, menores valores, listas alfabeticas, datas recentes e rankings.",
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
          "Ate aqui voce aprendeu a buscar linhas. No castelo das estatisticas, a pergunta muda: em vez de olhar cada registro separado, voce transforma varias linhas em uma resposta resumida. Isso e usado quando alguem pergunta quantos itens existem, qual foi o total vendido, qual e a media de preco, qual foi o menor valor ou o maior valor. A ideia central e: muitas linhas entram, um resumo sai.",
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
          "COUNT conta quantas linhas entram no calculo. SUM soma valores numericos. AVG calcula a media. MIN encontra o menor valor. MAX encontra o maior valor. Antes de escrever a consulta, leia a pergunta e descubra qual verbo aparece nela: contar, somar, calcular media, achar menor ou achar maior. Esse verbo normalmente aponta para a funcao de agregacao certa.",
      },
      {
        type: "example",
        title: "Resumo da lojinha",
        explanation:
          "Cada comando abaixo responde uma pergunta diferente. Repare que a funcao fica no SELECT, porque ela define o que voce quer ver como resultado. Quando existe filtro, ele entra depois para limitar quais linhas participam do calculo.",
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
          "Sem GROUP BY, uma agregacao resume a tabela inteira. Com GROUP BY, voce cria pequenos grupos dentro da tabela e calcula um resumo para cada grupo. Se voce agrupa por categoria, o banco separa os produtos em categorias e depois calcula COUNT, AVG, SUM ou outra funcao dentro de cada categoria. Pense assim: primeiro separar em caixas, depois calcular cada caixa.",
      },
      {
        type: "example",
        title: "Produtos por categoria",
        explanation:
          "A coluna agrupada aparece no SELECT para identificar cada grupo. A agregacao aparece ao lado para mostrar o resumo daquele grupo. Por isso categoria e COUNT aparecem juntos.",
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
          "WHERE e HAVING parecem filtros, mas acontecem em momentos diferentes. WHERE age antes do agrupamento: ele decide quais linhas entram na analise. HAVING age depois do GROUP BY: ele decide quais grupos resumidos continuam aparecendo. Se o filtro usa uma funcao como COUNT ou SUM, normalmente ele pertence ao HAVING, porque o valor so existe depois que o grupo foi calculado.",
      },
      {
        type: "example",
        title: "Categorias grandes",
        explanation:
          "Primeiro o banco agrupa produtos por categoria. Depois conta os produtos de cada categoria. So no final o HAVING remove grupos cuja contagem nao passou da regra.",
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
          "Byte mostra duas portas no tribunal. A primeira porta vem antes da sala dos grupos: ela se chama WHERE e filtra linhas individuais. A segunda porta vem depois da sala dos grupos: ela se chama HAVING e filtra resultados agregados. Uma forma segura de decidir e perguntar: estou filtrando linhas cruas ou estou filtrando um calculo feito pelo grupo?",
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
          "Relatorios reais costumam misturar tres ideias: escolher o identificador do grupo, calcular um total e esconder grupos fracos. Para vendas, cada linha pode representar uma venda ou item vendido. Para descobrir desempenho por produto, voce nao olha uma venda isolada: voce junta todas as vendas do mesmo produto, soma as quantidades e depois compara o total de cada grupo com o limite pedido.",
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
          "O Guardiao das Estatisticas nao quer decorar comandos. Ele quer ver se voce entende a ordem mental de um relatorio: qual entidade sera agrupada, qual calculo representa a pergunta, e qual regra decide se um grupo merece aparecer. Quando essa ordem fica clara, GROUP BY e HAVING deixam de parecer magia e viram uma ferramenta de leitura.",
      },
      {
        type: "example",
        title: "Preco medio por categoria",
        explanation:
          "Este exemplo separa produtos por categoria e calcula a media dentro de cada grupo. Observe a estrutura, nao copie mecanicamente: coluna do grupo no SELECT, funcao de resumo no SELECT, e GROUP BY apontando para a coluna que cria os grupos.",
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
          "A tabela pedidos nao precisa repetir o nome completo do cliente nem todos os dados do produto. Ela guarda identificadores, como cliente_id e produto_id, que apontam para outras tabelas. Isso evita duplicacao, facilita atualizacoes e mantém os dados consistentes. JOIN existe para reconstruir a historia completa quando voce precisa ler dados espalhados.",
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
          "INNER JOIN cria uma ponte entre duas tabelas e mostra apenas registros que encontram par dos dois lados. A parte mais importante e o ON: ele explica como uma linha de uma tabela se conecta com uma linha da outra. Sem uma condicao correta no ON, a consulta mistura dados errados.",
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
          "LEFT JOIN mantém todas as linhas da tabela da esquerda, mesmo quando nao existe correspondencia na direita. Isso e util quando a ausencia tambem importa, como clientes que ainda nao fizeram pedido. Quando a relacao nao existe, as colunas da tabela da direita aparecem como NULL.",
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
          "Agora voce junta tudo: pedidos, clientes e produtos. Esse e o tipo de consulta que aparece em sistemas reais. Primeiro conecte as tabelas pelas chaves corretas. Depois escolha o que identificar no resultado, como o nome do cliente. Por fim, aplique agregacoes para transformar varias linhas de compra em um total por pessoa.",
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
          "Uma subquery e uma consulta dentro de outra. Ela serve quando uma pergunta depende da resposta de outra. A consulta interna pode gerar um valor unico, como uma media, ou uma lista, como ids de clientes que compraram. A consulta externa usa esse resultado para decidir quais linhas mostrar.",
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
          "O Guardiao da Fortaleza exige tudo que voce aprendeu. Uma consulta final de relatorio costuma ter camadas: JOIN para reconstruir dados relacionados, calculo para transformar linhas em valor, GROUP BY para resumir por entidade, ORDER BY para criar ranking e LIMIT para mostrar apenas o topo. A chave e montar por etapas, nao tentar escrever tudo como um bloco sem pensar.",
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

type ReinforcementConfig = {
  id: string;
  chapterId: string;
  order: number;
  title: string;
  description: string;
  lesson: string;
  exampleTitle: string;
  exampleExplanation: string;
  exampleCode: string;
  exampleResult: string;
  objective: string;
  expectedAnswer: string;
  hint: string;
  xp?: number;
  coins?: number;
};

function createReinforcementStage(config: ReinforcementConfig): Stage {
  return createStage({
    id: config.id,
    chapterId: config.chapterId,
    order: config.order,
    title: config.title,
    description: config.description,
    type: "challenge",
    xp: config.xp ?? 65,
    coins: config.coins ?? 35,
    content: [
      {
        type: "text",
        title: config.title,
        content: config.lesson,
      },
      {
        type: "example",
        title: config.exampleTitle,
        explanation: config.exampleExplanation,
        code: config.exampleCode,
        result: config.exampleResult,
      },
      {
        type: "challenge",
        title: "Pratica guiada",
        objective: config.objective,
        expectedAnswer: config.expectedAnswer,
        hint: config.hint,
      },
    ],
  });
}

function addReinforcements(target: Stage[], configs: ReinforcementConfig[]) {
  target.push(...configs.map(createReinforcementStage));
  target.sort((left, right) => left.order - right.order);
}

addReinforcements(zeroToBasicsStages, [
  {
    id: "sql-village-01b-why-databases",
    chapterId: "sql-chapter-1",
    order: 1.5,
    title: "Por que bancos existem",
    description: "Entenda por que dados precisam de organizacao.",
    lesson:
      "Antes de escrever comandos, entenda o problema que SQL resolve: dados soltos viram bagunca. Um banco guarda informacoes de forma consistente para muitas pessoas consultarem sem perder a referencia. Quando voce pergunta ao banco, ele responde seguindo a estrutura das tabelas.",
    exampleTitle: "Pergunta bem localizada",
    exampleExplanation:
      "Se a pergunta fala de clientes, comece olhando a tabela clientes.",
    exampleCode: "SELECT * FROM clientes;",
    exampleResult: "todos os registros da tabela clientes",
    objective: "Liste todos os clientes para reconhecer a tabela principal do curso.",
    expectedAnswer: "SELECT * FROM clientes;",
    hint: "Voce quer explorar a tabela inteira de clientes. Escolha todas as colunas e aponte a tabela correta.",
  },
  {
    id: "sql-village-02b-column-reading",
    chapterId: "sql-chapter-1",
    order: 2.5,
    title: "Colunas contam uma historia",
    description: "Aprenda a escolher informacoes sem trazer tudo.",
    lesson:
      "Cada coluna responde a uma pergunta pequena: nome identifica, cidade localiza, email permite contato. Quando voce escolhe colunas, esta decidindo quais partes da historia quer ver. Isso deixa o resultado menor, mais claro e mais facil de ler.",
    exampleTitle: "Menos ruido",
    exampleExplanation:
      "Em vez de trazer tudo, podemos trazer apenas nome e cidade.",
    exampleCode: "SELECT nome, cidade FROM clientes;",
    exampleResult: "nomes dos clientes e suas cidades",
    objective: "Mostre apenas nome e cidade dos clientes.",
    expectedAnswer: "SELECT nome, cidade FROM clientes;",
    hint: "A resposta deve ter duas colunas visiveis e nenhuma coluna extra.",
  },
  {
    id: "sql-village-03b-table-choice",
    chapterId: "sql-chapter-1",
    order: 3.5,
    title: "Escolhendo a tabela certa",
    description: "Treine decidir de onde vem a resposta.",
    lesson:
      "Uma pergunta sempre tem um assunto principal. Se ela fala de preco e estoque, provavelmente esta em produtos. Se fala de compra, quantidade ou data, provavelmente esta em pedidos. Essa decisao evita consultas erradas antes mesmo de escrever SELECT.",
    exampleTitle: "Assunto produto",
    exampleExplanation:
      "Preco e estoque pertencem aos produtos da lojinha.",
    exampleCode: "SELECT nome, preco, estoque FROM produtos;",
    exampleResult: "produto, preco e quantidade em estoque",
    objective: "Liste nome, preco e estoque dos produtos.",
    expectedAnswer: "SELECT nome, preco, estoque FROM produtos;",
    hint: "A pergunta fala de atributos de produto. Pense em quais tres colunas respondem isso.",
  },
  {
    id: "sql-village-04b-result-width",
    chapterId: "sql-chapter-1",
    order: 4.5,
    title: "Resultado largo ou objetivo",
    description: "Entenda quando usar estrela e quando evitar.",
    lesson:
      "SELECT * e util para explorar uma tabela, mas em relatorios reais voce costuma escolher colunas. Resultado largo demais atrapalha leitura e pode esconder o ponto principal. Pense: estou explorando ou respondendo algo especifico?",
    exampleTitle: "Explorar pedidos",
    exampleExplanation:
      "Para conhecer a tabela pedidos, SELECT * ajuda a ver todas as colunas.",
    exampleCode: "SELECT * FROM pedidos;",
    exampleResult: "todas as colunas de pedidos",
    objective: "Explore todos os pedidos para conhecer suas colunas.",
    expectedAnswer: "SELECT * FROM pedidos;",
    hint: "Aqui a ideia e explorar, entao faz sentido pedir a tabela inteira de pedidos.",
  },
  {
    id: "sql-village-05b-select-order",
    chapterId: "sql-chapter-1",
    order: 5.5,
    title: "A ordem das colunas",
    description: "Veja que a ordem no SELECT vira ordem no resultado.",
    lesson:
      "As colunas aparecem no resultado na mesma ordem em que voce escreve no SELECT. Isso importa quando alguem vai ler a tabela final. Coloque primeiro o que identifica a linha e depois os detalhes.",
    exampleTitle: "Identificador antes do contato",
    exampleExplanation:
      "Nome primeiro, email depois: a leitura fica natural.",
    exampleCode: "SELECT nome, email FROM clientes;",
    exampleResult: "nome antes de email",
    objective: "Mostre nome e email dos clientes nessa ordem.",
    expectedAnswer: "SELECT nome, email FROM clientes;",
    hint: "A ordem pedida no enunciado deve ser a mesma ordem das colunas no resultado.",
  },
  {
    id: "sql-village-06b-semicolon",
    chapterId: "sql-chapter-1",
    order: 6.5,
    title: "Pontuacao e legibilidade",
    description: "Entenda ponto e virgula e espacos.",
    lesson:
      "Muitos bancos aceitam a consulta sem ponto e virgula quando voce executa uma frase so, mas o ponto e virgula marca o fim do comando. Espacos extras geralmente nao mudam a logica. O que importa e a estrutura: SELECT, colunas, FROM e tabela.",
    exampleTitle: "Mesmo comando, leitura clara",
    exampleExplanation:
      "Escrever com espacos organizados ajuda voce e outras pessoas.",
    exampleCode: "SELECT nome FROM clientes;",
    exampleResult: "lista de nomes",
    objective: "Liste somente o nome dos clientes.",
    expectedAnswer: "SELECT nome FROM clientes;",
    hint: "Se o resultado deve ter uma unica coluna, a estrela nao serve.",
  },
  {
    id: "sql-village-07b-product-columns",
    chapterId: "sql-chapter-1",
    order: 7.5,
    title: "Selecionando campos de produto",
    description: "Pratique colunas de uma tabela diferente.",
    lesson:
      "Trocar de tabela exige trocar tambem as colunas que fazem sentido. Produtos tem nome, categoria, preco e estoque. Se voce pedir email em produtos, a consulta nao representa o modelo da tabela.",
    exampleTitle: "Campos de produto",
    exampleExplanation:
      "Nome e categoria ajudam a entender o tipo de item.",
    exampleCode: "SELECT nome, categoria FROM produtos;",
    exampleResult: "produtos com suas categorias",
    objective: "Mostre nome e categoria dos produtos.",
    expectedAnswer: "SELECT nome, categoria FROM produtos;",
    hint: "A tabela fala de itens da loja; mostre o identificador legivel e o tipo do item.",
  },
  {
    id: "sql-village-08b-order-first-look",
    chapterId: "sql-chapter-1",
    order: 8.5,
    title: "Conhecendo pedidos",
    description: "Veja como compras aparecem em linhas.",
    lesson:
      "Pedidos conectam clientes e produtos por IDs. Mesmo antes de aprender JOIN, voce pode ler a tabela e perceber que cliente_id aponta para quem comprou e produto_id aponta para o item comprado.",
    exampleTitle: "Linhas de compra",
    exampleExplanation:
      "Cada pedido registra cliente, produto, quantidade e data.",
    exampleCode: "SELECT cliente_id, produto_id, quantidade FROM pedidos;",
    exampleResult: "compras registradas por ids",
    objective: "Mostre cliente_id, produto_id e quantidade dos pedidos.",
    expectedAnswer: "SELECT cliente_id, produto_id, quantidade FROM pedidos;",
    hint: "Pedidos registram quem comprou, o que comprou e quanto comprou.",
  },
  {
    id: "sql-village-09b-limit-safety",
    chapterId: "sql-chapter-1",
    order: 9.2,
    title: "LIMIT como cinto de seguranca",
    description: "Use LIMIT para explorar sem exagero.",
    lesson:
      "LIMIT e uma forma segura de olhar uma amostra. Em bases grandes, SELECT * pode retornar milhares de linhas. Com LIMIT, voce explora a estrutura sem afogar a tela de resultado.",
    exampleTitle: "Amostra pequena",
    exampleExplanation:
      "LIMIT 3 traz apenas tres linhas.",
    exampleCode: "SELECT * FROM clientes LIMIT 3;",
    exampleResult: "3 clientes retornados",
    objective: "Liste apenas 3 clientes.",
    expectedAnswer: "SELECT * FROM clientes LIMIT 3;",
    hint: "Primeiro consulte clientes; depois limite a amostra para tres linhas.",
  },
  {
    id: "sql-village-09c-basic-review",
    chapterId: "sql-chapter-1",
    order: 9.6,
    title: "Revisao da vila",
    description: "Misture tabela, colunas e limite.",
    lesson:
      "A base do SQL e combinar pequenas decisoes: qual tabela, quais colunas e quantas linhas. Antes de ir para filtros, voce precisa dominar essa leitura sem depender de decoracao.",
    exampleTitle: "Resposta controlada",
    exampleExplanation:
      "Nome e preco identificam produtos sem mostrar estoque ou categoria.",
    exampleCode: "SELECT nome, preco FROM produtos LIMIT 5;",
    exampleResult: "5 produtos com nome e preco",
    objective: "Mostre nome e preco de 5 produtos.",
    expectedAnswer: "SELECT nome, preco FROM produtos LIMIT 5;",
    hint: "Escolha duas colunas de produto e limite a resposta final a cinco linhas.",
  },
]);

addReinforcements(basicsToIntermediateStages, [
  {
    id: "sql-city-01b-where-single-row",
    chapterId: "sql-chapter-2",
    order: 1.5,
    title: "WHERE encontra linhas",
    description: "Filtre registros por igualdade.",
    lesson:
      "WHERE decide quais linhas entram no resultado. A consulta ainda olha a tabela inteira, mas so devolve linhas que passam pela condicao. Igualdade e o primeiro filtro: coluna = valor.",
    exampleTitle: "Clientes de uma cidade",
    exampleExplanation:
      "Aspas indicam texto literal.",
    exampleCode: "SELECT * FROM clientes WHERE cidade = 'Recife';",
    exampleResult: "clientes que moram em Recife",
    objective: "Liste clientes da cidade Recife.",
    expectedAnswer: "SELECT * FROM clientes WHERE cidade = 'Recife';",
    hint: "A coluna de cidade decide quais clientes passam. Recife e texto, entao precisa de aspas.",
  },
  {
    id: "sql-city-01c-where-number",
    chapterId: "sql-chapter-2",
    order: 1.8,
    title: "Filtro com numero",
    description: "Compare valores numericos sem aspas.",
    lesson:
      "Numeros normalmente nao usam aspas. Quando voce filtra preco, estoque, idade ou quantidade, esta comparando valores matematicos. Isso permite buscar maiores, menores e faixas.",
    exampleTitle: "Produtos baratos",
    exampleExplanation:
      "preco < 30 encontra produtos abaixo de 30.",
    exampleCode: "SELECT * FROM produtos WHERE preco < 30;",
    exampleResult: "produtos baratos",
    objective: "Liste produtos com preco menor que 30.",
    expectedAnswer: "SELECT * FROM produtos WHERE preco < 30;",
    hint: "Preco e numero: compare diretamente com o valor limite.",
  },
  {
    id: "sql-city-02b-greater-than",
    chapterId: "sql-chapter-2",
    order: 2.5,
    title: "Maior que e menor que",
    description: "Leia comparacoes como regras de entrada.",
    lesson:
      "Operadores como > e < criam portas. A linha so passa se o valor cumprir a regra. Isso e muito usado para estoque baixo, preco alto, idade minima e quantidades.",
    exampleTitle: "Estoque alto",
    exampleExplanation:
      "Apenas produtos com estoque acima de 20 passam.",
    exampleCode: "SELECT * FROM produtos WHERE estoque > 20;",
    exampleResult: "produtos com bastante estoque",
    objective: "Liste produtos com estoque maior que 20.",
    expectedAnswer: "SELECT * FROM produtos WHERE estoque > 20;",
    hint: "A linha so deve aparecer quando o estoque passar do limite informado.",
  },
  {
    id: "sql-city-02c-not-equal",
    chapterId: "sql-chapter-2",
    order: 2.8,
    title: "Diferente de",
    description: "Use != para excluir um valor.",
    lesson:
      "Nem todo filtro procura o que voce quer; as vezes ele remove o que voce nao quer. O operador != significa diferente de. Ele e util para tirar status, categorias ou cidades especificas.",
    exampleTitle: "Pedidos que nao foram cancelados",
    exampleExplanation:
      "status != 'cancelado' remove os cancelados.",
    exampleCode: "SELECT * FROM pedidos WHERE status != 'cancelado';",
    exampleResult: "pedidos ativos ou pagos",
    objective: "Liste pedidos cujo status seja diferente de cancelado.",
    expectedAnswer: "SELECT * FROM pedidos WHERE status != 'cancelado';",
    hint: "Voce quer excluir um status especifico, entao a comparacao nao e de igualdade.",
  },
  {
    id: "sql-city-03b-and-narrows",
    chapterId: "sql-chapter-2",
    order: 3.5,
    title: "AND afunila",
    description: "Exija duas condicoes ao mesmo tempo.",
    lesson:
      "AND deixa a consulta mais exigente. A linha precisa cumprir a primeira e a segunda condicao. Use quando a pergunta diz algo como produtos de uma categoria com preco abaixo de certo valor.",
    exampleTitle: "Alimentos baratos",
    exampleExplanation:
      "Categoria e preco precisam bater juntos.",
    exampleCode: "SELECT * FROM produtos WHERE categoria = 'alimentos' AND preco < 30;",
    exampleResult: "alimentos baratos",
    objective: "Liste alimentos com preco menor que 30.",
    expectedAnswer: "SELECT * FROM produtos WHERE categoria = 'alimentos' AND preco < 30;",
    hint: "Uma regra identifica a categoria; a outra limita o preco. As duas precisam valer.",
  },
  {
    id: "sql-city-03c-or-expands",
    chapterId: "sql-chapter-2",
    order: 3.8,
    title: "OR amplia",
    description: "Aceite uma condicao ou outra.",
    lesson:
      "OR aumenta o conjunto de respostas. A linha entra se cumprir qualquer uma das condicoes. Ele e perfeito quando a pergunta aceita duas cidades, dois status ou duas categorias.",
    exampleTitle: "Duas cidades",
    exampleExplanation:
      "Clientes de Sao Paulo ou Recife entram no resultado.",
    exampleCode: "SELECT * FROM clientes WHERE cidade = 'Sao Paulo' OR cidade = 'Recife';",
    exampleResult: "clientes das duas cidades",
    objective: "Liste clientes de Sao Paulo ou Recife.",
    expectedAnswer: "SELECT * FROM clientes WHERE cidade = 'Sao Paulo' OR cidade = 'Recife';",
    hint: "A pergunta aceita duas alternativas de cidade, nao duas exigencias ao mesmo tempo.",
  },
  {
    id: "sql-city-04b-like-prefix",
    chapterId: "sql-chapter-2",
    order: 4.5,
    title: "LIKE para comecos",
    description: "Busque textos por padrao.",
    lesson:
      "LIKE permite procurar partes de texto. O simbolo % representa qualquer sequencia. 'A%' significa textos que comecam com A. Isso ajuda em buscas de nomes e categorias.",
    exampleTitle: "Nomes com A",
    exampleExplanation:
      "LIKE 'A%' encontra Ana e Amanda.",
    exampleCode: "SELECT * FROM clientes WHERE nome LIKE 'A%';",
    exampleResult: "clientes cujo nome comeca com A",
    objective: "Liste clientes cujo nome comeca com A.",
    expectedAnswer: "SELECT * FROM clientes WHERE nome LIKE 'A%';",
    hint: "O padrao deve representar nomes que comecam com A e continuam com qualquer texto.",
  },
  {
    id: "sql-city-04c-between-range",
    chapterId: "sql-chapter-2",
    order: 4.8,
    title: "BETWEEN cria faixa",
    description: "Filtre valores entre dois limites.",
    lesson:
      "BETWEEN inclui o inicio e o fim da faixa. Ele deixa consultas de intervalo mais legiveis que escrever duas comparacoes com AND.",
    exampleTitle: "Estoque medio",
    exampleExplanation:
      "BETWEEN 5 AND 20 pega estoque de 5 ate 20.",
    exampleCode: "SELECT * FROM produtos WHERE estoque BETWEEN 5 AND 20;",
    exampleResult: "produtos em faixa media de estoque",
    objective: "Liste produtos com estoque entre 5 e 20.",
    expectedAnswer: "SELECT * FROM produtos WHERE estoque BETWEEN 5 AND 20;",
    hint: "Use uma faixa inclusiva: o menor e o maior valor tambem entram.",
  },
  {
    id: "sql-city-05b-status-filter",
    chapterId: "sql-chapter-2",
    order: 5.5,
    title: "Filtrando status",
    description: "Use texto para separar estados de pedido.",
    lesson:
      "Colunas de status costumam guardar palavras controladas, como pago, pendente ou cancelado. Filtrar status e uma das tarefas mais comuns em sistemas reais.",
    exampleTitle: "Pedidos pagos",
    exampleExplanation:
      "Apenas linhas com status pago aparecem.",
    exampleCode: "SELECT * FROM pedidos WHERE status = 'pago';",
    exampleResult: "pedidos pagos",
    objective: "Liste pedidos com status pago.",
    expectedAnswer: "SELECT * FROM pedidos WHERE status = 'pago';",
    hint: "Status e texto controlado; filtre pelo estado que representa pedido concluido.",
  },
  {
    id: "sql-city-05c-date-filter",
    chapterId: "sql-chapter-2",
    order: 5.8,
    title: "Datas como texto ordenavel",
    description: "Filtre datas no formato ano-mes-dia.",
    lesson:
      "Datas no formato YYYY-MM-DD ordenam bem como texto e tambem como data. Isso torna comparacoes simples: maior que uma data significa depois dela.",
    exampleTitle: "Pedidos recentes",
    exampleExplanation:
      "data > '2026-01-20' pega pedidos depois dessa data.",
    exampleCode: "SELECT * FROM pedidos WHERE data > '2026-01-20';",
    exampleResult: "pedidos posteriores a 20/01/2026",
    objective: "Liste pedidos depois de 2026-01-20.",
    expectedAnswer: "SELECT * FROM pedidos WHERE data > '2026-01-20';",
    hint: "Depois de uma data significa comparar a coluna data com maior que o limite.",
  },
  {
    id: "sql-city-06b-filter-columns",
    chapterId: "sql-chapter-2",
    order: 6.2,
    title: "Filtrar sem mostrar o filtro",
    description: "A coluna filtrada nao precisa aparecer no SELECT.",
    lesson:
      "Voce pode usar uma coluna no WHERE sem exibi-la no resultado. Isso e comum quando o filtro decide quais linhas entram, mas o relatorio mostra apenas informacoes relevantes.",
    exampleTitle: "Nomes de Sao Paulo",
    exampleExplanation:
      "cidade filtra, mas so nome aparece.",
    exampleCode: "SELECT nome FROM clientes WHERE cidade = 'Sao Paulo';",
    exampleResult: "nomes de clientes paulistas",
    objective: "Mostre somente o nome dos clientes de Sao Paulo.",
    expectedAnswer: "SELECT nome FROM clientes WHERE cidade = 'Sao Paulo';",
    hint: "A coluna usada no filtro nao precisa aparecer no resultado.",
  },
  {
    id: "sql-city-06c-filter-limit",
    chapterId: "sql-chapter-2",
    order: 6.4,
    title: "Filtro com amostra",
    description: "Combine WHERE e LIMIT.",
    lesson:
      "A ordem logica importa: primeiro voce define quais linhas passam no WHERE, depois limita quantas quer ver. Isso e util para investigar dados sem trazer uma lista gigante.",
    exampleTitle: "Poucos eletronicos",
    exampleExplanation:
      "Filtra a categoria e traz apenas duas linhas.",
    exampleCode: "SELECT * FROM produtos WHERE categoria = 'eletronicos' LIMIT 2;",
    exampleResult: "2 produtos eletronicos",
    objective: "Liste apenas 2 produtos da categoria eletronicos.",
    expectedAnswer: "SELECT * FROM produtos WHERE categoria = 'eletronicos' LIMIT 2;",
    hint: "Primeiro recorte pela categoria, depois reduza a quantidade final de linhas.",
  },
  {
    id: "sql-city-06d-filter-review",
    chapterId: "sql-chapter-2",
    order: 6.6,
    title: "Revisao da cidade",
    description: "Combine filtro de texto e numero.",
    lesson:
      "Quando uma pergunta mistura categoria e valor, AND costuma ser a escolha certa. Leia a frase com cuidado: se os dois requisitos precisam ser verdadeiros, use AND.",
    exampleTitle: "Eletronicos caros",
    exampleExplanation:
      "Categoria eletronicos e preco acima de 70.",
    exampleCode: "SELECT * FROM produtos WHERE categoria = 'eletronicos' AND preco > 70;",
    exampleResult: "eletronicos acima de 70",
    objective: "Liste produtos eletronicos com preco maior que 70.",
    expectedAnswer: "SELECT * FROM produtos WHERE categoria = 'eletronicos' AND preco > 70;",
    hint: "A pergunta mistura tipo de produto e valor minimo; as duas condicoes precisam aparecer.",
  },
]);

function addFoundationReviewNotes() {
  addTextNote("sql-village-01-welcome", {
    title: "O mapa da jornada",
    content:
      "Guarde esta visao: primeiro voce aprende a escolher tabelas e colunas; depois aprende a filtrar linhas; em seguida organiza listas com ORDER BY; depois resume varias linhas com COUNT, SUM, AVG e GROUP BY; no fim, junta tabelas com JOIN. Sempre que uma fase nova aparecer, pergunte em qual camada ela esta mexendo.",
  });
  addTextNote("sql-village-02-tables", {
    title: "Linhas hoje, grupos depois",
    content:
      "No comeco voce olha uma linha por vez. Mais tarde, no modulo de estatisticas, varias linhas viram um resumo: pedidos podem virar quantidade total, produtos podem virar media de preco por categoria, clientes podem virar ranking. GROUP BY nasce dessa ideia de juntar linhas parecidas em grupos.",
  });
  addTextNote("sql-village-03-database-map", {
    title: "Tabelas conversam por IDs",
    content:
      "Clientes, produtos e pedidos nao vivem isolados. A tabela pedidos guarda cliente_id e produto_id para apontar para outras tabelas. No modulo de relacoes, JOIN vai usar esses IDs como pontes para mostrar nome do cliente, produto comprado e valor da compra na mesma resposta.",
  });
  addTextNote("sql-village-04-result-grid", {
    title: "Leia o resultado como diagnostico",
    content:
      "Quando algo der errado, olhe a grade antes de culpar o comando inteiro. Colunas demais indicam SELECT amplo. Linhas demais indicam filtro fraco. Ordem estranha indica falta de ORDER BY. Repeticao demais pode indicar que voce precisa agrupar ou juntar tabelas com mais cuidado.",
  });
  addTextNote("sql-village-05-query-shape", {
    title: "A consulta cresce em camadas",
    content:
      "A frase basica e SELECT ... FROM .... Depois entram camadas: WHERE filtra linhas, GROUP BY cria grupos, HAVING filtra grupos, ORDER BY organiza o resultado e LIMIT corta a quantidade final. Voce nao precisa decorar tudo agora, mas precisa reconhecer que consultas grandes sao pequenas partes empilhadas.",
  });
  addTextNote("sql-village-06-select-all", {
    title: "Explorar nao e relatorio final",
    content:
      "SELECT * e excelente para conhecer uma tabela nova. Em relatorios reais, porem, voce costuma escolher colunas, filtrar linhas, ordenar e talvez resumir. Pense no * como lanterna de exploracao, nao como resposta definitiva para todo problema.",
  });
  addTextNote("sql-village-07-columns", {
    title: "Escolher colunas prepara agregacoes",
    content:
      "Quando voce escolhe colunas, tambem aprende quais informacoes identificam uma linha. Isso volta no GROUP BY: se voce quiser somar vendas por categoria, categoria vira a coluna de agrupamento; se quiser total por cliente, cliente_id ou nome do cliente vira o eixo do resumo.",
  });
  addTextNote("sql-village-08b-order-first-look", {
    title: "Pedidos sao a ponte do reino",
    content:
      "A tabela pedidos parece cheia de numeros, mas ela conta uma historia: quem comprou, qual produto comprou, quanto comprou e quando. No modulo 5, esses IDs vao deixar de ser numeros soltos e vao virar nomes legiveis com JOIN.",
  });
  addTextNote("sql-village-09-limit", {
    title: "LIMIT vem depois da pergunta",
    content:
      "LIMIT corta a resposta final. Se voce limitar antes de pensar no criterio, pode ver uma amostra qualquer. No modulo 3, voce vai combinar ORDER BY com LIMIT para criar tops, como produtos mais caros ou clientes com maior movimento.",
  });
  addTextNote("sql-village-10-boss", {
    title: "Checklist antes da cidade",
    content:
      "Antes de entrar em filtros, confira se voce consegue responder tres perguntas: qual tabela guarda o assunto principal, quais colunas ajudam a ler a resposta e quantas linhas fazem sentido mostrar. Esse checklist continua valendo ate nos JOINs avancados.",
  });

  addTextNote("sql-city-01-filter-why", {
    title: "WHERE volta nos modulos avancados",
    content:
      "WHERE nao e so uma fase isolada. Ele volta antes de ordenar, antes de agrupar e antes de juntar relatorios. A regra mental e: WHERE escolhe linhas individuais antes do resultado ficar organizado ou resumido.",
  });
  addTextNote("sql-city-02-comparison", {
    title: "Comparar prepara estatisticas",
    content:
      "Filtros numericos sao importantes porque muitas estatisticas nascem deles. Voce pode somar apenas pedidos pagos, contar apenas produtos de uma categoria ou calcular media apenas de itens acima de certo preco. Primeiro filtra, depois resume.",
  });
  addTextNote("sql-city-03-logic", {
    title: "AND e OR mudam o tamanho do resultado",
    content:
      "AND normalmente diminui a lista porque exige mais coisas. OR normalmente aumenta porque aceita alternativas. Quando voce chegar em ORDER BY, GROUP BY e JOIN, essa diferenca continua importante: um filtro amplo demais gera listas e grupos grandes demais.",
  });
  addTextNote("sql-city-04-shortcuts", {
    title: "Atalhos continuam sendo filtros",
    content:
      "LIKE e BETWEEN parecem comandos novos, mas a funcao deles ainda e filtrar linhas. Pense neles como formas mais confortaveis de escrever condicoes comuns: padroes de texto e faixas de valores.",
  });
  addTextNote("sql-city-05-between-quiz", {
    title: "Faixas aparecem em relatorios",
    content:
      "Intervalos sao comuns em analise: estoque entre dois valores, datas dentro de um periodo, preco dentro de uma faixa. No mundo real, relatorio quase nunca pergunta tudo; ele pergunta um recorte claro.",
  });
  addTextNote("sql-city-06-combined", {
    title: "A ordem mental da consulta",
    content:
      "Para montar consultas maiores, pense nesta ordem: escolha a tabela, escolha as colunas, filtre as linhas, organize ou resuma, e so no final limite a resposta. Essa ordem mental evita misturar WHERE, ORDER BY, GROUP BY e LIMIT de qualquer jeito.",
  });
  addTextNote("sql-city-07-boss", {
    title: "Preparacao para mercado, castelo e relacoes",
    content:
      "Daqui para frente, quase toda consulta usa algo que voce ja viu: SELECT/FROM para buscar, WHERE para recortar, ORDER BY para organizar, GROUP BY para resumir e JOIN para juntar tabelas. Se travar, volte para essas perguntas: o que eu quero mostrar, de onde vem, quais linhas entram e qual criterio organiza a resposta?",
  });
  addTextNote("sql-city-05b-status-filter", {
    title: "Status alimenta somas e contagens",
    content:
      "Pedidos pagos, pendentes e cancelados costumam entrar em relatorios diferentes. Quando voce aprender SUM e COUNT, vai usar filtros de status para somar so o que realmente deve contar.",
  });
  addTextNote("sql-city-05c-date-filter", {
    title: "Datas viram linha do tempo",
    content:
      "Filtrar por data responde periodo. Ordenar por data mostra sequencia. Agrupar por alguma coluna dentro de um periodo cria relatorio. A mesma coluna pode participar de varias camadas da consulta.",
  });
  addTextNote("sql-city-06b-filter-columns", {
    title: "Filtrar nao obriga mostrar",
    content:
      "Essa ideia fica muito importante em JOIN e GROUP BY. Voce pode filtrar por status, agrupar por cliente_id e mostrar apenas o nome do cliente com um total. Nem toda coluna usada na logica precisa aparecer no resultado final.",
  });
  addTextNote("sql-city-06d-filter-review", {
    title: "Ponte para o modulo 3",
    content:
      "Depois de filtrar corretamente, o proximo passo natural e ordenar. Uma consulta sem ORDER BY pode ate estar certa, mas talvez fique ruim de ler. No modulo 3, voce vai aprender a transformar listas filtradas em listas organizadas.",
  });
}

function addTextNote(
  stageId: string,
  note: Omit<Extract<StageContent, { type: "text" }>, "type">
) {
  const stage = [...zeroToBasicsStages, ...basicsToIntermediateStages].find((item) => (
    item.id === stageId
  ));

  if (!stage) {
    return;
  }

  const firstTextIndex = stage.content.findIndex((content) => content.type === "text");

  if (firstTextIndex < 0 || stage.content[firstTextIndex].type !== "text") {
    return;
  }

  stage.content[firstTextIndex] = {
    ...stage.content[firstTextIndex],
    content: `${stage.content[firstTextIndex].content}\n\nLembrete de rota: ${note.content}`,
  };
}

addFoundationReviewNotes();

addReinforcements(intermediateStages, [
  {
    id: "sql-market-01b-why-sort-readability",
    chapterId: "sql-chapter-3",
    order: 1.5,
    title: "Ordenar para ler melhor",
    description: "Entenda ORDER BY como organizacao visual.",
    lesson:
      "Sem ORDER BY, o banco nao promete uma ordem significativa. Ordenar transforma uma lista solta em algo legivel: nomes alfabeticos, precos crescentes, estoque do maior para o menor.",
    exampleTitle: "Clientes por nome",
    exampleExplanation: "ORDER BY nome deixa a lista alfabetica.",
    exampleCode: "SELECT * FROM clientes ORDER BY nome;",
    exampleResult: "clientes em ordem alfabetica",
    objective: "Liste clientes em ordem alfabetica pelo nome.",
    expectedAnswer: "SELECT * FROM clientes ORDER BY nome;",
    hint: "Use ORDER BY nome.",
  },
  {
    id: "sql-market-01c-sort-selected-columns",
    chapterId: "sql-chapter-3",
    order: 1.8,
    title: "Ordenar sem mostrar tudo",
    description: "Combine colunas escolhidas e ordenacao.",
    lesson:
      "ORDER BY funciona mesmo quando voce mostra poucas colunas. O resultado fica menor, mas ainda organizado pelo criterio escolhido.",
    exampleTitle: "Nomes organizados",
    exampleExplanation: "Mostra nome e cidade, ordenando por nome.",
    exampleCode: "SELECT nome, cidade FROM clientes ORDER BY nome;",
    exampleResult: "nome e cidade em ordem alfabetica",
    objective: "Mostre nome e cidade dos clientes ordenados por nome.",
    expectedAnswer: "SELECT nome, cidade FROM clientes ORDER BY nome;",
    hint: "Selecione nome, cidade e finalize com ORDER BY nome.",
  },
  {
    id: "sql-market-02b-price-ascending",
    chapterId: "sql-chapter-3",
    order: 2.5,
    title: "Do menor para o maior",
    description: "Use ordem crescente para valores.",
    lesson:
      "A ordem crescente e o padrao do ORDER BY. Em numeros, isso significa menor para maior. E util para achar produtos baratos ou primeiras datas.",
    exampleTitle: "Produtos baratos primeiro",
    exampleExplanation: "ORDER BY preco coloca menores precos no topo.",
    exampleCode: "SELECT nome, preco FROM produtos ORDER BY preco;",
    exampleResult: "produtos do mais barato ao mais caro",
    objective: "Mostre nome e preco dos produtos do menor preco para o maior.",
    expectedAnswer: "SELECT nome, preco FROM produtos ORDER BY preco;",
    hint: "Use ORDER BY preco.",
  },
  {
    id: "sql-market-02c-date-ascending",
    chapterId: "sql-chapter-3",
    order: 2.8,
    title: "Datas em sequencia",
    description: "Ordene eventos do antigo ao recente.",
    lesson:
      "Datas crescentes contam a historia do tempo. Em pedidos, ordenar por data ajuda a ver a sequencia de compras.",
    exampleTitle: "Linha do tempo",
    exampleExplanation: "Pedidos mais antigos aparecem primeiro.",
    exampleCode: "SELECT * FROM pedidos ORDER BY data;",
    exampleResult: "pedidos em ordem de data",
    objective: "Liste pedidos ordenados por data.",
    expectedAnswer: "SELECT * FROM pedidos ORDER BY data;",
    hint: "Use ORDER BY data.",
  },
  {
    id: "sql-market-03b-desc-price",
    chapterId: "sql-chapter-3",
    order: 3.5,
    title: "DESC mostra o topo",
    description: "Use decrescente para rankings.",
    lesson:
      "DESC inverte a ordem e coloca os maiores valores primeiro. Quando a pergunta fala em maiores, top, mais caro ou mais vendido, DESC costuma aparecer.",
    exampleTitle: "Produtos mais caros",
    exampleExplanation: "preco DESC coloca os mais caros no topo.",
    exampleCode: "SELECT nome, preco FROM produtos ORDER BY preco DESC;",
    exampleResult: "produtos do mais caro ao mais barato",
    objective: "Mostre nome e preco dos produtos do maior preco para o menor.",
    expectedAnswer: "SELECT nome, preco FROM produtos ORDER BY preco DESC;",
    hint: "Use ORDER BY preco DESC.",
  },
  {
    id: "sql-market-03c-desc-stock",
    chapterId: "sql-chapter-3",
    order: 3.8,
    title: "Maior estoque primeiro",
    description: "Treine DESC em outra coluna.",
    lesson:
      "Ordenar por estoque ajuda a priorizar itens sobrando ou faltando. DESC mostra primeiro o que tem maior quantidade.",
    exampleTitle: "Estoque alto no topo",
    exampleExplanation: "ORDER BY estoque DESC destaca sobras.",
    exampleCode: "SELECT * FROM produtos ORDER BY estoque DESC;",
    exampleResult: "produtos com maior estoque primeiro",
    objective: "Liste produtos ordenados pelo maior estoque primeiro.",
    expectedAnswer: "SELECT * FROM produtos ORDER BY estoque DESC;",
    hint: "Use ORDER BY estoque DESC.",
  },
  {
    id: "sql-market-04b-filter-then-sort",
    chapterId: "sql-chapter-3",
    order: 4.5,
    title: "Filtrar antes de ordenar",
    description: "Entenda a combinacao WHERE + ORDER BY.",
    lesson:
      "WHERE decide quais linhas entram; ORDER BY organiza as linhas que sobraram. Por isso a consulta fica natural: primeiro filtro, depois ordenacao.",
    exampleTitle: "Eletronicos por preco",
    exampleExplanation: "Filtra categoria e ordena pelos mais caros.",
    exampleCode: "SELECT * FROM produtos WHERE categoria = 'eletronicos' ORDER BY preco DESC;",
    exampleResult: "eletronicos do maior preco ao menor",
    objective: "Liste produtos eletronicos ordenados por preco decrescente.",
    expectedAnswer: "SELECT * FROM produtos WHERE categoria = 'eletronicos' ORDER BY preco DESC;",
    hint: "WHERE categoria = 'eletronicos' antes de ORDER BY preco DESC.",
  },
  {
    id: "sql-market-04c-status-date",
    chapterId: "sql-chapter-3",
    order: 4.8,
    title: "Status em ordem de data",
    description: "Organize um subconjunto temporal.",
    lesson:
      "Em telas administrativas, e comum filtrar pedidos por status e ordenar por data. Assim voce ve apenas o grupo que interessa, na sequencia certa.",
    exampleTitle: "Pendentes por data",
    exampleExplanation: "status filtra, data organiza.",
    exampleCode: "SELECT * FROM pedidos WHERE status = 'pendente' ORDER BY data;",
    exampleResult: "pedidos pendentes em ordem",
    objective: "Liste pedidos pendentes ordenados por data.",
    expectedAnswer: "SELECT * FROM pedidos WHERE status = 'pendente' ORDER BY data;",
    hint: "Use WHERE status = 'pendente' ORDER BY data.",
  },
  {
    id: "sql-market-05b-top-products",
    chapterId: "sql-chapter-3",
    order: 5.5,
    title: "Top N com LIMIT",
    description: "Use LIMIT junto de DESC.",
    lesson:
      "LIMIT sem ORDER BY pega uma amostra. LIMIT com ORDER BY cria um top. Para ver os itens mais caros, ordene por preco DESC e limite o resultado.",
    exampleTitle: "Top 3 caros",
    exampleExplanation: "DESC define o ranking; LIMIT corta os 3 primeiros.",
    exampleCode: "SELECT * FROM produtos ORDER BY preco DESC LIMIT 3;",
    exampleResult: "3 produtos mais caros",
    objective: "Liste os 3 produtos mais caros.",
    expectedAnswer: "SELECT * FROM produtos ORDER BY preco DESC LIMIT 3;",
    hint: "ORDER BY preco DESC LIMIT 3.",
  },
  {
    id: "sql-market-05c-top-stock",
    chapterId: "sql-chapter-3",
    order: 5.8,
    title: "Top estoque",
    description: "Aplique top N a outra metrica.",
    lesson:
      "A mesma estrutura serve para qualquer metrica numerica. Troque a coluna do ORDER BY e voce muda o criterio do ranking.",
    exampleTitle: "Mais estoque",
    exampleExplanation: "Os dois maiores estoques aparecem.",
    exampleCode: "SELECT nome, estoque FROM produtos ORDER BY estoque DESC LIMIT 2;",
    exampleResult: "2 produtos com maior estoque",
    objective: "Mostre nome e estoque dos 2 produtos com maior estoque.",
    expectedAnswer: "SELECT nome, estoque FROM produtos ORDER BY estoque DESC LIMIT 2;",
    hint: "Use ORDER BY estoque DESC LIMIT 2.",
  },
  {
    id: "sql-market-06b-offset-page-two",
    chapterId: "sql-chapter-3",
    order: 6.2,
    title: "OFFSET pula linhas",
    description: "Entenda paginacao.",
    lesson:
      "OFFSET pula uma quantidade de linhas antes de retornar. Com LIMIT, ele simula paginas: LIMIT define o tamanho da pagina, OFFSET define quantas linhas ja ficaram para tras.",
    exampleTitle: "Segunda pagina",
    exampleExplanation: "Ordena nomes, pula 3 e pega 3.",
    exampleCode: "SELECT * FROM clientes ORDER BY nome LIMIT 3 OFFSET 3;",
    exampleResult: "segunda pagina de clientes",
    objective: "Liste a segunda pagina de clientes com 3 por pagina, ordenados por nome.",
    expectedAnswer: "SELECT * FROM clientes ORDER BY nome LIMIT 3 OFFSET 3;",
    hint: "ORDER BY nome LIMIT 3 OFFSET 3.",
  },
  {
    id: "sql-market-06c-limit-after-filter",
    chapterId: "sql-chapter-3",
    order: 6.4,
    title: "Pagina filtrada",
    description: "Limite depois de filtrar e ordenar.",
    lesson:
      "Quando junta WHERE, ORDER BY e LIMIT, pense em etapas: filtra o grupo, organiza, depois pega uma parte. Isso evita confundir LIMIT com filtro.",
    exampleTitle: "Eletronicos top 3",
    exampleExplanation: "Filtra eletronicos, ordena por preco e pega 3.",
    exampleCode: "SELECT * FROM produtos WHERE categoria = 'eletronicos' ORDER BY preco DESC LIMIT 3;",
    exampleResult: "3 eletronicos mais caros",
    objective: "Liste os 3 eletronicos mais caros.",
    expectedAnswer: "SELECT * FROM produtos WHERE categoria = 'eletronicos' ORDER BY preco DESC LIMIT 3;",
    hint: "WHERE categoria, ORDER BY preco DESC, LIMIT 3.",
  },
  {
    id: "sql-market-06d-market-review",
    chapterId: "sql-chapter-3",
    order: 6.6,
    title: "Revisao do mercado",
    description: "Misture filtro, ordenacao e limite.",
    lesson:
      "Consultas de lista quase sempre usam este trio: WHERE para escolher, ORDER BY para organizar e LIMIT para controlar tamanho. Dominar essa ordem deixa suas telas e relatorios mais previsiveis.",
    exampleTitle: "Pedidos do cliente 2",
    exampleExplanation: "Filtra cliente e ordena por data.",
    exampleCode: "SELECT * FROM pedidos WHERE cliente_id = 2 ORDER BY data;",
    exampleResult: "pedidos do cliente 2 em sequencia",
    objective: "Liste pedidos do cliente 2 ordenados por data.",
    expectedAnswer: "SELECT * FROM pedidos WHERE cliente_id = 2 ORDER BY data;",
    hint: "Use WHERE cliente_id = 2 ORDER BY data.",
  },
]);

addReinforcements(intermediateToAdvancedStages, [
  {
    id: "sql-stats-01b-count-all",
    chapterId: "sql-chapter-4",
    order: 1.5,
    title: "COUNT mede volume",
    description: "Conte linhas de uma tabela.",
    lesson:
      "COUNT(*) responde quantas linhas existem depois dos filtros. Ele nao mostra os registros, ele resume o volume. E uma das agregacoes mais usadas.",
    exampleTitle: "Quantidade de produtos",
    exampleExplanation: "COUNT(*) conta linhas de produtos.",
    exampleCode: "SELECT COUNT(*) FROM produtos;",
    exampleResult: "numero total de produtos",
    objective: "Conte todos os produtos.",
    expectedAnswer: "SELECT COUNT(*) FROM produtos;",
    hint: "Use SELECT COUNT(*) FROM produtos.",
    xp: 85,
    coins: 45,
  },
  {
    id: "sql-stats-01c-count-filtered",
    chapterId: "sql-chapter-4",
    order: 1.8,
    title: "COUNT com filtro",
    description: "Conte apenas linhas que importam.",
    lesson:
      "Agregacoes respeitam WHERE. Primeiro o banco filtra as linhas, depois calcula o resumo. Isso permite contar produtos de uma categoria, pedidos pagos ou clientes de uma cidade.",
    exampleTitle: "Eletronicos contados",
    exampleExplanation: "Conta apenas produtos da categoria eletronicos.",
    exampleCode: "SELECT COUNT(*) FROM produtos WHERE categoria = 'eletronicos';",
    exampleResult: "quantidade de eletronicos",
    objective: "Conte produtos da categoria eletronicos.",
    expectedAnswer: "SELECT COUNT(*) FROM produtos WHERE categoria = 'eletronicos';",
    hint: "Use COUNT(*) com WHERE categoria = 'eletronicos'.",
    xp: 85,
    coins: 45,
  },
  {
    id: "sql-stats-02b-sum-quantity",
    chapterId: "sql-chapter-4",
    order: 2.5,
    title: "SUM soma valores",
    description: "Some quantidades de pedidos.",
    lesson:
      "SUM calcula o total de uma coluna numerica. Em pedidos, somar quantidade responde quantos itens foram vendidos no total.",
    exampleTitle: "Itens vendidos",
    exampleExplanation: "Soma a coluna quantidade.",
    exampleCode: "SELECT SUM(quantidade) FROM pedidos;",
    exampleResult: "total de itens vendidos",
    objective: "Some a quantidade total de pedidos.",
    expectedAnswer: "SELECT SUM(quantidade) FROM pedidos;",
    hint: "Use SUM(quantidade) FROM pedidos.",
    xp: 90,
    coins: 50,
  },
  {
    id: "sql-stats-02c-avg-price",
    chapterId: "sql-chapter-4",
    order: 2.8,
    title: "AVG encontra media",
    description: "Calcule preco medio.",
    lesson:
      "AVG calcula a media de uma coluna numerica. Ela ajuda a entender um valor tipico sem olhar item por item.",
    exampleTitle: "Preco medio",
    exampleExplanation: "Media dos precos da tabela produtos.",
    exampleCode: "SELECT AVG(preco) FROM produtos;",
    exampleResult: "preco medio dos produtos",
    objective: "Calcule a media de preco dos produtos.",
    expectedAnswer: "SELECT AVG(preco) FROM produtos;",
    hint: "Use AVG(preco) FROM produtos.",
    xp: 90,
    coins: 50,
  },
  {
    id: "sql-stats-03b-group-category-count",
    chapterId: "sql-chapter-4",
    order: 3.5,
    title: "GROUP BY separa grupos",
    description: "Conte por categoria.",
    lesson:
      "GROUP BY cria pequenos conjuntos dentro da tabela. Em vez de um COUNT geral, voce recebe um COUNT por categoria, cidade ou cliente.",
    exampleTitle: "Produtos por categoria",
    exampleExplanation: "Cada categoria ganha sua contagem.",
    exampleCode: "SELECT categoria, COUNT(*) FROM produtos GROUP BY categoria;",
    exampleResult: "contagem por categoria",
    objective: "Conte produtos por categoria.",
    expectedAnswer: "SELECT categoria, COUNT(*) FROM produtos GROUP BY categoria;",
    hint: "Selecione categoria e COUNT(*), agrupando por categoria.",
    xp: 100,
    coins: 55,
  },
  {
    id: "sql-stats-03c-group-client-count",
    chapterId: "sql-chapter-4",
    order: 3.8,
    title: "Pedidos por cliente",
    description: "Agrupe compras por cliente_id.",
    lesson:
      "Quando voce agrupa por cliente_id, cada cliente vira uma linha resumida. Isso prepara o caminho para relatorios de comportamento.",
    exampleTitle: "Volume por cliente",
    exampleExplanation: "COUNT(*) conta pedidos dentro de cada cliente_id.",
    exampleCode: "SELECT cliente_id, COUNT(*) FROM pedidos GROUP BY cliente_id;",
    exampleResult: "numero de pedidos por cliente",
    objective: "Conte pedidos por cliente_id.",
    expectedAnswer: "SELECT cliente_id, COUNT(*) FROM pedidos GROUP BY cliente_id;",
    hint: "GROUP BY cliente_id.",
    xp: 100,
    coins: 55,
  },
  {
    id: "sql-stats-04b-having-count",
    chapterId: "sql-chapter-4",
    order: 4.5,
    title: "HAVING filtra grupos",
    description: "Mostre apenas grupos fortes.",
    lesson:
      "WHERE filtra linhas antes do agrupamento. HAVING filtra grupos depois do calculo. Se a condicao usa COUNT, SUM ou AVG do grupo, pense em HAVING.",
    exampleTitle: "Clientes recorrentes",
    exampleExplanation: "Depois de contar pedidos por cliente, HAVING remove grupos pequenos.",
    exampleCode: "SELECT cliente_id, COUNT(*) FROM pedidos GROUP BY cliente_id HAVING COUNT(*) > 3;",
    exampleResult: "clientes com mais de 3 pedidos",
    objective: "Liste clientes com mais de 3 pedidos.",
    expectedAnswer: "SELECT cliente_id, COUNT(*) FROM pedidos GROUP BY cliente_id HAVING COUNT(*) > 3;",
    hint: "Use GROUP BY cliente_id HAVING COUNT(*) > 3.",
    xp: 110,
    coins: 60,
  },
  {
    id: "sql-stats-04c-having-sum",
    chapterId: "sql-chapter-4",
    order: 4.8,
    title: "HAVING com soma",
    description: "Filtre grupos por total vendido.",
    lesson:
      "SUM por grupo cria totais. HAVING permite manter apenas os grupos que passam de um limite, como produtos com muitas unidades vendidas.",
    exampleTitle: "Produtos muito vendidos",
    exampleExplanation: "Agrupa por produto_id e filtra soma alta.",
    exampleCode: "SELECT produto_id, SUM(quantidade) FROM pedidos GROUP BY produto_id HAVING SUM(quantidade) > 50;",
    exampleResult: "produtos com mais de 50 unidades vendidas",
    objective: "Liste produtos cuja soma de quantidade vendida seja maior que 50.",
    expectedAnswer: "SELECT produto_id, SUM(quantidade) FROM pedidos GROUP BY produto_id HAVING SUM(quantidade) > 50;",
    hint: "Use SUM(quantidade) no SELECT e no HAVING.",
    xp: 110,
    coins: 60,
  },
  {
    id: "sql-stats-05b-where-before-group",
    chapterId: "sql-chapter-4",
    order: 5.5,
    title: "WHERE antes do resumo",
    description: "Filtre linhas antes de agrupar.",
    lesson:
      "Se a pergunta pede pedidos pagos por cliente, o status deve ser filtrado antes do GROUP BY. Assim os pedidos pendentes nao entram no calculo.",
    exampleTitle: "Pedidos pagos por cliente",
    exampleExplanation: "WHERE status = 'pago' vem antes do agrupamento.",
    exampleCode: "SELECT cliente_id, COUNT(*) FROM pedidos WHERE status = 'pago' GROUP BY cliente_id;",
    exampleResult: "pedidos pagos por cliente",
    objective: "Conte pedidos pagos por cliente_id.",
    expectedAnswer: "SELECT cliente_id, COUNT(*) FROM pedidos WHERE status = 'pago' GROUP BY cliente_id;",
    hint: "WHERE status = 'pago' antes de GROUP BY.",
    xp: 110,
    coins: 60,
  },
  {
    id: "sql-stats-05c-average-by-category",
    chapterId: "sql-chapter-4",
    order: 5.8,
    title: "Media por categoria",
    description: "Use AVG com GROUP BY.",
    lesson:
      "AVG por grupo responde medias separadas. Em produtos, isso mostra o preco medio de cada categoria.",
    exampleTitle: "Categorias comparadas",
    exampleExplanation: "Cada categoria ganha uma media.",
    exampleCode: "SELECT categoria, AVG(preco) FROM produtos GROUP BY categoria;",
    exampleResult: "preco medio por categoria",
    objective: "Calcule preco medio por categoria.",
    expectedAnswer: "SELECT categoria, AVG(preco) FROM produtos GROUP BY categoria;",
    hint: "SELECT categoria, AVG(preco) ... GROUP BY categoria.",
    xp: 110,
    coins: 60,
  },
  {
    id: "sql-stats-06b-category-threshold",
    chapterId: "sql-chapter-4",
    order: 6.2,
    title: "Categorias populosas",
    description: "Filtre categorias por quantidade.",
    lesson:
      "COUNT por categoria mais HAVING cria uma regra sobre grupos. Isso e util para achar categorias com catalogo grande ou pequeno.",
    exampleTitle: "Categorias com muitos produtos",
    exampleExplanation: "HAVING COUNT(*) > 3 mostra apenas categorias grandes.",
    exampleCode: "SELECT categoria, COUNT(*) FROM produtos GROUP BY categoria HAVING COUNT(*) > 3;",
    exampleResult: "categorias com mais de 3 produtos",
    objective: "Liste categorias com mais de 3 produtos.",
    expectedAnswer: "SELECT categoria, COUNT(*) FROM produtos GROUP BY categoria HAVING COUNT(*) > 3;",
    hint: "Use GROUP BY categoria HAVING COUNT(*) > 3.",
    xp: 115,
    coins: 65,
  },
  {
    id: "sql-stats-06c-order-aggregate",
    chapterId: "sql-chapter-4",
    order: 6.4,
    title: "Ordenando resumos",
    description: "Use ORDER BY depois de agregar.",
    lesson:
      "Depois de agrupar, voce pode ordenar pelo resultado agregado. Isso transforma totais em ranking.",
    exampleTitle: "Produtos por quantidade vendida",
    exampleExplanation: "Soma por produto e ordena pelo total.",
    exampleCode: "SELECT produto_id, SUM(quantidade) FROM pedidos GROUP BY produto_id ORDER BY SUM(quantidade) DESC;",
    exampleResult: "produtos mais vendidos primeiro",
    objective: "Liste produto_id e soma de quantidade, ordenando do maior total para o menor.",
    expectedAnswer: "SELECT produto_id, SUM(quantidade) FROM pedidos GROUP BY produto_id ORDER BY SUM(quantidade) DESC;",
    hint: "GROUP BY produto_id ORDER BY SUM(quantidade) DESC.",
    xp: 115,
    coins: 65,
  },
  {
    id: "sql-stats-06d-stats-review",
    chapterId: "sql-chapter-4",
    order: 6.6,
    title: "Revisao das estatisticas",
    description: "Monte um relatorio filtrado, agrupado e ordenado.",
    lesson:
      "Relatorios reais combinam as pecas: WHERE escolhe linhas, GROUP BY cria grupos, SUM calcula e ORDER BY organiza. Se voce entende a ordem, a consulta deixa de parecer gigante.",
    exampleTitle: "Total pago por cliente",
    exampleExplanation: "Filtra pagos, soma total por cliente e ordena.",
    exampleCode: "SELECT cliente_id, SUM(total) FROM pedidos WHERE status = 'pago' GROUP BY cliente_id ORDER BY SUM(total) DESC;",
    exampleResult: "clientes com maior total pago",
    objective: "Some total de pedidos pagos por cliente_id e ordene do maior para o menor.",
    expectedAnswer: "SELECT cliente_id, SUM(total) FROM pedidos WHERE status = 'pago' GROUP BY cliente_id ORDER BY SUM(total) DESC;",
    hint: "WHERE status, GROUP BY cliente_id, ORDER BY SUM(total) DESC.",
    xp: 120,
    coins: 70,
  },
]);

addReinforcements(advancedStages, [
  {
    id: "sql-relations-01b-foreign-key-reading",
    chapterId: "sql-chapter-5",
    order: 1.5,
    title: "Lendo chaves estrangeiras",
    description: "Entenda IDs que apontam para outras tabelas.",
    lesson:
      "Em pedidos, cliente_id nao e o nome do cliente. Ele e uma referencia para clientes.id. O mesmo acontece com produto_id apontando para produtos.id. Essa ponte e o motivo de JOIN existir.",
    exampleTitle: "Pedido aponta para cliente",
    exampleExplanation: "cliente_id = 2 significa que o pedido pertence ao cliente de id 2.",
    exampleCode: "SELECT id, cliente_id, produto_id FROM pedidos;",
    exampleResult: "pedidos mostrando referencias",
    objective: "Mostre id, cliente_id e produto_id dos pedidos.",
    expectedAnswer: "SELECT id, cliente_id, produto_id FROM pedidos;",
    hint: "Use a tabela pedidos.",
    xp: 120,
    coins: 70,
  },
  {
    id: "sql-relations-01c-id-lookup",
    chapterId: "sql-chapter-5",
    order: 1.8,
    title: "Procurando o dono do ID",
    description: "Use filtro para seguir uma referencia manualmente.",
    lesson:
      "Antes do JOIN, voce pode seguir a pista manualmente: se um pedido tem cliente_id = 2, filtre clientes onde id = 2. JOIN automatiza esse encontro.",
    exampleTitle: "Cliente de id 2",
    exampleExplanation: "Filtra a tabela clientes pelo id.",
    exampleCode: "SELECT * FROM clientes WHERE id = 2;",
    exampleResult: "cliente dono do id 2",
    objective: "Liste o cliente cujo id e 2.",
    expectedAnswer: "SELECT * FROM clientes WHERE id = 2;",
    hint: "Use WHERE id = 2.",
    xp: 120,
    coins: 70,
  },
  {
    id: "sql-relations-02b-inner-join-client-orders",
    chapterId: "sql-chapter-5",
    order: 2.5,
    title: "INNER JOIN com clientes",
    description: "Junte pedidos aos nomes dos clientes.",
    lesson:
      "INNER JOIN combina linhas quando a condicao ON encontra par. Pedidos sem cliente correspondente nao aparecem. O ganho e trocar cliente_id por informacao humana, como clientes.nome.",
    exampleTitle: "Pedido com nome",
    exampleExplanation: "ON conecta pedidos.cliente_id com clientes.id.",
    exampleCode: "SELECT clientes.nome, pedidos.id FROM pedidos INNER JOIN clientes ON pedidos.cliente_id = clientes.id;",
    exampleResult: "pedidos com nome do cliente",
    objective: "Liste nome do cliente e id do pedido juntando pedidos e clientes.",
    expectedAnswer: "SELECT clientes.nome, pedidos.id FROM pedidos INNER JOIN clientes ON pedidos.cliente_id = clientes.id;",
    hint: "Junte pedidos com clientes pelo cliente_id.",
    xp: 130,
    coins: 75,
  },
  {
    id: "sql-relations-02c-inner-join-product-orders",
    chapterId: "sql-chapter-5",
    order: 2.8,
    title: "INNER JOIN com produtos",
    description: "Troque produto_id pelo nome do produto.",
    lesson:
      "O mesmo raciocinio vale para produtos. Quando pedidos.produto_id encontra produtos.id, voce consegue mostrar nome do produto junto com a quantidade comprada.",
    exampleTitle: "Produto vendido",
    exampleExplanation: "Mostra produto e quantidade em cada pedido.",
    exampleCode: "SELECT produtos.nome, pedidos.quantidade FROM pedidos INNER JOIN produtos ON pedidos.produto_id = produtos.id;",
    exampleResult: "quantidade por produto nos pedidos",
    objective: "Liste nome do produto e quantidade do pedido juntando pedidos e produtos.",
    expectedAnswer: "SELECT produtos.nome, pedidos.quantidade FROM pedidos INNER JOIN produtos ON pedidos.produto_id = produtos.id;",
    hint: "ON pedidos.produto_id = produtos.id.",
    xp: 130,
    coins: 75,
  },
  {
    id: "sql-relations-03b-left-join-all-clients",
    chapterId: "sql-chapter-5",
    order: 3.5,
    title: "LEFT JOIN preserva a esquerda",
    description: "Mantenha clientes mesmo sem pedidos.",
    lesson:
      "LEFT JOIN com clientes a esquerda mostra todos os clientes. Se algum nao tiver pedido, as colunas de pedidos ficam vazias. Isso e perfeito para procurar quem ainda nao comprou.",
    exampleTitle: "Todos os clientes e pedidos",
    exampleExplanation: "Clientes ficam preservados.",
    exampleCode: "SELECT clientes.nome, pedidos.id FROM clientes LEFT JOIN pedidos ON clientes.id = pedidos.cliente_id;",
    exampleResult: "clientes com ou sem pedido",
    objective: "Liste nome dos clientes e id dos pedidos usando LEFT JOIN.",
    expectedAnswer: "SELECT clientes.nome, pedidos.id FROM clientes LEFT JOIN pedidos ON clientes.id = pedidos.cliente_id;",
    hint: "clientes LEFT JOIN pedidos ON clientes.id = pedidos.cliente_id.",
    xp: 135,
    coins: 80,
  },
  {
    id: "sql-relations-03c-left-join-products",
    chapterId: "sql-chapter-5",
    order: 3.8,
    title: "Produtos mesmo sem venda",
    description: "Use LEFT JOIN para inventario completo.",
    lesson:
      "Quando a tabela da esquerda e produtos, LEFT JOIN mantem todos os produtos. Isso ajuda a ver itens vendidos e tambem os que ainda nao aparecem em pedidos.",
    exampleTitle: "Catalogo com pedidos",
    exampleExplanation: "Produtos ficam todos no resultado.",
    exampleCode: "SELECT produtos.nome, pedidos.id FROM produtos LEFT JOIN pedidos ON produtos.id = pedidos.produto_id;",
    exampleResult: "produtos relacionados a pedidos quando houver",
    objective: "Liste nome dos produtos e id dos pedidos usando LEFT JOIN.",
    expectedAnswer: "SELECT produtos.nome, pedidos.id FROM produtos LEFT JOIN pedidos ON produtos.id = pedidos.produto_id;",
    hint: "produtos LEFT JOIN pedidos ON produtos.id = pedidos.produto_id.",
    xp: 135,
    coins: 80,
  },
  {
    id: "sql-relations-04b-join-with-filter",
    chapterId: "sql-chapter-5",
    order: 4.5,
    title: "JOIN com filtro",
    description: "Junte tabelas e depois filtre.",
    lesson:
      "Depois de juntar tabelas, WHERE pode usar colunas de qualquer tabela envolvida. Isso permite perguntar por pedidos pagos mostrando nomes de clientes.",
    exampleTitle: "Pedidos pagos com cliente",
    exampleExplanation: "JOIN monta os nomes; WHERE escolhe status pago.",
    exampleCode: "SELECT clientes.nome, pedidos.status FROM pedidos INNER JOIN clientes ON pedidos.cliente_id = clientes.id WHERE pedidos.status = 'pago';",
    exampleResult: "clientes em pedidos pagos",
    objective: "Liste nome do cliente e status para pedidos pagos, juntando pedidos e clientes.",
    expectedAnswer: "SELECT clientes.nome, pedidos.status FROM pedidos INNER JOIN clientes ON pedidos.cliente_id = clientes.id WHERE pedidos.status = 'pago';",
    hint: "JOIN pedidos/clientes e WHERE pedidos.status = 'pago'.",
    xp: 140,
    coins: 85,
  },
  {
    id: "sql-relations-04c-join-with-order",
    chapterId: "sql-chapter-5",
    order: 4.8,
    title: "JOIN ordenado",
    description: "Organize resultados relacionados.",
    lesson:
      "Um JOIN pode retornar muitas linhas. ORDER BY torna esse resultado mais facil de ler, principalmente quando voce ordena por nome ou data.",
    exampleTitle: "Pedidos por cliente",
    exampleExplanation: "Mostra nomes de clientes em ordem alfabetica.",
    exampleCode: "SELECT clientes.nome, pedidos.id FROM pedidos INNER JOIN clientes ON pedidos.cliente_id = clientes.id ORDER BY clientes.nome;",
    exampleResult: "pedidos organizados por nome do cliente",
    objective: "Liste nome do cliente e id do pedido, ordenando por nome do cliente.",
    expectedAnswer: "SELECT clientes.nome, pedidos.id FROM pedidos INNER JOIN clientes ON pedidos.cliente_id = clientes.id ORDER BY clientes.nome;",
    hint: "ORDER BY clientes.nome.",
    xp: 140,
    coins: 85,
  },
  {
    id: "sql-relations-05b-join-calculated-total",
    chapterId: "sql-chapter-5",
    order: 5.5,
    title: "Calculo entre tabelas",
    description: "Multiplique quantidade por preco.",
    lesson:
      "Quando pedidos guarda quantidade e produtos guarda preco, o valor da linha nasce da combinacao das duas tabelas. Esse e um motivo forte para usar JOIN.",
    exampleTitle: "Valor por item vendido",
    exampleExplanation: "quantidade * preco calcula o valor daquele item no pedido.",
    exampleCode: "SELECT produtos.nome, pedidos.quantidade * produtos.preco FROM pedidos INNER JOIN produtos ON pedidos.produto_id = produtos.id;",
    exampleResult: "valor calculado por pedido/produto",
    objective: "Liste nome do produto e quantidade vezes preco juntando pedidos e produtos.",
    expectedAnswer: "SELECT produtos.nome, pedidos.quantidade * produtos.preco FROM pedidos INNER JOIN produtos ON pedidos.produto_id = produtos.id;",
    hint: "Use pedidos.quantidade * produtos.preco no SELECT.",
    xp: 145,
    coins: 90,
  },
  {
    id: "sql-relations-05c-total-by-client",
    chapterId: "sql-chapter-5",
    order: 5.8,
    title: "Total por cliente",
    description: "Agrupe depois de juntar.",
    lesson:
      "JOIN reconstrói as linhas completas. GROUP BY resume por cliente. SUM calcula quanto cada cliente movimentou.",
    exampleTitle: "Gasto por cliente",
    exampleExplanation: "Junta tres tabelas e soma quantidade * preco por cliente.",
    exampleCode: "SELECT clientes.nome, SUM(pedidos.quantidade * produtos.preco) FROM pedidos INNER JOIN clientes ON pedidos.cliente_id = clientes.id INNER JOIN produtos ON pedidos.produto_id = produtos.id GROUP BY clientes.nome;",
    exampleResult: "total gasto por cliente",
    objective: "Liste nome do cliente e total gasto, juntando pedidos, clientes e produtos e agrupando por cliente.",
    expectedAnswer: "SELECT clientes.nome, SUM(pedidos.quantidade * produtos.preco) FROM pedidos INNER JOIN clientes ON pedidos.cliente_id = clientes.id INNER JOIN produtos ON pedidos.produto_id = produtos.id GROUP BY clientes.nome;",
    hint: "Junte as tres tabelas e agrupe por clientes.nome.",
    xp: 150,
    coins: 95,
  },
  {
    id: "sql-relations-06b-subquery-in",
    chapterId: "sql-chapter-5",
    order: 6.2,
    title: "IN usa listas",
    description: "Use subquery para gerar lista de ids.",
    lesson:
      "IN compara um valor com uma lista. Quando essa lista vem de uma subquery, a consulta externa fica dinamica: ela usa ids que existem em outra tabela.",
    exampleTitle: "Clientes com pedidos",
    exampleExplanation: "A subquery gera cliente_id a partir de pedidos.",
    exampleCode: "SELECT * FROM clientes WHERE id IN (SELECT cliente_id FROM pedidos);",
    exampleResult: "clientes que aparecem em pedidos",
    objective: "Liste clientes que possuem pedido usando IN com subquery.",
    expectedAnswer: "SELECT * FROM clientes WHERE id IN (SELECT cliente_id FROM pedidos);",
    hint: "id IN (SELECT cliente_id FROM pedidos).",
    xp: 150,
    coins: 95,
  },
  {
    id: "sql-relations-06c-subquery-products",
    chapterId: "sql-chapter-5",
    order: 6.4,
    title: "Produtos vendidos",
    description: "Use subquery em outra tabela.",
    lesson:
      "A mesma tecnica encontra produtos que aparecem em pedidos. A consulta interna devolve produto_id e a externa procura produtos cujo id esta nessa lista.",
    exampleTitle: "Produtos com venda",
    exampleExplanation: "IN compara produtos.id com pedidos.produto_id.",
    exampleCode: "SELECT * FROM produtos WHERE id IN (SELECT produto_id FROM pedidos);",
    exampleResult: "produtos que foram vendidos",
    objective: "Liste produtos que aparecem em pedidos usando subquery.",
    expectedAnswer: "SELECT * FROM produtos WHERE id IN (SELECT produto_id FROM pedidos);",
    hint: "id IN (SELECT produto_id FROM pedidos).",
    xp: 150,
    coins: 95,
  },
  {
    id: "sql-relations-06d-final-ranking-prep",
    chapterId: "sql-chapter-5",
    order: 6.6,
    title: "Preparando ranking final",
    description: "Some, agrupe, ordene e limite.",
    lesson:
      "O relatorio final e uma escada: JOIN para juntar nomes e precos, SUM para calcular total, GROUP BY para resumir por cliente, ORDER BY para ranquear e LIMIT para cortar o topo.",
    exampleTitle: "Top clientes por gasto",
    exampleExplanation: "A estrutura e igual ao chefe final, mas agora voce entende cada camada.",
    exampleCode: "SELECT clientes.nome, SUM(pedidos.quantidade * produtos.preco) FROM pedidos INNER JOIN clientes ON pedidos.cliente_id = clientes.id INNER JOIN produtos ON pedidos.produto_id = produtos.id GROUP BY clientes.nome ORDER BY SUM(pedidos.quantidade * produtos.preco) DESC LIMIT 3;",
    exampleResult: "3 clientes que mais gastaram",
    objective: "Monte o top 3 clientes por gasto total.",
    expectedAnswer: "SELECT clientes.nome, SUM(pedidos.quantidade * produtos.preco) FROM pedidos INNER JOIN clientes ON pedidos.cliente_id = clientes.id INNER JOIN produtos ON pedidos.produto_id = produtos.id GROUP BY clientes.nome ORDER BY SUM(pedidos.quantidade * produtos.preco) DESC LIMIT 3;",
    hint: "Use JOIN triplo, GROUP BY clientes.nome, ORDER BY SUM(...) DESC e LIMIT 3.",
    xp: 160,
    coins: 100,
  },
]);
