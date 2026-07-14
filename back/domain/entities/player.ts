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
};
