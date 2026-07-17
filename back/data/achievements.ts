import { Achievement } from "@/domain/entities/achievement";
import { Player } from "@/domain/entities/player";

export type AchievementRule = Achievement & {
  isUnlocked: (player: Player) => boolean;
};

export const achievementRules: AchievementRule[] = [
  {
    id: "first-mission",
    title: "Primeira Missao",
    description: "Concluiu sua primeira fase no CodeQuest.",
    icon: "★",
    unlocked: false,
    isUnlocked: (player) => player.progress.completedStages.length >= 1,
  },
  {
    id: "ten-missions",
    title: "Ritmo de Aventura",
    description: "Concluiu 10 fases.",
    icon: "◆",
    unlocked: false,
    isUnlocked: (player) => player.progress.completedStages.length >= 10,
  },
  {
    id: "fifty-missions",
    title: "Campanha Forte",
    description: "Concluiu 50 fases.",
    icon: "✦",
    unlocked: false,
    isUnlocked: (player) => player.progress.completedStages.length >= 50,
  },
  {
    id: "hundred-missions",
    title: "Lenda em Treino",
    description: "Concluiu 100 fases.",
    icon: "✹",
    unlocked: false,
    isUnlocked: (player) => player.progress.completedStages.length >= 100,
  },
  {
    id: "level-5",
    title: "Nivel 5",
    description: "Chegou ao nivel 5.",
    icon: "LV5",
    unlocked: false,
    isUnlocked: (player) => player.level >= 5 || player.progress.level >= 5,
  },
  {
    id: "level-10",
    title: "Nivel 10",
    description: "Chegou ao nivel 10.",
    icon: "LV10",
    unlocked: false,
    isUnlocked: (player) => player.level >= 10 || player.progress.level >= 10,
  },
  {
    id: "rich-pouch",
    title: "Bolsa Cheia",
    description: "Juntou pelo menos 1000 moedas.",
    icon: "$",
    unlocked: false,
    isUnlocked: (player) => player.coins >= 1000,
  },
  {
    id: "java-initiate",
    title: "Iniciado em Java",
    description: "Concluiu 10 fases do Reino Java.",
    icon: "J",
    unlocked: false,
    isUnlocked: (player) => countCompletedByPrefix(player, "java-") >= 10,
  },
  {
    id: "java-hundred",
    title: "Cavaleiro Java",
    description: "Concluiu 100 fases do Reino Java.",
    icon: "JAVA",
    unlocked: false,
    isUnlocked: (player) => countCompletedByPrefix(player, "java-") >= 100,
  },
  {
    id: "collector",
    title: "Colecionador",
    description: "Liberou 10 itens na loja.",
    icon: "BOX",
    unlocked: false,
    isUnlocked: (player) => player.inventory.ownedRewardIds.length >= 10,
  },
];

export function getAchievementCatalog() {
  return achievementRules.map((rule) => toAchievement(rule, false));
}

export function unlockEligibleAchievements(player: Player) {
  const ownedIds = new Set(player.achievements.map((achievement) => achievement.id));
  const unlocked = achievementRules
    .filter((achievement) => !ownedIds.has(achievement.id) && achievement.isUnlocked(player))
    .map((rule) => toAchievement(rule, true));

  if (unlocked.length === 0) {
    return { player, unlocked };
  }

  return {
    player: {
      ...player,
      achievements: [
        ...player.achievements,
        ...unlocked,
      ],
    },
    unlocked,
  };
}

function toAchievement(rule: AchievementRule, unlocked: boolean): Achievement {
  return {
    id: rule.id,
    title: rule.title,
    description: rule.description,
    icon: rule.icon,
    unlocked,
  };
}

function countCompletedByPrefix(player: Player, prefix: string) {
  return player.progress.completedStages.filter((stageId) => stageId.startsWith(prefix)).length;
}
