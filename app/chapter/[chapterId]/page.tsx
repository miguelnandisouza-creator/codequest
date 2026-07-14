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
    <main className="min-h-screen bg-zinc-950 p-10 text-white">
      <h1 className="text-5xl font-bold">
        {chapter.title}
      </h1>

      <p className="mt-4 text-zinc-400">
        {chapter.description}
      </p>

      <ChapterStageList chapter={chapter} />
    </main>
  );
}
