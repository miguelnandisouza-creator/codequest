import { notFound } from "next/navigation";

import CampaignChapterList from "@/components/campaign/CampaignChapterList";
import { getCampaign } from "@/domain/game/getCampaign";

type Props = {
  params: Promise<{
    campaignId: string;
  }>;
};

export default async function CampaignPage({ params }: Props) {
  const { campaignId } = await params;

  const campaign = getCampaign(campaignId);

  if (!campaign) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-zinc-950 p-10 text-white">
      <div className="text-6xl">{campaign.icon}</div>

      <h1 className="mt-4 text-5xl font-bold">
        {campaign.title}
      </h1>

      <p className="mt-3 text-zinc-400">
        {campaign.description}
      </p>

      <CampaignChapterList campaign={campaign} />
    </main>
  );
}
