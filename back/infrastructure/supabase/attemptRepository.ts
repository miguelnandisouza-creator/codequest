import { appendFile, mkdir, readFile } from "node:fs/promises";
import path from "node:path";

import { getSupabaseServerClient } from "./serverClient";

export type AttemptRecord = {
  userId: string;
  stageId: string;
  stepTitle: string;
  answer: string;
  success: boolean;
  feedback: string;
  createdAt?: string;
};

const dataDir = path.join(process.cwd(), ".data");
const attemptsFile = path.join(dataDir, "attempts.jsonl");

export async function recordAttempt(attempt: AttemptRecord) {
  const normalizedAttempt = normalizeAttempt(attempt);
  const supabase = getSupabaseServerClient();

  if (supabase) {
    const { error } = await supabase
      .from("attempts")
      .insert({
        user_id: normalizedAttempt.userId,
        stage_id: normalizedAttempt.stageId,
        step_title: normalizedAttempt.stepTitle,
        answer: normalizedAttempt.answer,
        success: normalizedAttempt.success,
        feedback: normalizedAttempt.feedback,
        created_at: normalizedAttempt.createdAt,
      });

    if (!error) {
      return normalizedAttempt;
    }

    console.warn("Supabase insert attempts failed:", error.message);
  }

  await mkdir(dataDir, { recursive: true });
  await appendFile(attemptsFile, `${JSON.stringify(normalizedAttempt)}\n`, "utf8");

  return normalizedAttempt;
}

export async function readRecentAttempts(userId?: string, limit = 30) {
  const safeLimit = Math.min(Math.max(limit, 1), 100);
  const supabase = getSupabaseServerClient();

  if (supabase) {
    let query = supabase
      .from("attempts")
      .select("id, user_id, stage_id, step_title, answer, success, feedback, created_at")
      .order("created_at", { ascending: false })
      .limit(safeLimit);

    if (userId) {
      query = query.eq("user_id", userId);
    }

    const { data, error } = await query;

    if (!error && data) {
      return data.map((row) => ({
        id: String(row.id),
        userId: String(row.user_id),
        stageId: String(row.stage_id ?? ""),
        stepTitle: String(row.step_title ?? ""),
        answer: String(row.answer ?? ""),
        success: Boolean(row.success),
        feedback: String(row.feedback ?? ""),
        createdAt: String(row.created_at),
      }));
    }

    console.warn("Supabase read attempts failed:", error?.message);
  }

  try {
    const raw = await readFile(attemptsFile, "utf8");
    return raw
      .split(/\r?\n/)
      .filter(Boolean)
      .map((line) => JSON.parse(line) as AttemptRecord)
      .filter((attempt) => !userId || attempt.userId === userId)
      .slice(-safeLimit)
      .reverse();
  } catch {
    return [];
  }
}

function normalizeAttempt(attempt: AttemptRecord): AttemptRecord {
  return {
    userId: attempt.userId,
    stageId: attempt.stageId.trim(),
    stepTitle: attempt.stepTitle.trim(),
    answer: attempt.answer.slice(0, 5000),
    success: attempt.success,
    feedback: attempt.feedback.slice(0, 1000),
    createdAt: attempt.createdAt ?? new Date().toISOString(),
  };
}
