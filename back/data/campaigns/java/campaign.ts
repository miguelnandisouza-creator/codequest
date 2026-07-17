import { createCampaign } from "@/data/campaigns/createCampaign";
import { StageContent, StageType } from "@/domain/entities/stage";

type Drill = {
  title: string;
  focus: string;
  example: string;
  result: string;
  objective: string;
  expectedAnswer: string;
  hint: string;
};

type ModuleConfig = {
  id: string;
  title: string;
  description: string;
  scene: string;
  review: string;
  quiz: {
    question: string;
    options: string[];
    correctAnswer: string;
    explanation: string;
  };
  drills: Drill[];
  boss: Drill;
};

type StageInput = {
  id: string;
  order: number;
  title: string;
  description: string;
  type: StageType;
  xp: number;
  coins: number;
  content: StageContent[];
};

function text(title: string, content: string): StageContent {
  return { type: "text", title, content };
}

function example(title: string, explanation: string, code: string, result: string): StageContent {
  return { type: "example", title, explanation, code, result };
}

function quiz(
  title: string,
  question: string,
  options: string[],
  correctAnswer: string,
  explanation: string
): StageContent {
  return { type: "quiz", title, question, options, correctAnswer, explanation };
}

function challenge(title: string, objective: string, expectedAnswer: string, hint: string): StageContent {
  return { type: "challenge", title, objective, expectedAnswer, hint };
}

function boss(title: string, objective: string, expectedAnswer: string, hint: string): StageContent {
  return { type: "boss", title, objective, expectedAnswer, hint };
}

function createLessonStage(module: ModuleConfig, chapterOrder: number, drill: Drill, order: number): StageInput {
  const type: StageType = order === 10 ? "boss" : order === 1 || order === 6 ? "quiz" : "challenge";
  const isBoss = type === "boss";
  const isQuiz = type === "quiz";

  return {
    id: `${module.id}-${String(order).padStart(2, "0")}`,
    order,
    title: drill.title,
    description: drill.focus,
    type,
    xp: isBoss ? 160 + chapterOrder * 12 : 55 + chapterOrder * 6,
    coins: isBoss ? 85 + chapterOrder * 5 : 25 + chapterOrder * 3,
    content: [
      text(
        `${module.scene}: ${drill.title}`,
        [
          drill.focus,
          module.review,
          "Leia o objetivo, identifique quais valores existem, escolha o tipo certo e escreva a menor solucao que prove a ideia. Em Java, clareza vem antes de decorar palavras.",
        ].join("\n\n")
      ),
      example("Exemplo guiado", "Observe a estrutura antes de tentar. O terminal Java do caderno entende este tipo de trecho.", drill.example, drill.result),
      isQuiz
        ? quiz("Conferencia tecnica", module.quiz.question, module.quiz.options, module.quiz.correctAnswer, module.quiz.explanation)
        : isBoss
          ? boss("Desafio de chefe", drill.objective, drill.expectedAnswer, drill.hint)
          : challenge("Missao pratica", drill.objective, drill.expectedAnswer, drill.hint),
    ],
  };
}

function createModuleStages(module: ModuleConfig, chapterOrder: number) {
  const opening: Drill = {
    title: `Mapa do modulo: ${module.title.replace(/^Modulo \d+: /, "")}`,
    focus: module.description,
    example: module.drills[0].example,
    result: module.drills[0].result,
    objective: "",
    expectedAnswer: "",
    hint: "",
  };

  return [
    createLessonStage(module, chapterOrder, opening, 1),
    ...module.drills.map((drill, index) => createLessonStage(module, chapterOrder, drill, index + 2)),
    createLessonStage(module, chapterOrder, module.boss, 10),
  ];
}

