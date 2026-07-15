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
    <main className="cq-page">
      <section className="cq-shell">
        <div className="cq-panel p-6 md:p-8">
          <span className="cq-pixel-icon">{campaign.icon}</span>

          <p className="cq-kicker mt-5">Campanha</p>
          <h1 className="cq-title mt-3 text-4xl md:text-6xl">
            {campaign.title}
          </h1>

          <p className="mt-4 max-w-3xl text-lg leading-8 text-[#93a4bd]">
            {campaign.description}
          </p>
        </div>

        <CampaignChapterList campaign={campaign} />
      </section>
    </main>
  );
}
