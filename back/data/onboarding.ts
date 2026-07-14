export type OnboardingAnswers = {
  goal: string;
  language: string;
  dailyTime: string;
  deadline: string;
  completed?: boolean;
};

export const onboardingSteps = [
  {
    id: "goal",
    title: "Qual e seu objetivo?",
    description: "Escolha o que deseja alcancar.",
    options: [
      "Conseguir meu primeiro emprego",
      "Criar sites",
      "Criar jogos",
      "Automatizar tarefas",
      "Trabalhar com dados",
    ],
  },
  {
    id: "language",
    title: "Qual linguagem deseja aprender?",
    description: "Mostrando apenas caminhos que combinam com seu objetivo.",
    options: [
      "SQL",
      "JavaScript",
      "Python",
      "Java",
      "C#",
    ],
  },
  {
    id: "dailyTime",
    title: "Quanto tempo voce tem por dia?",
    description: "Isso nos ajuda a montar seu plano.",
    options: [
      "15 minutos",
      "30 minutos",
      "1 hora",
      "2 horas",
    ],
  },
  {
    id: "deadline",
    title: "Qual ritmo voce quer seguir?",
    description: "Quanto mais tempo, mais missoes de reforco e explicacao guiada.",
    options: [
      "2 meses - direto ao ponto",
      "4 meses - guiado com mais pratica",
      "6 meses - completo e bem explicado",
    ],
  },
];

export const goalLanguageOptions: Record<string, string[]> = {
  "Conseguir meu primeiro emprego": [
    "JavaScript",
    "Python",
    "SQL",
    "Java",
    "C#",
  ],
  "Criar sites": [
    "JavaScript",
    "C#",
    "Java",
    "Python",
  ],
  "Criar jogos": [
    "C#",
    "JavaScript",
    "Python",
  ],
  "Automatizar tarefas": [
    "Python",
    "JavaScript",
    "C#",
  ],
  "Trabalhar com dados": [
    "SQL",
    "Python",
  ],
};

export const languageCampaignId: Record<string, string> = {
  SQL: "sql",
  JavaScript: "javascript",
  Python: "python",
  Java: "java",
  "C#": "csharp",
};

export const planDetails: Record<string, {
  title: string;
  description: string;
}> = {
  "2 meses - direto ao ponto": {
    title: "Plano 2 meses",
    description:
      "Trilha objetiva: aulas essenciais, pratica rapida e bosses para consolidar.",
  },
  "4 meses - guiado com mais pratica": {
    title: "Plano 4 meses",
    description:
      "Trilha guiada: mais revisoes, mais missoes de fixacao e explicacoes intermediarias.",
  },
  "6 meses - completo e bem explicado": {
    title: "Plano 6 meses",
    description:
      "Trilha completa: ritmo calmo, reforco dos fundamentos, mais exemplos e mais pratica antes dos bosses.",
  },
};

export function getLanguageOptions(goal: string) {
  return goalLanguageOptions[goal] ?? onboardingSteps[1].options;
}

export function getRecommendedCampaignIds(answers: Partial<OnboardingAnswers>) {
  const languageId = answers.language
    ? languageCampaignId[answers.language]
    : undefined;

  const goalIds = (answers.goal ? getLanguageOptions(answers.goal) : [])
    .map((language) => languageCampaignId[language])
    .filter(Boolean);

  if (!languageId) {
    return goalIds;
  }

  return [
    languageId,
    ...goalIds.filter((id) => id !== languageId),
  ];
}
