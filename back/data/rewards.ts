export type RewardKind = "avatar" | "pet" | "theme" | "frame" | "effect";

export type RewardItem = {
  id: string;
  kind: RewardKind;
  name: string;
  description: string;
  price: number;
  levelRequired: number;
  sprite: string;
  imageSrc?: string;
  swatch?: string[];
  allowedEmails?: string[];
};

export const rewardItems: RewardItem[] = [
  {
    id: "avatar-forge-guardian",
    kind: "avatar",
    name: "Miguel",
    description: "Retrato de perfil para quem comeca a jornada com presenca.",
    price: 0,
    levelRequired: 1,
    sprite: "GF",
    imageSrc: "/assets/avatars/forge-guardian.png",
  },
  {
    id: "avatar-arcane-scholar",
    kind: "avatar",
    name: "Biel",
    description: "Foto de perfil para quem prefere estudar com magia e foco.",
    price: 120,
    levelRequired: 2,
    sprite: "MA",
    imageSrc: "/assets/avatars/arcane-scholar.png",
  },
  {
    id: "avatar-iron-knight",
    kind: "avatar",
    name: "Tin",
    description: "Retrato de armadura para quem encara as missoes de frente.",
    price: 220,
    levelRequired: 4,
    sprite: "CF",
    imageSrc: "/assets/avatars/iron-knight.png",
  },
  {
    id: "avatar-steel-ranger",
    kind: "avatar",
    name: "Tio Ed",
    description: "Foto de perfil rara para aventureiros consistentes.",
    price: 360,
    levelRequired: 6,
    sprite: "GA",
    imageSrc: "/assets/avatars/steel-ranger.png",
  },
  {
    id: "pet-dragao",
    kind: "pet",
    name: "Dragao",
    description: "Um dragao pixelado que fica no canto torcendo por voce.",
    price: 120,
    levelRequired: 2,
    sprite: "DR",
    imageSrc: "/assets/pets/dragao.png",
  },
  {
    id: "pet-hunter",
    kind: "pet",
    name: "Hunter",
    description: "Pet exclusivo das contas Miguel e Gabriel Leopoldina.",
    price: 0,
    levelRequired: 1,
    sprite: "HT",
    imageSrc: "/assets/pets/hunter.png",
    allowedEmails: [
      "miguelnandisouza@gmail.com",
      "gabrielleopoldina6@gmail.com",
    ],
  },
  {
    id: "theme-terminal",
    kind: "theme",
    name: "Terminal Verde",
    description: "Tema escuro com destaque verde para clima de console hacker.",
    price: 180,
    levelRequired: 3,
    sprite: "TV",
    swatch: ["#06110c", "#123524", "#72e6a8"],
  },
  {
    id: "theme-hunter",
    kind: "theme",
    name: "Roxo Hunter",
    description: "Tema roxo frio inspirado no pet Hunter.",
    price: 280,
    levelRequired: 5,
    sprite: "RH",
    swatch: ["#0d0715", "#28124a", "#b16cff"],
  },
  {
    id: "frame-gold",
    kind: "frame",
    name: "Moldura Dourada",
    description: "Uma borda dourada para destacar sua foto de perfil.",
    price: 160,
    levelRequired: 3,
    sprite: "MD",
    swatch: ["#20170a", "#e7c66a", "#fff1a8"],
  },
  {
    id: "frame-crystal",
    kind: "frame",
    name: "Moldura Cristal",
    description: "Borda azul cristalina para perfil com cara de item raro.",
    price: 260,
    levelRequired: 5,
    sprite: "MC",
    swatch: ["#07101d", "#5b8cff", "#9ec0ff"],
  },
  {
    id: "effect-glow",
    kind: "effect",
    name: "Brilho de Acerto",
    description: "Adiciona um brilho suave aos botoes e acoes principais.",
    price: 200,
    levelRequired: 4,
    sprite: "BA",
    swatch: ["#2f66e8", "#72e6a8", "#f3f7ff"],
  },
];
