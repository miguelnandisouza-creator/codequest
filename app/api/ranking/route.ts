import { rewardItems } from "@/data/rewards";
import { campaigns } from "@/data/campaigns";
import { readStoredUsers } from "@/infrastructure/auth/userStore";
import { readRecentAttempts } from "@/infrastructure/supabase/attemptRepository";
import { readPlayerProgress } from "@/infrastructure/supabase/playerProgressRepository";

const hiddenRankingEmails = new Set([
  "miguelnandisouza@gmail.com",
]);

export async function GET() {
  const users = await readStoredUsers();
  const attempts = await readRecentAttempts(undefined, 1000);
  const visibleUsers = users.filter((user) => (
    !hiddenRankingEmails.has(user.email.toLowerCase())
  ));
  const rows = await Promise.all(visibleUsers.map(async (user) => {
    const player = await readPlayerProgress(user.id);
    const avatarId = player.inventory.equippedAvatarId ?? player.avatar;
    const avatar = rewardItems.find((reward) => (
      reward.kind === "avatar" &&
      reward.id === avatarId
    ));

    return {
      userId: user.id,
      name: user.name,
      level: player.level,
      xp: player.xp,
      coins: player.coins,
      streak: player.streak,
      completedStages: player.progress.completedStages.length,
      currentCourse: getCurrentCourseTitle(player.progress.campaignId),
      avatarSrc: avatar?.imageSrc ?? null,
      avatarName: avatar?.name ?? "Perfil",
    };
  }));

  const ranking = rows.sort((left, right) => (
    right.level - left.level ||
    right.xp - left.xp ||
    right.completedStages - left.completedStages ||
    right.coins - left.coins ||
    left.name.localeCompare(right.name)
  ));
  const weeklyRanking = buildPeriodRanking(rows, attempts, 7);
  const monthlyRanking = buildPeriodRanking(rows, attempts, 30);

  return Response.json({ ranking, weeklyRanking, monthlyRanking });
}

function getCurrentCourseTitle(campaignId?: string) {
  return campaigns.find((campaign) => campaign.id === campaignId)?.title ?? "Sem curso";
}

function buildPeriodRanking(
  rows: Array<{
    userId: string;
    name: string;
    level: number;
    xp: number;
    coins: number;
    streak: number;
    completedStages: number;
    currentCourse: string;
    avatarSrc?: string | null;
    avatarName: string;
  }>,
  attempts: Awaited<ReturnType<typeof readRecentAttempts>>,
  days: number
) {
  const since = Date.now() - (days * 24 * 60 * 60 * 1000);
  const attemptsByUser = new Map<string, typeof attempts>();

  for (const attempt of attempts) {
    const createdAt = Date.parse(attempt.createdAt ?? "");

    if (!Number.isFinite(createdAt) || createdAt < since) {
      continue;
    }

    attemptsByUser.set(attempt.userId, [
      ...(attemptsByUser.get(attempt.userId) ?? []),
      attempt,
    ]);
  }

  return rows
    .map((row) => {
      const userAttempts = attemptsByUser.get(row.userId) ?? [];
      const successes = userAttempts.filter((attempt) => attempt.success);
      const uniqueStages = new Set(successes.map((attempt) => attempt.stageId));
      const score = (successes.length * 100) + (uniqueStages.size * 75) - ((userAttempts.length - successes.length) * 10);

      return {
        ...row,
        periodScore: Math.max(0, score),
        periodAttempts: userAttempts.length,
        periodSuccesses: successes.length,
        periodStages: uniqueStages.size,
      };
    })
    .filter((row) => row.periodAttempts > 0)
    .sort((left, right) => (
      right.periodScore - left.periodScore ||
      right.periodSuccesses - left.periodSuccesses ||
      right.periodStages - left.periodStages ||
      left.name.localeCompare(right.name)
    ));
}