const modules: ModuleConfig[] = [
  {
    id: "java-01-foundation",
    title: "Modulo 1: Primeiros Passos no Java",
    description: "Entenda como um programa comeca, como imprimir informacoes e como guardar valores simples.",
    scene: "Oficina do Compilador",
    review: "Tudo que vier depois depende desta base: classe, main, instrucao, ponto e virgula, tipo e nome de variavel.",
    quiz: {
      question: "Qual parte o Java procura para iniciar um programa comum?",
      options: ["public static void main(String[] args)", "System.out.println", "String nome", "int idade"],
      correctAnswer: "public static void main(String[] args)",
      explanation: "O metodo main e o ponto de entrada. Variaveis e prints acontecem dentro desse fluxo.",
    },
    drills: [
      { title: "Ola com println", focus: "System.out.println imprime uma linha e pula para a proxima.", example: "System.out.println(\"Ola, Java\");", result: "Ola, Java", objective: "Imprima exatamente Bem-vindo ao Java.", expectedAnswer: "System.out.println(\"Bem-vindo ao Java\");", hint: "Use System.out.println com o texto entre aspas." },
      { title: "Print sem quebra", focus: "System.out.print escreve sem pular linha; isso ajuda a montar mensagens em partes.", example: "System.out.print(\"Nivel \");\nSystem.out.println(1);", result: "Nivel 1", objective: "Use print para escrever Code e println para escrever Quest.", expectedAnswer: "System.out.print(\"Code\");\nSystem.out.println(\"Quest\");", hint: "A primeira chamada usa print; a segunda usa println." },
      { title: "Ponto e virgula", focus: "Cada instrucao simples termina com ponto e virgula; ele separa uma ordem da outra.", example: "int xp = 10;\nSystem.out.println(xp);", result: "10", objective: "Declare int xp com valor 50.", expectedAnswer: "int xp = 50;", hint: "Tipo, nome, igual, valor e ponto e virgula." },
      { title: "Texto em String", focus: "String guarda texto. O S maiusculo importa porque String e uma classe do Java.", example: "String nome = \"Ana\";\nSystem.out.println(nome);", result: "Ana", objective: "Declare String reino com o valor Java.", expectedAnswer: "String reino = \"Java\";", hint: "Use String com S maiusculo e texto entre aspas." },
      { title: "Inteiros com int", focus: "int guarda numeros inteiros para contagem, niveis, idades e quantidades.", example: "int moedas = 25;\nSystem.out.println(moedas);", result: "25", objective: "Declare int vidas com valor 3.", expectedAnswer: "int vidas = 3;", hint: "Nao use aspas em numeros inteiros." },
      { title: "Decimais com double", focus: "double guarda valores com casas decimais, como preco, media e porcentagem.", example: "double preco = 19.90;\nSystem.out.println(preco);", result: "19.9", objective: "Declare double media com valor 8.5.", expectedAnswer: "double media = 8.5;", hint: "Use ponto, nao virgula, para decimal." },
      { title: "Boolean para decisoes", focus: "boolean guarda true ou false e prepara o caminho para if.", example: "boolean ativo = true;\nSystem.out.println(ativo);", result: "true", objective: "Declare boolean aprovado com valor false.", expectedAnswer: "boolean aprovado = false;", hint: "true e false nao usam aspas." },
      { title: "Concatenacao", focus: "O operador + junta texto com valores e transforma a saida em mensagem legivel.", example: "String nome = \"Ana\";\nint nivel = 2;\nSystem.out.println(nome + \" nivel \" + nivel);", result: "Ana nivel 2", objective: "Imprima nome + \" tem \" + idade + \" anos\".", expectedAnswer: "System.out.println(nome + \" tem \" + idade + \" anos\");", hint: "Intercale variaveis com textos entre aspas." },
    ],
    boss: { title: "Chefe: ficha de aventureiro", focus: "Junte tipos e saida em uma pequena ficha.", example: "String nome = \"Biel\";\nint nivel = 4;\nSystem.out.println(nome + \" nivel \" + nivel);", result: "Biel nivel 4", objective: "Declare nome como String, nivel como int e imprima nome + \" chegou ao nivel \" + nivel.", expectedAnswer: "String nome = \"Ana\";\nint nivel = 5;\nSystem.out.println(nome + \" chegou ao nivel \" + nivel);", hint: "Crie as duas variaveis antes do println." },
  },
  {
    id: "java-02-expressions",
    title: "Modulo 2: Operadores e Expressoes",
    description: "Aprenda a calcular, comparar e combinar valores antes de controlar o fluxo.",
    scene: "Forja das Expressoes",
    review: "Operadores aparecem em todos os proximos modulos: if depende de comparacao, loop depende de incremento, metodo devolve expressao.",
    quiz: {
      question: "Qual operador calcula o resto de uma divisao?",
      options: ["%", "/", "*", "&&"],
      correctAnswer: "%",
      explanation: "% e essencial para descobrir pares, ciclos e sobras.",
    },
    drills: [
      { title: "Soma e subtracao", focus: "Use + e - para alterar quantidades numericas.", example: "int total = 10 + 5;\nSystem.out.println(total);", result: "15", objective: "Declare int pontos com 40 + 15.", expectedAnswer: "int pontos = 40 + 15;", hint: "A expressao fica do lado direito do igual." },
      { title: "Multiplicacao", focus: "Multiplicacao calcula totais repetidos, como preco vezes quantidade.", example: "int total = 6 * 4;\nSystem.out.println(total);", result: "24", objective: "Declare int danoTotal com 7 * 3.", expectedAnswer: "int danoTotal = 7 * 3;", hint: "O operador de multiplicacao e *." },
      { title: "Divisao inteira", focus: "Quando os dois lados sao int, Java descarta a parte decimal.", example: "int partes = 7 / 2;\nSystem.out.println(partes);", result: "3", objective: "Declare int grupos com 10 / 3.", expectedAnswer: "int grupos = 10 / 3;", hint: "Com int, o resultado tambem e inteiro." },
      { title: "Resto com modulo", focus: "% retorna o resto e ajuda a testar paridade.", example: "int resto = 10 % 3;\nSystem.out.println(resto);", result: "1", objective: "Declare int resto com 20 % 6.", expectedAnswer: "int resto = 20 % 6;", hint: "Use % entre os dois numeros." },
      { title: "Precedencia", focus: "Multiplicacao e divisao rodam antes de soma; parenteses deixam intencao clara.", example: "int valor = (2 + 3) * 4;\nSystem.out.println(valor);", result: "20", objective: "Declare int total com (5 + 2) * 3.", expectedAnswer: "int total = (5 + 2) * 3;", hint: "Use parenteses para forcar a soma primeiro." },
      { title: "Comparacao maior", focus: "Comparacoes devolvem boolean e alimentam if.", example: "boolean forte = 80 > 50;\nSystem.out.println(forte);", result: "true", objective: "Declare boolean passou com nota >= 7.", expectedAnswer: "boolean passou = nota >= 7;", hint: "Use >= para minimo aceito." },
      { title: "Igualdade correta", focus: "Em Java, == compara valores primitivos; = atribui.", example: "boolean cheio = vidas == 3;", result: "true ou false", objective: "Declare boolean zerado com moedas == 0.", expectedAnswer: "boolean zerado = moedas == 0;", hint: "Dois iguais para comparar." },
      { title: "Logica com E", focus: "&& exige que as duas condicoes sejam verdadeiras.", example: "boolean podeEntrar = nivel >= 5 && temChave;", result: "true ou false", objective: "Declare boolean podeComprar com moedas >= 100 && nivel >= 3.", expectedAnswer: "boolean podeComprar = moedas >= 100 && nivel >= 3;", hint: "As duas comparacoes ficam ligadas por &&." },
    ],
    boss: { title: "Chefe: calculo de recompensa", focus: "Calcule recompensa final com bonus e taxa.", example: "int base = 100;\nint bonus = 25;\nSystem.out.println(base + bonus);", result: "125", objective: "Declare int total com (base + bonus) - desconto.", expectedAnswer: "int total = (base + bonus) - desconto;", hint: "Use parenteses para somar antes de subtrair." },
  },
  {
    id: "java-03-decisions",
    title: "Modulo 3: Decisoes com if e switch",
    description: "Controle caminhos diferentes sem deixar o codigo virar chute.",
    scene: "Ponte das Decisoes",
    review: "Todo sistema real decide: validar login, liberar compra, calcular status, escolher mensagem e bloquear erro.",
    quiz: {
      question: "Quando o bloco else executa?",
      options: ["Quando a condicao do if e falsa", "Antes do if", "Sempre que existe println", "Quando a variavel e String"],
      correctAnswer: "Quando a condicao do if e falsa",
      explanation: "else e o caminho alternativo quando a condicao principal nao passa.",
    },
    drills: [
      { title: "if simples", focus: "if executa um bloco apenas quando a condicao e verdadeira.", example: "if (nivel >= 2) {\n    System.out.println(\"Liberado\");\n}", result: "Liberado se nivel >= 2", objective: "Escreva if que imprime Maior se idade >= 18.", expectedAnswer: "if (idade >= 18) { System.out.println(\"Maior\"); }", hint: "A condicao fica entre parenteses e o bloco entre chaves." },
      { title: "if else", focus: "else cobre o caminho contrario e evita resposta vazia.", example: "if (saldo >= preco) {\n    System.out.println(\"Compra ok\");\n} else {\n    System.out.println(\"Saldo baixo\");\n}", result: "Uma das mensagens", objective: "Se nota >= 7 imprima Aprovado, senao Reprovado.", expectedAnswer: "if (nota >= 7) { System.out.println(\"Aprovado\"); } else { System.out.println(\"Reprovado\"); }", hint: "Use if, bloco, else e outro bloco." },
      { title: "else if", focus: "else if organiza faixas de valor sem varios if soltos.", example: "if (xp >= 1000) {\n    System.out.println(\"Ouro\");\n} else if (xp >= 500) {\n    System.out.println(\"Prata\");\n} else {\n    System.out.println(\"Bronze\");\n}", result: "Ouro, Prata ou Bronze", objective: "Classifique temperatura: acima de 30 Quente, acima de 20 Agradavel, senao Frio.", expectedAnswer: "if (temperatura > 30) { System.out.println(\"Quente\"); } else if (temperatura > 20) { System.out.println(\"Agradavel\"); } else { System.out.println(\"Frio\"); }", hint: "Teste a maior faixa primeiro." },
      { title: "Negacao", focus: "! inverte boolean e ajuda a ler regras como nao ativo.", example: "if (!bloqueado) {\n    System.out.println(\"Pode entrar\");\n}", result: "Pode entrar se bloqueado for false", objective: "Se !logado, imprima Fazer login.", expectedAnswer: "if (!logado) { System.out.println(\"Fazer login\"); }", hint: "O ! vem antes do boolean." },
      { title: "Ou logico", focus: "|| aceita qualquer uma das condicoes.", example: "if (cargo.equals(\"admin\") || cargo.equals(\"mentor\")) {\n    System.out.println(\"Painel liberado\");\n}", result: "Painel liberado", objective: "Se plano equals VIP ou PRO, imprima Beneficio ativo.", expectedAnswer: "if (plano.equals(\"VIP\") || plano.equals(\"PRO\")) { System.out.println(\"Beneficio ativo\"); }", hint: "Para String, use equals; para OU, use ||." },
      { title: "switch classico", focus: "switch deixa escolhas fixas mais limpas que muitos else if.", example: "switch (dia) {\n    case 1:\n        System.out.println(\"Domingo\");\n        break;\n    default:\n        System.out.println(\"Outro\");\n}", result: "Domingo ou Outro", objective: "Use switch em opcao: case 1 imprime Novo; case 2 imprime Carregar; default imprime Sair.", expectedAnswer: "switch (opcao) { case 1: System.out.println(\"Novo\"); break; case 2: System.out.println(\"Carregar\"); break; default: System.out.println(\"Sair\"); }", hint: "Cada case precisa de break no switch classico." },
      { title: "Validacao de entrada", focus: "Antes de calcular, valide se o dado faz sentido.", example: "if (quantidade > 0) {\n    System.out.println(\"Quantidade valida\");\n}", result: "Quantidade valida", objective: "Se senha.length() >= 8 imprima Senha forte, senao Senha curta.", expectedAnswer: "if (senha.length() >= 8) { System.out.println(\"Senha forte\"); } else { System.out.println(\"Senha curta\"); }", hint: "String tem length() para tamanho." },
      { title: "Decisao com calculo", focus: "A condicao pode usar expressao completa.", example: "if (preco * quantidade > 100) {\n    System.out.println(\"Pedido grande\");\n}", result: "Pedido grande", objective: "Se preco * quantidade >= 200, imprima Frete gratis.", expectedAnswer: "if (preco * quantidade >= 200) { System.out.println(\"Frete gratis\"); }", hint: "Calcule dentro da condicao." },
    ],
    boss: { title: "Chefe: portaria do sistema", focus: "Combine boolean, comparacao e mensagem.", example: "if (idade >= 18 && ativo) {\n    System.out.println(\"Entrou\");\n}", result: "Entrou", objective: "Se idade >= 18 e aceitouTermos, imprima Cadastro liberado; senao Cadastro bloqueado.", expectedAnswer: "if (idade >= 18 && aceitouTermos) { System.out.println(\"Cadastro liberado\"); } else { System.out.println(\"Cadastro bloqueado\"); }", hint: "Duas condicoes com && e um else para bloqueio." },
  },
  {
    id: "java-04-loops",
    title: "Modulo 4: Repeticoes sem Medo",
    description: "Use for, while, break e continue para repetir com controle.",
    scene: "Trilha dos Loops",
    review: "Loops aparecem em listas, menus, validacoes, jogos, relatorios e qualquer lugar onde um item vira muitos.",
    quiz: {
      question: "Qual loop e melhor quando voce sabe a quantidade de repeticoes?",
      options: ["for", "if", "switch", "String"],
      correctAnswer: "for",
      explanation: "for concentra inicio, condicao e incremento em uma linha.",
    },
    drills: [
      { title: "for contando", focus: "for e ideal quando existe contador claro.", example: "for (int i = 1; i <= 3; i++) {\n    System.out.println(i);\n}", result: "1\n2\n3", objective: "Imprima numeros de 1 a 5 com for.", expectedAnswer: "for (int i = 1; i <= 5; i++) { System.out.println(i); }", hint: "Comece em 1, rode enquanto i <= 5, incremente com i++." },
      { title: "for regressivo", focus: "O contador tambem pode diminuir.", example: "for (int i = 3; i >= 1; i--) {\n    System.out.println(i);\n}", result: "3\n2\n1", objective: "Imprima de 5 a 1 com for.", expectedAnswer: "for (int i = 5; i >= 1; i--) { System.out.println(i); }", hint: "Use i-- e condicao i >= 1." },
      { title: "while com contador", focus: "while separa preparacao, condicao e incremento.", example: "int i = 0;\nwhile (i < 3) {\n    System.out.println(i);\n    i++;\n}", result: "0\n1\n2", objective: "Use while para imprimir Oi 3 vezes.", expectedAnswer: "int contador = 0;\nwhile (contador < 3) { System.out.println(\"Oi\"); contador++; }", hint: "Nao esqueca de incrementar dentro do while." },
      { title: "Acumulador", focus: "Acumulador guarda um total ao longo do loop.", example: "int soma = 0;\nfor (int i = 1; i <= 3; i++) {\n    soma += i;\n}\nSystem.out.println(soma);", result: "6", objective: "Some de 1 a 5 em int soma usando for.", expectedAnswer: "int soma = 0;\nfor (int i = 1; i <= 5; i++) { soma += i; }", hint: "Crie soma antes do loop e use soma += i." },
      { title: "Filtro dentro do loop", focus: "if dentro de for seleciona apenas parte dos itens.", example: "for (int i = 1; i <= 4; i++) {\n    if (i % 2 == 0) {\n        System.out.println(i);\n    }\n}", result: "2\n4", objective: "Imprima apenas pares de 1 a 10.", expectedAnswer: "for (int i = 1; i <= 10; i++) { if (i % 2 == 0) { System.out.println(i); } }", hint: "Par tem resto zero ao dividir por 2." },
      { title: "break", focus: "break encerra o loop antes da condicao final.", example: "for (int i = 1; i <= 10; i++) {\n    if (i == 4) { break; }\n    System.out.println(i);\n}", result: "1\n2\n3", objective: "Pare o for quando i == 6.", expectedAnswer: "if (i == 6) { break; }", hint: "break fica dentro do if." },
      { title: "continue", focus: "continue pula a volta atual e segue para a proxima.", example: "for (int i = 1; i <= 3; i++) {\n    if (i == 2) { continue; }\n    System.out.println(i);\n}", result: "1\n3", objective: "Pule i == 3 usando continue.", expectedAnswer: "if (i == 3) { continue; }", hint: "continue nao encerra tudo; so pula esta volta." },
      { title: "Loop com texto", focus: "Loops tambem montam mensagens.", example: "for (int i = 1; i <= 2; i++) {\n    System.out.println(\"Fase \" + i);\n}", result: "Fase 1\nFase 2", objective: "Imprima \"Missao \" + i de 1 a 4.", expectedAnswer: "for (int i = 1; i <= 4; i++) { System.out.println(\"Missao \" + i); }", hint: "Concatene texto e contador no println." },
    ],
    boss: { title: "Chefe: relatorio de pares", focus: "Use contador, filtro e acumulador juntos.", example: "int total = 0;\nfor (int i = 1; i <= 4; i++) { total += i; }", result: "10", objective: "Some todos os numeros pares de 1 a 20 em int soma.", expectedAnswer: "int soma = 0;\nfor (int i = 1; i <= 20; i++) { if (i % 2 == 0) { soma += i; } }", hint: "Dentro do if de par, acumule em soma." },
  },
  {
    id: "java-05-methods",
    title: "Modulo 5: Metodos e Organizacao",
    description: "Transforme repeticao mental em funcoes nomeadas, testaveis e reutilizaveis.",
    scene: "Biblioteca dos Metodos",
    review: "Metodos sao a primeira virada de chave para codigo profissional: nome claro, parametro certo, retorno previsivel.",
    quiz: {
      question: "O que return faz em um metodo com retorno?",
      options: ["Devolve um valor para quem chamou", "Imprime no terminal", "Cria uma classe", "Inicia um for"],
      correctAnswer: "Devolve um valor para quem chamou",
      explanation: "return encerra o metodo e entrega o resultado.",
    },
    drills: [
      { title: "Metodo void", focus: "void executa uma acao e nao devolve valor.", example: "static void saudacao() {\n    System.out.println(\"Oi\");\n}", result: "Oi ao chamar saudacao()", objective: "Crie static void mostrarMenu() que imprime Menu.", expectedAnswer: "static void mostrarMenu() { System.out.println(\"Menu\"); }", hint: "void, nome, parenteses e bloco." },
      { title: "Parametro", focus: "Parametro permite passar informacao para o metodo.", example: "static void saudar(String nome) {\n    System.out.println(\"Oi, \" + nome);\n}", result: "Oi, Ana", objective: "Crie static void exibirNivel(int nivel) que imprime \"Nivel \" + nivel.", expectedAnswer: "static void exibirNivel(int nivel) { System.out.println(\"Nivel \" + nivel); }", hint: "O parametro fica dentro dos parenteses." },
      { title: "Retorno int", focus: "Metodo com tipo diferente de void precisa devolver valor compativel.", example: "static int dobrar(int numero) {\n    return numero * 2;\n}", result: "dobro", objective: "Crie static int somar(int a, int b) que retorna a + b.", expectedAnswer: "static int somar(int a, int b) { return a + b; }", hint: "Tipo int antes do nome e return no corpo." },
      { title: "Retorno boolean", focus: "Metodos boolean deixam regras de negocio legiveis.", example: "static boolean maiorDeIdade(int idade) {\n    return idade >= 18;\n}", result: "true ou false", objective: "Crie static boolean aprovado(double nota) que retorna nota >= 7.", expectedAnswer: "static boolean aprovado(double nota) { return nota >= 7; }", hint: "A expressao de comparacao ja e boolean." },
      { title: "Metodo chamando metodo", focus: "Metodos pequenos podem compor solucoes maiores.", example: "static int triplo(int n) {\n    return dobrar(n) + n;\n}", result: "triplo", objective: "Crie static int quadrado(int n) que retorna n * n.", expectedAnswer: "static int quadrado(int n) { return n * n; }", hint: "Multiplique o parametro por ele mesmo." },
      { title: "Nomes claros", focus: "Nome de metodo deve contar a intencao, nao a mecanica.", example: "static double calcularTotal(double preco, int qtd) {\n    return preco * qtd;\n}", result: "total", objective: "Crie calcularDesconto(double preco) retornando preco * 0.1.", expectedAnswer: "static double calcularDesconto(double preco) { return preco * 0.1; }", hint: "Retorno double e multiplicacao por 0.1." },
      { title: "Escopo", focus: "Variavel criada dentro de um metodo vive apenas ali.", example: "static int criarPontos() {\n    int pontos = 10;\n    return pontos;\n}", result: "10", objective: "Crie static int bonus() que declara int valor = 20 e retorna valor.", expectedAnswer: "static int bonus() { int valor = 20; return valor; }", hint: "Declare antes do return." },
      { title: "Validacao em metodo", focus: "Coloque regra repetida em metodo para evitar copiar if por todo lado.", example: "static boolean senhaForte(String senha) {\n    return senha.length() >= 8;\n}", result: "true ou false", objective: "Crie static boolean podeComprar(int moedas) retornando moedas >= 100.", expectedAnswer: "static boolean podeComprar(int moedas) { return moedas >= 100; }", hint: "O retorno e a comparacao." },
    ],
    boss: { title: "Chefe: calculadora limpa", focus: "Separe calculo em metodo pequeno.", example: "static double total(double preco, int qtd) { return preco * qtd; }", result: "total", objective: "Crie static double totalComDesconto(double preco, int quantidade, double desconto) retornando preco * quantidade - desconto.", expectedAnswer: "static double totalComDesconto(double preco, int quantidade, double desconto) { return preco * quantidade - desconto; }", hint: "Use os tres parametros no return." },
  },
  {
    id: "java-06-arrays",
    title: "Modulo 6: Arrays e Listas",
    description: "Guarde muitos valores e percorra colecoes com seguranca.",
    scene: "Arquivo das Listas",
    review: "A partir daqui voce deixa de pensar em uma variavel solta e comeca a pensar em conjuntos de dados.",
    quiz: {
      question: "Qual e o primeiro indice de um array em Java?",
      options: ["0", "1", "-1", "10"],
      correctAnswer: "0",
      explanation: "Arrays e listas em Java comecam no indice zero.",
    },
    drills: [
      { title: "Criando array", focus: "Array tem tamanho fixo e tipo unico.", example: "int[] notas = {8, 7, 10};\nSystem.out.println(notas[0]);", result: "8", objective: "Crie int[] pontos com 10, 20 e 30.", expectedAnswer: "int[] pontos = {10, 20, 30};", hint: "Use colchetes no tipo e chaves nos valores." },
      { title: "Acessando indice", focus: "Indice escolhe uma posicao especifica.", example: "String[] nomes = {\"Ana\", \"Biel\"};\nSystem.out.println(nomes[1]);", result: "Biel", objective: "Imprima nomes[0].", expectedAnswer: "System.out.println(nomes[0]);", hint: "Primeiro item fica no indice 0." },
      { title: "Length do array", focus: "array.length informa quantos itens existem.", example: "int[] valores = {1, 2, 3};\nSystem.out.println(valores.length);", result: "3", objective: "Imprima produtos.length.", expectedAnswer: "System.out.println(produtos.length);", hint: "Array usa .length sem parenteses." },
      { title: "for por indice", focus: "Indice permite percorrer e acessar cada item.", example: "for (int i = 0; i < notas.length; i++) {\n    System.out.println(notas[i]);\n}", result: "cada nota", objective: "Percorra nomes com for e imprima nomes[i].", expectedAnswer: "for (int i = 0; i < nomes.length; i++) { System.out.println(nomes[i]); }", hint: "Comece em 0 e rode enquanto i < nomes.length." },
      { title: "Soma de array", focus: "Acumulador soma itens ao percorrer.", example: "int soma = 0;\nfor (int i = 0; i < notas.length; i++) {\n    soma += notas[i];\n}", result: "soma", objective: "Some valores[i] em int total.", expectedAnswer: "int total = 0;\nfor (int i = 0; i < valores.length; i++) { total += valores[i]; }", hint: "Declare total antes do for." },
      { title: "for-each", focus: "for-each percorre valores quando voce nao precisa do indice.", example: "for (String nome : nomes) {\n    System.out.println(nome);\n}", result: "cada nome", objective: "Use for-each para imprimir cada int ponto em pontos.", expectedAnswer: "for (int ponto : pontos) { System.out.println(ponto); }", hint: "Tipo item : array." },
      { title: "ArrayList", focus: "ArrayList cresce com add e e comum em sistemas reais.", example: "ArrayList<String> nomes = new ArrayList<>();\nnomes.add(\"Ana\");", result: "lista com Ana", objective: "Crie ArrayList<String> tarefas = new ArrayList<>();", expectedAnswer: "ArrayList<String> tarefas = new ArrayList<>();", hint: "Tipo generico dentro de < >." },
      { title: "add e get", focus: "add insere; get busca por indice.", example: "tarefas.add(\"Estudar\");\nSystem.out.println(tarefas.get(0));", result: "Estudar", objective: "Adicione \"Java\" em cursos e imprima cursos.get(0).", expectedAnswer: "cursos.add(\"Java\");\nSystem.out.println(cursos.get(0));", hint: "add primeiro, get depois." },
    ],
    boss: { title: "Chefe: media de notas", focus: "Percorra array, some e divida pelo tamanho.", example: "double media = soma / 3.0;", result: "media", objective: "Some notas em total e declare double media = total / (double) notas.length.", expectedAnswer: "int total = 0;\nfor (int nota : notas) { total += nota; }\ndouble media = total / (double) notas.length;", hint: "Use for-each e conversao para double na divisao." },
  },
  {
    id: "java-07-strings",
    title: "Modulo 7: Strings e Validacao",
    description: "Trate texto como dado: compare, limpe, corte e valide.",
    scene: "Laboratorio de Texto",
    review: "Quase todo app recebe texto: nome, email, senha, status, comandos e respostas de API.",
    quiz: {
      question: "Qual metodo compara conteudo de String corretamente?",
      options: ["equals", "==", "length", "print"],
      correctAnswer: "equals",
      explanation: "equals compara o conteudo; == compara referencia em objetos.",
    },
    drills: [
      { title: "equals", focus: "Use equals para comparar texto com seguranca.", example: "if (perfil.equals(\"admin\")) {\n    System.out.println(\"Painel\");\n}", result: "Painel", objective: "Se status.equals(\"pago\"), imprima Confirmado.", expectedAnswer: "if (status.equals(\"pago\")) { System.out.println(\"Confirmado\"); }", hint: "A String chama .equals(\"texto\")." },
      { title: "equalsIgnoreCase", focus: "IgnoreCase evita erro por maiuscula ou minuscula.", example: "senha.equalsIgnoreCase(\"java\")", result: "true ou false", objective: "Declare boolean sim com resposta.equalsIgnoreCase(\"sim\").", expectedAnswer: "boolean sim = resposta.equalsIgnoreCase(\"sim\");", hint: "O metodo fica na variavel String." },
      { title: "length", focus: "length() mede tamanho de texto.", example: "int tamanho = nome.length();", result: "tamanho", objective: "Declare int tamanho com senha.length().", expectedAnswer: "int tamanho = senha.length();", hint: "String usa length() com parenteses." },
      { title: "trim", focus: "trim remove espacos no inicio e fim.", example: "String limpo = email.trim();", result: "texto limpo", objective: "Declare String nomeLimpo = nome.trim().", expectedAnswer: "String nomeLimpo = nome.trim();", hint: "O resultado precisa ser guardado." },
      { title: "contains", focus: "contains verifica se um pedaco existe no texto.", example: "boolean temArroba = email.contains(\"@\");", result: "true ou false", objective: "Declare boolean temJava = curso.contains(\"Java\").", expectedAnswer: "boolean temJava = curso.contains(\"Java\");", hint: "contains recebe o trecho entre aspas." },
      { title: "substring", focus: "substring corta parte do texto por indices.", example: "String sigla = nome.substring(0, 2);", result: "duas primeiras letras", objective: "Declare String inicio = codigo.substring(0, 3).", expectedAnswer: "String inicio = codigo.substring(0, 3);", hint: "Inicio incluso, fim exclusivo." },
      { title: "toLowerCase", focus: "Normalizar texto facilita comparacao.", example: "String cidade = entrada.toLowerCase();", result: "minusculo", objective: "Declare String busca = termo.toLowerCase().", expectedAnswer: "String busca = termo.toLowerCase();", hint: "Metodo sem parametros." },
      { title: "Validar email", focus: "Validacao combina metodos de String com if.", example: "if (email.contains(\"@\") && email.contains(\".\")) {\n    System.out.println(\"Email ok\");\n}", result: "Email ok", objective: "Se senha.length() >= 8 && senha.contains(\"!\"), imprima Forte.", expectedAnswer: "if (senha.length() >= 8 && senha.contains(\"!\")) { System.out.println(\"Forte\"); }", hint: "Combine tamanho e contains com &&." },
    ],
    boss: { title: "Chefe: cadastro limpo", focus: "Normalize antes de validar.", example: "String emailLimpo = email.trim().toLowerCase();", result: "email normalizado", objective: "Crie String usuario = nome.trim().toLowerCase(); depois imprima usuario.", expectedAnswer: "String usuario = nome.trim().toLowerCase();\nSystem.out.println(usuario);", hint: "Encadeie trim e toLowerCase." },
  },
  {
    id: "java-08-oop",
    title: "Modulo 8: Classes e Objetos",
    description: "Modele coisas reais com atributos, construtores e metodos.",
    scene: "Templo dos Objetos",
    review: "Java brilha em orientacao a objetos. Classe e molde; objeto e instancia com estado proprio.",
    quiz: {
      question: "O que um construtor faz?",
      options: ["Inicializa um objeto ao usar new", "Repete um loop", "Compara String", "Importa ArrayList"],
      correctAnswer: "Inicializa um objeto ao usar new",
      explanation: "Construtor prepara os atributos iniciais do objeto.",
    },
    drills: [
      { title: "Classe simples", focus: "Classe agrupa dados e comportamentos.", example: "class Pessoa {\n    String nome;\n}", result: "molde Pessoa", objective: "Crie class Produto com String nome.", expectedAnswer: "class Produto { String nome; }", hint: "Atributo fica dentro das chaves da classe." },
      { title: "Atributos", focus: "Atributos representam estado do objeto.", example: "class Conta {\n    double saldo;\n    boolean ativa;\n}", result: "classe Conta", objective: "Crie class Heroi com String nome e int nivel.", expectedAnswer: "class Heroi { String nome; int nivel; }", hint: "Dois atributos dentro da classe." },
      { title: "Metodo de instancia", focus: "Metodo sem static pertence ao objeto.", example: "void apresentar() {\n    System.out.println(nome);\n}", result: "usa atributo nome", objective: "Crie void exibir() que imprime nome.", expectedAnswer: "void exibir() { System.out.println(nome); }", hint: "Sem static dentro da classe." },
      { title: "Construtor basico", focus: "Construtor tem o mesmo nome da classe e nao tem retorno.", example: "Pessoa(String nome) {\n    this.nome = nome;\n}", result: "nome inicializado", objective: "Crie Produto(String nome) atribuindo this.nome = nome.", expectedAnswer: "Produto(String nome) { this.nome = nome; }", hint: "Use this para apontar ao atributo." },
      { title: "this", focus: "this diferencia atributo de parametro com mesmo nome.", example: "this.saldo = saldo;", result: "atributo recebe parametro", objective: "Atribua this.nivel = nivel.", expectedAnswer: "this.nivel = nivel;", hint: "A esquerda fica o atributo do objeto." },
      { title: "new", focus: "new cria um objeto a partir da classe.", example: "Pessoa pessoa = new Pessoa(\"Ana\");", result: "objeto criado", objective: "Crie Produto produto = new Produto(\"Livro\").", expectedAnswer: "Produto produto = new Produto(\"Livro\");", hint: "Tipo, nome, new e construtor." },
      { title: "Encapsulamento", focus: "private protege atributos contra mudanca direta.", example: "private double saldo;", result: "saldo protegido", objective: "Declare private int nivel.", expectedAnswer: "private int nivel;", hint: "private antes do tipo." },
      { title: "Getter", focus: "Getter expõe leitura controlada de atributo privado.", example: "public int getNivel() {\n    return nivel;\n}", result: "nivel", objective: "Crie public String getNome() retornando nome.", expectedAnswer: "public String getNome() { return nome; }", hint: "Getter retorna o atributo." },
    ],
    boss: { title: "Chefe: Produto completo", focus: "Use private, construtor e getter.", example: "class Produto {\n    private String nome;\n}", result: "classe encapsulada", objective: "Crie class Produto com private String nome, construtor Produto(String nome) e getNome().", expectedAnswer: "class Produto { private String nome; Produto(String nome) { this.nome = nome; } public String getNome() { return nome; } }", hint: "O construtor recebe nome e o getter retorna nome." },
  },
  {
    id: "java-09-advanced-oop",
    title: "Modulo 9: Heranca, Interfaces e Erros",
    description: "Entenda polimorfismo, contratos e tratamento de excecoes.",
    scene: "Fortaleza dos Contratos",
    review: "Heranca e interfaces devem simplificar uso comum; excecoes impedem que falhas esperadas derrubem o sistema.",
    quiz: {
      question: "O que uma interface define?",
      options: ["Um contrato de metodos", "Um numero decimal", "Um array fixo", "Uma saida no terminal"],
      correctAnswer: "Um contrato de metodos",
      explanation: "Classes que implementam a interface prometem fornecer aqueles comportamentos.",
    },
    drills: [
      { title: "extends", focus: "extends cria uma classe filha baseada em uma classe pai.", example: "class Cachorro extends Animal { }", result: "Cachorro herda Animal", objective: "Crie class Gato extends Animal.", expectedAnswer: "class Gato extends Animal { }", hint: "Nome da filha, extends, nome da pai." },
      { title: "Override", focus: "@Override marca sobrescrita e ajuda o compilador a te proteger.", example: "@Override\nvoid falar() { System.out.println(\"Oi\"); }", result: "metodo sobrescrito", objective: "Sobrescreva void emitirSom() imprimindo Miau.", expectedAnswer: "@Override\nvoid emitirSom() { System.out.println(\"Miau\"); }", hint: "Use @Override acima do metodo." },
      { title: "super", focus: "super chama comportamento da classe pai.", example: "super(nome);", result: "construtor pai chamado", objective: "Chame super(nome) dentro do construtor.", expectedAnswer: "super(nome);", hint: "super costuma ser a primeira linha do construtor." },
      { title: "implements", focus: "implements liga uma classe a uma interface.", example: "class Pix implements Pagamento { }", result: "Pix implementa contrato", objective: "Crie class Cartao implements Pagamento.", expectedAnswer: "class Cartao implements Pagamento { }", hint: "implements vem depois do nome da classe." },
      { title: "Metodo de interface", focus: "Quem implementa precisa fornecer os metodos do contrato.", example: "public void pagar(double valor) {\n    System.out.println(valor);\n}", result: "metodo implementado", objective: "Implemente public void executar() imprimindo Ok.", expectedAnswer: "public void executar() { System.out.println(\"Ok\"); }", hint: "Metodo public para cumprir a interface." },
      { title: "Polimorfismo", focus: "Variavel do tipo pai pode apontar para objeto filho.", example: "Animal animal = new Cachorro();", result: "polimorfismo", objective: "Declare Pagamento pagamento = new Pix().", expectedAnswer: "Pagamento pagamento = new Pix();", hint: "Tipo interface, nome, new classe concreta." },
      { title: "try catch", focus: "try/catch trata erro esperado sem matar o programa.", example: "try {\n    int n = Integer.parseInt(texto);\n} catch (NumberFormatException e) {\n    System.out.println(\"Invalido\");\n}", result: "erro tratado", objective: "Capture NumberFormatException e imprima Erro.", expectedAnswer: "try { int numero = Integer.parseInt(texto); } catch (NumberFormatException e) { System.out.println(\"Erro\"); }", hint: "O catch recebe o tipo da excecao e uma variavel." },
      { title: "finally", focus: "finally executa mesmo com erro, util para limpeza.", example: "finally {\n    System.out.println(\"Fim\");\n}", result: "Fim", objective: "Escreva finally imprimindo Fechando.", expectedAnswer: "finally { System.out.println(\"Fechando\"); }", hint: "finally vem depois do catch." },
    ],
    boss: { title: "Chefe: pagamento polimorfico", focus: "Junte interface, implements e polimorfismo.", example: "interface Pagamento { void pagar(double valor); }", result: "contrato", objective: "Crie interface Pagamento com pagar(double valor) e class Pix implements Pagamento imprimindo Pago.", expectedAnswer: "interface Pagamento { void pagar(double valor); }\nclass Pix implements Pagamento { public void pagar(double valor) { System.out.println(\"Pago\"); } }", hint: "A classe implementa o metodo publico da interface." },
  },
  {
    id: "java-10-project",
    title: "Modulo 10: Projeto Final Java",
    description: "Monte um mini sistema com dados, regras, objetos e organizacao.",
    scene: "Guilda do Projeto Final",
    review: "Agora cada missao simula uma parte de sistema real: entidade, validacao, lista, calculo, regra e saida.",
    quiz: {
      question: "Qual ordem profissional faz mais sentido ao resolver um problema?",
      options: ["Entender dados, regras, fluxo e so entao codar", "Codar tudo antes de ler", "Evitar metodos", "Usar String para tudo"],
      correctAnswer: "Entender dados, regras, fluxo e so entao codar",
      explanation: "Tecnico bom reduz incerteza antes de escrever codigo.",
    },
    drills: [
      { title: "Entidade Usuario", focus: "Entidade guarda dados importantes do dominio.", example: "class Usuario {\n    private String nome;\n}", result: "Usuario", objective: "Crie class Usuario com private String nome e private int nivel.", expectedAnswer: "class Usuario { private String nome; private int nivel; }", hint: "Use atributos privados." },
      { title: "Construtor de entidade", focus: "Construtor impede objeto vazio quando os dados sao obrigatorios.", example: "Usuario(String nome) { this.nome = nome; }", result: "nome inicial", objective: "Crie construtor Usuario(String nome, int nivel) atribuindo os dois atributos.", expectedAnswer: "Usuario(String nome, int nivel) { this.nome = nome; this.nivel = nivel; }", hint: "Use this.nome e this.nivel." },
      { title: "Regra de negocio", focus: "Regra deve ter nome e retorno claro.", example: "boolean podeEntrar() { return nivel >= 1; }", result: "true ou false", objective: "Crie boolean podeComprar() retornando nivel >= 3.", expectedAnswer: "boolean podeComprar() { return nivel >= 3; }", hint: "Metodo de instancia usa o atributo nivel." },
      { title: "Servico simples", focus: "Servico coordena regras sem misturar com tela.", example: "class LojaService { }", result: "servico", objective: "Crie class LojaService com metodo boolean liberar(int moedas) retornando moedas >= 100.", expectedAnswer: "class LojaService { boolean liberar(int moedas) { return moedas >= 100; } }", hint: "Metodo dentro da classe de servico." },
      { title: "Lista no projeto", focus: "Listas guardam colecoes de entidades.", example: "ArrayList<Usuario> usuarios = new ArrayList<>();", result: "lista criada", objective: "Crie ArrayList<Usuario> usuarios = new ArrayList<>();", expectedAnswer: "ArrayList<Usuario> usuarios = new ArrayList<>();", hint: "Tipo generico e new ArrayList<>." },
      { title: "Buscar em lista", focus: "Percorra lista e compare criterio.", example: "for (Usuario usuario : usuarios) {\n    System.out.println(usuario.getNome());\n}", result: "nomes", objective: "Use for-each em usuarios e imprima usuario.getNome().", expectedAnswer: "for (Usuario usuario : usuarios) { System.out.println(usuario.getNome()); }", hint: "Tipo Usuario, variavel usuario, dois pontos, lista." },
      { title: "Totalizador", focus: "Relatorios somam dados de uma lista.", example: "int total = 0;\nfor (Pedido pedido : pedidos) { total += pedido.getValor(); }", result: "total", objective: "Some pedido.getValor() de pedidos em int total.", expectedAnswer: "int total = 0;\nfor (Pedido pedido : pedidos) { total += pedido.getValor(); }", hint: "Acumulador antes do for." },
      { title: "Tratamento no projeto", focus: "Entrada externa precisa de try/catch.", example: "try { int nivel = Integer.parseInt(texto); } catch (NumberFormatException e) { System.out.println(\"Nivel invalido\"); }", result: "seguro", objective: "Parse moedas com Integer.parseInt(texto) e capture NumberFormatException imprimindo Valor invalido.", expectedAnswer: "try { int moedas = Integer.parseInt(texto); } catch (NumberFormatException e) { System.out.println(\"Valor invalido\"); }", hint: "O parse fica no try e a mensagem no catch." },
    ],
    boss: { title: "Chefe final: mini loja", focus: "Feche o ciclo com classe, regra e saida.", example: "class Item { private int preco; }", result: "modelo", objective: "Crie class Item com private String nome, private int preco, construtor, getPreco() e boolean caro() retornando preco >= 100.", expectedAnswer: "class Item { private String nome; private int preco; Item(String nome, int preco) { this.nome = nome; this.preco = preco; } int getPreco() { return preco; } boolean caro() { return preco >= 100; } }", hint: "A classe tem dois atributos, construtor, getter e regra booleana." },
  },
];

export const javaCampaign = createCampaign({
  id: "java",
  title: "Reino Java",
  description: "Aprenda Java de verdade: base, logica, metodos, listas, objetos, erros e projeto final.",
  icon: "JAVA",
  color: "#E76F00",
  mentor: "Byte",
  language: "java",
  chapters: modules.map((module, index) => ({
    id: module.id,
    title: module.title,
    description: module.description,
    order: index + 1,
    stages: createModuleStages(module, index + 1),
  })),
});
