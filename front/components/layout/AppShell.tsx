import Link from "next/link";
import { ReactNode } from "react";

type Props = {
  children: ReactNode;
};

export default function AppShell({ children }: Props) {
  return (
    <>
      <header className="sticky top-0 z-50 border-b border-zinc-800 bg-zinc-950/90 backdrop-blur">
        <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 text-white">
          <Link
            href="/dashboard"
            className="text-xl font-black tracking-tight"
          >
            CodeQuest
          </Link>

          <div className="flex items-center gap-4 text-sm text-zinc-300">
            <Link href="/dashboard" className="hover:text-white">
              Campanhas
            </Link>
            <Link href="/profile" className="hover:text-white">
              Perfil
            </Link>
            <Link href="/settings" className="hover:text-white">
              Config
            </Link>
          </div>
        </nav>
      </header>

      {children}
    </>
  );
}
