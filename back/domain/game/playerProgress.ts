import { Player } from "@/domain/entities/player";
import { Reward } from "@/domain/entities/reward";

export const initialPlayer: Player = {
  id: "player-1",
  name: "Aventureiro",
  avatar: "dev",
  xp: 0,
  level: 1,
  coins: 0,
  streak: 0,
  achievements: [],
  progress: {
    campaignId: "sql",
    chapterId: "sql-chapter-1",
    stageId: "",
    completedStages: [],
    totalXP: 0,
    level: 1,
  },
};

export function hasCompletedStage(player: Player, stageId: string) {
  return player.progress.completedStages.includes(stageId);
}

export function completeStage(
  player: Player,
  stageId: string,
  reward: Reward
): Player {
  if (hasCompletedStage(player, stageId)) {
    return player;
  }

  const totalXP = player.progress.totalXP + reward.xp;
  const level = calculateLevel(totalXP);

  return {
    ...player,
    xp: player.xp + reward.xp,
    level,
    coins: player.coins + reward.coins,
    progress: {
      ...player.progress,
      stageId,
      totalXP,
      level,
      completedStages: [
        ...player.progress.completedStages,
        stageId,
      ],
    },
  };
}

function calculateLevel(totalXP: number) {
  return Math.floor(totalXP / 100) + 1;
}
