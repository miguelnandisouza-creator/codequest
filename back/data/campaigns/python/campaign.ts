import { createCampaign } from "@/data/campaigns/createCampaign";
import { StageContent, StageType } from "@/domain/entities/stage";

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

function intro(title: string, content: string): StageContent {
  return { type: "text", title, content };
}

function example(title: string, explanation: string, code: string, result: string): StageContent {
  return { type: "example", title, explanation, code, result };
}

function quiz(title: string, question: string, options: string[], correctAnswer: string, explanation: string): StageContent {
  return { type: "quiz", title, question, options, correctAnswer, explanation };
}

function challenge(title: string, objective: string, expectedAnswer: string, hint: string): StageContent {
  return { type: "challenge", title, objective, expectedAnswer, hint };
}

function boss(title: string, objective: string, expectedAnswer: string, hint: string): StageContent {
  return { type: "boss", title, objective, expectedAnswer, hint };
}

function stage(input: StageInput): StageInput {
  return input;
}

export const pythonCampaign = createCampaign({
  id: "python",
  title: "Reino Python",
  description:
    "Aprenda Python do zero escrevendo scripts, organizando dados e criando objetos simples.",
  icon: "PY",
  color: "#3776AB",
  mentor: "Byte",
  language: "python",
  chapters: [
    {
      id: "python-chapter-1",
      title: "Modulo 1: A Clareira das Variaveis",
      description: "Variaveis, tipos, print, input e primeiras expressoes.",
      order: 1,
      stages: [
        stage({
          id: "py-clearing-01-what-is-python",
          order: 1,
          title: "O que e Python",
          description: "Entenda para que Python serve antes de escrever codigo.",
          type: "quiz",
          xp: 45,
          coins: 20,
          content: [
            intro("A serpente clara", "Byte apresenta Python como uma linguagem direta, usada em automacao, dados, sites, inteligencia artificial e scripts do dia a dia."),
            example("Primeira ideia", "Python tenta parecer uma sequencia clara de instrucoes.", "print(\"Ola, Reino Python\")", "Ola, Reino Python"),
            quiz("Pergunta da clareira", "Python e muito usado para que tipo de tarefa?", ["Automatizar tarefas e trabalhar com dados", "Desenhar apenas imagens", "Substituir o monitor"], "Automatizar tarefas e trabalhar com dados", "Python e popular por resolver tarefas praticas com codigo legivel."),
          ],
        }),
        stage({
          id: "py-clearing-02-variables-print",
          order: 2,
          title: "Variaveis e print",
          description: "Guarde valores e mostre respostas no terminal.",
          type: "challenge",
          xp: 55,
          coins: 25,
          content: [
            intro("Frascos com nome", "Variaveis guardam valores para o programa usar depois. print mostra um valor na tela."),
            example("Nome e idade", "A variavel nome guarda texto; idade guarda numero.", "nome = \"Ana\"\nidade = 25\nprint(nome, idade)", "Ana 25"),
            challenge("Cidade da clareira", "Crie uma variavel cidade com valor \"Recife\" e imprima com print(cidade).", "cidade = \"Recife\"\nprint(cidade)", "Use cidade = \"Recife\" e depois print(cidade)."),
          ],
        }),
        stage({
          id: "py-clearing-03-types",
          order: 3,
          title: "Tipos: str, int, float e bool",
          description: "Reconheca texto, inteiro, decimal e verdadeiro/falso.",
          type: "quiz",
          xp: 50,
          coins: 25,
          content: [
            intro("Quatro runas basicas", "str guarda texto, int guarda inteiros, float guarda decimais e bool guarda True ou False."),
            example("Inspecionando tipos", "type mostra o tipo de um valor.", "nome = \"Bruno\"\nidade = 30\naltura = 1.75\nativo = True\nprint(type(idade))", "<class 'int'>"),
            quiz("Pergunta dos tipos", "Qual o tipo de 3.14 em Python?", ["int", "float", "str", "bool"], "float", "Valores com parte decimal sao float."),
          ],
        }),
        stage({
          id: "py-clearing-04-operators-input",
          order: 4,
          title: "Operadores e input()",
          description: "Calcule valores e leia entradas do usuario.",
          type: "challenge",
          xp: 65,
          coins: 30,
          content: [
            intro("A fonte de entrada", "input() le texto digitado. Para fazer conta com numero inteiro, converta usando int()."),
            example("Idade no futuro", "idade + 10 soma dez ao numero lido.", "idade = int(input(\"Sua idade: \"))\nprint(\"Daqui a 10 anos voce tera\", idade + 10)", "idade futura"),
            challenge("Resto da divisao", "Escreva a expressao que calcula o resto da divisao de 20 por 6.", "20 % 6", "O operador % retorna o resto."),
          ],
        }),
        stage({
          id: "py-clearing-04b-input-conversion",
          order: 4.5,
          title: "Convertendo entradas com seguranca",
          description: "Entenda por que input() sempre retorna texto.",
          type: "challenge",
          xp: 70,
          coins: 35,
          content: [
            intro("Texto que parece numero", "input() sempre devolve uma str. Para somar como numero, converta com int() ou float(). Se esquecer, Python junta textos ou gera erro em contas."),
            example("Idade convertida", "A conversao acontece antes da soma.", "idade_texto = input(\"Idade: \")\nidade = int(idade_texto)\nprint(idade + 1)", "idade somada como numero"),
            challenge("Preco convertido", "Leia preco_texto com input e crie preco usando float(preco_texto).", "preco_texto = input(\"Preco: \")\npreco = float(preco_texto)", "Use float para valores decimais."),
          ],
        }),
        stage({
          id: "py-clearing-05-fstrings",
          order: 5,
          title: "f-strings",
          description: "Monte frases usando variaveis dentro do texto.",
          type: "challenge",
          xp: 60,
          coins: 30,
          content: [
            intro("Pergaminhos com lacunas", "f-strings deixam voce colocar variaveis dentro de uma frase usando chaves."),
            example("Frase com idade", "O f antes das aspas ativa as substituicoes.", "nome = \"Carla\"\nidade = 25\nprint(f\"{nome} tem {idade} anos\")", "Carla tem 25 anos"),
            challenge("Minha idade", "Crie uma f-string que produza \"Tenho 25 anos\" usando a variavel idade.", "f\"Tenho {idade} anos\"", "Use f antes das aspas e {idade} dentro da frase."),
          ],
        }),
        stage({
          id: "py-clearing-06-boss",
          order: 6,
          title: "Chefe: O Guardiao da Clareira",
          description: "Combine input, conversao, conta e f-string.",
          type: "boss",
          xp: 120,
          coins: 60,
          content: [
            intro("A prova da clareira", "O guardiao pede um script pequeno: ler nome e idade, estimar o ano de nascimento e mostrar uma frase."),
            boss("Ano aproximado", "Leia nome e idade, calcule nascimento como 2026 - idade e monte uma frase com f-string.", "nome = input(\"Nome: \")\nidade = int(input(\"Idade: \"))\nnascimento = 2026 - idade\nprint(f\"{nome} nasceu por volta de {nascimento}\")", "Use input, int(), uma variavel nascimento e f-string."),
          ],
        }),
      ],
    },
    {
      id: "python-chapter-2",
      title: "Modulo 2: A Floresta das Decisoes",
      description: "Condicionais, operadores logicos, for e while.",
      order: 2,
      stages: [
        stage({ id: "py-forest-01-if", order: 1, title: "if, elif e else", description: "Ensine o programa a escolher caminhos.", type: "challenge", xp: 70, coins: 35, content: [intro("Trilhas que se dividem", "Python usa if, elif e else para executar blocos diferentes. A indentacao define o que pertence ao bloco."), example("Maioridade", "O bloco indentado roda quando a condicao e verdadeira.", "idade = 20\nif idade >= 18:\n    print(\"Maior de idade\")\nelse:\n    print(\"Menor de idade\")", "Maior de idade"), challenge("Notas da floresta", "Escreva um if/elif/else: Aprovado se nota >= 7, Recuperacao se nota >= 5, senao Reprovado.", "if nota >= 7:\n    print(\"Aprovado\")\nelif nota >= 5:\n    print(\"Recuperacao\")\nelse:\n    print(\"Reprovado\")", "Use if, elif e else alinhados; prints indentados.")]}),
        stage({ id: "py-forest-02-logic", order: 2, title: "and, or e not", description: "Combine condicoes com logica.", type: "quiz", xp: 55, coins: 25, content: [intro("Chaves logicas", "and exige duas verdades, or aceita uma das condicoes, not inverte o resultado."), example("Pode dirigir", "As duas condicoes precisam ser verdadeiras.", "if idade >= 18 and tem_carteira:\n    print(\"Pode dirigir\")", "Pode dirigir"), quiz("Pergunta da sombra", "O que not True retorna?", ["False", "True", "None"], "False", "not inverte True para False.")]}),
        stage({ id: "py-forest-03-for", order: 3, title: "Loop for", description: "Repita passos com range().", type: "challenge", xp: 70, coins: 35, content: [intro("A trilha numerada", "for repete um bloco para cada valor. range(1, 6) gera 1 ate 5."), example("Contando passos", "O print roda uma vez para cada numero.", "for i in range(1, 6):\n    print(i)", "1 2 3 4 5"), challenge("De um a dez", "Use for com range() para imprimir os numeros de 1 a 10.", "for i in range(1, 11):\n    print(i)", "O limite final do range nao entra; use 11.")]}),
        stage({ id: "py-forest-04-while", order: 4, title: "Loop while", description: "Repita enquanto uma condicao for verdadeira.", type: "challenge", xp: 70, coins: 35, content: [intro("A fogueira acesa", "while continua repetindo enquanto a condicao for True. Atualize o contador para nao criar loop infinito."), example("Tres voltas", "contador += 1 aproxima o fim do loop.", "contador = 0\nwhile contador < 3:\n    print(contador)\n    contador += 1", "0 1 2"), challenge("Tres cumprimentos", "Use while para imprimir \"Oi\" 3 vezes.", "contador = 0\nwhile contador < 3:\n    print(\"Oi\")\n    contador += 1", "Comece em 0 e incremente ate chegar em 3.")]}),
        stage({ id: "py-forest-05-boss", order: 5, title: "Chefe: O Guardiao da Floresta", description: "Combine for e if para filtrar numeros.", type: "boss", xp: 130, coins: 65, content: [intro("A ponte dos pares", "Para vencer, voce precisa percorrer numeros e deixar passar apenas os pares."), boss("Pares de 1 a 20", "Percorra de 1 a 20 e imprima apenas os numeros pares.", "for numero in range(1, 21):\n    if numero % 2 == 0:\n        print(numero)", "Use % 2 == 0 dentro do for.")]}),
      ],
    },
    {
      id: "python-chapter-3",
      title: "Modulo 3: O Deposito das Estruturas",
      description: "Listas, dicionarios, comprehensions e funcoes.",
      order: 3,
      stages: [
        stage({ id: "py-depot-01-lists", order: 1, title: "Listas", description: "Guarde varios valores em ordem.", type: "challenge", xp: 75, coins: 35, content: [intro("Caixas numeradas", "Listas guardam itens em ordem e podem crescer com append()."), example("Frutas", "frutas[0] acessa o primeiro item.", "frutas = [\"maca\", \"banana\", \"uva\"]\nprint(frutas[0])\nfrutas.append(\"laranja\")", "maca"), challenge("Lista de numeros", "Crie numeros com 1, 2, 3 e use append para adicionar 4.", "numeros = [1, 2, 3]\nnumeros.append(4)", "Use colchetes e .append(4).")]}),
        stage({ id: "py-depot-02-list-loop", order: 2, title: "Percorrendo listas", description: "Use for para visitar cada item.", type: "challenge", xp: 75, coins: 35, content: [intro("Prateleira por prateleira", "for item in lista executa o bloco para cada item da lista."), example("Frutas uma a uma", "A variavel fruta recebe cada item.", "for fruta in frutas:\n    print(fruta)", "cada fruta impressa"), challenge("Nomes um a um", "Use for para imprimir cada item de uma lista nomes.", "for nome in nomes:\n    print(nome)", "Use for nome in nomes.")]}),
        stage({ id: "py-depot-02b-slicing", order: 2.5, title: "Fatiando listas e textos", description: "Use indices para pegar pedacos.", type: "challenge", xp: 80, coins: 40, content: [intro("Cortes precisos", "Slicing usa inicio:fim para pegar parte de uma lista ou texto. O inicio entra, o fim fica de fora. lista[0:3] pega os tres primeiros itens."), example("Primeiros nomes", "O resultado e uma nova lista com parte dos itens.", "nomes = [\"Ana\", \"Biel\", \"Carla\", \"Duda\"]\nprimeiros = nomes[0:2]", "[\"Ana\", \"Biel\"]"), challenge("Tres primeiros", "Crie primeiros com os tres primeiros itens da lista numeros.", "primeiros = numeros[0:3]", "Use numeros[0:3].")]}),
        stage({ id: "py-depot-03-comprehension", order: 3, title: "List comprehension", description: "Crie listas novas de forma compacta.", type: "quiz", xp: 65, coins: 30, content: [intro("Filtro em uma linha", "List comprehension cria uma nova lista aplicando uma expressao e, opcionalmente, um filtro."), example("Somente pares", "O if filtra valores pares.", "numeros = [1, 2, 3, 4, 5]\npares = [n for n in numeros if n % 2 == 0]", "[2, 4]"), quiz("Pergunta do filtro", "O que a comprehension do exemplo retorna?", ["Uma lista so com numeros pares", "Uma lista vazia sempre", "Um dicionario"], "Uma lista so com numeros pares", "O filtro n % 2 == 0 deixa apenas pares.")]}),
        stage({ id: "py-depot-04-dicts", order: 4, title: "Dicionarios", description: "Organize dados em chave e valor.", type: "challenge", xp: 80, coins: 40, content: [intro("Etiquetas nos valores", "Dicionarios guardam pares chave-valor, bons para representar coisas com propriedades."), example("Pessoa", "pessoa['nome'] pega o valor da chave nome.", "pessoa = {\"nome\": \"Ana\", \"idade\": 25}\nprint(pessoa[\"nome\"])", "Ana"), challenge("Produto", "Crie um dicionario produto com chaves nome e preco.", "produto = {\"nome\": \"Caneta\", \"preco\": 2.5}", "Use chaves e pares \"nome\": valor.")]}),
        stage({ id: "py-depot-04b-sets", order: 4.5, title: "Sets removem repetidos", description: "Guarde valores unicos.", type: "challenge", xp: 80, coins: 40, content: [intro("Lista sem duplicatas", "set guarda valores unicos. Ele e util para remover repetidos e testar pertencimento com in."), example("Cidades unicas", "Sao Paulo aparece uma vez no set.", "cidades = [\"Recife\", \"Sao Paulo\", \"Recife\"]\nunicas = set(cidades)", "{\"Recife\", \"Sao Paulo\"}"), challenge("Tags unicas", "Crie unicas convertendo a lista tags para set.", "unicas = set(tags)", "Use set(tags).")]}),
        stage({ id: "py-depot-05-functions", order: 5, title: "Funcoes", description: "Crie blocos reutilizaveis com def.", type: "challenge", xp: 85, coins: 45, content: [intro("Ferramentas com nome", "Funcoes recebem valores, executam uma tarefa e podem retornar resultado."), example("Somar", "return devolve o resultado para quem chamou.", "def somar(a, b):\n    return a + b\n\nprint(somar(2, 3))", "5"), challenge("Dobro", "Crie uma funcao dobro(numero) que retorne numero vezes 2.", "def dobro(numero):\n    return numero * 2", "Use def e return numero * 2.")]}),
        stage({ id: "py-depot-06-boss", order: 6, title: "Chefe: O Guardiao do Deposito", description: "Filtre uma lista de dicionarios usando funcao.", type: "boss", xp: 150, coins: 75, content: [intro("Relatorio do deposito", "Agora voce mistura estruturas: uma lista de produtos, cada produto como dicionario, e uma funcao para filtrar."), boss("Produtos caros", "Crie uma funcao caros(produtos) que retorna apenas produtos com preco acima de 100.", "def caros(produtos):\n    return [produto for produto in produtos if produto[\"preco\"] > 100]", "Use list comprehension filtrando produto['preco'] > 100.")]}),
      ],
    },
    {
      id: "python-chapter-4",
      title: "Modulo 4: O Templo dos Objetos",
      description: "Classes, objetos, metodos, self e heranca.",
      order: 4,
      stages: [
        stage({ id: "py-temple-01-why-classes", order: 1, title: "Por que classes existem", description: "Entenda moldes e objetos.", type: "quiz", xp: 65, coins: 30, content: [intro("Moldes do templo", "Uma classe e uma planta para criar objetos parecidos, com os mesmos atributos e comportamentos."), example("Ideia de classe", "Pessoa e o molde; Ana e Bruno seriam objetos.", "class Pessoa:\n    pass", "molde criado"), quiz("Pergunta do molde", "Uma classe serve principalmente para...", ["Criar objetos com estrutura parecida", "Apagar arquivos", "Trocar a linguagem"], "Criar objetos com estrutura parecida", "Classes descrevem como objetos daquele tipo devem ser.")]}),
        stage({ id: "py-temple-02-class", order: 2, title: "Criando uma classe", description: "Use __init__, atributos e metodos.", type: "challenge", xp: 100, coins: 55, content: [intro("O construtor", "__init__ roda quando o objeto nasce. self representa o proprio objeto."), example("Pessoa", "p1 recebe um objeto Pessoa.", "class Pessoa:\n    def __init__(self, nome, idade):\n        self.nome = nome\n        self.idade = idade\n\n    def apresentar(self):\n        print(f\"Oi, eu sou {self.nome}\")\n\np1 = Pessoa(\"Ana\", 25)\np1.apresentar()", "Oi, eu sou Ana"), challenge("Produto", "Crie uma classe Produto com __init__(self, nome, preco) e metodo mostrar() que imprime nome e preco.", "class Produto:\n    def __init__(self, nome, preco):\n        self.nome = nome\n        self.preco = preco\n\n    def mostrar(self):\n        print(self.nome, self.preco)", "Guarde self.nome e self.preco no __init__.")]}),
        stage({ id: "py-temple-03-self", order: 3, title: "Atributos, metodos e self", description: "Entenda a propria instancia.", type: "quiz", xp: 70, coins: 35, content: [intro("O espelho do objeto", "self permite que um metodo acesse os dados do proprio objeto que chamou o metodo."), example("Usando self", "self.nome aponta para o nome daquele objeto especifico.", "def apresentar(self):\n    print(self.nome)", "atributo do objeto"), quiz("Pergunta do self", "O que self representa dentro de uma classe?", ["A propria instancia do objeto", "Sempre uma string", "Um arquivo externo"], "A propria instancia do objeto", "self e o objeto em uso naquele metodo.")]}),
        stage({ id: "py-temple-04-inheritance", order: 4, title: "Heranca", description: "Reaproveite comportamento de uma classe base.", type: "challenge", xp: 105, coins: 60, content: [intro("Linhas antigas do templo", "Heranca permite criar uma classe baseada em outra e trocar comportamentos quando necessario."), example("Animal e Cachorro", "Cachorro herda de Animal e sobrescreve emitir_som.", "class Animal:\n    def emitir_som(self):\n        print(\"Som generico\")\n\nclass Cachorro(Animal):\n    def emitir_som(self):\n        print(\"Au au!\")", "Au au!"), challenge("Gato", "Crie uma classe Gato que herda de Animal e sobrescreve emitir_som para imprimir \"Miau!\".", "class Gato(Animal):\n    def emitir_som(self):\n        print(\"Miau!\")", "Use class Gato(Animal).")]}),
        stage({ id: "py-temple-05-boss", order: 5, title: "Chefe: O Guardiao do Templo", description: "Crie uma conta bancaria com regras.", type: "boss", xp: 170, coins: 85, content: [intro("Conta protegida", "O guardiao quer uma classe que guarda saldo, permite depositar e impede saque maior que o saldo."), boss("ContaBancaria", "Crie ContaBancaria com saldo, depositar(valor) e sacar(valor) que nao deixa sacar mais do que tem.", "class ContaBancaria:\n    def __init__(self, saldo):\n        self.saldo = saldo\n\n    def depositar(self, valor):\n        self.saldo += valor\n\n    def sacar(self, valor):\n        if valor <= self.saldo:\n            self.saldo -= valor", "Use if valor <= self.saldo antes de subtrair.")]}),
      ],
    },
    {
      id: "python-chapter-5",
      title: "Modulo 5: A Biblioteca dos Modulos",
      description: "Erros, arquivos, imports e organizacao de codigo.",
      order: 5,
      stages: [
        stage({ id: "py-library-01-try-except", order: 1, title: "try e except", description: "Trate erros sem derrubar o programa.", type: "challenge", xp: 95, coins: 50, content: [intro("Prateleiras instaveis", "try tenta executar um bloco. except entra quando um erro esperado acontece."), example("Valor invalido", "ValueError captura texto que nao vira numero.", "try:\n    numero = int(input(\"Digite um numero: \"))\nexcept ValueError:\n    print(\"Isso nao e um numero valido!\")", "erro tratado"), challenge("Divisao segura", "Envolva uma divisao em try/except capturando ZeroDivisionError.", "try:\n    resultado = a / b\nexcept ZeroDivisionError:\n    print(\"Divisao por zero\")", "Use except ZeroDivisionError.")]}),
        stage({ id: "py-library-02-files", order: 2, title: "Lendo e escrevendo arquivos", description: "Use with open para trabalhar com txt.", type: "quiz", xp: 85, coins: 45, content: [intro("Livros que fecham sozinhos", "with open abre um arquivo e garante fechamento automatico no fim do bloco."), example("Escrever e ler", "w escreve; r le.", "with open(\"dados.txt\", \"w\") as arquivo:\n    arquivo.write(\"Ola, mundo!\")\n\nwith open(\"dados.txt\", \"r\") as arquivo:\n    conteudo = arquivo.read()", "conteudo lido"), quiz("Pergunta do arquivo", "O que with open(...) as arquivo garante?", ["Que o arquivo sera fechado automaticamente", "Que o arquivo sera apagado", "Que vira uma lista"], "Que o arquivo sera fechado automaticamente", "O gerenciador de contexto fecha o arquivo ao sair do bloco.")]}),
        stage({ id: "py-library-03-imports", order: 3, title: "Importando modulos", description: "Use codigo pronto da biblioteca padrao.", type: "challenge", xp: 90, coins: 45, content: [intro("Estantes prontas", "Modulos trazem funcoes prontas. math, datetime e random sao exemplos da biblioteca padrao."), example("Raiz e data", "import carrega o modulo inteiro; from importa uma parte.", "import math\nprint(math.sqrt(16))\n\nfrom datetime import datetime\nprint(datetime.now())", "4.0 e data atual"), challenge("Numero aleatorio", "Importe random e use random.randint(1, 10).", "import random\nrandom.randint(1, 10)", "Use import random antes da chamada.")]}),
        stage({ id: "py-library-04-organization", order: 4, title: "Organizando em funcoes", description: "Separe responsabilidades em partes pequenas.", type: "quiz", xp: 75, coins: 40, content: [intro("Livros bem catalogados", "Codigo organizado tem funcoes pequenas, nomes claros e responsabilidades separadas."), example("Uma responsabilidade", "A funcao abaixo so calcula desconto.", "def aplicar_desconto(preco, desconto):\n    return preco - desconto", "preco com desconto"), quiz("Pergunta da organizacao", "Uma boa funcao deve, de preferencia...", ["Ter uma responsabilidade clara", "Fazer tudo do sistema", "Nao ter nome"], "Ter uma responsabilidade clara", "Funcoes pequenas sao mais faceis de testar e entender.")]}),
        stage({ id: "py-library-05-final-boss", order: 5, title: "Chefe final: O Guardiao da Biblioteca", description: "Gere um relatorio em arquivo com tratamento de erros.", type: "boss", xp: 240, coins: 140, content: [intro("Titulo de Mestre Python", "Byte pede um programa completo: dados, funcao, arquivo e erro tratado."), boss("Relatorio de produtos", "Crie uma funcao salvar_relatorio(produtos) que grave nome e preco em relatorio.txt usando with open e try/except.", "def salvar_relatorio(produtos):\n    try:\n        with open(\"relatorio.txt\", \"w\") as arquivo:\n            for produto in produtos:\n                arquivo.write(f\"{produto['nome']} - {produto['preco']}\\n\")\n    except OSError:\n        print(\"Erro ao salvar relatorio\")", "Use try, with open e percorra a lista de dicionarios.")]}),
      ],
    },
  ],
});
