import { Achievement } from "@/domain/entities/achievement";
import { Progress } from "@/domain/entities/progress";

export type Player = {
  id: string;

  name: string;

  avatar: string;

  xp: number;

  level: number;

  coins: number;

  streak: number;

  achievements: Achievement[];

  progress: Progress;

  updatedAt?: string;

  inventory: {
    ownedRewardIds: string[];
    equippedAvatarId?: string;
    equippedPetId?: string;
    equippedThemeId?: string;
    equippedFrameId?: string;
    equippedEffectId?: string;
    rewardsLocked?: boolean;
  };

  giftNotifications?: {
    id: string;
    rewardId: string;
    rewardName: string;
    rewardKind: string;
    giftedBy: string;
    createdAt: string;
    seenAt?: string;
  }[];

  surpriseExam?: {
    id: string;
    title: string;
    question: string;
    options: string[];
    correctAnswer: string;
    rewardXp: number;
    rewardCoins: number;
    assignedAt: string;
    completedAt?: string;
  };
};
