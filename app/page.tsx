import { Button } from "@/components/ui/Button";
import Link from "next/link";

export default function Home() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-zinc-950 text-white">
      <div className="text-center">
        <h1 className="text-6xl font-bold">CodeQuest</h1>

        <p className="mt-6 text-lg text-zinc-400">
          Aprenda programacao atraves de missoes.
        </p>

        <div className="mt-10">
          <Link href="/onboarding">
            <Button>Comecar</Button>
          </Link>
        </div>
      </div>
    </main>
  );
}
