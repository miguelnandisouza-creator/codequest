import { Reward } from "@/domain/entities/reward";

export type StageType =
  | "text"
  | "example"
  | "challenge"
  | "quiz"
  | "boss";

export type Stage = {
  id: string;

  campaignId: string;

  chapterId: string;

  order: number;

  title: string;

  description: string;

  type: StageType;

  language?: string;

  content: StageContent[];

  reward: Reward;
};

export type StageContent =
  | {
      type: "text";
      title: string;
      content: string;
    }
  | {
      type: "example";
      title: string;
      explanation: string;
      code: string;
      result: string;
    }
  | {
      type: "challenge";
      title: string;
      objective: string;
      expectedAnswer: string;
      hint: string;
    }
  | {
      type: "quiz";
      title: string;
      question: string;
      options: string[];
      correctAnswer: string;
      explanation: string;
    }
  | {
      type: "boss";
      title: string;
      objective: string;
      expectedAnswer: string;
      hint: string;
    };
