import { rewardItems } from "@/data/rewards";
import { campaigns } from "@/data/campaigns";
import { readStoredUsers } from "@/infrastructure/auth/userStore";
import { readPlayerProgress } from "@/infrastructure/supabase/playerProgressRepository";

const hiddenRankingEmails = new Set([
  "miguelnandisouza@gmail.com",
]);

export async function GET() {
  const users = await readStoredUsers();
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

  return Response.json({ ranking });
}

function getCurrentCourseTitle(campaignId?: string) {
  return campaigns.find((campaign) => campaign.id === campaignId)?.title ?? "Sem curso";
}
