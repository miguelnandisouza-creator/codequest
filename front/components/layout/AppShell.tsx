"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ReactNode, useMemo, useSyncExternalStore } from "react";

import AuthStatus from "./AuthStatus";
import {
  getLocalSessionSnapshot,
  getServerLocalSessionSnapshot,
  LocalSession,
  subscribeToLocalAuth,
} from "@/application/auth/localAuth";
import PetCompanion from "@/components/rewards/PetCompanion";
import RewardStyleSync from "@/components/rewards/RewardStyleSync";
import SurpriseExamModal from "@/components/surprise/SurpriseExamModal";
import { isAdminEmail } from "@/data/admin";

type Props = {
  children: ReactNode;
};

export default function AppShell({ children }: Props) {
  const pathname = usePathname();
  const sessionSnapshot = useSyncExternalStore(
    subscribeToLocalAuth,
    getLocalSessionSnapshot,
    getServerLocalSessionSnapshot
  );
  const session = useMemo(() => parseJson<LocalSession>(sessionSnapshot), [sessionSnapshot]);
  const isAdmin = isAdminEmail(session?.email);

  if (pathname === "/") {
    return (
      <>
        <RewardStyleSync />
        {children}
      </>
    );
  }

  return (
    <>
      <header className="sticky top-0 z-50 border-b border-[#22324a] bg-[#070c15]/92 backdrop-blur">
        <nav className="mx-auto flex max-w-7xl items-center justify-between px-5 py-3 text-white md:px-6">
          <Link
            href="/dashboard"
            className="flex items-center gap-3 font-mono text-sm font-black uppercase tracking-[0.12em] text-[#f3f7ff]"
          >
            <span className="cq-pixel-icon">CQ</span>
            CodeQuest
          </Link>

          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.08em] text-[#93a4bd] md:gap-4">
            <Link href="/dashboard" className="rounded px-2 py-1 hover:bg-white/5 hover:text-white">
              Campanhas
            </Link>
            <Link href="/profile" className="rounded px-2 py-1 hover:bg-white/5 hover:text-white">
              Meus cursos
            </Link>
            <Link href="/journey" className="rounded px-2 py-1 hover:bg-white/5 hover:text-white">
              Jornada
            </Link>
            <Link href="/account" className="rounded px-2 py-1 hover:bg-white/5 hover:text-white">
              Conta
            </Link>
            <Link href="/rewards" className="rounded px-2 py-1 hover:bg-white/5 hover:text-white">
              Loja
            </Link>
            <Link href="/settings" className="rounded px-2 py-1 hover:bg-white/5 hover:text-white">
              Config
            </Link>
            {isAdmin && (
              <Link href="/admin" className="rounded px-2 py-1 hover:bg-white/5 hover:text-white">
                Admin
              </Link>
            )}

            <AuthStatus />
          </div>
        </nav>
      </header>

      {children}
      <RewardStyleSync />
      <SurpriseExamModal />
      <PetCompanion />
    </>
  );
}

function parseJson<T>(value: string) {
  if (!value) {
    return null;
  }

  try {
    return JSON.parse(value) as T;
  } catch {
    return null;
  }
}
