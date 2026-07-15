import { notFound } from "next/navigation";

import AdventureEngine from "@/components/adventure/AdventureEngine";
import { getCampaign } from "@/domain/game/getCampaign";
import { getChapter } from "@/domain/game/getChapter";
import { getStage } from "@/domain/game/getStage";
import { getStageNavigation } from "@/domain/game/getStageNavigation";

type Props = {
  params: Promise<{
    stageId: string;
  }>;
};

export default async function StagePage({ params }: Props) {
  const { stageId } = await params;
  const stage = getStage(stageId);
  const navigation = getStageNavigation(stageId);
  const campaign = stage ? getCampaign(stage.campaignId) : undefined;
  const chapter = stage ? getChapter(stage.chapterId) : undefined;

  if (!stage || !navigation || !campaign || !chapter) {
    notFound();
  }

  return (
    <main className="cq-page">
      <section className="cq-shell">
        <AdventureEngine
          campaign={campaign}
          chapter={chapter}
          stage={stage}
          chapterId={navigation.chapterId}
          nextStageId={navigation.nextStageId}
        />
      </section>
    </main>
  );
}
