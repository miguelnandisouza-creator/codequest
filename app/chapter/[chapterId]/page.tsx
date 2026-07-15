import { notFound } from "next/navigation";

import ChapterStageList from "@/components/chapter/ChapterStageList";
import { getChapter } from "@/domain/game/getChapter";

type Props = {
  params: Promise<{
    chapterId: string;
  }>;
};

export default async function ChapterPage({ params }: Props) {
  const { chapterId } = await params;
  const chapter = getChapter(chapterId);

  if (!chapter) {
    notFound();
  }

  return (
    <main className="cq-page">
      <section className="cq-shell">
        <div className="cq-panel p-6 md:p-8">
          <p className="cq-kicker">Menu de missoes</p>
          <h1 className="cq-title mt-3 text-4xl md:text-6xl">
            {chapter.title}
          </h1>

          <p className="mt-4 max-w-3xl text-lg leading-8 text-[#93a4bd]">
            {chapter.description}
          </p>
        </div>

        <ChapterStageList chapter={chapter} />
      </section>
    </main>
  );
}
